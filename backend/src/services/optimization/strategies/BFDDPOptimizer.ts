/**
 * BFD DP Optimization Strategy
 * Dynamic Programming based pattern optimization
 *
 * @module optimization/strategies
 * @version 1.0.0
 * @description DP optimization and pattern combination logic for BFD algorithm
 */

import {
  Cut,
  CuttingSegment,
  ProfileType,
  WasteCategory,
} from "../../../types";
import { OptimizationContext } from "../core/OptimizationContext";
import { EnhancedConstraints } from "../types";
import {
  PrioritySearchSolver,
  SearchPattern,
  SearchState,
} from "../algorithms/PrioritySearchSolver";
import {
  BFDPatternGenerator,
  type CuttingPattern,
  type ItemGroup,
} from "./BFDPatternGenerator";
import type { ILogger } from "../../logger";

/**
 * Solution structure
 */
export interface PatternSolution {
  readonly pattern: CuttingPattern;
  readonly count: number;
}

/**
 * BFD DP Optimizer
 * Handles dynamic programming based pattern optimization
 */
export class BFDDPOptimizer {
  constructor(
    private readonly logger: ILogger,
    private readonly patternGenerator: BFDPatternGenerator,
  ) {}

  /**
   * Execute DP optimization for pattern-based approach
   *
   * Strategy:
   * 1. Generate cutting patterns for all stock lengths
   * 2. Use PrioritySearchSolver to find optimal pattern combination
   * 3. Convert solution to cuts
   * 4. Validate demand fulfillment
   *
   * @param sortedItems - Sorted items (descending by length)
   * @param context - Optimization context
   * @param theoreticalMin - Theoretical minimum stock count
   * @param fallbackTraditionalBFD - Fallback function for traditional BFD
   * @returns Array of cuts
   */
  public executeDPOptimization(
    sortedItems: ReadonlyArray<{
      readonly length: number;
      readonly quantity: number;
      readonly workOrderId?: string;
      readonly profileType?: string;
    }>,
    context: OptimizationContext,
    theoreticalMin: {
      readonly minStockCount: number;
      readonly totalRequired: number;
      readonly recommendedStockLength: number;
    },
    fallbackTraditionalBFD: () => Cut[],
  ): Cut[] {
    this.logger.info(
      `[BFDDPOptimizer] Starting DP optimization (kerf=${context.constraints.kerfWidth})`,
    );

    // Group items by length for pattern generation
    const itemGroups = this.groupItemsByLength(sortedItems);
    const stockLengths = context.stockLengths;

    // Check problem size - pattern-based approach has combinatorial explosion
    const uniqueLengths = itemGroups.length;
    const totalDemand = itemGroups.reduce((sum, g) => sum + g.quantity, 0);

    this.logger.debug("[BFDDPOptimizer] Problem analysis", {
      uniqueLengths,
      totalDemand,
      itemGroups: itemGroups.map((g) => `${g.length}mm x${g.quantity}`),
      stockLengths,
    });

    // Determine pattern limit based on problem size
    const usePatternLimit = uniqueLengths > 10;
    const maxPatterns = usePatternLimit ? 50000 : undefined;

    if (usePatternLimit) {
      this.logger.info(
        `[BFDDPOptimizer] Medium problem (${uniqueLengths} lengths) - using limited pattern generation (max: ${maxPatterns})`,
      );
    }

    this.logger.info(`[BFDDPOptimizer] DP evaluation starting`, {
      itemGroups: itemGroups.length,
      itemGroupDetails: itemGroups,
      stockLengths: stockLengths.length,
      stockLengthsDetails: stockLengths,
      kerfWidth: context.constraints.kerfWidth,
      maxPatterns: maxPatterns || "unlimited",
    });

    // Generate all possible cutting patterns for each stock length
    let patterns: ReadonlyArray<CuttingPattern>;
    try {
      patterns = this.patternGenerator.generateCuttingPatterns(
        itemGroups,
        stockLengths,
        context.constraints,
        maxPatterns,
      );
    } catch (error) {
      this.logger.warn(
        "[BFDDPOptimizer] Pattern generation failed, falling back to traditional BFD",
        {
          error: error instanceof Error ? error.message : String(error),
        },
      );
      return fallbackTraditionalBFD();
    }

    this.logger.info("[BFDDPOptimizer] Generated patterns", {
      patternCount: patterns.length,
      samplePatterns: patterns.slice(0, 3).map((p) => ({
        stockLength: p.stockLength,
        pattern: Object.fromEntries(p.pattern),
        waste: p.waste,
      })),
    });

    if (patterns.length === 0) {
      this.logger.warn(
        "[BFDDPOptimizer] No valid patterns found, falling back to traditional BFD",
      );
      return fallbackTraditionalBFD();
    }

    // Try pattern-based approach, fall back to traditional if it fails
    try {
      // Use DP to find optimal pattern combination
      const optimalSolution = this.findOptimalPatternCombination(
        patterns,
        itemGroups,
        context.constraints,
      );

      // Convert solution to cuts
      const cuts = this.convertSolutionToCuts(
        optimalSolution,
        [...stockLengths],
        context.constraints,
        itemGroups,
      );

      // CRITICAL FIX: Validate cuts to ensure exact demand fulfillment
      // This catches any overproduction that might have occurred during conversion
      this.validateDemandFulfillment(cuts, itemGroups);

      this.logger.info(`[BFDDPOptimizer] DP optimization completed`, {
        cuts: cuts.length,
        theoreticalMin: theoreticalMin.minStockCount,
        efficiency:
          cuts.length > 0
            ? (
                (cuts.reduce((sum, c) => sum + c.usedLength, 0) /
                  cuts.reduce((sum, c) => sum + c.stockLength, 0)) *
                100
              ).toFixed(2)
            : 0,
        comparedToTheoretical:
          cuts.length - theoreticalMin.minStockCount > 0
            ? `+${cuts.length - theoreticalMin.minStockCount} stocks`
            : "at theoretical minimum",
      });

      return cuts;
    } catch (error) {
      // Pattern-based approach failed (shortage, maxStates limit, etc.)
      // Fall back to traditional BFD which ALWAYS guarantees a solution
      this.logger.warn(
        "[BFDDPOptimizer] Pattern-based approach failed, falling back to traditional BFD",
        {
          error: error instanceof Error ? error.message : String(error),
          patternsGenerated: patterns.length,
          uniqueLengths: itemGroups.length,
          fallbackReason:
            "Pattern-based optimization could not find exact solution",
        },
      );

      return fallbackTraditionalBFD();
    }
  }

