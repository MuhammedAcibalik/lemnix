/**
 * @fileoverview Connection Pool Monitoring Service
 * @module ConnectionPoolMonitor
 * @version 1.0.0
 * 
 * Monitors database connection pool health and provides alerts for:
 * - Connection pool exhaustion
 * - High connection count
 * - Long-running queries
 * - Idle transactions
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../../services/logger';

/**
 * Connection pool statistics
 */
export interface ConnectionPoolStats {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  idleInTransaction: number;
  maxConnections: number;
  connectionUtilization: number; // Percentage
  longRunningQueries: number;
  oldestQueryAge?: number; // seconds
}

/**
 * Connection pool alert thresholds
 */
interface PoolAlertThresholds {
  maxConnections: number;
  utilizationWarning: number; // Percentage (e.g., 80)
  utilizationCritical: number; // Percentage (e.g., 90)
  longQueryThreshold: number; // seconds
  idleTransactionThreshold: number; // seconds
}

/**
 * Connection Pool Monitor
 */
export class ConnectionPoolMonitor {
  private static instance: ConnectionPoolMonitor;
  private prisma: PrismaClient;
  private thresholds: PoolAlertThresholds;
  private monitoringInterval: NodeJS.Timeout | null = null;

  private constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.thresholds = {
      maxConnections: parseInt(process.env.DATABASE_CONNECTION_LIMIT || '50', 10),
      utilizationWarning: parseInt(process.env.DB_POOL_WARNING_THRESHOLD || '80', 10),
      utilizationCritical: parseInt(process.env.DB_POOL_CRITICAL_THRESHOLD || '90', 10),
      longQueryThreshold: parseInt(process.env.DB_LONG_QUERY_THRESHOLD || '30', 10),
      idleTransactionThreshold: parseInt(process.env.DB_IDLE_TX_THRESHOLD || '60', 10),
    };
  }

  public static getInstance(prisma: PrismaClient): ConnectionPoolMonitor {
    if (!ConnectionPoolMonitor.instance) {
      ConnectionPoolMonitor.instance = new ConnectionPoolMonitor(prisma);
    }
    return ConnectionPoolMonitor.instance;
  }

  /**
   * Get connection pool statistics
   */
  async getPoolStats(): Promise<ConnectionPoolStats> {
    try {
      // Get current connection statistics
      const connectionStats = await this.prisma.$queryRaw<Array<{
        state: string;
        count: bigint;
      }>>`
        SELECT 
          state,
          COUNT(*)::bigint as count
        FROM pg_stat_activity
        WHERE datname = current_database()
        GROUP BY state
      `;

      // Get max connections setting
      const [maxConnResult] = await this.prisma.$queryRaw<Array<{ setting: string }>>`
        SELECT setting
        FROM pg_settings
        WHERE name = 'max_connections'
      `;

      const maxConnections = parseInt(maxConnResult?.setting || '200', 10);

      // Calculate statistics
      const statsMap = new Map<string, number>();
      if (Array.isArray(connectionStats)) {
        for (const stat of connectionStats) {
          statsMap.set(stat.state, Number(stat.count));
        }
      }

      const totalConnections = Array.from(statsMap.values()).reduce((a, b) => a + b, 0);
      const activeConnections = statsMap.get('active') || 0;
      const idleConnections = statsMap.get('idle') || 0;
      const idleInTransaction = statsMap.get('idle in transaction') || 0;

      // Get long-running queries
      // Use Prisma's parameterized query to avoid SQL injection
      const longQueryThresholdSeconds = this.thresholds.longQueryThreshold;
      const [longQueries] = await this.prisma.$queryRaw<Array<{
        count: bigint;
        oldest_age?: number;
      }>>`
        SELECT 
          COUNT(*) as count,
          MAX(EXTRACT(EPOCH FROM (NOW() - query_start)))::int as oldest_age
        FROM pg_stat_activity
        WHERE datname = current_database()
          AND state = 'active'
          AND query_start < NOW() - INTERVAL '1 second' * ${longQueryThresholdSeconds}
      `;

      const longRunningQueries = Number(longQueries?.count || 0);
      const oldestQueryAge = longQueries?.oldest_age ? Number(longQueries.oldest_age) : undefined;

      const connectionUtilization = (totalConnections / maxConnections) * 100;

      return {
        totalConnections,
        activeConnections,
        idleConnections,
        idleInTransaction,
        maxConnections,
        connectionUtilization: Math.round(connectionUtilization * 100) / 100,
        longRunningQueries,
        oldestQueryAge,
      };
    } catch (error) {
      logger.error('[ConnectionPoolMonitor] Failed to get pool stats', { error });
      throw error;
    }
  }

  /**
   * Check for pool health issues and alert
   */
  async checkPoolHealth(): Promise<{
    healthy: boolean;
    warnings: string[];
    critical: string[];
  }> {
    const stats = await this.getPoolStats();
    const warnings: string[] = [];
    const critical: string[] = [];

    // Check connection utilization
    if (stats.connectionUtilization >= this.thresholds.utilizationCritical) {
      critical.push(
        `Connection pool critical: ${stats.connectionUtilization.toFixed(1)}% utilized (${stats.totalConnections}/${stats.maxConnections})`
      );
    } else if (stats.connectionUtilization >= this.thresholds.utilizationWarning) {
      warnings.push(
        `Connection pool warning: ${stats.connectionUtilization.toFixed(1)}% utilized (${stats.totalConnections}/${stats.maxConnections})`
      );
    }

    // Check for long-running queries
    if (stats.longRunningQueries > 0) {
      warnings.push(
        `${stats.longRunningQueries} long-running query(ies) detected (threshold: ${this.thresholds.longQueryThreshold}s)`
      );
      if (stats.oldestQueryAge && stats.oldestQueryAge > this.thresholds.longQueryThreshold * 2) {
        critical.push(
          `Very long-running query detected: ${stats.oldestQueryAge}s (threshold: ${this.thresholds.longQueryThreshold}s)`
        );
      }
    }

    // Check for idle transactions
    if (stats.idleInTransaction > 0) {
      const [idleTxStats] = await this.prisma.$queryRaw<Array<{
        count: bigint;
        oldest_age: number;
      }>>`
        SELECT 
          COUNT(*)::bigint as count,
          MAX(EXTRACT(EPOCH FROM (NOW() - state_change)))::int as oldest_age
        FROM pg_stat_activity
        WHERE datname = current_database()
          AND state = 'idle in transaction'
      `;

      const oldestIdleAge = idleTxStats?.oldest_age ? Number(idleTxStats.oldest_age) : 0;
      
      if (oldestIdleAge > this.thresholds.idleTransactionThreshold) {
        warnings.push(
          `${stats.idleInTransaction} idle transaction(s) detected, oldest: ${oldestIdleAge}s`
        );
      }
    }

    const healthy = critical.length === 0 && warnings.length === 0;

    if (!healthy) {
      logger.warn('[ConnectionPoolMonitor] Pool health issues detected', {
        healthy,
        warnings,
        critical,
        stats,
      });
    }

    return {
      healthy,
      warnings,
      critical,
    };
  }

  /**
   * Start monitoring connection pool
   */
  startMonitoring(intervalMs: number = 60000): void {
    if (this.monitoringInterval) {
      logger.warn('[ConnectionPoolMonitor] Monitoring already started');
      return;
    }

    logger.info('[ConnectionPoolMonitor] Starting connection pool monitoring', {
      interval: `${intervalMs}ms`,
    });

    this.monitoringInterval = setInterval(async () => {
      try {
        await this.checkPoolHealth();
      } catch (error) {
        logger.error('[ConnectionPoolMonitor] Monitoring check failed', { error });
      }
    }, intervalMs);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      logger.info('[ConnectionPoolMonitor] Monitoring stopped');
    }
  }
}

/**
 * Export factory function
 */
export function createConnectionPoolMonitor(prisma: PrismaClient): ConnectionPoolMonitor {
  return ConnectionPoolMonitor.getInstance(prisma);
}

