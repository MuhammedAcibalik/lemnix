/**
 * @fileoverview Enterprise Backup Configuration
 * @module BackupConfig
 * @version 2.0.0
 * 
 * Centralized configuration for local backup strategy:
 * - 3 copies of data (production + local backup 1 + local backup 2)
 * - 2 different storage locations (primary disk + secondary disk/network share)
 * - 1 secondary backup location (different physical location or network share)
 * 
 * Local-only backup strategy suitable for on-premises deployments.
 */

import { z } from 'zod';
import * as path from 'node:path';
import * as os from 'node:os';

/**
 * Get default backup directory (cross-platform)
 */
function getDefaultBackupDir(): string {
  return path.join(process.cwd(), 'backups');
}

/**
 * Get default WAL archive directory (Docker-aware)
 */
function getDefaultWalArchiveDir(): string {
  // In Docker, use container path; otherwise use local path
  if (process.env.DOCKER_CONTAINER === 'true' || process.env.WAL_ARCHIVE_PATH) {
    return process.env.WAL_ARCHIVE_PATH || '/var/lib/postgresql/wal_archive';
  }
  return path.join(process.cwd(), 'backups', 'wal_archive');
}

/**
 * Get default log directory (cross-platform)
 */
function getDefaultLogDir(): string {
  const logBase = process.env.LOG_DIR || path.join(process.cwd(), 'logs');
  return path.join(logBase, 'lemnix');
}

/**
 * Backup configuration schema
 */
const BackupConfigSchema = z.object({
  // Database connection
  dbHost: z.string().default('localhost'),
  dbPort: z.number().int().positive().default(5432),
  dbName: z.string().default('lemnix_db'),
  dbUser: z.string().default('lemnix_user'),
  dbPassword: z.string().min(1),
  
  // Backup directories (primary)
  backupDir: z.string().default(getDefaultBackupDir()),
  walArchiveDir: z.string().default(getDefaultWalArchiveDir()),
  
  // Secondary backup location (optional - for 3-1-1 strategy)
  secondaryBackupDir: z.string().optional(),
  
  // Retention policy
  retentionDays: z.number().int().positive().default(30),
  walRetentionDays: z.number().int().positive().default(30),
  
  // Backup schedule
  schedule: z.object({
    fullBackup: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).default('02:00'), // Daily at 2 AM
    incrementalBackup: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).default('06:00'), // Daily at 6 AM
    cleanup: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).default('03:00'), // Daily at 3 AM
    restoreTest: z.string().regex(/^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/i).default('sunday'), // Weekly on Sunday
  }).default({}),
  
  // Notification
  notifications: z.object({
    enabled: z.boolean().default(false),
    email: z.string().email().optional(),
    webhook: z.string().url().optional(),
  }).default({ enabled: false }),
  
  // Compression
  compression: z.object({
    enabled: z.boolean().default(true),
    algorithm: z.enum(['gzip', 'bzip2', 'xz']).default('gzip'),
    level: z.number().int().min(1).max(9).default(6),
  }).default({}),
  
  // Performance
  performance: z.object({
    parallelJobs: z.number().int().positive().default(2),
    chunkSize: z.number().int().positive().default(1024 * 1024), // 1MB
  }).default({}),
});

export type BackupConfig = z.infer<typeof BackupConfigSchema>;

/**
 * Load backup configuration from environment variables
 */
export function loadBackupConfig(): BackupConfig {
  const config = {
    dbHost: process.env.DB_HOST || process.env.DATABASE_HOST || 'localhost',
    dbPort: parseInt(process.env.DB_PORT || process.env.DATABASE_PORT || '5432', 10),
    dbName: process.env.DB_NAME || process.env.DATABASE_NAME || 'lemnix_db',
    dbUser: process.env.DB_USER || process.env.DATABASE_USER || 'lemnix_user',
    dbPassword: process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD || '',
    backupDir: process.env.BACKUP_DIR || getDefaultBackupDir(),
    walArchiveDir: process.env.WAL_ARCHIVE_PATH || getDefaultWalArchiveDir(),
    secondaryBackupDir: process.env.SECONDARY_BACKUP_DIR,
    retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30', 10),
    walRetentionDays: parseInt(process.env.WAL_RETENTION_DAYS || '30', 10),
    schedule: {
      fullBackup: process.env.BACKUP_SCHEDULE_FULL || '02:00',
      incrementalBackup: process.env.BACKUP_SCHEDULE_INCREMENTAL || '06:00',
      cleanup: process.env.BACKUP_SCHEDULE_CLEANUP || '03:00',
      restoreTest: process.env.BACKUP_SCHEDULE_RESTORE_TEST || 'sunday',
    },
    notifications: {
      enabled: process.env.BACKUP_NOTIFICATIONS_ENABLED === 'true',
      email: process.env.BACKUP_NOTIFICATION_EMAIL,
      webhook: process.env.BACKUP_NOTIFICATION_WEBHOOK,
    },
    compression: {
      enabled: process.env.BACKUP_COMPRESSION_ENABLED !== 'false',
      algorithm: (process.env.BACKUP_COMPRESSION_ALGORITHM || 'gzip') as 'gzip' | 'bzip2' | 'xz',
      level: parseInt(process.env.BACKUP_COMPRESSION_LEVEL || '6', 10),
    },
    performance: {
      parallelJobs: parseInt(process.env.BACKUP_PARALLEL_JOBS || '2', 10),
      chunkSize: parseInt(process.env.BACKUP_CHUNK_SIZE || '1048576', 10),
    },
  };
  
  return BackupConfigSchema.parse(config);
}

/**
 * Validate backup configuration
 */
export function validateBackupConfig(config: unknown): BackupConfig {
  return BackupConfigSchema.parse(config);
}

/**
 * Get default backup configuration
 */
export function getDefaultBackupConfig(): BackupConfig {
  return BackupConfigSchema.parse({});
}

