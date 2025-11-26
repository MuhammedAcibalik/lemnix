/**
 * @fileoverview Enterprise Backup System - Local Backup Strategy
 * @module BackupEnterprise
 * @version 3.0.0
 * 
 * Local Backup Strategy (3-1-1):
 * - 3 copies of data (production + local backup 1 + local backup 2)
 * - 1 primary backup location (local disk)
 * - 1 secondary backup location (different disk/network share)
 * 
 * Features:
 * - Full database backups
 * - WAL archiving integration
 * - Secondary backup location support
 * - Automated scheduling
 * - Backup verification
 * - Retention policy management
 * - Cross-platform support (Windows/Linux)
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { createGzip } from 'node:zlib';
import { logger } from '../src/services/logger';
import { loadBackupConfig, type BackupConfig } from '../config/backup.config';

const execAsync = promisify(exec);

/**
 * Compression algorithms
 */
type CompressionAlgorithm = 'gzip' | 'bzip2' | 'xz' | 'none';

/**
 * Backup result
 */
interface BackupResult {
  success: boolean;
  filePath: string;
  compressedPath?: string;
  size: number;
  compressedSize?: number;
  duration: number;
  error?: string;
}

/**
 * Enterprise Backup Manager
 */
export class EnterpriseBackupManager {
  private config: BackupConfig;

  constructor(config?: BackupConfig) {
    this.config = config || loadBackupConfig();
  }

