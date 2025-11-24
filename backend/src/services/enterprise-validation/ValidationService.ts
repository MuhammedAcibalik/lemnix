/**
 * Enterprise Validation Service - Type-safe request validation
 * SRP: Single responsibility - validate enterprise optimization requests
 *
 * @module enterprise/services
 * @version 1.0.0
 */

import {
  OptimizationItem,
  OptimizationResult,
  OptimizationAlgorithm,
} from "../../types";
import type { EnterpriseOptimizationRequest } from "../../types/enterprise";

/**
 * Validation result type
 */
export interface OptimizationValidationResult<T> {
  readonly isValid: boolean;
  readonly data?: T;
  readonly errors?: ReadonlyArray<string>;
}

/**
 * Optimization Request Validation Service
 * Validates enterprise optimization requests and results
 * Enterprise-specific validation logic for optimization requests
 */
export class OptimizationRequestValidationService {
  private readonly SUPPORTED_ALGORITHMS: ReadonlyArray<string> = [
    "ffd",
    "bfd",
    "genetic",
    "pooling",
  ] as const;

  /**
   * Validate enterprise optimization request
   */
  public validateRequest(
    body: unknown,
  ): OptimizationValidationResult<EnterpriseOptimizationRequest> {
    const errors: string[] = [];

    // Check if body is object
    if (!this.isRecord(body)) {
      return { isValid: false, errors: ["Request body must be an object"] };
    }

    // Validate items
    if (!this.hasValidItems(body)) {
      errors.push("Items array is required and must be non-empty");
    }

    // Validate algorithm
    if (!this.hasValidAlgorithm(body)) {
      errors.push(
        `Algorithm must be one of: ${this.SUPPORTED_ALGORITHMS.join(", ")}`,
      );
    }

    // Validate objectives
    if (!this.hasValidObjectives(body)) {
      errors.push("At least one optimization objective is required");
    }

    // Validate constraints
    if (!this.hasValidConstraints(body)) {
      errors.push("Constraints object is required");
    }

    // Validate performance settings
    if (!this.hasValidPerformance(body)) {
      errors.push("Performance settings object is required");
    }

    // Validate cost model
    if (!this.hasValidCostModel(body)) {
      errors.push("Cost model object is required");
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    return {
      isValid: true,
      data: body as unknown as EnterpriseOptimizationRequest,
    };
  }

  /**
   * Validate optimization result integrity
   * Ensures mathematical consistency
   */
  public validateIntegrity(result: unknown): result is OptimizationResult {
    if (!this.isRecord(result)) return false;
    if (!this.isValidCutsArray(result.cuts)) return false;

    const cuts = result.cuts as Array<{
      usedLength: number;
      remainingLength: number;
      stockLength: number;
    }>;

    // Validate each cut
    for (const cut of cuts) {
      if (!this.isValidCut(cut)) {
        return false;
      }
    }

    // Validate efficiency calculation
    const totalUsed = cuts.reduce((sum, cut) => sum + cut.usedLength, 0);
    const totalStock = cuts.reduce((sum, cut) => sum + cut.stockLength, 0);
    const calculatedEfficiency =
      totalStock > 0 ? (totalUsed / totalStock) * 100 : 0;

    if (typeof result.efficiency !== "number") return false;
    if (Math.abs(result.efficiency - calculatedEfficiency) > 0.1) {
      return false;
    }

    return true;
  }

  /**
   * Create empty result for error cases
   */
  public createEmptyResult(): OptimizationResult {
    return {
      cuts: [],
      totalWaste: 0,
      efficiency: 0,
      stockCount: 0,
      totalSegments: 0,
      wastePercentage: 0,
      averageCutsPerStock: 0,
      totalLength: 0,
      setupTime: 0,
      materialUtilization: 0,
      cuttingComplexity: 0,
      cuttingTime: 0,
      totalTime: 0,
      materialCost: 0,
      wasteCost: 0,
      laborCost: 0,
      totalCost: 0,
      costPerMeter: 0,
      qualityScore: 0,
      reclaimableWastePercentage: 0,
      algorithm: OptimizationAlgorithm.BEST_FIT_DECREASING, // FIRST_FIT_DECREASING removed
      executionTimeMs: 0,
      wasteDistribution: {
        minimal: 0,
        small: 0,
        medium: 0,
        large: 0,
        excessive: 0,
        reclaimable: 0,
        totalPieces: 0,
      },
      constraints: {
        maxWastePercentage: 10,
        maxCutsPerStock: 50,
        minScrapLength: 75,
        kerfWidth: 3.5,
        safetyMargin: 2,
        allowPartialStocks: true,
        prioritizeSmallWaste: true,
        reclaimWasteOnly: false,
        balanceComplexity: true,
        respectMaterialGrades: true,
      },
      recommendations: [],
      efficiencyCategory: "good",
      detailedWasteAnalysis: {
        minimal: 0,
        small: 0,
        medium: 0,
        large: 0,
        excessive: 0,
        totalPieces: 0,
        averageWaste: 0,
      },
      optimizationScore: 0,
    };
  }

  // ============================================================================
  // PRIVATE TYPE GUARDS
  // ============================================================================

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  private hasValidItems(
    body: Record<string, unknown>,
  ): body is Record<string, unknown> & { items: OptimizationItem[] } {
    return (
      "items" in body && Array.isArray(body.items) && body.items.length > 0
    );
  }

  private hasValidAlgorithm(body: Record<string, unknown>): boolean {
    return (
      "algorithm" in body &&
      typeof body.algorithm === "string" &&
      this.SUPPORTED_ALGORITHMS.includes(body.algorithm)
    );
  }

  private hasValidObjectives(body: Record<string, unknown>): boolean {
    return (
      "objectives" in body &&
      Array.isArray(body.objectives) &&
      body.objectives.length > 0
    );
  }

  private hasValidConstraints(body: Record<string, unknown>): boolean {
    return "constraints" in body && this.isRecord(body.constraints);
  }

  private hasValidPerformance(body: Record<string, unknown>): boolean {
    return "performance" in body && this.isRecord(body.performance);
  }

  private hasValidCostModel(body: Record<string, unknown>): boolean {
    return "costModel" in body && this.isRecord(body.costModel);
  }

  private isValidCutsArray(
    value: unknown,
  ): value is Array<Record<string, unknown>> {
    return Array.isArray(value);
  }

  private isValidCut(cut: unknown): cut is {
    usedLength: number;
    remainingLength: number;
    stockLength: number;
  } {
    if (!this.isRecord(cut)) return false;

    const { usedLength, remainingLength, stockLength } = cut;

    if (
      typeof usedLength !== "number" ||
      typeof remainingLength !== "number" ||
      typeof stockLength !== "number"
    ) {
      return false;
    }

    // Check mathematical consistency
    const tolerance = 1e-6;
    const sum = usedLength + remainingLength;
    if (Math.abs(sum - stockLength) > tolerance) {
      return false;
    }

    // Check non-negative values
    if (usedLength < 0 || remainingLength < 0 || stockLength <= 0) {
      return false;
    }

    return true;
  }
}
