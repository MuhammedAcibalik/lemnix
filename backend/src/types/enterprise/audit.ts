/**
 * Enterprise Audit Types
 * 
 * @module enterprise/types
 * @version 1.0.0
 */

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  readonly timestamp: Date;
  readonly userId?: string;
  readonly action: string;
  readonly details: Record<string, unknown>;
  readonly ipAddress?: string;
  readonly userAgent?: string;
}

/**
 * Audit action types
 */
export type AuditAction =
  | 'optimization_started'
  | 'optimization_completed'
  | 'optimization_failed'
  | 'export_requested'
  | 'export_completed'
  | 'metrics_accessed'
  | 'analytics_generated'
  | 'health_check_performed'
  | 'algorithm_compared'
  | 'history_accessed';

/**
 * Audit severity levels
 */
export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';

/**
 * Extended audit log entry with severity
 */
export interface ExtendedAuditLogEntry extends AuditLogEntry {
  readonly severity: AuditSeverity;
  readonly duration?: number;
  readonly outcome: 'success' | 'failure';
  readonly errorMessage?: string;
}

