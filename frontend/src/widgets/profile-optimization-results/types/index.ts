/**
 * @fileoverview Type definitions for Profile Optimization Results
 * @module ProfileOptimizationResultsTypes
 * @version 1.0.0
 */

import React from "react";

// ============================================================================
// MAIN COMPONENT PROPS
// ============================================================================

export interface ProfileOptimizationResultsProps {
  result: ProfileOptimizationResult | null;
  onNewOptimization?: () => void;
  onExport?: () => void;
}

// ============================================================================
// CORE DATA STRUCTURES
// ============================================================================

export interface ProfileGroup {
  profileType: string;
  cuts: number;
  efficiency: number;
  waste: number;
  workOrders: string[];
}

export interface OptimizationResult {
  cuts: Cut[];
  efficiency: number;
  wastePercentage: number;
  totalCost: number;
  totalWaste: number;
  stockCount: number;
  totalLength: number;
  confidence: number;
  executionTimeMs: number;
  algorithm: string;
}

export interface Cut {
  id: string;
  stockLength: number;
  segments: Segment[];
  usedLength: number;
  remainingLength: number;
  planLabel: string;
  segmentCount: number;
  workOrderId?: string;
}

export interface Segment {
  id: string;
  length: number;
  quantity: number;
  workOrderId: string;
  workOrderItemId?: string;
  profileType: string;
}

export interface PerformanceMetrics {
  algorithmComplexity: string;
  convergenceRate: number;
  cpuUsage: number;
  memoryUsage: number;
  scalability: number;
}

export interface CostAnalysis {
  materialCost: number;
  cuttingCost: number;
  setupCost: number;
  totalCost: number;
}

export interface Recommendation {
  severity: string;
  message: string;
  description: string;
  suggestion: string;
  expectedImprovement: number;
}

export interface ProfileOptimizationResult {
  optimizationResult: OptimizationResult;
  performanceMetrics: PerformanceMetrics;
  costAnalysis: CostAnalysis;
  recommendations: Recommendation[];
  confidence: number;
  profileGroups: ProfileGroup[];
}

// ============================================================================
// TAB PANEL TYPES
// ============================================================================

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

export interface HeaderSectionProps {
  result: ProfileOptimizationResult;
  performanceMetrics: CalculatedPerformanceMetrics | null;
  onExport?: (() => void) | undefined;
}

export interface KPICardsProps {
  result: ProfileOptimizationResult;
  performanceMetrics: CalculatedPerformanceMetrics | null;
}

export interface ProfileGroupsTabProps {
  result: ProfileOptimizationResult;
  expandedProfile: string | null;
  onProfileClick: (profileType: string) => void;
  onCuttingPlanDetails: (stock: Record<string, unknown> | Cut) => void;
}

export interface CostAnalysisTabProps {
  result: ProfileOptimizationResult;
  performanceMetrics: CalculatedPerformanceMetrics | null;
}

export interface WasteAnalysisTabProps {
  result: ProfileOptimizationResult;
}

export interface PerformanceTabProps {
  result: ProfileOptimizationResult;
}

export interface RecommendationsTabProps {
  recommendations: Recommendation[];
}

export interface ProfileGroupRowProps {
  group: ProfileGroup;
  isExpanded: boolean;
  onProfileClick: (profileType: string) => void;
  onCuttingPlanDetails: (stock: Record<string, unknown> | Cut) => void;
  optimizationResult: OptimizationResult;
}

export interface ProfileGroupDetailsProps {
  group: ProfileGroup;
  optimizationResult: OptimizationResult;
  onCuttingPlanDetails: (stock: Record<string, unknown>) => void;
}

// ============================================================================
// CALCULATED METRICS TYPES
// ============================================================================

export interface CalculatedPerformanceMetrics {
  efficiency: number;
  wastePercentage: number;
  utilizationRate: number;
  costPerUnit: number;
  savingsPercentage: string;
  qualityScore: number;
  performanceScore: string;
}

// ============================================================================
// STATE MANAGEMENT TYPES
// ============================================================================

export interface ProfileOptimizationState {
  tabValue: number;
  expandedProfile: string | null;
  cuttingPlanModal: {
    open: boolean;
    stock: Cut | null;
  };
}

