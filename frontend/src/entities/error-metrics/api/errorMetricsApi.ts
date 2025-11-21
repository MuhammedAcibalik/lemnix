/**
 * Error Metrics API Client
 * Backend API calls for error monitoring
 *
 * @module entities/error-metrics/api
 * @version 1.0.0
 */

import { api } from "@/shared";
import type {
  AllErrorMetrics,
  ErrorRatesByClass,
  ErrorHealthCheck,
  ErrorTrends,
} from "../model/types";

/**
 * API endpoints
 */
const ENDPOINTS = {
  ALL_METRICS: "/error-metrics",
  BY_CLASS: "/error-metrics/by-class",
  TRENDS: "/error-metrics/trends",
  HEALTH: "/error-metrics/health",
  RESET: "/error-metrics/reset",
} as const;

/**
 * Get all error metrics
 */
export async function getAllErrorMetrics(): Promise<AllErrorMetrics> {
  try {
    const response = await api.get<AllErrorMetrics>(ENDPOINTS.ALL_METRICS);
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { status?: number } };
    if (err.response?.status === 401 || err.response?.status === 403) {
      console.warn("Error metrics require authentication/permission");
    }
    // Return empty structure for graceful degradation
    return {
      timestamp: new Date().toISOString(),
      currentErrorRate: 0,
      trends: {
        trend: "stable",
        changePercent: 0,
        currentRate: 0,
        previousRate: 0,
      },
      distribution: {
        byClass: {
          CLIENT: 0,
          BUSINESS: 0,
          INTEGRATION: 0,
          SYSTEM: 0,
        },
        bySeverity: {
          LOW: 0,
          MEDIUM: 0,
          HIGH: 0,
          CRITICAL: 0,
        },
        byEndpoint: {},
      },
      detailedMetrics: [],
    };
  }
}

/**
 * Get error rates by class
 */
export async function getErrorRatesByClass(): Promise<ErrorRatesByClass> {
  try {
    const response = await api.get<ErrorRatesByClass>(ENDPOINTS.BY_CLASS);
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { status?: number } };
    if (err.response?.status === 401 || err.response?.status === 403) {
      console.warn("Error rates by class require authentication/permission");
    }
    return {
      timestamp: new Date().toISOString(),
      errorRatesByClass: {
        CLIENT: 0,
        BUSINESS: 0,
        INTEGRATION: 0,
        SYSTEM: 0,
      },
      sloThresholds: {
        CLIENT: 5,
        BUSINESS: 2,
        INTEGRATION: 1,
        SYSTEM: 0.5,
      },
    };
  }
}

/**
 * Get error trends
 */
export async function getErrorTrends(): Promise<
  ErrorTrends & {
    readonly distribution: {
      readonly byClass: Record<string, number>;
      readonly bySeverity: Record<string, number>;
    };
    readonly alerts: {
      readonly highErrorRate: boolean;
      readonly increasingTrend: boolean;
      readonly criticalErrors: number;
    };
  }
> {
  try {
    const response = await api.get<
      ErrorTrends & {
        readonly distribution: {
          readonly byClass: Record<string, number>;
          readonly bySeverity: Record<string, number>;
        };
        readonly alerts: {
          readonly highErrorRate: boolean;
          readonly increasingTrend: boolean;
          readonly criticalErrors: number;
        };
      }
    >(ENDPOINTS.TRENDS);
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { status?: number } };
    if (err.response?.status === 401 || err.response?.status === 403) {
      console.warn("Error trends require authentication/permission");
    }
    return {
      trend: "stable",
      changePercent: 0,
      currentRate: 0,
      previousRate: 0,
      distribution: {
        byClass: {},
        bySeverity: {},
      },
      alerts: {
        highErrorRate: false,
        increasingTrend: false,
        criticalErrors: 0,
      },
    };
  }
}

/**
 * Get error health check
 */
export async function getErrorHealthCheck(): Promise<ErrorHealthCheck> {
  try {
    const response = await api.get<ErrorHealthCheck>(ENDPOINTS.HEALTH);
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { status?: number } };
    // Health endpoint is public (no auth required)
    if (err.response?.status === 503) {
      // Service unhealthy
      return {
        timestamp: new Date().toISOString(),
        status: "critical",
        currentErrorRate: 0,
        trend: "stable",
        issues: ["Service unavailable"],
        summary: {
          totalErrors: 0,
          criticalErrors: 0,
          systemErrors: 0,
          integrationErrors: 0,
        },
      };
    }
    return {
      timestamp: new Date().toISOString(),
      status: "healthy",
      currentErrorRate: 0,
      trend: "stable",
      issues: [],
      summary: {
        totalErrors: 0,
        criticalErrors: 0,
        systemErrors: 0,
        integrationErrors: 0,
      },
    };
  }
}

/**
 * Reset error metrics (admin only)
 */
export async function resetErrorMetrics(): Promise<{
  readonly timestamp: string;
  readonly message: string;
}> {
  const response = await api.post<{
    readonly timestamp: string;
    readonly message: string;
  }>(ENDPOINTS.RESET);
  return response.data;
}