  /**
   * Group items by length for pattern generation
   *
   * @param items - Items to group
   * @returns Item groups (length, quantity)
   */
  public groupItemsByLength(
    items: ReadonlyArray<{
      readonly length: number;
      readonly quantity: number;
    }>,
  ): ReadonlyArray<ItemGroup> {
    const groups = new Map<number, number>();

    items.forEach((item) => {
      const current = groups.get(item.length) || 0;
      groups.set(item.length, current + (item.quantity || 1));
    });

    return Array.from(groups.entries()).map(([length, quantity]) => ({
      length,
      quantity,
    }));
  }

  /**
   * Find optimal pattern combination using Dynamic Programming
   *
   * Uses PrioritySearchSolver to find optimal mixed-pattern solution
   * that exactly satisfies demand with minimum waste.
   *
   * @param patterns - Generated cutting patterns
   * @param itemGroups - Item groups (length, quantity)
   * @param constraints - Optimization constraints
   * @returns Optimal pattern solution
   */
  public findOptimalPatternCombination(
    patterns: ReadonlyArray<CuttingPattern>,
    itemGroups: ReadonlyArray<ItemGroup>,
    constraints: EnhancedConstraints,
  ): ReadonlyArray<PatternSolution> {
    // Create demand map - this is our target
    const targetDemand = new Map<number, number>();
    itemGroups.forEach((group) => {
      targetDemand.set(group.length, group.quantity);
    });

    this.logger.debug(`[BFDDPOptimizer] DP with exact demand tracking`, {
      targetDemand: Object.fromEntries(targetDemand),
      patternsCount: patterns.length,
    });

    // Use priority search to find exact demand solution
    return this.findExactDemandSolution(patterns, itemGroups, constraints);
  }