export interface ProfileOptimizationHandlers {
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  onProfileClick: (profileType: string) => void;
  onCuttingPlanDetails: (stock: Record<string, unknown> | Cut) => void;
  onCuttingPlanModalClose: () => void;
  onNewOptimization?: () => void;
  onExport?: () => void;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface SeverityThresholds {
  good: number;
  warning: number;
}

export interface SeverityColor {
  success: string;
  warning: string;
  error: string;
}

// ============================================================================
// EVENT HANDLER TYPES
// ============================================================================

export type TabChangeHandler = (
  event: React.SyntheticEvent,
  newValue: number,
) => void;

export type ProfileClickHandler = (profileType: string) => void;

export type CuttingPlanDetailsHandler = (
  stock: Record<string, unknown>,
) => void;

export type ModalCloseHandler = () => void;

export type OptimizationActionHandler = () => void;

// ============================================================================
// STYLING TYPES
// ============================================================================

export interface StylingConstants {
  borderRadius: {
    small: number;
    medium: number;
    large: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
  };
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  gradients: {
    primary: string;
    secondary: string;
    success: string;
  };
  shadows: {
    light: string;
    medium: string;
    heavy: string;
  };
  transitions: {
    fast: string;
    normal: string;
    slow: string;
  };
}

// ============================================================================
// ANIMATION TYPES
// ============================================================================

export interface AnimationConfig {
  lemnixRotate: {
    duration: string;
    timing: string;
    iteration: string;
  };
  hoverEffects: {
    scale: string;
    duration: string;
    easing: string;
  };
}

// ============================================================================
// TABLE TYPES
// ============================================================================

export interface TableColumn {
  id: string;
  label: string;
  align?: "left" | "center" | "right";
  minWidth?: number;
  format?: (value: unknown) => string;
}

export interface TableRow {
  id: string;
  data: Record<string, unknown>;
}

// ============================================================================
// CHART TYPES
// ============================================================================

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

// ============================================================================
// MODAL TYPES
// ============================================================================

export interface CuttingPlanModalProps {
  open: boolean;
  stock: Record<string, unknown> | null;
  onClose: () => void;
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface ProfileOptimizationConfig {
  thresholds: {
    efficiency: {
      excellent: number;
      good: number;
      warning: number;
    };
    waste: {
      excellent: number;
      good: number;
      warning: number;
    };
  };
  colors: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  animations: {
    enableHoverEffects: boolean;
    enableRotations: boolean;
    duration: number;
  };
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ProfileGroupValidation {
  profileType: ValidationResult;
  cuts: ValidationResult;
  efficiency: ValidationResult;
  waste: ValidationResult;
  workOrders: ValidationResult;
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export interface ExportOptions {
  format: "pdf" | "excel" | "csv" | "json";
  includeCharts: boolean;
  includeDetails: boolean;
  includeRecommendations: boolean;
}

export interface ExportResult {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
}

// ============================================================================
// PERFORMANCE TYPES
// ============================================================================

export interface PerformanceBenchmark {
  name: string;
  value: number;
  unit: string;
  target: number;
  status: "excellent" | "good" | "warning" | "poor";
}

export interface PerformanceComparison {
  current: number;
  previous: number;
  improvement: number;
  trend: "up" | "down" | "stable";
}

// ============================================================================
// RECOMMENDATION TYPES
// ============================================================================

export interface RecommendationCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  recommendations: Recommendation[];
}

export interface RecommendationPriority {
  critical: Recommendation[];
  high: Recommendation[];
  medium: Recommendation[];
  low: Recommendation[];
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface AnalyticsData {
  totalOptimizations: number;
  averageEfficiency: number;
  totalSavings: number;
  topProfileTypes: Array<{
    profileType: string;
    count: number;
    efficiency: number;
  }>;
  trends: {
    efficiency: number[];
    cost: number[];
    waste: number[];
  };
}

// ============================================================================
// ACCESSIBILITY TYPES
// ============================================================================

export interface AccessibilityConfig {
  ariaLabels: {
    expandProfile: string;
    showDetails: string;
    downloadReport: string;
    printReport: string;
    shareReport: string;
    newOptimization: string;
  };
  keyboardShortcuts: {
    expandAll: string;
    collapseAll: string;
    nextTab: string;
    previousTab: string;
    export: string;
  };
}
