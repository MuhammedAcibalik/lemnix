/**
 * LEMNİX Genetic Algorithm
 * Advanced evolutionary optimization
 *
 * @module optimization/algorithms
 * @version 1.1.0 - CRITICAL FIXES APPLIED (2025-10-07)
 * @architecture CPU-based optimization
 *
 * ✅ RECENT FIXES:
 * - RNG seed now resets for reproducibility
 * - Type-safe order crossover with explicit null handling
 * - Scale-independent convergence check (CV < 1%)
 * - Comprehensive logging and warnings added
 *
 * Algorithm Flow:
 * 1. Initialize population with random permutations
 * 2. Evaluate fitness (greedy sequence evaluation)
 * 3. Select best individuals (tournament selection, size=3)
 * 4. Crossover and mutation (order-preserving OX, swap mutation)
 * 5. Elitism (keep best 10%) + offspring generation
 * 6. Repeat for N generations or until convergence
 *
 * Time Complexity: O(P × n² × g) where P = population, n = items, g = generations
 * Space Complexity: O(P × n)
 * Best For: Quality-focused optimization, 10-200 items
 *
 * @see docs/GENETIC_ALGORITHM_IMPROVEMENTS.md for P0/P1 fixes needed
 */

import type {
  OptimizationItem,
  Cut,
  CuttingSegment,
  ProfileType,
  OptimizationConstraints,
} from "../../../types";
import { WasteCategory, OptimizationAlgorithm } from "../../../types";
import { BaseAlgorithm } from "../core/BaseAlgorithm";
import { OptimizationContext } from "../core/OptimizationContext";
import type {
  AdvancedOptimizationResult,
  OptimizationObjective,
  StockSummary,
  EnhancedConstraints,
} from "../types";
import { StockCalculator } from "../helpers/StockCalculator";
import { WasteAnalyzer } from "../helpers/WasteAnalyzer";
import { CostCalculator } from "../helpers/CostCalculator";
import { MetricsCalculator } from "../helpers/MetricsCalculator";
import { TheoreticalMinimumCalculator } from "../utils/TheoreticalMinimumCalculator";
import {
  PrioritySearchSolver,
  SearchPattern,
  SearchState,
} from "./PrioritySearchSolver";
import { ParetoFilter } from "../helpers/ParetoFilter";
import type { ILogger } from "../../logger";

/**
 * Material type constant
 */
const MATERIAL_TYPE = "aluminum" as const;

/**
 * GA Configuration constants
 */
const GA_CONFIG = {
  ELITE_RATIO: 0.1,
  TOURNAMENT_SIZE: 3,
  MUTATION_RATE: 0.15,
  CROSSOVER_RATE: 0.8,
  CONVERGENCE_CV_THRESHOLD: 0.01,
  MIN_CONVERGENCE_GENERATION: 10,
  FITNESS_IMPROVEMENT_THRESHOLD: 1e-4, // Fitness improvement epsilon for convergence
  STATS_UPDATE_INTERVAL: 5, // Update fitness stats every N generations
} as const;

/**
 * Fitness calculation normalization constants
 * Used to scale different objectives to [0, 1] range
 */
const FITNESS_NORMALIZATION = {
  COST_BASELINE: 10000, // Baseline cost for normalization (TRY)
  TIME_BASELINE_MIN: 60, // Baseline time for normalization (minutes, matches TIME_ESTIMATES)
} as const;

/**
 * Aluminum-optimized objective weights for cutting stock optimization
 * Prioritizes waste minimization (fire reduction) as primary goal
 */
const ALUMINUM_OPTIMIZED_OBJECTIVES: ReadonlyArray<OptimizationObjective> = [
  { type: "minimize-waste", weight: 0.5, priority: "high" }, // Fire #1 - Primary goal
  { type: "maximize-efficiency", weight: 0.3, priority: "high" }, // Efficiency #2
  { type: "minimize-cost", weight: 0.15, priority: "medium" }, // Cost #3
  { type: "minimize-time", weight: 0.05, priority: "low" }, // Time #4 - Low priority
] as const;

/**
 * Default objective weights when none specified (fallback)
 * @deprecated Use ALUMINUM_OPTIMIZED_OBJECTIVES for aluminum cutting optimization
 */
const DEFAULT_OBJECTIVES: ReadonlyArray<OptimizationObjective> = [
  { type: "maximize-efficiency", weight: 0.5, priority: "high" },
  { type: "minimize-waste", weight: 0.3, priority: "medium" },
  { type: "minimize-cost", weight: 0.2, priority: "medium" },
] as const;

/**
 * Production time estimates
 */
const TIME_ESTIMATES = {
  SETUP_PER_STOCK: 5, // Minutes per stock setup
  CUTTING_PER_SEGMENT: 2, // Minutes per segment cutting
  DEFAULT_TOLERANCE: 0.5, // mm tolerance for segments
} as const;

/**
 * Adaptive GA parameters based on problem size
 */
interface GAParameters {
  readonly populationSize: number;
  readonly generations: number;
  readonly mutationRate: number;
  readonly crossoverRate: number;
}

/**
 * Dynamic fitness normalization statistics
 * Prevents baseline-dependent fitness distortion
 * Rolling update every N generations for adaptation
 */
interface FitnessStats {
  readonly costMin: number;
  readonly costMax: number;
  readonly timeMin: number;
  readonly timeMax: number;
  readonly wasteMin: number;
  readonly wasteMax: number;
  readonly wasteRatioMin: number;
  readonly wasteRatioMax: number;
}

export class GeneticAlgorithm extends BaseAlgorithm {
  public readonly name: OptimizationAlgorithm =
    OptimizationAlgorithm.GENETIC_ALGORITHM;
  public readonly complexity = "O(n²)" as const; // Actually O(P×n²×g) but constrained to base type
  public readonly scalability = 7;

  private rngState = 12345; // Deterministic RNG seed
  private fitnessStats: FitnessStats | null = null; // Dynamic normalization stats
  private itemKeyCache = new WeakMap<OptimizationItem, string>(); // Stable key cache
  private itemKeyCounter = 0; // Counter for unique key generation (no RNG pollution)

  // Theoretical minimum constraints
  private targetStockCount: number = 0;
  private maxAllowedStockCount: number = 0;

  private readonly paretoFilter: ParetoFilter;

  constructor(logger: ILogger) {
    super(logger);
    this.paretoFilter = new ParetoFilter(logger);
  }

  /**
   * Main optimization method
   */
  public async optimize(
    context: OptimizationContext,
  ): Promise<AdvancedOptimizationResult> {
    this.logger.info("Starting Genetic Algorithm optimization", {
      requestId: context.requestId,
      items: context.items.length,
      totalPieces: context.getTotalItemCount(),
    });

    // Validate context
    const validation = this.canOptimize(context);
    if (!validation.valid) {
      throw new Error(`Genetic optimization failed: ${validation.reason}`);
    }

    // Calculate theoretical minimum for constraint
    const theoreticalMin = TheoreticalMinimumCalculator.calculateMinimumStock(
      context.items,
      context.stockLengths,
      context.constraints,
    );

    this.targetStockCount = theoreticalMin.minStockCount;
    this.maxAllowedStockCount = theoreticalMin.minStockCount + 4; // Allow 4 extra max

    this.logger.info(
      `[Genetic] Theoretical minimum: ${theoreticalMin.minStockCount} stocks for ${theoreticalMin.totalRequired}mm total`,
      {
        recommendedStockLength: theoreticalMin.recommendedStockLength,
        targetStockCount: this.targetStockCount,
        maxAllowedStockCount: this.maxAllowedStockCount,
      },
    );

    // Reset RNG seed for reproducibility
    this.rngState = 12345;
    this.logger.debug("RNG seed initialized", { seed: this.rngState });

    // Preprocess items
    const preprocessed = this.preprocessItems(context.items);
    const expanded = this.expandItemsByQuantity(preprocessed);

    // Pre-generate stable keys for all items (deterministic, no RNG)
    this.initializeItemKeys(expanded);

    // Use CPU optimization
    return this.optimizeWithCPU(expanded, context);
  }

  /**
   * Get adaptive GA parameters based on problem size
   */
  private getAdaptiveParameters(itemCount: number): GAParameters {
    // Adaptive sizing based on problem complexity
    if (itemCount < 10) {
      return {
        populationSize: 10,
        generations: 20,
        mutationRate: 0.2, // Higher mutation for small problems
        crossoverRate: 0.7,
      };
    }
    if (itemCount < 30) {
      return {
        populationSize: 20,
        generations: 50,
        mutationRate: GA_CONFIG.MUTATION_RATE,
        crossoverRate: GA_CONFIG.CROSSOVER_RATE,
      };
    }
    if (itemCount < 100) {
      return {
        populationSize: 30,
        generations: 75,
        mutationRate: 0.12, // Lower mutation for large problems
        crossoverRate: 0.85,
      };
    }
    // Very large problems (> 100 items)
    if (itemCount < 500) {
      return {
        populationSize: 30,
        generations: 50,
        mutationRate: 0.12,
        crossoverRate: 0.85,
      };
    }
    // Extremely large problems (> 500 items)
    return {
      populationSize: 25,
      generations: 30,
      mutationRate: 0.15,
      crossoverRate: 0.8,
    };
  }

