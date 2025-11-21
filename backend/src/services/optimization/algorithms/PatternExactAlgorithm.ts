/**
 * LEMNİX Pattern Exact Search Algorithm
 * Exact pattern-based optimization with lexicographic objectives
 *
 * @module optimization/algorithms
 * @version 1.0.0
 * @architecture Pattern enumeration + exact search with lexicographic optimization
 *
 * IMPORTANT: This is NOT classical column generation (RMP + pricing problem).
 * This is pattern enumeration + exact search with lexicographic optimization.
 *
 * Algorithm:
 * 1. Generate all feasible cutting patterns for each stock length
 * 2. Compute theoretical lower bound (minimum stocks)
 * 3. Use DFS + memoization to find exact demand-satisfying combinations
 * 4. Guarantee lexicographic optimization: minimize stocks first, then waste
 *
 * Time Complexity: O(P × 2^S × D) where P=patterns, S=max stocks, D=demand items
 * Space Complexity: O(P + memo states)
 * Best For: Exact solutions, guaranteed optimal within search range
 */

import {
  OptimizationItem,
  Cut,
  CuttingSegment,
  OptimizationAlgorithm,
  WasteCategory,
  ProfileType,
} from "../../../types";
import { BaseAlgorithm } from "../core/BaseAlgorithm";
import { OptimizationContext } from "../core/OptimizationContext";
import { AdvancedOptimizationResult, StockSummary } from "../types";
import { StockCalculator } from "../helpers/StockCalculator";
import { WasteAnalyzer } from "../helpers/WasteAnalyzer";
import { CostCalculator } from "../helpers/CostCalculator";
import { MetricsCalculator } from "../helpers/MetricsCalculator";
import type { ILogger } from "../../logger";
import { PatternGenerator } from "../domain/PatternGenerator";
import {
  MemoizedPatternSolver,
  SolverTimeoutError,
} from "../domain/PatternSolver";
import {
  computeLowerBound,
  canSatisfyDemand,
} from "../domain/BoundsCalculator";
import { Pattern } from "../domain/Pattern";

/**
 * Material type constant
 */
const MATERIAL_TYPE = "aluminum" as const;

/**
 * Configuration constants
 */
const CONSTANTS = {
  /** Per-stock count timeout (ms) */
  TIMEOUT_PER_STOCK_COUNT: 60000,

  /** Search range beyond lower bound */
  SEARCH_RANGE: 10,

  /** Minimum utilization for patterns */
  MIN_PATTERN_UTILIZATION: 0.3,

  /** Maximum patterns per stock */
  MAX_PATTERNS_PER_STOCK: 50,
} as const;

/**
 * Pattern Exact Search Algorithm
 * Extends BaseAlgorithm with pattern-based exact optimization
 */
export class PatternExactAlgorithm extends BaseAlgorithm {
  public readonly name = OptimizationAlgorithm.PATTERN_EXACT;
  public readonly complexity = "O(2^n)" as const;
  public readonly scalability = 7; // Excellent for small-medium, slower for large

  /** Algorithm capabilities */
  public readonly capabilities = {
    exact: true, // Guarantees optimal within search range
    lexicographic: true, // Min stocks, then min waste
    multiStock: true, // Handles multiple stock lengths
    deterministic: true, // Same input → same output
  } as const;

  private readonly patternGenerator: PatternGenerator;
  private readonly patternSolver: MemoizedPatternSolver;

  constructor(logger: ILogger) {
    super(logger);
    this.patternGenerator = new PatternGenerator(logger, {
      minUtilization: CONSTANTS.MIN_PATTERN_UTILIZATION,
      maxPatterns: CONSTANTS.MAX_PATTERNS_PER_STOCK,
      enableDominanceFilter: true,
    });
    this.patternSolver = new MemoizedPatternSolver(logger);
  }

