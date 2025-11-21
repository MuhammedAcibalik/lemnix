/**
 * Metrics React Query Hooks
 * React Query hooks for performance metrics
 *
 * @module entities/metrics/api
 * @version 1.0.0
 */

import { useQuery } from "@tanstack/react-query";
import { getWebVitalsSummary } from "./metricsApi";

/**
 * Query keys
 */
export const metricsKeys = {
  all: ["metrics"] as const,
  webVitalsSummary: () =>
    [...metricsKeys.all, "web-vitals", "summary"] as const,
} as const;

/**
 * Get Web Vitals summary
 */
export function useWebVitalsSummary() {
  return useQuery({
    queryKey: metricsKeys.webVitalsSummary(),
    queryFn: getWebVitalsSummary,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    retry: 1,
  });
}
