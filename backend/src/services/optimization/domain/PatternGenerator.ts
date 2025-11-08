/**
 * LEMNİX Pattern Generator
 * Generates all feasible cutting patterns for a stock length
 * 
 * @module optimization/domain
 * @version 1.0.0
 * 
 * Strategy: Bounded knapsack-style DFS (not nested loops)
 * For 6-12 unique lengths, nested loops explode combinatorially
 */

import type { ILogger } from '../../logger';
import { Pattern, createPatternId, calculateUtilization, isEmptyPattern, dominates } from './Pattern';

/**
 * Configuration for pattern generation
 */
export interface PatternGeneratorConfig {
  /** Minimum utilization to keep a pattern (0-1) */
  readonly minUtilization: number;
  
  /** Maximum patterns to keep per stock */
  readonly maxPatterns: number;
  
  /** Enable dominance filtering */
  readonly enableDominanceFilter: boolean;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: PatternGeneratorConfig = {
  minUtilization: 0.3,  // Keep patterns using at least 30% of stock
  maxPatterns: 50,      // Top 50 patterns
  enableDominanceFilter: true
};

/**
 * Pattern generator class
 */
export class PatternGenerator {
  private readonly logger: ILogger;
  private readonly config: PatternGeneratorConfig;

  constructor(logger: ILogger, config: Partial<PatternGeneratorConfig> = {}) {
    this.logger = logger;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate all feasible cutting patterns for a stock length
   * 
   * Uses DFS to explore all combinations without combinatorial explosion.
   * 
   * @param stockLength - Raw length of stock bar
   * @param demands - Map of item length -> quantity
   * @param constraints - Optional constraints (kerf, safety margins)
   * @returns Array of feasible patterns
   */
  public generatePatterns(
    stockLength: number,
    demands: ReadonlyMap<number, number>,
    constraints?: { kerfWidth?: number; startSafety?: number; endSafety?: number }
  ): ReadonlyArray<Pattern> {
    if (demands.size === 0) {
      return [];
    }

    this.logger.debug('[PatternGenerator] Generating patterns', {
      stockLength,
      itemCount: demands.size
    });

    // ✅ SAFE: No kerf/safety in PatternGenerator
    // Kerf and safety margins are applied ONLY in algorithm's cut creation
    // This ensures pattern represents "items per raw stock length" without constraints
    
    // Convert demands to sorted array of items with theoretical max counts
    const items = Array.from(demands.entries())
      .map(([length, demandMaxCount]) => {
        // Calculate theoretical max that can fit in raw stock length
        const theoreticalMax = Math.floor(stockLength / length);
        
        // Use minimum of theoretical max and demand
        const maxCount = Math.min(theoreticalMax, demandMaxCount);
        return { length, maxCount };
      })
      .sort((a, b) => b.length - a.length); // Sort by length descending

    const minItemLength = items[items.length - 1].length;

    // DFS to generate all patterns
    const patterns: Pattern[] = [];
    const currentItems = new Map<number, number>();

    this.generatePatternsDFS(
      stockLength, // Use raw stock length
      stockLength,
      items,
      0,
      minItemLength,
      0, // No kerf in pattern generation
      currentItems,
      patterns
    );

    this.logger.debug('[PatternGenerator] Generated raw patterns', {
      stockLength,
      count: patterns.length
    });

    // Filter and sort patterns
    const filtered = this.filterPatterns(patterns, stockLength);

    this.logger.debug('[PatternGenerator] Final patterns', {
      stockLength,
      count: filtered.length
    });

    return filtered;
  }

  /**
   * DFS to generate patterns (with kerf support)
   * Based on BFD's generateCombinations approach
   * 
   * @param remaining - Remaining usable length
   * @param stockLength - Original stock length
   * @param items - Available items (sorted by length desc)
   * @param itemIndex - Current item index
   * @param minItemLength - Minimum item length (for pruning)
   * @param kerfWidth - Kerf width between cuts
   * @param currentItems - Current pattern being built
   * @param patterns - Accumulated patterns
   */
  private generatePatternsDFS(
    remaining: number,
    stockLength: number,
    items: ReadonlyArray<{ length: number; maxCount: number }>,
    itemIndex: number,
    minItemLength: number,
    kerfWidth: number,
    currentItems: Map<number, number>,
    patterns: Pattern[]
  ): void {
    // Base case: no more space or items
    if (remaining < minItemLength || itemIndex >= items.length) {
      // Add pattern if it has items
      if (currentItems.size > 0) {
        const pattern = this.createPatternFromItems(currentItems, remaining, stockLength, kerfWidth);
        patterns.push(pattern);
      }
      return;
    }

    const item = items[itemIndex];

    // Calculate current pattern usage (before adding current item)
    let currentUsed = 0;
    let currentSegments = 0;
    for (const [length, cnt] of currentItems) {
      currentUsed += length * cnt;
      currentSegments += cnt;
    }
    
    const currentKerf = kerfWidth > 0 && currentSegments > 0
      ? (currentSegments - 1) * kerfWidth
      : 0;
    
    const remainingSpace = remaining - currentUsed - currentKerf;

    // Calculate max count for this item based on remaining space
    const maxCount = kerfWidth === 0
      ? Math.min(item.maxCount, Math.floor(remainingSpace / item.length))
      : Math.min(item.maxCount, Math.floor((remainingSpace + kerfWidth) / (item.length + kerfWidth)));

    // Try all possible counts for current item
    for (let count = 0; count <= maxCount; count++) {
      // Create new pattern (don't mutate currentItems during iteration)
      if (count > 0) {
        currentItems.set(item.length, count);
      }

      // Calculate new remaining after adding this count
      const newUsed = currentUsed + (item.length * count);
      const newSegments = currentSegments + count;
      const newKerf = kerfWidth > 0 && newSegments > 0
        ? (newSegments - 1) * kerfWidth
        : 0;
      const newRemaining = remaining - newUsed - newKerf;

      // Recurse
      this.generatePatternsDFS(
        newRemaining,
        stockLength,
        items,
        itemIndex + 1,
        minItemLength,
        kerfWidth,
        currentItems,
        patterns
      );

      // Backtrack
      if (count > 0) {
        currentItems.delete(item.length);
      }
    }
  }

  /**
   * Create Pattern from current items and waste
   */
  private createPatternFromItems(
    items: Map<number, number>,
    remainingSpace: number,
    stockLength: number,
    kerfWidth: number
  ): Pattern {
    // Convert mutable map to immutable
    const itemsMap = new Map(items);
    
    // Calculate total segments and used length with kerf
    let totalUsed = 0;
    let totalSegments = 0;
    for (const [length, count] of items) {
      totalUsed += length * count;
      totalSegments += count;
    }
    
    // Add kerf loss (between segments)
    if (kerfWidth > 0 && totalSegments > 0) {
      totalUsed += (totalSegments - 1) * kerfWidth;
    }
    
    // Waste is the remaining space (should equal remainingSpace)
    const waste = remainingSpace;
    
    // Calculate utilization based on actual used length (with kerf)
    const utilization = stockLength > 0 ? totalUsed / stockLength : 0;
    
    return {
      id: createPatternId(stockLength, itemsMap),
      stockLength,
      items: itemsMap,
      waste,
      utilization
    };
  }

  /**
   * Filter patterns: empty, low-utilization, dominated
   * Then sort by waste and keep top N
   */
  private filterPatterns(
    patterns: ReadonlyArray<Pattern>,
    stockLength: number
  ): ReadonlyArray<Pattern> {
    // Remove empty patterns
    const nonEmptyPatterns = patterns.filter(p => !isEmptyPattern(p));

    // Filter by utilization
    const utilizationFiltered = nonEmptyPatterns.filter(
      p => p.utilization >= this.config.minUtilization
    );

    // Apply dominance filter if enabled
    let dominanceFiltered: ReadonlyArray<Pattern> = utilizationFiltered;
    if (this.config.enableDominanceFilter) {
      dominanceFiltered = this.applyDominanceFilter(utilizationFiltered);
    }

    // Sort by waste ascending (best patterns first)
    const sorted = [...dominanceFiltered].sort((a, b) => a.waste - b.waste);

    // Keep top N
    const topPatterns = sorted.slice(0, this.config.maxPatterns);

    if (dominanceFiltered.length > topPatterns.length) {
      this.logger.debug('[PatternGenerator] Truncated patterns', {
        before: dominanceFiltered.length,
        after: topPatterns.length
      });
    }

    return topPatterns;
  }

  /**
   * Remove dominated patterns
   */
  private applyDominanceFilter(
    patterns: ReadonlyArray<Pattern>
  ): ReadonlyArray<Pattern> {
    const nondominated: Pattern[] = [];
    
    for (const pattern of patterns) {
      // Check if this pattern is dominated by any other
      const isDominated = nondominated.some(other => 
        dominates(other, pattern)
      );
      
      if (!isDominated) {
        // Remove any existing patterns dominated by this one
        const idx = nondominated.findIndex(p => dominates(pattern, p));
        if (idx >= 0) {
          nondominated.splice(idx, 1);
        }
        nondominated.push(pattern);
      }
    }
    
    return nondominated;
  }
}

