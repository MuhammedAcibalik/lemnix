/**
 * WebGPU React Hook
 *
 * @module shared/lib/webgpu
 * @version 1.0.0
 */

import { useQuery } from "@tanstack/react-query";
import { getWebGPUStatus } from "./api";

/**
 * Query keys for WebGPU
 */
export const webgpuKeys = {
  all: ["webgpu"] as const,
  status: () => [...webgpuKeys.all, "status"] as const,
};

/**
 * Hook: Get WebGPU status
 * WebGPU operations run in browser, backend only provides status information
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
 * Combined WebGPU hook
 * WebGPU operations run in browser, backend only provides status information
 */
export function useWebGPU() {
  const status = useWebGPUStatus();

  return {
    status: status.data,
    isLoading: status.isLoading,
    isSupported: status.data?.supported ?? false,
    isInitialized: status.data?.initialized ?? false,
  } as const;
}
