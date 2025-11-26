/**
 * @fileoverview Type definitions for CuttingListSelector component
 * @module CuttingListSelectorTypes
 * @version 1.0.0
 */

import React from "react";
import {
  CuttingListData,
  CuttingListSection,
  CuttingListItem,
  ConversionResult as ServiceConversionResult,
} from "@/shared/lib/services/cuttingListOptimizationService";
import type { OptimizationItem } from "@/entities/optimization/model/types";

// Re-export CuttingListData for use in hooks
export type { CuttingListData };

// ============================================================================
// MAIN COMPONENT PROPS
// ============================================================================

export interface CuttingListSelectorProps {
  cuttingList: CuttingListData;
  onSelectionChange: (selectedItems: OptimizationItem[]) => void;
  onConversionComplete: (result: ServiceConversionResult) => void;
  isConverting?: boolean;
}

// ============================================================================
// SELECTION STATE TYPES
// ============================================================================

export interface SelectionState {
  products: { [productId: string]: ProductSelectionState };
  totalSelectedItems: number;
  totalSelectedProfiles: number;
  estimatedTotalLength: number;
}

export interface ProductSelectionState {
  selected: boolean;
  indeterminate: boolean;
  workOrders: { [workOrderId: string]: WorkOrderSelectionState };
}

export interface WorkOrderSelectionState {
  selected: boolean;
  indeterminate: boolean;
  profiles: { [profileId: string]: boolean };
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

export interface SearchControlsProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  totalItems: number;
  selectedItems: number;
}

export interface SelectionSummaryProps {
  selectionState: SelectionState;
  onClearSelection: () => void;
  onSelectAll: () => void;
  onConvertSelection: () => void;
  isConverting: boolean;
}

export interface ProductGroupSectionProps {
  product: {
    id: string;
    name: string;
    sections: CuttingListSection[];
  };
  selectionState: SelectionState;
  searchTerm: string;
  isExpanded: boolean;
  onToggleExpansion: (productId: string) => void;
  onProductSelectionChange: (productId: string, selected: boolean) => void;
  onWorkOrderSelectionChange: (
    productId: string,
    workOrderId: string,
    selected: boolean,
  ) => void;
  onProfileSelectionChange: (
    productId: string,
    workOrderId: string,
    profileId: string,
    selected: boolean,
  ) => void;
}

export interface WorkOrderSectionProps {
  workOrder: {
    id: string;
    name: string;
    profiles: Array<{
      id: string;
      type: string;
      items: CuttingListItem[];
    }>;
  };
  productId: string;
  selectionState: SelectionState;
  searchTerm: string;
  onWorkOrderSelectionChange: (
    productId: string,
    workOrderId: string,
    selected: boolean,
  ) => void;
  onProfileSelectionChange: (
    productId: string,
    workOrderId: string,
    profileId: string,
    selected: boolean,
  ) => void;
}

export interface ProfileGroupProps {
  profile: {
    id: string;
    type: string;
    items: CuttingListItem[];
  };
  productId: string;
  workOrderId: string;
  selectionState: SelectionState;
  searchTerm: string;
  onProfileSelectionChange: (
    productId: string,
    workOrderId: string,
    profileId: string,
    selected: boolean,
  ) => void;
}

