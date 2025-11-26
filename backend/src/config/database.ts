/**
 * @fileoverview Database Configuration
 * @module DatabaseConfig
 * @version 2.0.0
 * 
 * Enhanced database configuration with:
 * - Connection pool optimization
 * - SSL/TLS validation
 * - Connection retry logic
 * - Health monitoring
 */

import { PrismaClient, Prisma } from "@prisma/client";
import { logger } from "../services/logger";
import { queryPerformanceMonitor } from "../services/monitoring/QueryPerformanceMonitor";
import { createConnectionPoolMonitor } from "../services/database/ConnectionPoolMonitor";

/**
 * Parse and validate DATABASE_URL
 */
function parseAndValidateDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }
  
  // Validate URL format
  try {
    const url = new URL(databaseUrl);
    const params = new URLSearchParams(url.search);
    
    // Ensure SSL in production
    if (process.env.NODE_ENV === 'production') {
      const sslMode = params.get('sslmode');
      if (sslMode !== 'require' && sslMode !== 'prefer') {
        logger.warn('DATABASE_URL should use sslmode=require in production');
        params.set('sslmode', 'require');
        url.search = params.toString();
        return url.toString();
      }
    }
    
    // Set connection pool parameters if not present
    if (!params.has('connection_limit')) {
      const connectionLimit = process.env.DATABASE_CONNECTION_LIMIT
        ? parseInt(process.env.DATABASE_CONNECTION_LIMIT, 10)
        : process.env.NODE_ENV === 'production' ? 50 : 20;
      params.set('connection_limit', connectionLimit.toString());
    }
    
    if (!params.has('pool_timeout')) {
      const poolTimeout = process.env.DATABASE_POOL_TIMEOUT
        ? parseInt(process.env.DATABASE_POOL_TIMEOUT, 10)
        : 30;
      params.set('pool_timeout', poolTimeout.toString());
    }
    
    url.search = params.toString();
    return url.toString();
  } catch (error) {
    logger.error('Invalid DATABASE_URL format', { error });
    throw new Error('DATABASE_URL must be a valid PostgreSQL connection string');
  }
}

