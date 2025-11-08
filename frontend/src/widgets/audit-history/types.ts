/**
 * Audit History Widget Types
 * 
 * @module widgets/audit-history
 * @version 1.0.0
 */

import type {
  AuditAction,
  AuditSeverity,
  AuditOutcome,
} from '@/entities/audit';

/**
 * Timeline view mode
 */
export type TimelineViewMode = 'compact' | 'detailed' | 'grouped';

/**
 * Filter state
 */
export interface AuditFilterState {
  readonly action: AuditAction | 'all';
  readonly severity: AuditSeverity | 'all';
  readonly outcome: AuditOutcome | 'all';
  readonly userId: string;
  readonly dateRange: {
    readonly startDate: string | null;
    readonly endDate: string | null;
  };
  readonly searchQuery: string;
}

/**
 * Sort configuration
 */
export type SortField = 'timestamp' | 'action' | 'severity' | 'duration';
export type SortOrder = 'asc' | 'desc';

export interface AuditSortConfig {
  readonly field: SortField;
  readonly order: SortOrder;
}

/**
 * View preferences
 */
export interface AuditViewPreferences {
  readonly viewMode: TimelineViewMode;
  readonly itemsPerPage: number;
  readonly showDetails: boolean;
  readonly groupByDate: boolean;
  readonly highlightErrors: boolean;
}

/**
 * Export options
 */
export interface AuditExportOptions {
  readonly format: 'excel' | 'csv' | 'json';
  readonly includeFilters: boolean;
  readonly includeStatistics: boolean;
  readonly filename?: string;
}

