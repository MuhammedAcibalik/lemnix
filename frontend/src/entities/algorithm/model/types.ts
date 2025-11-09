/**
 * @fileoverview Algorithm Entity Types
 * @module entities/algorithm
 * @version 1.0.0
 *
 * FSD: Entity layer - Domain model for optimization algorithms
 * TypeScript: Strict mode, readonly, no any
 */

/**
 * Algorithm selection modes
 * - standard: Fast GeneticAlgorithm (default, 3-5s)
 * - advanced: NSGA-II with Pareto front (10-15s)
 * - auto: Smart selection based on problem size
 */
export type AlgorithmMode = "standard" | "advanced" | "auto";

/**
 * Algorithm configuration for UI display
 */
export interface AlgorithmConfig {
  readonly mode: AlgorithmMode;
  readonly name: string;
  readonly description: string;
  readonly estimatedTime: string;
  readonly features: ReadonlyArray<string>;
  readonly icon: "flash" | "analytics" | "auto_awesome";
  readonly badge?: string;
}

/**
 * Algorithm configurations catalog
 * Single source of truth for algorithm metadata
 */
export const ALGORITHM_CONFIGS: Record<AlgorithmMode, AlgorithmConfig> = {
  standard: {
    mode: "standard",
    name: "Standart Mod",
    description:
      "Genetic Algorithm v1.7.1 ile hızlı optimizasyon. Tek en iyi çözüm.",
    estimatedTime: "3-5 saniye",
    features: [
      "WebGPU ile GPU hızlandırma",
      "Adaptive parametre ayarlama",
      "Deterministik evrim stratejisi",
      "Dinamik fitness normalizasyonu",
    ],
    icon: "flash",
    badge: "Hızlı",
  },
  advanced: {
    mode: "advanced",
    name: "Gelişmiş Mod (NSGA-II)",
    description:
      "Çok hedefli optimizasyon. Pareto front ve alternatif çözümler.",
    estimatedTime: "10-20 saniye",
    features: [
      "Fast non-dominated sorting O(MN²)",
      "Crowding distance ile çeşitlilik",
      "10-30 alternatif çözüm (Pareto front)",
      "Hypervolume kalite göstergesi",
      "Trade-off analizi ve görselleştirme",
    ],
    icon: "analytics",
  },
  auto: {
    mode: "auto",
    name: "Otomatik Seçim",
    description: "Akıllı mod seçimi. Problem boyutuna göre en uygun algoritma.",
    estimatedTime: "Değişken",
    features: [
      "< 30 öğe: NSGA-II (Pareto front)",
      "≥ 30 öğe: Standart (hızlı)",
      "Otomatik eşik optimizasyonu",
      "Performans/kalite dengesi",
    ],
    icon: "auto_awesome",
    badge: "Önerilen",
  },
} as const;

/**
 * Pareto optimization result from NSGA-II
 */
export interface ParetoOptimizationResult {
  readonly algorithm: string;
  readonly paretoFront: ReadonlyArray<OptimizationResult>;
  readonly recommendedSolution: OptimizationResult;
  readonly hypervolume: number;
  readonly spacing: number;
  readonly spread: number;
  readonly frontSize: number;
}

/**
 * Standard optimization result (for type compatibility)
 */
export interface OptimizationResult {
  readonly efficiency: number;
  readonly totalWaste: number;
  readonly totalCost: number;
  readonly totalTime?: number;
  readonly cuts: ReadonlyArray<unknown>;
  readonly [key: string]: unknown;
}

/**
 * Comparison result (standard vs advanced)
 */
export interface AlgorithmComparisonResult {
  readonly standard: {
    readonly result: OptimizationResult;
    readonly algorithm: string;
    readonly mode: "standard";
  };
  readonly advanced: {
    readonly result: OptimizationResult;
    readonly paretoFront: ReadonlyArray<OptimizationResult>;
    readonly frontSize: number;
    readonly hypervolume: number;
    readonly spread: number;
    readonly algorithm: string;
    readonly mode: "advanced";
  };
  readonly comparison: {
    readonly efficiencyDiff: number;
    readonly wasteDiff: number;
    readonly costDiff: number;
  };
}

/**
 * Get recommended mode for given item count
 *
 * @param itemCount - Number of items to optimize
 * @returns Recommended algorithm mode
 */
export function getRecommendedMode(itemCount: number): AlgorithmMode {
  if (itemCount < 30) {
    // Small problems: NSGA-II is fast enough
    return "advanced";
  }
  // Large problems: Use fast standard algorithm
  return "standard";
}

/**
 * Get algorithm config for mode
 *
 * @param mode - Algorithm mode
 * @returns Algorithm configuration
 */
export function getAlgorithmConfig(mode: AlgorithmMode): AlgorithmConfig {
  return ALGORITHM_CONFIGS[mode];
}
