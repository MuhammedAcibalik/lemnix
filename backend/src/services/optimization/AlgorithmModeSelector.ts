/**
 * @fileoverview Algorithm Mode Selector with Smart Selection Strategy
 * @module optimization/AlgorithmModeSelector
 * @version 1.0.0
 *
 * SOLID Principles:
 * - Single Responsibility: Selects algorithm mode (standard/advanced/auto)
 * - Open/Closed: Easy to add new selection strategies
 * - Dependency Inversion: Depends on BaseAlgorithm interface
 *
 * Strategy Pattern: Smart algorithm mode selection based on problem size and user preference
 *
 * Note: This is different from core/AlgorithmFactory which creates algorithm instances.
 * This file handles algorithm MODE selection (standard/advanced/auto), not algorithm TYPE creation.
 */

import type { BaseAlgorithm } from "./core/BaseAlgorithm";
import { GeneticAlgorithm } from "./algorithms/GeneticAlgorithm";
import type { OptimizationContext } from "./core/OptimizationContext";
import type { ILogger } from "../logger";

/**
 * Algorithm selection modes
 * - standard: Fast GeneticAlgorithm (default)
 * - auto: Smart selection based on problem size (same as standard)
 */
export type AlgorithmMode = "standard" | "auto";

/**
 * Strategy interface for algorithm selection
 * Implements Strategy Pattern
 */
export interface AlgorithmSelectionStrategy {
  selectAlgorithm(
    context: OptimizationContext,
    mode: AlgorithmMode,
  ): BaseAlgorithm;
}

/**
 * Smart algorithm selector with auto mode
 *
 * Selection Logic:
 * - standard: Always GeneticAlgorithm
 * - auto: Always GeneticAlgorithm (same as standard)
 */
export class SmartAlgorithmSelector implements AlgorithmSelectionStrategy {
  private static readonly AUTO_THRESHOLD_ITEMS = 30;

  constructor(private readonly logger: ILogger) {}

  selectAlgorithm(
    context: OptimizationContext,
    mode: AlgorithmMode,
  ): BaseAlgorithm {
    switch (mode) {
      case "standard":
        return new GeneticAlgorithm(this.logger);

      case "auto":
        // Auto mode uses standard GeneticAlgorithm
        return new GeneticAlgorithm(this.logger);

      default: {
        // TypeScript exhaustiveness check
        const _exhaustive: never = mode;
        throw new Error(`Unknown algorithm mode: ${_exhaustive}`);
      }
    }
  }

  /**
   * Get recommended mode for given item count
   * Useful for UI guidance
   *
   * @param itemCount - Number of items to optimize
   * @returns Recommended algorithm mode (always standard)
   */
  getRecommendedMode(itemCount: number): AlgorithmMode {
    return "standard";
  }

  /**
   * Get algorithm info for given mode
   * Useful for UI display
   *
   * @param mode - Algorithm mode
   * @param itemCount - Optional item count for auto mode
   * @returns Algorithm metadata
   */
  getAlgorithmInfo(mode: AlgorithmMode, itemCount?: number): AlgorithmInfo {
    switch (mode) {
      case "standard":
        return {
          name: "Genetic Algorithm",
          type: "standard",
          estimatedTime: "3-5 seconds",
          outputType: "single",
          features: ["Fast", "Single best solution", "Mobile friendly"],
        };

      case "auto": {
        const baseInfo = this.getAlgorithmInfo("standard", itemCount);
        return {
          ...baseInfo,
          name: `Auto (${baseInfo.name})`,
          type: "auto",
        };
      }

      default: {
        // TypeScript exhaustiveness check
        const _exhaustive: never = mode;
        throw new Error(`Unknown algorithm mode: ${_exhaustive}`);
      }
    }
  }
}

/**
 * Algorithm metadata for UI display
 */
export interface AlgorithmInfo {
  readonly name: string;
  readonly type: AlgorithmMode;
  readonly estimatedTime: string;
  readonly outputType: "single";
  readonly features: ReadonlyArray<string>;
}
