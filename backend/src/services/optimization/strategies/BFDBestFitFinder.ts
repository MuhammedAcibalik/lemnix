/**
 * BFD Best Fit Finder Strategy
 * Finds optimal placement location for items using best-fit strategy
 *
 * @module optimization/strategies
 * @version 1.0.0
 * @description Best fit location finding and evaluation for BFD algorithm
 */

import { OptimizationItem, Cut } from "../../../types";
import { OptimizationContext } from "../core/OptimizationContext";
import { StockCalculator } from "../helpers/StockCalculator";
import { BFDWasteMinimizer } from "./BFDWasteMinimizer";
import type { ILogger } from "../../logger";

/**
 * Best fit result structure
 */
export interface BestFitResult {
  readonly cut: Cut;
  readonly stockLength: number;
  readonly waste: number;
  readonly willCreateFragment: boolean;
  readonly adjustedWaste: number;
  readonly futureOpportunityScore: number;
}

/**
 * Multi-stock bins structure
 */
export interface MultiStockBins {
  readonly binsByLength: ReadonlyMap<number, Cut[]>;
}

/**
 * BFD Best Fit Finder
 * Finds optimal placement location across all stock lengths
 */
export class BFDBestFitFinder {
  constructor(
    private readonly logger: ILogger,
    private readonly wasteMinimizer: BFDWasteMinimizer,
  ) {}

  /**
   * Find best fit location across all stock lengths
   *
   * Strategy:
   * 1. Check all stock lengths
   * 2. For each stock length, find best fit cut
   * 3. Select cut with minimum adjusted waste
   * 4. Tie-breaker: Prefer higher future opportunity score
   *
   * @param item - Item to place
   * @param bins - Multi-stock bins
   * @param context - Optimization context
   * @param upcomingItems - Upcoming items for look-ahead (optional)
   * @returns Best fit result or null if no fit found
   */
  public findBestFitLocation(
    item: OptimizationItem,
    bins: MultiStockBins,
    context: OptimizationContext,
    upcomingItems: ReadonlyArray<OptimizationItem> = [],
    preferredStockLength?: number, // CRITICAL FIX: Prefer optimal stock length
  ): BestFitResult | null {
    let bestFit: BestFitResult | null = null;

    // CRITICAL FIX: If preferredStockLength is provided, check it FIRST
    // This ensures we use the optimal stock even when placing in existing cuts
    const sortedStockLengths = Array.from(bins.binsByLength.keys()).sort(
      (a, b) => {
        // If preferredStockLength is provided, prioritize it
        if (preferredStockLength !== undefined) {
          if (a === preferredStockLength) return -1;
          if (b === preferredStockLength) return 1;
        }
        return a - b; // Otherwise, prefer smaller stocks
      },
    );

    for (const stockLength of sortedStockLengths) {
      const cuts = bins.binsByLength.get(stockLength);
      if (!cuts || cuts.length === 0) {
        continue;
      }

      const localBestFit = this.findBestFitInStockLength(
        item,
        cuts,
        stockLength,
        context,
        upcomingItems,
      );

      if (localBestFit !== null) {
        // SUPER OPTIMIZATION: Prioritize simple minimum remaining space (waste)
        // Adjusted waste is only used as tie-breaker for very close cases
        // This ensures we select cuts that minimize actual waste, not artificial penalties

        // Primary: Minimum remaining space (waste) - MOST IMPORTANT
        // Lower waste = better fit
        if (bestFit === null || localBestFit.waste < bestFit.waste) {
          bestFit = localBestFit;
        } else if (Math.abs(localBestFit.waste - bestFit.waste) < 1.0) {
          // Tie-breaker 1: Adjusted waste (only if waste difference < 1mm)
          // This handles cases where waste is nearly identical
          if (localBestFit.adjustedWaste < bestFit.adjustedWaste) {
            bestFit = localBestFit;
          } else if (
            Math.abs(localBestFit.adjustedWaste - bestFit.adjustedWaste) < 0.01
          ) {
            // Tie-breaker 2: Prefer smaller stock length
            if (localBestFit.stockLength < bestFit.stockLength) {
              bestFit = localBestFit;
            } else if (localBestFit.stockLength === bestFit.stockLength) {
              // Tie-breaker 3: Prefer higher future opportunity (last resort)
              if (
                localBestFit.futureOpportunityScore >
                bestFit.futureOpportunityScore
              ) {
                bestFit = localBestFit;
              }
            }
          }
        }
      }
    }

    if (bestFit) {
      this.logger.debug("[BFDBestFitFinder] Best fit found", {
        itemLength: item.length,
        stockLength: bestFit.stockLength,
        waste: bestFit.waste.toFixed(2),
        adjustedWaste: bestFit.adjustedWaste.toFixed(2),
        willCreateFragment: bestFit.willCreateFragment,
        futureOpportunityScore: bestFit.futureOpportunityScore.toFixed(2),
      });
    }

    return bestFit;
  }

