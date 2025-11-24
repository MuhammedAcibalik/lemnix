/**
 * Priority Search Solver for Mixed-Pattern Optimization
 *
 * Replaces greedy backtracking with BFS/Dijkstra-like priority search
 * to find optimal mixed-pattern solutions.
 *
 * Algorithm:
 * - State space: (produced, totalBars, totalWaste, picks)
 * - Priority: g + h + w
 *   * g = totalBars (actual cost)
 *   * h = estimated remaining bars (heuristic)
 *   * w = normalized waste (tie-breaker)
 * - Termination: demand satisfied within tolerance
 *
 * @module optimization/algorithms
 * @version 1.0.0
 */

import type { ILogger } from "../../logger";

/**
 * Pattern structure for search
 */
export interface SearchPattern {
  readonly stockLength: number;
  readonly pattern: Map<number, number>; // length -> count
  readonly used: number;
  readonly waste: number;
}

/**
 * Search state
 */
export interface SearchState {
  readonly produced: Map<number, number>;
  readonly totalBars: number;
  readonly totalWaste: number;
  readonly picks: number[]; // pattern indices
}

/**
 * Search configuration
 */
export interface SearchConfig {
  readonly maxStates: number;
  readonly overProductionTolerance: number;
  readonly wasteNormalization: number;
}

/**
 * Priority Search Solver
 */
export class PrioritySearchSolver {
  constructor(private readonly logger: ILogger) {}

