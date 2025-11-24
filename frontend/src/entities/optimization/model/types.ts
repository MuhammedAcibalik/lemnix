/**
 * LEMNİX Optimization Entity Types
 * Domain types for optimization operations
 *
 * @module entities/optimization/model
 * @version 1.0.0 - FSD Compliant
 * @description Types aligned with backend API structure
 */

import type { ID, Timestamp } from "@/shared";

/**
 * Algorithm types (aligned with backend)
 */
export type AlgorithmType = "bfd" | "genetic";

/**
 * Optimization objective types
 */
export type ObjectiveType =
  | "minimize-waste"
  | "maximize-efficiency"
  | "minimize-cost"
  | "minimize-time"
  | "maximize-quality";

/**
 * Objective priority
 */
export type ObjectivePriority = "low" | "medium" | "high";

/**
 * Optimization objective
 */
export interface OptimizationObjective {
  readonly type: ObjectiveType;
  readonly weight: number;
  readonly priority: ObjectivePriority;
}

/**
 * Optimization constraints (aligned with backend)
 */
export interface OptimizationConstraints {
  readonly kerfWidth: number;
  readonly startSafety: number;
  readonly endSafety: number;
  readonly minScrapLength: number;
  readonly maxWastePercentage: number;
  readonly maxCutsPerStock: number;
  readonly allowPartialStocks?: boolean;
  readonly prioritizeSmallWaste?: boolean;
}

/**
 * Performance settings - Enhanced for GA v1.7.1
 * Aligned with backend GeneticAlgorithm.ts
 */
export interface PerformanceSettings {
  readonly maxExecutionTime?: number; // seconds
  readonly parallelProcessing?: boolean;
  readonly cacheResults?: boolean;

  // GA-specific parameters (v1.7.1)
  readonly populationSize?: number; // Override adaptive sizing (10-100)
  readonly generations?: number; // Override adaptive generations (10-200)
  readonly mutationRate?: number; // Advanced tuning (0.01-0.5)
  readonly crossoverRate?: number; // Advanced tuning (0.5-1.0)
  readonly convergenceThreshold?: number; // Early stopping threshold
  readonly stagnationThreshold?: number; // Adaptive mutation trigger
}

/**
 * Cost model
 */
export interface CostModel {
  readonly materialCostPerMeter: number;
  readonly cuttingCostPerCut: number;
  readonly setupCostPerStock: number;
  readonly laborCostPerHour: number;
  readonly wasteCostPerMeter: number;
}

/**
 * Optimization item (input)
 */
export interface OptimizationItem {
  readonly id: ID;
  readonly workOrderId: string;
  readonly profileType: string;
  readonly length: number;
  readonly quantity: number;
  readonly color?: string;
  readonly version?: string;
  readonly size?: string;
  readonly note?: string;
}

/**
 * Material stock length
 */
export interface MaterialStockLength {
  readonly profileType: string;
  readonly stockLength: number;
}

/**
 * Optimization parameters (request)
 */
export interface OptimizationParams {
  readonly algorithm: AlgorithmType;
  readonly objectives: ReadonlyArray<OptimizationObjective>;
  readonly constraints: OptimizationConstraints;
  readonly performance?: PerformanceSettings;
  readonly costModel?: CostModel;
}

/**
 * Cutting segment
 */
export interface CuttingSegment {
  readonly id: ID;
  readonly length: number;
  readonly quantity: number;
  readonly position: number;
  readonly endPosition: number;
  readonly workOrderId?: string;
  readonly workOrderItemId?: string;
  readonly profileType: string;
  readonly color?: string;
  readonly version?: string;
  readonly note?: string;
}

/**
 * Waste category
 */
export type WasteCategory =
  | "minimal"
  | "small"
  | "medium"
  | "large"
  | "excessive";

/**
 * Cut (stock piece with segments)
 */
export interface Cut {
  readonly id: ID;
  readonly stockLength: number;
  readonly segments: ReadonlyArray<CuttingSegment>;
  readonly usedLength: number;
  readonly remainingLength: number;
  readonly wasteCategory: WasteCategory;
  readonly isReclaimable: boolean;
  readonly workOrderId?: string;
  readonly profileType?: string;
  readonly quantity?: number;
}

/**
 * Waste distribution
 */
export interface WasteDistribution {
  readonly minimal: number;
  readonly small: number;
  readonly medium: number;
  readonly large: number;
  readonly excessive: number;
  readonly reclaimable: number;
  readonly totalPieces: number;
}

/**
 * Optimization recommendation
 */
export interface OptimizationRecommendation {
  readonly type: "performance" | "cost" | "quality" | "waste";
  readonly priority: ObjectivePriority;
  readonly message: string;
  readonly impact?: number;
  readonly actionable?: boolean;
}

/**
 * Algorithm execution metadata (GA v1.7.1 telemetry)
 */
export interface AlgorithmMetadata {
  readonly effectiveComplexity: string; // e.g., "O(30 × 100² × 25)"
  readonly actualGenerations: number;
  readonly convergenceReason: "early_stop" | "max_generations" | "stagnation";
  readonly bestFitness: number; // 0-1 normalized fitness score
  readonly executionTimeMs: number;
  readonly deterministicSeed?: number;
  readonly populationSize?: number;
  readonly finalGeneration?: number;
}

