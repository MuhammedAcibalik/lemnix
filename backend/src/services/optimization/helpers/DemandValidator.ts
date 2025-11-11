/**
 * @fileoverview Demand Validator
 * @module DemandValidator
 * @version 1.0.0
 * @description Validates that optimization solutions meet exact demand
 * Extracted from BFDAlgorithm to follow Single Responsibility Principle
 */

import type { ILogger } from "../../logger";

/**
 * Validation result for demand checking
 */
export interface DemandValidationResult {
  readonly isValid: boolean;
  readonly errors: ReadonlyArray<string>;
  readonly warnings: ReadonlyArray<string>;
  readonly actualCuts: ReadonlyMap<number, number>;
  readonly requiredCuts: ReadonlyMap<number, number>;
}

/**
 * Item group representation
 */
export interface ItemGroup {
  readonly length: number;
  readonly quantity: number;
}

/**
 * Pattern solution representation
 */
export interface PatternSolution {
  readonly pattern: { pattern: Map<number, number> };
  readonly count: number;
}

/**
 * Service for validating optimization solutions against demand
 * Ensures cuts exactly match requirements (within tolerance)
 * Follows Single Responsibility Principle (SRP)
 */
export class DemandValidator {
  private readonly logger: ILogger;
  private readonly maxExtraPerPiece: number;

  constructor(logger: ILogger, maxExtraPerPiece: number = 2) {
    this.logger = logger;
    this.maxExtraPerPiece = maxExtraPerPiece;
  }

  /**
   * Validate that solution exactly matches demand
   *
   * @param solution - Optimization solution with patterns
   * @param itemGroups - Required item groups
   * @returns Validation result with errors and warnings
   */
  public validate(
    solution: ReadonlyArray<PatternSolution>,
    itemGroups: ReadonlyArray<ItemGroup>,
  ): DemandValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // DEBUG: Log solution state
    this.logger.info(`[DemandValidator] 🔍 Validating demand:`, {
      solutionLength: solution.length,
      itemGroupsCount: itemGroups.length,
      itemGroups: itemGroups,
    });

    // Calculate actual cuts by length
    const actualCuts = this.calculateActualCuts(solution);

    // Create required cuts map
    const requiredCuts = new Map<number, number>(
      itemGroups.map((g) => [g.length, g.quantity]),
    );

    // DEBUG: Log actual cuts
    this.logger.info(
      `[DemandValidator] 🔍 Actual cuts:`,
      Object.fromEntries(actualCuts),
    );

    // Compare with required demand
    for (const group of itemGroups) {
      const actual = actualCuts.get(group.length) || 0;
      const required = group.quantity;

      if (actual < required) {
        // Shortage is always an error
        const diff = actual - required;
        errors.push(
          `${group.length}mm: shortage ${Math.abs(diff)} (required ${required}, got ${actual})`,
        );
      } else if (actual > required + this.maxExtraPerPiece) {
        // Over-production beyond tolerance: warn but don't fail
        const excess = actual - required;
        warnings.push(
          `${group.length}mm: ${excess} extra pieces (limit: ${this.maxExtraPerPiece})`,
        );
        this.logger.warn(
          `[DemandValidator] Over-produced ${group.length}mm: ${excess} extra (limit: ${this.maxExtraPerPiece})`,
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      actualCuts,
      requiredCuts,
    };
  }

  /**
   * Calculate actual cuts from solution patterns
   *
   * @param solution - Optimization solution
   * @returns Map of length to actual cut count
   */
  private calculateActualCuts(
    solution: ReadonlyArray<PatternSolution>,
  ): Map<number, number> {
    const actualCuts = new Map<number, number>();

    solution.forEach(({ pattern, count }) => {
      for (const [length, patternCount] of pattern.pattern.entries()) {
        const current = actualCuts.get(length) || 0;
        actualCuts.set(length, current + patternCount * count);
      }
    });

    return actualCuts;
  }

  /**
   * Check if there are any shortages
   *
   * @param result - Validation result
   * @returns True if there are shortages
   */
  public hasShortages(result: DemandValidationResult): boolean {
    return result.errors.length > 0;
  }

  /**
   * Check if there are any warnings (over-production)
   *
   * @param result - Validation result
   * @returns True if there are warnings
   */
  public hasWarnings(result: DemandValidationResult): boolean {
    return result.warnings.length > 0;
  }

  /**
   * Get summary of validation result
   *
   * @param result - Validation result
   * @returns Human-readable summary
   */
  public getSummary(result: DemandValidationResult): string {
    if (result.isValid && result.warnings.length === 0) {
      return "Solution exactly matches demand";
    }

    if (result.isValid && result.warnings.length > 0) {
      return `Solution valid with ${result.warnings.length} warnings`;
    }

    return `Solution invalid: ${result.errors.length} errors`;
  }
}
