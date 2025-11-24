/**
 * LEMNİX Audit Entity React Query Hooks
 * Type-safe React Query hooks for audit operations
 *
 * @module entities/audit/api
 * @version 1.0.0 - Enterprise Audit Integration
 */

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { getAuditLogs, getAuditStatistics } from "./auditApi";
import type {
  AuditLogQuery,
  AuditLogResponse,
  AuditStatistics,
} from "../model/types";

/**
 * Query keys for React Query
 */
export const auditKeys = {
  all: ["audit"] as const,
  logs: () => [...auditKeys.all, "logs"] as const,
  logsFiltered: (query?: AuditLogQuery) =>
    [...auditKeys.logs(), query] as const,
  statistics: () => [...auditKeys.all, "statistics"] as const,
} as const;

/**
 * Hook: Get audit logs with filters
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useAuditLogs({
 *   action: 'optimization_completed',
 *   limit: 50,
 *   startDate: '2025-01-01T00:00:00Z',
 * });
 *
 * console.log(`Total logs: ${data?.total}`);
 * ```
 */
export function useAuditLogs(
  query?: AuditLogQuery,
  options?: UseQueryOptions<AuditLogResponse, Error>,
) {
  return useQuery({
    queryKey: auditKeys.logsFiltered(query),
    queryFn: () => getAuditLogs(query),
    staleTime: 2 * 60 * 1000, // 2 minutes (audit logs are semi-static)
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      const err = error as { response?: { status?: number } };
      // Don't retry 401 (auth) or 403 (permission)
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
    ...options,
  });
}

/**
 * Hook: Get audit statistics
 *
 * @example
 * ```tsx
 * const { data: stats } = useAuditStatistics();
 *
 * console.log(`Success rate: ${stats?.successRate}%`);
 * console.log(`Average duration: ${stats?.averageDuration}ms`);
 * ```
 */
export function useAuditStatistics(
  options?: Omit<
    UseQueryOptions<AuditStatistics, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: auditKeys.statistics(),
    queryFn: getAuditStatistics,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      const err = error as { response?: { status?: number } };
      // Don't retry 401/403/404
      if (
        err?.response?.status &&
        [401, 403, 404].includes(err.response.status)
      ) {
        return false;
      }
      return failureCount < 3;
    },
    ...options,
  });
}
