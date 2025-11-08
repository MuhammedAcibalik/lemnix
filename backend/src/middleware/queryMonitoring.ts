/**
 * Query Performance Monitoring Middleware
 * 
 * Monitors slow queries using pg_stat_statements extension
 * Logs queries that exceed performance thresholds
 */

import { prisma } from '../config/database';
import { logger } from '../services/logger';

interface SlowQuery {
  readonly query: string;
  readonly mean_exec_time: number;
  readonly calls: number;
  readonly total_exec_time: number;
  readonly stddev_exec_time: number;
}

/**
 * Log slow queries from pg_stat_statements
 * Queries with mean execution time > 100ms are logged
 */
export async function logSlowQueries(): Promise<void> {
  try {
    const slowQueries = await prisma.$queryRaw<SlowQuery[]>`
      SELECT 
        query,
        mean_exec_time,
        calls,
        total_exec_time,
        stddev_exec_time
      FROM pg_stat_statements
      WHERE mean_exec_time > 100
      ORDER BY mean_exec_time DESC
      LIMIT 10;
    `;
    
    if (Array.isArray(slowQueries) && slowQueries.length > 0) {
      logger.warn('Slow queries detected', {
        count: slowQueries.length,
        queries: slowQueries.map(q => ({
          query: q.query.substring(0, 100), // Truncate for logging
          meanTime: `${q.mean_exec_time.toFixed(2)}ms`,
          calls: q.calls,
          totalTime: `${q.total_exec_time.toFixed(2)}ms`,
        })),
      });
    }
  } catch (error) {
    // Silently fail if pg_stat_statements is not enabled
    // Check if error is related to missing extension
    if (error instanceof Error && 
        !error.message.includes('pg_stat_statements') && 
        !error.message.includes('shared_preload_libraries')) {
      logger.error('Failed to fetch slow queries', { error });
    }
    // Otherwise, just ignore (extension not available)
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(): Promise<{
  connections: number;
  cacheHitRatio: number;
  transactionsPerSecond: number;
}> {
  try {
    const [connectionStats] = await prisma.$queryRaw<Array<{ count: number }>>`
      SELECT count(*) as count FROM pg_stat_activity;
    `;
    
    const [cacheStats] = await prisma.$queryRaw<Array<{
      blks_hit: bigint;
      blks_read: bigint;
    }>>`
      SELECT 
        sum(blks_hit) as blks_hit,
        sum(blks_read) as blks_read
      FROM pg_stat_database;
    `;
    
    const cacheHitRatio = cacheStats 
      ? Number(cacheStats.blks_hit) / (Number(cacheStats.blks_hit) + Number(cacheStats.blks_read))
      : 0;
    
    return {
      connections: connectionStats?.count || 0,
      cacheHitRatio: cacheHitRatio * 100,
      transactionsPerSecond: 0, // Can be calculated from pg_stat_database xact_commit/xact_rollback
    };
  } catch (error) {
    logger.error('Failed to get database stats', { error });
    return {
      connections: 0,
      cacheHitRatio: 0,
      transactionsPerSecond: 0,
    };
  }
}

/**
 * Start query monitoring
 * Runs every 5 minutes
 */
export function startQueryMonitoring(): void {
  // Run immediately
  logSlowQueries();
  
  // Run every 5 minutes
  setInterval(logSlowQueries, 5 * 60 * 1000);
  
  logger.info('Query monitoring started (interval: 5 minutes)');
}

/**
 * Reset pg_stat_statements
 * Use with caution - only in development
 */
export async function resetQueryStats(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    logger.warn('Cannot reset query stats in production');
    return;
  }
  
  try {
    await prisma.$queryRaw`SELECT pg_stat_statements_reset();`;
    logger.info('Query statistics reset successfully');
  } catch (error) {
    // Silently fail if extension not available
    if (error instanceof Error && 
        !error.message.includes('pg_stat_statements') && 
        !error.message.includes('shared_preload_libraries')) {
      logger.error('Failed to reset query statistics', { error });
    }
  }
}

