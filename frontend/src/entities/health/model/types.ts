/**
 * Health Entity Types
 * Types for system health monitoring
 *
 * @module entities/health/model
 * @version 1.0.0
 */

/**
 * Database health check
 */
export interface DatabaseHealth {
  readonly healthy: boolean;
  readonly database: string;
  readonly version: string;
  readonly connections: number;
  readonly cacheHitRatio: string;
  readonly status: "connected" | "disconnected";
}

/**
 * Deep health check
 */
export interface DeepHealthCheck {
  readonly status: "healthy" | "degraded" | "unhealthy";
  readonly checks: {
    readonly database: boolean;
    readonly write: boolean;
    readonly read: boolean;
    readonly cache: boolean;
  };
  readonly cache: {
    readonly hitRate: number;
    readonly missRate: number;
    readonly size: number;
  };
  readonly timestamp: string;
}

/**
 * System health overview
 */
export interface SystemHealth {
  readonly status: "healthy";
  readonly uptime: number;
  readonly memory: {
    readonly used: number; // MB
    readonly total: number; // MB
    readonly unit: string;
  };
  readonly database: {
    readonly healthy: boolean;
    readonly connections: number;
    readonly cacheHitRatio: number;
  };
  readonly timestamp: string;
}

/**
 * Query performance metrics
 */
export interface QueryPerformanceMetrics {
  readonly performance: {
    readonly totalQueries: number;
    readonly averageDuration: number;
    readonly p95Duration: number;
    readonly p99Duration: number;
    readonly slowQueries: number;
  };
  readonly slowQueries: readonly {
    readonly query: string;
    readonly duration: number;
    readonly timestamp: string;
  }[];
  readonly topPatterns: readonly {
    readonly signature: string;
    readonly count: number;
    readonly averageDuration: number;
  }[];
}

/**
 * Cache performance metrics
 */
export interface CachePerformanceMetrics {
  readonly cache: {
    readonly hitRate: number;
    readonly missRate: number;
    readonly size: number;
    readonly evictions: number;
  };
  readonly recommendation: string;
}
