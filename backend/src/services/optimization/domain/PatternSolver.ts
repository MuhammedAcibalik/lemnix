/**
 * LEMNİX Pattern Solver
 * Solves the pattern selection problem using DFS + memoization
 *
 * @module optimization/domain
 * @version 1.0.0
 *
 * Uses DFS to find exact demand-satisfying combinations of patterns
 * with lexicographic optimization: minimize stocks, then waste
 */

import type { ILogger } from "../../logger";
import { Pattern, PatternSolution } from "./Pattern";

/**
 * Custom error for timeout
 */
export class SolverTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SolverTimeoutError";
  }
}

/**
 * Interface for pattern solver
 */
export interface IPatternSolver {
  /**
   * Solve pattern selection problem
   *
   * @param patterns - All available patterns
   * @param demand - Required items (length -> quantity)
   * @param maxStocks - Maximum stock bars to use
   * @param timeout - Timeout in milliseconds
   * @returns Solution or null if not found
   */
  solve(
    patterns: ReadonlyArray<Pattern>,
    demand: ReadonlyMap<number, number>,
    maxStocks: number,
    timeout: number,
  ): PatternSolution | null;
}

/**
 * Memoized DFS solver
 */
export class MemoizedPatternSolver implements IPatternSolver {
  private readonly logger: ILogger;
  private iterationCount = 0;
  private readonly checkInterval = 10000; // Check timeout every 10k iterations

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  /**
   * Solve using DFS with memoization
   */
  public solve(
    patterns: ReadonlyArray<Pattern>,
    demand: ReadonlyMap<number, number>,
    maxStocks: number,
    timeout: number,
  ): PatternSolution | null {
    this.iterationCount = 0;
    const startTime = Date.now();

    this.logger.debug("[PatternSolver] Starting solve", {
      patternsCount: patterns.length,
      demandSize: demand.size,
      maxStocks,
      timeout,
    });

    // Sort patterns by utilization DESC (try best-filling first)
    const sortedPatterns = [...patterns].sort(
      (a, b) => b.utilization - a.utilization,
    );

    // Create demand map (mutable for recursion)
    const remainingDemand = new Map(demand);
    const memo = new Map<string, PatternSolution | null>();

    // Track best solution found so far
    const bestRef: { value: PatternSolution | null } = { value: null };
    let bestWaste = Infinity;

    const result = this.solveDFS(
      sortedPatterns,
      remainingDemand,
      maxStocks,
      startTime,
      timeout,
      memo,
      (solution: PatternSolution) => {
        if (solution.totalWaste < bestWaste) {
          bestRef.value = solution;
          bestWaste = solution.totalWaste;
        }
      },
    );

    const elapsed = Date.now() - startTime;
    const bestWasteValue =
      bestRef.value !== null ? bestRef.value.totalWaste : undefined;
    this.logger.debug("[PatternSolver] Solve complete", {
      found: result !== null,
      iterations: this.iterationCount,
      elapsed,
      bestWaste: bestWasteValue,
    });

    // Return best solution found, or first valid solution if no best
    return bestRef.value || result;
  }

