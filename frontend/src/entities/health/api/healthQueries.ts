/**
 * Health React Query Hooks
 * React Query hooks for health monitoring
 *
 * @module entities/health/api
 * @version 1.0.0
 */

import { useQuery } from "@tanstack/react-query";
import {
  getDatabaseHealth,
  getDeepHealthCheck,
  getSystemHealth,
  getQueryPerformanceMetrics,
  getCachePerformanceMetrics,
} from "./healthApi";

/**
 * Query keys
 */
export const healthKeys = {
  all: ["health"] as const,
  database: () => [...healthKeys.all, "database"] as const,
  deep: () => [...healthKeys.all, "deep"] as const,
  system: () => [...healthKeys.all, "system"] as const,
  queries: () => [...healthKeys.all, "queries"] as const,
  cache: () => [...healthKeys.all, "cache"] as const,
} as const;

/**
 * Get database health
 */
export function useDatabaseHealth() {
  return useQuery({
    queryKey: healthKeys.database(),
    queryFn: getDatabaseHealth,
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    retry: 2,
  });
}

/**
 * Get deep health check
 */
export function useDeepHealthCheck() {
  return useQuery({
    queryKey: healthKeys.deep(),
    queryFn: getDeepHealthCheck,
    staleTime: 10 * 1000,
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: 1, // Deep check is expensive, don't retry much
  });
}

/**
 * Get system health
 */
export function useSystemHealth() {
  return useQuery({
    queryKey: healthKeys.system(),
    queryFn: getSystemHealth,
    staleTime: 10 * 1000,
    refetchInterval: 30 * 1000,
    retry: 2,
  });
}

/**
 * Get query performance metrics
 */
export function useQueryPerformanceMetrics() {
  return useQuery({
    queryKey: healthKeys.queries(),
    queryFn: getQueryPerformanceMetrics,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    retry: 1,
  });
}

/**
 * Get cache performance metrics
 */
export function useCachePerformanceMetrics() {
  return useQuery({
    queryKey: healthKeys.cache(),
    queryFn: getCachePerformanceMetrics,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    retry: 1,
  });
}
