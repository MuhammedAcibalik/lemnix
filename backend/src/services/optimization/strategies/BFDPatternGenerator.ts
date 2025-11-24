/**
 * BFD Pattern Generation Strategy
 * Generates cutting patterns for DP optimization
 *
 * @module optimization/strategies
 * @version 1.0.0
 * @description Pattern generation and Pareto filtering for BFD algorithm
 */

import { EnhancedConstraints } from "../types";
import type { ILogger } from "../../logger";

/**
 * Cutting pattern structure
 */
export interface CuttingPattern {
  readonly stockLength: number;
  readonly pattern: Map<number, number>; // length -> count
  readonly used: number;
  readonly waste: number;
}

/**
 * Item group structure
 */
export interface ItemGroup {
  readonly length: number;
  readonly quantity: number;
}

/**
 * BFD Pattern Generator
 * Generates all valid cutting patterns for given items and stock lengths
 */
export class BFDPatternGenerator {
  constructor(private readonly logger: ILogger) {}

  /**
   * Generate all possible cutting patterns for given item groups and stock lengths
   *
   * Pattern Generation Algorithm:
   * =============================
   * Uses recursive enumeration to generate all valid cutting patterns.
   *
   * Input:
   * - Item groups: G = {(l₁, q₁), (l₂, q₂), ..., (lₙ, qₙ)}
   *   where lᵢ = length, qᵢ = quantity demanded
   * - Stock lengths: S = {s₁, s₂, ..., sₘ}
   * - Kerf width: k
   * - Safety margins: σₛ, σₑ
   *
   * Output:
   * - Set of patterns P = {p₁, p₂, ..., pₘ}
   *   where each pattern pⱼ = {(l₁, c₁), (l₂, c₂), ..., (lₙ, cₙ)}
   *   and cᵢ = count of items with length lᵢ in pattern
   *
   * Constraints per pattern:
   * -----------------------
   * 1. Capacity: Σ(cᵢ × lᵢ) + (Σcᵢ - 1) × k ≤ u
   * 2. Non-negative: cᵢ ≥ 0 for all i
   * 3. At least one item: Σcᵢ ≥ 1
   *
   * Complexity:
   * ----------
   * Time: O(∏ᵢ (maxCountᵢ + 1)) ≈ O(2ⁿ) worst case
   * Space: O(number of valid patterns)
   *
   * @param itemGroups - Item groups (length, quantity)
   * @param stockLengths - Available stock lengths
   * @param constraints - Optimization constraints
   * @param maxPatterns - Optional limit to prevent memory explosion
   * @returns Array of cutting patterns
   */
  public generateCuttingPatterns(
    itemGroups: ReadonlyArray<ItemGroup>,
    stockLengths: ReadonlyArray<number>,
    constraints: EnhancedConstraints,
    maxPatterns?: number,
  ): ReadonlyArray<CuttingPattern> {
    this.logger.info("[BFDPatternGenerator] Generating cutting patterns", {
      itemGroups: itemGroups.length,
      stockLengths: stockLengths.length,
      kerfWidth: constraints.kerfWidth,
      maxPatterns: maxPatterns || "unlimited",
    });

    // Validate inputs before pattern generation
    if (itemGroups.length === 0) {
      this.logger.warn(
        "[BFDPatternGenerator] No item groups provided for pattern generation",
      );
      return [];
    }

    if (stockLengths.length === 0) {
      this.logger.error(
        "[BFDPatternGenerator] No stock lengths provided for pattern generation",
      );
      throw new Error("Cannot generate patterns: No stock lengths available");
    }

    // Check for invalid item lengths
    for (const group of itemGroups) {
      if (!Number.isFinite(group.length) || group.length <= 0) {
        this.logger.error(
          "[BFDPatternGenerator] Invalid item length in pattern generation",
          {
            length: group.length,
            quantity: group.quantity,
          },
        );
        throw new Error(
          `Invalid item length ${group.length}mm in pattern generation`,
        );
      }
      if (!Number.isFinite(group.quantity) || group.quantity < 1) {
        this.logger.error(
          "[BFDPatternGenerator] Invalid item quantity in pattern generation",
          {
            length: group.length,
            quantity: group.quantity,
          },
        );
        throw new Error(
          `Invalid item quantity ${group.quantity} for length ${group.length}mm`,
        );
      }
    }

    const patterns: CuttingPattern[] = [];

    // Sort stock lengths descending to prioritize larger stocks first
    // Note: For "en az stok boyu" strategy, we might want ascending order
    // But for pattern generation, larger stocks generate more patterns
    const sortedStockLengths = [...stockLengths].sort((a, b) => b - a);

    for (const stockLength of sortedStockLengths) {
      // CRITICAL FIX: Subtract BOTH startSafety and endSafety for pattern generation
      // The optimization must respect both safety margins as hard constraints
      const usableLength =
        stockLength - constraints.startSafety - constraints.endSafety;

      // Safety check for usable length
      if (usableLength <= 0) {
        this.logger.warn(
          "[BFDPatternGenerator] Stock length too small for pattern generation",
          {
            stockLength,
            startSafety: constraints.startSafety,
            usableLength,
          },
        );
        continue; // Skip this stock length
      }

      // Generate all possible combinations of items that fit in this stock
      try {
        this.generatePatternsForStock(
          itemGroups,
          stockLength,
          usableLength,
          patterns,
          constraints,
        );
      } catch (error) {
        this.logger.error(
          "[BFDPatternGenerator] Error generating patterns for stock length",
          {
            stockLength,
            error: error instanceof Error ? error.message : String(error),
          },
        );
        // Continue with other stock lengths instead of failing completely
        continue;
      }

      // MEMORY SAFETY: Stop if we hit the pattern limit
      if (maxPatterns && patterns.length >= maxPatterns) {
        this.logger.warn(
          `[BFDPatternGenerator] Pattern limit reached (${patterns.length}/${maxPatterns}) - stopping generation`,
        );
        break;
      }
    }

    // Check if we generated any patterns
    if (patterns.length === 0) {
      this.logger.error(
        "[BFDPatternGenerator] No valid patterns generated - items may not fit in any stock",
        {
          itemGroups: itemGroups.map((g) => `${g.length}mm x${g.quantity}`),
          stockLengths: sortedStockLengths,
        },
      );
      throw new Error(
        `Cannot generate patterns: No valid cutting patterns found. ` +
          `Items may be too large for available stock lengths (${sortedStockLengths.join(", ")}mm). ` +
          `Consider using larger stock or reducing item lengths.`,
      );
    }

    // Apply Pareto filtering to reduce combinatorial explosion
    const beforeCount = patterns.length;
    const filtered = this.filterParetoOptimal(patterns);

    this.logger.info("[BFDPatternGenerator] Pattern filtering applied", {
      beforeCount,
      afterCount: filtered.length,
      reduction: beforeCount - filtered.length,
      reductionPct:
        beforeCount > 0
          ? (((beforeCount - filtered.length) / beforeCount) * 100).toFixed(1) +
            "%"
          : "0%",
    });

    return filtered;
  }