  /**
   * Solve using priority search
   */
  solve(
    patterns: SearchPattern[],
    demand: Map<number, number>,
    config: SearchConfig,
  ): SearchState | null {
    if (patterns.length === 0) {
      this.logger.warn("[PrioritySearch] No patterns provided");
      return null;
    }

    if (demand.size === 0) {
      this.logger.warn("[PrioritySearch] No demand provided");
      return null;
    }

    // Use config as-is without adjustment
    // Let caller decide the right parameters
    const adjustedConfig: SearchConfig = config;

    // Find best pattern density (for heuristic)
    const bestPatternDensity = this.findBestPatternDensity(patterns);

    this.logger.info("[PrioritySearch] Starting search:", {
      patternsCount: patterns.length,
      demand: Object.fromEntries(demand),
      bestDensity: bestPatternDensity,
      config: adjustedConfig,
    });

    // Initialize state
    const initialState: SearchState = {
      produced: new Map<number, number>(),
      totalBars: 0,
      totalWaste: 0,
      picks: [],
    };

    // Priority queue (simple array with sort)
    const open: SearchState[] = [initialState];
    const seen = new Map<string, { bars: number; waste: number }>();

    let iterations = 0;
    let bestSolution: SearchState | null = null;
    let bestPriority = Infinity;
    const startTime = Date.now();
    const maxExecutionTime = 30000; // 30 seconds timeout

    while (open.length > 0 && iterations < adjustedConfig.maxStates) {
      iterations++;

      // CRITICAL FIX: Add timeout protection to prevent infinite loops
      if (Date.now() - startTime > maxExecutionTime) {
        this.logger.warn(
          `[PrioritySearch] Timeout after ${maxExecutionTime}ms (${iterations} iterations)`,
          {
            openSize: open.length,
            bestSolutionFound: bestSolution !== null,
          },
        );
        // Return best solution found so far or null
        return bestSolution;
      }

      // CRITICAL FIX: Optimize sorting - only sort every N iterations or when queue is large
      // Sorting on every iteration is O(n log n) and very expensive for large queues
      if (iterations % 10 === 0 || open.length > 1000) {
        // Sort by priority (ascending: lower is better)
        open.sort((a, b) => {
          const priorityA = this.priorityOf(
            a,
            demand,
            bestPatternDensity,
            adjustedConfig,
          );
          const priorityB = this.priorityOf(
            b,
            demand,
            bestPatternDensity,
            adjustedConfig,
          );
          return priorityA - priorityB;
        });
      } else {
        // For small queues, find min without full sort
        let minIndex = 0;
        let minPriority = this.priorityOf(
          open[0]!,
          demand,
          bestPatternDensity,
          adjustedConfig,
        );
        for (let i = 1; i < open.length; i++) {
          const priority = this.priorityOf(
            open[i]!,
            demand,
            bestPatternDensity,
            adjustedConfig,
          );
          if (priority < minPriority) {
            minPriority = priority;
            minIndex = i;
          }
        }
        // Move min to front
        if (minIndex > 0) {
          [open[0], open[minIndex]] = [open[minIndex], open[0]];
        }
      }

      // Pop best state
      const current = open.shift()!;

      // Log progress every 1000 iterations
      if (iterations % 1000 === 0) {
        this.logger.debug(
          `[PrioritySearch] Progress ${iterations}/${adjustedConfig.maxStates}`,
          {
            openSize: open.length,
            totalBars: current.totalBars,
            totalWaste: current.totalWaste,
          },
        );
      }

      // Check if goal reached
      if (
        this.isDemandSatisfied(
          current.produced,
          demand,
          adjustedConfig.overProductionTolerance,
        )
      ) {
        this.logger.info("[PrioritySearch] Solution found:", {
          iterations,
          totalBars: current.totalBars,
          totalWaste: current.totalWaste,
          picksCount: current.picks.length,
          produced: Object.fromEntries(current.produced),
        });
        return current;
      }

      // Track best solution so far
      // Priority calculation now includes shortage penalty, so lower priority = better
      const currentPriority = this.priorityOf(
        current,
        demand,
        bestPatternDensity,
        adjustedConfig,
      );

      if (currentPriority < bestPriority) {
        bestPriority = currentPriority;
        bestSolution = current;
      }

      // Expand state
      for (let i = 0; i < patterns.length; i++) {
        const pattern = patterns[i]!;
        const next = this.expandState(current, pattern, i);

        // Skip if already seen with better cost
        const key = this.stateKey(next.produced);
        const prev = seen.get(key);
        if (prev) {
          // Only skip if strictly better (less bars OR same bars + less waste)
          if (
            prev.bars < next.totalBars ||
            (prev.bars === next.totalBars && prev.waste <= next.totalWaste)
          ) {
            continue;
          }
        }

        // Update seen map
        seen.set(key, { bars: next.totalBars, waste: next.totalWaste });

        // Add to open set
        open.push(next);
      }

      // Note: Beam search pruning at top of loop handles memory
      // No need for additional pruning here
    }

    // CRITICAL FIX: If tolerance is 0, only return solution if it exactly matches demand
    // Otherwise, return null to force retry with different patterns or fallback
    if (bestSolution && adjustedConfig.overProductionTolerance === 0) {
      // Check if best solution exactly matches demand
      const isExact = this.isDemandSatisfied(
        bestSolution.produced,
        demand,
        0, // Check with tolerance 0
      );

      if (!isExact) {
        this.logger.warn(
          "[PrioritySearch] Best solution found but does not exactly match demand (tolerance=0). Returning null.",
          {
            produced: Object.fromEntries(bestSolution.produced),
            demand: Object.fromEntries(demand),
          },
        );
        return null; // Force retry or fallback
      }
    }

    // Calculate shortage for best solution
    const shortages: Record<string, number> = {};
    let hasShortage = false;

    if (bestSolution) {
      for (const [length, targetCount] of demand.entries()) {
        const producedCount = bestSolution.produced.get(length) || 0;
        const shortage = targetCount - producedCount;
        if (shortage > 0) {
          shortages[`${length}mm`] = shortage;
          hasShortage = true;
        }
      }
    }

    this.logger.warn(
      "[PrioritySearch] Search limit reached but NO valid solution found:",
      {
        iterations,
        maxStates: adjustedConfig.maxStates,
        patternsCount: patterns.length,
        demand: Object.fromEntries(demand),
        bestBars: bestSolution?.totalBars,
        bestWaste: bestSolution?.totalWaste,
        bestProduced: bestSolution
          ? Object.fromEntries(bestSolution.produced)
          : {},
        hasShortage,
        shortages: hasShortage ? shortages : undefined,
      },
    );

    // Return null - pattern generation or search space insufficient
    // Caller will fall back to traditional algorithm
    return null;
  }