export interface FilterControlsProps {
  filters: {
    showSelectedOnly: boolean;
    showWorkOrdersOnly: boolean;
    profileType: string;
  };
  onFilterChange: (filters: FilterControlsProps["filters"]) => void;
  availableProfileTypes: string[];
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface SelectionStats {
  totalItems: number;
  selectedItems: number;
  totalProfiles: number;
  selectedProfiles: number;
  estimatedLength: number;
  selectedLength: number;
}

export interface FilterState {
  showSelectedOnly: boolean;
  showWorkOrdersOnly: boolean;
  profileType: string;
  searchTerm: string;
}

export interface ExpandedState {
  products: { [productId: string]: boolean };
  workOrders: { [workOrderId: string]: boolean };
}

// ============================================================================
// EVENT HANDLER TYPES
// ============================================================================

export type SelectionChangeHandler = (
  productId: string,
  selected: boolean,
) => void;
export type WorkOrderSelectionHandler = (
  productId: string,
  workOrderId: string,
  selected: boolean,
) => void;
export type ProfileSelectionHandler = (
  productId: string,
  workOrderId: string,
  profileId: string,
  selected: boolean,
) => void;
export type ExpansionToggleHandler = (id: string) => void;
export type SearchChangeHandler = (term: string) => void;
export type FilterChangeHandler = (filters: FilterState) => void;
export type ConversionHandler = () => void;

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface SelectionValidation {
  minItems: number;
  maxItems: number;
  requiredProfiles: string[];
  excludedCombinations: Array<{
    profiles: string[];
    reason: string;
  }>;
}

// ============================================================================
// PERFORMANCE TYPES
// ============================================================================

export interface PerformanceMetrics {
  renderTime: number;
  selectionUpdateTime: number;
  searchTime: number;
  memoryUsage: number;
}

export interface OptimizationHints {
  suggestedSelections: string[];
  efficiencyTips: string[];
  costSavings: number;
  timeSavings: number;
}

// ============================================================================
// ACCESSIBILITY TYPES
// ============================================================================

export interface AccessibilityConfig {
  ariaLabels: {
    searchInput: string;
    selectAll: string;
    clearSelection: string;
    convertSelection: string;
    productGroup: string;
    workOrderGroup: string;
    profileGroup: string;
    selectionSummary: string;
  };
  keyboardShortcuts: {
    selectAll: string;
    clearSelection: string;
    search: string;
    expandAll: string;
    collapseAll: string;
  };
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export interface ExportOptions {
  format: "json" | "csv" | "excel";
  includeMetadata: boolean;
  includeStats: boolean;
  includeValidation: boolean;
}

export interface ExportResult {
  success: boolean;
  data?: string;
  filename?: string;
  error?: string;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
}

export interface SelectionAnalytics {
  selectionPatterns: {
    [pattern: string]: number;
  };
  popularCombinations: Array<{
    profiles: string[];
    frequency: number;
  }>;
  userBehavior: {
    averageSelectionTime: number;
    mostUsedFilters: string[];
    commonSearchTerms: string[];
  };
}

// ============================================================================
// STYLING TYPES
// ============================================================================

export interface StylingConstants {
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
  };
  borderRadius: {
    small: number;
    medium: number;
    large: number;
  };
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  transitions: {
    fast: string;
    normal: string;
    slow: string;
  };
}

// ============================================================================
// HOOK TYPES
// ============================================================================

export interface UseSelectionStateReturn {
  selectionState: SelectionState;
  updateSelection: (updates: Partial<SelectionState>) => void;
  resetSelection: () => void;
  validateSelection: () => ValidationResult;
  getSelectionStats: () => SelectionStats;
}

export interface UseFilterStateReturn {
  filters: FilterState;
  updateFilters: (updates: Partial<FilterState>) => void;
  resetFilters: () => void;
  applyFilters: (items: CuttingListItem[]) => CuttingListItem[];
}

export interface UseExpansionStateReturn {
  expandedState: ExpandedState;
  toggleExpansion: (type: "products" | "workOrders", id: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface CuttingListSelectorConfig {
  selection: {
    allowPartialSelection: boolean;
    maxSelections: number;
    minSelections: number;
    autoExpandOnSelection: boolean;
  };
  search: {
    debounceMs: number;
    minSearchLength: number;
    searchFields: string[];
  };
  performance: {
    virtualScrolling: boolean;
    lazyLoading: boolean;
    batchUpdates: boolean;
  };
  ui: {
    showProgressBars: boolean;
    showSelectionCounts: boolean;
    showEstimatedLength: boolean;
    compactMode: boolean;
  };
}
