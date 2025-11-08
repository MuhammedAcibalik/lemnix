/**
 * LEMNİX Optimization Entity Model Barrel Export
 * 
 * @module entities/optimization/model
 * @version 1.0.0 - FSD Compliant
 */

// Types
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
  // NEW: P0-3 Export types
  ExportFormat,
  ExportOptimizationRequest,
  ExportOptimizationResponse,
} from './types';

// Constants
export { ALGORITHM_CATALOG } from './types';

// Validation schemas
export {
  algorithmTypeSchema,
  objectiveTypeSchema,
  objectivePrioritySchema,
  optimizationObjectiveSchema,
  optimizationConstraintsSchema,
  performanceSettingsSchema,
  costModelSchema,
  optimizationItemSchema,
  materialStockLengthSchema,
  optimizationParamsSchema,
  optimizationRequestSchema,
  validateOptimizationRequest,
  validatePerformanceSettings,
  validateOptimizationObjectives,
  DEFAULT_CONSTRAINTS,
  DEFAULT_OBJECTIVES,
  DEFAULT_PERFORMANCE_SETTINGS,
} from './schemas';

export type {
  OptimizationRequestInput,
  OptimizationParamsInput,
  PerformanceSettingsInput,
  OptimizationObjectiveInput,
  OptimizationItemInput,
} from './schemas';

// Store
export { useOptimizationUI } from './optimizationStore';