  /**
   * Generate patterns for a specific stock length
   *
   * @param itemGroups - Item groups
   * @param stockLength - Stock length
   * @param usableLength - Usable length (stockLength - startSafety)
   * @param patterns - Output array to append patterns to
   * @param constraints - Optimization constraints
   */
  private generatePatternsForStock(
    itemGroups: ReadonlyArray<ItemGroup>,
    stockLength: number,
    usableLength: number,
    patterns: CuttingPattern[],
    constraints: EnhancedConstraints,
  ): void {
    const lengths = itemGroups.map((g) => g.length);
    const kerfWidth = constraints.kerfWidth;

    // Calculate max counts considering kerf
    // Each item needs: length + kerfWidth (kerf between each pair)
    const maxCounts = itemGroups.map((g) => {
      if (kerfWidth === 0) {
        return Math.floor(usableLength / g.length);
      }
      // With kerf: (usableLength + kerf) / (length + kerf)
      // Formula: usableLength = count × (length + kerf) - kerf
      // Solving for count: count = (usableLength + kerf) / (length + kerf)
      return Math.floor((usableLength + kerfWidth) / (g.length + kerfWidth));
    });

    // Generate all combinations using recursive approach
    this.generateCombinations(
      lengths,
      maxCounts,
      usableLength,
      stockLength,
      kerfWidth,
      new Map<number, number>(),
      0,
      patterns,
    );
  }

