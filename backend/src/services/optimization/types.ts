/**
 * LEMNİX Optimization Types
 * Shared type definitions for optimization module
 * 
 * @module optimization/types
 * @version 1.0.0
 */

import { OptimizationResult, OptimizationConstraints } from '../../types';

/**
 * Algorithm labels (URL-safe identifiers)
 * Only includes active, supported algorithms
 */
export type AlgorithmLabel = 'ffd' | 'bfd' | 'genetic' | 'pooling' | 'pattern-exact';

/**
 * @deprecated Removed algorithms (no longer supported)
 * - 'nfd' (Next Fit Decreasing)
 * - 'wfd' (Worst Fit Decreasing)
 * - 'simulated-annealing'
 * - 'branch-and-bound'
 */
export type DeprecatedAlgorithmLabel = 'nfd' | 'wfd' | 'simulated-annealing' | 'branch-and-bound';

/**
 * Enhanced constraints extending base constraints
 */
export interface EnhancedConstraints extends OptimizationConstraints {
  readonly kerfWidth: number;
  readonly startSafety: number;
  readonly endSafety: number;
  readonly minScrapLength: number;
  readonly energyPerStock?: number; // kWh per stock, default 0.5
}

/**
 * Optimization objective
 */
export interface OptimizationObjective {
  readonly type: 'minimize-waste' | 'minimize-cost' | 'minimize-time' | 'maximize-efficiency';
  readonly weight: number;
  readonly priority: 'high' | 'medium' | 'low';
}

/**
 * Performance settings
 */
export interface PerformanceSettings {
  readonly maxIterations: number;
  readonly convergenceThreshold: number;
  readonly parallelProcessing: boolean;
  readonly cacheResults: boolean;
  readonly populationSize?: number;
  readonly generations?: number;
}

/**
 * NSGA-II algorithm parameters
 * Configurable parameters for multi-objective optimization
 */
export interface NSGAParams {
  readonly populationSize?: number;
  readonly generations?: number;
  readonly crossoverRate?: number;
  readonly mutationRate?: number;
  readonly gpuThreshold?: number;
  readonly seed?: number;
  readonly convergenceWindow?: number;      // HV stagnation window (generations)
  readonly convergenceThreshold?: number;   // HV improvement threshold
}

/**
 * Time estimation model
 * Production-specific time parameters
 */
export interface TimeModel {
  readonly setupPerStock?: number;  // minutes per stock setup
  readonly cutPerSegment?: number;  // minutes per segment cutting
}

/**
 * Cost model
 */
export interface CostModel {
  readonly materialCost: number;
  readonly cuttingCost: number;
  readonly setupCost: number;
  readonly wasteCost: number;
  readonly timeCost: number;
  readonly energyCost: number;
}

/**
 * Pareto point for multi-objective optimization
 */
export interface ParetoPoint {
  readonly waste: number;
  readonly cost: number;
  readonly time: number;
  readonly efficiency: number;
}

/**
 * Cost breakdown
 */
export interface CostBreakdown {
  readonly materialCost: number;
  readonly cuttingCost: number;
  readonly setupCost: number;
  readonly wasteCost: number;
  readonly timeCost: number;
  readonly energyCost: number;
  readonly totalCost: number;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  readonly algorithmComplexity: 'O(n)' | 'O(n²)' | 'O(n³)' | 'O(2^n)';
  readonly convergenceRate: number;
  readonly memoryUsage: number;
  readonly cpuUsage: number;
  readonly scalability: number;
}

/**
 * Advanced optimization recommendation
 */
export interface AdvancedOptimizationRecommendation {
  readonly type: 'algorithm-change' | 'parameter-adjustment' | 'constraint-relaxation';
  readonly description: string;
  readonly expectedImprovement: number;
  readonly implementationEffort: 'low' | 'medium' | 'high';
  readonly severity: 'info' | 'warning' | 'error' | 'critical';
  readonly message: string;
  readonly impact: 'low' | 'medium' | 'high';
  readonly suggestion: string;
}

/**
 * Optimization history entry
 */
export interface OptimizationHistoryEntry {
  readonly generation: number;
  readonly bestFitness: number;
  readonly averageFitness: number;
  readonly diversity: number;
  readonly timestamp: string;
}

/**
 * Stock summary for multi-stock optimization results
 */
export interface StockSummary {
  readonly stockLength: number;
  readonly cutCount: number;
  readonly patterns: ReadonlyArray<{ readonly pattern: string; readonly count: number }>;
  readonly avgWaste: number;
  readonly totalWaste: number;
  readonly efficiency: number;
}

/**
 * Advanced optimization result (extends base OptimizationResult)
 */
export interface AdvancedOptimizationResult extends Omit<OptimizationResult, 'recommendations'> {
  readonly paretoFrontier: ParetoPoint[];
  readonly costBreakdown: CostBreakdown;
  readonly performanceMetrics: PerformanceMetrics;
  readonly recommendations: AdvancedOptimizationRecommendation[];
  readonly confidence: number;
  readonly totalKerfLoss: number;
  readonly totalSafetyReserve: number;
  readonly optimizationHistory?: readonly OptimizationHistoryEntry[];
  readonly convergenceData?: {
    readonly generations: readonly number[];
    readonly fitnessValues: readonly number[];
    readonly diversityValues: readonly number[];
  };
  readonly algorithmParameters?: {
    readonly populationSize: number;
    readonly generations: number;
    readonly mutationRate: number;
    readonly crossoverRate: number;
  };
  readonly resourceUtilization?: {
    readonly cpuUsage: number;
    readonly memoryUsage: number;
    readonly gpuUsage: number;
    readonly networkUsage: number;
  };
  readonly errorAnalysis?: {
    readonly errors: readonly string[];
    readonly warnings: readonly string[];
    readonly suggestions: readonly string[];
  };
  readonly validationResults?: {
    readonly isValid: boolean;
    readonly errors: readonly string[];
    readonly warnings: readonly string[];
  };
  readonly metadata?: {
    readonly version: string;
    readonly timestamp: string;
    readonly environment: string;
  };
  readonly workOrders?: {
    readonly ids: string[];
    readonly count: number;
    readonly breakdown: Array<{ workOrderId: string; pieceCount: number }>;
  };
  readonly stockSummary?: ReadonlyArray<StockSummary>;
}

/**
 * Advanced optimization parameters
 */
export interface AdvancedOptimizationParams {
  readonly algorithm: AlgorithmLabel;
  readonly objectives: OptimizationObjective[];
  readonly constraints: EnhancedConstraints;
  readonly performance: PerformanceSettings;
  readonly costModel: CostModel;
  readonly verbose?: boolean;
  readonly startTime?: number;
}