  /**
   * CPU-based genetic optimization (fallback)
   * Optimized with caching and reduced redundant calculations
   */
  private async optimizeWithCPU(
    expanded: OptimizationItem[],
    context: OptimizationContext,
  ): Promise<AdvancedOptimizationResult> {
    // Get adaptive parameters
    const adaptiveParams = this.getAdaptiveParameters(expanded.length);
    const populationSize =
      context.performance.populationSize ?? adaptiveParams.populationSize;
    const generations =
      context.performance.generations ?? adaptiveParams.generations;
    const mutationRate = adaptiveParams.mutationRate;
    const crossoverRate = adaptiveParams.crossoverRate;

    // Use aluminum-optimized objectives if no specific objectives provided
    const objectives =
      context.objectives.length > 0
        ? context.objectives
        : ALUMINUM_OPTIMIZED_OBJECTIVES;
    const normalizedObjectives = this.normalizeWeights(objectives);

    this.logger.debug("CPU GA settings (adaptive)", {
      populationSize,
      generations,
      mutationRate,
      crossoverRate,
      itemCount: expanded.length,
      objectives: normalizedObjectives.map((o) => ({
        type: o.type,
        weight: o.weight.toFixed(3),
      })),
    });

    // Initialize population with fitness scores
    let population = this.initializePopulation(expanded, populationSize).map(
      (seq) => {
        const cuts = this.evaluateSequence(seq, context);
        const finalizedCuts = this.finalizeCuts(cuts, context);
        const result = this.createResult(finalizedCuts, context);
        return {
          sequence: seq,
          result,
          fitness: 0, // Will be calculated after stats collection
        };
      },
    );

    // Collect fitness statistics for dynamic normalization
    this.fitnessStats = this.collectFitnessStats(
      population.map((p) => p.result),
    );

    // Now calculate fitness with proper normalization (using normalized objectives)
    population = population.map((p) => ({
      ...p,
      fitness: this.calculateFitness(p.result, normalizedObjectives),
    }));

    let bestEverFitness = -Infinity;
    let prevBestFitness = -Infinity; // Track previous generation's best for improvement calc
    let stagnationCounter = 0;
    let finalGeneration = 0;

    // Evolution loop
    for (let gen = 0; gen < generations; gen++) {
      finalGeneration = gen;
      // Sort by fitness (already calculated)
      population.sort((a, b) => b.fitness - a.fitness);

      // Track best fitness and improvement
      const currentBest = population[0]?.fitness ?? 0;
      if (currentBest > bestEverFitness) {
        bestEverFitness = currentBest;
        stagnationCounter = 0;
      } else {
        stagnationCounter++;
      }

      // Track improvement from previous generation for convergence check
      const generationImprovement = Math.abs(currentBest - prevBestFitness);
      prevBestFitness = currentBest;

      // Elitism: keep best individuals
      const eliteCount = Math.max(
        1,
        Math.floor(populationSize * GA_CONFIG.ELITE_RATIO),
      );
      const newPopulation = population.slice(0, eliteCount);

      // Adaptive mutation rate (increase if stagnant)
      const adaptiveMutationRate =
        stagnationCounter > 5
          ? Math.min(mutationRate * 1.5, 0.3)
          : mutationRate;

      // Generate offspring
      let offspringAttempts = 0;
      const maxOffspringAttempts = populationSize * 3; // ✅ CRITICAL FIX: Prevent infinite loop

      while (
        newPopulation.length < populationSize &&
        offspringAttempts < maxOffspringAttempts
      ) {
        offspringAttempts++;

        const parent1 = this.tournamentSelection(population);
        const parent2 = this.tournamentSelection(population);

        // Ensure valid parents
        if (!parent1) {
          this.logger.warn("Tournament selection failed to select parent1");
          break;
        }

        let offspring: OptimizationItem[];
        if (this.random() < crossoverRate && parent2) {
          offspring = this.orderCrossover(parent1.sequence, parent2.sequence);
        } else {
          offspring = [...parent1.sequence];
        }

        // Apply mutation (inversion for high stagnation, swap otherwise)
        if (this.random() < adaptiveMutationRate) {
          offspring =
            stagnationCounter > 8
              ? this.inversionMutation(offspring)
              : this.swapMutation(offspring);
        }

        // Evaluate offspring
        const cuts = this.evaluateSequence(offspring, context);
        const finalizedCuts = this.finalizeCuts(cuts, context);
        const result = this.createResult(finalizedCuts, context);
        const fitness = this.calculateFitness(result, normalizedObjectives);

        newPopulation.push({
          sequence: offspring,
          result,
          fitness,
        });
      }

      // ✅ CRITICAL: Log if max attempts reached (should never happen)
      if (offspringAttempts >= maxOffspringAttempts) {
        this.logger.error(
          "GA offspring generation hit max attempts - possible infinite loop prevented",
          {
            generation: gen,
            populationSize,
            newPopulationSize: newPopulation.length,
          },
        );
      }

      population = newPopulation;

      // Rolling fitness statistics update for adaptation
      if (gen > 0 && gen % GA_CONFIG.STATS_UPDATE_INTERVAL === 0) {
        this.fitnessStats = this.collectFitnessStats(
          population.map((p) => p.result),
        );

        // Recalculate fitness with updated stats (using normalized objectives)
        population = population.map((p) => ({
          ...p,
          fitness: this.calculateFitness(p.result, normalizedObjectives),
        }));

        // Re-sort after recalculation
        population.sort((a, b) => b.fitness - a.fitness);

        // Synchronize bestEverFitness with new scale
        bestEverFitness = Math.max(
          bestEverFitness,
          population[0]?.fitness ?? 0,
        );

        this.logger.debug(`Updated fitness statistics at generation ${gen}`, {
          costRange: `${this.fitnessStats.costMin.toFixed(0)}-${this.fitnessStats.costMax.toFixed(0)}`,
          wasteRatioRange: `${this.fitnessStats.wasteRatioMin.toFixed(3)}-${this.fitnessStats.wasteRatioMax.toFixed(3)}`,
          newBestFitness: bestEverFitness.toFixed(4),
        });
      }

      // Check convergence (with early stopping)
      if (gen > GA_CONFIG.MIN_CONVERGENCE_GENERATION) {
        const converged = this.checkConvergence(population);

        // Combined condition: low diversity AND minimal improvement from previous generation
        if (
          converged &&
          generationImprovement < GA_CONFIG.FITNESS_IMPROVEMENT_THRESHOLD
        ) {
          this.logger.debug(
            `GA converged at generation ${gen}/${generations}`,
            {
              bestFitness: currentBest.toFixed(4),
              generationImprovement: generationImprovement.toExponential(2),
              cv: "below threshold",
            },
          );
          break;
        }

        // Stagnation check with adaptive threshold
        const stagnationThreshold = Math.min(15, Math.floor(generations * 0.2));
        if (stagnationCounter > stagnationThreshold) {
          this.logger.debug(
            `GA stopped due to stagnation at generation ${gen}`,
            {
              stagnationGenerations: stagnationCounter,
              threshold: stagnationThreshold,
            },
          );
          break;
        }
      }
    }

    // Best solution is already at index 0 (sorted)
    const best = population[0];

    if (!best) {
      throw new Error("GA failed to produce any valid solution");
    }

    this.logger.info("CPU genetic algorithm completed", {
      efficiency: best.result.efficiency.toFixed(2),
      cuts: best.result.cuts.length,
      executionTime: this.getExecutionTime(context),
      effectiveComplexity: `O(${populationSize} × ${expanded.length}² × ${finalGeneration + 1})`,
      actualGenerations: finalGeneration + 1,
      convergenceReason:
        finalGeneration + 1 < generations ? "early_stop" : "max_generations",
    });

    return best.result;
  }

  /**
   * Initialize population with diverse sequences for better mixed-item cutting
   */
  protected initializePopulation(
    items: OptimizationItem[],
    size: number,
  ): OptimizationItem[][] {
    const population: OptimizationItem[][] = [];

    // Strategy 1: Sorted by length (baseline)
    population.push([...items].sort((a, b) => b.length - a.length));

    // Strategy 2: Grouped by profileType, then shuffled
    const grouped = this.groupByProfile(items);
    population.push(this.shuffleGroups(grouped));

    // Strategy 3: Round-robin mixing (cycle through different lengths)
    population.push(this.roundRobinMix(items));

    // Strategy 4: Greedy packing (should get close to theoretical minimum)
    population.push(this.greedyPackingStrategy(items));

    // Strategy 5-N: Random shuffles with clustering
    for (let i = 4; i < size; i++) {
      population.push(this.clusterShuffle(items, this.random()));
    }

    return population;
  }

  /**
   * Greedy packing strategy - sort by length descending for optimal packing
   * This should get close to theoretical minimum stock count
   */
  private greedyPackingStrategy(items: OptimizationItem[]): OptimizationItem[] {
    // Sort by length descending, then by quantity descending for better packing
    return [...items].sort((a, b) => {
      if (a.length !== b.length) {
        return b.length - a.length; // Longer items first
      }
      return b.quantity - a.quantity; // Higher quantity first for same length
    });
  }

  /**
   * Group items by profile type
   */
  private groupByProfile(
    items: OptimizationItem[],
  ): Map<string, OptimizationItem[]> {
    const grouped = new Map<string, OptimizationItem[]>();
    items.forEach((item) => {
      const profileType = item.profileType || "Unknown";
      if (!grouped.has(profileType)) {
        grouped.set(profileType, []);
      }
      grouped.get(profileType)!.push(item);
    });
    return grouped;
  }

  /**
   * Shuffle groups while maintaining group integrity
   */
  private shuffleGroups(
    grouped: Map<string, OptimizationItem[]>,
  ): OptimizationItem[] {
    const result: OptimizationItem[] = [];
    const groups = Array.from(grouped.values());

    // Shuffle each group internally
    groups.forEach((group) => {
      for (let i = group.length - 1; i > 0; i--) {
        const j = Math.floor(this.random() * (i + 1));
        if (group[i] && group[j]) {
          [group[i], group[j]] = [group[j]!, group[i]!];
        }
      }
    });

    // Interleave groups round-robin style
    const maxGroupSize = Math.max(...groups.map((g) => g.length));
    for (let i = 0; i < maxGroupSize; i++) {
      groups.forEach((group) => {
        if (group[i]) {
          result.push(group[i]!);
        }
      });
    }

    return result;
  }

