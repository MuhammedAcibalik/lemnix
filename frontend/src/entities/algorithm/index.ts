/**
 * @fileoverview Algorithm Entity - Public API
 * @module entities/algorithm
 * 
 * FSD: Public API exports for algorithm entity
 */

export type { 
  AlgorithmMode,
  AlgorithmConfig,
  ParetoOptimizationResult,
  OptimizationResult,
  AlgorithmComparisonResult
} from './model/types';

export { 
  ALGORITHM_CONFIGS,
  getRecommendedMode,
  getAlgorithmConfig
} from './model/types';

