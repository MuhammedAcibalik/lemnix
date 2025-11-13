/**
 * Query Performance Monitoring Middleware
 *
 * Monitors slow queries using pg_stat_statements extension
 * Logs queries that exceed performance thresholds
 */

import { prisma } from "../config/database";
import { logger } from "../services/logger";

let hasLoggedMonitoringSkip = false;

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
      logger.warn("Slow queries detected", {
        count: slowQueries.length,
        queries: slowQueries.map((q) => ({
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
    if (
      error instanceof Error &&
      !error.message.includes("pg_stat_statements") &&
      !error.message.includes("shared_preload_libraries")
    ) {
      logger.error("Failed to fetch slow queries", { error });
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

    const [cacheStats] = await prisma.$queryRaw<
      Array<{
        blks_hit: bigint;
        blks_read: bigint;
      }>
    >`
      SELECT 
        sum(blks_hit) as blks_hit,
        sum(blks_read) as blks_read
      FROM pg_stat_database;
    `;

    const cacheHitRatio = cacheStats
      ? Number(cacheStats.blks_hit) /
        (Number(cacheStats.blks_hit) + Number(cacheStats.blks_read))
      : 0;

    return {
      connections: connectionStats?.count || 0,
      cacheHitRatio: cacheHitRatio * 100,
      transactionsPerSecond: 0, // Can be calculated from pg_stat_database xact_commit/xact_rollback
    };
  } catch (error) {
    logger.error("Failed to get database stats", { error });
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
function logMonitoringSkip(reason: string): void {
  if (!hasLoggedMonitoringSkip) {
    logger.info("Query monitoring skipped", { reason });
    hasLoggedMonitoringSkip = true;
  }
}

function isPostgresDatabase(databaseUrl: string | undefined): boolean {
  if (!databaseUrl) {
    return false;
  }

  try {
    const parsedUrl = new URL(databaseUrl);
    return (
      parsedUrl.protocol === "postgres:" || parsedUrl.protocol === "postgresql:"
    );
  } catch (error) {
    logger.debug("Failed to parse DATABASE_URL for query monitoring", {
      error,
    });
    return false;
  }
}

async function hasPgStatStatementsExtension(): Promise<boolean> {
  try {
    const [result] = await prisma.$queryRaw<Array<{ enabled: boolean }>>`
      SELECT EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements'
      ) as enabled;
    `;

    return Boolean(result?.enabled);
  } catch (error) {
    logger.debug("Failed to verify pg_stat_statements availability", { error });
    return false;
  }
}

function isQueryMonitoringExplicitlyDisabled(): boolean {
  const flag = process.env.ENABLE_QUERY_MONITORING;
  if (!flag) {
    return false;
  }

  return ["false", "0", "off"].includes(flag.toLowerCase());
}

export async function startQueryMonitoring(): Promise<boolean> {
  if (isQueryMonitoringExplicitlyDisabled()) {
    logMonitoringSkip("disabled via ENABLE_QUERY_MONITORING environment flag");
    return false;
  }

  if (!isPostgresDatabase(process.env.DATABASE_URL)) {
    logMonitoringSkip("non-PostgreSQL database detected");
    return false;
  }

  if (!(await hasPgStatStatementsExtension())) {
    logMonitoringSkip("pg_stat_statements extension is not available");
    return false;
  }

  await logSlowQueries();

  setInterval(
    () => {
      void logSlowQueries();
    },
    5 * 60 * 1000,
  );

  logger.info("Query monitoring started (interval: 5 minutes)");
  return true;
}

/**
 * Reset pg_stat_statements
 * Use with caution - only in development
 */
export async function resetQueryStats(): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    logger.warn("Cannot reset query stats in production");
    return;
  }

  try {
    await prisma.$queryRaw`SELECT pg_stat_statements_reset();`;
    logger.info("Query statistics reset successfully");
  } catch (error) {
    // Silently fail if extension not available
    if (
      error instanceof Error &&
      !error.message.includes("pg_stat_statements") &&
      !error.message.includes("shared_preload_libraries")
    ) {
      logger.error("Failed to reset query statistics", { error });
    }
  }
}
