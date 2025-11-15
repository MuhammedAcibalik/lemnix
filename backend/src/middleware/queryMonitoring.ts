/**
 * Query Performance Monitoring Middleware
 *
 * Monitors slow queries using pg_stat_statements extension
 * Logs queries that exceed performance thresholds
 */

import { env } from "../config/env";
import { prisma } from "../config/database";
import { logger } from "../services/logger";

interface SlowQuery {
  readonly query: string;
  readonly mean_exec_time: number;
  readonly calls: number;
  readonly total_exec_time: number;
  readonly stddev_exec_time: number;
}

const POSTGRES_SCHEMES = ["postgresql://", "postgres://"] as const;

type QueryMonitoringDisabledReason =
  | "datasource_not_postgres"
  | "feature_flag_disabled";

type QueryMonitoringStatusInternal =
  | { enabled: true }
  | {
      enabled: false;
      reason: QueryMonitoringDisabledReason;
      message: string;
    };

const disabledReasonMessages: Record<QueryMonitoringDisabledReason, string> = {
  datasource_not_postgres:
    "configured datasource is not PostgreSQL; pg_stat_statements monitoring is unsupported",
  feature_flag_disabled:
    "query monitoring feature flag is disabled; set ENABLE_QUERY_MONITORING=true when pg_stat_statements is available",
};

function evaluateQueryMonitoringStatus(): QueryMonitoringStatusInternal {
  const datasource = env.DATABASE_URL.toLowerCase();
  const isPostgresDatasource = POSTGRES_SCHEMES.some((scheme) =>
    datasource.startsWith(scheme),
  );

  if (!isPostgresDatasource) {
    return {
      enabled: false,
      reason: "datasource_not_postgres",
      message: disabledReasonMessages.datasource_not_postgres,
    };
  }

  if (!env.ENABLE_QUERY_MONITORING) {
    return {
      enabled: false,
      reason: "feature_flag_disabled",
      message: disabledReasonMessages.feature_flag_disabled,
    };
  }

  return { enabled: true };
}

const queryMonitoringStatus = evaluateQueryMonitoringStatus();

function shouldRunMonitoring(context: string): boolean {
  if (queryMonitoringStatus.enabled) {
    return true;
  }

  logger.debug(`Skipping ${context}: ${queryMonitoringStatus.message}`);
  return false;
}

export function isQueryMonitoringEnabled(): boolean {
  return queryMonitoringStatus.enabled;
}

export function getQueryMonitoringStatus(): {
  enabled: boolean;
  reason?: string;
} {
  if (queryMonitoringStatus.enabled) {
    return { enabled: true };
  }

  return {
    enabled: false,
    reason: queryMonitoringStatus.message,
  };
}

/**
 * Log slow queries from pg_stat_statements
 * Queries with mean execution time > 100ms are logged
 */
export async function logSlowQueries(): Promise<void> {
  if (!shouldRunMonitoring("slow query logging")) {
    return;
  }

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
  if (!shouldRunMonitoring("database statistics sampling")) {
    return {
      connections: 0,
      cacheHitRatio: 0,
      transactionsPerSecond: 0,
    };
  }

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
export function startQueryMonitoring(): void {
  if (!shouldRunMonitoring("query monitoring bootstrap")) {
    return;
  }

  // Run immediately
  logSlowQueries();

  // Run every 5 minutes
  setInterval(logSlowQueries, 5 * 60 * 1000);

  logger.info("Query monitoring started (interval: 5 minutes)");
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

  if (!shouldRunMonitoring("query statistics reset")) {
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
