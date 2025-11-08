/**
 * LEMNİX WebGPU Entity React Query Hooks
 * Type-safe React Query hooks for WebGPU operations
 * 
 * @module entities/webgpu/api
 * @version 1.0.0
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import {
  getWebGPUStatus,
  initializeWebGPU,
  runWebGPUOptimization,
  getWebGPUInfo,
  cleanupWebGPU,
} from './webgpuApi';
import type {
  WebGPUStatus,
  WebGPUInfo,
  WebGPUOptimizationRequest,
  WebGPUOptimizationResult,
} from '../model/types';

/**
 * Query keys for React Query
 */
export const webgpuKeys = {
  all: ['webgpu'] as const,
  status: () => [...webgpuKeys.all, 'status'] as const,
  info: () => [...webgpuKeys.all, 'info'] as const,
} as const;

/**
 * Hook: Get WebGPU status
 */
export function useWebGPUStatus(
  options?: UseQueryOptions<WebGPUStatus, Error>
) {
  return useQuery({
    queryKey: webgpuKeys.status(),
    queryFn: getWebGPUStatus,
    staleTime: 10 * 60 * 1000, // 10 minutes (rarely changes)
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1, // Only retry once for WebGPU checks
    ...options,
  });
}

/**
 * Hook: Get WebGPU device info
 */
export function useWebGPUInfo(
  options?: UseQueryOptions<WebGPUInfo, Error>
) {
  return useQuery({
    queryKey: webgpuKeys.info(),
    queryFn: getWebGPUInfo,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000,
    retry: 1,
    ...options,
  });
}

/**
 * Hook: Initialize WebGPU
 */
export function useInitializeWebGPU(
  options?: UseMutationOptions<WebGPUStatus, Error, void>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: initializeWebGPU,
    onSuccess: (data) => {
      // Update status cache
      queryClient.setQueryData(webgpuKeys.status(), data);
    },
    ...options,
  });
}

/**
 * Hook: Run WebGPU optimization
 */
export function useWebGPUOptimization(
  options?: UseMutationOptions<WebGPUOptimizationResult, Error, WebGPUOptimizationRequest>
) {
  return useMutation({
    mutationFn: runWebGPUOptimization,
    ...options,
  });
}

/**
 * Hook: Cleanup WebGPU resources
 */
export function useCleanupWebGPU(
  options?: UseMutationOptions<void, Error, void>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cleanupWebGPU,
    onSuccess: () => {
      // Invalidate status after cleanup
      queryClient.invalidateQueries({ queryKey: webgpuKeys.status() });
    },
    ...options,
  });
}

