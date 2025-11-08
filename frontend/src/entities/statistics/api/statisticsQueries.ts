/**
 * Statistics Entity React Query Hooks
 * Type-safe React Query hooks for statistics operations
 * 
 * @module entities/statistics/api
 * @version 2.0.0 - Complete Statistics Integration (P2-2)
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import {
  getStatisticsOverview,
  getAlgorithmPerformance,
  getBatchStatistics,
  getUsageAnalytics,
  getProfileUsageStats,
  getCuttingListTrends,
  getOptimizationAnalytics,
  getWasteReductionTrends,
  getSystemHealthMetrics,
  getPerformanceMetrics,
  type StatisticsType,
  type BatchStatisticsResponse,
} from './statisticsApi';
import type {
  StatisticsOverview,
  AlgorithmPerformance,
  UsageAnalytics,
  ProfileUsageStats,
  CuttingListTrends,
  OptimizationAnalytics,
  WasteReductionTrends,
  SystemHealthMetrics,
  PerformanceMetrics,
} from '../model/types';

/**
 * Query keys for React Query - Complete coverage
 */
export const statisticsKeys = {
  all: ['statistics'] as const,
  overview: () => [...statisticsKeys.all, 'overview'] as const,
  algorithms: () => [...statisticsKeys.all, 'algorithms'] as const,
  batch: (types: ReadonlyArray<StatisticsType>) => 
    [...statisticsKeys.all, 'batch', ...types] as const,
  // NEW: P2-2 keys
  usage: (days?: number) => [...statisticsKeys.all, 'usage', days] as const,
  profileUsage: (limit?: number) => [...statisticsKeys.all, 'profileUsage', limit] as const,
  cuttingListTrends: (days?: number) => [...statisticsKeys.all, 'cuttingListTrends', days] as const,
  optimizationAnalytics: () => [...statisticsKeys.all, 'optimizationAnalytics'] as const,
  wasteReduction: () => [...statisticsKeys.all, 'wasteReduction'] as const,
  systemHealth: () => [...statisticsKeys.all, 'systemHealth'] as const,
  performance: () => [...statisticsKeys.all, 'performance'] as const,
} as const;

/**
 * Shared retry logic for statistics endpoints
 */
const statisticsRetryFn = (failureCount: number, error: unknown) => {
  // Don't retry 401/403
  const errorResponse = (error as { response?: { status?: number } })?.response;
  if (errorResponse?.status && [401, 403].includes(errorResponse.status)) {
    return false;
  }
  return failureCount < 3;
};

// ============================================================================
// EXISTING HOOKS
// ============================================================================

/**
 * Hook: Get statistics overview
 */
export function useStatisticsOverview(
  options?: UseQueryOptions<StatisticsOverview, Error>
) {
  return useQuery({
    queryKey: statisticsKeys.overview(),
    queryFn: getStatisticsOverview,
    staleTime: 5 * 60 * 1000,
    retry: statisticsRetryFn,
    ...options,
  });
}

/**
 * Hook: Get algorithm performance
 */
export function useAlgorithmPerformance(
  options?: UseQueryOptions<ReadonlyArray<AlgorithmPerformance>, Error>
) {
  return useQuery({
    queryKey: statisticsKeys.algorithms(),
    queryFn: getAlgorithmPerformance,
    staleTime: 5 * 60 * 1000,
    retry: statisticsRetryFn,
    ...options,
  });
}

/**
 * Hook: Get batch statistics (optimized)
 */
export function useBatchStatistics(
  types: ReadonlyArray<StatisticsType>,
  options?: UseQueryOptions<BatchStatisticsResponse, Error>
) {
  return useQuery({
    queryKey: statisticsKeys.batch(types),
    queryFn: () => getBatchStatistics(types),
    staleTime: 5 * 60 * 1000,
    enabled: types.length > 0,
    retry: statisticsRetryFn,
    ...options,
  });
}

// ============================================================================
// NEW HOOKS - P2-2
// ============================================================================

/**
 * Hook: Get usage analytics
 * ✅ P2-2: Usage statistics
 */
export function useUsageAnalytics(
  days: number = 30,
  options?: UseQueryOptions<UsageAnalytics, Error>
) {
  return useQuery({
    queryKey: statisticsKeys.usage(days),
    queryFn: () => getUsageAnalytics(days),
    staleTime: 5 * 60 * 1000,
    retry: statisticsRetryFn,
    ...options,
  });
}

/**
 * Hook: Get profile usage statistics
 * ✅ P2-2: Profile usage
 */
export function useProfileUsageStats(
  limit: number = 50,
  options?: UseQueryOptions<ReadonlyArray<ProfileUsageStats>, Error>
) {
  return useQuery({
    queryKey: statisticsKeys.profileUsage(limit),
    queryFn: () => getProfileUsageStats(limit),
    staleTime: 5 * 60 * 1000,
    retry: statisticsRetryFn,
    ...options,
  });
}

/**
 * Hook: Get cutting list trends
 * ✅ P2-2: Cutting list trends
 */
export function useCuttingListTrends(
  days: number = 30,
  options?: UseQueryOptions<CuttingListTrends, Error>
) {
  return useQuery({
    queryKey: statisticsKeys.cuttingListTrends(days),
    queryFn: () => getCuttingListTrends(days),
    staleTime: 5 * 60 * 1000,
    retry: statisticsRetryFn,
    ...options,
  });
}

/**
 * Hook: Get optimization analytics
 * ✅ P2-2: Optimization analytics
 */
export function useOptimizationAnalytics(
  options?: UseQueryOptions<OptimizationAnalytics, Error>
) {
  return useQuery({
    queryKey: statisticsKeys.optimizationAnalytics(),
    queryFn: getOptimizationAnalytics,
    staleTime: 5 * 60 * 1000,
    retry: statisticsRetryFn,
    ...options,
  });
}

/**
 * Hook: Get waste reduction trends
 * ✅ P2-2: Waste reduction trends
 */
export function useWasteReductionTrends(
  options?: UseQueryOptions<WasteReductionTrends, Error>
) {
  return useQuery({
    queryKey: statisticsKeys.wasteReduction(),
    queryFn: getWasteReductionTrends,
    staleTime: 5 * 60 * 1000,
    retry: statisticsRetryFn,
    ...options,
  });
}

/**
 * Hook: Get system health metrics
 * ✅ P2-2: System health
 */
export function useSystemHealthMetrics(
  options?: UseQueryOptions<SystemHealthMetrics, Error>
) {
  return useQuery({
    queryKey: statisticsKeys.systemHealth(),
    queryFn: getSystemHealthMetrics,
    staleTime: 1 * 60 * 1000, // 1 minute (health changes frequently)
    refetchInterval: 60 * 1000, // Auto-refresh every minute
    retry: statisticsRetryFn,
    ...options,
  });
}

/**
 * Hook: Get performance metrics
 * ✅ P2-2: Performance metrics
 */
export function usePerformanceMetrics(
  options?: UseQueryOptions<PerformanceMetrics, Error>
) {
  return useQuery({
    queryKey: statisticsKeys.performance(),
    queryFn: getPerformanceMetrics,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: statisticsRetryFn,
    ...options,
  });
}
