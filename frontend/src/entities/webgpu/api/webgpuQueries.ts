/**
 * LEMNİX WebGPU Entity React Query Hooks
 * Type-safe React Query hooks for WebGPU operations
 *
 * @module entities/webgpu/api
 * @version 1.0.0
 */

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { getWebGPUStatus } from "./webgpuApi";
import type { WebGPUStatus } from "../model/types";

/**
 * Query keys for React Query
 */
export const webgpuKeys = {
  all: ["webgpu"] as const,
  status: () => [...webgpuKeys.all, "status"] as const,
} as const;

/**
 * Hook: Get WebGPU status
 * WebGPU operations run in browser, backend only provides status information
 */
export function useWebGPUStatus(
  options?: UseQueryOptions<WebGPUStatus, Error>,
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
