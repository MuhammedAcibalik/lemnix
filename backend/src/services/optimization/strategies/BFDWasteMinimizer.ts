/**
 * BFD Waste Minimization Strategy
 * Handles waste minimization, fragment prevention, and look-ahead optimization
 *
 * @module optimization/strategies
 * @version 1.0.0
 * @description Waste minimization and fragment prevention logic for BFD algorithm
 */

import { OptimizationItem } from "../../../types";
import { OptimizationContext } from "../core/OptimizationContext";
import type { ILogger } from "../../logger";

/**
 * Fragment penalty factor constant
 * SUPER OPTIMIZATION: Reduced from 0.8 to 0.95 to minimize artificial waste inflation
 * Original: 0.8 (25% penalty), New: 0.95 (5% penalty)
 * This reduces the impact of fragment penalty on actual waste calculation
 * Fragment penalty should guide decisions but not dominate them
 */
const FRAGMENT_PENALTY_FACTOR = 0.95;

/**
 * Look-ahead depth for future opportunity calculation
 */
const LOOK_AHEAD_DEPTH = 3;

/**
 * BFD Waste Minimizer
 * Handles waste calculation, fragment prevention, and future opportunity scoring
 */
export class BFDWasteMinimizer {
  constructor(private readonly logger: ILogger) {}

  /**
   * Calculate adjusted waste with fragment penalty
   *
   * Mathematical Model:
   * ==================
   * Let:
   * - w = basic waste (remaining length after placement)
   * - λ = minimum usable scrap threshold (minScrapLength)
   * - α = fragment penalty factor (0.8)
   *
   * Fragment Detection:
   * ------------------
   * Fragment created if: 0 < w < λ
   * (Too small to be useful, too large to ignore)
   *
   * Adjusted Waste (with penalty):
   * -----------------------------
   * w' = w × (1/α)  if fragment created
   *    = w          otherwise
   *
   * This makes fragment-creating placements less attractive
   * by artificially inflating their waste score.
   *
   * @param waste - Basic waste amount (mm)
   * @param minScrapLength - Minimum usable scrap length (mm)
   * @returns Adjusted waste with fragment penalty applied
   */
  public calculateAdjustedWaste(waste: number, minScrapLength: number): number {
    const willCreateFragment = waste > 0 && waste < minScrapLength;

    if (willCreateFragment) {
      const adjustedWaste = waste * (1 / FRAGMENT_PENALTY_FACTOR);
      this.logger.debug("[BFDWasteMinimizer] Fragment penalty applied", {
        basicWaste: waste.toFixed(2),
        adjustedWaste: adjustedWaste.toFixed(2),
        minScrapLength,
        penaltyFactor: FRAGMENT_PENALTY_FACTOR,
      });
      return adjustedWaste;
    }

    return waste;
  }

  /**
   * Check if placement will create an unusable fragment
   *
   * @param waste - Waste amount after placement (mm)
   * @param minScrapLength - Minimum usable scrap length (mm)
   * @returns True if fragment will be created
   */
  public shouldCreateFragment(waste: number, minScrapLength: number): boolean {
    return waste > 0 && waste < minScrapLength;
  }

  /**
   * Calculate future opportunity score for remaining space
   *
   * Future Opportunity Score:
   * ------------------------
   * f = (# of upcoming items that fit in w) / (total upcoming items)
   * Range: [0, 1] where 1 = many items could fit, 0 = none fit
   *
   * This score helps prioritize placements that leave space
   * suitable for future items, improving overall optimization.
   *
   * @param remainingSpace - Remaining space after placement (mm)
   * @param upcomingItems - Array of upcoming items to consider
   * @param context - Optimization context
   * @returns Future opportunity score [0, 1]
   */
  public calculateFutureOpportunityScore(
    remainingSpace: number,
    upcomingItems: ReadonlyArray<OptimizationItem>,
    context: OptimizationContext,
  ): number {
    if (upcomingItems.length === 0) {
      return 1.0; // No future items to consider - assume good opportunity
    }

    // Limit look-ahead depth for performance
    const itemsToConsider = upcomingItems.slice(0, LOOK_AHEAD_DEPTH);
    let fittableCount = 0;

    for (const upcomingItem of itemsToConsider) {
      const requiredSpace = upcomingItem.length + context.constraints.kerfWidth;
      if (remainingSpace >= requiredSpace) {
        fittableCount++;
      }
    }

    const futureScore = fittableCount / itemsToConsider.length;

    this.logger.debug("[BFDWasteMinimizer] Look-ahead analysis", {
      remainingSpace: remainingSpace.toFixed(2),
      upcomingItems: itemsToConsider.length,
      fittableCount,
      futureOpportunityScore: futureScore.toFixed(2),
    });

    return futureScore;
  }

  /**
   * Calculate waste percentage for a stock
   *
   * @param waste - Waste amount (mm)
   * @param stockLength - Stock length (mm)
   * @returns Waste percentage (0-100)
   */
  public calculateWastePercentage(waste: number, stockLength: number): number {
    if (stockLength <= 0) {
      return 100; // Invalid stock - 100% waste
    }
    return (waste / stockLength) * 100;
  }

  /**
   * Check if waste percentage is acceptable
   *
   * @param wastePercentage - Waste percentage (0-100)
   * @param threshold - Maximum acceptable waste percentage (default: 15%)
   * @returns True if waste is acceptable
   */
  public isWasteAcceptable(
    wastePercentage: number,
    threshold: number = 15,
  ): boolean {
    return wastePercentage < threshold;
  }
}