  /**
   * Main optimization method
   * Implements pattern-based exact search with lexicographic objectives
   */
  public async optimize(
    context: OptimizationContext,
  ): Promise<AdvancedOptimizationResult> {
    this.logger.info("[PatternExact] Starting optimization", {
      requestId: context.requestId,
      items: context.items.length,
      totalPieces: context.getTotalItemCount(),
      stockLengths: context.stockLengths,
      itemsDetail: context.items.map((i) => ({
        length: i.length,
        quantity: i.quantity,
      })),
    });

    // Convert OptimizationItems to demand map
    const demand = new Map<number, number>();
    for (const item of context.items) {
      const current = demand.get(item.length) || 0;
      demand.set(item.length, current + item.quantity);
    }

    this.logger.info("[PatternExact] Demand map created", {
      demand: Array.from(demand.entries()),
      stockLengths: context.stockLengths,
    });

    // Validate demand can be satisfied
    if (!canSatisfyDemand(demand, context.stockLengths)) {
      throw new Error(
        "Demand contains items too large for available stock lengths",
      );
    }

    // Compute lower bound
    const lowerBound = computeLowerBound(
      demand,
      context.stockLengths,
      this.logger,
    );
    this.logger.info("[PatternExact] Lower bound computed", { lowerBound });

    // Generate patterns for all stock lengths
    const allPatterns: Pattern[] = [];
    for (const stockLength of context.stockLengths) {
      const patterns = this.patternGenerator.generatePatterns(
        stockLength,
        demand,
        {
          kerfWidth: context.constraints.kerfWidth,
          startSafety: context.constraints.startSafety,
          endSafety: context.constraints.endSafety,
        },
      );
      allPatterns.push(...patterns);
      this.logger.debug("[PatternExact] Generated patterns for stock", {
        stockLength,
        count: patterns.length,
      });
    }

    this.logger.info("[PatternExact] Total patterns generated", {
      totalPatterns: allPatterns.length,
    });

    // Lexicographic search: try lower bound first, then increment
    for (
      let stocks = lowerBound;
      stocks <= lowerBound + CONSTANTS.SEARCH_RANGE;
      stocks++
    ) {
      this.logger.info("[PatternExact] Trying stock count", { stocks });

      try {
        const solution = this.patternSolver.solve(
          allPatterns,
          demand,
          stocks,
          CONSTANTS.TIMEOUT_PER_STOCK_COUNT,
        );

        if (solution) {
          this.logger.info("[PatternExact] Solution found", {
            stocks: solution.totalStocks,
            waste: solution.totalWaste,
          });

          // Convert solution to Cuts
          const cuts = this.convertSolutionToCuts(solution, context);

          // Calculate all metrics
          const result = this.createOptimizationResult(
            cuts,
            context,
            solution.totalWaste,
            stocks,
          );

          return result;
        }

        this.logger.debug("[PatternExact] No solution found for stock count", {
          stocks,
        });
      } catch (error) {
        if (error instanceof SolverTimeoutError) {
          this.logger.warn("[PatternExact] Timeout at stock count", { stocks });
          // Continue to next stock count
          continue;
        }
        // Other errors propagate
        throw error;
      }
    }

    // No solution found in search range
    throw new Error(
      `No solution found within ${CONSTANTS.SEARCH_RANGE} stocks of lower bound ${lowerBound}`,
    );
  }

  /**
   * Convert PatternSolution to Cut[] format
   */
  private convertSolutionToCuts(
    solution: {
      patternCounts: ReadonlyArray<{ patternId: string; count: number }>;
      allPatterns: ReadonlyArray<Pattern>;
    },
    context: OptimizationContext,
  ): Cut[] {
    const cuts: Cut[] = [];
    let stockIndex = 0;

    // Process each pattern usage
    for (const { patternId, count } of solution.patternCounts) {
      const pattern = solution.allPatterns.find((p) => p.id === patternId);
      if (!pattern) {
        this.logger.warn("[PatternExact] Pattern not found", { patternId });
        continue;
      }

      // Create N cuts for this pattern
      for (let i = 0; i < count; i++) {
        const cut = this.createCutFromPattern(pattern, context, stockIndex);
        cuts.push(cut);
        stockIndex++;
      }
    }

    return cuts;
  }

