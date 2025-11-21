import type { OptimizationItem } from "../../../types";
import type { EnhancedConstraints } from "../types";

export interface TheoreticalMinimumResult {
  readonly minStockCount: number;
  readonly recommendedStockLength: number;
  readonly totalRequired: number;
  readonly breakdown: ReadonlyArray<{
    readonly stockLength: number;
    readonly count: number;
    readonly coverage: number;
  }>;
}

/**
 * Calculates theoretical minimum stock requirements for cutting optimization
 * This provides a baseline constraint that algorithms should not exceed significantly
 */
export class TheoreticalMinimumCalculator {
  /**
   * Calculate minimum stock count needed for given items and stock lengths
   *
   * @param items - Items to be cut
   * @param stockLengths - Available stock lengths
   * @param constraints - Optimization constraints
   * @returns Theoretical minimum calculation result
   */
  static calculateMinimumStock(
    items: ReadonlyArray<OptimizationItem>,
    stockLengths: ReadonlyArray<number>,
    constraints: EnhancedConstraints,
  ): TheoreticalMinimumResult {
    // 1. Calculate total required length
    const totalRequired = items.reduce(
      (sum, item) => sum + item.length * item.quantity,
      0,
    );

    // 2. Add safety margins and kerf losses
    const totalWithOverhead =
      totalRequired +
      items.length * (constraints.safetyMargin ?? 2) * 2 +
      items.length * (constraints.kerfWidth ?? 3.5);

    // 3. Try each stock length, find minimum count
    const breakdown = stockLengths.map((stockLength) => {
      const usableLength =
        stockLength - (constraints.startSafety + constraints.endSafety);
      const count = Math.ceil(totalWithOverhead / usableLength);
      const coverage = (count * usableLength) / totalWithOverhead;
      return {
        stockLength,
        count,
        coverage: Math.min(coverage, 1.0), // Cap at 100%
      };
    });

    // 4. Select stock length with minimum count (or best coverage if tie)
    const optimal = breakdown.reduce((best, curr) =>
      curr.count < best.count ||
      (curr.count === best.count && curr.coverage > best.coverage)
        ? curr
        : best,
    );

    return {
      minStockCount: optimal.count,
      recommendedStockLength: optimal.stockLength,
      totalRequired,
      breakdown,
    };
  }

  /**
   * Calculate theoretical minimum for a specific stock length
   *
   * @param items - Items to be cut
   * @param stockLength - Specific stock length to calculate for
   * @param constraints - Optimization constraints
   * @returns Minimum count for this stock length
   */
  static calculateForStockLength(
    items: ReadonlyArray<OptimizationItem>,
    stockLength: number,
    constraints: EnhancedConstraints,
  ): number {
    const totalRequired = items.reduce(
      (sum, item) => sum + item.length * item.quantity,
      0,
    );

    const totalWithOverhead =
      totalRequired +
      items.length * (constraints.safetyMargin ?? 2) * 2 +
      items.length * (constraints.kerfWidth ?? 3.5);

    const usableLength =
      stockLength - (constraints.startSafety + constraints.endSafety);

    return Math.ceil(totalWithOverhead / usableLength);
  }

  /**
   * Validate if a result is within reasonable bounds of theoretical minimum
   *
   * @param actualCuts - Number of cuts actually made
   * @param theoreticalMin - Theoretical minimum result
   * @param tolerance - Maximum allowed overhead (default: 0.5 = 50%)
   * @returns Validation result with warnings
   */
  static validateResult(
    actualCuts: number,
    theoreticalMin: TheoreticalMinimumResult,
    tolerance: number = 0.5,
  ): {
    readonly isValid: boolean;
    readonly overheadPercentage: number;
    readonly warning?: string;
  } {
    const overheadPercentage =
      (actualCuts - theoreticalMin.minStockCount) /
      theoreticalMin.minStockCount;

    if (overheadPercentage > tolerance) {
      return {
        isValid: false,
        overheadPercentage,
        warning: `Algorithm used ${actualCuts} cuts, theoretical minimum is ${theoreticalMin.minStockCount} (${Math.round(overheadPercentage * 100)}% over)`,
      };
    }

    return {
      isValid: true,
      overheadPercentage,
    };
  }
}
