/**
 * LEMNİX Optimization Entity Public API
 *
 * @module entities/optimization
 * @version 1.0.0 - FSD Compliant
 *
 * @description
 * Optimization domain entity - represents the core optimization business logic.
 * Provides types, API calls, React Query hooks, and UI state management.
 */

// ============================================================================
// MODEL (Types & Store)
// ============================================================================

export type {
  AlgorithmType,
  ObjectiveType,
  ObjectivePriority,
  OptimizationObjective,
  OptimizationConstraints,
  PerformanceSettings,
  CostModel,
  OptimizationItem,
  MaterialStockLength,
  OptimizationParams,
  CuttingSegment,
  WasteCategory,
  Cut,
  WasteDistribution,
  OptimizationRecommendation,
  OptimizationResult,
  OptimizationRequest,
  OptimizationHistoryEntry,
  EfficiencyCategory,
  OptimizationStatus,
  // NEW: GA v1.7.1 types
  AlgorithmMetadata,
  ParetoFrontier,
  CostBreakdown,
  AlgorithmInfo,
  // NEW: P0-3 Export
  ExportFormat,
  ExportOptimizationRequest,
  ExportOptimizationResponse,
} from "./model";

export { ALGORITHM_CATALOG } from "./model";

export { useOptimizationUI } from "./model";

// ============================================================================
// API (React Query Hooks - Recommended)
// ============================================================================

export {
  optimizationKeys,
  useRunOptimization,
  useOptimizationHistory,
  useOptimizationMetrics,
  useOptimizationHealth,
  // NEW: P0-3 hooks
  useExportOptimization,
  // ⚠️ Removed unused hooks: useAvailableAlgorithms, useValidateOptimization, useOptimizationEstimate
} from "./api";

// ============================================================================
// API (Raw Functions - For Advanced Use)
// ============================================================================

export {
  runOptimization,
  getOptimizationHistory,
  getOptimizationMetrics,
  checkOptimizationHealth,
  // NEW: GA v1.7.1 functions
  validateOptimizationRequest,
  getOptimizationEstimate,
  getAvailableAlgorithms,
  // NEW: P0-3 functions
  exportOptimizationResult,
} from "./api";

// ============================================================================
// UI (будет добавлено позже в Phase 3)
// ============================================================================

// export { OptimizationCard, OptimizationMetrics, OptimizationChart } from './ui';
