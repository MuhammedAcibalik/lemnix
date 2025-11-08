/**
 * LEMNİX Optimization Algorithm Interface
 * Core abstraction for all optimization algorithms
 * 
 * @module optimization/core
 * @version 1.0.0
 * @architecture DIP (Dependency Inversion Principle)
 */

import { OptimizationAlgorithm } from '../../../types';
import { AdvancedOptimizationResult } from '../types';
import { OptimizationContext } from './OptimizationContext';

/**
 * Algorithm complexity notation
 */
export type AlgorithmComplexity = 'O(n)' | 'O(n log n)' | 'O(n²)' | 'O(n³)' | 'O(2^n)';

/**
 * Core interface that all optimization algorithms must implement
 * Enforces LSP (Liskov Substitution Principle)
 */
export interface IOptimizationAlgorithm {
  /**
   * Algorithm identifier from OptimizationAlgorithm enum
   */
  readonly name: OptimizationAlgorithm;
  
  /**
   * Algorithmic complexity notation
   */
  readonly complexity: AlgorithmComplexity;
  
  /**
   * Scalability score (0-10, higher is better)
   */
  readonly scalability: number;
  
  /**
   * Main optimization method
   * @param context - Shared optimization context
   * @returns Optimization result with cuts, metrics, and costs
   */
  optimize(context: OptimizationContext): Promise<AdvancedOptimizationResult>;
  
  /**
   * Validate if algorithm can handle given context
   * @param context - Optimization context to validate
   * @returns Validation result with optional error message
   */
  canOptimize(context: OptimizationContext): { valid: boolean; reason?: string };
}

/**
 * Algorithm metadata for factory registration
 */
export interface AlgorithmMetadata {
  readonly name: OptimizationAlgorithm;
  readonly displayName: string;
  readonly description: string;
  readonly complexity: AlgorithmComplexity;
  readonly scalability: number;
  readonly recommendedFor: ReadonlyArray<string>;
  readonly notRecommendedFor: ReadonlyArray<string>;
}

