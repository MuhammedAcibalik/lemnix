/**
 * LEMNİX Optimization Entity React Query Hooks
 * Type-safe React Query hooks for optimization operations
 *
 * @module entities/optimization/api
 * @version 1.0.0 - FSD Compliant
 */

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import {
  runOptimization,
  getOptimizationHistory,
  getOptimizationMetrics,
  checkOptimizationHealth,
  exportOptimizationResult,
} from "./optimizationApi";
import type {
  OptimizationRequest,
  OptimizationResult,
  OptimizationHistoryEntry,
  ExportOptimizationRequest,
  ExportOptimizationResponse,
} from "../model/types";

/**
 * Query keys for React Query - Enhanced
 */
export const optimizationKeys = {
  all: ["optimization"] as const,
  history: () => [...optimizationKeys.all, "history"] as const,
  historyWithParams: (params?: Record<string, unknown>) =>
    [...optimizationKeys.history(), params] as const,
  metrics: () => [...optimizationKeys.all, "metrics"] as const,
  health: () => [...optimizationKeys.all, "health"] as const,
  // NEW: GA v1.7.1 keys
  algorithms: () => [...optimizationKeys.all, "algorithms"] as const,
  result: (id: string) => [...optimizationKeys.all, "result", id] as const,
  // NEW: P0-1 Algorithm Comparison
  comparison: (requestHash: string) =>
    [...optimizationKeys.all, "comparison", requestHash] as const,
};

/**
 * Hook: Run optimization
 *
 * @example
 * ```tsx
 * const { mutate, isPending } = useRunOptimization({
 *   onSuccess: (result) => {
 *     console.log('Optimization complete:', result);
 *   },
 * });
 *
 * mutate({
 *   items: [...],
 *   params: { algorithm: 'genetic', ... }
 * });
 * ```
 */
export function useRunOptimization(
  options?: UseMutationOptions<OptimizationResult, Error, OptimizationRequest>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: runOptimization,
    onSuccess: (data, variables, context) => {
      // Invalidate history and metrics after successful optimization
      queryClient.invalidateQueries({ queryKey: optimizationKeys.history() });
      queryClient.invalidateQueries({ queryKey: optimizationKeys.metrics() });

      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}

/**
 * Hook: Get optimization history
 *
 * @example
 * ```tsx
 * const { data: history, isLoading } = useOptimizationHistory({
 *   page: 1,
 *   pageSize: 20,
 *   algorithm: 'genetic',
 * });
 * ```
 */
export function useOptimizationHistory(
  params?: {
    readonly page?: number;
    readonly pageSize?: number;
    readonly algorithm?: string;
  },
  options?: UseQueryOptions<ReadonlyArray<OptimizationHistoryEntry>, Error>,
) {
  return useQuery({
    queryKey: optimizationKeys.historyWithParams(params),
    queryFn: () => getOptimizationHistory(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

/**
 * Hook: Get optimization metrics
 *
 * @example
 * ```tsx
 * const { data: metrics, isLoading } = useOptimizationMetrics();
 *
 * console.log(`Average efficiency: ${metrics?.averageEfficiency}%`);
 * ```
 */
export function useOptimizationMetrics(
  options?: UseQueryOptions<
    {
      readonly totalOptimizations: number;
      readonly averageEfficiency: number;
      readonly averageWaste: number;
      readonly averageCost: number;
      readonly totalSavings: number;
    },
    Error
  >,
) {
  return useQuery({
    queryKey: optimizationKeys.metrics(),
    queryFn: getOptimizationMetrics,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook: Check optimization service health
 *
 * @example
 * ```tsx
 * const { data: health } = useOptimizationHealth({
 *   refetchInterval: 30000, // Check every 30s
 * });
 *
 * if (health?.status === 'unhealthy') {
 *   return <Alert>Service unavailable</Alert>;
 * }
 * ```
 */
export function useOptimizationHealth(
  options?: UseQueryOptions<
    {
      readonly status: "healthy" | "degraded" | "unhealthy";
      readonly details: Record<string, unknown>;
    },
    Error
  >,
) {
  return useQuery({
    queryKey: optimizationKeys.health(),
    queryFn: checkOptimizationHealth,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    ...options,
  });
}

// ⚠️ Unused hooks removed (useAvailableAlgorithms, useValidateOptimization, useOptimizationEstimate)
// These hooks were defined but never used in the codebase.
// If needed in the future, use the raw API functions directly:
// - getAvailableAlgorithms()
// - validateOptimizationRequest()
// - getOptimizationEstimate()

/**
 * Hook: Export optimization result
 * NEW: P0-3 Feature
 *
 * @example
 * ```tsx
 * const { mutate: exportResult, isPending } = useExportOptimization({
 *   onSuccess: (result) => {
 *     // Download file
 *     window.open(result.downloadUrl, '_blank');
 *   },
 * });
 *
 * exportResult({
 *   resultId: 'result-123',
 *   format: 'excel',
 *   options: { includeCharts: true }
 * });
 * ```
 */
export function useExportOptimization(
  options?: UseMutationOptions<
    ExportOptimizationResponse,
    Error,
    ExportOptimizationRequest
  >,
) {
  return useMutation({
    mutationFn: exportOptimizationResult,
    ...options,
  });
}

/**
 * ✅ P3-11: Hook for prefetching optimization results
 *
 * @example
 * ```tsx
 * const prefetch = usePrefetchOptimizationResult();
 *
 * return (
 *   <ListItem
 *     onMouseEnter={() => prefetch(item.id)}
 *   >
 *     {item.name}
 *   </ListItem>
 * );
 * ```
 */
export function usePrefetchOptimizationResult() {
  const queryClient = useQueryClient();

  return (id: string) => {
    // Only prefetch if not already in cache
    const existing = queryClient.getQueryData(optimizationKeys.result(id));
    if (existing) return;

    queryClient.prefetchQuery({
      queryKey: optimizationKeys.result(id),
      queryFn: async () => {
        const { getOptimizationResult } = await import("./optimizationApi");
        return getOptimizationResult(id);
      },
      staleTime: 5 * 60 * 1000,
    });
  };
}

/**
 * ✅ P3-11: Hook for prefetching optimization history
 */
export function usePrefetchOptimizationHistory() {
  const queryClient = useQueryClient();

  return (params?: Parameters<typeof getOptimizationHistory>[0]) => {
    queryClient.prefetchQuery({
      queryKey: optimizationKeys.historyWithParams(params),
      queryFn: () => getOptimizationHistory(params),
      staleTime: 2 * 60 * 1000,
    });
  };
}