  /**
   * Recursively generate all valid combinations
   *
   * Recursive Pattern Generation:
   * =============================
   * This implements a backtracking algorithm to enumerate all
   * feasible cutting patterns for a given stock.
   *
   * State Space:
   * -----------
   * Each state is defined by:
   * - currentPattern: Partial pattern built so far
   * - itemIndex: Current item type being considered
   * - remainingSpace: Unused length available
   *
   * Branching:
   * ---------
   * At each level, try counts from 0 to maxCount for current item.
   *
   * Pruning:
   * -------
   * Stop branch if:
   * 1. Used length + kerf > usable length
   * 2. Remaining space cannot fit minimum item
   *
   * @param lengths - Item lengths
   * @param maxCounts - Maximum counts for each item type
   * @param usableLength - Usable length
   * @param stockLength - Stock length
   * @param kerfWidth - Kerf width
   * @param currentPattern - Current partial pattern
   * @param itemIndex - Current item index
   * @param patterns - Output array
   */
  private generateCombinations(
    lengths: ReadonlyArray<number>,
    maxCounts: ReadonlyArray<number>,
    usableLength: number,
    stockLength: number,
    kerfWidth: number,
    currentPattern: Map<number, number>,
    itemIndex: number,
    patterns: CuttingPattern[],
  ): void {
    if (itemIndex >= lengths.length) {
      // Check if this pattern is valid (has at least one item)
      if (currentPattern.size > 0) {
        // Calculate used length with kerf
        let used = 0;
        let totalSegments = 0;

        for (const [length, count] of currentPattern.entries()) {
          used += length * count;
          totalSegments += count;
        }

        // Add kerf: (totalSegments - 1) × kerfWidth (kerf between segments)
        if (kerfWidth > 0 && totalSegments > 0) {
          const kerfNeeded = (totalSegments - 1) * kerfWidth;
          used += kerfNeeded;
        }

        if (used <= usableLength) {
          const waste = usableLength - used;
          patterns.push({
            stockLength,
            pattern: new Map(currentPattern),
            used,
            waste,
          });
        }
      }
      return;
    }

    const currentLength = lengths[itemIndex]!;
    const maxCountForThisItem = maxCounts[itemIndex]!;

    // Calculate remaining space in current pattern
    let currentUsed = 0;
    let currentTotalSegments = 0;
    for (const [length, count] of currentPattern.entries()) {
      currentUsed += length * count;
      currentTotalSegments += count;
    }

    // Calculate kerf already used
    const currentKerf =
      kerfWidth > 0 && currentTotalSegments > 0
        ? (currentTotalSegments - 1) * kerfWidth
        : 0;

    const remainingSpace = usableLength - currentUsed - currentKerf;

    // Calculate ACTUAL max count based on remaining space
    const actualMaxCount =
      kerfWidth === 0
        ? Math.floor(remainingSpace / currentLength)
        : Math.floor(
            (remainingSpace + kerfWidth) / (currentLength + kerfWidth),
          );

    // Use the MINIMUM of theoretical max and actual available space
    const effectiveMaxCount = Math.min(maxCountForThisItem, actualMaxCount);

    // Try all possible counts for current item (0 to effectiveMaxCount)
    for (let count = 0; count <= effectiveMaxCount; count++) {
      const newPattern = new Map(currentPattern);
      if (count > 0) {
        newPattern.set(currentLength, count);
      }

      this.generateCombinations(
        lengths,
        maxCounts,
        usableLength,
        stockLength,
        kerfWidth,
        newPattern,
        itemIndex + 1,
        patterns,
      );
    }
  }

