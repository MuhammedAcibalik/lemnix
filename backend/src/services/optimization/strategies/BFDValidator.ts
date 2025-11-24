/**
 * BFD Validator Strategy
 * Handles validation and finalization of optimization results
 *
 * @module optimization/strategies
 * @version 1.0.0
 * @description Validation and finalization logic for BFD algorithm
 */

import { Cut, CuttingSegment, OptimizationAlgorithm } from "../../../types";
import { OptimizationContext } from "../core/OptimizationContext";
import { AdvancedOptimizationResult, StockSummary } from "../types";
import { StockCalculator } from "../helpers/StockCalculator";
import { WasteAnalyzer } from "../helpers/WasteAnalyzer";
import { CostCalculator } from "../helpers/CostCalculator";
import { MetricsCalculator } from "../helpers/MetricsCalculator";
import { BFDPatternGenerator } from "./BFDPatternGenerator";
import type { ILogger } from "../../logger";

/**
 * Item group structure
 */
export interface ItemGroup {
  readonly length: number;
  readonly quantity: number;
}

/**
 * Validation result
 */
export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: string[];
  readonly warnings: string[];
}

/**
 * BFD Validator
 * Handles validation and finalization of optimization results
 */
export class BFDValidator {
  private readonly ACCOUNTING_PRECISION_THRESHOLD = 0.01;
  private readonly SETUP_TIME_PER_CUT = 5;
  private readonly CUTTING_TIME_PER_SEGMENT = 2;

  constructor(
    private readonly logger: ILogger,
    private readonly patternGenerator: BFDPatternGenerator,
  ) {}

  /**
   * Validate that cuts exactly fulfill the required demand
   *
   * Enhanced error handling with detailed context and logging.
   * Allows minimal overproduction but deficits are errors.
   *
   * @param cuts - Generated cuts
   * @param itemGroups - Required item groups
   * @returns Validation result
   */
  public validateDemandFulfillment(
    cuts: ReadonlyArray<Cut>,
    itemGroups: ReadonlyArray<ItemGroup>,
  ): ValidationResult {
    this.logger.debug(`[BFDValidator] Starting demand validation`, {
      totalCuts: cuts.length,
      itemGroups: itemGroups
        .map((g) => `${g.length}mm: ${g.quantity}`)
        .join(", "),
    });

    // Calculate actual cuts by length
    const actualCuts = new Map<number, number>();
    cuts.forEach((cut, cutIndex) => {
      this.logger.debug(`[BFDValidator] Processing cut ${cutIndex}`, {
        cutId: cut.id,
        stockLength: cut.stockLength,
        segmentCount: cut.segmentCount,
        segments: cut.segments.map((s) => `${s.length}mm`).join(", "),
      });

      cut.segments.forEach((seg) => {
        const current = actualCuts.get(seg.length) || 0;
        actualCuts.set(seg.length, current + 1);
      });
    });

    this.logger.debug(`[BFDValidator] Final actual counts`, {
      actualCuts: Object.fromEntries(actualCuts),
    });

    // Compare with required demand (allow minimal overproduction; deficits are errors)
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const group of itemGroups) {
      const actual = actualCuts.get(group.length) || 0;
      const required = group.quantity;

      this.logger.debug(`[BFDValidator] Checking ${group.length}mm`, {
        required,
        actual,
        diff: actual - required,
      });

      if (actual < required) {
        const diff = required - actual;
        const errorMsg = `${group.length}mm: shortage of ${diff} pieces (required ${required}, got ${actual})`;
        errors.push(errorMsg);
        this.logger.error(`[BFDValidator] Demand shortage detected`, {
          length: group.length,
          required,
          actual,
          shortage: diff,
        });
      } else if (actual > required) {
        const excess = actual - required;
        const warningMsg = `${group.length}mm: overproduced ${excess} pieces (required ${required}, got ${actual})`;
        warnings.push(warningMsg);
        this.logger.warn(`[BFDValidator] Overproduction detected`, {
          length: group.length,
          required,
          actual,
          excess,
        });
      }
    }