  /**
   * Find exact demand solution using priority search (BFS/Dijkstra-like)
   *
   * Replaces greedy backtracking to find optimal mixed-pattern solutions.
   * Enhanced with better error handling and fallback mechanisms.
   *
   * @param patterns - Available patterns
   * @param itemGroups - Item groups (length, quantity)
   * @param constraints - Optimization constraints
   * @returns Pattern solution
   */
  private findExactDemandSolution(
    patterns: ReadonlyArray<CuttingPattern>,
    itemGroups: ReadonlyArray<ItemGroup>,
    constraints: EnhancedConstraints,
  ): ReadonlyArray<PatternSolution> {
    // Initialize demand map
    const demand = new Map<number, number>();
    itemGroups.forEach((group) => {
      demand.set(group.length, group.quantity);
    });

    this.logger.info(`[BFDDPOptimizer] Starting priority search`, {
      initialDemand: Object.fromEntries(demand),
      patternsAvailable: patterns.length,
    });

    // Validate inputs
    if (patterns.length === 0) {
      this.logger.error(
        "[BFDDPOptimizer] Cannot run priority search with no patterns",
      );
      throw new Error(
        "Priority search failed: No patterns available. This indicates pattern generation failed or all patterns were filtered out.",
      );
    }

    if (demand.size === 0) {
      this.logger.error(
        "[BFDDPOptimizer] Cannot run priority search with no demand",
      );
      throw new Error(
        "Priority search failed: No demand specified. This indicates an empty or invalid cutting list.",
      );
    }

    // Convert patterns to SearchPattern format
    const searchPatterns: SearchPattern[] = patterns.map((p) => ({
      stockLength: p.stockLength,
      pattern: p.pattern,
      used: p.used,
      waste: p.waste,
    }));

    // Run priority search
    const solver = new PrioritySearchSolver(this.logger);

    this.logger.info(`[BFDDPOptimizer] Calling PrioritySearchSolver`, {
      searchPatternsCount: searchPatterns.length,
      samplePatterns: searchPatterns.slice(0, 3).map((p) => ({
        stockLength: p.stockLength,
        pattern: Object.fromEntries(p.pattern),
        waste: p.waste,
      })),
      demand: Object.fromEntries(demand),
    });

    // Waste-optimized tuning: Maximize waste reduction in priority scoring
    let result: SearchState | null = null;

    try {
      // CRITICAL FIX: Reduce maxStates for faster execution and add timeout protection
      // For large problems, 50000 states can take minutes. Use adaptive limit based on problem size.
      const adaptiveMaxStates = Math.min(
        10000, // Cap at 10000 for reasonable execution time
        Math.max(1000, searchPatterns.length * 100), // Scale with pattern count
      );

      this.logger.info(`[BFDDPOptimizer] PrioritySearchSolver config`, {
        maxStates: adaptiveMaxStates,
        patternsCount: searchPatterns.length,
        demandSize: demand.size,
        originalMaxStates: 50000,
      });

      result = solver.solve(searchPatterns, demand, {
        maxStates: adaptiveMaxStates,
        overProductionTolerance: 0, // CRITICAL FIX: Require exact quantity match (no over-production)
        wasteNormalization: 10,
      });
    } catch (error) {
      this.logger.error(
        "[BFDDPOptimizer] Priority search solver threw an exception",
        {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          patternsCount: searchPatterns.length,
          demandSize: demand.size,
        },
      );
      throw new Error(
        `Priority search solver failed: ${error instanceof Error ? error.message : String(error)}. ` +
          `This may indicate the problem is too complex or requires manual intervention.`,
      );
    }

    if (!result) {
      this.logger.error(`[BFDDPOptimizer] PrioritySearchSolver returned null`, {
        patternsCount: searchPatterns.length,
        demand: Object.fromEntries(demand),
        note: "No feasible solution found within search limits",
      });
      throw new Error(
        "No solution found with priority search. " +
          `This may occur if: 1) The demand cannot be satisfied with available patterns, ` +
          `2) The search space is too large (${searchPatterns.length} patterns), or ` +
          `3) The search state limit (50000) was exceeded. ` +
          `Consider: reducing unique item lengths, increasing stock lengths, or adjusting kerf/safety margins.`,
      );
    }

    this.logger.info(`[BFDDPOptimizer] Priority search completed`, {
      totalBars: result.totalBars,
      totalWaste: result.totalWaste,
      patternCount: result.picks.length,
      picks: result.picks,
      produced: Object.fromEntries(result.produced),
      demand: Object.fromEntries(demand),
    });

    // CRITICAL FIX: Validate produced quantities BEFORE converting to solution
    // This ensures we catch over-production early
    for (const [length, targetCount] of demand.entries()) {
      const producedCount = result.produced.get(length) || 0;
      if (producedCount !== targetCount) {
        this.logger.error(
          `[BFDDPOptimizer] Priority search solution does not match exact demand`,
          {
            length,
            required: targetCount,
            produced: producedCount,
            difference: producedCount - targetCount,
            allProduced: Object.fromEntries(result.produced),
            allDemand: Object.fromEntries(demand),
          },
        );
        throw new Error(
          `Priority search solution does not match exact demand: ${length}mm requires ${targetCount} but produced ${producedCount}. ` +
            `This indicates the solver found a solution with over-production, which should not happen with tolerance=0.`,
        );
      }
    }

    // Convert search result to solution format
    const solution = this.convertSearchStateToSolution(result, patterns);

    // Validate final solution
    const finalValidation = this.validateExactDemand(solution, itemGroups);
    if (!finalValidation.isValid) {
      this.logger.error(
        `[BFDDPOptimizer] Priority search failed to meet exact demand`,
        {
          errors: finalValidation.errors,
          produced: Object.fromEntries(result.produced),
          required: Object.fromEntries(demand),
          solutionPatterns: solution.length,
          totalCuts: solution.reduce((sum, s) => sum + s.count, 0),
        },
      );

      // CRITICAL: Pattern-based approach couldn't find exact solution
      throw new Error(
        `Demand validation failed after priority search: ${finalValidation.errors.join(", ")}. ` +
          `The algorithm found a solution but it doesn't exactly match the required quantities. ` +
          `This is a critical error - falling back to traditional BFD algorithm.`,
      );
    }

    this.logger.info(`[BFDDPOptimizer] Solution validated`, {
      totalCuts: solution.reduce((sum, s) => sum + s.count, 0),
      uniquePatterns: solution.length,
    });

    return solution;
  }

