/**
 * @fileoverview Index Maintenance Script
 * @module IndexMaintenance
 * @version 1.0.0
 * 
 * Automated index maintenance including:
 * - REINDEX for bloated indexes
 * - Analysis of unused indexes
 * - Index usage statistics
 * - Recommendations for index optimization
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { PrismaClient } from '@prisma/client';
import { logger } from '../src/services/logger';

const execAsync = promisify(exec);

/**
 * Index information
 */
interface IndexInfo {
  schemaname: string;
  tablename: string;
  indexname: string;
  indexrelid: string;
  sizeBytes: number;
  sizePretty: string;
  idxScan: number;
  usageStatus: 'UNUSED' | 'RARELY_USED' | 'ACTIVE';
}

/**
 * Index Maintenance Manager
 */
export class IndexMaintenanceManager {
  private prisma: PrismaClient;
  private dbHost: string;
  private dbPort: number;
  private dbUser: string;
  private dbPassword: string;
  private dbName: string;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.dbHost = process.env.DB_HOST || process.env.DATABASE_HOST || 'localhost';
    this.dbPort = parseInt(process.env.DB_PORT || process.env.DATABASE_PORT || '5432', 10);
    this.dbUser = process.env.DB_USER || process.env.DATABASE_USER || 'lemnix_user';
    this.dbPassword = process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD || '';
    this.dbName = process.env.DB_NAME || process.env.DATABASE_NAME || 'lemnix_db';
  }

  /**
   * Analyze index usage
   */
  async analyzeIndexUsage(): Promise<IndexInfo[]> {
    try {
      logger.info('[IndexMaintenance] Analyzing index usage');

      const result = await this.prisma.$queryRaw<Array<{
        schemaname: string;
        tablename: string;
        indexname: string;
        indexrelid: string;
        size_bytes: bigint;
        idx_scan: bigint;
      }>>`
        SELECT
          schemaname,
          tablename,
          indexname,
          indexrelid::text,
          pg_relation_size(indexrelid) AS size_bytes,
          idx_scan
        FROM pg_stat_user_indexes
        WHERE schemaname = 'public'
        ORDER BY pg_relation_size(indexrelid) DESC
      `;

      return result.map((row) => {
        const sizeBytes = Number(row.size_bytes);
        const idxScan = Number(row.idx_scan);
        let usageStatus: 'UNUSED' | 'RARELY_USED' | 'ACTIVE';
        
        if (idxScan === 0) {
          usageStatus = 'UNUSED';
        } else if (idxScan < 10) {
          usageStatus = 'RARELY_USED';
        } else {
          usageStatus = 'ACTIVE';
        }

        return {
          schemaname: row.schemaname,
          tablename: row.tablename,
          indexname: row.indexname,
          indexrelid: row.indexrelid,
          sizeBytes,
          sizePretty: this.formatBytes(sizeBytes),
          idxScan,
          usageStatus,
        };
      });
    } catch (error) {
      logger.error('[IndexMaintenance] Failed to analyze index usage', { error });
      throw error;
    }
  }

  /**
   * Get unused indexes
   */
  async getUnusedIndexes(minSizeMB: number = 10): Promise<IndexInfo[]> {
    const indexes = await this.analyzeIndexUsage();
    const minSizeBytes = minSizeMB * 1024 * 1024;

    return indexes.filter(
      (idx) => idx.usageStatus === 'UNUSED' && idx.sizeBytes >= minSizeBytes,
    );
  }

  /**
   * Reindex specific index
   */
  async reindexIndex(indexName: string, concurrent: boolean = true): Promise<void> {
    try {
      logger.info('[IndexMaintenance] Reindexing index', { index: indexName });

      const command = concurrent
        ? `REINDEX INDEX CONCURRENTLY "${indexName}";`
        : `REINDEX INDEX "${indexName}";`;

      await this.executeSQL(command);

      logger.info('[IndexMaintenance] Index reindexed successfully', { index: indexName });
    } catch (error) {
      logger.error('[IndexMaintenance] Failed to reindex index', {
        index: indexName,
        error,
      });
      throw error;
    }
  }

  /**
   * Reindex all indexes for a table
   */
  async reindexTable(tableName: string, concurrent: boolean = true): Promise<void> {
    try {
      logger.info('[IndexMaintenance] Reindexing table indexes', { table: tableName });

      const command = concurrent
        ? `REINDEX TABLE CONCURRENTLY "${tableName}";`
        : `REINDEX TABLE "${tableName}";`;

      await this.executeSQL(command);

      logger.info('[IndexMaintenance] Table indexes reindexed successfully', {
        table: tableName,
      });
    } catch (error) {
      logger.error('[IndexMaintenance] Failed to reindex table', {
        table: tableName,
        error,
      });
      throw error;
    }
  }

  /**
   * Reindex database (all indexes)
   */
  async reindexDatabase(concurrent: boolean = true): Promise<void> {
    try {
      logger.info('[IndexMaintenance] Reindexing database');

      const command = concurrent
        ? `REINDEX DATABASE CONCURRENTLY "${this.dbName}";`
        : `REINDEX DATABASE "${this.dbName}";`;

      await this.executeSQL(command);

      logger.info('[IndexMaintenance] Database reindexed successfully');
    } catch (error) {
      logger.error('[IndexMaintenance] Failed to reindex database', { error });
      throw error;
    }
  }

  /**
   * Analyze index bloat
   */
  async analyzeIndexBloat(): Promise<Array<{
    schemaname: string;
    tablename: string;
    indexname: string;
    sizeBytes: number;
    sizePretty: string;
    bloatEstimate: string;
  }>> {
    try {
      logger.info('[IndexMaintenance] Analyzing index bloat');

      const result = await this.prisma.$queryRaw<Array<{
        schemaname: string;
        tablename: string;
        indexname: string;
        size_bytes: bigint;
      }>>`
        SELECT
          schemaname,
          tablename,
          indexname,
          pg_relation_size(indexrelid) AS size_bytes
        FROM pg_stat_user_indexes
        WHERE schemaname = 'public'
          AND pg_relation_size(indexrelid) > 1048576  -- > 1MB
        ORDER BY pg_relation_size(indexrelid) DESC
        LIMIT 20
      `;

      return result.map((row) => ({
        schemaname: row.schemaname,
        tablename: row.tablename,
        indexname: row.indexname,
        sizeBytes: Number(row.size_bytes),
        sizePretty: this.formatBytes(Number(row.size_bytes)),
        bloatEstimate: 'N/A', // Would require pgstattuple extension for accurate bloat
      }));
    } catch (error) {
      logger.error('[IndexMaintenance] Failed to analyze index bloat', { error });
      throw error;
    }
  }

  /**
   * Get index statistics summary
   */
  async getIndexStatistics(): Promise<{
    totalIndexes: number;
    unusedIndexes: number;
    rarelyUsedIndexes: number;
    activeIndexes: number;
    totalSizeBytes: number;
    totalSizePretty: string;
    unusedSizeBytes: number;
    unusedSizePretty: string;
  }> {
    try {
      const indexes = await this.analyzeIndexUsage();

      const totalIndexes = indexes.length;
      const unusedIndexes = indexes.filter((idx) => idx.usageStatus === 'UNUSED').length;
      const rarelyUsedIndexes = indexes.filter(
        (idx) => idx.usageStatus === 'RARELY_USED',
      ).length;
      const activeIndexes = indexes.filter((idx) => idx.usageStatus === 'ACTIVE').length;

      const totalSizeBytes = indexes.reduce((sum, idx) => sum + idx.sizeBytes, 0);
      const unusedSizeBytes = indexes
        .filter((idx) => idx.usageStatus === 'UNUSED')
        .reduce((sum, idx) => sum + idx.sizeBytes, 0);

      return {
        totalIndexes,
        unusedIndexes,
        rarelyUsedIndexes,
        activeIndexes,
        totalSizeBytes,
        totalSizePretty: this.formatBytes(totalSizeBytes),
        unusedSizeBytes,
        unusedSizePretty: this.formatBytes(unusedSizeBytes),
      };
    } catch (error) {
      logger.error('[IndexMaintenance] Failed to get index statistics', { error });
      throw error;
    }
  }

  /**
   * Execute SQL command
   */
  private async executeSQL(sql: string): Promise<void> {
    const env = {
      ...process.env,
      PGPASSWORD: this.dbPassword,
    };

    const command = `psql -h ${this.dbHost} -p ${this.dbPort} -U ${this.dbUser} -d ${this.dbName} -c "${sql.replace(/"/g, '\\"')}"`;

    await execAsync(command, { env });
  }

  /**
   * Format bytes to human-readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }
}

/**
 * CLI entry point
 */
