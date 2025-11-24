/**
 * @fileoverview Database Configuration
 * @module DatabaseConfig
 * @version 1.0.0
 */

import { PrismaClient } from "@prisma/client";
import { logger } from "../services/logger";
import { queryPerformanceMonitor } from "../services/monitoring/QueryPerformanceMonitor";

// Prisma Client Singleton with connection pooling support
const prismaClientSingleton = () => {
  // Parse connection pool settings from DATABASE_URL or use defaults
  const connectionLimit = process.env.DATABASE_CONNECTION_LIMIT
    ? parseInt(process.env.DATABASE_CONNECTION_LIMIT, 10)
    : 20;
  const poolTimeout = process.env.DATABASE_POOL_TIMEOUT
    ? parseInt(process.env.DATABASE_POOL_TIMEOUT, 10)
    : 30;

  // Transaction timeout (default: 5 seconds)
  const transactionTimeout = process.env.DATABASE_TRANSACTION_TIMEOUT
    ? parseInt(process.env.DATABASE_TRANSACTION_TIMEOUT, 10)
    : 5000;

  return new PrismaClient({
    log: [
      {
        emit: "event",
        level: "query",
      },
      {
        emit: "event",
        level: "error",
      },
      {
        emit: "event",
        level: "info",
      },
      {
        emit: "event",
        level: "warn",
      },
    ],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Connection pool configuration
    // Note: Prisma uses connection pooling via PgBouncer
    // These settings are documented for reference
    // Actual pool size is controlled by PgBouncer configuration
    // Connection limit: ${connectionLimit}
    // Pool timeout: ${poolTimeout}s
    // Transaction timeout: ${transactionTimeout}ms
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

// Prisma Client instance with hot-reload support
export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

// Database connection event handlers
prisma.$on(
  "query",
  (e: { query: string; params: string; duration: number; target: string }) => {
    // Record query performance metrics
    queryPerformanceMonitor.recordQuery({
      query: e.query,
      duration: e.duration,
      params: e.params,
    });

    // Log in development or if slow (threshold: 200ms for production)
    const slowQueryThreshold = process.env.DATABASE_SLOW_QUERY_THRESHOLD_MS
      ? parseInt(process.env.DATABASE_SLOW_QUERY_THRESHOLD_MS, 10)
      : 200;

    if (
      process.env["NODE_ENV"] === "development" ||
      e.duration > slowQueryThreshold
    ) {
      logger.debug("Database Query:", {
        query: e.query.substring(0, 500),
        params: e.params,
        duration: `${e.duration}ms`,
        timestamp: new Date().toISOString(),
        level:
          e.duration > 1000
            ? "CRITICAL"
            : e.duration > 500
              ? "WARNING"
              : "INFO",
      });
    }
  },
);

prisma.$on("error", (e: { message: string; target: string }) => {
  // Ignore missing pg_stat_statements extension in dev - only affects slow-query monitoring
  if (e.message.includes("pg_stat_statements")) {
    logger.warn(
      "Database monitoring extension pg_stat_statements is not available - slow query monitoring disabled",
      {
        timestamp: new Date().toISOString(),
      },
    );
    return;
  }

  logger.error("Database Error:", {
    message: e.message,
    timestamp: new Date().toISOString(),
  });
});

prisma.$on("info", (e: { message: string; target: string }) => {
  logger.info("Database Info:", {
    message: e.message,
    timestamp: new Date().toISOString(),
  });
});

prisma.$on("warn", (e: { message: string; target: string }) => {
  logger.warn("Database Warning:", {
    message: e.message,
    timestamp: new Date().toISOString(),
  });
});

// Database connection management
export class DatabaseManager {
  private static instance: DatabaseManager;
  private isConnected = false;

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Connect to database
   */
  public async connect(): Promise<void> {
    try {
      await prisma.$connect();
      this.isConnected = true;
      logger.info("Database connected successfully");
    } catch (error) {
      // In local development we don't want the entire server to crash if the
      // database is not reachable (e.g. PostgreSQL service stopped). Log the
      // error and continue in degraded mode so that non-DB features still work.
      logger.error("Failed to connect to database:", error);
      this.isConnected = false;

      if (process.env.NODE_ENV === "development") {
        logger.warn(
          "Database is not reachable. Starting API in degraded mode without PostgreSQL.",
        );
      } else {
        // In non-development environments, rethrow to fail fast.
        throw error;
      }
    }
  }

  /**
   * Disconnect from database
   */
  public async disconnect(): Promise<void> {
    try {
      await prisma.$disconnect();
      this.isConnected = false;
      logger.info("Database disconnected successfully");
    } catch (error) {
      logger.error("Failed to disconnect from database:", error);
      throw error;
    }
  }

  /**
   * Check database connection
   */
  public async healthCheck(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error("Database health check failed:", error);
      return false;
    }
  }

  /**
   * Get connection status
   */
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Get database connection pool statistics
   * Note: Actual pool stats require pg_stat_activity query
   */
  public async getPoolStats(): Promise<{
    isConnected: boolean;
    connectionLimit?: number;
    poolTimeout?: number;
  }> {
    return {
      isConnected: this.isConnected,
      connectionLimit: process.env.DATABASE_CONNECTION_LIMIT
        ? parseInt(process.env.DATABASE_CONNECTION_LIMIT, 10)
        : undefined,
      poolTimeout: process.env.DATABASE_POOL_TIMEOUT
        ? parseInt(process.env.DATABASE_POOL_TIMEOUT, 10)
        : undefined,
    };
  }

  /**
   * Initialize database
   */
  public async initialize(): Promise<void> {
    try {
      // Database initialization without mock data
      logger.info("Database initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize database:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const databaseManager = DatabaseManager.getInstance();

// Graceful shutdown
process.on("beforeExit", async () => {
  await databaseManager.disconnect();
});

process.on("SIGINT", async () => {
  await databaseManager.disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await databaseManager.disconnect();
  process.exit(0);
});