  /**
   * Convert search state to solution format
   * Groups consecutive picks of same pattern and counts them
   *
   * @param state - Search state from PrioritySearchSolver
   * @param patterns - Original patterns array
   * @returns Pattern solution
   */
  private convertSearchStateToSolution(
    state: SearchState,
    patterns: ReadonlyArray<CuttingPattern>,
  ): ReadonlyArray<PatternSolution> {
    const solution: PatternSolution[] = [];
    const patternCounts = new Map<number, number>(); // pattern index -> count

    // Count occurrences of each pattern
    for (const patternIndex of state.picks) {
      const current = patternCounts.get(patternIndex) || 0;
      patternCounts.set(patternIndex, current + 1);
    }

    // Build solution array
    for (const [patternIndex, count] of patternCounts.entries()) {
      const pattern = patterns[patternIndex];
      if (pattern) {
        solution.push({ pattern, count });
      }
    }

    this.logger.debug("[BFDDPOptimizer] Converted search state to solution", {
      uniquePatterns: solution.length,
      totalCuts: solution.reduce((sum, s) => sum + s.count, 0),
      patterns: solution
        .map((s) => `${s.count}x(${this.generatePlanLabel(s.pattern.pattern)})`)
        .join(", "),
    });

    return solution;
  }

  /**
   * Convert DP solution to cuts
   *
   * @param solution - Pattern solution
   * @param stockLengths - Available stock lengths
   * @param constraints - Optimization constraints
   * @param itemGroups - Item groups for validation (optional)
   * @returns Array of cuts
   */
  public convertSolutionToCuts(
    solution: ReadonlyArray<PatternSolution>,
    stockLengths: ReadonlyArray<number>,
    constraints: EnhancedConstraints,
    itemGroups?: ReadonlyArray<ItemGroup>,
  ): Cut[] {
    const cuts: Cut[] = [];
    let cutIndex = 0;

    const kerfWidth = constraints.kerfWidth;

    for (const { pattern, count } of solution) {
      for (let i = 0; i < count; i++) {
        const segments: CuttingSegment[] = [];
        let segmentIndex = 0;
        let usedLength = constraints.startSafety;

        // Create segments with kerf between them (only if kerf > 0)
        for (const [length, itemCount] of pattern.pattern.entries()) {
          for (let j = 0; j < itemCount; j++) {
            // Add kerf before segment (except first segment) - SKIP if kerfWidth is 0
            if (segmentIndex > 0 && kerfWidth > 0) {
              usedLength += kerfWidth;
            }
            // If kerfWidth is 0, no kerf is added - segments are placed directly

            const segment: CuttingSegment = {
              id: `segment-${cutIndex}-${segmentIndex}`,
              cutId: `cut-${cutIndex}`,
              sequenceNumber: segmentIndex,
              profileType: `Profile-${length}mm` as ProfileType,
              length,
              quantity: 1,
              position: usedLength,
              endPosition: usedLength + length,
              tolerance: 0.5,
              workOrderId: `workorder-${length}-${j}`,
              workOrderItemId: `workorder-${length}-${j}`,
              originalLength: length,
              qualityCheck: true,
              unitCost: 0,
              totalCost: 0,
              color: "#3B82F6",
              version: "1.0",
              size: "standard",
            };

            segments.push(segment);
            usedLength += length;
            segmentIndex++;
          }
        }

        // Calculate kerf loss (always 0 if kerfWidth is 0)
        const kerfLoss =
          kerfWidth > 0 && segments.length > 0
            ? (segments.length - 1) * kerfWidth
            : 0; // No kerf loss when kerfWidth is 0

        // CRITICAL FIX: usedLength calculation
        // usedLength currently = startSafety + segments + kerf
        // For Cut object, usedLength should be ONLY segments + kerf (NOT startSafety or endSafety)
        // finalizeSingleCut will add startSafety + endSafety later
        const actualSegmentLength = usedLength - constraints.startSafety; // Extract actual segments + kerf

        // VALIDATION: Verify that actualSegmentLength matches pattern.used
        // Pattern.used should equal segments + kerf (without startSafety)
        const expectedUsed = pattern.used; // Pattern.used already excludes startSafety
        const difference = Math.abs(actualSegmentLength - expectedUsed);

        if (difference > 0.01) {
          this.logger.warn(
            `[BFDDPOptimizer] Segment length mismatch in convertSolutionToCuts`,
            {
              cutIndex,
              patternUsed: expectedUsed,
              actualSegmentLength,
              difference,
              stockLength: pattern.stockLength,
              startSafety: constraints.startSafety,
              endSafety: constraints.endSafety,
              segmentsCount: segments.length,
            },
          );
        }

        // CRITICAL: Do NOT calculate finalUsedLength here - finalizeSingleCut will do it
        // We only need to set usedLength = segments + kerf (without safety margins)
        // Use pattern.used as source of truth since it's already validated
        const cut: Cut = {
          id: `cut-${cutIndex}`,
          cuttingPlanId: `plan-${cutIndex}`,
          stockIndex: cutIndex,
          stockLength: pattern.stockLength,
          materialType: `Profile-${pattern.stockLength}mm` as ProfileType,
          segments,
          segmentCount: segments.length,
          usedLength: pattern.used, // CRITICAL: Use pattern.used as source of truth (segments + kerf, NO safety margins)
          remainingLength: 0, // Will be recalculated in finalizeSingleCut
          kerfLoss,
          wasteCategory: WasteCategory.MINIMAL,
          isReclaimable: false,
          estimatedCuttingTime: 0,
          setupTime: 0,
          safetyMargin: 0,
          toleranceCheck: true,
          sequence: cutIndex,
          planLabel: this.generatePlanLabel(pattern.pattern),
        };

        cuts.push(cut);
        cutIndex++;
      }
    }

    // VALIDATION: Check total cut counts against demand
    if (itemGroups) {
      this.validateDemandFulfillment(cuts, itemGroups);
    }

    return cuts;
  }

