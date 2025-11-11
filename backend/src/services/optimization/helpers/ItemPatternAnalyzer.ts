/**
 * @fileoverview Item Pattern Analyzer
 * @module ItemPatternAnalyzer
 * @version 1.0.0
 * @description Analyzes item patterns for optimization
 * Extracted from BFDAlgorithm to follow Single Responsibility Principle
 */

import { OptimizationItem } from "../../../types";
import type { ILogger } from "../../logger";

/**
 * Analysis result for item patterns
 */
export interface PatternAnalysis {
  readonly uniqueLengths: number;
  readonly totalItems: number;
  readonly lengthCounts: ReadonlyMap<number, number>;
  readonly mostCommonLength: number | null;
  readonly mostCommonCount: number;
}

/**
 * Service for analyzing item length patterns
 * Helps optimize cutting by understanding item distribution
 * Follows Single Responsibility Principle (SRP)
 */
export class ItemPatternAnalyzer {
  private readonly logger: ILogger;
  private patternCache: Map<number, number> = new Map();

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  /**
   * Analyze item patterns and cache results
   *
   * @param items - Items to analyze
   * @returns Pattern analysis results
   */
  public analyze(items: ReadonlyArray<OptimizationItem>): PatternAnalysis {
    this.patternCache.clear();

    // Count occurrences of each length
    for (const item of items) {
      const count = this.patternCache.get(item.length) ?? 0;
      this.patternCache.set(item.length, count + 1);
    }

    // Find most common length
    let mostCommonLength: number | null = null;
    let mostCommonCount = 0;

    for (const [length, count] of this.patternCache.entries()) {
      if (count > mostCommonCount) {
        mostCommonLength = length;
        mostCommonCount = count;
      }
    }

    const result: PatternAnalysis = {
      uniqueLengths: this.patternCache.size,
      totalItems: items.length,
      lengthCounts: new Map(this.patternCache),
      mostCommonLength,
      mostCommonCount,
    };

    this.logger.debug("Item patterns analyzed", {
      uniqueLengths: result.uniqueLengths,
      totalItems: result.totalItems,
      mostCommonLength: result.mostCommonLength,
      mostCommonCount: result.mostCommonCount,
    });

    return result;
  }

  /**
   * Get the count for a specific length
   *
   * @param length - Item length to check
   * @returns Count of items with that length
   */
  public getCount(length: number): number {
    return this.patternCache.get(length) ?? 0;
  }

  /**
   * Check if a length exists in the pattern
   *
   * @param length - Item length to check
   * @returns True if length exists
   */
  public hasLength(length: number): boolean {
    return this.patternCache.has(length);
  }

  /**
   * Get all unique lengths
   *
   * @returns Array of unique lengths
   */
  public getUniqueLengths(): number[] {
    return Array.from(this.patternCache.keys());
  }

  /**
   * Clear the pattern cache
   */
  public clear(): void {
    this.patternCache.clear();
  }

  /**
   * Get complexity score based on pattern diversity
   *
   * @returns Score from 0.0 to 1.0, where higher means more complex
   */
  public getComplexityScore(): number {
    if (this.patternCache.size === 0) return 0;

    // More unique lengths = more complex
    // Normalized by total items
    const uniqueRatio =
      this.patternCache.size /
      Array.from(this.patternCache.values()).reduce(
        (sum, count) => sum + count,
        0,
      );

    return Math.min(uniqueRatio * 2, 1.0); // Scale and cap at 1.0
  }
}
