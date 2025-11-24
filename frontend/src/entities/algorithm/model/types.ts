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
 * - auto: Smart selection based on problem size (same as standard)
 */
export type AlgorithmMode = "standard" | "auto";

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
      "Adaptive parametre ayarlama",
      "Adaptive parametre ayarlama",
      "Deterministik evrim stratejisi",
      "Dinamik fitness normalizasyonu",
    ],
    icon: "flash",
    badge: "Hızlı",
  },
  auto: {
    mode: "auto",
    name: "Otomatik Seçim",
    description: "Akıllı mod seçimi. Problem boyutuna göre en uygun algoritma.",
    estimatedTime: "Değişken",
    features: [
      "Standart algoritma kullanımı",
      "Otomatik optimizasyon",
      "Performans odaklı",
    ],
    icon: "auto_awesome",
    badge: "Önerilen",
  },
} as const;

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
 * Get recommended mode for given item count
 *
 * @param itemCount - Number of items to optimize
 * @returns Recommended algorithm mode
 */
export function getRecommendedMode(itemCount: number): AlgorithmMode {
  // Always use standard mode
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
