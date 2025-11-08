/**
 * Audit History Widget - Public API
 * 
 * @module widgets/audit-history
 * @version 1.0.0
 */

// Main widget component
export { AuditHistoryWidget } from './ui/AuditHistoryWidget';

// Sub-components (for advanced customization)
export { AuditFilterBar } from './ui/AuditFilterBar';
export { AuditTimelineView } from './ui/AuditTimelineView';
export { AuditStatisticsCard } from './ui/AuditStatisticsCard';

// Hooks
export { useAuditFilters } from './hooks/useAuditFilters';

// Types
export type {
  TimelineViewMode,
  AuditFilterState,
  SortField,
  SortOrder,
  AuditSortConfig,
  AuditViewPreferences,
  AuditExportOptions,
} from './types';

// Default export for lazy loading
export { AuditHistoryWidget as default } from './ui/AuditHistoryWidget';

