/**
 * Error Metrics React Query Hooks
 * React Query hooks for error monitoring
 *
 * @module entities/error-metrics/api
 * @version 1.0.0
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllErrorMetrics,
  getErrorRatesByClass,
  getErrorTrends,
  getErrorHealthCheck,
  resetErrorMetrics,
} from "./errorMetricsApi";
import type {
  AllErrorMetrics,
  ErrorRatesByClass,
  ErrorHealthCheck,
} from "../model/types";

/**
 * Query keys
 */
export const errorMetricsKeys = {
  all: ["error-metrics"] as const,
  allMetrics: () => [...errorMetricsKeys.all, "all-metrics"] as const,
  byClass: () => [...errorMetricsKeys.all, "by-class"] as const,
  trends: () => [...errorMetricsKeys.all, "trends"] as const,
  health: () => [...errorMetricsKeys.all, "health"] as const,
} as const;

/**
 * Get all error metrics
 */
export function useErrorMetrics() {
  return useQuery({
    queryKey: errorMetricsKeys.allMetrics(),
    queryFn: getAllErrorMetrics,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: (failureCount, error) => {
      const err = error as { response?: { status?: number } };
      // Don't retry 401/403
      if (err.response?.status === 401 || err.response?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Get error rates by class
 */
export function useErrorRatesByClass() {
  return useQuery({
    queryKey: errorMetricsKeys.byClass(),
    queryFn: getErrorRatesByClass,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    retry: (failureCount, error) => {
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 401 || err.response?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Get error trends
 */
export function useErrorTrends() {
  return useQuery({
    queryKey: errorMetricsKeys.trends(),
    queryFn: getErrorTrends,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    retry: (failureCount, error) => {
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 401 || err.response?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Get error health check
 */
export function useErrorHealthCheck() {
  return useQuery({
    queryKey: errorMetricsKeys.health(),
    queryFn: getErrorHealthCheck,
    staleTime: 10 * 1000, // 10 seconds (health checks should be fresh)
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    retry: (failureCount, error) => {
      const err = error as { response?: { status?: number } };
      // Health endpoint is public, but don't retry 503 (service unhealthy)
      if (err.response?.status === 503) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Reset error metrics mutation
 */
export function useResetErrorMetrics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resetErrorMetrics,
    onSuccess: () => {
      // Invalidate all error metrics queries
      queryClient.invalidateQueries({ queryKey: errorMetricsKeys.all });
    },
  });
}