  /**
   * Create Cut from Pattern
   */
  private createCutFromPattern(
    pattern: Pattern,
    context: OptimizationContext,
    stockIndex: number,
  ): Cut {
    // Create segments from pattern items (one segment per individual item)
    const segments: CuttingSegment[] = [];
    let segmentIndex = 0;
    let usedLength = context.constraints.startSafety;

    for (const [length, itemCount] of pattern.items) {
      for (let j = 0; j < itemCount; j++) {
        // Add kerf before segment (except first segment)
        if (segmentIndex > 0 && context.constraints.kerfWidth > 0) {
          usedLength += context.constraints.kerfWidth;
        }

        const segment: CuttingSegment = {
          id: `segment-${stockIndex}-${segmentIndex}`,
          cutId: `cut-${stockIndex}`,
          sequenceNumber: segmentIndex,
          profileType:
            context.items[0]?.profileType || (MATERIAL_TYPE as ProfileType),
          length,
          quantity: 1,
          position: usedLength,
          endPosition: usedLength + length,
          tolerance: 0.5,
          surfaceFinish: undefined,
          specialInstructions: undefined,
          workOrderItemId: `item-${length}`,
          originalLength: length,
          actualLength: undefined,
          qualityCheck: true,
          unitCost: 0,
          totalCost: 0,
          workOrderId: undefined,
          productName: undefined,
          color: undefined,
          size: undefined,
          note: undefined,
        };

        segments.push(segment);
        usedLength += length;
        segmentIndex++;
      }
    }

    // Calculate kerf loss
    const kerfLoss =
      context.constraints.kerfWidth > 0 && segments.length > 0
        ? (segments.length - 1) * context.constraints.kerfWidth
        : 0;

    // ✅ CRITICAL FIX: endSafety is 0 (all fire is cut from start)
    // Pattern generation already subtracted startSafety
    // So finalUsedLength = usedLength (no additional safety zones)
    const finalUsedLength = usedLength;
    const remainingLength = pattern.stockLength - finalUsedLength;

    return {
      id: `cut-${stockIndex}`,
      cuttingPlanId: `plan-${context.requestId}`,
      stockIndex,
      stockId: undefined,
      stockLength: pattern.stockLength,
      materialType: MATERIAL_TYPE,
      profileType:
        context.items[0]?.profileType || (MATERIAL_TYPE as ProfileType),
      segments,
      segmentCount: segments.length,
      usedLength: finalUsedLength,
      remainingLength,
      wasteCategory: this.calculateWasteCategory(remainingLength),
      isReclaimable: remainingLength >= 50,
      estimatedCuttingTime: segments.length * 2, // Rough estimate
      setupTime: 5,
      kerfLoss,
      safetyMargin: 0,
      toleranceCheck: true,
      qualityNotes: undefined,
      sequence: stockIndex,
    };
  }

  /**
   * Calculate waste category (protected to match base class)
   */
  protected override calculateWasteCategory(
    remainingLength: number,
  ): WasteCategory {
    return super.calculateWasteCategory(remainingLength);
  }

