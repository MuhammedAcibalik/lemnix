/**
 * LEMNİX Dashboard React Query Hooks
 * TanStack Query hooks for dashboard data fetching
 *
 * @module entities/dashboard/api
 * @version 1.0.0 - FSD Compliant
 */

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import {
  getDashboardData,
  getHeroMetrics,
  getOptimizationPerformance,
  getActiveOperations,
  getSmartInsights,
  getActivityTimeline,
} from "./dashboardApi";
import type {
  DashboardData,
  DashboardHeroMetrics,
  OptimizationPerformanceData,
  ActiveOperationsData,
  SmartInsightsData,
  ActivityTimelineData,
  DashboardMetricsOptions,
  ActivityFilter,
} from "../model/types";

/**
 * Query keys for dashboard
 */
export const dashboardKeys = {
  all: ["dashboard"] as const,
  data: (options?: DashboardMetricsOptions) =>
    ["dashboard", "data", options] as const,
  heroMetrics: (options?: DashboardMetricsOptions) =>
    ["dashboard", "hero-metrics", options] as const,
  performance: (options?: DashboardMetricsOptions) =>
    ["dashboard", "performance", options] as const,
  activeOperations: () => ["dashboard", "active-operations"] as const,
  insights: (options?: DashboardMetricsOptions) =>
    ["dashboard", "insights", options] as const,
  timeline: (filter?: ActivityFilter) =>
    ["dashboard", "timeline", filter] as const,
} as const;

/**
 * Hook to fetch complete dashboard data
 */
export function useDashboardData(
  options?: DashboardMetricsOptions,
): UseQueryResult<DashboardData, Error> {
  return useQuery({
    queryKey: dashboardKeys.data(options),
    queryFn: () => getDashboardData(options),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch hero metrics only (lightweight)
 */
export function useHeroMetrics(
  options?: DashboardMetricsOptions,
): UseQueryResult<DashboardHeroMetrics, Error> {
  return useQuery({
    queryKey: dashboardKeys.heroMetrics(options),
    queryFn: () => getHeroMetrics(options),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch optimization performance data
 */
export function useOptimizationPerformance(
  options?: DashboardMetricsOptions,
): UseQueryResult<OptimizationPerformanceData, Error> {
  return useQuery({
    queryKey: dashboardKeys.performance(options),
    queryFn: () => getOptimizationPerformance(options),
    staleTime: 5 * 60 * 1000, // 5 minutes (less frequently updated)
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch active operations (real-time updates)
 */
export function useActiveOperations(): UseQueryResult<
  ActiveOperationsData,
  Error
> {
  return useQuery({
    queryKey: dashboardKeys.activeOperations(),
    queryFn: getActiveOperations,
    staleTime: 5 * 1000, // 5 seconds (near real-time)
    refetchInterval: 10 * 1000, // Poll every 10 seconds
    gcTime: 30 * 1000, // 30 seconds
    retry: 3,
  });
}

/**
 * Hook to fetch smart insights
 */
export function useSmartInsights(
  options?: DashboardMetricsOptions,
): UseQueryResult<SmartInsightsData, Error> {
  return useQuery({
    queryKey: dashboardKeys.insights(options),
    queryFn: () => getSmartInsights(options),
    staleTime: 10 * 60 * 1000, // 10 minutes (insights change slowly)
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch activity timeline
 */
export function useActivityTimeline(
  filter?: ActivityFilter,
): UseQueryResult<ActivityTimelineData, Error> {
  return useQuery({
    queryKey: dashboardKeys.timeline(filter),
    queryFn: () => getActivityTimeline(filter),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refresh every minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    enabled: true, // Always enabled
  });
}
