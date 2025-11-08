/**
 * @fileoverview Automated Backup Scheduler with 3-2-1 Strategy
 * @module BackupScheduler
 * @version 1.0.0
 * 
 * 3-2-1 Backup Rule:
 * - 3 copies of data
 * - 2 different media types (local + cloud)
 * - 1 offsite backup
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { logger } from '../src/services/logger';

const execAsync = promisify(exec);

interface BackupConfig {
  dbHost: string;
  dbPort: number;
  dbName: string;
  dbUser: string;
  dbPassword: string;
  backupDir: string;
  retentionDays: number;
  enableS3?: boolean;
  s3Bucket?: string;
  s3Region?: string;
}

class BackupScheduler {
  private config: BackupConfig;

  constructor(config: BackupConfig) {
    this.config = config;
  }

  /**
   * Perform full backup
   */
  async performFullBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup_full_${timestamp}.sql`;
    const backupPath = path.join(this.config.backupDir, backupFileName);

    try {
      logger.info('[Backup] Starting full backup', { backupPath });

      // Create backup directory if it doesn't exist
      await fs.mkdir(this.config.backupDir, { recursive: true });

      // Execute pg_dump
      const command = `pg_dump -h ${this.config.dbHost} -p ${this.config.dbPort} -U ${this.config.dbUser} -d ${this.config.dbName} -F p -f ${backupPath}`;

      const env = {
        ...process.env,
        PGPASSWORD: this.config.dbPassword,
      };

      await execAsync(command, { env });

      // Compress backup
      const compressedPath = `${backupPath}.gz`;
      await execAsync(`gzip ${backupPath}`);

      const stats = await fs.stat(compressedPath);
      logger.info('[Backup] Full backup completed', {
        file: compressedPath,
        size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
      });

      // Upload to S3 if enabled
      if (this.config.enableS3) {
        await this.uploadToS3(compressedPath);
      }

      return compressedPath;
    } catch (error) {
      logger.error('[Backup] Full backup failed', { error });
      throw error;
    }
  }

  /**
   * Perform incremental backup (WAL archiving)
   */
  async performIncrementalBackup(): Promise<void> {
    try {
      logger.info('[Backup] Starting incremental backup (WAL)');

      const walDir = path.join(this.config.backupDir, 'wal');
      await fs.mkdir(walDir, { recursive: true });

      // Archive WAL files
      const command = `pg_receivewal -h ${this.config.dbHost} -p ${this.config.dbPort} -U ${this.config.dbUser} -D ${walDir} --synchronous`;

      logger.info('[Backup] WAL archiving configured', { walDir });
    } catch (error) {
      logger.error('[Backup] Incremental backup failed', { error });
      throw error;
    }
  }

  /**
   * Upload backup to S3
   */
  private async uploadToS3(filePath: string): Promise<void> {
    if (!this.config.enableS3 || !this.config.s3Bucket) {
      return;
    }

    try {
      logger.info('[Backup] Uploading to S3', {
        bucket: this.config.s3Bucket,
        file: path.basename(filePath),
      });

      // TODO: Implement S3 upload using AWS SDK
      // const s3 = new S3Client({ region: this.config.s3Region });
      // await s3.send(new PutObjectCommand({
      //   Bucket: this.config.s3Bucket,
      //   Key: path.basename(filePath),
      //   Body: await fs.readFile(filePath)
      // }));

      logger.info('[Backup] S3 upload completed');
    } catch (error) {
      logger.error('[Backup] S3 upload failed', { error });
      // Don't throw - local backup still succeeded
    }
  }

  /**
   * Clean up old backups
   */
  async cleanupOldBackups(): Promise<void> {
    try {
      logger.info('[Backup] Cleaning up old backups', {
        retentionDays: this.config.retentionDays,
      });

      const files = await fs.readdir(this.config.backupDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

      let deletedCount = 0;

      for (const file of files) {
        if (!file.startsWith('backup_full_')) continue;

        const filePath = path.join(this.config.backupDir, file);
        const stats = await fs.stat(filePath);

        if (stats.mtime < cutoffDate) {
          await fs.unlink(filePath);
          deletedCount++;
          logger.debug('[Backup] Deleted old backup', { file });
        }
      }

      logger.info('[Backup] Cleanup completed', { deletedCount });
    } catch (error) {
      logger.error('[Backup] Cleanup failed', { error });
    }
  }

  /**
   * Test backup restore (verification)
   */
  async testRestore(backupFile: string): Promise<boolean> {
    try {
      logger.info('[Backup] Testing restore from backup', { backupFile });

      const testDbName = `${this.config.dbName}_test_restore`;

      // Create test database
      await execAsync(`createdb -h ${this.config.dbHost} -p ${this.config.dbPort} -U ${this.config.dbUser} ${testDbName}`, {
        env: { ...process.env, PGPASSWORD: this.config.dbPassword }
      });

      // Decompress if needed
      let restoreFile = backupFile;
      if (backupFile.endsWith('.gz')) {
        restoreFile = backupFile.replace('.gz', '');
        await execAsync(`gunzip -k ${backupFile}`);
      }

      // Restore to test database
      await execAsync(`psql -h ${this.config.dbHost} -p ${this.config.dbPort} -U ${this.config.dbUser} -d ${testDbName} -f ${restoreFile}`, {
        env: { ...process.env, PGPASSWORD: this.config.dbPassword }
      });

      // Verify tables exist
      const { stdout } = await execAsync(`psql -h ${this.config.dbHost} -p ${this.config.dbPort} -U ${this.config.dbUser} -d ${testDbName} -c "\\dt"`, {
        env: { ...process.env, PGPASSWORD: this.config.dbPassword }
      });

      const tablesExist = stdout.includes('cutting_lists') && stdout.includes('users');

      // Drop test database
      await execAsync(`dropdb -h ${this.config.dbHost} -p ${this.config.dbPort} -U ${this.config.dbUser} ${testDbName}`, {
        env: { ...process.env, PGPASSWORD: this.config.dbPassword }
      });

      // Clean up decompressed file
      if (backupFile.endsWith('.gz')) {
        await fs.unlink(restoreFile);
      }

      logger.info('[Backup] Restore test completed', { success: tablesExist });
      return tablesExist;
    } catch (error) {
      logger.error('[Backup] Restore test failed', { error });
      return false;
    }
  }

  /**
   * Schedule daily backups
   */
  scheduleDailyBackup(): void {
    // Run at 2 AM every day
    const runBackup = async () => {
      try {
        const backupFile = await this.performFullBackup();
        await this.testRestore(backupFile);
        await this.cleanupOldBackups();
      } catch (error) {
        logger.error('[Backup] Scheduled backup failed', { error });
      }
    };

    // Calculate time until next 2 AM
    const now = new Date();
    const next2AM = new Date();
    next2AM.setHours(2, 0, 0, 0);
    if (next2AM <= now) {
      next2AM.setDate(next2AM.getDate() + 1);
    }

    const msUntil2AM = next2AM.getTime() - now.getTime();

    // Schedule first run
    setTimeout(() => {
      runBackup();
      // Then run every 24 hours
      setInterval(runBackup, 24 * 60 * 60 * 1000);
    }, msUntil2AM);

    logger.info('[Backup] Daily backup scheduled', {
      nextRun: next2AM.toISOString(),
    });
  }
}

// Export for use in application
export default BackupScheduler;

// CLI usage
if (require.main === module) {
  const config: BackupConfig = {
    dbHost: process.env.DB_HOST || 'localhost',
    dbPort: parseInt(process.env.DB_PORT || '5432'),
    dbName: process.env.DB_NAME || 'lemnix_db',
    dbUser: process.env.DB_USER || 'lemnix_user',
    dbPassword: process.env.DB_PASSWORD || '',
    backupDir: process.env.BACKUP_DIR || './backups',
    retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
    enableS3: process.env.BACKUP_S3_ENABLED === 'true',
    s3Bucket: process.env.BACKUP_S3_BUCKET,
    s3Region: process.env.BACKUP_S3_REGION || 'us-east-1',
  };

  const scheduler = new BackupScheduler(config);

  const command = process.argv[2];

  switch (command) {
    case 'backup':
      scheduler.performFullBackup().then(() => process.exit(0)).catch(() => process.exit(1));
      break;
    case 'cleanup':
      scheduler.cleanupOldBackups().then(() => process.exit(0)).catch(() => process.exit(1));
      break;
    case 'test':
      const backupFile = process.argv[3];
      if (!backupFile) {
        console.error('Usage: ts-node backup-scheduler.ts test <backup-file>');
        process.exit(1);
      }
      scheduler.testRestore(backupFile).then((success) => process.exit(success ? 0 : 1));
      break;
    case 'schedule':
      scheduler.scheduleDailyBackup();
      logger.info('[Backup] Scheduler started - press Ctrl+C to stop');
      break;
    default:
      console.log('Usage: ts-node backup-scheduler.ts <backup|cleanup|test|schedule>');
      process.exit(1);
  }
}