  /**
   * Round-robin mixing: cycle through different lengths
   */
  private roundRobinMix(items: OptimizationItem[]): OptimizationItem[] {
    // Group by unique lengths
    const byLength = new Map<number, OptimizationItem[]>();
    items.forEach((item) => {
      if (!byLength.has(item.length)) {
        byLength.set(item.length, []);
      }
      byLength.get(item.length)!.push(item);
    });

    // Mix round-robin style
    const result: OptimizationItem[] = [];
    const queues = Array.from(byLength.values());

    while (queues.some((q) => q.length > 0)) {
      for (const queue of queues) {
        if (queue.length > 0) {
          result.push(queue.shift()!);
        }
      }
    }

    return result;
  }

  /**
   * Shuffle with clustering: group similar lengths, then shuffle groups
   */
  private clusterShuffle(
    items: OptimizationItem[],
    seed: number,
  ): OptimizationItem[] {
    // Shuffle with clustering: group similar lengths, then shuffle groups
    const sorted = [...items].sort((a, b) => b.length - a.length);
    const clusterSize = Math.max(2, Math.floor(items.length / 10));
    const result: OptimizationItem[] = [];

    for (let i = 0; i < sorted.length; i += clusterSize) {
      const cluster = sorted.slice(i, i + clusterSize);
      this.shuffleArray(cluster, seed + i);
      result.push(...cluster);
    }

    return result;
  }

