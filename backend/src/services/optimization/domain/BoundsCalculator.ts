/**
 * LEMNİX Bounds Calculator
 * Calculates theoretical lower bounds for cutting stock problems
 *
 * @module optimization/domain
 * @version 1.0.0
 */

import type { ILogger } from "../../logger";

/**
 * Calculate theoretical lower bound for minimum stock count
 *
 * Lower bound is based on: total demand length / max stock length
 * This is optimistic - actual solution may need more stocks if
 * patterns don't fit perfectly.
 *
 * @param demands - Map of item length -> quantity
 * @param stockLengths - Available stock lengths
 * @param logger - Logger instance
 * @returns Lower bound (minimum number of stocks theoretically needed)
 */
export function computeLowerBound(
  demands: ReadonlyMap<number, number>,
  stockLengths: ReadonlyArray<number>,
  logger: ILogger,
): number {
  if (demands.size === 0) {
    logger.warn("[BoundsCalculator] No demands provided");
    return 0;
  }

  if (stockLengths.length === 0) {
    logger.warn("[BoundsCalculator] No stock lengths provided");
    return Infinity;
  }

  // Calculate total demand length
  let totalDemandLength = 0;
  for (const [length, quantity] of demands) {
    totalDemandLength += length * quantity;
  }

  // Find maximum stock length (most optimistic case)
  const maxStockLength = Math.max(...stockLengths);

  // Lower bound = ceiling of total length / max stock
  const lowerBound = Math.ceil(totalDemandLength / maxStockLength);

  logger.debug("[BoundsCalculator] Computed lower bound", {
    totalDemandLength,
    maxStockLength,
    lowerBound,
  });

  return lowerBound;
}

/**
 * Check if demands can theoretically be satisfied with given stock lengths
 *
 * @param demands - Map of item length -> quantity
 * @param stockLengths - Available stock lengths
 * @returns true if theoretically possible, false otherwise
 */
export function canSatisfyDemand(
  demands: ReadonlyMap<number, number>,
  stockLengths: ReadonlyArray<number>,
): boolean {
  if (stockLengths.length === 0) {
    return false;
  }

  // Get smallest stock length
  const minStock = Math.min(...stockLengths);

  // Check if any item is too large to fit
  for (const itemLength of demands.keys()) {
    if (itemLength > minStock) {
      return false;
    }
  }

  return true;
}