    // Log warnings but don't fail on overproduction
    if (warnings.length > 0) {
      this.logger.warn(`[BFDValidator] Overproduction warnings`, {
        warnings,
        note: "Some items were overproduced. This is acceptable but not optimal.",
      });
    }

    if (errors.length > 0) {
      this.logger.error(`[BFDValidator] DEMAND MISMATCH`, {
        errors,
        actualCuts: Object.fromEntries(actualCuts),
        requiredDemand: itemGroups.map((g) => ({
          length: g.length,
          quantity: g.quantity,
        })),
        cutsGenerated: cuts.length,
        totalSegments: cuts.reduce((sum, c) => sum + c.segmentCount, 0),
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate that solution exactly matches demand
   *
   * Used for DP optimization solutions.
   * Allows minimal overproduction (+1-2 pieces) but shortages are errors.
   *
   * @param solution - Pattern solution (from DP optimizer)
   * @param itemGroups - Required item groups
   * @returns Validation result
   */
  public validateExactDemand(
    solution: ReadonlyArray<{
      readonly pattern: {
        readonly pattern: Map<number, number>;
      };
      readonly count: number;
    }>,
    itemGroups: ReadonlyArray<ItemGroup>,
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    this.logger.info(`[BFDValidator] Validating exact demand`, {
      solutionLength: solution.length,
      itemGroupsCount: itemGroups.length,
      itemGroups,
    });

    // Calculate actual cuts by length
    const actualCuts = new Map<number, number>();
    solution.forEach(({ pattern, count }) => {
      for (const [length, patternCount] of pattern.pattern.entries()) {
        const current = actualCuts.get(length) || 0;
        actualCuts.set(length, current + patternCount * count);
      }
    });

    this.logger.info(
      `[BFDValidator] Actual cuts`,
      Object.fromEntries(actualCuts),
    );

    // CRITICAL FIX: Require exact quantity match (no over-production)
    // Compare with required demand - exact match required
    for (const group of itemGroups) {
      const actual = actualCuts.get(group.length) || 0;
      const required = group.quantity;

      if (actual < required) {
        // Shortage is always an error
        const diff = actual - required;
        errors.push(
          `${group.length}mm: shortage ${Math.abs(diff)} (required ${required}, got ${actual})`,
        );
      } else if (actual > required) {
        // Over-production is also an error - exact quantity required
        const excess = actual - required;
        errors.push(
          `${group.length}mm: over-produced ${excess} extra (required ${required}, got ${actual})`,
        );
        this.logger.error(
          `[BFDValidator] Over-produced ${group.length}mm: ${excess} extra pieces. Exact quantity required.`,
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Finalize cuts with proper accounting
   *
   * @param cuts - Cuts to finalize
   * @param context - Optimization context
   * @returns Finalized cuts
   */
  public finalizeCuts(
    cuts: ReadonlyArray<Cut>,
    context: OptimizationContext,
  ): Cut[] {
    return cuts.map((cut) => this.finalizeSingleCut(cut, context));
  }

  /**
   * Finalize single cut
   */
  private finalizeSingleCut(cut: Cut, context: OptimizationContext): Cut {
    // CRITICAL FIX: usedLength does NOT include startSafety, so we add it here for final accounting
    // finalUsedLength = startSafety + usedLength + endSafety
    const finalUsedLength =
      context.constraints.startSafety +
      cut.usedLength +
      context.constraints.endSafety;

    // ✅ CRITICAL FIX: Check for overflow before calculating remaining
    const availableSpace =
      cut.stockLength -
      context.constraints.startSafety -
      context.constraints.endSafety;

    if (cut.usedLength > availableSpace) {
      const overflow = cut.usedLength - availableSpace;
      this.logger.error("Cut usedLength exceeds available space", {
        cutId: cut.id,
        stockLength: cut.stockLength,
        usedLength: cut.usedLength,
        startSafety: context.constraints.startSafety,
        endSafety: context.constraints.endSafety,
        availableSpace,
        overflow: overflow.toFixed(3),
        segmentCount: cut.segmentCount,
        segments: cut.segments.map((s) => ({
          length: s.length,
          position: s.position,
          endPosition: s.endPosition,
        })),
      });
      throw new Error(
        `Accounting violation in cut ${cut.id}: ` +
          `usedLength (${cut.usedLength.toFixed(3)}mm) exceeds available space (${availableSpace.toFixed(3)}mm) ` +
          `by ${overflow.toFixed(3)}mm. ` +
          `Stock: ${cut.stockLength}mm, Start safety: ${context.constraints.startSafety}mm, ` +
          `End safety: ${context.constraints.endSafety}mm. ` +
          `This indicates items were incorrectly placed during optimization.`,
      );
    }

    const finalRemaining = Math.max(0, cut.stockLength - finalUsedLength);

    this.validateStockAccountingWithError(cut, finalUsedLength, finalRemaining);

    const plan = this.patternGenerator.generateCuttingPlan(cut.segments);
    const planLabel = this.patternGenerator.formatCuttingPlanLabel(plan);

    return {
      ...cut,
      usedLength: finalUsedLength,
      remainingLength: finalRemaining,
      wasteCategory: WasteAnalyzer.calculateWasteCategory(finalRemaining),
      isReclaimable: WasteAnalyzer.isReclaimable(
        finalRemaining,
        context.constraints.minScrapLength,
      ),
      plan,
      planLabel,
      profileType: this.determineCutProfileType(cut),
    };
  }

  /**
   * Validate stock accounting with error throwing
   */
  private validateStockAccountingWithError(
    cut: Cut,
    finalUsedLength: number,
    finalRemaining: number,
  ): void {
    if (
      !StockCalculator.validateStockAccounting(
        finalUsedLength,
        finalRemaining,
        cut.stockLength,
      )
    ) {
      const total = finalUsedLength + finalRemaining;
      const difference = Math.abs(total - cut.stockLength);
      this.logger.error("Stock accounting validation failed", {
        cutId: cut.id,
        stockLength: cut.stockLength,
        usedLength: finalUsedLength,
        remaining: finalRemaining,
        total,
        difference,
        segments: cut.segmentCount,
      });
      throw new Error(
        `Accounting violation in cut ${cut.id}: ` +
          `used=${finalUsedLength}mm + remaining=${finalRemaining}mm = ${total}mm ≠ stock=${cut.stockLength}mm ` +
          `(difference: ${difference.toFixed(3)}mm). This may indicate floating-point precision issues or calculation errors.`,
      );
    }

    const total = finalUsedLength + finalRemaining;
    const difference = Math.abs(total - cut.stockLength);

    if (difference > this.ACCOUNTING_PRECISION_THRESHOLD) {
      this.logger.error("Accounting precision threshold exceeded", {
        cutId: cut.id,
        stockLength: cut.stockLength,
        total,
        difference,
        threshold: this.ACCOUNTING_PRECISION_THRESHOLD,
      });
      throw new Error(
        `Accounting precision error in cut ${cut.id}: ` +
          `total=${total}mm differs from stock=${cut.stockLength}mm by ${difference.toFixed(3)}mm ` +
          `(threshold: ${this.ACCOUNTING_PRECISION_THRESHOLD}mm). ` +
          `This suggests cumulative floating-point errors or incorrect kerf calculations.`,
      );
    }
  }

  /**
   * Determine cut profile type
   */
  private determineCutProfileType(cut: Cut): string {
    if (cut.profileType !== undefined && cut.profileType !== "") {
      return cut.profileType;
    }

    const firstSegment = cut.segments[0];
    if (firstSegment !== undefined && firstSegment.profileType !== undefined) {
      return firstSegment.profileType;
    }

    return "Unknown";
  }

  /**
   * Validate stock accounting for a cut
   *
   * Ensures: usedLength + remainingLength === stockLength
   *
   * @param usedLength - Used length (mm)
   * @param remainingLength - Remaining length (mm)
   * @param stockLength - Total stock length (mm)
   * @param tolerance - Numerical tolerance (default: 1e-9)
   * @returns True if accounting is valid
   */
  public validateStockAccounting(
    usedLength: number,
    remainingLength: number,
    stockLength: number,
    tolerance: number = 1e-9,
  ): boolean {
    return StockCalculator.validateStockAccounting(
      usedLength,
      remainingLength,
      stockLength,
      tolerance,
    );
  }

  /**
   * Validate cut invariant
   *
   * Ensures: segmentCount === segments.length
   *
   * @param cut - Cut to validate
   */
  private validateCutInvariant(cut: Cut): void {
    if (cut.segmentCount !== cut.segments.length) {
      this.logger.error(`[BFDValidator] Cut invariant violation detected`, {
        cutId: cut.id,
        segmentCount: cut.segmentCount,
        actualSegments: cut.segments.length,
        stockLength: cut.stockLength,
        usedLength: cut.usedLength,
      });
      throw new Error(
        `Invariant violation in cut ${cut.id}: segmentCount=${cut.segmentCount} !== segments.length=${cut.segments.length}. This indicates a programming error in segment management.`,
      );
    }
  }

  /**
   * Build comprehensive optimization result
   */
  public buildOptimizationResult(
    cuts: Cut[],
    context: OptimizationContext,
    algorithmName: OptimizationAlgorithm,
    executionTimeMs: number,
  ): AdvancedOptimizationResult {
    const aggregates = this.calculateAggregateMetrics(cuts);
    const efficiency = StockCalculator.calculateEfficiency(
      aggregates.totalStockLength,
      aggregates.totalWaste,
    );

    const costBreakdown = CostCalculator.calculateCostBreakdown(
      cuts,
      context.costModel,
      context.constraints,
    );

    const wasteDistribution = WasteAnalyzer.calculateWasteDistribution(cuts);
    const detailedWasteAnalysis =
      WasteAnalyzer.calculateDetailedWasteAnalysis(cuts);
    const performanceMetrics = MetricsCalculator.calculatePerformanceMetrics(
      "bfd",
      context.items.length,
    );

    const timing = this.calculateTimingMetrics(
      aggregates.totalSegments,
      cuts.length,
    );
    const quality = this.calculateQualityMetrics(
      efficiency,
      aggregates.totalWaste,
    );

    // Calculate stock summary for multi-stock optimization display
    const stockSummary = this.calculateStockSummary(cuts);

    return {
      algorithm: algorithmName,
      cuts,
      efficiency,
      totalWaste: aggregates.totalWaste,
      totalCost: costBreakdown.totalCost,
      stockCount: cuts.length,
      totalLength: aggregates.totalLength,
      executionTimeMs,
      totalSegments: aggregates.totalSegments,
      averageCutsPerStock: this.calculateAverageCutsPerStock(
        aggregates.totalSegments,
        cuts.length,
      ),
      setupTime: timing.setupTime,
      materialUtilization: efficiency,
      cuttingComplexity: MetricsCalculator.calculateCuttingComplexity(
        aggregates.totalSegments,
        cuts.length,
      ),
      cuttingTime: timing.cuttingTime,
      totalTime: timing.totalTime,
      materialCost: costBreakdown.materialCost,
      wasteCost: costBreakdown.wasteCost,
      laborCost: costBreakdown.timeCost,
      costPerMeter: CostCalculator.calculateCostPerMeter(
        costBreakdown.totalCost,
        aggregates.totalLength,
      ),
      qualityScore: quality.qualityScore,
      reclaimableWastePercentage:
        WasteAnalyzer.calculateReclaimableWastePercentage(cuts),
      wastePercentage: WasteAnalyzer.calculateWastePercentage(
        aggregates.totalWaste,
        aggregates.totalStockLength,
      ),
      wasteDistribution,
      constraints: context.constraints,
      detailedWasteAnalysis,
      recommendations: [],
      efficiencyCategory: WasteAnalyzer.getEfficiencyCategory(efficiency),
      optimizationScore: quality.optimizationScore,
      costBreakdown,
      performanceMetrics,
      confidence: quality.confidence,
      totalKerfLoss: aggregates.totalKerfLoss,
      totalSafetyReserve:
        cuts.length *
        (context.constraints.startSafety + context.constraints.endSafety),
      stockSummary,
    };
  }

  /**
   * Calculate stock summary for multi-stock optimization display
   */
  private calculateStockSummary(
    cuts: ReadonlyArray<Cut>,
  ): ReadonlyArray<StockSummary> {
    // Group cuts by stock length
    const grouped = new Map<number, Cut[]>();
    cuts.forEach((cut) => {
      const stockLength = cut.stockLength;
      if (!grouped.has(stockLength)) {
        grouped.set(stockLength, []);
      }
      grouped.get(stockLength)!.push(cut);
    });

    // Create summary for each stock length
    return Array.from(grouped.entries()).map(([stockLength, stockCuts]) => {
      // Group patterns by planLabel
      const patternMap = new Map<string, number>();
      stockCuts.forEach((cut) => {
        const pattern = cut.planLabel || `${cut.segmentCount} segments`;
        patternMap.set(pattern, (patternMap.get(pattern) || 0) + 1);
      });

      const patterns = Array.from(patternMap.entries()).map(
        ([pattern, count]) => ({
          pattern,
          count,
        }),
      );

      const totalWaste = stockCuts.reduce(
        (sum, cut) => sum + cut.remainingLength,
        0,
      );
      const totalUsed = stockCuts.reduce((sum, cut) => sum + cut.usedLength, 0);
      const totalStock = stockCuts.reduce(
        (sum, cut) => sum + cut.stockLength,
        0,
      );
      const efficiency = totalStock > 0 ? (totalUsed / totalStock) * 100 : 0;

      return {
        stockLength,
        cutCount: stockCuts.length,
        patterns,
        avgWaste: stockCuts.length > 0 ? totalWaste / stockCuts.length : 0,
        totalWaste,
        efficiency,
      };
    });
  }

  /**
   * Calculate aggregate metrics from cuts
   */
  private calculateAggregateMetrics(cuts: ReadonlyArray<Cut>): {
    totalStockLength: number;
    totalWaste: number;
    totalLength: number;
    totalSegments: number;
    totalKerfLoss: number;
  } {
    return {
      totalStockLength: cuts.reduce((sum, cut) => sum + cut.stockLength, 0),
      totalWaste: WasteAnalyzer.calculateTotalWaste(cuts),
      totalLength: cuts.reduce((sum, cut) => sum + cut.usedLength, 0),
      totalSegments: cuts.reduce((sum, cut) => sum + cut.segmentCount, 0),
      totalKerfLoss: cuts.reduce((sum, cut) => sum + (cut.kerfLoss ?? 0), 0),
    };
  }

  /**
   * Calculate timing metrics
   */
  private calculateTimingMetrics(
    totalSegments: number,
    cutCount: number,
  ): {
    setupTime: number;
    cuttingTime: number;
    totalTime: number;
  } {
    const setupTime = cutCount * this.SETUP_TIME_PER_CUT;
    const cuttingTime = totalSegments * this.CUTTING_TIME_PER_SEGMENT;
    const totalTime = setupTime + cuttingTime;

    return { setupTime, cuttingTime, totalTime };
  }

  /**
   * Calculate quality metrics
   */
  private calculateQualityMetrics(
    efficiency: number,
    totalWaste: number,
  ): {
    qualityScore: number;
    optimizationScore: number;
    confidence: number;
  } {
    const qualityScore = MetricsCalculator.calculateQualityScore(
      efficiency,
      totalWaste,
    );
    const wastePercentage = WasteAnalyzer.calculateWastePercentage(
      totalWaste,
      0,
    );

    return {
      qualityScore,
      optimizationScore: MetricsCalculator.calculateOptimizationScore(
        efficiency,
        wastePercentage,
        qualityScore,
      ),
      confidence: MetricsCalculator.calculateConfidence(
        efficiency,
        totalWaste,
        0,
      ),
    };
  }

  /**
   * Calculate average cuts per stock
   */
  private calculateAverageCutsPerStock(
    totalSegments: number,
    stockCount: number,
  ): number {
    if (stockCount === 0) {
      return 0;
    }
    return totalSegments / stockCount;
  }
}
