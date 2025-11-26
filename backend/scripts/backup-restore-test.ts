/**
 * @fileoverview Backup Restore Test Module
 * @module BackupRestoreTest
 * @version 1.0.0
 * 
 * Tests backup restore functionality to ensure backups are valid and recoverable.
 * This is a critical component of the 3-2-1 backup strategy verification.
 * 
 * Features:
 * - Restore backup to test database
 * - Verify data integrity
 * - Check table structure
 * - Validate foreign key constraints
 * - Performance metrics
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { logger } from '../src/services/logger';
import { loadBackupConfig, type BackupConfig } from '../config/backup.config';

const execAsync = promisify(exec);

/**
 * Restore test result
 */
interface RestoreTestResult {
  success: boolean;
  testDbName: string;
  tablesCreated: number;
  tablesVerified: string[];
  foreignKeysVerified: boolean;
  dataIntegrityPassed: boolean;
  duration: number;
  error?: string;
  warnings?: string[];
}

/**
 * Backup Restore Tester
 */
export class BackupRestoreTester {
  private config: BackupConfig;

  constructor(config?: BackupConfig) {
    this.config = config || loadBackupConfig();
  }

  /**
   * Test restore from backup file
   */
  async testRestore(backupFilePath: string): Promise<RestoreTestResult> {
    const startTime = Date.now();
    const testDbName = `${this.config.dbName}_restore_test_${Date.now()}`;
    const warnings: string[] = [];

    // Cross-platform command detection (define once at method start)
    const psqlCmd = process.platform === 'win32' ? 'psql.exe' : 'psql';
    const createdbCmd = process.platform === 'win32' ? 'createdb.exe' : 'createdb';
    const dropdbCmd = process.platform === 'win32' ? 'dropdb.exe' : 'dropdb';

    try {
      logger.info('[RestoreTest] Starting restore test', {
        backupFile: path.basename(backupFilePath),
        testDatabase: testDbName,
      });

      // Verify backup file exists
      await fs.access(backupFilePath);

      // Decompress backup if needed (cross-platform)
      let restoreFile = backupFilePath;
      const isWindows = process.platform === 'win32';
      
      if (backupFilePath.endsWith('.gz')) {
        restoreFile = backupFilePath.replace(/\.gz$/, '');
        logger.info('[RestoreTest] Decompressing backup');
        
        if (isWindows) {
          // Windows: Use Node.js zlib for gzip decompression
          const zlib = await import('node:zlib');
          const { promisify } = await import('node:util');
          const gunzip = promisify(zlib.gunzip);
          const compressedData = await fs.readFile(backupFilePath);
          const decompressedData = await gunzip(compressedData);
          await fs.writeFile(restoreFile, decompressedData);
        } else {
          await execAsync(`gunzip -k "${backupFilePath}"`);
        }
      } else if (backupFilePath.endsWith('.bz2')) {
        restoreFile = backupFilePath.replace(/\.bz2$/, '');
        logger.info('[RestoreTest] Decompressing backup');
        
        if (isWindows) {
          logger.warn('[RestoreTest] bzip2 decompression not supported on Windows');
          throw new Error('bzip2 decompression not available on Windows. Please use gzip compression.');
        }
        await execAsync(`bzip2 -dk "${backupFilePath}"`);
      } else if (backupFilePath.endsWith('.xz')) {
        restoreFile = backupFilePath.replace(/\.xz$/, '');
        logger.info('[RestoreTest] Decompressing backup');
        
        if (isWindows) {
          logger.warn('[RestoreTest] xz decompression not supported on Windows');
          throw new Error('xz decompression not available on Windows. Please use gzip compression.');
        }
        await execAsync(`xz -dk "${backupFilePath}"`);
      }

      const env = {
        ...process.env,
        PGPASSWORD: this.config.dbPassword,
      };

      // Create test database (cross-platform command)
      logger.info('[RestoreTest] Creating test database');
      await execAsync(
        `${createdbCmd} -h ${this.config.dbHost} -p ${this.config.dbPort} -U ${this.config.dbUser} ${testDbName}`,
        { env },
      );

      try {
        // Restore backup to test database (cross-platform command)
        logger.info('[RestoreTest] Restoring backup to test database');
        // Escape path for Windows
        const escapedRestoreFile = process.platform === 'win32' 
          ? restoreFile.replace(/\\/g, '/')
          : restoreFile;
        await execAsync(
          `${psqlCmd} -h ${this.config.dbHost} -p ${this.config.dbPort} -U ${this.config.dbUser} -d ${testDbName} -f "${escapedRestoreFile}"`,
          { env },
        );

        // Verify tables exist (cross-platform command)
        logger.info('[RestoreTest] Verifying table structure');
        const { stdout: tablesOutput } = await execAsync(
          `${psqlCmd} -h ${this.config.dbHost} -p ${this.config.dbPort} -U ${this.config.dbUser} -d ${testDbName} -c "\\dt"`,
          { env },
        );

        const tables = this.extractTables(tablesOutput);
        const expectedTables = [
          'users',
          'cutting_lists',
          'cutting_list_items',
          'optimizations',
          'stock_lengths',
          'profile_types',
        ];

        const tablesVerified: string[] = [];
        for (const expectedTable of expectedTables) {
          if (tables.includes(expectedTable)) {
            tablesVerified.push(expectedTable);
          } else {
            warnings.push(`Expected table '${expectedTable}' not found`);
          }
        }

        // Verify foreign key constraints (cross-platform command)
        logger.info('[RestoreTest] Verifying foreign key constraints');
        const { stdout: fkOutput } = await execAsync(
          `${psqlCmd} -h ${this.config.dbHost} -p ${this.config.dbPort} -U ${this.config.dbUser} -d ${testDbName} -c "SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_type = 'FOREIGN KEY';"`,
          { env },
        );

        const fkCount = parseInt(fkOutput.match(/\d+/)?.[0] || '0', 10);
        const foreignKeysVerified = fkCount > 0;

        if (fkCount === 0) {
          warnings.push('No foreign key constraints found');
        }

        // Verify data integrity (check for orphaned records)
        logger.info('[RestoreTest] Verifying data integrity');
        const dataIntegrityPassed = await this.verifyDataIntegrity(testDbName, env, psqlCmd);

        // Get row counts for key tables
        const rowCounts = await this.getRowCounts(testDbName, env, psqlCmd);

        const duration = Date.now() - startTime;

        logger.info('[RestoreTest] Restore test completed', {
          success: true,
          tablesCreated: tables.length,
          tablesVerified: tablesVerified.length,
          foreignKeysVerified,
          dataIntegrityPassed,
          rowCounts,
          duration: `${(duration / 1000).toFixed(2)}s`,
        });

        return {
          success: true,
          testDbName,
          tablesCreated: tables.length,
          tablesVerified,
          foreignKeysVerified,
          dataIntegrityPassed,
          duration,
          warnings: warnings.length > 0 ? warnings : undefined,
        };
      } finally {
        // Clean up decompressed file if created
        if (restoreFile !== backupFilePath) {
          try {
            await fs.unlink(restoreFile);
          } catch (error) {
            logger.warn('[RestoreTest] Failed to clean up decompressed file', { error });
          }
        }

        // Drop test database (cross-platform command)
        logger.info('[RestoreTest] Cleaning up test database');
        try {
          await execAsync(
            `${dropdbCmd} -h ${this.config.dbHost} -p ${this.config.dbPort} -U ${this.config.dbUser} ${testDbName}`,
            { env },
          );
        } catch (error) {
          logger.error('[RestoreTest] Failed to drop test database', { error });
          warnings.push(`Failed to drop test database: ${testDbName}`);
        }
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('[RestoreTest] Restore test failed', { error, duration });

      // Try to clean up test database on error (cross-platform command)
      try {
        const env = {
          ...process.env,
          PGPASSWORD: this.config.dbPassword,
        };
        const dropdbCmd = process.platform === 'win32' ? 'dropdb.exe' : 'dropdb';
        await execAsync(
          `${dropdbCmd} -h ${this.config.dbHost} -p ${this.config.dbPort} -U ${this.config.dbUser} ${testDbName}`,
          { env },
        );
      } catch {
        // Ignore cleanup errors
      }

      return {
        success: false,
        testDbName,
        tablesCreated: 0,
        tablesVerified: [],
        foreignKeysVerified: false,
        dataIntegrityPassed: false,
        duration,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Extract table names from psql output
   */
  private extractTables(output: string): string[] {
    const lines = output.split('\n');
    const tables: string[] = [];

    for (const line of lines) {
      // psql \dt output format: "Schema | Name | Type | Owner"
      const match = line.match(/\|\s+(\w+)\s+\|/);
      if (match && match[1] && match[1] !== 'Name') {
        tables.push(match[1]);
      }
    }

    return tables;
  }

  /**
   * Verify data integrity
   */
  private async verifyDataIntegrity(
    dbName: string,
    env: NodeJS.ProcessEnv,
    psqlCmd: string,
  ): Promise<boolean> {
    try {
      // Check for orphaned cutting_list_items (cross-platform command)
      const { stdout: orphanedOutput } = await execAsync(
        `${psqlCmd} -h ${this.config.dbHost} -p ${this.config.dbPort} -U ${this.config.dbUser} -d ${dbName} -c "SELECT COUNT(*) FROM cutting_list_items WHERE cutting_list_id NOT IN (SELECT id FROM cutting_lists);"`,
        { env },
      );

      const orphanedCount = parseInt(orphanedOutput.match(/\d+/)?.[0] || '0', 10);
      if (orphanedCount > 0) {
        logger.warn('[RestoreTest] Found orphaned records', { count: orphanedCount });
        return false;
      }

      return true;
    } catch (error) {
      logger.error('[RestoreTest] Data integrity check failed', { error });
      return false;
    }
  }

  /**
   * Get row counts for key tables
   */
  private async getRowCounts(
    dbName: string,
    env: NodeJS.ProcessEnv,
    psqlCmd: string,
  ): Promise<Record<string, number>> {
    const tables = ['users', 'cutting_lists', 'cutting_list_items', 'optimizations'];
    const rowCounts: Record<string, number> = {};
    
    for (const table of tables) {
      try {
        const { stdout } = await execAsync(
          `${psqlCmd} -h ${this.config.dbHost} -p ${this.config.dbPort} -U ${this.config.dbUser} -d ${dbName} -c "SELECT COUNT(*) FROM ${table};"`,
          { env },
        );
        const count = parseInt(stdout.match(/\d+/)?.[0] || '0', 10);
        rowCounts[table] = count;
      } catch (error) {
        logger.warn('[RestoreTest] Failed to get row count', { table, error });
        rowCounts[table] = -1;
      }
    }

    return rowCounts;
  }

  /**
   * Test latest backup
   */
  async testLatestBackup(): Promise<RestoreTestResult> {
    try {
      const files = await fs.readdir(this.config.backupDir);
      const backupFiles = files
        .filter((f) => f.startsWith('backup_full_'))
        .sort()
        .reverse(); // Latest first

      if (backupFiles.length === 0) {
        throw new Error('No backup files found');
      }

      const latestBackup = path.join(this.config.backupDir, backupFiles[0]);
      logger.info('[RestoreTest] Testing latest backup', {
        file: backupFiles[0],
      });

      return await this.testRestore(latestBackup);
    } catch (error) {
      logger.error('[RestoreTest] Failed to test latest backup', { error });
      throw error;
    }
  }
}

/**
 * CLI entry point
 */
if (require.main === module) {
  const tester = new BackupRestoreTester();
  const backupFile = process.argv[2];

  if (!backupFile) {
    console.log('Usage: ts-node backup-restore-test.ts <backup-file>');
    console.log('   or: ts-node backup-restore-test.ts latest');
    console.log('');
    console.log('Examples:');
    console.log('  ts-node backup-restore-test.ts latest');
    console.log('  ts-node backup-restore-test.ts ./backups/backup_full_2024-01-15T02-00-00.sql.gz');
    process.exit(1);
  }

  const testPromise = backupFile === 'latest'
    ? tester.testLatestBackup()
    : tester.testRestore(backupFile);

  testPromise
    .then((result) => {
      console.log('\n=== Restore Test Results ===');
      console.log(`Success: ${result.success}`);
      console.log(`Tables Created: ${result.tablesCreated}`);
      console.log(`Tables Verified: ${result.tablesVerified.length}/${result.tablesVerified.length}`);
      console.log(`Foreign Keys Verified: ${result.foreignKeysVerified}`);
      console.log(`Data Integrity: ${result.dataIntegrityPassed ? 'PASSED' : 'FAILED'}`);
      console.log(`Duration: ${(result.duration / 1000).toFixed(2)}s`);

      if (result.warnings && result.warnings.length > 0) {
        console.log('\nWarnings:');
        result.warnings.forEach((warning) => console.log(`  - ${warning}`));
      }

      if (result.error) {
        console.log(`\nError: ${result.error}`);
      }

      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Restore test error:', error);
      process.exit(1);
    });
}

export default BackupRestoreTester;

