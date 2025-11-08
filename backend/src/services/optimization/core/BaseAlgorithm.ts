/**
 * LEMNİX Base Optimization Algorithm
 * Abstract base class providing shared functionality for all algorithms
 * 
 * @module optimization/core
 * @version 1.0.0
 * @architecture Template Method Pattern + DRY
 */

import { OptimizationItem, Cut, OptimizationAlgorithm, WasteCategory } from '../../../types';
import { ILogger } from '../../logger';
import { IOptimizationAlgorithm, AlgorithmComplexity } from './IOptimizationAlgorithm';
import { OptimizationContext } from './OptimizationContext';
import { AdvancedOptimizationResult, EnhancedConstraints } from '../types';

/**
 * Abstract base class for all optimization algorithms
 * Implements Template Method pattern for shared logic
 */
export abstract class BaseAlgorithm implements IOptimizationAlgorithm {
  abstract readonly name: OptimizationAlgorithm;
  abstract readonly complexity: AlgorithmComplexity;
  abstract readonly scalability: number;

  protected readonly logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  /**
   * Main optimization method (to be implemented by subclasses)
   */
  abstract optimize(context: OptimizationContext): Promise<AdvancedOptimizationResult>;

  /**
   * Validate if algorithm can handle given context
   */
  public canOptimize(context: OptimizationContext): { valid: boolean; reason?: string } {
    if (context.items.length === 0) {
      return { valid: false, reason: 'No items to optimize' };
    }
    
    const totalItems = context.getTotalItemCount();
    if (totalItems > 10000 && this.scalability < 7) {
      return { 
        valid: false, 
        reason: `Algorithm ${this.name} not recommended for ${totalItems} items (scalability: ${this.scalability}/10)` 
      };
    }
    
    return { valid: true };
  }

  // ============================================================================
  // SHARED HELPER METHODS (DRY)
  // ============================================================================

  /**
   * Expand items by quantity into individual pieces
   */
  protected expandItemsByQuantity(items: ReadonlyArray<OptimizationItem>): OptimizationItem[] {
    const expanded: OptimizationItem[] = [];
    
    for (const item of items) {
      for (let i = 0; i < item.quantity; i++) {
        expanded.push({
          ...item,
          quantity: 1
        });
      }
    }
    
    return expanded;
  }

  /**
   * Preprocess items (validate and sanitize)
   */
  protected preprocessItems(items: ReadonlyArray<OptimizationItem>): OptimizationItem[] {
    return items.map(item => ({
      ...item,
      length: Math.max(item.length, 1),
      quantity: Math.max(item.quantity, 1)
    }));
  }

  /**
   * Calculate waste category based on remaining length
   */
  protected calculateWasteCategory(remainingLength: number): WasteCategory {
    if (remainingLength < 50) return WasteCategory.MINIMAL;
    if (remainingLength < 100) return WasteCategory.SMALL;
    if (remainingLength < 200) return WasteCategory.MEDIUM;
    if (remainingLength < 500) return WasteCategory.LARGE;
    return WasteCategory.EXCESSIVE;
  }

  /**
   * Generate unique cut ID
   */
  protected generateCutId(): string {
    return `cut-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique segment ID
   */
  protected generateSegmentId(): string {
    return `seg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate global invariants for cuts
   */
  protected validateGlobalInvariants(cuts: Cut[], items?: ReadonlyArray<OptimizationItem>): void {
    const totalSegments = cuts.reduce((sum, cut) => sum + cut.segmentCount, 0);
    const totalStockLength = cuts.reduce((sum, cut) => sum + cut.stockLength, 0);
    const totalWaste = cuts.reduce((sum, cut) => sum + cut.remainingLength, 0);
    
    // Validate segment lengths match input lengths
    if (process.env['NODE_ENV'] !== 'production' && items) {
      const inputSet = new Set(items.map(i => i.length));
      for (const cut of cuts) {
        for (const seg of cut.segments) {
          if (!inputSet.has(seg.length)) {
            this.logger.warn('Unit scale mismatch detected', {
              segmentLength: seg.length,
              inputLengths: Array.from(inputSet)
            });
          }
        }
      }
    }
    
    // Invariant 1: totalSegments = Σ cut.segmentCount
    const calculatedTotalSegments = cuts.reduce((sum, cut) => sum + cut.segmentCount, 0);
    if (totalSegments !== calculatedTotalSegments) {
      throw new Error(`Invariant violation: totalSegments (${totalSegments}) !== Σ cut.segmentCount (${calculatedTotalSegments})`);
    }

    // Invariant 2: usedLength + remainingLength === stockLength for each cut
    for (const cut of cuts) {
      const tolerance = 1e-9;
      const sum = cut.usedLength + cut.remainingLength;
      if (Math.abs(sum - cut.stockLength) > tolerance) {
        throw new Error(`Invariant violation: usedLength (${cut.usedLength}) + remainingLength (${cut.remainingLength}) !== stockLength (${cut.stockLength}) for cut ${cut.id}`);
      }
    }

    if (process.env['NODE_ENV'] !== 'production') {
      const efficiency = totalStockLength > 0 ? ((totalStockLength - totalWaste) / totalStockLength) * 100 : 0;
      this.logger.debug('Global invariants validated', {
        totalSegments,
        stockCount: cuts.length,
        efficiency: efficiency.toFixed(2)
      });
    }
  }

  /**
   * Ensure constraints have all required fields with defaults
   */
  protected ensureConstraints(constraints: Partial<EnhancedConstraints>): EnhancedConstraints {
    return {
      kerfWidth: constraints.kerfWidth ?? 3.5,
      startSafety: constraints.startSafety ?? 2.0,
      endSafety: constraints.endSafety ?? 2.0,
      minScrapLength: constraints.minScrapLength ?? 75,
      energyPerStock: constraints.energyPerStock ?? 0.5,
      maxWastePercentage: constraints.maxWastePercentage ?? 10,
      maxCutsPerStock: constraints.maxCutsPerStock ?? 50,
      safetyMargin: constraints.safetyMargin ?? 2,
      allowPartialStocks: constraints.allowPartialStocks ?? true,
      prioritizeSmallWaste: constraints.prioritizeSmallWaste ?? true,
      reclaimWasteOnly: constraints.reclaimWasteOnly ?? false,
      balanceComplexity: constraints.balanceComplexity ?? true,
      respectMaterialGrades: constraints.respectMaterialGrades ?? true
    };
  }

  /**
   * Calculate execution time from context start time
   */
  protected getExecutionTime(context: OptimizationContext): number {
    return Date.now() - context.startTime;
  }
}

