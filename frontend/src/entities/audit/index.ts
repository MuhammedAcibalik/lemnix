/**
 * LEMNİX Audit Entity - Public API
 *
 * @module entities/audit
 * @version 1.0.0 - Enterprise Audit Feature
 */

// ============================================================================
// TYPES
// ============================================================================

export type {
  AuditAction,
  AuditSeverity,
  AuditOutcome,
  AuditLogEntry,
  AuditLogQuery,
  AuditLogResponse,
  AuditStatistics,
  AuditActionMetadata,
  SeverityMetadata,
} from "./model/types";

export { AUDIT_ACTION_CATALOG, SEVERITY_CATALOG } from "./model/types";

// ============================================================================
// API (React Query Hooks - Recommended)
// ============================================================================

export {
  auditKeys,
  useAuditLogs,
  useAuditStatistics,
} from "./api/auditQueries";

// ============================================================================
// API (Raw Functions - For Advanced Use)
// ============================================================================

export {
  getAuditLogs,
  getAuditStatistics,
  exportAuditLogs,
} from "./api/auditApi";