if (require.main === module) {
  const prisma = new PrismaClient();
  const manager = new IndexMaintenanceManager(prisma);
  const command = process.argv[2];

  const runCommand = async () => {
    try {
      switch (command) {
        case 'analyze':
          const indexes = await manager.analyzeIndexUsage();
          console.log('\n=== Index Usage Analysis ===');
          indexes.forEach((idx) => {
            console.log(
              `${idx.schemaname}.${idx.tablename}.${idx.indexname}: ${idx.sizePretty} (${idx.usageStatus}, ${idx.idxScan} scans)`,
            );
          });
          break;

        case 'unused':
          const unused = await manager.getUnusedIndexes(10);
          console.log('\n=== Unused Indexes (> 10MB) ===');
          if (unused.length === 0) {
            console.log('No unused indexes found.');
          } else {
            unused.forEach((idx) => {
              console.log(
                `${idx.schemaname}.${idx.tablename}.${idx.indexname}: ${idx.sizePretty}`,
              );
            });
          }
          break;

        case 'stats':
          const stats = await manager.getIndexStatistics();
          console.log('\n=== Index Statistics ===');
          console.log(`Total Indexes: ${stats.totalIndexes}`);
          console.log(`  - Active: ${stats.activeIndexes}`);
          console.log(`  - Rarely Used: ${stats.rarelyUsedIndexes}`);
          console.log(`  - Unused: ${stats.unusedIndexes}`);
          console.log(`Total Size: ${stats.totalSizePretty}`);
          console.log(`Unused Size: ${stats.unusedSizePretty}`);
          break;

        case 'reindex':
          const indexName = process.argv[3];
          if (!indexName) {
            console.error('Usage: ts-node index-maintenance.ts reindex <index-name>');
            process.exit(1);
          }
          await manager.reindexIndex(indexName, true);
          console.log(`Index ${indexName} reindexed successfully`);
          break;

        case 'bloat':
          const bloat = await manager.analyzeIndexBloat();
          console.log('\n=== Index Bloat Analysis ===');
          bloat.forEach((idx) => {
            console.log(
              `${idx.schemaname}.${idx.tablename}.${idx.indexname}: ${idx.sizePretty}`,
            );
          });
          break;

        default:
          console.log('Usage: ts-node index-maintenance.ts <command> [options]');
          console.log('');
          console.log('Commands:');
          console.log('  analyze        - Analyze all index usage');
          console.log('  unused         - List unused indexes (> 10MB)');
          console.log('  stats          - Show index statistics summary');
          console.log('  reindex <name> - Reindex specific index');
          console.log('  bloat          - Analyze index bloat');
          process.exit(1);
      }
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  };

  runCommand();
}

export default IndexMaintenanceManager;