  /**
   * Shuffle array using Fisher-Yates with seed
   */
  private shuffleArray<T>(array: T[], seed: number): void {
    // Use seed for reproducible shuffling
    let currentSeed = seed;
    const seededRandom = () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };

    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom() * (i + 1));
      if (array[i] && array[j]) {
        [array[i], array[j]] = [array[j]!, array[i]!];
      }
    }
  }

  /**
   * Evaluate sequence to create cuts with DP-optimized approach
   * Uses Dynamic Programming for optimal cutting patterns when kerf=0
   */
  protected evaluateSequence(
    sequence: OptimizationItem[],
    context: OptimizationContext,
  ): Cut[] {
    // If kerf is 0, use DP optimization for better results
    if (context.constraints.kerfWidth === 0) {
      return this.evaluateSequenceWithDP(sequence, context);
    }

    // Otherwise use the existing look-ahead approach
    return this.evaluateSequenceWithLookAhead(sequence, context);
  }

  /**
   * DP-optimized sequence evaluation (kerf=0)
   * Based on the reference implementation for optimal cutting patterns
   */
  private evaluateSequenceWithDP(
    sequence: OptimizationItem[],
    context: OptimizationContext,
  ): Cut[] {
    const cuts: Cut[] = [];
    const constraints = context.constraints;

    // Group items by length for pattern generation
    const itemGroups = this.groupItemsByLength(sequence);
    const stockLengths = context.stockLengths;

    // CRITICAL: Check problem size - pattern-based approach has combinatorial explosion
    const uniqueLengths = itemGroups.length;
    const totalDemand = itemGroups.reduce((sum, g) => sum + g.quantity, 0);

    // STRATEGY: Large problems use look-ahead (greedy) for guaranteed low waste
    if (uniqueLengths > 15 || totalDemand > 1000) {
      this.logger.info(
        `[GeneticAlgorithm] Large problem (${uniqueLengths} lengths, ${totalDemand} items) - using look-ahead`,
      );
      return this.evaluateSequenceWithLookAhead(sequence, context);
    }

    this.logger.debug(`[GeneticAlgorithm] 🧮 DP evaluation starting:`, {
      itemGroups: itemGroups.length,
      stockLengths: stockLengths.length,
      kerfWidth: constraints.kerfWidth,
    });

    // Generate all possible cutting patterns for each stock length
    const patterns = this.generateCuttingPatterns(
      itemGroups,
      [...stockLengths],
      constraints,
    );

    if (patterns.length === 0) {
      this.logger.warn(
        "No valid patterns found, falling back to greedy approach",
      );
      return this.evaluateSequenceWithLookAhead(sequence, context);
    }

    // CRITICAL: Try pattern-based approach, fall back to look-ahead if it fails
    try {
      // Use DP to find optimal pattern combination
      const optimalSolution = this.findOptimalPatternCombination(
        patterns,
        itemGroups,
        constraints,
      );

      // Convert solution to cuts with validation
      return this.convertSolutionToCuts(
        optimalSolution,
        [...stockLengths],
        constraints,
        itemGroups,
      );
    } catch (error) {
      // Pattern-based approach failed (shortage, maxStates limit, etc.)
      // Fall back to look-ahead (greedy) which ALWAYS guarantees a solution
      this.logger.warn(
        "[GeneticAlgorithm] Pattern-based approach failed, falling back to look-ahead:",
        {
          error: error instanceof Error ? error.message : String(error),
          patternsGenerated: patterns.length,
          uniqueLengths: itemGroups.length,
        },
      );

      return this.evaluateSequenceWithLookAhead(sequence, context);
    }
  }

  /**
   * Original look-ahead evaluation (kerf > 0)
   */
  private evaluateSequenceWithLookAhead(
    sequence: OptimizationItem[],
    context: OptimizationContext,
  ): Cut[] {
    const cuts: Cut[] = [];
    let stockIdx = 0;
    const constraints = context.constraints;
    const usedItems = new Set<number>(); // Track used item indices

    this.logger.debug(`[GeneticAlgorithm] 🚀 Starting sequence evaluation:`, {
      totalItems: sequence.length,
      sequenceLengths: sequence.map((item) => item.length),
    });

    for (let i = 0; i < sequence.length; i++) {
      if (usedItems.has(i)) {
        this.logger.debug(
          `[GeneticAlgorithm] ⏭️ Skipping already used item at index ${i}`,
        );
        continue; // Skip already used items
      }

      const item = sequence[i];
      let placed = false;

      this.logger.debug(
        `[GeneticAlgorithm] 🔍 Processing item ${i}/${sequence.length}: ${item.length}mm`,
      );

      // Try to place in existing cuts
      for (let cutIdx = 0; cutIdx < cuts.length && !placed; cutIdx++) {
        const cut = cuts[cutIdx];
        if (!cut) continue;

        const kerfNeeded = StockCalculator.calculateKerfNeeded(
          cut.segmentCount,
          constraints.kerfWidth,
        );

        if (
          StockCalculator.canFitItem(
            item.length,
            cut.remainingLength,
            cut.segmentCount,
            constraints.kerfWidth,
          )
        ) {
          cuts[cutIdx] = this.addSegmentToCut(cut, item, kerfNeeded, context);
          usedItems.add(i);
          placed = true;

          // Look-ahead: try to fill remaining space
          cuts[cutIdx] = this.fillRemainingSpace(
            cuts[cutIdx],
            sequence,
            i + 1,
            usedItems,
            context,
          );
        }
      }

      // Create new stock if not placed
      if (!placed) {
        this.logger.debug(
          `[GeneticAlgorithm] 🆕 Creating new stock for item ${i}: ${item.length}mm`,
        );
        const selectedLength = this.selectOptimalStockLength(
          item,
          cuts,
          context,
        );
        const newCut = this.createNewStock(
          selectedLength,
          stockIdx,
          constraints,
        );
        let updatedCut = this.addSegmentToCut(newCut, item, 0, context);
        usedItems.add(i);

        // Look-ahead: try to fill remaining space
        updatedCut = this.fillRemainingSpace(
          updatedCut,
          sequence,
          i + 1,
          usedItems,
          context,
        );

        cuts.push(updatedCut);
        stockIdx++;
        this.logger.debug(
          `[GeneticAlgorithm] ✅ Created new cut with ${updatedCut.segmentCount} segments`,
        );
      } else {
        this.logger.debug(
          `[GeneticAlgorithm] ✅ Placed item ${i} in existing cut`,
        );
      }
    }

    this.logger.debug(`[GeneticAlgorithm] ✅ Sequence evaluation completed:`, {
      totalItems: sequence.length,
      usedItems: usedItems.size,
      skippedItems: sequence.length - usedItems.size,
      totalCuts: cuts.length,
      totalSegments: cuts.reduce((sum, cut) => sum + cut.segmentCount, 0),
    });

    return cuts;
  }

  /**
   * Select optimal stock length for a new cut
   */
  private selectOptimalStockLength(
    item: OptimizationItem,
    existingCuts: Cut[],
    context: OptimizationContext,
  ): number {
    const constraints = context.constraints;

    // Multi-stock optimization with waste minimization priority
    const stockLengthUsage = context.stockLengths.map((length) => ({
      length,
      count: existingCuts.filter((cut) => cut.stockLength === length).length,
      totalWaste: existingCuts
        .filter((cut) => cut.stockLength === length)
        .reduce((sum, cut) => sum + cut.remainingLength, 0),
      avgWaste:
        existingCuts.filter((cut) => cut.stockLength === length).length > 0
          ? existingCuts
              .filter((cut) => cut.stockLength === length)
              .reduce((sum, cut) => sum + cut.remainingLength, 0) /
            existingCuts.filter((cut) => cut.stockLength === length).length
          : 0,
    }));

    // Calculate waste efficiency for each stock length if we add this item
    const stockEfficiency = context.stockLengths.map((length) => {
      const maxPieces = StockCalculator.calculateMaxPiecesOnBar(
        item.length,
        length,
        constraints.kerfWidth,
        constraints.startSafety,
        constraints.endSafety,
      );

      if (maxPieces === 0)
        return { length, efficiency: 0, wastePerPiece: Infinity };

      const usedLength =
        constraints.startSafety + item.length + constraints.endSafety;
      const remainder = length - usedLength;
      const wastePerPiece = remainder;
      const efficiency = (usedLength / length) * 100;

      return { length, efficiency, wastePerPiece };
    });

    // Filter to only viable stock lengths (can fit the item)
    const viableStocks = stockEfficiency.filter((s) => s.efficiency > 0);

    if (viableStocks.length === 0) {
      // Fallback to largest stock if no viable option
      return Math.max(...context.stockLengths);
    }

    // Multi-criteria selection: waste minimization + usage balance
    const usageThreshold =
      Math.min(...stockLengthUsage.map((u) => u.count)) + 1;
    const underusedStocks = viableStocks.filter((s) => {
      const usage = stockLengthUsage.find((u) => u.length === s.length);
      return usage && usage.count < usageThreshold;
    });

    if (underusedStocks.length > 0) {
      // Prefer underused stocks with minimal waste
      return underusedStocks.reduce((best, current) =>
        current.wastePerPiece < best.wastePerPiece ? current : best,
      ).length;
    } else {
      // All stocks equally used, prioritize waste minimization
      return viableStocks.reduce((best, current) =>
        current.wastePerPiece < best.wastePerPiece ? current : best,
      ).length;
    }
  }

  /**
   * Collect fitness statistics from population for dynamic normalization
   * Prevents baseline-dependent distortion across different problem scales
   * Includes waste ratio normalization for consistency
   */
  private collectFitnessStats(
    results: ReadonlyArray<AdvancedOptimizationResult>,
  ): FitnessStats {
    if (results.length === 0) {
      return {
        costMin: 0,
        costMax: FITNESS_NORMALIZATION.COST_BASELINE,
        timeMin: 0,
        timeMax: FITNESS_NORMALIZATION.TIME_BASELINE_MIN,
        wasteMin: 0,
        wasteMax: 1000,
        wasteRatioMin: 0,
        wasteRatioMax: 1,
      };
    }

    const costs = results.map((r) => r.totalCost);
    const times = results.map((r) => r.totalTime ?? 0);
    const wastes = results.map((r) => r.totalWaste);

    // Calculate waste ratios for normalization
    const wasteRatios = results.map((r) => {
      const totalStock = r.cuts.reduce((sum, cut) => sum + cut.stockLength, 0);
      return totalStock > 0 ? r.totalWaste / totalStock : 0;
    });

    return {
      costMin: Math.min(...costs),
      costMax: Math.max(...costs),
      timeMin: Math.min(...times),
      timeMax: Math.max(...times),
      wasteMin: Math.min(...wastes),
      wasteMax: Math.max(...wastes),
      wasteRatioMin: Math.min(...wasteRatios),
      wasteRatioMax: Math.max(...wasteRatios),
    };
  }

  /**
   * Normalize value to [0, 1] range using min-max scaling
   * Returns neutral 0.5 if range is too narrow to avoid bias
   */
  private normalize01(value: number, min: number, max: number): number {
    const range = max - min;

    // ✅ FIXED: Population converged - maintain relative order using raw values
    if (range < 1e-6) {
      const mid = (min + max) / 2;
      if (mid < 1e-9) return 0.5;
      return value / mid; // Return ratio to mean
    }

    const normalized = (value - min) / range;
    return Math.max(0, Math.min(1, normalized));
  }

  /**
   * Normalize objective weights to sum to 1.0
   * Logs warning if weights are significantly off
   */
  private normalizeWeights(
    objectives: ReadonlyArray<OptimizationObjective>,
  ): ReadonlyArray<OptimizationObjective> {
    const totalWeight = objectives.reduce((sum, obj) => sum + obj.weight, 0);

    if (totalWeight <= 0) {
      this.logger.warn("Invalid objective weights (sum ≤ 0), using defaults");
      return DEFAULT_OBJECTIVES;
    }

    // If weights already normalized, return as-is
    if (Math.abs(totalWeight - 1.0) < 0.001) {
      return objectives;
    }

    // Normalize and log warning
    this.logger.warn("Objective weights not normalized, auto-normalizing", {
      originalSum: totalWeight.toFixed(3),
      objectives: objectives.map((o) => ({ type: o.type, weight: o.weight })),
    });

    return objectives.map((obj) => ({
      ...obj,
      weight: obj.weight / totalWeight,
    }));
  }

  /**
   * Calculate normalized fitness score [0, 1]
   * Uses dynamic min-max normalization with fallback to baseline
   */
  private calculateFitness(
    result: AdvancedOptimizationResult,
    objectives: ReadonlyArray<OptimizationObjective> = DEFAULT_OBJECTIVES,
  ): number {
    // Normalize weights once per call
    const normalizedObjectives = this.normalizeWeights(objectives);
    const totalStockLength = result.cuts.reduce(
      (sum, cut) => sum + cut.stockLength,
      0,
    );

    // Avoid division by zero
    if (totalStockLength === 0) return 0;

    const stats = this.fitnessStats;
    const wasteRatio = result.totalWaste / totalStockLength;

    // Use dynamic normalization if stats available, otherwise fallback to baseline
    const costScore = stats
      ? 1 - this.normalize01(result.totalCost, stats.costMin, stats.costMax)
      : Math.max(
          0,
          1 -
            result.totalCost /
              (result.totalCost + FITNESS_NORMALIZATION.COST_BASELINE),
        );

    const timeScore = stats
      ? 1 -
        this.normalize01(result.totalTime ?? 0, stats.timeMin, stats.timeMax)
      : Math.max(
          0,
          1 -
            (result.totalTime ?? 0) /
              ((result.totalTime ?? 0) +
                FITNESS_NORMALIZATION.TIME_BASELINE_MIN),
        );

    // Dynamic waste ratio normalization when stats available
    const wasteScore = stats
      ? 1 -
        this.normalize01(wasteRatio, stats.wasteRatioMin, stats.wasteRatioMax)
      : Math.max(0, 1 - wasteRatio);

    // Normalize each objective to [0, 1] range
    const scores: Record<OptimizationObjective["type"], number> = {
      "maximize-efficiency": result.efficiency / 100,
      "minimize-waste": wasteScore,
      "minimize-cost": costScore,
      "minimize-time": timeScore,
    };

    // Weighted sum of objectives (using normalized weights)
    let fitness = normalizedObjectives.reduce((acc, obj) => {
      const score = scores[obj.type];
      return acc + obj.weight * score;
    }, 0);

    // HEAVY PENALTY for exceeding theoretical minimum stock count
    const stockCount = result.cuts.length;
    if (stockCount > this.targetStockCount) {
      const stockPenalty =
        Math.pow(stockCount - this.targetStockCount, 2) * 0.1; // Quadratic penalty
      fitness = Math.max(0, fitness - stockPenalty);

      this.logger.debug(
        `[Genetic] Stock count penalty applied: ${stockCount} cuts vs ${this.targetStockCount} target`,
        {
          penalty: stockPenalty,
          adjustedFitness: fitness,
        },
      );
    }

    // Clamp to [0, 1]
    return Math.max(0, Math.min(1, fitness));
  }

  /**
   * Get fitness weights
   * Returns actual weights from objectives, not just presence flags
   */
  private getFitnessWeights(
    objectives: ReadonlyArray<OptimizationObjective>,
  ): readonly [number, number, number, number] {
    const wasteWeight =
      objectives.find((obj) => obj.type === "minimize-waste")?.weight ?? 0;
    const costWeight =
      objectives.find((obj) => obj.type === "minimize-cost")?.weight ?? 0;
    const efficiencyWeight =
      objectives.find((obj) => obj.type === "maximize-efficiency")?.weight ?? 0;
    const timeWeight =
      objectives.find((obj) => obj.type === "minimize-time")?.weight ?? 0;

    return [wasteWeight, costWeight, efficiencyWeight, timeWeight] as const;
  }

  /**
   * Tournament selection with deterministic fallback
   * Uses unique sampling to avoid selecting same individual multiple times
   */
  private tournamentSelection(
    population: ReadonlyArray<{
      readonly sequence: OptimizationItem[];
      readonly result: AdvancedOptimizationResult;
      readonly fitness: number;
    }>,
  ): (typeof population)[0] | undefined {
    if (population.length === 0) return undefined;
    if (population.length === 1) return population[0];

    const tournamentSize = Math.min(
      GA_CONFIG.TOURNAMENT_SIZE,
      population.length,
    );

    // Sample unique indices to avoid duplicate competitors
    const selectedIndices = new Set<number>();
    let attempts = 0;
    const maxAttempts = tournamentSize * 10; // ✅ CRITICAL FIX: Prevent infinite loop

    while (selectedIndices.size < tournamentSize && attempts < maxAttempts) {
      attempts++;
      selectedIndices.add(Math.floor(this.random() * population.length));
    }

    // Find best among unique competitors
    const indices = Array.from(selectedIndices);
    const firstIdx = indices[0];
    if (firstIdx === undefined) return undefined;

    let best = population[firstIdx];
    for (const idx of indices) {
      const competitor = population[idx];
      if (competitor && best && competitor.fitness > best.fitness) {
        best = competitor;
      }
    }

    return best;
  }

  /**
   * Pre-generate stable unique keys for all items
   * CRITICAL: Must be called once after expansion, before population init
   * Uses counter-based approach to avoid RNG pollution and collisions
   */
  private initializeItemKeys(items: ReadonlyArray<OptimizationItem>): void {
    this.itemKeyCounter = 0;
    this.itemKeyCache = new WeakMap(); // Reset cache

    for (const item of items) {
      const base = item.workOrderId?.trim()
        ? item.workOrderId
        : `${item.profileType}_${item.length}`;

      // Counter ensures uniqueness even for identical properties
      const key = `${base}#${this.itemKeyCounter++}`;
      this.itemKeyCache.set(item, key);
    }

    this.logger.debug("Initialized stable item keys", {
      totalItems: items.length,
      uniqueKeys: this.itemKeyCounter,
    });
  }

  /**
   * Get stable deterministic key for item tracking in crossover
   * Keys must be pre-initialized via initializeItemKeys()
   *
   * ⚠️ ZERO RNG CONSUMPTION - preserves RNG stream for mutations
   */
  private getStableItemKey(item: OptimizationItem): string {
    const cached = this.itemKeyCache.get(item);

    if (cached) {
      return cached;
    }

    // Fallback: should never happen if initializeItemKeys() was called
    this.logger.warn("Item key not pre-initialized, generating on-demand", {
      profileType: item.profileType,
      length: item.length,
    });

    const base = item.workOrderId?.trim()
      ? item.workOrderId
      : `${item.profileType}_${item.length}`;
    const key = `${base}#${this.itemKeyCounter++}`;

    this.itemKeyCache.set(item, key);
    return key;
  }

  /**
   * Order crossover (preserves sequence)
   * Uses stable deterministic keys to prevent duplicate/loss issues
   *
   * @see getStableItemKey for key generation strategy
   */
  protected orderCrossover(
    parent1: OptimizationItem[],
    parent2: OptimizationItem[],
  ): OptimizationItem[] {
    const size = parent1.length;
    const start = Math.floor(this.random() * size);
    const end = Math.floor(this.random() * (size - start)) + start;

    // Type-safe array with explicit null handling
    const offspring: Array<OptimizationItem | null> = new Array(size).fill(
      null,
    );
    const usedKeys = new Set<string>();

    // Copy segment from parent1
    for (let i = start; i <= end; i++) {
      const item = parent1[i];
      if (item) {
        offspring[i] = item;
        usedKeys.add(this.getStableItemKey(item));
      }
    }

    // Fill remaining from parent2
    let currentPos = 0;
    for (const item of parent2) {
      const itemKey = this.getStableItemKey(item);
      if (!usedKeys.has(itemKey)) {
        while (currentPos < size && offspring[currentPos] !== null) {
          currentPos++;
        }
        if (currentPos < size) {
          offspring[currentPos] = item;
          usedKeys.add(itemKey);
        }
      }
    }

    // Filter nulls with type safety
    const result = offspring.filter(
      (item): item is OptimizationItem => item !== null,
    );

    // Recovery: fill missing items from parent1 (should never happen with correct keys)
    if (result.length !== size) {
      const targetSize = size;
      let recoveredCount = 0;

      this.logger.warn(
        "Order crossover produced incomplete offspring, recovering",
        {
          expected: size,
          actual: result.length,
          parent1Length: parent1.length,
          parent2Length: parent2.length,
          lostItems: size - result.length,
          usedKeysCount: usedKeys.size,
        },
      );

      // Recovery strategy: add missing items from parent1
      const usedSet = new Set(result.map((it) => this.getStableItemKey(it)));
      for (const item of parent1) {
        if (result.length >= targetSize) break;
        const key = this.getStableItemKey(item);
        if (!usedSet.has(key)) {
          result.push(item);
          usedSet.add(key);
          recoveredCount++;
        }
      }

      this.logger.debug("Recovery completed", {
        finalSize: result.length,
        recovered: recoveredCount,
      });

      // Alert: This should NEVER happen in production with correct key implementation
      if (recoveredCount > 0) {
        this.logger.error(
          "CRITICAL: Order crossover recovery triggered - key collision suspected!",
          {
            recoveredCount,
            totalKeys: this.itemKeyCounter,
          },
        );
      }
    }

    return result;
  }

  /**
   * Swap mutation with safety checks
   * Standard mutation operator for local search
   */
  protected swapMutation(
    sequence: ReadonlyArray<OptimizationItem>,
  ): OptimizationItem[] {
    if (sequence.length < 2) return [...sequence];

    const mutated = [...sequence];
    const i = Math.floor(this.random() * mutated.length);
    let j = Math.floor(this.random() * mutated.length);

    // Ensure j is different from i
    while (j === i && mutated.length > 1) {
      j = Math.floor(this.random() * mutated.length);
    }

    const itemI = mutated[i];
    const itemJ = mutated[j];

    if (itemI && itemJ) {
      [mutated[i], mutated[j]] = [itemJ, itemI];
    }

    return mutated;
  }

  /**
   * Inversion mutation for diversity preservation
   * Reverses a random segment to escape local optima
   * More disruptive than swap, used when stagnant
   */
  private inversionMutation(
    sequence: ReadonlyArray<OptimizationItem>,
  ): OptimizationItem[] {
    if (sequence.length < 3) return [...sequence];

    const a = Math.floor(this.random() * sequence.length);
    const b = Math.floor(this.random() * sequence.length);
    const [lo, hi] = a < b ? [a, b] : [b, a];

    // Don't invert if segment is too small
    if (hi - lo < 2) return [...sequence];

    const head = sequence.slice(0, lo);
    const mid = [...sequence.slice(lo, hi + 1)].reverse();
    const tail = sequence.slice(hi + 1);

    return [...head, ...mid, ...tail];
  }

  /**
   * Check convergence using Coefficient of Variation (CV)
   * Scale-independent measure of population diversity
   */
  private checkConvergence(
    population: ReadonlyArray<{ readonly fitness: number }>,
  ): boolean {
    if (population.length < 2) return false;

    const fitnesses = population.map((p) => p.fitness);
    const mean = fitnesses.reduce((a, b) => a + b, 0) / fitnesses.length;

    // Avoid division by zero
    if (mean <= 0) return true;

    const variance =
      fitnesses.reduce((sum, f) => sum + Math.pow(f - mean, 2), 0) /
      fitnesses.length;
    const stdDev = Math.sqrt(variance);

    // Coefficient of Variation (CV) = std / mean
    // More robust than fixed variance threshold
    const cv = stdDev / mean;

    // Converged if diversity drops below threshold
    return cv < GA_CONFIG.CONVERGENCE_CV_THRESHOLD;
  }

  /**
   * Deterministic random (for reproducibility)
   */
  protected random(): number {
    this.rngState = (this.rngState * 1664525 + 1013904223) % 4294967296;
    return this.rngState / 4294967296;
  }

  /**
   * Create new stock with initialized properties
   */
  private createNewStock(
    stockLength: number,
    index: number,
    constraints: OptimizationContext["constraints"],
  ): Cut {
    return {
      id: this.generateCutId(),
      cuttingPlanId: `genetic-plan-${index}`,
      stockIndex: index,
      stockLength,
      materialType: MATERIAL_TYPE,
      segments: [],
      segmentCount: 0,
      usedLength: constraints.startSafety,
      remainingLength:
        stockLength - constraints.startSafety - constraints.endSafety,
      wasteCategory: WasteCategory.MINIMAL,
      isReclaimable: false,
      estimatedCuttingTime: 0,
      setupTime: TIME_ESTIMATES.SETUP_PER_STOCK,
      kerfLoss: 0,
      safetyMargin: constraints.startSafety + constraints.endSafety,
      toleranceCheck: true,
      sequence: index,
    };
  }

  /**
   * Add segment to existing cut with cost calculation
   */
  private addSegmentToCut(
    cut: Cut,
    item: OptimizationItem,
    kerfNeeded: number,
    context: OptimizationContext,
  ): Cut {
    const newSegmentCount = cut.segmentCount + 1;
    const position = cut.usedLength + kerfNeeded;
    const { constraints, costModel } = context;

    const segmentCost = item.length * costModel.materialCost;

    const segment: CuttingSegment = {
      id: this.generateSegmentId(),
      cutId: cut.id,
      sequenceNumber: newSegmentCount,
      length: item.length,
      quantity: 1,
      position,
      endPosition: position + item.length,
      tolerance: TIME_ESTIMATES.DEFAULT_TOLERANCE,
      workOrderItemId: item.workOrderId || "",
      profileType: item.profileType,
      originalLength: item.length,
      qualityCheck: true,
      unitCost: segmentCost,
      totalCost: segmentCost,
      ...(item.workOrderId ? { workOrderId: item.workOrderId } : {}),
      note: item.profileType,
    };

    const newUsedLength = cut.usedLength + item.length + kerfNeeded;
    const newRemainingLength =
      cut.stockLength - newUsedLength - constraints.endSafety;

    return {
      ...cut,
      segments: [...cut.segments, segment],
      segmentCount: newSegmentCount,
      usedLength: newUsedLength,
      remainingLength: newRemainingLength,
      kerfLoss: (cut.kerfLoss ?? 0) + kerfNeeded,
    };
  }

  protected finalizeCuts(cuts: Cut[], context: OptimizationContext): Cut[] {
    const constraints = context.constraints;
    return cuts.map((cut) => {
      const finalUsedLength = cut.usedLength + constraints.endSafety;
      const finalRemaining = Math.max(0, cut.stockLength - finalUsedLength);

      // Verify accounting with detailed error message
      if (
        !StockCalculator.validateStockAccounting(
          finalUsedLength,
          finalRemaining,
          cut.stockLength,
        )
      ) {
        throw new Error(
          `Accounting violation in cut ${cut.id}: ${finalUsedLength} + ${finalRemaining} ≠ ${cut.stockLength}`,
        );
      }

      // Additional validation for debugging
      if (Math.abs(finalUsedLength + finalRemaining - cut.stockLength) > 0.01) {
        throw new Error(
          `Accounting error in cut ${cut.id}: ${finalUsedLength} + ${finalRemaining} ≠ ${cut.stockLength}`,
        );
      }

      const plan = this.generateCuttingPlan(cut.segments);
      const planLabel = plan
        .map((p) => `${p.count} × ${p.length} mm`)
        .join(" + ");

      return {
        ...cut,
        usedLength: finalUsedLength,
        remainingLength: finalRemaining,
        wasteCategory: WasteAnalyzer.calculateWasteCategory(finalRemaining),
        isReclaimable: WasteAnalyzer.isReclaimable(
          finalRemaining,
          constraints.minScrapLength,
        ),
        plan,
        planLabel,
        profileType:
          cut.profileType || cut.segments[0]?.profileType || "Unknown",
      };
    });
  }

  private generateCuttingPlan(
    segments: CuttingSegment[],
  ): Array<{ length: number; count: number }> {
    const lengthMap = new Map<number, number>();
    for (const segment of segments) {
      lengthMap.set(segment.length, (lengthMap.get(segment.length) || 0) + 1);
    }
    return Array.from(lengthMap.entries())
      .map(([length, count]) => ({ length, count }))
      .sort((a, b) => b.length - a.length);
  }

  /**
   * Create comprehensive optimization result with metrics
   */
  protected createResult(
    cuts: Cut[],
    context: OptimizationContext,
  ): AdvancedOptimizationResult {
    const totalStockLength = cuts.reduce(
      (sum, cut) => sum + cut.stockLength,
      0,
    );
    const totalWaste = WasteAnalyzer.calculateTotalWaste(cuts);
    const totalLength = cuts.reduce((sum, cut) => sum + cut.usedLength, 0);
    const totalSegments = cuts.reduce((sum, cut) => sum + cut.segmentCount, 0);
    const efficiency = StockCalculator.calculateEfficiency(
      totalStockLength,
      totalWaste,
    );

    const costBreakdown = CostCalculator.calculateCostBreakdown(
      cuts,
      context.costModel,
      context.constraints,
    );
    const wasteDistribution = WasteAnalyzer.calculateWasteDistribution(cuts);
    const detailedWasteAnalysis =
      WasteAnalyzer.calculateDetailedWasteAnalysis(cuts);
    const performanceMetrics = MetricsCalculator.calculatePerformanceMetrics(
      "genetic",
      context.items.length,
    );

    // Calculate stock summary for multi-stock optimization display
    const stockSummary = this.calculateStockSummary(cuts);

    // Production time estimates
    const setupTime = cuts.length * TIME_ESTIMATES.SETUP_PER_STOCK;
    const cuttingTime = totalSegments * TIME_ESTIMATES.CUTTING_PER_SEGMENT;
    const totalTime = setupTime + cuttingTime;

    return {
      algorithm: this.name,
      cuts,
      efficiency,
      totalWaste,
      totalCost: costBreakdown.totalCost,
      stockCount: cuts.length,
      totalLength,
      executionTimeMs: this.getExecutionTime(context),
      totalSegments,
      averageCutsPerStock: cuts.length > 0 ? totalSegments / cuts.length : 0,
      setupTime,
      materialUtilization: efficiency,
      cuttingComplexity: MetricsCalculator.calculateCuttingComplexity(
        totalSegments,
        cuts.length,
      ),
      cuttingTime,
      totalTime,
      materialCost: costBreakdown.materialCost,
      wasteCost: costBreakdown.wasteCost,
      laborCost: costBreakdown.timeCost,
      costPerMeter: CostCalculator.calculateCostPerMeter(
        costBreakdown.totalCost,
        totalLength,
      ),
      qualityScore: MetricsCalculator.calculateQualityScore(
        efficiency,
        totalWaste,
      ),
      reclaimableWastePercentage:
        WasteAnalyzer.calculateReclaimableWastePercentage(cuts),
      wastePercentage: WasteAnalyzer.calculateWastePercentage(
        totalWaste,
        totalStockLength,
      ),
      wasteDistribution,
      constraints: context.constraints,
      detailedWasteAnalysis,
      recommendations: [],
      efficiencyCategory: WasteAnalyzer.getEfficiencyCategory(efficiency),
      optimizationScore: MetricsCalculator.calculateOptimizationScore(
        efficiency,
        WasteAnalyzer.calculateWastePercentage(totalWaste, totalStockLength),
        MetricsCalculator.calculateQualityScore(efficiency, totalWaste),
      ),
      costBreakdown,
      performanceMetrics,
      confidence: MetricsCalculator.calculateConfidence(
        efficiency,
        totalWaste,
        costBreakdown.totalCost,
      ),
      totalKerfLoss: cuts.reduce((sum, cut) => sum + (cut.kerfLoss || 0), 0),
      totalSafetyReserve:
        cuts.length *
        (context.constraints.startSafety + context.constraints.endSafety),
      optimizationHistory: [],
      convergenceData: {
        generations: [],
        fitnessValues: [],
        diversityValues: [],
      },
      algorithmParameters: {
        populationSize: 0,
        generations: 0,
        mutationRate: 0,
        crossoverRate: 0,
      },
      resourceUtilization: {
        cpuUsage: 0,
        memoryUsage: 0,
        networkUsage: 0,
      },
      errorAnalysis: {
        errors: [],
        warnings: [],
        suggestions: [],
      },
      validationResults: {
        isValid: true,
        errors: [],
        warnings: [],
      },
      metadata: {
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        environment: "production",
      },
      stockSummary,
    };
  }

  /**
   * Fill remaining space in a cut by looking ahead for compatible items
   */
  private fillRemainingSpace(
    cut: Cut,
    sequence: OptimizationItem[],
    startIndex: number,
    usedItems: Set<number>,
    context: OptimizationContext,
  ): Cut {
    let optimizedCut = cut;
    const constraints = context.constraints;
    const LOOK_AHEAD_LIMIT = 20; // Increased from 10 to 20 for better packing
    let itemsAdded = 0;

    // Only look ahead if there's significant remaining space
    if (optimizedCut.remainingLength < 50) {
      // Reduced from 100mm to 50mm for more aggressive packing
      return optimizedCut;
    }

    for (
      let i = startIndex;
      i < Math.min(sequence.length, startIndex + LOOK_AHEAD_LIMIT);
      i++
    ) {
      if (usedItems.has(i)) continue;

      const item = sequence[i];

      // Removed 80% size filter for more aggressive packing

      const kerfNeeded = StockCalculator.calculateKerfNeeded(
        optimizedCut.segmentCount,
        constraints.kerfWidth,
      );

      if (
        StockCalculator.canFitItem(
          item.length,
          optimizedCut.remainingLength,
          optimizedCut.segmentCount,
          constraints.kerfWidth,
        )
      ) {
        optimizedCut = this.addSegmentToCut(
          optimizedCut,
          item,
          kerfNeeded,
          context,
        );
        usedItems.add(i);
        itemsAdded++;

        this.logger.debug(
          `[GeneticAlgorithm] ✅ Filled remaining space with ${item.length}mm item:`,
          {
            originalRemaining: cut.remainingLength,
            newRemaining: optimizedCut.remainingLength,
            itemLength: item.length,
            stockLength: optimizedCut.stockLength,
            itemIndex: i,
            itemsAdded,
          },
        );

        // Stop if we've added enough items or remaining space is small
        if (itemsAdded >= 3 || optimizedCut.remainingLength < 50) {
          break;
        }
      }
    }

    if (itemsAdded > 0) {
      this.logger.debug(
        `[GeneticAlgorithm] 🎯 Look-ahead optimization added ${itemsAdded} items to cut`,
      );
    }

    return optimizedCut;
  }

  /**
   * Calculate stock summary for multi-stock optimization display
   */
  private calculateStockSummary(cuts: Cut[]): ReadonlyArray<StockSummary> {
    // Group cuts by stock length
    const grouped = new Map<number, Cut[]>();
    cuts.forEach((cut) => {
      const stockLength = cut.stockLength;
      if (!grouped.has(stockLength)) {
        grouped.set(stockLength, []);
      }
      grouped.get(stockLength)!.push(cut);
    });

    // Create summary for each stock length
    return Array.from(grouped.entries()).map(([stockLength, stockCuts]) => {
      // Group patterns by planLabel
      const patternMap = new Map<string, number>();
      stockCuts.forEach((cut) => {
        const pattern = cut.planLabel || `${cut.segmentCount} segments`;
        patternMap.set(pattern, (patternMap.get(pattern) || 0) + 1);
      });

      const patterns = Array.from(patternMap.entries()).map(
        ([pattern, count]) => ({
          pattern,
          count,
        }),
      );

      const totalWaste = stockCuts.reduce(
        (sum, cut) => sum + cut.remainingLength,
        0,
      );
      const totalUsed = stockCuts.reduce((sum, cut) => sum + cut.usedLength, 0);
      const totalStock = stockCuts.reduce(
        (sum, cut) => sum + cut.stockLength,
        0,
      );
      const efficiency = totalStock > 0 ? (totalUsed / totalStock) * 100 : 0;

      return {
        stockLength,
        cutCount: stockCuts.length,
        patterns,
        avgWaste: stockCuts.length > 0 ? totalWaste / stockCuts.length : 0,
        totalWaste,
        efficiency,
      };
    });
  }

  // ========================================
  // DP (Dynamic Programming) Methods
  // ========================================

  /**
   * Group items by length for pattern generation
   */
  private groupItemsByLength(
    sequence: OptimizationItem[],
  ): Array<{ length: number; quantity: number }> {
    const groups = new Map<number, number>();

    sequence.forEach((item) => {
      const current = groups.get(item.length) || 0;
      groups.set(item.length, current + (item.quantity || 1));
    });

    return Array.from(groups.entries()).map(([length, quantity]) => ({
      length,
      quantity,
    }));
  }

  /**
   * Generate all possible cutting patterns for given item groups and stock lengths
   * Based on the reference implementation
   */
  private generateCuttingPatterns(
    itemGroups: Array<{ length: number; quantity: number }>,
    stockLengths: number[],
    constraints: OptimizationConstraints,
  ): Array<{
    stockLength: number;
    pattern: Map<number, number>; // length -> count
    used: number;
    waste: number;
  }> {
    const patterns: Array<{
      stockLength: number;
      pattern: Map<number, number>;
      used: number;
      waste: number;
    }> = [];

    // ✅ Sort stock lengths descending to prioritize larger stocks first
    const sortedStockLengths = [...stockLengths].sort((a, b) => b - a);

    for (const stockLength of sortedStockLengths) {
      // ✅ CRITICAL FIX: Subtract BOTH startSafety and endSafety for pattern generation
      // The optimization must respect both safety margins as hard constraints
      // Cast to EnhancedConstraints to access safety properties
      const enhancedConstraints = constraints as unknown as EnhancedConstraints;
      const totalSafety =
        (enhancedConstraints.startSafety || 0) +
        (enhancedConstraints.endSafety || 0);
      const usableLength = stockLength - totalSafety;

      // Generate all possible combinations of items that fit in this stock
      this.generatePatternsForStock(
        itemGroups,
        stockLength,
        usableLength,
        patterns,
        constraints,
      );
    }

    // CRITICAL: For high-demand problems, Pareto filtering can remove necessary patterns
    const totalDemand = itemGroups.reduce((sum, g) => sum + g.quantity, 0);
    const maxDemand = Math.max(...itemGroups.map((g) => g.quantity));

    // CRITICAL: Skip Pareto to preserve pattern diversity
    this.logger.info(
      `[Genetic] Skipping Pareto filter to preserve all ${patterns.length} patterns`,
    );
    return patterns;
  }

  /**
   * Generate patterns for a specific stock length
   */
  private generatePatternsForStock(
    itemGroups: Array<{ length: number; quantity: number }>,
    stockLength: number,
    usableLength: number,
    patterns: Array<{
      stockLength: number;
      pattern: Map<number, number>;
      used: number;
      waste: number;
    }>,
    constraints?: OptimizationConstraints,
  ): void {
    const lengths = itemGroups.map((g) => g.length);
    const kerfWidth = constraints?.kerfWidth ?? 0;

    // ✅ FIX: Calculate max counts considering kerf
    // Each item needs: length + kerfWidth (except maybe the first one)
    const maxCounts = itemGroups.map((g) => {
      if (kerfWidth === 0) {
        return Math.floor(usableLength / g.length);
      }
      // With kerf: (usableLength + kerf) / (length + kerf)
      // This accounts for kerf between segments
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
   * ✅ FIX: Now supports kerf calculation
   */
  private generateCombinations(
    lengths: number[],
    maxCounts: number[],
    usableLength: number,
    stockLength: number,
    kerfWidth: number,
    currentPattern: Map<number, number>,
    itemIndex: number,
    patterns: Array<{
      stockLength: number;
      pattern: Map<number, number>;
      used: number;
      waste: number;
    }>,
  ): void {
    if (itemIndex >= lengths.length) {
      // Check if this pattern is valid (has at least one item)
      if (currentPattern.size > 0) {
        // ✅ FIX: Calculate used length with kerf
        let used = 0;
        let totalSegments = 0;

        for (const [length, count] of currentPattern.entries()) {
          used += length * count;
          totalSegments += count;
        }

        // ✅ Add kerf: (totalSegments - 1) × kerfWidth (kerf between segments)
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

    // ✅ CRITICAL FIX: Calculate remaining space in current pattern
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

    // Calculate max count for current item based on remaining space
    const maxCount =
      kerfWidth === 0
        ? Math.floor(remainingSpace / currentLength)
        : Math.floor(
            (remainingSpace + kerfWidth) / (currentLength + kerfWidth),
          );

    // Try all possible counts for current item (0 to maxCount)
    for (let count = 0; count <= maxCount; count++) {
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
   * FIXED: Removed aggressive filtering that was causing missing patterns
   */
  private filterParetoOptimal(
    patterns: Array<{
      stockLength: number;
      pattern: Map<number, number>;
      used: number;
      waste: number;
    }>,
  ): Array<{
    stockLength: number;
    pattern: Map<number, number>;
    used: number;
    waste: number;
  }> {
    const filtered: typeof patterns = [];

    for (let i = 0; i < patterns.length; i++) {
      const p = patterns[i]!;
      let dominated = false;

      for (let j = 0; j < patterns.length; j++) {
        if (i === j) continue;
        const q = patterns[j]!;
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

      if (!dominated) filtered.push(p);
    }

    return filtered;
  }

  /**
   * Check if pattern q has more or equal items than pattern p
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
   * Check if pattern q is strictly better than pattern p
   */
  private patternIsStrictlyBetter(
    q: Map<number, number>,
    p: Map<number, number>,
  ): boolean {
    let hasMore = false;
    for (const [length, count] of p.entries()) {
      const qCount = q.get(length) || 0;
      if (qCount > count) hasMore = true;
    }
    return hasMore;
  }

  /**
   * Find optimal pattern combination using exact demand tracking
   * FIXED: Now ensures exact demand fulfillment (no over/under cutting)
   */
  private findOptimalPatternCombination(
    patterns: Array<{
      stockLength: number;
      pattern: Map<number, number>;
      used: number;
      waste: number;
    }>,
    itemGroups: Array<{ length: number; quantity: number }>,
    constraints: OptimizationConstraints,
  ): Array<{
    pattern: (typeof patterns)[0];
    count: number;
  }> {
    // Create demand map - this is our target
    const targetDemand = new Map<number, number>();
    itemGroups.forEach((group) => {
      targetDemand.set(group.length, group.quantity);
    });

    this.logger.debug(`[GeneticAlgorithm] 🎯 DP with exact demand tracking:`, {
      targetDemand: Object.fromEntries(targetDemand),
      patternsCount: patterns.length,
    });

    // Use greedy backtracking with exact demand control
    return this.findExactDemandSolution(patterns, itemGroups, constraints);
  }

  /**
   * Calculate how much demand a pattern satisfies
   */
  private calculatePatternDemand(
    pattern: Map<number, number>,
    demand: Map<number, number>,
  ): number {
    let satisfied = 0;
    for (const [length, count] of pattern.entries()) {
      const needed = demand.get(length) || 0;
      satisfied += Math.min(count, needed);
    }
    return satisfied;
  }

  /**
   * Convert DP solution to cuts with demand validation
   */
  private convertSolutionToCuts(
    solution: Array<{
      pattern: {
        stockLength: number;
        pattern: Map<number, number>;
        used: number;
        waste: number;
      };
      count: number;
    }>,
    stockLengths: number[],
    constraints: OptimizationConstraints,
    itemGroups?: Array<{ length: number; quantity: number }>,
  ): Cut[] {
    const cuts: Cut[] = [];
    let cutIndex = 0;

    const kerfWidth = constraints.kerfWidth ?? 0;

    for (const { pattern, count } of solution) {
      for (let i = 0; i < count; i++) {
        const segments: CuttingSegment[] = [];
        let segmentIndex = 0;
        let usedLength = constraints.safetyMargin || 0;

        // ✅ FIX: Create segments with kerf between them
        for (const [length, itemCount] of pattern.pattern.entries()) {
          for (let j = 0; j < itemCount; j++) {
            // Add kerf before segment (except first segment)
            if (segmentIndex > 0 && kerfWidth > 0) {
              usedLength += kerfWidth;
            }

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

        // ✅ Calculate kerf loss
        const kerfLoss =
          kerfWidth > 0 && segments.length > 0
            ? (segments.length - 1) * kerfWidth
            : 0;

        // ✅ CRITICAL FIX: endSafety is 0 (all fire is cut from start)
        // Pattern generation already subtracted startSafety (100mm)
        // So finalUsedLength = usedLength (no additional safety zones)
        const finalUsedLength = usedLength;
        const finalRemaining = Math.max(
          0,
          pattern.stockLength - finalUsedLength,
        );

        const cut: Cut = {
          id: `cut-${cutIndex}`,
          cuttingPlanId: `plan-${cutIndex}`,
          stockIndex: cutIndex,
          stockLength: pattern.stockLength,
          materialType: `Profile-${pattern.stockLength}mm` as ProfileType,
          segments,
          segmentCount: segments.length,
          usedLength: finalUsedLength,
          remainingLength: finalRemaining,
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
   */
  private validateDemandFulfillment(
    cuts: Cut[],
    itemGroups: Array<{ length: number; quantity: number }>,
  ): void {
    this.logger.info(`[GeneticAlgorithm] 🔍 Starting demand validation:`, {
      totalCuts: cuts.length,
      itemGroups: itemGroups
        .map((g) => `${g.length}mm: ${g.quantity}`)
        .join(", "),
    });

    // Calculate actual cuts by length
    const actualCuts = new Map<number, number>();
    cuts.forEach((cut, cutIndex) => {
      this.logger.info(`[GeneticAlgorithm] 🔍 Processing cut ${cutIndex}:`, {
        cutId: cut.id,
        stockLength: cut.stockLength,
        segmentCount: cut.segmentCount,
        segments: cut.segments.map((s) => `${s.length}mm`).join(", "),
      });

      cut.segments.forEach((seg, segIndex) => {
        const current = actualCuts.get(seg.length) || 0;
        actualCuts.set(seg.length, current + 1);

        this.logger.info(
          `[GeneticAlgorithm] 🔍 Added segment ${segIndex}: ${seg.length}mm`,
          {
            currentCount: current + 1,
            totalForLength: actualCuts.get(seg.length),
          },
        );
      });
    });

    this.logger.info(`[GeneticAlgorithm] 📊 Final actual counts:`, {
      actualCuts: Object.fromEntries(actualCuts),
    });

    // Compare with required demand (allow minimal overproduction; deficits are errors)
    const errors: string[] = [];
    for (const group of itemGroups) {
      const actual = actualCuts.get(group.length) || 0;
      const required = group.quantity;

      this.logger.info(`[GeneticAlgorithm] 🔍 Checking ${group.length}mm:`, {
        required,
        actual,
        diff: actual - required,
      });

      if (actual < required) {
        const diff = actual - required;
        errors.push(
          `${group.length}mm: required ${required}, got ${actual} (diff: ${diff})`,
        );
      }
    }

    if (errors.length > 0) {
      this.logger.error(
        `[GeneticAlgorithm] ❌ DEMAND MISMATCH in convertSolutionToCuts:`,
        {
          errors,
          actualCuts: Object.fromEntries(actualCuts),
          requiredDemand: itemGroups.map((g) => ({
            length: g.length,
            quantity: g.quantity,
          })),
        },
      );
      throw new Error(`Demand mismatch: ${errors.join(", ")}`);
    }

    this.logger.debug(`[GeneticAlgorithm] ✅ Demand validation passed:`, {
      actualCuts: Object.fromEntries(actualCuts),
      requiredDemand: itemGroups.map((g) => ({
        length: g.length,
        quantity: g.quantity,
      })),
    });
  }

  /**
   * Generate plan label for a pattern
   */
  private generatePlanLabel(pattern: Map<number, number>): string {
    const parts: string[] = [];
    for (const [length, count] of pattern.entries()) {
      parts.push(`${count}×${length}mm`);
    }
    return parts.join(" + ");
  }

  /**
   * Find exact demand solution using priority search (BFS/Dijkstra-like)
   * Replaces greedy backtracking to find optimal mixed-pattern solutions
   */
  private findExactDemandSolution(
    patterns: Array<{
      stockLength: number;
      pattern: Map<number, number>;
      used: number;
      waste: number;
    }>,
    itemGroups: Array<{ length: number; quantity: number }>,
    constraints: OptimizationConstraints,
  ): Array<{
    pattern: (typeof patterns)[0];
    count: number;
  }> {
    // Initialize demand map using only length (not profileType)
    const demand = new Map<number, number>();
    itemGroups.forEach((group) => {
      // ✅ CRITICAL: Use only length as key (not profileType+length combination)
      demand.set(group.length, group.quantity);
    });

    this.logger.debug(`[GeneticAlgorithm] 🔍 Starting priority search:`, {
      initialDemand: Object.fromEntries(demand),
      patternsAvailable: patterns.length,
    });

    // Convert patterns to SearchPattern format
    const searchPatterns: SearchPattern[] = patterns.map((p) => ({
      stockLength: p.stockLength,
      pattern: p.pattern,
      used: p.used,
      waste: p.waste,
    }));

    // Run priority search with original working parameters
    const solver = new PrioritySearchSolver(this.logger);
    const result = solver.solve(searchPatterns, demand, {
      maxStates: 5000,
      overProductionTolerance: 2,
      wasteNormalization: 1500,
    });

    if (!result) {
      throw new Error("No solution found with priority search");
    }

    this.logger.info(`[GeneticAlgorithm] 🎯 Priority search completed:`, {
      totalBars: result.totalBars,
      totalWaste: result.totalWaste,
      patternCount: result.picks.length,
    });

    // Convert search result to solution format
    const solution = this.convertSearchStateToSolution(
      result,
      patterns,
      itemGroups,
    );

    // Validate final solution
    const finalValidation = this.validateExactDemand(solution, itemGroups);
    if (!finalValidation.isValid) {
      this.logger.error(
        `[GeneticAlgorithm] ❌ Exact demand validation failed:`,
        finalValidation.errors,
      );
      throw new Error(
        `Demand validation failed: ${finalValidation.errors.join(", ")}`,
      );
    }

    this.logger.info(`[GeneticAlgorithm] ✅ Solution validated:`, {
      totalCuts: solution.reduce((sum, s) => sum + s.count, 0),
      uniquePatterns: solution.length,
    });

    return solution;
  }

  /**
   * Convert search state to solution format
   * Groups consecutive picks of same pattern and counts them
   */
  private convertSearchStateToSolution(
    state: SearchState,
    patterns: Array<{
      stockLength: number;
      pattern: Map<number, number>;
      used: number;
      waste: number;
    }>,
    itemGroups: Array<{ length: number; quantity: number }>,
  ): Array<{
    pattern: (typeof patterns)[0];
    count: number;
  }> {
    const solution: Array<{ pattern: (typeof patterns)[0]; count: number }> =
      [];
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

    this.logger.debug(
      "[GeneticAlgorithm] Converted search state to solution:",
      {
        uniquePatterns: solution.length,
        totalCuts: solution.reduce((sum, s) => sum + s.count, 0),
        patterns: solution
          .map(
            (s) => `${s.count}x(${this.generatePlanLabel(s.pattern.pattern)})`,
          )
          .join(", "),
      },
    );

    return solution;
  }

  /**
   * Check if there's any remaining demand
   */
  private hasRemainingDemand(remainingDemand: Map<number, number>): boolean {
    for (const count of remainingDemand.values()) {
      if (count > 0) return true;
    }
    return false;
  }

  /**
   * Find the best pattern that fits the remaining demand
   * Prioritizes patterns that:
   * 1. Don't exceed remaining demand for any length
   * 2. Have the best waste efficiency
   * 3. Use the most remaining demand
   * FIXED: Better scoring to prevent missing items
   */
  private findBestFittingPattern(
    patterns: Array<{
      stockLength: number;
      pattern: Map<number, number>;
      used: number;
      waste: number;
    }>,
    remainingDemand: Map<number, number>,
  ): (typeof patterns)[0] | null {
    let bestPattern: (typeof patterns)[0] | null = null;
    let bestScore = -1;

    let fallbackPattern: (typeof patterns)[0] | null = null;
    let fallbackScore = -1;

    const maxWastePct = 30 / 100; // conservative default
    const minUtilization = Math.max(0, 1 - maxWastePct);

    for (const pattern of patterns) {
      if (!this.patternFitsDemand(pattern.pattern, remainingDemand)) {
        continue;
      }

      // ✅ FIXED: Demand-coverage-first scoring - prioritize remaining demand fulfillment
      const demandUsage = this.calculateDemandUsage(
        pattern.pattern,
        remainingDemand,
      );
      const demandScore = demandUsage * 10000; // High weight for demand coverage
      const wasteScore = -pattern.waste; // Negative penalty for waste
      const score = demandScore + wasteScore;

      // Check utilization for fallback
      const efficiency =
        pattern.used + pattern.waste > 0
          ? pattern.used / (pattern.used + pattern.waste)
          : 0;

      if (efficiency < minUtilization) {
        if (score > fallbackScore) {
          fallbackScore = score;
          fallbackPattern = pattern;
        }
        continue;
      }

      // Tie-break: prefer larger stock if scores are very close (±5%)
      if (score > bestScore) {
        bestScore = score;
        bestPattern = pattern;
      } else if (
        bestPattern &&
        Math.abs(score - bestScore) < 0.05 * bestScore
      ) {
        if (pattern.stockLength > bestPattern.stockLength) {
          bestPattern = pattern;
        }
      }
    }

    return bestPattern ?? fallbackPattern;
  }

  /**
   * Check if a pattern fits within remaining demand
   * FIXED: Strict validation to prevent over-cutting
   */
  private patternFitsDemand(
    pattern: Map<number, number>,
    remainingDemand: Map<number, number>,
  ): boolean {
    for (const [length, count] of pattern.entries()) {
      const remaining = remainingDemand.get(length) || 0;
      if (count > remaining) {
        return false; // Pattern exceeds remaining demand
      }
    }
    return true;
  }

  /**
   * Calculate how much of remaining demand this pattern uses
   */
  private calculateDemandUsage(
    pattern: Map<number, number>,
    remainingDemand: Map<number, number>,
  ): number {
    let totalUsed = 0;
    let totalRemaining = 0;

    for (const [length, count] of pattern.entries()) {
      const remaining = remainingDemand.get(length) || 0;
      totalUsed += count;
      totalRemaining += remaining;
    }

    return totalRemaining > 0 ? totalUsed / totalRemaining : 0;
  }

  /**
   * Validate that solution exactly matches demand
   */
  private validateExactDemand(
    solution: Array<{
      pattern: { pattern: Map<number, number> };
      count: number;
    }>,
    itemGroups: Array<{ length: number; quantity: number }>,
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Calculate actual cuts by length
    const actualCuts = new Map<number, number>();
    solution.forEach(({ pattern, count }) => {
      for (const [length, patternCount] of pattern.pattern.entries()) {
        const current = actualCuts.get(length) || 0;
        actualCuts.set(length, current + patternCount * count);
      }
    });

    // Compare with required demand - allow minimal overproduction (+1-2 pieces)
    const maxExtraPerPiece = 2;
    for (const group of itemGroups) {
      const actual = actualCuts.get(group.length) || 0;
      const required = group.quantity;

      if (actual < required) {
        // Shortage is always an error
        const diff = actual - required;
        errors.push(
          `${group.length}mm: shortage ${Math.abs(diff)} (required ${required}, got ${actual})`,
        );
      } else if (actual > required + maxExtraPerPiece) {
        // Over-production beyond tolerance: warn but don't fail
        this.logger.warn(
          `[GeneticAlgorithm] Over-produced ${group.length}mm: ${actual - required} extra (limit: ${maxExtraPerPiece})`,
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
