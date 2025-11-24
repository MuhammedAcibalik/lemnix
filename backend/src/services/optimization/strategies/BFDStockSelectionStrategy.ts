/**
 * BFD Stock Selection Strategy
 * Implements "en az stok boyunu kullanarak en az fireyi hedefleme" strategy
 *
 * @module optimization/strategies
 * @version 1.0.0
 * @description Critical strategy for selecting optimal stock length with minimal stock size preference
 *
 * Strategy Overview:
 * ==================
 * Primary Objective: Use smallest stock length possible
 * Secondary Objective: Minimize waste percentage
 *
 * Algorithm:
 * 1. Sort stock lengths ascending (smallest first)
 * 2. For each stock length:
 *    a) Calculate waste percentage: waste% = (waste / stockLength) × 100
 *    b) If waste% < threshold (%15): Select this stock (prefer smaller)
 *    c) If waste% >= threshold: Continue to next stock
 * 3. If no stock below threshold: Select stock with minimum waste%
 * 4. Tie-breaker: If same waste%, prefer smaller stock
 *
 * Mathematical Formulation:
 * ========================
 * Given:
 * - Item length: l
 * - Stock lengths: S = {s₁, s₂, ..., sₘ} where s₁ ≤ s₂ ≤ ... ≤ sₘ
 * - Kerf width: k
 * - Safety margins: σₛ, σₑ
 * - Waste threshold: τ = 15% (configurable)
 *
 * For each stock sᵢ:
 * - Max pieces: nᵢ = ⌊(sᵢ - σₛ - σₑ + k) / (l + k)⌋
 * - Used length: uᵢ = σₛ + nᵢ×l + (nᵢ-1)×k + σₑ
 * - Waste: wᵢ = sᵢ - uᵢ
 * - Waste percentage: w%ᵢ = (wᵢ / sᵢ) × 100
 *
 * Selection Logic:
 * - Find first sᵢ where w%ᵢ < τ
 * - If none found: argmin(w%ᵢ) over all sᵢ
 * - If multiple with same w%: argmin(sᵢ)
 *
 * Example:
 * =======
 * Item: 918mm, Stocks: [3400mm, 6000mm], k=3mm, σₛ=σₑ=100mm, τ=15%
 *
 * Stock 3400mm:
 * - n = ⌊(3400 - 200 + 3) / (918 + 3)⌋ = ⌊3203 / 921⌋ = 3 pieces
 * - u = 100 + 3×918 + 2×3 + 100 = 2960mm
 * - w = 3400 - 2960 = 440mm
 * - w% = (440 / 3400) × 100 = 12.94% < 15% ✓
 * → SELECT 3400mm (smallest stock with acceptable waste)
 *
 * Stock 6000mm:
 * - n = ⌊(6000 - 200 + 3) / (918 + 3)⌋ = ⌊5803 / 921⌋ = 6 pieces
 * - u = 100 + 6×918 + 5×3 + 100 = 5723mm
 * - w = 6000 - 5723 = 277mm
 * - w% = (277 / 6000) × 100 = 4.62% < 15% ✓
 * → Would also be acceptable, but 3400mm is selected (smaller)
 */

import { OptimizationItem } from "../../../types";
import { OptimizationContext } from "../core/OptimizationContext";
import { StockCalculator } from "../helpers/StockCalculator";
import type { ILogger } from "../../logger";

/**
 * Stock evaluation result
 */
interface StockEvaluation {
  readonly stockLength: number;
  readonly maxPieces: number;
  readonly usedLength: number;
  readonly waste: number;
  readonly wastePercentage: number;
  readonly wastePerPiece: number;
}

/**
 * Stock selection configuration
 */
interface StockSelectionConfig {
  /**
   * Maximum acceptable waste percentage threshold
   * If waste% exceeds this, algorithm will consider next larger stock
   * Default: 15% (0.15)
   */
  readonly wasteThreshold: number;

  /**
   * Whether to prefer smaller stocks even if waste is slightly higher
   * Default: true (prioritize stock size over absolute waste)
   */
  readonly preferSmallerStock: boolean;
}

/**
 * BFD Stock Selection Strategy
 * Implements optimal stock selection with minimal stock size preference
 */
export class BFDStockSelectionStrategy {
  private readonly config: StockSelectionConfig;

  constructor(
    private readonly logger: ILogger,
    config?: Partial<StockSelectionConfig>,
  ) {
    this.config = {
      wasteThreshold: config?.wasteThreshold ?? 0.15, // 15% default
      preferSmallerStock: config?.preferSmallerStock ?? true,
    };
  }

