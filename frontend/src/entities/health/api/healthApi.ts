/**
 * Health API Client
 * Backend API calls for health monitoring
 *
 * @module entities/health/api
 * @version 1.0.0
 */

import { api } from "@/shared";
import type {
  DatabaseHealth,
  DeepHealthCheck,
  SystemHealth,
  QueryPerformanceMetrics,
  CachePerformanceMetrics,
} from "../model/types";

/**
 * API endpoints
 */
const ENDPOINTS = {
  DATABASE: "/health/database",
  DEEP: "/health/deep",
  SYSTEM: "/health/system",
  QUERIES: "/health/queries",
  CACHE: "/health/cache",
} as const;

/**
 * Get database health
 */
export async function getDatabaseHealth(): Promise<DatabaseHealth> {
  try {
    const response = await api.get<{ success: boolean; data: DatabaseHealth }>(
      ENDPOINTS.DATABASE,
    );
    return response.data.data;
  } catch (error) {
    console.warn("Database health check failed:", error);
    return {
      healthy: false,
      database: "postgresql",
      version: "unknown",
      connections: 0,
      cacheHitRatio: "0%",
      status: "disconnected",
    };
  }
}

/**
 * Get deep health check
 */
export async function getDeepHealthCheck(): Promise<DeepHealthCheck> {
  try {
    const response = await api.get<{
      success: boolean;
      data: DeepHealthCheck;
    }>(ENDPOINTS.DEEP);
    return response.data.data;
  } catch (error) {
    console.warn("Deep health check failed:", error);
    return {
      status: "unhealthy",
      checks: {
        database: false,
        write: false,
        read: false,
        cache: false,
      },
      cache: {
        hitRate: 0,
        missRate: 0,
        size: 0,
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get system health
 */
export async function getSystemHealth(): Promise<SystemHealth> {
  try {
    const response = await api.get<{ success: boolean; data: SystemHealth }>(
      ENDPOINTS.SYSTEM,
    );
    return response.data.data;
  } catch (error) {
    console.warn("System health check failed:", error);
    return {
      status: "healthy",
      uptime: 0,
      memory: {
        used: 0,
        total: 0,
        unit: "MB",
      },
      database: {
        healthy: false,
        connections: 0,
        cacheHitRatio: 0,
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get query performance metrics
 */
export async function getQueryPerformanceMetrics(): Promise<QueryPerformanceMetrics> {
  try {
    const response = await api.get<{
      success: boolean;
      data: QueryPerformanceMetrics;
    }>(ENDPOINTS.QUERIES);
    return response.data.data;
  } catch (error) {
    console.warn("Query performance metrics failed:", error);
    return {
      performance: {
        totalQueries: 0,
        averageDuration: 0,
        p95Duration: 0,
        p99Duration: 0,
        slowQueries: 0,
      },
      slowQueries: [],
      topPatterns: [],
    };
  }
}

/**
 * Get cache performance metrics
 */
export async function getCachePerformanceMetrics(): Promise<CachePerformanceMetrics> {
  try {
    const response = await api.get<{
      success: boolean;
      data: CachePerformanceMetrics;
    }>(ENDPOINTS.CACHE);
    return response.data.data;
  } catch (error) {
    console.warn("Cache performance metrics failed:", error);
    return {
      cache: {
        hitRate: 0,
        missRate: 0,
        size: 0,
        evictions: 0,
      },
      recommendation: "Cache metrics unavailable",
    };
  }
}
