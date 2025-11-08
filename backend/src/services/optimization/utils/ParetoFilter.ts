/**
 * Pareto Filter
 * 
 * Filters cutting patterns using Pareto optimality:
 * - Groups patterns by stock ID
 * - Sorts by (total pieces desc, waste asc)
 * - Removes dominated patterns within same stock
 * 
 * @module optimization/utils
 */

import type { ILogger } from '../../logger';
import type { Pattern } from './PatternGenerator';

/**
 * Algorithm pattern format (used by BFD/FFD/Genetic)
 */
export interface AlgorithmPattern {
  readonly stockLength: number;
  readonly pattern: Map<number, number>; // length -> count
  readonly used: number;
  readonly waste: number;
}

/**
 * Pareto Filter
 */
export class ParetoFilter {
  constructor(private readonly logger: ILogger) {}

  /**
   * Filter patterns using per-stock Pareto optimality
   * 
   * A pattern p1 dominates p2 if:
   * - Same stock: p1 has more pieces AND less waste
   * OR
   * - Same stock: same pieces but p1 has less waste
   * 
   * @param patterns - All patterns to filter
   * @returns Filtered patterns (Pareto optimal set)
   */
  paretoPerStock(patterns: ReadonlyArray<Pattern>): ReadonlyArray<Pattern> {
    // Group by stock ID
    const byStock = new Map<string, Pattern[]>();
    
    for (const pattern of patterns) {
      const list = byStock.get(pattern.stockId) || [];
      list.push(pattern);
      byStock.set(pattern.stockId, list);
    }

    const filtered: Pattern[] = [];

    // Filter each stock group independently
    for (const [stockId, stockPatterns] of byStock.entries()) {
      const filteredStock = this.filterStock(stockId, stockPatterns);
      filtered.push(...filteredStock);
    }

    this.logger.debug('[ParetoFilter] Filtered patterns:', {
      inputCount: patterns.length,
      outputCount: filtered.length,
      reduction: patterns.length - filtered.length
    });

    return filtered;
  }

  /**
   * Filter patterns for a single stock
   * 
   * @param stockId - Stock identifier
   * @param patterns - Patterns for this stock
   * @returns Pareto optimal patterns for this stock
   */
  private filterStock(stockId: string, patterns: Pattern[]): ReadonlyArray<Pattern> {
    if (patterns.length === 0) {
      return [];
    }

    // Annotate with total pieces count
    const annotated = patterns.map(p => ({
      pattern: p,
      totalPieces: p.cuts.reduce((sum, c) => sum + c.qty, 0)
    }));

    // Sort by: total pieces desc, waste asc
    annotated.sort((a, b) => {
      if (a.totalPieces !== b.totalPieces) {
        return b.totalPieces - a.totalPieces; // desc: more pieces first
      }
      return a.pattern.waste - b.pattern.waste; // asc: less waste first
    });

    // Keep only non-dominated patterns
    const kept: Pattern[] = [];

    for (const annotatedPattern of annotated) {
      const isDominated = kept.some(keptPattern => {
        const keptPieces = keptPattern.cuts.reduce((sum, c) => sum + c.qty, 0);
        const patternPieces = annotatedPattern.totalPieces;

        // Check domination:
        // 1. Same pieces but less waste → dominates
        // 2. More pieces and less-or-equal waste → dominates
        return (
          (keptPieces === patternPieces && keptPattern.waste < annotatedPattern.pattern.waste) ||
          (keptPieces > patternPieces && keptPattern.waste <= annotatedPattern.pattern.waste)
        );
      });

      if (!isDominated) {
        kept.push(annotatedPattern.pattern);
      }
    }

    this.logger.debug('[ParetoFilter] Filtered stock patterns:', {
      stockId,
      inputCount: patterns.length,
      outputCount: kept.length
    });

    return kept;
  }

  /**
   * Filter algorithm patterns (Map-based) using per-stock Pareto optimality
   * 
   * @param patterns - Algorithm patterns to filter
   * @returns Filtered patterns (Pareto optimal set)
   */
  paretoPerStockAlgorithm(patterns: ReadonlyArray<AlgorithmPattern>): AlgorithmPattern[] {
    if (patterns.length === 0) {
      return [];
    }

    // Group by stock length
    const byStock = new Map<number, AlgorithmPattern[]>();
    
    for (const pattern of patterns) {
      const list = byStock.get(pattern.stockLength) || [];
      list.push(pattern);
      byStock.set(pattern.stockLength, list);
    }

    const filtered: AlgorithmPattern[] = [];

    // Filter each stock group independently
    for (const [stockLength, stockPatterns] of byStock.entries()) {
      const filteredStock = this.filterStockAlgorithm(stockLength, stockPatterns);
      filtered.push(...filteredStock);
    }

    this.logger.debug('[ParetoFilter] Filtered algorithm patterns:', {
      inputCount: patterns.length,
      outputCount: filtered.length,
      reduction: patterns.length - filtered.length
    });

    return filtered;
  }

  /**
   * Filter algorithm patterns for a single stock
   * 
   * @param stockLength - Stock length identifier
   * @param patterns - Patterns for this stock
   * @returns Pareto optimal patterns for this stock
   */
  private filterStockAlgorithm(stockLength: number, patterns: AlgorithmPattern[]): AlgorithmPattern[] {
    if (patterns.length === 0) {
      return [];
    }

    // Annotate with total pieces count
    const annotated = patterns.map(p => ({
      pattern: p,
      totalPieces: Array.from(p.pattern.values()).reduce((sum, count) => sum + count, 0)
    }));

    // Sort by: total pieces desc, waste asc
    annotated.sort((a, b) => {
      if (a.totalPieces !== b.totalPieces) {
        return b.totalPieces - a.totalPieces; // desc: more pieces first
      }
      return a.pattern.waste - b.pattern.waste; // asc: less waste first
    });

    // Keep only non-dominated patterns
    const kept: AlgorithmPattern[] = [];

    for (const annotatedPattern of annotated) {
      const isDominated = kept.some(keptPattern => {
        const keptPieces = Array.from(keptPattern.pattern.values()).reduce((sum, count) => sum + count, 0);
        const patternPieces = annotatedPattern.totalPieces;

        // Check domination:
        // 1. Same pieces but less waste → dominates
        // 2. More pieces and less-or-equal waste → dominates
        return (
          (keptPieces === patternPieces && keptPattern.waste < annotatedPattern.pattern.waste) ||
          (keptPieces > patternPieces && keptPattern.waste <= annotatedPattern.pattern.waste)
        );
      });

      if (!isDominated) {
        kept.push(annotatedPattern.pattern);
      }
    }

    this.logger.debug('[ParetoFilter] Filtered algorithm stock patterns:', {
      stockLength,
      inputCount: patterns.length,
      outputCount: kept.length
    });

    return kept;
  }
}