  /**
   * DFS with memoization
   */
  private solveDFS(
    patterns: ReadonlyArray<Pattern>,
    remainingDemand: Map<number, number>,
    remainingStocks: number,
    startTime: number,
    timeout: number,
    memo: Map<string, PatternSolution | null>,
    onSolutionFound: (solution: PatternSolution) => void,
  ): PatternSolution | null {
    // Check timeout
    this.iterationCount++;
    if (this.iterationCount % this.checkInterval === 0) {
      const elapsed = Date.now() - startTime;
      if (elapsed > timeout) {
        throw new SolverTimeoutError(`Timeout after ${elapsed}ms`);
      }
    }

    // Check if all demand satisfied
    if (this.isDemandSatisfied(remainingDemand)) {
      if (remainingStocks === 0) {
        // Perfect solution: no remaining stocks, all demand satisfied
        return this.createSolution(patterns, []);
      } else {
        // Solution found but with leftover stocks
        // Return partial solution (best recorded via callback)
        return null;
      }
    }

    // Base case: no more stocks
    if (remainingStocks === 0) {
      return null;
    }

    // Memoization key
    const memoKey = this.createMemoKey(remainingDemand, remainingStocks);
    if (memo.has(memoKey)) {
      return memo.get(memoKey)!;
    }

    // Try each pattern
    for (const pattern of patterns) {
      // Check if pattern can be applied (doesn't exceed remaining demand)
      if (!this.canApplyPattern(pattern, remainingDemand)) {
        continue;
      }

      // Apply pattern
      this.applyPattern(pattern, remainingDemand);

      // Recurse
      const result = this.solveDFS(
        patterns,
        remainingDemand,
        remainingStocks - 1,
        startTime,
        timeout,
        memo,
        onSolutionFound,
      );

      // Backtrack
      this.unapplyPattern(pattern, remainingDemand);

      // If we found a valid solution, record it and stop
      if (result) {
        // Prepend current pattern to solution
        const solutionWithCurrent = this.prependPattern(result, pattern);
        onSolutionFound(solutionWithCurrent);
        memo.set(memoKey, solutionWithCurrent);
        return solutionWithCurrent;
      }

      // Also check if we found a solution with leftover stocks
      // (recorded via callback, but don't return yet - keep looking)
    }

    // No solution found
    memo.set(memoKey, null);
    return null;
  }

  /**
   * Create deterministic memoization key
   */
  private createMemoKey(
    demand: ReadonlyMap<number, number>,
    stocks: number,
  ): string {
    // Sort keys for deterministic key generation
    const sortedKeys = Array.from(demand.keys()).sort((a, b) => a - b);
    const demandStr = sortedKeys.map((k) => `${k}:${demand.get(k)}`).join(",");
    return `${stocks}|${demandStr}`;
  }

  /**
   * Check if all demand is satisfied
   */
  private isDemandSatisfied(demand: ReadonlyMap<number, number>): boolean {
    for (const quantity of demand.values()) {
      if (quantity > 0) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check if pattern can be applied without exceeding demand
   */
  private canApplyPattern(
    pattern: Pattern,
    demand: ReadonlyMap<number, number>,
  ): boolean {
    for (const [length, count] of pattern.items) {
      const required = demand.get(length) || 0;
      if (count > required) {
        return false;
      }
    }
    return true;
  }

  /**
   * Apply pattern to demand (subtract items)
   */
  private applyPattern(pattern: Pattern, demand: Map<number, number>): void {
    for (const [length, count] of pattern.items) {
      const current = demand.get(length) || 0;
      demand.set(length, current - count);
    }
  }

  /**
   * Unapply pattern from demand (add items back)
   */
  private unapplyPattern(pattern: Pattern, demand: Map<number, number>): void {
    for (const [length, count] of pattern.items) {
      const current = demand.get(length) || 0;
      demand.set(length, current + count);
    }
  }

  /**
   * Create solution with single pattern usage
   */
  private createSolution(
    allPatterns: ReadonlyArray<Pattern>,
    patternCounts: ReadonlyArray<{ patternId: string; count: number }>,
  ): PatternSolution {
    let totalStocks = 0;
    let totalWaste = 0;

    for (const pc of patternCounts) {
      const pattern = allPatterns.find((p) => p.id === pc.patternId);
      if (pattern) {
        totalStocks += pc.count;
        totalWaste += pattern.waste * pc.count;
      }
    }

    return {
      patternCounts,
      allPatterns,
      totalStocks,
      totalWaste,
    };
  }

  /**
   * Prepend pattern to solution
   */
  private prependPattern(
    solution: PatternSolution,
    pattern: Pattern,
  ): PatternSolution {
    // Check if pattern already in solution
    const existingIdx = solution.patternCounts.findIndex(
      (pc) => pc.patternId === pattern.id,
    );

    let newCounts: ReadonlyArray<{ patternId: string; count: number }>;
    if (existingIdx >= 0) {
      // Increment count
      newCounts = solution.patternCounts.map((pc, idx) =>
        idx === existingIdx
          ? { patternId: pc.patternId, count: pc.count + 1 }
          : pc,
      );
    } else {
      // Add new pattern
      newCounts = [
        { patternId: pattern.id, count: 1 },
        ...solution.patternCounts,
      ];
    }

    return this.createSolution(solution.allPatterns, newCounts);
  }
}