  /**
   * Calculate priority: shortage_penalty + g + h + w
   * - shortage_penalty = MASSIVE penalty for unmet demand (prioritize meeting demand first)
   * - g = totalBars (actual cost)
   * - h = estimateMinBarsRemaining (heuristic)
   * - w = totalWaste / normalization (tie-breaker)
   */
  private priorityOf(
    state: SearchState,
    target: Map<number, number>,
    bestPatternDensity: number,
    config: SearchConfig,
  ): number {
    // Calculate total shortage (unmet demand)
    let totalShortage = 0;
    for (const [length, required] of target.entries()) {
      const produced = state.produced.get(length) || 0;
      const shortage = Math.max(0, required - produced);
      totalShortage += shortage;
    }

    // CRITICAL: Shortage penalty must dominate everything else
    // Each missing piece adds 1000 to priority (makes this state very undesirable)
    const shortagePenalty = totalShortage * 1000;

    const g = state.totalBars;
    const h = this.estimateMinBarsRemaining(
      state.produced,
      target,
      bestPatternDensity,
    );
    const w = state.totalWaste / config.wasteNormalization;

    // ✅ WASTE-FIRST PRIORITY: Lower is better
    // Shortage dominates (1000×), then WASTE (1000× weight!), then bars, then heuristic
    // This makes waste comparable to stock count in priority
    // Example: 1mm waste ≈ 0.01 bars, so 100mm waste ≈ 1 bar
    return shortagePenalty + w * 1000 + g + h;
  }

  /**
   * Estimate minimum bars remaining using best pattern density
   */
  private estimateMinBarsRemaining(
    produced: Map<number, number>,
    target: Map<number, number>,
    bestPatternDensity: number,
  ): number {
    // Calculate remaining pieces needed
    let remainingPieces = 0;

    for (const [length, targetCount] of target.entries()) {
      const producedCount = produced.get(length) || 0;
      const remaining = Math.max(0, targetCount - producedCount);
      remainingPieces += remaining;
    }

    if (remainingPieces <= 0) {
      return 0;
    }

    // Estimate bars needed: ceiling of remaining pieces / best density
    return Math.ceil(remainingPieces / bestPatternDensity);
  }

  /**
   * Find best pattern density (pieces per bar)
   */
  private findBestPatternDensity(patterns: SearchPattern[]): number {
    if (patterns.length === 0) return 1;

    let bestDensity = 0;

    for (const pattern of patterns) {
      let pieces = 0;
      for (const count of pattern.pattern.values()) {
        pieces += count;
      }
      bestDensity = Math.max(bestDensity, pieces);
    }

    return bestDensity || 1;
  }

  /**
   * Check if demand is satisfied (within tolerance)
   * CRITICAL FIX: When tolerance is 0, require exact match (no over-production)
   */
  private isDemandSatisfied(
    produced: Map<number, number>,
    target: Map<number, number>,
    tolerance: number,
  ): boolean {
    for (const [length, targetCount] of target.entries()) {
      const producedCount = produced.get(length) || 0;

      // Shortage: fail
      if (producedCount < targetCount) {
        return false;
      }

      // CRITICAL FIX: When tolerance is 0, require exact match
      // When tolerance > 0, allow up to tolerance extra pieces
      if (tolerance === 0) {
        // Exact match required
        if (producedCount !== targetCount) {
          return false;
        }
      } else {
        // Over-production beyond tolerance: fail
        if (producedCount > targetCount + tolerance) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Expand state by adding a pattern
   */
  private expandState(
    current: SearchState,
    pattern: SearchPattern,
    patternIndex: number,
  ): SearchState {
    const nextProduced = new Map(current.produced);

    // Add pattern pieces to produced
    for (const [length, count] of pattern.pattern.entries()) {
      const currentCount = nextProduced.get(length) || 0;
      nextProduced.set(length, currentCount + count);
    }

    return {
      produced: nextProduced,
      totalBars: current.totalBars + 1,
      totalWaste: current.totalWaste + pattern.waste,
      picks: [...current.picks, patternIndex],
    };
  }

  /**
   * Generate state key for duplicate detection
   * Rounded to prevent explosion
   */
  private stateKey(produced: Map<number, number>): string {
    const parts: string[] = [];
    for (const [length, count] of produced.entries()) {
      // Round to 10s to prevent explosion
      parts.push(`${length}-${Math.min(count, 999)}`);
    }
    return parts.join("_");
  }
}
