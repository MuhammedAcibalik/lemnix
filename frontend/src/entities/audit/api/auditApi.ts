/**
 * LEMNİX Audit Entity API
 * Backend API calls for audit log operations
 *
 * @module entities/audit/api
 * @version 1.0.0 - Enterprise Audit Integration
 */

import { api } from "@/shared/api/client";
import type {
  AuditLogEntry,
  AuditLogQuery,
  AuditLogResponse,
  AuditStatistics,
} from "../model/types";

/**
 * API endpoints
 */
const ENDPOINTS = {
  AUDIT_TRAIL: "/enterprise/audit",
  AUDIT_STATISTICS: "/enterprise/audit/statistics", // Future endpoint
} as const;

/**
 * Get audit trail logs with filters
 *
 * @param query - Filter parameters
 * @returns Audit log response with pagination
 *
 * @example
 * ```typescript
 * const logs = await getAuditLogs({
 *   action: 'optimization_completed',
 *   limit: 50,
 *   startDate: '2025-01-01T00:00:00Z',
 * });
 * ```
 */
export async function getAuditLogs(
  query?: AuditLogQuery,
): Promise<AuditLogResponse> {
  try {
    const response = await api.get<AuditLogResponse>(ENDPOINTS.AUDIT_TRAIL, {
      params: query,
    });
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { status?: number } };

    if (err.response?.status === 401) {
      console.warn(
        "Audit trail requires authentication - returning empty data",
      );
    } else if (err.response?.status === 403) {
      console.warn("Audit trail access forbidden - insufficient permissions");
    } else {
      console.error("Failed to fetch audit logs:", error);
    }

    // Return empty structure
    return {
      logs: [],
      total: 0,
      hasMore: false,
    };
  }
}

/**
 * Get audit statistics (future enhancement)
 *
 * @returns Audit statistics summary
 */
export async function getAuditStatistics(): Promise<AuditStatistics> {
  try {
    const response = await api.get<AuditStatistics>(ENDPOINTS.AUDIT_STATISTICS);
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { status?: number } };

    if (err.response?.status === 401 || err.response?.status === 403) {
      console.warn("Audit statistics requires authentication/permission");
    } else if (err.response?.status === 404) {
      console.warn("Audit statistics endpoint not yet implemented");
    } else {
      console.error("Failed to fetch audit statistics:", error);
    }

    // Return empty statistics
    return {
      totalActions: 0,
      successRate: 0,
      averageDuration: 0,
      actionDistribution: {} as Record<string, number>,
      severityDistribution: {} as Record<string, number>,
      topUsers: [],
      recentErrors: [],
    };
  }
}

/**
 * Export audit logs (future enhancement)
 *
 * @param query - Filter parameters for export
 * @param format - Export format
 * @returns Download URL
 */
export async function exportAuditLogs(
  query: AuditLogQuery,
  format: "excel" | "csv" | "json",
): Promise<{ downloadUrl: string; filename: string }> {
  try {
    const response = await api.post<{ downloadUrl: string; filename: string }>(
      `${ENDPOINTS.AUDIT_TRAIL}/export`,
      { query, format },
    );
    return response.data;
  } catch (error) {
    console.error("Failed to export audit logs:", error);
    throw error;
  }
}