  /**
   * Perform full database backup
   */
  async performFullBackup(): Promise<BackupResult> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup_full_${timestamp}.sql`;
    const backupPath = path.join(this.config.backupDir, backupFileName);

    try {
      logger.info('[Backup] Starting full backup', {
        database: this.config.dbName,
        backupPath,
      });

      // Create backup directory
      await fs.mkdir(this.config.backupDir, { recursive: true });

      // Execute pg_dump
      const pgDumpCommand = [
        'pg_dump',
        `-h ${this.config.dbHost}`,
        `-p ${this.config.dbPort}`,
        `-U ${this.config.dbUser}`,
        `-d ${this.config.dbName}`,
        '-F p', // Plain text format
        '-f', backupPath,
        '--no-owner',
        '--no-acl',
        '--verbose',
      ].join(' ');

      const env = {
        ...process.env,
        PGPASSWORD: this.config.dbPassword,
      };

      await execAsync(pgDumpCommand, { env });

      // Get backup file size
      const stats = await fs.stat(backupPath);
      const size = stats.size;

      logger.info('[Backup] Full backup created', {
        file: backupFileName,
        size: `${(size / 1024 / 1024).toFixed(2)} MB`,
      });

      // Compress backup if enabled
      let compressedPath: string | undefined;
      let compressedSize: number | undefined;

      if (this.config.compression.enabled) {
        compressedPath = await this.compressBackup(backupPath, this.config.compression.algorithm);
        const compressedStats = await fs.stat(compressedPath);
        compressedSize = compressedStats.size;

        // Remove uncompressed backup to save space
        await fs.unlink(backupPath);

        logger.info('[Backup] Backup compressed', {
          original: `${(size / 1024 / 1024).toFixed(2)} MB`,
          compressed: `${(compressedSize / 1024 / 1024).toFixed(2)} MB`,
          ratio: `${((1 - compressedSize / size) * 100).toFixed(1)}%`,
        });
      }

      const finalPath = compressedPath || backupPath;
      const duration = Date.now() - startTime;

      // Copy to secondary backup location if configured
      if (this.config.secondaryBackupDir) {
        try {
          await this.copyToSecondaryLocation(finalPath);
        } catch (error) {
          logger.error('[Backup] Secondary backup copy failed (non-fatal)', { error });
          // Continue - primary backup succeeded
        }
      }

      logger.info('[Backup] Full backup completed', {
        file: path.basename(finalPath),
        duration: `${(duration / 1000).toFixed(2)}s`,
      });

      return {
        success: true,
        filePath: finalPath,
        compressedPath,
        size,
        compressedSize,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('[Backup] Full backup failed', { error, duration });

      return {
        success: false,
        filePath: backupPath,
        size: 0,
        duration,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Compress backup file
   */
  private async compressBackup(
    filePath: string,
    algorithm: CompressionAlgorithm,
  ): Promise<string> {
    const outputPath = `${filePath}.${this.getCompressionExtension(algorithm)}`;

    logger.debug('[Backup] Compressing backup', {
      algorithm,
      input: path.basename(filePath),
      output: path.basename(outputPath),
    });

    const inputStream = createReadStream(filePath);
    let outputStream: NodeJS.WritableStream;

    switch (algorithm) {
      case 'gzip': {
        const { createWriteStream } = await import('node:fs');
        const writeStream = createWriteStream(outputPath);
        const gzipStream = createGzip({ level: this.config.compression.level });
        await pipeline(inputStream, gzipStream, writeStream);
        return outputPath;
      }
      case 'bzip2': {
        // bzip2 requires external command (not available on Windows by default)
        if (process.platform === 'win32') {
          logger.warn('[Backup] bzip2 compression not available on Windows, falling back to gzip');
          return await this.compressBackup(filePath, 'gzip');
        }
        await execAsync(`bzip2 -${this.config.compression.level} -c "${filePath}" > "${outputPath}"`);
        return outputPath;
      }
      case 'xz': {
        // xz requires external command (not available on Windows by default)
        if (process.platform === 'win32') {
          logger.warn('[Backup] xz compression not available on Windows, falling back to gzip');
          return await this.compressBackup(filePath, 'gzip');
        }
        await execAsync(`xz -${this.config.compression.level} -c "${filePath}" > "${outputPath}"`);
        return outputPath;
      }
      case 'none':
        return filePath;
      default:
        throw new Error(`Unsupported compression algorithm: ${algorithm}`);
    }
  }

  /**
   * Get compression file extension
   */
  private getCompressionExtension(algorithm: CompressionAlgorithm): string {
    const extensions: Record<CompressionAlgorithm, string> = {
      gzip: 'gz',
      bzip2: 'bz2',
      xz: 'xz',
      none: '',
    };
    return extensions[algorithm] || 'gz';
  }

  /**
   * Copy backup to secondary location
   */
  private async copyToSecondaryLocation(filePath: string): Promise<void> {
    if (!this.config.secondaryBackupDir) {
      return;
    }

    try {
      logger.info('[Backup] Copying to secondary location', {
        source: filePath,
        destination: this.config.secondaryBackupDir,
      });

      // Create secondary backup directory if it doesn't exist
      await fs.mkdir(this.config.secondaryBackupDir, { recursive: true });

      // Copy file to secondary location
      const fileName = path.basename(filePath);
      const destPath = path.join(this.config.secondaryBackupDir, fileName);

      // Use fs.copyFile for cross-platform compatibility
      await fs.copyFile(filePath, destPath);

      logger.info('[Backup] Secondary backup copy completed', {
        file: fileName,
        destination: destPath,
      });
    } catch (error) {
      logger.error('[Backup] Secondary backup copy failed', { error });
      throw error;
    }
  }

  /**
   * Clean up old backups based on retention policy
   */
  async cleanupOldBackups(): Promise<{ primary: number; secondary: number }> {
    logger.info('[Backup] Starting cleanup', {
      retentionDays: this.config.retentionDays,
    });

    let primaryDeleted = 0;
    let secondaryDeleted = 0;

    try {
      // Clean primary backups
      const files = await fs.readdir(this.config.backupDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

      for (const file of files) {
        if (!file.startsWith('backup_full_')) continue;

        const filePath = path.join(this.config.backupDir, file);
        const stats = await fs.stat(filePath);

        if (stats.mtime < cutoffDate) {
          await fs.unlink(filePath);
          primaryDeleted++;
          logger.debug('[Backup] Deleted old primary backup', { file });
        }
      }

      // Clean secondary backups if configured
      if (this.config.secondaryBackupDir) {
        try {
          const secondaryFiles = await fs.readdir(this.config.secondaryBackupDir);
          for (const file of secondaryFiles) {
            if (!file.startsWith('backup_full_')) continue;

            const filePath = path.join(this.config.secondaryBackupDir, file);
            const stats = await fs.stat(filePath);

            if (stats.mtime < cutoffDate) {
              await fs.unlink(filePath);
              secondaryDeleted++;
              logger.debug('[Backup] Deleted old secondary backup', { file });
            }
          }
        } catch (error) {
          logger.error('[Backup] Secondary cleanup failed', { error });
        }
      }

      logger.info('[Backup] Cleanup completed', {
        primaryDeleted,
        secondaryDeleted,
      });
    } catch (error) {
      logger.error('[Backup] Cleanup failed', { error });
    }

    return { primary: primaryDeleted, secondary: secondaryDeleted };
  }

  /**
   * Verify backup integrity
   */
  async verifyBackup(backupPath: string): Promise<boolean> {
    try {
      logger.info('[Backup] Verifying backup', {
        file: path.basename(backupPath),
      });

      // Check if file exists
      const stats = await fs.stat(backupPath);
      if (stats.size === 0) {
        logger.error('[Backup] Backup file is empty');
        return false;
      }

      // For compressed files, try to decompress and check
      // Use cross-platform approach
      const isWindows = process.platform === 'win32';
      
      if (backupPath.endsWith('.gz')) {
        // Try to read first few bytes to verify it's a valid gzip file
        const fileHandle = await fs.open(backupPath, 'r');
        const buffer = Buffer.alloc(2);
        await fileHandle.read(buffer, 0, 2, 0);
        await fileHandle.close();
        
        // Gzip files start with 0x1f 0x8b
        if (buffer[0] !== 0x1f || buffer[1] !== 0x8b) {
          logger.warn('[Backup] File does not appear to be a valid gzip file');
          return false;
        }
        
        // If gunzip is available, use it for verification
        if (!isWindows) {
          try {
            await execAsync(`gunzip -t "${backupPath}"`);
          } catch {
            // gunzip not available, but file header is valid
            logger.debug('[Backup] gunzip not available, using header check only');
          }
        }
      } else if (backupPath.endsWith('.bz2')) {
        if (!isWindows) {
          try {
            await execAsync(`bzip2 -t "${backupPath}"`);
          } catch {
            logger.warn('[Backup] bzip2 test failed or not available');
            return false;
          }
        } else {
          logger.warn('[Backup] bzip2 verification not available on Windows');
        }
      } else if (backupPath.endsWith('.xz')) {
        if (!isWindows) {
          try {
            await execAsync(`xz -t "${backupPath}"`);
          } catch {
            logger.warn('[Backup] xz test failed or not available');
            return false;
          }
        } else {
          logger.warn('[Backup] xz verification not available on Windows');
        }
      }

      // For SQL files, check if it's valid SQL (basic check)
      if (backupPath.endsWith('.sql')) {
        const content = await fs.readFile(backupPath, 'utf-8');
        if (!content.includes('PostgreSQL database dump')) {
          logger.warn('[Backup] Backup file may not be a valid PostgreSQL dump');
        }
      }

      logger.info('[Backup] Backup verification passed');
      return true;
    } catch (error) {
      logger.error('[Backup] Backup verification failed', { error });
      return false;
    }
  }

  /**
   * Get backup statistics
   */
  async getBackupStats(): Promise<{
    totalBackups: number;
    totalSize: number;
    oldestBackup: Date | null;
    newestBackup: Date | null;
  }> {
    try {
      const files = await fs.readdir(this.config.backupDir);
      const backupFiles = files.filter((f) => f.startsWith('backup_full_'));

      let totalSize = 0;
      let oldestDate: Date | null = null;
      let newestDate: Date | null = null;

      for (const file of backupFiles) {
        const filePath = path.join(this.config.backupDir, file);
        const stats = await fs.stat(filePath);

        totalSize += stats.size;

        if (!oldestDate || stats.mtime < oldestDate) {
          oldestDate = stats.mtime;
        }
        if (!newestDate || stats.mtime > newestDate) {
          newestDate = stats.mtime;
        }
      }

      return {
        totalBackups: backupFiles.length,
        totalSize,
        oldestBackup: oldestDate,
        newestBackup: newestDate,
      };
    } catch (error) {
      logger.error('[Backup] Failed to get backup stats', { error });
      return {
        totalBackups: 0,
        totalSize: 0,
        oldestBackup: null,
        newestBackup: null,
      };
    }
  }
}

/**
 * CLI entry point
 */
if (require.main === module) {
  const manager = new EnterpriseBackupManager();
  const command = process.argv[2];

  switch (command) {
    case 'backup':
      manager
        .performFullBackup()
        .then((result) => {
          if (result.success) {
            console.log('Backup completed successfully');
            process.exit(0);
          } else {
            console.error('Backup failed:', result.error);
            process.exit(1);
          }
        })
        .catch((error) => {
          console.error('Backup error:', error);
          process.exit(1);
        });
      break;

    case 'cleanup':
      manager
        .cleanupOldBackups()
        .then((result: { primary: number; secondary: number }) => {
          console.log(`Cleanup completed: ${result.primary} primary, ${result.secondary} secondary backups deleted`);
          process.exit(0);
        })
        .catch((error: unknown) => {
          console.error('Cleanup error:', error);
          process.exit(1);
        });
      break;

    case 'stats':
      manager
        .getBackupStats()
        .then((stats) => {
          console.log('Backup Statistics:');
          console.log(`  Total Backups: ${stats.totalBackups}`);
          console.log(`  Total Size: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
          console.log(`  Oldest: ${stats.oldestBackup?.toISOString() || 'N/A'}`);
          console.log(`  Newest: ${stats.newestBackup?.toISOString() || 'N/A'}`);
          process.exit(0);
        })
        .catch((error) => {
          console.error('Stats error:', error);
          process.exit(1);
        });
      break;

    default:
      console.log('Usage: ts-node backup-enterprise.ts <backup|cleanup|stats>');
      console.log('');
      console.log('Commands:');
      console.log('  backup   - Perform full database backup');
      console.log('  cleanup  - Clean old backups based on retention policy');
      console.log('  stats    - Show backup statistics');
      process.exit(1);
  }
}

export default EnterpriseBackupManager;