  /**
   * Filter patterns using Pareto optimality
   * Remove patterns strictly dominated by others (more/equal items, less/equal waste)
   *
   * A pattern p1 dominates p2 if:
   * - Same stock length
   * - p1 has more or equal items in all lengths
   * - p1 has less or equal waste
   * - At least one inequality is strict
   *
   * @param patterns - Patterns to filter
   * @returns Filtered patterns (Pareto optimal set)
   */
  public filterParetoOptimal(
    patterns: ReadonlyArray<CuttingPattern>,
  ): ReadonlyArray<CuttingPattern> {
    const filtered: CuttingPattern[] = [];

    for (let i = 0; i < patterns.length; i++) {
      const p = patterns[i]!;
      let dominated = false;

      for (let j = 0; j < patterns.length; j++) {
        if (i === j) continue;
        const q = patterns[j]!;

        // Only compare within same stock length for fair comparison
        if (q.stockLength !== p.stockLength) continue;

        const qHasMoreOrEqual = this.patternHasMoreOrEqualItems(
          q.pattern,
          p.pattern,
        );
        const qStrictlyBetter =
          qHasMoreOrEqual && q.waste <= p.waste && q.waste < p.waste;

        if (qStrictlyBetter) {
          dominated = true;
          break;
        }
      }

      if (!dominated) {
        filtered.push(p);
      }
    }

    return filtered;
  }

  /**
   * Check if pattern q has more or equal items than pattern p
   *
   * @param q - Pattern q
   * @param p - Pattern p
   * @returns True if q has more or equal items in all lengths
   */
  private patternHasMoreOrEqualItems(
    q: Map<number, number>,
    p: Map<number, number>,
  ): boolean {
    for (const [length, count] of p.entries()) {
      const qCount = q.get(length) || 0;
      if (qCount < count) return false;
    }
    return true;
  }

  /**
   * Generate plan label for a pattern
   *
   * @param pattern - Pattern map (length -> count)
   * @returns Human-readable label
   */
  public generatePlanLabel(pattern: Map<number, number>): string {
    const parts: string[] = [];
    for (const [length, count] of pattern.entries()) {
      parts.push(`${count}×${length}mm`);
    }
    return parts.join(" + ");
  }

  /**
   * Generate cutting plan from segments
   */
  public generateCuttingPlan(
    segments: ReadonlyArray<import("../../../types").CuttingSegment>,
  ): Array<{ length: number; count: number; profile?: string }> {
    const lengthMap = new Map<number, { count: number; profile?: string }>();

    for (const segment of segments) {
      this.aggregateSegmentInPlan(segment, lengthMap);
    }

    return this.convertPlanMapToArray(lengthMap);
  }

  /**
   * Aggregate segment into cutting plan
   */
  private aggregateSegmentInPlan(
    segment: import("../../../types").CuttingSegment,
    lengthMap: Map<number, { count: number; profile?: string }>,
  ): void {
    const existing = lengthMap.get(segment.length);

    if (existing !== undefined) {
      existing.count++;
    } else {
      lengthMap.set(segment.length, {
        count: 1,
        profile: segment.profileType,
      });
    }
  }

  /**
   * Convert plan map to sorted array
   */
  private convertPlanMapToArray(
    lengthMap: Map<number, { count: number; profile?: string }>,
  ): Array<{ length: number; count: number; profile?: string }> {
    return Array.from(lengthMap.entries())
      .map(([length, data]) => ({ length, ...data }))
      .sort((a, b) => b.length - a.length);
  }

  /**
   * Format cutting plan as human-readable label
   */
  public formatCuttingPlanLabel(
    plan: ReadonlyArray<{ length: number; count: number }>,
  ): string {
    return plan.map((p) => `${p.count} × ${p.length} mm`).join(" + ");
  }
}