// Prisma Client Singleton with connection pooling support and soft delete extension
const prismaClientSingleton = () => {
  // Parse connection pool settings from DATABASE_URL or use defaults
  const connectionLimit = process.env.DATABASE_CONNECTION_LIMIT
    ? parseInt(process.env.DATABASE_CONNECTION_LIMIT, 10)
    : process.env.NODE_ENV === 'production' ? 50 : 20;
  const poolTimeout = process.env.DATABASE_POOL_TIMEOUT
    ? parseInt(process.env.DATABASE_POOL_TIMEOUT, 10)
    : 30;

  // Transaction timeout (default: 10 seconds for production, 5 for dev)
  const transactionTimeout = process.env.DATABASE_TRANSACTION_TIMEOUT
    ? parseInt(process.env.DATABASE_TRANSACTION_TIMEOUT, 10)
    : process.env.NODE_ENV === 'production' ? 10000 : 5000;

  // Parse and validate DATABASE_URL
  const validatedDatabaseUrl = parseAndValidateDatabaseUrl();

  logger.info('Initializing Prisma Client', {
    connectionLimit,
    poolTimeout,
    transactionTimeout,
    sslMode: new URL(validatedDatabaseUrl).searchParams.get('sslmode') || 'not set',
  });

  const client = new PrismaClient({
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
        url: validatedDatabaseUrl,
      },
    },
  });

  // Apply soft delete middleware
  // Models that support soft delete
  const softDeleteModels: string[] = [
    'user',
    'cuttingList',
    'cuttingListItem',
    'optimization',
    'userActivity',
    'productionPlan',
    'productionPlanItem',
    'cuttingListStatistics',
    'profileStockLength',
    'productMapping',
  ];

  client.$use(async (params, next) => {
    // Auto-filter deleted records in find operations
    if (params.model && softDeleteModels.includes(params.model)) {
      if (params.action === 'findMany' || params.action === 'findFirst') {
        params.args.where = {
          ...params.args.where,
          deletedAt: null,
        };
      } else if (params.action === 'findUnique') {
        // For findUnique, we can't modify where clause easily, so we filter after
        const result = await next(params);
        if (result && (result as { deletedAt: Date | null }).deletedAt !== null) {
          return null;
        }
        return result;
      } else if (params.action === 'delete') {
        // Convert delete to update with deletedAt
        params.action = 'update';
        const modelName = params.model as string;
        params.args.data = {
          deletedAt: new Date(),
          ...(modelName === 'user' ? { isActive: false } : {}),
        };
      } else if (params.action === 'deleteMany') {
        // Convert deleteMany to updateMany with deletedAt
        params.action = 'updateMany';
        const modelName = params.model as string;
        params.args.data = {
          deletedAt: new Date(),
          ...(modelName === 'user' ? { isActive: false } : {}),
        };
      }
    }

    return next(params);
  });

  return client;
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
  private poolMonitor: ReturnType<typeof createConnectionPoolMonitor> | null = null;

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Connect to database with retry logic
   */
  public async connect(): Promise<void> {
    const maxRetries = process.env.DATABASE_RETRY_ATTEMPTS
      ? parseInt(process.env.DATABASE_RETRY_ATTEMPTS, 10)
      : 3;
    const retryDelay = process.env.DATABASE_RETRY_DELAY
      ? parseInt(process.env.DATABASE_RETRY_DELAY, 10)
      : 1000;

    let lastError: unknown;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        await prisma.$connect();
        this.isConnected = true;
        logger.info("Database connected successfully", {
          attempt: attempt + 1,
          maxRetries,
        });
        
        // Start connection pool monitoring
        this.poolMonitor = createConnectionPoolMonitor(prisma);
        const monitoringInterval = process.env.DATABASE_POOL_MONITORING_INTERVAL
          ? parseInt(process.env.DATABASE_POOL_MONITORING_INTERVAL, 10)
          : 60000; // 1 minute default
        this.poolMonitor.startMonitoring(monitoringInterval);
        
        return;
      } catch (error) {
        lastError = error;
        logger.warn("Database connection attempt failed", {
          attempt: attempt + 1,
          maxRetries,
          error: error instanceof Error ? error.message : String(error),
        });

        if (attempt < maxRetries - 1) {
          const delay = retryDelay * (attempt + 1); // Exponential backoff
          logger.info(`Retrying connection in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    // All retry attempts failed
    logger.error("Failed to connect to database after all retry attempts", {
      attempts: maxRetries,
      error: lastError,
    });
    this.isConnected = false;

    if (process.env.NODE_ENV === "development") {
      logger.warn(
        "Database is not reachable. Starting API in degraded mode without PostgreSQL.",
      );
    } else {
      // In non-development environments, rethrow to fail fast.
      throw new Error(
        `Database connection failed after ${maxRetries} attempts: ${lastError instanceof Error ? lastError.message : String(lastError)}`
      );
    }
  }

  /**
   * Disconnect from database
   */
  public async disconnect(): Promise<void> {
    try {
      // Stop connection pool monitoring
      try {
        if (this.poolMonitor) {
          this.poolMonitor.stopMonitoring();
          this.poolMonitor = null;
        }
      } catch {
        // Ignore errors when stopping monitoring
      }
      
      await prisma.$disconnect();
      this.isConnected = false;
      logger.info("Database disconnected successfully");
    } catch (error) {
      logger.error("Failed to disconnect from database:", error);
      throw error;
    }
  }

  /**
   * Enhanced health check with diagnostics
   */
  public async healthCheck(): Promise<{
    healthy: boolean;
    latency?: number;
    details?: {
      connectionCount?: number;
      activeQueries?: number;
    };
  }> {
    const startTime = Date.now();
    
    try {
      await prisma.$queryRaw`SELECT 1`;
      const latency = Date.now() - startTime;
      
      // Get additional diagnostics if healthy
      let details: { connectionCount?: number; activeQueries?: number } = {};
      try {
        const [connectionResult, queryResult] = await Promise.all([
          prisma.$queryRaw<Array<{ count: bigint }>>`
            SELECT COUNT(*) as count
            FROM pg_stat_activity
            WHERE datname = current_database()
          `,
          prisma.$queryRaw<Array<{ count: bigint }>>`
            SELECT COUNT(*) as count
            FROM pg_stat_activity
            WHERE datname = current_database()
              AND state = 'active'
          `,
        ]);
        
        details = {
          connectionCount: Number(connectionResult[0]?.count || 0),
          activeQueries: Number(queryResult[0]?.count || 0),
        };
      } catch (diagError) {
        // Diagnostics are optional, don't fail health check
        logger.debug('Failed to get health check diagnostics', { error: diagError });
      }
      
      return {
        healthy: true,
        latency,
        details,
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      logger.error("Database health check failed:", { error, latency });
      return {
        healthy: false,
        latency,
      };
    }
  }

  /**
   * Get connection status
   */
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Get enhanced database connection pool statistics
   */
  public async getPoolStats(): Promise<{
    isConnected: boolean;
    connectionLimit: number;
    poolTimeout: number;
    transactionTimeout: number;
    diagnostics?: {
      connectionCount?: number;
      activeQueries?: number;
    };
  }> {
    const connectionLimit = process.env.DATABASE_CONNECTION_LIMIT
      ? parseInt(process.env.DATABASE_CONNECTION_LIMIT, 10)
      : process.env.NODE_ENV === 'production' ? 50 : 20;
    const poolTimeout = process.env.DATABASE_POOL_TIMEOUT
      ? parseInt(process.env.DATABASE_POOL_TIMEOUT, 10)
      : 30;
    const transactionTimeout = process.env.DATABASE_TRANSACTION_TIMEOUT
      ? parseInt(process.env.DATABASE_TRANSACTION_TIMEOUT, 10)
      : process.env.NODE_ENV === 'production' ? 10000 : 5000;

    // Get diagnostics if connected
    let diagnostics: { connectionCount?: number; activeQueries?: number } | undefined;
    if (this.isConnected) {
      try {
        const health = await this.healthCheck();
        diagnostics = health.details;
      } catch {
        // Ignore errors in diagnostics
      }
    }

    return {
      isConnected: this.isConnected,
      connectionLimit,
      poolTimeout,
      transactionTimeout,
      diagnostics,
    };
  }

  /**
   * Execute transaction with timeout
   */
  public async executeTransaction<T>(
    handler: (tx: Prisma.TransactionClient) => Promise<T>,
    options?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    },
  ): Promise<T> {
    const transactionTimeout = process.env.DATABASE_TRANSACTION_TIMEOUT
      ? parseInt(process.env.DATABASE_TRANSACTION_TIMEOUT, 10)
      : process.env.NODE_ENV === 'production' ? 10000 : 5000;

    return prisma.$transaction(handler, {
      maxWait: options?.maxWait || transactionTimeout,
      timeout: options?.timeout || transactionTimeout * 2,
      isolationLevel: options?.isolationLevel,
    });
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