  /**
   * Select optimal stock length using "en az stok boyu + en az fire" strategy
   *
   * Strategy:
   * 1. Sort stocks ascending (smallest first)
   * 2. Find first stock with waste% < threshold
   * 3. If none found, select stock with minimum waste%
   * 4. Tie-breaker: Prefer smaller stock
   *
   * @param item - Item to place
   * @param context - Optimization context
   * @returns Optimal stock length
   */
  public selectOptimalStockLength(
    item: OptimizationItem,
    context: OptimizationContext,
    upcomingItems: ReadonlyArray<OptimizationItem> = [],
  ): number {
    const stockLengths = [...context.stockLengths].sort((a, b) => a - b); // Ascending order

    if (stockLengths.length === 0) {
      this.logger.warn(
        "[BFDStockSelection] No stock lengths available, using fallback",
      );
      return 6100; // Default fallback
    }

    // CRITICAL FIX: Use simple evaluation WITHOUT Look-Ahead simulation
    // Look-Ahead was causing incorrect waste calculations (e.g. selecting 3400mm instead of 6000mm)
    // Simple approach: Calculate waste for PRIMARY item only - this is accurate and reliable
    const evaluations = this.evaluateAllStocksSimple(
      item,
      stockLengths,
      context,
    );

    if (evaluations.length === 0) {
      // No stock can fit the item - use largest as fallback
      this.logger.warn(
        "[BFDStockSelection] No stock can fit item, using largest stock",
        {
          itemLength: item.length,
          availableStocks: stockLengths,
        },
      );
      return Math.max(...stockLengths);
    }

    // Strategy: Global Minimum Total Waste
    // SUPER OPTIMIZATION: Prioritize TOTAL waste over waste percentage
    // This ensures we select stocks that minimize overall waste, not just percentage
    //
    // Mathematical Model:
    // Score(stock) = α × totalWaste + β × stockCount + γ × wastePercentage + δ × stockLength
    // where:
    // - α = 1000 (total waste weight - most important)
    // - β = 100 (stock count weight)
    // - γ = 1 (waste percentage weight)
    // - δ = 0.01 (stock length weight - very small)

    // Sort evaluations by multiple criteria (priority order):
    const sortedEvaluations = [...evaluations].sort((a, b) => {
      // Calculate stocks needed for each evaluation
      const stocksNeededA = Math.ceil(item.quantity / a.maxPieces);
      const stocksNeededB = Math.ceil(item.quantity / b.maxPieces);

      // Primary: Total waste (lower is better) - MOST IMPORTANT
      // Total waste = stocksNeeded × wastePerStock
      const totalWasteA = stocksNeededA * (a.stockLength - a.usedLength);
      const totalWasteB = stocksNeededB * (b.stockLength - b.usedLength);
      const totalWasteDiff = totalWasteA - totalWasteB;

      // If total waste difference is significant (>100mm = 10cm), pick the better one immediately
      if (Math.abs(totalWasteDiff) > 100) {
        return totalWasteDiff;
      }

      // Secondary: Stock count (lower is better)
      // Fewer stocks = better (less setup time, less handling)
      const stockCountDiff = stocksNeededA - stocksNeededB;
      if (Math.abs(stockCountDiff) > 0) {
        return stockCountDiff;
      }

      // Tertiary: Waste percentage (lower is better)
      // Only matters if total waste and stock count are similar
      const wastePctDiff = a.wastePercentage - b.wastePercentage;
      if (Math.abs(wastePctDiff) > 0.5) {
        return wastePctDiff;
      }

      // Quaternary: Stock length (smaller is better)
      // Prefer smaller stocks when everything else is equal
      return a.stockLength - b.stockLength;
    });

    const bestStock = sortedEvaluations[0]!;

    // Log detailed decision info for debugging
    if (item.length > 100) {
      // Log only for significant items to avoid spam
      const stocksNeededWinner = Math.ceil(item.quantity / bestStock.maxPieces);
      const stocksNeededAlt =
        sortedEvaluations.length > 1
          ? Math.ceil(item.quantity / sortedEvaluations[1]!.maxPieces)
          : 0;

      // Calculate actual total waste for winner
      const wastePerStockWinner = bestStock.stockLength - bestStock.usedLength;
      const totalWasteWinner = stocksNeededWinner * wastePerStockWinner;

      this.logger.info(
        "[BFDStockSelection] Stock Decision Details (SUPER OPTIMIZED - Total Waste Priority)",
        {
          itemLength: item.length,
          itemQuantity: item.quantity,
          winner: {
            stock: bestStock.stockLength,
            piecesPerStock: bestStock.maxPieces,
            stocksNeeded: stocksNeededWinner,
            wastePerStock: Math.round(wastePerStockWinner) + "mm",
            totalWaste: Math.round(totalWasteWinner / 1000) + "m", // Convert mm to meters
            totalWastePercentage: bestStock.wastePercentage.toFixed(2) + "%",
            wastePerPiece: Math.round(bestStock.wastePerPiece) + "mm/piece",
          },
          alternatives: sortedEvaluations
            .slice(1, Math.min(4, sortedEvaluations.length))
            .map((e) => {
              const stocksNeeded = Math.ceil(item.quantity / e.maxPieces);
              const wastePerStock = e.stockLength - e.usedLength;
              const totalWaste = stocksNeeded * wastePerStock;
              return {
                stock: e.stockLength,
                piecesPerStock: e.maxPieces,
                stocksNeeded: stocksNeeded,
                wastePerStock: Math.round(wastePerStock) + "mm",
                totalWaste: Math.round(totalWaste / 1000) + "m",
                totalWastePercentage: e.wastePercentage.toFixed(2) + "%",
                wastePerPiece: Math.round(e.wastePerPiece) + "mm/piece",
              };
            }),
          totalEvaluated: evaluations.length,
          strategy: "super-optimized-total-waste-minimization",
          selectionCriteria:
            "Total Waste > Stock Count > Waste % > Stock Length",
        },
      );
    }

    return bestStock.stockLength;
  }