/**
 * Pareto frontier for multi-objective optimization
 */
export interface ParetoFrontier {
  readonly waste: number;
  readonly cost: number;
  readonly time: number;
  readonly efficiency: number;
}

/**
 * Detailed cost breakdown
 */
export interface CostBreakdown {
  readonly materialCost: number;
  readonly laborCost: number;
  readonly wasteCost: number;
  readonly setupCost: number;
  readonly totalCost: number;
  readonly cuttingCost?: number;
  readonly timeCost?: number;
}

/**
 * Optimization result (response) - Enhanced for GA v1.7.1
 */
export interface OptimizationResult {
  readonly id?: ID;
  readonly cuts: ReadonlyArray<Cut>;
  readonly totalStocks: number;
  readonly totalWaste: number;
  readonly totalEfficiency: number;
  readonly totalCost: number;
  readonly wastePercentage: number;
  readonly algorithm: AlgorithmType;
  readonly executionTime: number;
  readonly timestamp: Timestamp;
  readonly wasteDistribution: WasteDistribution;
  readonly recommendations: ReadonlyArray<OptimizationRecommendation>;
  readonly metadata?: {
    readonly version: string;
    readonly parameters: Record<string, unknown>;
    readonly environment: string;
  };

  // NEW: GA v1.7.1 telemetry
  readonly algorithmMetadata?: AlgorithmMetadata;

  // NEW: Multi-objective metrics
  readonly paretoFrontier?: ParetoFrontier;

  // NEW: Detailed cost breakdown
  readonly costBreakdown?: CostBreakdown;

  // NEW: Quality metrics
  readonly qualityScore?: number; // 0-100
  readonly confidence?: number; // 0-1
  readonly optimizationScore?: number; // Composite metric
  readonly materialUtilization?: number; // Efficiency as percentage
  readonly reclaimableWastePercentage?: number;
}

/**
 * Optimization request (for API)
 */
export interface OptimizationRequest {
  readonly items: ReadonlyArray<OptimizationItem>;
  readonly params: OptimizationParams;
  readonly materialStockLengths?: ReadonlyArray<MaterialStockLength>;
}

/**
 * Optimization history entry
 */
export interface OptimizationHistoryEntry {
  readonly id: ID;
  readonly result: OptimizationResult;
  readonly request: OptimizationRequest;
  readonly createdAt: Timestamp;
}

/**
 * Efficiency category
 */
export type EfficiencyCategory = "excellent" | "good" | "average" | "poor";

/**
 * Optimization status
 */
export type OptimizationStatus = "idle" | "running" | "success" | "error";

/**
 * Algorithm information for UI display
 */
export interface AlgorithmInfo {
  readonly id: AlgorithmType;
  readonly name: string;
  readonly description: string;
  readonly complexity: string;
  readonly scalability: number; // 1-10
  readonly bestFor: ReadonlyArray<string>;
  readonly supportsObjectives: boolean;
  readonly supportsPerformanceTuning: boolean;
  readonly recommendedItemRange: {
    readonly min: number;
    readonly max: number;
  };
  readonly icon?: string;
}

/**
 * Algorithm catalog - Aligned with backend capabilities
 */
export const ALGORITHM_CATALOG: Record<AlgorithmType, AlgorithmInfo> = {
  bfd: {
    id: "bfd",
    name: "Best-Fit Decreasing",
    description: "Dengeli performans ve kalite",
    complexity: "O(n²)",
    scalability: 6,
    bestFor: ["Orta boyut", "< 100 parça", "Verimlilik odaklı"],
    supportsObjectives: false,
    supportsPerformanceTuning: false,
    recommendedItemRange: { min: 1, max: 100 },
    icon: "⚖️",
  },
  genetic: {
    id: "genetic",
    name: "Genetic Algorithm v1.7.1",
    description: "En iyi kalite, çoklu hedef optimizasyonu (100/100 Score)",
    complexity: "O(P×n²×g)",
    scalability: 7,
    bestFor: ["Kalite öncelikli", "10-200 parça", "Çoklu hedef", "Kurumsal"],
    supportsObjectives: true,
    supportsPerformanceTuning: true,
    recommendedItemRange: { min: 10, max: 200 },
    icon: "🧬",
  },
} as const;

// ============================================================================
// EXPORT TYPES (P0-3 Feature)
// ============================================================================

/**
 * Export format types
 */
export type ExportFormat = "excel" | "pdf" | "json";

/**
 * Export request
 */
export interface ExportOptimizationRequest {
  readonly resultId: string;
  readonly format: ExportFormat;
  readonly options?: {
    readonly includeCharts?: boolean;
    readonly includeMetrics?: boolean;
    readonly includeRecommendations?: boolean;
  };
}

/**
 * Export response
 */
export interface ExportOptimizationResponse {
  readonly downloadUrl: string;
  readonly filename: string;
  readonly expiresAt: string;
  readonly fileSize?: number;
}
