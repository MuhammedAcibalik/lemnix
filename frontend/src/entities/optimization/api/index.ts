/**
 * LEMNİX Optimization Entity API Barrel Export
 *
 * @module entities/optimization/api
 * @version 1.0.0 - FSD Compliant
 */

// API functions (raw)
export {
  runOptimization,
  getOptimizationHistory,
  getOptimizationMetrics,
  checkOptimizationHealth,
  // NEW: GA v1.7.1 functions
  validateOptimizationRequest,
  getOptimizationEstimate,
  getAvailableAlgorithms,
  // NEW: P0-3 Export
  exportOptimizationResult,
  // NEW: P3-11 Prefetch
  getOptimizationResult,
} from "./optimizationApi";

// DTO functions (backend-frontend type normalization)
export {
  normalizeOptimizationResult,
  safeNormalizeOptimizationResult,
  isValidOptimizationResult,
} from "./dto";

// React Query hooks (recommended)
export {
  optimizationKeys,
  useRunOptimization,
  useOptimizationHistory,
  useOptimizationMetrics,
  useOptimizationHealth,
  // NEW: P0-3 Export
  useExportOptimization,
  // ⚠️ Removed unused hooks: useAvailableAlgorithms, useValidateOptimization, useOptimizationEstimate
  // Use raw API functions if needed: getAvailableAlgorithms(), validateOptimizationRequest(), getOptimizationEstimate()
} from "./optimizationQueries";