  /**
   * Evaluate stocks SIMPLY - Only PRIMARY item, NO Look-Ahead simulation
   * CRITICAL FIX: Calculate TOTAL waste for ALL pieces, not just one stock!
   *
   * Previous bug: Only calculated waste for ONE stock, ignoring total quantity
   * Example: 1000 pieces of 992mm
   * - 6000mm: 6 pieces/stock → 167 stocks → Total waste = 167 × 48mm = ~8m
   * - 3400mm: 3 pieces/stock → 334 stocks → Total waste = 334 × 424mm = ~141m
   * → Should select 6000mm (lower TOTAL waste)
   *
   * Strategy: Calculate TOTAL waste for entire quantity
   * - Calculate pieces per stock
   * - Calculate stocks needed = ceil(quantity / piecesPerStock)
   * - Calculate total waste = stocksNeeded × wastePerStock
   * - Select stock with minimum TOTAL waste
   */
  private evaluateAllStocksSimple(
    item: OptimizationItem,
    stockLengths: ReadonlyArray<number>,
    context: OptimizationContext,
  ): ReadonlyArray<StockEvaluation> {
    const evaluations: StockEvaluation[] = [];
    const constraints = context.constraints;
    const totalQuantity = item.quantity;

    for (const stockLength of stockLengths) {
      // Calculate max capacity for this stock
      const maxCapacity = StockCalculator.calculateMaxPiecesOnBar(
        item.length,
        stockLength,
        constraints.kerfWidth,
        constraints.startSafety,
        constraints.endSafety,
      );

      if (maxCapacity === 0) continue;

      // Calculate pieces per stock (limited by capacity)
      const piecesPerStock = maxCapacity;

      // Calculate used length per stock: startSafety + (n * length) + ((n-1) * kerf) + endSafety
      const usedLengthPerStock =
        constraints.startSafety +
        piecesPerStock * item.length +
        (piecesPerStock > 0
          ? (piecesPerStock - 1) * constraints.kerfWidth
          : 0) +
        constraints.endSafety;

      // Calculate waste per stock
      const wastePerStock = stockLength - usedLengthPerStock;
      const wastePercentagePerStock = (wastePerStock / stockLength) * 100;

      // CRITICAL FIX: Calculate TOTAL waste for ALL pieces
      // Stocks needed = ceil(totalQuantity / piecesPerStock)
      const stocksNeeded = Math.ceil(totalQuantity / piecesPerStock);

      // Total waste = stocksNeeded × wastePerStock
      const totalWaste = stocksNeeded * wastePerStock;

      // Total waste percentage = (totalWaste / totalStockLength) × 100
      const totalStockLength = stocksNeeded * stockLength;
      const totalWastePercentage =
        totalStockLength > 0 ? (totalWaste / totalStockLength) * 100 : 100;

      // Waste per piece = totalWaste / totalQuantity
      const wastePerPiece =
        totalQuantity > 0
          ? totalWaste / totalQuantity
          : wastePerStock / piecesPerStock;

      evaluations.push({
        stockLength,
        maxPieces: piecesPerStock, // Pieces per stock
        usedLength: usedLengthPerStock, // Used length per stock
        waste: totalWaste, // TOTAL waste for all pieces
        wastePercentage: totalWastePercentage, // TOTAL waste percentage
        wastePerPiece: wastePerPiece, // Waste per piece (average)
      });
    }

    return evaluations;
  }