  /**
   * Find best fit within specific stock length
   *
   * @param item - Item to place
   * @param cuts - Cuts for this stock length
   * @param stockLength - Stock length
   * @param context - Optimization context
   * @param upcomingItems - Upcoming items for look-ahead (optional)
   * @returns Best fit result or null
   */
  public findBestFitInStockLength(
    item: OptimizationItem,
    cuts: ReadonlyArray<Cut>,
    stockLength: number,
    context: OptimizationContext,
    upcomingItems: ReadonlyArray<OptimizationItem> = [],
  ): BestFitResult | null {
    let bestFit: BestFitResult | null = null;

    for (const cut of cuts) {
      const fitResult = this.evaluateFitInCut(
        item,
        cut,
        stockLength,
        context,
        upcomingItems,
      );

      if (fitResult !== null) {
        // Prioritize: 1) adjusted waste, 2) future opportunity as tie-breaker
        if (
          bestFit === null ||
          fitResult.adjustedWaste < bestFit.adjustedWaste
        ) {
          bestFit = fitResult;
        } else if (
          Math.abs(fitResult.adjustedWaste - bestFit.adjustedWaste) < 0.01
        ) {
          // Tie-breaker: prefer higher future opportunity
          if (
            fitResult.futureOpportunityScore > bestFit.futureOpportunityScore
          ) {
            bestFit = fitResult;
          }
        }
      }
    }

    return bestFit;
  }

  /**
   * Evaluate if item fits in cut and calculate waste
   *
   * Mathematical Model:
   * ==================
   * Let:
   * - l = item length
   * - r = remaining length in cut
   * - k = kerf width (saw blade thickness)
   * - λ = minimum usable scrap threshold
   *
   * Feasibility Check:
   * -----------------
   * Item fits if: r ≥ l + k
   *
   * Waste Calculation:
   * -----------------
   * w = r - (l + k)  // Basic waste
   *
   * Fragment Detection:
   * ------------------
   * Fragment created if: 0 < w < λ
   *
   * Adjusted Waste (with penalty):
   * -----------------------------
   * w' = adjustedWaste(w, λ)  // With fragment penalty
   *
   * Future Opportunity Score:
   * ------------------------
   * f = (# of upcoming items that fit in w) / (total upcoming items)
   *
   * @param item - Item to evaluate
   * @param cut - Cut to evaluate
   * @param stockLength - Stock length
   * @param context - Optimization context
   * @param upcomingItems - Upcoming items for look-ahead (optional)
   * @returns Best fit result or null if doesn't fit
   */
  public evaluateFitInCut(
    item: OptimizationItem,
    cut: Cut,
    stockLength: number,
    context: OptimizationContext,
    upcomingItems: ReadonlyArray<OptimizationItem> = [],
  ): BestFitResult | null {
    const kerfNeeded = StockCalculator.calculateKerfNeeded(
      cut.segmentCount,
      context.constraints.kerfWidth,
    );
    const totalNeeded = item.length + kerfNeeded;

    if (cut.remainingLength >= totalNeeded) {
      const wasteAfterFit = cut.remainingLength - totalNeeded;

      // Check if creates unusable fragment
      const willCreateFragment = this.wasteMinimizer.shouldCreateFragment(
        wasteAfterFit,
        context.constraints.minScrapLength,
      );

      // Apply fragment penalty to adjusted waste
      const adjustedWaste = this.wasteMinimizer.calculateAdjustedWaste(
        wasteAfterFit,
        context.constraints.minScrapLength,
      );

      // Calculate future opportunity score
      const futureScore = this.wasteMinimizer.calculateFutureOpportunityScore(
        wasteAfterFit,
        upcomingItems,
        context,
      );

      this.logger.debug("[BFDBestFitFinder] Fit evaluation", {
        itemLength: item.length,
        remainingLength: cut.remainingLength.toFixed(2),
        waste: wasteAfterFit.toFixed(2),
        adjustedWaste: adjustedWaste.toFixed(2),
        willCreateFragment,
        futureOpportunityScore: futureScore.toFixed(2),
      });

      return {
        cut,
        stockLength,
        waste: wasteAfterFit,
        willCreateFragment,
        adjustedWaste,
        futureOpportunityScore: futureScore,
      };
    }

    return null;
  }
}
