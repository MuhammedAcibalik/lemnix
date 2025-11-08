/**
 * @fileoverview Algorithm Factory with Smart Selection Strategy
 * @module optimization/AlgorithmFactory
 * @version 1.0.0
 * 
 * SOLID Principles:
 * - Single Responsibility: Factory only creates algorithms
 * - Open/Closed: Easy to add new algorithms
 * - Dependency Inversion: Depends on BaseAlgorithm interface
 * 
 * Strategy Pattern: Smart algorithm selection based on problem size and user preference
 */

import type { BaseAlgorithm } from './core/BaseAlgorithm';
import { GeneticAlgorithm } from './algorithms/GeneticAlgorithm';
import { NSGAIIAlgorithm } from './algorithms/advanced/NSGAII';
import type { OptimizationContext } from './core/OptimizationContext';
import type { ILogger } from '../logger';

/**
 * Algorithm selection modes
 * - standard: Fast GeneticAlgorithm (default)
 * - advanced: NSGA-II with Pareto front
 * - auto: Smart selection based on problem size
 */
export type AlgorithmMode = 'standard' | 'advanced' | 'auto';

/**
 * Strategy interface for algorithm selection
 * Implements Strategy Pattern
 */
export interface AlgorithmSelectionStrategy {
  selectAlgorithm(context: OptimizationContext, mode: AlgorithmMode): BaseAlgorithm;
}

/**
 * Smart algorithm selector with auto mode
 * 
 * Selection Logic:
 * - standard: Always GeneticAlgorithm
 * - advanced: Always NSGA-II
 * - auto: < 30 items → NSGA-II, >= 30 items → GeneticAlgorithm
 */
export class SmartAlgorithmSelector implements AlgorithmSelectionStrategy {
  private static readonly AUTO_THRESHOLD_ITEMS = 30;

  constructor(private readonly logger: ILogger) {}

  /**
   * Select appropriate algorithm based on mode and context
   * 
   * @param context - Optimization context with items and constraints
   * @param mode - Selection mode (standard/advanced/auto)
   * @returns Instantiated algorithm ready to optimize
   */
  selectAlgorithm(context: OptimizationContext, mode: AlgorithmMode): BaseAlgorithm {
    // Standard mode: Fast GeneticAlgorithm
    if (mode === 'standard') {
      this.logger.debug('Selected GeneticAlgorithm (standard mode)', {
        itemCount: context.items.length,
      });
      return new GeneticAlgorithm(this.logger);
    }

    // Advanced mode: NSGA-II with Pareto front
    if (mode === 'advanced') {
      this.logger.debug('Selected NSGA-II (advanced mode)', {
        itemCount: context.items.length,
      });
      return new NSGAIIAlgorithm(this.logger);
    }

    // AUTO mode: Smart selection based on problem size
    const itemCount = context.items.length;

    if (itemCount < SmartAlgorithmSelector.AUTO_THRESHOLD_ITEMS) {
      // Small problems: NSGA-II is fast enough, show Pareto front
      this.logger.info('Auto-selected NSGA-II (small problem)', {
        itemCount,
        threshold: SmartAlgorithmSelector.AUTO_THRESHOLD_ITEMS,
        reason: 'NSGA-II overhead acceptable for small problems',
      });
      return new NSGAIIAlgorithm(this.logger);
    } else {
      // Large problems: Use fast GeneticAlgorithm
      this.logger.info('Auto-selected GeneticAlgorithm (large problem)', {
        itemCount,
        threshold: SmartAlgorithmSelector.AUTO_THRESHOLD_ITEMS,
        reason: 'GeneticAlgorithm significantly faster for large problems',
      });
      return new GeneticAlgorithm(this.logger);
    }
  }

  /**
   * Get recommended mode for given item count
   * Useful for UI guidance
   * 
   * @param itemCount - Number of items to optimize
   * @returns Recommended algorithm mode
   */
  getRecommendedMode(itemCount: number): AlgorithmMode {
    return itemCount < SmartAlgorithmSelector.AUTO_THRESHOLD_ITEMS ? 'advanced' : 'standard';
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
      case 'standard':
        return {
          name: 'Genetic Algorithm',
          type: 'standard',
          estimatedTime: '3-5 seconds',
          outputType: 'single',
          features: ['Fast', 'Single best solution', 'Mobile friendly'],
        };

      case 'advanced':
        return {
          name: 'NSGA-II',
          type: 'advanced',
          estimatedTime: '10-15 seconds',
          outputType: 'pareto-front',
          features: ['Pareto front', 'Trade-off analysis', '10-30 solutions'],
        };

      case 'auto':
        const actualMode =
          itemCount !== undefined && itemCount < SmartAlgorithmSelector.AUTO_THRESHOLD_ITEMS
            ? 'advanced'
            : 'standard';
        const baseInfo = this.getAlgorithmInfo(actualMode, itemCount);
        return {
          ...baseInfo,
          name: `Auto (${baseInfo.name})`,
          type: 'auto',
        };

      default:
        // TypeScript exhaustiveness check
        const _exhaustive: never = mode;
        throw new Error(`Unknown algorithm mode: ${_exhaustive}`);
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
  readonly outputType: 'single' | 'pareto-front';
  readonly features: ReadonlyArray<string>;
}