  /**
   * Create AdvancedOptimizationResult from Cuts
   */
  private createOptimizationResult(
    cuts: Cut[],
    context: OptimizationContext,
    totalWaste: number,
    stockCount: number,
  ): AdvancedOptimizationResult {
    const constraints = context.constraints;

    // Basic metrics
    const totalLength = cuts.reduce((sum, cut) => sum + cut.usedLength, 0);
    const totalSegments = cuts.reduce(
      (sum, cut) => sum + cut.segments.reduce((s, seg) => s + seg.quantity, 0),
      0,
    );
    const totalStockLength = cuts.reduce(
      (sum, cut) => sum + cut.stockLength,
      0,
    );

    // ✅ CRITICAL FIX: Calculate totalWaste from actual cuts, not from PatternSolver
    // PatternSolver's totalWaste is based on raw patterns (no startSafety)
    // Real totalWaste = sum of cut.remainingLength which already accounts for startSafety
    const actualTotalWaste = cuts.reduce(
      (sum, cut) => sum + cut.remainingLength,
      0,
    );
    const efficiency = StockCalculator.calculateEfficiency(
      totalStockLength,
      actualTotalWaste,
    );

    // Waste distribution
    const wasteDistribution = WasteAnalyzer.calculateWasteDistribution(cuts);

    // Cost breakdown
    const costBreakdown = CostCalculator.calculateCostBreakdown(
      cuts,
      context.costModel,
      constraints,
    );

    // Performance metrics
    const performanceMetrics = MetricsCalculator.calculatePerformanceMetrics(
      "pattern-exact",
      cuts.length,
    );

    // Quality score
    const qualityScore = MetricsCalculator.calculateQualityScore(
      efficiency,
      actualTotalWaste,
    );

    // Detailed waste analysis
    const detailedWasteAnalysis = {
      minimal: wasteDistribution.minimal || 0,
      small: wasteDistribution.small || 0,
      medium: wasteDistribution.medium || 0,
      large: wasteDistribution.large || 0,
      excessive: wasteDistribution.excessive || 0,
      totalPieces: stockCount,
      averageWaste: actualTotalWaste / stockCount,
    };

    // Optimize stockSummary
    const stockSummary = this.createStockSummary(cuts);

    return {
      cuts,
      totalWaste: actualTotalWaste,
      efficiency,
      stockCount,
      totalSegments,
      wastePercentage: (actualTotalWaste / totalLength) * 100,
      averageCutsPerStock: cuts.length / stockCount,
      totalLength,
      setupTime: cuts.length * 5,
      materialUtilization: efficiency,
      cuttingComplexity: MetricsCalculator.calculateCuttingComplexity(
        totalSegments,
        cuts.length,
      ),
      cuttingTime: cuts.reduce((sum, cut) => sum + cut.estimatedCuttingTime, 0),
      totalTime:
        cuts.length * 5 +
        cuts.reduce((sum, cut) => sum + cut.estimatedCuttingTime, 0),
      materialCost: costBreakdown.materialCost,
      wasteCost: costBreakdown.wasteCost,
      laborCost: costBreakdown.timeCost,
      totalCost: costBreakdown.totalCost,
      costPerMeter: CostCalculator.calculateCostPerMeter(
        costBreakdown.totalCost,
        totalLength,
      ),
      qualityScore,
      reclaimableWastePercentage:
        WasteAnalyzer.calculateReclaimableWastePercentage(cuts),
      algorithm: this.name,
      executionTimeMs: Date.now() - context.startTime,
      wasteDistribution,
      constraints: context.constraints,
      recommendations: [],
      efficiencyCategory: this.getEfficiencyCategory(efficiency),
      detailedWasteAnalysis,
      optimizationScore: qualityScore,
      // Advanced fields
      paretoFrontier: [],
      costBreakdown,
      performanceMetrics,
      confidence: 1.0,
      totalKerfLoss: cuts.reduce((sum, cut) => sum + cut.kerfLoss, 0),
      totalSafetyReserve: cuts.reduce((sum, cut) => sum + cut.safetyMargin, 0),
      stockSummary,
    };
  }

  /**
   * Create stock summary
   */
  private createStockSummary(cuts: Cut[]): StockSummary[] {
    // Group cuts by stock length
    const byStockLength = new Map<number, Cut[]>();
    for (const cut of cuts) {
      const existing = byStockLength.get(cut.stockLength) || [];
      existing.push(cut);
      byStockLength.set(cut.stockLength, existing);
    }

    const summaries: StockSummary[] = [];
    for (const [stockLength, stockCuts] of byStockLength) {
      const totalWaste = stockCuts.reduce(
        (sum, cut) => sum + cut.remainingLength,
        0,
      );
      const avgWaste = totalWaste / stockCuts.length;
      const totalUsed = stockCuts.reduce((sum, cut) => sum + cut.usedLength, 0);
      const efficiency = (totalUsed / (stockLength * stockCuts.length)) * 100;

      summaries.push({
        stockLength,
        cutCount: stockCuts.length,
        patterns: [],
        avgWaste,
        totalWaste,
        efficiency,
      });
    }

    return summaries;
  }

  /**
   * Get efficiency category
   */
  private getEfficiencyCategory(
    efficiency: number,
  ): "excellent" | "good" | "average" | "poor" {
    if (efficiency >= 95) return "excellent";
    if (efficiency >= 85) return "good";
    if (efficiency >= 70) return "average";
    return "poor";
  }
}
