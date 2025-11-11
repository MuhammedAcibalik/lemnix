/**
 * @fileoverview Future Opportunity Calculator
 * @module FutureOpportunityCalculator
 * @version 1.0.0
 * @description Calculates future fit opportunities for BFD algorithm look-ahead
 * Extracted from BFDAlgorithm to follow Single Responsibility Principle
 */

import { OptimizationItem } from "../../../types";
import { OptimizationContext } from "../core/OptimizationContext";
import type { ILogger } from "../../logger";

/**
 * Service for calculating future opportunity scores in BFD algorithm
 * Implements look-ahead strategy to make better placement decisions
 * Follows Single Responsibility Principle (SRP)
 */
export class FutureOpportunityCalculator {
  private readonly logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  /**
   * Calculate future opportunity score based on upcoming items
   *
   * The score represents the fraction of upcoming items that could fit
   * in the remaining space. Higher score means more future opportunities.
   *
   * @param remainingSpace - Available space after current placement
   * @param upcomingItems - Next items to be placed
   * @param context - Optimization context with constraints
   * @returns Score from 0.0 to 1.0
   */
  public calculateScore(
    remainingSpace: number,
    upcomingItems: ReadonlyArray<OptimizationItem>,
    context: OptimizationContext,
  ): number {
    if (upcomingItems.length === 0) {
      return 1.0; // No future items to consider
    }

    let fittableCount = 0;

    for (const upcomingItem of upcomingItems) {
      const requiredSpace = upcomingItem.length + context.constraints.kerfWidth;
      if (remainingSpace >= requiredSpace) {
        fittableCount++;
      }
    }

    const futureScore = fittableCount / upcomingItems.length;

    this.logger.debug("Look-ahead analysis", {
      upcomingItems: upcomingItems.length,
      remainingSpace,
      fittableCount,
      futureOpportunityScore: futureScore.toFixed(2),
    });

    return futureScore;
  }

  /**
   * Get the number of upcoming items that would fit in remaining space
   *
   * @param remainingSpace - Available space
   * @param upcomingItems - Next items to be placed
   * @param kerfWidth - Saw blade width
   * @returns Count of items that would fit
   */
  public countFittableItems(
    remainingSpace: number,
    upcomingItems: ReadonlyArray<OptimizationItem>,
    kerfWidth: number,
  ): number {
    let count = 0;

    for (const item of upcomingItems) {
      const requiredSpace = item.length + kerfWidth;
      if (remainingSpace >= requiredSpace) {
        count++;
      }
    }

    return count;
  }

  /**
   * Check if a specific item would fit in remaining space
   *
   * @param remainingSpace - Available space
   * @param item - Item to check
   * @param kerfWidth - Saw blade width
   * @returns True if item fits
   */
  public wouldFit(
    remainingSpace: number,
    item: OptimizationItem,
    kerfWidth: number,
  ): boolean {
    const requiredSpace = item.length + kerfWidth;
    return remainingSpace >= requiredSpace;
  }
}