  /**
   * Validate that cuts exactly fulfill the required demand
   *
   * @param cuts - Generated cuts
   * @param itemGroups - Required item groups
   */
  private validateDemandFulfillment(
    cuts: ReadonlyArray<Cut>,
    itemGroups: ReadonlyArray<ItemGroup>,
  ): void {
    this.logger.info(`[BFDDPOptimizer] 🔍 Starting demand validation`, {
      totalCuts: cuts.length,
      itemGroups: itemGroups
        .map((g) => `${g.length}mm: ${g.quantity}`)
        .join(", "),
    });

    // Calculate actual cuts by length
    const actualCuts = new Map<number, number>();
    cuts.forEach((cut, cutIndex) => {
      // Only log first few cuts to avoid log spam
      if (cutIndex < 3) {
        this.logger.debug(`[BFDDPOptimizer] Processing cut ${cutIndex}`, {
          cutId: cut.id,
          stockLength: cut.stockLength,
          segmentCount: cut.segmentCount,
          segments: cut.segments.map((s) => `${s.length}mm`).join(", "),
        });
      }

      cut.segments.forEach((seg) => {
        const current = actualCuts.get(seg.length) || 0;
        actualCuts.set(seg.length, current + 1);
      });
    });

    this.logger.info(`[BFDDPOptimizer] 📊 Final actual counts`, {
      actualCuts: Object.fromEntries(actualCuts),
      requiredDemand: Object.fromEntries(
        itemGroups.map((g) => [g.length, g.quantity]),
      ),
    });

    // CRITICAL FIX: Require exact quantity match (no over-production)
    // Compare with required demand - exact match required
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const group of itemGroups) {
      const actual = actualCuts.get(group.length) || 0;
      const required = group.quantity;

      if (actual < required) {
        const diff = required - actual;
        const errorMsg = `${group.length}mm: shortage of ${diff} pieces (required ${required}, got ${actual})`;
        errors.push(errorMsg);
        this.logger.error(`[BFDDPOptimizer] Demand shortage detected`, {
          length: group.length,
          required,
          actual,
          shortage: diff,
        });
      } else if (actual > required) {
        // CRITICAL FIX: Over-production is also an error - exact quantity required
        const excess = actual - required;
        const errorMsg = `${group.length}mm: overproduced ${excess} pieces (required ${required}, got ${actual})`;
        errors.push(errorMsg);
        this.logger.error(
          `[BFDDPOptimizer] Overproduction detected - exact quantity required`,
          {
            length: group.length,
            required,
            actual,
            excess,
          },
        );
      }
    }