  /**
   * Evaluate all stock lengths for given item
   *
   * @param item - Item to evaluate
   * @param stockLengths - Available stock lengths (sorted ascending)
   * @param context - Optimization context
   * @returns Array of stock evaluations
   */
  private evaluateAllStocks(
    item: OptimizationItem,
    stockLengths: ReadonlyArray<number>,
    context: OptimizationContext,
  ): ReadonlyArray<StockEvaluation> {
    const evaluations: StockEvaluation[] = [];

    for (const stockLength of stockLengths) {
      const maxPieces = StockCalculator.calculateMaxPiecesOnBar(
        item.length,
        stockLength,
        context.constraints.kerfWidth,
        context.constraints.startSafety,
        context.constraints.endSafety,
      );

      if (maxPieces === 0) {
        continue; // Skip if item doesn't fit
      }

      // Calculate used length
      const usedLength =
        context.constraints.startSafety +
        maxPieces * item.length +
        (maxPieces > 0 ? (maxPieces - 1) * context.constraints.kerfWidth : 0) +
        context.constraints.endSafety;

      const waste = stockLength - usedLength;
      const wastePercentage = (waste / stockLength) * 100;
      const wastePerPiece = waste / maxPieces;

      evaluations.push({
        stockLength,
        maxPieces,
        usedLength,
        waste,
        wastePercentage,
        wastePerPiece,
      });
    }

    return evaluations;
  }

  /**
   * Calculate stock score for multi-objective optimization
   * Used for advanced selection strategies
   *
   * Score formula:
   * score = (stockLength / maxStockLength) × α + (wastePercentage / maxWasteThreshold) × β
   * where:
   * - α = stock size weight (higher = prefer smaller stocks)
   * - β = waste weight (higher = prefer lower waste)
   *
   * Lower score is better.
   *
   * @param evaluation - Stock evaluation
   * @param maxStockLength - Maximum available stock length
   * @param stockSizeWeight - Weight for stock size preference (default: 0.6)
   * @param wasteWeight - Weight for waste preference (default: 0.4)
   * @returns Normalized score (lower is better)
   */
  public calculateStockScore(
    evaluation: StockEvaluation,
    maxStockLength: number,
    stockSizeWeight: number = 0.6,
    wasteWeight: number = 0.4,
  ): number {
    if (maxStockLength <= 0) {
      return evaluation.wastePercentage; // Fallback to waste% only
    }

    const normalizedStockSize = evaluation.stockLength / maxStockLength;
    const normalizedWaste = evaluation.wastePercentage / 100; // Convert % to ratio

    const score =
      normalizedStockSize * stockSizeWeight + normalizedWaste * wasteWeight;

    return score;
  }

  /**
   * Check if smaller stock should be preferred
   * Used for tie-breaking decisions
   *
   * @param smallerStock - Smaller stock evaluation
   * @param largerStock - Larger stock evaluation
   * @returns True if smaller stock should be preferred
   */
  public shouldPreferSmallerStock(
    smallerStock: StockEvaluation,
    largerStock: StockEvaluation,
  ): boolean {
    if (!this.config.preferSmallerStock) {
      return false;
    }

    // If waste percentages are very close (±1%), prefer smaller stock
    const wasteDiff = Math.abs(
      smallerStock.wastePercentage - largerStock.wastePercentage,
    );

    if (wasteDiff <= 1.0) {
      return true; // Prefer smaller if waste difference is negligible
    }

    // If smaller stock waste is acceptable (< threshold), prefer it
    if (
      smallerStock.wastePercentage < this.config.wasteThreshold * 100 &&
      largerStock.wastePercentage < this.config.wasteThreshold * 100
    ) {
      return true; // Both acceptable, prefer smaller
    }

    // Otherwise, prefer lower waste
    return smallerStock.wastePercentage < largerStock.wastePercentage;
  }

  /**
   * Get stock selection configuration
   */
  public getConfig(): Readonly<StockSelectionConfig> {
    return this.config;
  }
}
