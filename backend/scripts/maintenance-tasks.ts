/**
 * @fileoverview Automated Database Maintenance Tasks
 * @module MaintenanceTasks
 * @version 1.0.0
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { logger } from '../src/services/logger';
import { prisma } from '../src/config/database';

const execAsync = promisify(exec);

interface MaintenanceConfig {
  dbHost: string;
  dbPort: number;
  dbName: string;
  dbUser: string;
  dbPassword: string;
}

class MaintenanceTasks {
  private config: MaintenanceConfig;

  constructor(config: MaintenanceConfig) {
    this.config = config;
  }

  /**
   * Execute VACUUM ANALYZE on all tables
   */
  async vacuumAnalyze(): Promise<void> {
    try {
      logger.info('[Maintenance] Starting VACUUM ANALYZE');

      await prisma.$executeRawUnsafe('VACUUM ANALYZE');

      logger.info('[Maintenance] VACUUM ANALYZE completed');
    } catch (error) {
      logger.error('[Maintenance] VACUUM ANALYZE failed', { error });
      throw error;
    }
  }

  /**
   * REINDEX all database indexes
   */
  async reindexDatabase(): Promise<void> {
    try {
      logger.info('[Maintenance] Starting REINDEX DATABASE');

      const command = `psql -h ${this.config.dbHost} -p ${this.config.dbPort} -U ${this.config.dbUser} -d ${this.config.dbName} -c "REINDEX DATABASE ${this.config.dbName}"`;

      await execAsync(command, {
        env: { ...process.env, PGPASSWORD: this.config.dbPassword },
      });

      logger.info('[Maintenance] REINDEX DATABASE completed');
    } catch (error) {
      logger.error('[Maintenance] REINDEX DATABASE failed', { error });
      throw error;
    }
  }

  /**
   * Update statistics for query planner
   */
  async updateStatistics(): Promise<void> {
    try {
      logger.info('[Maintenance] Updating statistics');

      await prisma.$executeRawUnsafe('ANALYZE');

      logger.info('[Maintenance] Statistics update completed');
    } catch (error) {
      logger.error('[Maintenance] Statistics update failed', { error });
      throw error;
    }
  }

  /**
   * Archive old data (older than 1 year)
   */
  async archiveOldData(): Promise<void> {
    try {
      logger.info('[Maintenance] Starting data archiving');

      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      // Archive old cutting lists
      const archivedLists = await prisma.cuttingList.updateMany({
        where: {
          status: 'COMPLETED',
          updatedAt: { lt: oneYearAgo },
        },
        data: {
          status: 'ARCHIVED',
        },
      });

      // Archive old optimizations
      const archivedOpts = await prisma.optimization.updateMany({
        where: {
          status: 'COMPLETED',
          updatedAt: { lt: oneYearAgo },
        },
        data: {
          status: 'ARCHIVED',
        },
      });

      logger.info('[Maintenance] Data archiving completed', {
        cuttingLists: archivedLists.count,
        optimizations: archivedOpts.count,
      });
    } catch (error) {
      logger.error('[Maintenance] Data archiving failed', { error });
      throw error;
    }
  }

  /**
   * Purge archived data (older than 2 years)
   */
  async purgeArchivedData(): Promise<void> {
    try {
      logger.info('[Maintenance] Starting archived data purge');

      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

      // Delete old archived cutting lists
      const deletedLists = await prisma.cuttingList.deleteMany({
        where: {
          status: 'ARCHIVED',
          updatedAt: { lt: twoYearsAgo },
        },
      });

      // Delete old archived optimizations
      const deletedOpts = await prisma.optimization.deleteMany({
        where: {
          status: 'ARCHIVED',
          updatedAt: { lt: twoYearsAgo },
        },
      });

      logger.info('[Maintenance] Archived data purge completed', {
        cuttingLists: deletedLists.count,
        optimizations: deletedOpts.count,
      });
    } catch (error) {
      logger.error('[Maintenance] Archived data purge failed', { error });
      throw error;
    }
  }

  /**
   * Clean up orphaned records
   */
  async cleanupOrphans(): Promise<void> {
    try {
      logger.info('[Maintenance] Cleaning up orphaned records');

      // Note: With Prisma's cascade delete, orphans shouldn't exist
      // But we check anyway for data integrity

      // Check for cutting list items without parent
      const orphanedItems = await prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*) as count
        FROM cutting_list_items cli
        LEFT JOIN cutting_lists cl ON cli.cutting_list_id = cl.id
        WHERE cl.id IS NULL
      `;

      const orphanCount = Number(orphanedItems[0]?.count ?? 0);

      if (orphanCount > 0) {
        logger.warn('[Maintenance] Orphaned items detected', { count: orphanCount });
        
        await prisma.$executeRawUnsafe(`
          DELETE FROM cutting_list_items
          WHERE id IN (
            SELECT cli.id
            FROM cutting_list_items cli
            LEFT JOIN cutting_lists cl ON cli.cutting_list_id = cl.id
            WHERE cl.id IS NULL
          )
        `);

        logger.info('[Maintenance] Orphaned items cleaned up', { count: orphanCount });
      } else {
        logger.info('[Maintenance] No orphaned records found');
      }
    } catch (error) {
      logger.error('[Maintenance] Orphan cleanup failed', { error });
      throw error;
    }
  }

  /**
   * Get database size and growth metrics
   */
  async getDatabaseMetrics(): Promise<{
    databaseSize: string;
    tableStats: Array<{ tableName: string; rowCount: number; size: string }>;
  }> {
    try {
      // Get database size
      const dbSize = await prisma.$queryRaw<{ size: string }[]>`
        SELECT pg_size_pretty(pg_database_size(current_database())) as size
      `;

      // Get table sizes and row counts
      const tableStats = await prisma.$queryRaw<Array<{ 
        tablename: string; 
        row_count: bigint; 
        total_size: string 
      }>>`
        SELECT 
          schemaname || '.' || tablename as tablename,
          n_live_tup as row_count,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size
        FROM pg_stat_user_tables
        ORDER BY n_live_tup DESC
        LIMIT 20
      `;

      return {
        databaseSize: dbSize[0]?.size ?? '0 bytes',
        tableStats: tableStats.map(t => ({
          tableName: t.tablename,
          rowCount: Number(t.row_count),
          size: t.total_size,
        })),
      };
    } catch (error) {
      logger.error('[Maintenance] Failed to get database metrics', { error });
      throw error;
    }
  }

  /**
   * Run all weekly maintenance tasks
   */
  async runWeeklyMaintenance(): Promise<void> {
    logger.info('[Maintenance] Starting weekly maintenance');

    try {
      await this.vacuumAnalyze();
      await this.updateStatistics();
      await this.cleanupOrphans();
      await this.archiveOldData();

      const metrics = await this.getDatabaseMetrics();
      logger.info('[Maintenance] Weekly maintenance completed', metrics);
    } catch (error) {
      logger.error('[Maintenance] Weekly maintenance failed', { error });
      throw error;
    }
  }

  /**
   * Run monthly maintenance tasks
   */
  async runMonthlyMaintenance(): Promise<void> {
    logger.info('[Maintenance] Starting monthly maintenance');

    try {
      await this.reindexDatabase();
      await this.purgeArchivedData();

      logger.info('[Maintenance] Monthly maintenance completed');
    } catch (error) {
      logger.error('[Maintenance] Monthly maintenance failed', { error });
      throw error;
    }
  }
}

export default MaintenanceTasks;

// CLI usage
if (require.main === module) {
  const config: MaintenanceConfig = {
    dbHost: process.env.DB_HOST || 'localhost',
    dbPort: parseInt(process.env.DB_PORT || '5432'),
    dbName: process.env.DB_NAME || 'lemnix_db',
    dbUser: process.env.DB_USER || 'lemnix_user',
    dbPassword: process.env.DB_PASSWORD || '',
  };

  const maintenance = new MaintenanceTasks(config);
  const task = process.argv[2];

  const tasks: Record<string, () => Promise<void>> = {
    vacuum: () => maintenance.vacuumAnalyze(),
    reindex: () => maintenance.reindexDatabase(),
    stats: () => maintenance.updateStatistics(),
    archive: () => maintenance.archiveOldData(),
    purge: () => maintenance.purgeArchivedData(),
    cleanup: () => maintenance.cleanupOrphans(),
    weekly: () => maintenance.runWeeklyMaintenance(),
    monthly: () => maintenance.runMonthlyMaintenance(),
    metrics: async () => {
      const metrics = await maintenance.getDatabaseMetrics();
      console.log(JSON.stringify(metrics, null, 2));
    },
  };

  if (task && tasks[task]) {
    tasks[task]()
      .then(() => {
        logger.info(`[Maintenance] Task '${task}' completed successfully`);
        process.exit(0);
      })
      .catch((error) => {
        logger.error(`[Maintenance] Task '${task}' failed`, { error });
        process.exit(1);
      });
  } else {
    console.log('Usage: ts-node maintenance-tasks.ts <task>');
    console.log('Available tasks:', Object.keys(tasks).join(', '));
    process.exit(1);
  }
}

