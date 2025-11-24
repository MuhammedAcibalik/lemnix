/**
 * BFD Problem Analyzer Strategy
 * Analyzes problem characteristics and recommends optimization strategy
 *
 * @module optimization/strategies
 * @version 1.0.0
 * @description Problem analysis and strategy selection for BFD algorithm
 */

import { OptimizationItem } from "../../../types";
import { OptimizationContext } from "../core/OptimizationContext";
import type { ILogger } from "../../logger";

/**
 * Problem characteristics analysis result
 */
export interface ProblemCharacteristics {
  readonly uniqueLengths: number;
  readonly totalDemand: number;
  readonly avgQuantityPerLength: number;
  readonly maxQuantity: number;
  readonly complexity: "low" | "medium" | "high" | "extreme";
  readonly recommendedStrategy: "dp" | "traditional";
  readonly estimatedPatternCount: number;
  readonly patternComplexity: number;
}

/**
 * BFD Problem Analyzer
 * Analyzes problem characteristics and recommends optimization strategy
 */
export class BFDProblemAnalyzer {
  constructor(private readonly logger: ILogger) {}

  /**
   * Analyze problem characteristics and recommend strategy
   *
   * Strategy Decision Logic:
   * =======================
   * Small problems (<= 10 lengths, <= 500 demand):
   *   - Complexity: low
   *   - Strategy: DP (pattern-based optimization)
   *
   * Medium problems (11-15 lengths, <= 1000 demand):
   *   - Complexity: medium
   *   - Strategy: DP (with pattern limit)
   *
   * Large problems (16-20 lengths, <= 2000 demand):
   *   - Complexity: high
   *   - Strategy: DP (with strict pattern limit)
   *
   * Extreme problems (>20 lengths OR >2000 demand):
   *   - Complexity: extreme
   *   - Strategy: Traditional BFD (greedy, fast, guaranteed)
   *
   * Pattern Complexity Calculation:
   * ==============================
   * patternComplexity = 2^uniqueLengths × totalDemand
   * If patternComplexity > 1M: Use traditional BFD
   *
   * @param items - Items to analyze
   * @param context - Optimization context
   * @returns Problem characteristics analysis
   */
  public analyzeProblemCharacteristics(
    items: ReadonlyArray<OptimizationItem>,
    context: OptimizationContext,
  ): ProblemCharacteristics {
    // Group items by length
    const lengthGroups = new Map<number, number>();
    items.forEach((item) => {
      const current = lengthGroups.get(item.length) || 0;
      lengthGroups.set(item.length, current + item.quantity);
    });

    const uniqueLengths = lengthGroups.size;
    const totalDemand = Array.from(lengthGroups.values()).reduce(
      (sum, q) => sum + q,
      0,
    );
    const avgQuantityPerLength =
      uniqueLengths > 0 ? totalDemand / uniqueLengths : 0;
    const maxQuantity = Math.max(...lengthGroups.values(), 0);

    // Calculate complexity score
    // Pattern generation complexity grows as O(2^n) where n = unique lengths
    // Combined with total demand for memory estimation
    const patternComplexity = Math.pow(2, uniqueLengths) * totalDemand;
    const estimatedPatternCount = Math.pow(2, uniqueLengths); // Rough estimate

    let complexity: "low" | "medium" | "high" | "extreme";
    let recommendedStrategy: "dp" | "traditional";

    // Decision tree based on problem size
    if (uniqueLengths <= 10 && totalDemand <= 500) {
      complexity = "low";
      recommendedStrategy = "dp";
    } else if (uniqueLengths <= 15 && totalDemand <= 1000) {
      complexity = "medium";
      recommendedStrategy = "dp";
    } else if (uniqueLengths <= 20 && totalDemand <= 2000) {
      complexity = "high";
      recommendedStrategy = "dp"; // Still worth trying with limits
    } else {
      complexity = "extreme";
      recommendedStrategy = "traditional"; // Too complex for pattern-based
    }

    // Additional check: If pattern complexity is prohibitive, use traditional
    if (patternComplexity > 1000000) {
      // 1M threshold
      complexity = "extreme";
      recommendedStrategy = "traditional";
    }

    const analysis: ProblemCharacteristics = {
      uniqueLengths,
      totalDemand,
      avgQuantityPerLength,
      maxQuantity,
      complexity,
      recommendedStrategy,
      estimatedPatternCount,
      patternComplexity,
    };

    this.logger.info("[BFDProblemAnalyzer] Problem analysis completed", {
      analysis,
      itemCount: items.length,
      stockLengths: context.stockLengths.length,
    });

    return analysis;
  }

  /**
   * Determine if DP optimization should be used
   *
   * @param items - Items to optimize
   * @param context - Optimization context
   * @returns True if DP optimization should be used
   */
  public shouldUseDPOptimization(
    items: ReadonlyArray<OptimizationItem>,
    context: OptimizationContext,
  ): boolean {
    const analysis = this.analyzeProblemCharacteristics(items, context);
    const shouldUse = analysis.recommendedStrategy === "dp";

    this.logger.debug("[BFDProblemAnalyzer] DP optimization decision", {
      shouldUse,
      reason: shouldUse
        ? `Complexity: ${analysis.complexity}, estimated patterns: ${analysis.estimatedPatternCount}`
        : `Complexity: ${analysis.complexity}, pattern complexity: ${analysis.patternComplexity}`,
    });

    return shouldUse;
  }

  /**
   * Determine if traditional BFD should be used
   *
   * @param items - Items to optimize
   * @param context - Optimization context
   * @returns True if traditional BFD should be used
   */
  public shouldUseTraditionalBFD(
    items: ReadonlyArray<OptimizationItem>,
    context: OptimizationContext,
  ): boolean {
    const analysis = this.analyzeProblemCharacteristics(items, context);
    const shouldUse = analysis.recommendedStrategy === "traditional";

    this.logger.debug("[BFDProblemAnalyzer] Traditional BFD decision", {
      shouldUse,
      reason: shouldUse
        ? `Complexity: ${analysis.complexity}, pattern complexity too high: ${analysis.patternComplexity}`
        : `Complexity: ${analysis.complexity}, DP optimization recommended`,
    });

    return shouldUse;
  }

  /**
   * Get recommended pattern limit for DP optimization
   *
   * @param items - Items to optimize
   * @param context - Optimization context
   * @returns Recommended pattern limit (undefined = no limit)
   */
  public getRecommendedPatternLimit(
    items: ReadonlyArray<OptimizationItem>,
    context: OptimizationContext,
  ): number | undefined {
    const analysis = this.analyzeProblemCharacteristics(items, context);

    if (analysis.recommendedStrategy !== "dp") {
      return undefined; // Not using DP
    }

    // Set pattern limits based on complexity
    switch (analysis.complexity) {
      case "low":
        return undefined; // No limit for small problems
      case "medium":
        return 50000; // Limit for medium problems
      case "high":
        return 30000; // Stricter limit for large problems
      case "extreme":
        return undefined; // Shouldn't use DP anyway
    }
  }
}
