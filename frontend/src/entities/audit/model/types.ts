/**
 * LEMNİX Audit Entity Types
 * Enterprise audit log domain types
 *
 * @module entities/audit/model
 * @version 1.0.0 - FSD Compliant
 * @description Aligned with backend audit types
 */

import type { ID, Timestamp } from "@/shared/types";

/**
 * Audit action types (aligned with backend)
 */
export type AuditAction =
  | "optimization_started"
  | "optimization_completed"
  | "optimization_failed"
  | "export_requested"
  | "export_completed"
  | "metrics_accessed"
  | "analytics_generated"
  | "health_check_performed"
  | "algorithm_compared"
  | "history_accessed";

/**
 * Audit severity levels
 */
export type AuditSeverity = "info" | "warning" | "error" | "critical";

/**
 * Audit outcome
 */
export type AuditOutcome = "success" | "failure";

/**
 * Base audit log entry (aligned with backend)
 */
export interface AuditLogEntry {
  readonly id: ID;
  readonly timestamp: Timestamp;
  readonly userId?: string;
  readonly action: AuditAction;
  readonly details: Record<string, unknown>;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly severity: AuditSeverity;
  readonly duration?: number; // milliseconds
  readonly outcome: AuditOutcome;
  readonly errorMessage?: string;
}

/**
 * Audit log query parameters
 */
export interface AuditLogQuery {
  readonly userId?: string;
  readonly action?: AuditAction;
  readonly severity?: AuditSeverity;
  readonly outcome?: AuditOutcome;
  readonly startDate?: string; // ISO date string
  readonly endDate?: string; // ISO date string
  readonly limit?: number;
  readonly offset?: number;
}

/**
 * Audit log response
 */
export interface AuditLogResponse {
  readonly logs: ReadonlyArray<AuditLogEntry>;
  readonly total: number;
  readonly hasMore: boolean;
}

/**
 * Audit statistics
 */
export interface AuditStatistics {
  readonly totalActions: number;
  readonly successRate: number;
  readonly averageDuration: number;
  readonly actionDistribution: Record<AuditAction, number>;
  readonly severityDistribution: Record<AuditSeverity, number>;
  readonly topUsers: ReadonlyArray<{
    readonly userId: string;
    readonly actionCount: number;
  }>;
  readonly recentErrors: ReadonlyArray<AuditLogEntry>;
}

/**
 * Audit action metadata (for UI display)
 */
export interface AuditActionMetadata {
  readonly action: AuditAction;
  readonly label: string;
  readonly icon: string;
  readonly color: string;
  readonly description: string;
}

/**
 * Audit action catalog - For UI display
 */
export const AUDIT_ACTION_CATALOG: Record<AuditAction, AuditActionMetadata> = {
  optimization_started: {
    action: "optimization_started",
    label: "Optimizasyon Başlatıldı",
    icon: "▶️",
    color: "#3b82f6",
    description: "Yeni optimizasyon işlemi başlatıldı",
  },
  optimization_completed: {
    action: "optimization_completed",
    label: "Optimizasyon Tamamlandı",
    icon: "✅",
    color: "#10b981",
    description: "Optimizasyon başarıyla tamamlandı",
  },
  optimization_failed: {
    action: "optimization_failed",
    label: "Optimizasyon Başarısız",
    icon: "❌",
    color: "#ef4444",
    description: "Optimizasyon işlemi başarısız oldu",
  },
  export_requested: {
    action: "export_requested",
    label: "Export İstendi",
    icon: "📥",
    color: "#8b5cf6",
    description: "Sonuç export işlemi başlatıldı",
  },
  export_completed: {
    action: "export_completed",
    label: "Export Tamamlandı",
    icon: "📦",
    color: "#10b981",
    description: "Export başarıyla oluşturuldu",
  },
  metrics_accessed: {
    action: "metrics_accessed",
    label: "Metrik Görüntülendi",
    icon: "📊",
    color: "#6366f1",
    description: "Sistem metrikleri görüntülendi",
  },
  analytics_generated: {
    action: "analytics_generated",
    label: "Analitik Oluşturuldu",
    icon: "📈",
    color: "#8b5cf6",
    description: "Analitik rapor oluşturuldu",
  },
  health_check_performed: {
    action: "health_check_performed",
    label: "Sistem Kontrolü",
    icon: "🏥",
    color: "#14b8a6",
    description: "Sistem sağlık kontrolü yapıldı",
  },
  algorithm_compared: {
    action: "algorithm_compared",
    label: "Algoritma Karşılaştırması",
    icon: "⚖️",
    color: "#f59e0b",
    description: "Algoritmalar karşılaştırıldı",
  },
  history_accessed: {
    action: "history_accessed",
    label: "Geçmiş Görüntülendi",
    icon: "📜",
    color: "#64748b",
    description: "Optimizasyon geçmişi görüntülendi",
  },
} as const;

/**
 * Severity metadata
 */
export interface SeverityMetadata {
  readonly severity: AuditSeverity;
  readonly label: string;
  readonly color: string;
  readonly icon: string;
}

export const SEVERITY_CATALOG: Record<AuditSeverity, SeverityMetadata> = {
  info: {
    severity: "info",
    label: "Bilgi",
    color: "#3b82f6",
    icon: "ℹ️",
  },
  warning: {
    severity: "warning",
    label: "Uyarı",
    color: "#f59e0b",
    icon: "⚠️",
  },
  error: {
    severity: "error",
    label: "Hata",
    color: "#ef4444",
    icon: "❌",
  },
  critical: {
    severity: "critical",
    label: "Kritik",
    color: "#dc2626",
    icon: "🔥",
  },
} as const;
