/**
 * EmptyState Component - Re-export from EmptyState folder
 * Displays friendly empty state with icon, message, and optional action
 */

// Re-export all components from EmptyState folder
export {
  EmptyStateV3 as EmptyState,
  NoDataEmptyState,
  SearchEmptyState,
  ErrorEmptyState,
  OfflineEmptyState,
} from "./EmptyState/EmptyState.js";
export type { EmptyStateV3Props as EmptyStateProps } from "./EmptyState/EmptyState.js";
