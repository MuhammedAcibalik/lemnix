/**
 * WebGPU React Hook
 *
 * @module shared/lib/webgpu
 * @version 1.0.0
 */

import { useQuery, useMutation } from "@tanstack/react-query";
import { getWebGPUStatus, initializeWebGPU, getWebGPUInfo } from "./api";

/**
 * Query keys for WebGPU
 */
export const webgpuKeys = {
  all: ["webgpu"] as const,
  status: () => [...webgpuKeys.all, "status"] as const,
  info: () => [...webgpuKeys.all, "info"] as const,
};

/**
 * Hook: Get WebGPU status
 */
export function useWebGPUStatus() {
  return useQuery({
    queryKey: webgpuKeys.status(),
    queryFn: getWebGPUStatus,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

/**
 * Hook: Initialize WebGPU
 */
export function useInitializeWebGPU() {
  return useMutation({
    mutationFn: initializeWebGPU,
  });
}

/**
 * Hook: Get WebGPU info
 */
export function useWebGPUInfo(enabled = false) {
  return useQuery({
    queryKey: webgpuKeys.info(),
    queryFn: getWebGPUInfo,
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Combined WebGPU hook
 */
export function useWebGPU() {
  const status = useWebGPUStatus();
  const initialize = useInitializeWebGPU();
  const info = useWebGPUInfo(status.data?.supported ?? false);

  return {
    status: status.data,
    isLoading: status.isLoading,
    isSupported: status.data?.supported ?? false,
    isInitialized: status.data?.initialized ?? false,
    info: info.data,
    initialize: initialize.mutate,
    isInitializing: initialize.isPending,
  } as const;
}