    if (errors.length > 0) {
      this.logger.error(`[BFDDPOptimizer] DEMAND MISMATCH`, {
        errors,
        actualCuts: Object.fromEntries(actualCuts),
        requiredDemand: itemGroups.map((g) => ({
          length: g.length,
          quantity: g.quantity,
        })),
        cutsGenerated: cuts.length,
        totalSegments: cuts.reduce((sum, c) => sum + c.segmentCount, 0),
      });
      throw new Error(
        `Demand validation failed - items are missing from cutting plan:\n${errors.join("\n")}\n\n` +
          `This is a critical error that prevents accurate order fulfillment. ` +
          `The optimization algorithm failed to generate cuts for all required items. ` +
          `Please verify input data and try again with different optimization parameters.`,
      );
    }

    this.logger.info(
      `[BFDDPOptimizer] ✅ Demand validation passed - exact match`,
      {
        actualCuts: Object.fromEntries(actualCuts),
        requiredDemand: Object.fromEntries(
          itemGroups.map((g) => [g.length, g.quantity]),
        ),
        warnings: warnings.length > 0 ? warnings : "none",
      },
    );
  }

  /**
   * Validate that solution exactly matches demand
   *
   * @param solution - Pattern solution
   * @param itemGroups - Required item groups
   * @returns Validation result
   */
  private validateExactDemand(
    solution: ReadonlyArray<PatternSolution>,
    itemGroups: ReadonlyArray<ItemGroup>,
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    this.logger.info(`[BFDDPOptimizer] Validating demand`, {
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
      `[BFDDPOptimizer] Actual cuts`,
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
        // Over-production is also an error when tolerance is 0
        const excess = actual - required;
        errors.push(
          `${group.length}mm: over-produced ${excess} extra (required ${required}, got ${actual})`,
        );
        this.logger.error(
          `[BFDDPOptimizer] Over-produced ${group.length}mm: ${excess} extra pieces. Exact quantity required.`,
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate plan label for a pattern
   *
   * @param pattern - Pattern map (length -> count)
   * @returns Plan label string
   */
  private generatePlanLabel(pattern: Map<number, number>): string {
    const parts: string[] = [];
    for (const [length, count] of pattern.entries()) {
      parts.push(`${count}×${length}mm`);
    }
    return parts.join(" + ");
  }
}
