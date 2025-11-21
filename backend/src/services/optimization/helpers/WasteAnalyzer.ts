/**
 * LEMNİX Waste Analyzer
 * Analyzes and categorizes waste across optimization results
 *
 * @module optimization/helpers
 * @version 1.0.0
 * @architecture Pure functions + immutable data
 */

import {
  Cut,
  WasteCategory,
  WasteDistribution,
  DetailedWasteAnalysis,
} from "../../../types";
import { EnhancedConstraints } from "../types";

/**
 * Waste analyzer with statistical functions
 */
export class WasteAnalyzer {
  /**
   * Calculate waste category based on remaining length
   *
   * Categories:
   * - MINIMAL: < 50mm
   * - SMALL: 50-100mm
   * - MEDIUM: 100-200mm
   * - LARGE: 200-500mm
   * - EXCESSIVE: > 500mm
   *
   * @param remainingLength - Remaining length on stock (mm)
   * @returns Waste category
   */
  public static calculateWasteCategory(remainingLength: number): WasteCategory {
    if (remainingLength < 50) return WasteCategory.MINIMAL;
    if (remainingLength < 100) return WasteCategory.SMALL;
    if (remainingLength < 200) return WasteCategory.MEDIUM;
    if (remainingLength < 500) return WasteCategory.LARGE;
    return WasteCategory.EXCESSIVE;
  }

  /**
   * Calculate waste distribution across all cuts
   *
   * @param cuts - Array of cuts
   * @returns Waste distribution statistics
   */
  public static calculateWasteDistribution(
    cuts: ReadonlyArray<Cut>,
  ): WasteDistribution {
    // Use mutable intermediate object (not typed as WasteDistribution yet)
    const stats = {
      minimal: 0,
      small: 0,
      medium: 0,
      large: 0,
      excessive: 0,
      reclaimable: 0,
      totalPieces: cuts.length,
    };

    for (const cut of cuts) {
      switch (cut.wasteCategory) {
        case WasteCategory.MINIMAL:
          stats.minimal++;
          break;
        case WasteCategory.SMALL:
          stats.small++;
          break;
        case WasteCategory.MEDIUM:
          stats.medium++;
          break;
        case WasteCategory.LARGE:
          stats.large++;
          break;
        case WasteCategory.EXCESSIVE:
          stats.excessive++;
          break;
      }

      if (cut.isReclaimable) {
        stats.reclaimable++;
      }
    }

    return stats;
  }

  /**
   * Calculate detailed waste analysis
   *
   * @param cuts - Array of cuts
   * @returns Detailed waste analysis with averages
   */
  public static calculateDetailedWasteAnalysis(
    cuts: ReadonlyArray<Cut>,
  ): DetailedWasteAnalysis {
    const distribution = this.calculateWasteDistribution(cuts);
    const totalWaste = cuts.reduce((sum, cut) => sum + cut.remainingLength, 0);

    return {
      minimal: distribution.minimal,
      small: distribution.small,
      medium: distribution.medium,
      large: distribution.large,
      excessive: distribution.excessive,
      totalPieces: distribution.totalPieces,
      averageWaste:
        distribution.totalPieces > 0
          ? totalWaste / distribution.totalPieces
          : 0,
    };
  }

  /**
   * Check if waste is reclaimable
   *
   * @param remainingLength - Remaining length (mm)
   * @param minScrapLength - Minimum scrap length from constraints (mm)
   * @returns True if waste can be reclaimed
   */
  public static isReclaimable(
    remainingLength: number,
    minScrapLength: number,
  ): boolean {
    return remainingLength >= minScrapLength;
  }

  /**
   * Calculate total waste across all cuts
   *
   * @param cuts - Array of cuts
   * @returns Total waste (mm)
   */
  public static calculateTotalWaste(cuts: ReadonlyArray<Cut>): number {
    return cuts.reduce((sum, cut) => sum + cut.remainingLength, 0);
  }

  /**
   * Calculate waste percentage
   *
   * @param totalWaste - Total waste (mm)
   * @param totalStockLength - Total stock length used (mm)
   * @returns Waste percentage (0-100)
   */
  public static calculateWastePercentage(
    totalWaste: number,
    totalStockLength: number,
  ): number {
    if (totalStockLength <= 0) return 0;
    return (totalWaste / totalStockLength) * 100;
  }

  /**
   * Calculate reclaimable waste percentage
   *
   * @param cuts - Array of cuts
   * @returns Reclaimable waste percentage (0-100)
   */
  public static calculateReclaimableWastePercentage(
    cuts: ReadonlyArray<Cut>,
  ): number {
    if (cuts.length === 0) return 0;
    const reclaimableCount = cuts.filter((cut) => cut.isReclaimable).length;
    return (reclaimableCount / cuts.length) * 100;
  }

  /**
   * Get waste statistics summary
   *
   * @param cuts - Array of cuts
   * @param constraints - Optimization constraints
   * @returns Waste statistics object
   */
  public static getWasteStatistics(
    cuts: ReadonlyArray<Cut>,
    constraints: EnhancedConstraints,
  ): {
    readonly totalWaste: number;
    readonly averageWaste: number;
    readonly minWaste: number;
    readonly maxWaste: number;
    readonly wastePercentage: number;
    readonly reclaimablePercentage: number;
    readonly distribution: WasteDistribution;
  } {
    const totalWaste = this.calculateTotalWaste(cuts);
    const totalStockLength = cuts.reduce(
      (sum, cut) => sum + cut.stockLength,
      0,
    );
    const wasteValues = cuts.map((cut) => cut.remainingLength);

    return {
      totalWaste,
      averageWaste: cuts.length > 0 ? totalWaste / cuts.length : 0,
      minWaste: wasteValues.length > 0 ? Math.min(...wasteValues) : 0,
      maxWaste: wasteValues.length > 0 ? Math.max(...wasteValues) : 0,
      wastePercentage: this.calculateWastePercentage(
        totalWaste,
        totalStockLength,
      ),
      reclaimablePercentage: this.calculateReclaimableWastePercentage(cuts),
      distribution: this.calculateWasteDistribution(cuts),
    };
  }

  /**
   * Find cuts with excessive waste
   *
   * @param cuts - Array of cuts
   * @param thresholdPercentage - Threshold percentage (default: 20%)
   * @returns Array of cut indices with excessive waste
   */
  public static findExcessiveWasteCuts(
    cuts: ReadonlyArray<Cut>,
    thresholdPercentage: number = 20,
  ): number[] {
    const excessiveIndices: number[] = [];

    cuts.forEach((cut, index) => {
      const wastePercentage = (cut.remainingLength / cut.stockLength) * 100;
      if (wastePercentage > thresholdPercentage) {
        excessiveIndices.push(index);
      }
    });

    return excessiveIndices;
  }

  /**
   * Calculate efficiency category
   *
   * @param efficiency - Efficiency percentage (0-100)
   * @returns Efficiency category label
   */
  public static getEfficiencyCategory(
    efficiency: number,
  ): "excellent" | "good" | "average" | "poor" {
    if (efficiency >= 95) return "excellent";
    if (efficiency >= 90) return "good";
    if (efficiency >= 70) return "average";
    return "poor";
  }
}
