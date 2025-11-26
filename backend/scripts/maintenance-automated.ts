/**
 * @fileoverview Automated Maintenance Script
 * @module MaintenanceAutomated
 * @version 1.0.0
 * 
 * Automated database maintenance script that can be run as a cron job.
 * Performs routine maintenance tasks including:
 * - VACUUM ANALYZE
 * - Statistics updates
 * - Bloat analysis
 * - Index maintenance
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../src/services/logger';
import { MaintenanceService } from '../src/services/database/MaintenanceService';
import { IndexMaintenanceManager } from './index-maintenance';

/**
 * Maintenance schedule configuration
 */
interface MaintenanceSchedule {
  vacuumAnalyze: boolean;
  updateStatistics: boolean;
  analyzeBloat: boolean;
  indexMaintenance: boolean;
  verbose: boolean;
}

/**
 * Automated Maintenance Runner
 */
class AutomatedMaintenanceRunner {
  private prisma: PrismaClient;
  private maintenanceService: MaintenanceService;
  private indexMaintenance: IndexMaintenanceManager;

  constructor() {
    this.prisma = new PrismaClient();
    this.maintenanceService = MaintenanceService.getInstance(this.prisma);
    this.indexMaintenance = new IndexMaintenanceManager(this.prisma);
  }

  /**
   * Run daily maintenance
   */
  async runDailyMaintenance(schedule: MaintenanceSchedule = {
    vacuumAnalyze: true,
    updateStatistics: true,
    analyzeBloat: true,
    indexMaintenance: false,
    verbose: false,
  }): Promise<void> {
    logger.info('[AutomatedMaintenance] Starting daily maintenance');

    try {
      // VACUUM ANALYZE
      if (schedule.vacuumAnalyze) {
        logger.info('[AutomatedMaintenance] Running VACUUM ANALYZE');
        const result = await this.maintenanceService.vacuumAnalyze(schedule.verbose);
        if (!result.success) {
          logger.error('[AutomatedMaintenance] VACUUM ANALYZE failed', {
            error: result.error,
          });
        }
      }

      // Update statistics
      if (schedule.updateStatistics) {
        logger.info('[AutomatedMaintenance] Updating statistics');
        const result = await this.maintenanceService.updateStatistics();
        if (!result.success) {
          logger.error('[AutomatedMaintenance] Statistics update failed', {
            error: result.error,
          });
        }
      }

      // Analyze bloat
      if (schedule.analyzeBloat) {
        logger.info('[AutomatedMaintenance] Analyzing bloat');
        try {
          const bloat = await this.maintenanceService.analyzeBloat();
          const highBloatTables = bloat.filter((b) => b.deadTupleRatio > 0.1);
          if (highBloatTables.length > 0) {
            logger.warn('[AutomatedMaintenance] Tables with high bloat detected', {
              count: highBloatTables.length,
              tables: highBloatTables.map((b) => b.tablename),
            });
          }
        } catch (error) {
          logger.error('[AutomatedMaintenance] Bloat analysis failed', { error });
        }
      }

      // Index maintenance (weekly, not daily)
      if (schedule.indexMaintenance) {
        logger.info('[AutomatedMaintenance] Running index maintenance');
        try {
          const stats = await this.indexMaintenance.getIndexStatistics();
          logger.info('[AutomatedMaintenance] Index statistics', {
            total: stats.totalIndexes,
            unused: stats.unusedIndexes,
            totalSize: stats.totalSizePretty,
            unusedSize: stats.unusedSizePretty,
          });
        } catch (error) {
          logger.error('[AutomatedMaintenance] Index maintenance failed', { error });
        }
      }

      logger.info('[AutomatedMaintenance] Daily maintenance completed');
    } catch (error) {
      logger.error('[AutomatedMaintenance] Maintenance failed', { error });
      throw error;
    }
  }

  /**
   * Run weekly maintenance (includes index maintenance)
   */
  async runWeeklyMaintenance(): Promise<void> {
    logger.info('[AutomatedMaintenance] Starting weekly maintenance');

    await this.runDailyMaintenance({
      vacuumAnalyze: true,
      updateStatistics: true,
      analyzeBloat: true,
      indexMaintenance: true,
      verbose: false,
    });

    logger.info('[AutomatedMaintenance] Weekly maintenance completed');
  }

  /**
   * Run full maintenance
   */
  async runFullMaintenance(): Promise<void> {
    logger.info('[AutomatedMaintenance] Starting full maintenance');

    try {
      const stats = await this.maintenanceService.runFullMaintenance();
      logger.info('[AutomatedMaintenance] Full maintenance completed', {
        tablesAnalyzed: stats.tablesAnalyzed,
        bloatFreed: stats.bloatFreed,
        statisticsUpdated: stats.statisticsUpdated,
      });
    } catch (error) {
      logger.error('[AutomatedMaintenance] Full maintenance failed', { error });
      throw error;
    }
  }

  /**
   * Cleanup and disconnect
   */
  async cleanup(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

/**
 * CLI entry point
 */
if (require.main === module) {
  const runner = new AutomatedMaintenanceRunner();
  const command = process.argv[2] || 'daily';

  const runCommand = async () => {
    try {
      switch (command) {
        case 'daily':
          await runner.runDailyMaintenance();
          break;

        case 'weekly':
          await runner.runWeeklyMaintenance();
          break;

        case 'full':
          await runner.runFullMaintenance();
          break;

        default:
          console.log('Usage: ts-node maintenance-automated.ts [daily|weekly|full]');
          console.log('');
          console.log('Commands:');
          console.log('  daily   - Run daily maintenance (VACUUM ANALYZE, statistics)');
          console.log('  weekly  - Run weekly maintenance (includes index maintenance)');
          console.log('  full    - Run full maintenance (all tasks)');
          process.exit(1);
      }
    } catch (error) {
      console.error('Maintenance error:', error);
      process.exit(1);
    } finally {
      await runner.cleanup();
    }
  };

  runCommand();
}

export default AutomatedMaintenanceRunner;

