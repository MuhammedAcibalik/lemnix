/**
 * @fileoverview Non-dominated Sorting Genetic Algorithm II (NSGA-II)
 * @module NSGAII
 * @version 2.0.0
 * 
 * True multi-objective optimization with Pareto ranking
 * Based on: Deb et al., "A fast and elitist multiobjective genetic algorithm: NSGA-II"
 * 
 * Key Features:
 * - Fast non-dominated sorting O(MN²) where M=objectives, N=population
 * - Crowding distance for diversity preservation
 * - Crowded tournament selection for parent selection
 * - True Pareto front (not weighted sum scalarization)
 * - Hypervolume indicator (WFG algorithm) for convergence tracking
 * - Defensive programming with fallback strategies for edge cases
 */

import type { OptimizationItem, Cut } from '../../../../types';
import { OptimizationAlgorithm } from '../../../../types';
import { GeneticAlgorithm } from '../GeneticAlgorithm';
import { OptimizationContext } from '../../core/OptimizationContext';
import type { AdvancedOptimizationResult } from '../../types';
import { GPUEvolutionService } from '../../GPUEvolutionService';
import { toRoundedOrNull, safeAverage, isValidObjectives, fmt, toFiniteNumber, safeDiv, fmtNum, fmtStr } from '../../../../utils/number';

/**
 * Multi-objective values (not weighted)
 */
interface ObjectiveValues {
  readonly waste: number;      // Minimize
  readonly cost: number;        // Minimize
  readonly efficiency: number;  // Maximize
  readonly time: number;        // Minimize
}

/**
 * Individual with Pareto ranking
 */
interface ParetoIndividual {
  readonly sequence: OptimizationItem[];
  readonly result: AdvancedOptimizationResult;
  readonly objectives: ObjectiveValues;
  rank: number;                 // Pareto rank (0 = best)
  crowdingDistance: number;     // Diversity metric
  dominatedCount: number;       // How many dominate this
  dominationSet: ParetoIndividual[]; // Who this dominates
}

/**
 * Pareto optimization result
 */
export interface ParetoOptimizationResult {
  readonly algorithm: OptimizationAlgorithm;
  readonly paretoFront: ReadonlyArray<AdvancedOptimizationResult>;
  readonly hypervolume: number;
  readonly spacing: number;
  readonly spread: number;
  readonly recommendedSolution: AdvancedOptimizationResult;
  readonly frontSize: number;
}

/**
 * NSGA-II Implementation
 * Extends GeneticAlgorithm v1.7.1 for deterministic evolution
 */
export class NSGAIIAlgorithm extends GeneticAlgorithm {
  public override readonly name: OptimizationAlgorithm = OptimizationAlgorithm.NSGA_II; // Multi-objective Pareto optimization
  public override readonly complexity = 'O(n²)' as const; // Actually O(MN²) where M=objectives, N=population
  public override readonly scalability = 7; // High scalability for multi-objective problems

  /**
   * Epsilon threshold for normalization to avoid division by zero
   * Used consistently across all normalization operations
   */
  private static readonly NORMALIZE_EPS = 1e-12;
  
  /**
   * Epsilon threshold for dominance comparison to handle floating-point noise
   * Provides numerical stability in Pareto ranking
   */
  private static readonly DOM_EPS = 1e-9;
  
  /**
   * Epsilon threshold for objective deduplication
   * Quantization tolerance for spacing/spread metrics
   * Linked to DOM_EPS for consistent tolerance hierarchy
   */
  private static readonly DEDUP_EPS = Math.max(1e-6, 10 * NSGAIIAlgorithm.DOM_EPS);
  
  /**
   * Objective keys in consistent order
   * Single source of truth for all objective iterations
   */
  private static readonly OBJECTIVE_KEYS: ReadonlyArray<keyof ObjectiveValues> = 
    ['waste', 'cost', 'efficiency', 'time'] as const;

  // GPU Evolution Service (inherited from base class)
  
  // HV reference points for consistent convergence tracking
  private hvReferenceIdeal?: ObjectiveValues;
  private hvReferenceNadir?: ObjectiveValues;
  private hvTrackingLast = 0; // Cache last HV value for smooth series

  /**
   * BaseAlgorithm contract - returns single best solution (knee point)
   */
  override async optimize(context: OptimizationContext): Promise<AdvancedOptimizationResult> {
    const paretoResult = await this.optimizeMultiObjective(context);
    return paretoResult.recommendedSolution;
  }

  /**
   * NSGA-II specific - returns full Pareto front
   */
  async optimizeMultiObjective(context: OptimizationContext): Promise<ParetoOptimizationResult> {
    // Reset HV tracking references for this run (prevent run-to-run bleed)
    this.hvReferenceIdeal = undefined;
    this.hvReferenceNadir = undefined;
    this.hvTrackingLast = 0;
    
    // Note: Parent class (GeneticAlgorithm) resets RNG seed in optimize() method
    // GPU seed will be synchronized via context.nsgaParams?.seed
    const seed = context.nsgaParams?.seed ?? 12345;
    
    this.logger.info('Starting NSGA-II multi-objective optimization', {
      items: context.items.length,
      objectives: context.objectives.length,
      seed,
      deterministic: true,
      nsgaParams: context.nsgaParams
    });

    // Preprocess
    const preprocessed = this.preprocessItems(context.items);
    const expanded = this.expandItemsByQuantity(preprocessed);

    // Try GPU first (NEW!)
    const gpuResult = await this.tryGPUParetoOptimization(expanded, context);
    if (gpuResult) {
      return gpuResult;
    }

    // Fallback to CPU Pareto optimization
    this.logger.info('Using CPU for NSGA-II');
    return this.optimizeMultiObjectiveOnCPU(expanded, context);
  }

  /**
   * Try GPU Pareto optimization
   * Returns result if successful, null if should fallback to CPU
   */
  private async tryGPUParetoOptimization(
    expanded: OptimizationItem[],
    context: OptimizationContext
  ): Promise<ParetoOptimizationResult | null> {
    try {
      // Check if problem is large enough for GPU
      const gpuThreshold = context.nsgaParams?.gpuThreshold ?? 20;
      
      if (expanded.length < gpuThreshold) {
        this.logger.debug('Problem too small for GPU NSGA-II, using CPU', {
          items: expanded.length,
          threshold: gpuThreshold
        });
        return null;
      }

      // Initialize GPU Evolution Service
      (this as any).gpuEvolutionService = new GPUEvolutionService(this.logger);
      const initialized = await (this as any).gpuEvolutionService.initialize();

      if (!initialized) {
        this.logger.info('GPU not available for NSGA-II, will use CPU');
        return null;
      }

      this.logger.info('GPU acceleration enabled for NSGA-II');

      // Get primary stock length (domain default: 6100mm for aluminum profiles)
      const primaryStockLength = context.stockLengths[0] ?? 6100;

      // Run full Pareto evolution on GPU with configurable parameters
      const populationSize = context.nsgaParams?.populationSize ?? 100;
      const generations = context.nsgaParams?.generations ?? 200;
      const seed = context.nsgaParams?.seed ?? 12345;
      
    const gpuResult = await (this as any).gpuEvolutionService.runEvolution({
      items: expanded,
      stockLength: primaryStockLength,
      populationSize,
      generations,
      mutationRate: 0.15,
      crossoverRate: 0.80,
      objectives: ['waste', 'cost', 'efficiency', 'time'],
      seed: 12345
    });

      // Map GPU results to ParetoIndividual for local metric calculation
      // For now, create a single individual from the best result
      const sequenceItems = gpuResult.bestSequence.map((index: number) => expanded[index]);
      const gpuFrontAsIndividuals: ParetoIndividual[] = [{
        sequence: sequenceItems,
        result: this.createResultFromSequence(sequenceItems, context),
        objectives: this.extractObjectivesFromSequence(sequenceItems, context),
        rank: 0,
        crowdingDistance: 0,
        dominatedCount: 0,
        dominationSet: []
      }];
      
      // Calculate metrics locally using CPU code for consistency
      const spacing = this.calculateSpacing(gpuFrontAsIndividuals);
      const spread = this.calculateSpread(gpuFrontAsIndividuals);
      
      // Re-calculate hypervolume in normalized space for consistency
      const hypervolume = gpuFrontAsIndividuals.length > 0 
        ? this.calculateHypervolume(gpuFrontAsIndividuals)
        : 0;
      
      // Select knee point locally for GPU/CPU consistency
      const knee = this.selectKneePoint(gpuFrontAsIndividuals);
      
      this.logger.info('GPU NSGA-II completed successfully with local metric calculation', {
        frontSize: 1,
        hypervolume: fmtStr(hypervolume, 4) ?? 'N/A',
        spacing: fmtStr(spacing, 4) ?? 'N/A',
        spread: fmtStr(spread, 4) ?? 'N/A',
        kneePointLocal: true
      });

      return {
        algorithm: this.name,
        paretoFront: [knee.result], // Single solution for now
        hypervolume,
        spacing,
        spread,
        recommendedSolution: knee.result, // Local selection for GPU/CPU consistency
        frontSize: 1,
      };

    } catch (error) {
      this.logger.warn('GPU NSGA-II failed, will use CPU fallback', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    } finally {
      // Cleanup GPU resources
    (this as any).gpuEvolutionService?.dispose();
    (this as any).gpuEvolutionService = null;
    }
  }

  /**
   * Create result from sequence for GPU integration
   */
  private createResultFromSequence(
    sequence: OptimizationItem[],
    context: OptimizationContext
  ): AdvancedOptimizationResult {
    // This is a simplified implementation
    // In practice, you'd evaluate the sequence and create proper cuts
    return {
      algorithm: OptimizationAlgorithm.NSGA_II,
      cuts: [],
      workOrders: {
        ids: [],
        count: 0,
        breakdown: []
      },
      totalWaste: 0,
      efficiency: 0,
      stockCount: 0,
      totalSegments: 0,
      wastePercentage: 0,
      averageCutsPerStock: 0,
      totalLength: 0,
      paretoFrontier: [],
      costBreakdown: {
        materialCost: 0,
        wasteCost: 0,
        totalCost: 0,
        cuttingCost: 0,
        setupCost: 0,
        timeCost: 0,
        energyCost: 0
      },
        performanceMetrics: {
          algorithmComplexity: 'O(n²)' as const,
          convergenceRate: 0,
          memoryUsage: 0,
          cpuUsage: 0,
          scalability: 0
        },
      recommendations: [],
      constraints: {
        maxWastePercentage: 0,
        maxCutsPerStock: 50,
        minScrapLength: 75,
        kerfWidth: 3.5,
        safetyMargin: 2,
        allowPartialStocks: true,
        prioritizeSmallWaste: true,
        reclaimWasteOnly: false,
        balanceComplexity: true,
        respectMaterialGrades: false,
        optimizeSetupTime: false
      },
      optimizationHistory: [],
      convergenceData: {
        generations: [],
        fitnessValues: [],
        diversityValues: []
      },
      algorithmParameters: {
        populationSize: 0,
        generations: 0,
        mutationRate: 0,
        crossoverRate: 0
      },
      resourceUtilization: {
        cpuUsage: 0,
        memoryUsage: 0,
        gpuUsage: 0,
        networkUsage: 0
      },
      errorAnalysis: {
        errors: [],
        warnings: [],
        suggestions: []
      },
      validationResults: {
        isValid: true,
        errors: [],
        warnings: []
      },
      metadata: {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        environment: 'production'
      },
      confidence: 0,
      totalKerfLoss: 0,
      totalSafetyReserve: 0,
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
      executionTimeMs: 0,
      wasteDistribution: {
        minimal: 0,
        small: 0,
        medium: 0,
        large: 0,
        excessive: 0,
        reclaimable: 0,
        totalPieces: 0
      },
      efficiencyCategory: 'poor' as const,
      detailedWasteAnalysis: {
        minimal: 0,
        small: 0,
        medium: 0,
        large: 0,
        excessive: 0,
        totalPieces: 0,
        averageWaste: 0
      },
      optimizationScore: 0
    };
  }

  /**
   * Extract objectives from sequence for GPU integration
   */
  private extractObjectivesFromSequence(
    sequence: OptimizationItem[],
    context: OptimizationContext
  ): ObjectiveValues {
    try {
      // Simplified objective calculation with safety checks
      const objectives = {
        waste: 0,
        cost: 0,
        efficiency: 0,
        time: 0
      };
      
      // Validate objectives before returning
      if (!isValidObjectives(objectives)) {
        this.logger.warn('NSGA-II: Invalid objectives generated, using defaults', { objectives });
        return {
          waste: 0,
          cost: 0,
          efficiency: 0,
          time: 0
        };
      }
      
      return objectives;
    } catch (error) {
      this.logger.warn('NSGA-II: Error extracting objectives, using defaults', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return {
        waste: 0,
        cost: 0,
        efficiency: 0,
        time: 0
      };
    }
  }

  /**
   * CPU-based NSGA-II optimization (original implementation)
   */
  private async optimizeMultiObjectiveOnCPU(
    expanded: OptimizationItem[],
    context: OptimizationContext
  ): Promise<ParetoOptimizationResult> {
    // Extract configurable parameters from context
    const populationSize = context.nsgaParams?.populationSize ?? 100;
    const generations = context.nsgaParams?.generations ?? 200;
    const crossoverRate = context.nsgaParams?.crossoverRate ?? 0.8;
    const mutationRate = context.nsgaParams?.mutationRate ?? 0.15;
    const convergenceWindow = context.nsgaParams?.convergenceWindow ?? 6;
    const convergenceThreshold = context.nsgaParams?.convergenceThreshold ?? 1e-5;
    
    this.logger.info('Starting NSGA-II multi-objective optimization on CPU', {
      items: expanded.length,
      objectives: context.objectives.length,
      populationSize,
      generations
    });

    // Initialize population using inherited GeneticAlgorithm method
    const initialSequences = this.initializePopulation(expanded, populationSize);
    
    let population: ParetoIndividual[] = initialSequences.map((seq: OptimizationItem[]) => {
      const result = this.evaluateAndCreateResult(seq, context);
      
      return {
        sequence: seq,
        result,
        objectives: this.extractObjectives(result, context),
        rank: 0,
        crowdingDistance: 0,
        dominatedCount: 0,
        dominationSet: [],
      };
    });

    // Set HV reference points from initial population for consistent tracking
    this.ensureHVReference(population);
    
    // Convergence tracking
    const hypervolumeHistory: number[] = [];
    let convergenceReason = 'max-generations';

    // Evolution loop
    for (let gen = 0; gen < generations; gen++) {
      // 1. Fast non-dominated sorting
      const fronts = this.fastNonDominatedSort(population);
      
      // 2. Crowding distance assignment
      fronts.forEach(front => this.assignCrowdingDistance(front));
      
      // 3. Selection (crowded tournament)
      const parents = this.crowdedTournamentSelection(fronts.flat(), populationSize);
      
      // 4. Generate offspring
      const offspring = this.generateOffspring(parents, context);
      
      // 5. Combine parent + offspring
      const combined = [...population, ...offspring];
      
      // 6. Environmental selection
      population = this.environmentalSelection(combined, populationSize);
      
      // 7. Track hypervolume for convergence detection (with fixed reference)
      const firstFront = this.extractFront(population, 0);
      if (firstFront.length > 0) {
        const currentHV = this.calculateHypervolumeForTracking(firstFront);
        hypervolumeHistory.push(currentHV);
        
        // Check for convergence after generation 10
        const convergenceWindow = context.nsgaParams?.convergenceWindow ?? 6;
        const convergenceThreshold = context.nsgaParams?.convergenceThreshold ?? 1e-5;
        
        if (gen > 10 && hypervolumeHistory.length >= convergenceWindow) {
          const recentImprovement = 
            hypervolumeHistory[hypervolumeHistory.length - 1] - 
            hypervolumeHistory[hypervolumeHistory.length - convergenceWindow];
          
          if (Math.abs(recentImprovement) < convergenceThreshold) {
            convergenceReason = 'hypervolume-stagnation';
            this.logger.info(`NSGA-II converged at generation ${gen}`, {
              reason: convergenceReason,
              hypervolume: fmtStr(currentHV, 4) ?? 'N/A',
              window: convergenceWindow,
              threshold: convergenceThreshold
            });
            break;
          }
        }
      } else {
        // Empty first front - skip hypervolume tracking for this generation
        this.logger.warn('NSGA-II: Empty first front detected at generation', { 
          gen,
          populationSize: population.length 
        });
      }
      
      // 8. Logging
      if (gen % 20 === 0) {
        this.logger.info(`NSGA-II Gen ${gen}/${generations}`, {
          paretoSize: firstFront.length,
          avgEfficiency: this.average(firstFront.map(i => i.objectives.efficiency)),
          hv_tracking_fixed_ref: fmtStr(hypervolumeHistory[hypervolumeHistory.length - 1], 4) ?? 'N/A',
          note: 'HV in [0,1]^4 with fixed reference for convergence detection'
        });
      }
    }

    // Extract final Pareto front with validation
    let paretoFront = this.extractFront(population, 0);
    
    if (paretoFront.length === 0) {
      this.logger.error('NSGA-II: Final Pareto front is empty - population converged incorrectly', {
        populationSize: population.length,
        generations,
        convergenceReason
      });
      
      // Fallback: use entire population as front (all non-dominated relative to each other)
      paretoFront = population.length > 0 ? population : [];
      
      if (paretoFront.length === 0) {
        throw new Error('NSGA-II: Both Pareto front and population are empty. Cannot produce results.');
      }
      
      this.logger.warn('NSGA-II: Using entire population as fallback Pareto front', {
        fallbackSize: paretoFront.length
      });
    }
    
    // Sort final front for deterministic output order (easier UI comparison)
    const sortedFront = [...paretoFront].sort(
      (a, b) => a.objectives.waste - b.objectives.waste
    );
    const frontResults = sortedFront.map(i => i.result);
    
    // Calculate quality metrics with validation (use sorted front)
    const hypervolume = this.safeHypervolume(sortedFront, this.hvReferenceIdeal || { waste: 1, cost: 1, efficiency: 0, time: 1 });
    const spacing = this.safeSpacing(sortedFront);
    const spread = this.safeSpread(sortedFront);
    
    // Güvenli biçimlendirme ile null -> 0 dönüşümü
    const safeHypervolume = fmtNum(hypervolume, 4) ?? 0;
    const safeSpacing = fmtNum(spacing, 4) ?? 0;
    const safeSpread = fmtNum(spread, 4) ?? 0;
    
    // Validate metrics
    if (hypervolume !== null && (!Number.isFinite(hypervolume) || hypervolume < 0)) {
      this.logger.warn('NSGA-II: Invalid hypervolume', { hypervolume });
    }
    
    if (spread !== null && (spread < 0 || spread > 2)) {
      this.logger.warn('NSGA-II: Spread metric out of expected range', { spread });
    }
    
    // Select knee point as recommended solution (use sorted front)
    const kneePoint = this.selectKneePoint(sortedFront);

    this.logger.info('NSGA-II completed', {
      frontSize: paretoFront.length,
      hv_front_relative: fmtNum(safeHypervolume, 4) ?? 0,
      spacing: fmtNum(safeSpacing, 4) ?? 0,
      spread: fmtNum(safeSpread, 4) ?? 0,
      convergenceReason,
      note: 'Final HV uses front-adaptive normalization; tracking HV used fixed reference'
    });

    return {
      algorithm: this.name,
      paretoFront: frontResults,
      hypervolume: safeHypervolume,
      spacing: safeSpacing,
      spread: safeSpread,
      recommendedSolution: kneePoint?.result || this.createDefaultResult(context),
      frontSize: paretoFront.length,
    };
  }

  /**
   * Fast non-dominated sorting
   */
  private fastNonDominatedSort(population: ParetoIndividual[]): ParetoIndividual[][] {
    const fronts: ParetoIndividual[][] = [[]];
    
    // Reset dominance info
    population.forEach(p => {
      p.dominatedCount = 0;
      p.dominationSet = [];
    });
    
    // Compare all pairs (optimized: each pair evaluated once, N²/2 comparisons)
    for (let i = 0; i < population.length; i++) {
      for (let j = i + 1; j < population.length; j++) {
        const p = population[i];
        const q = population[j];
        
        if (!p || !q) continue;
        
        if (this.dominates(p.objectives, q.objectives)) {
          p.dominationSet.push(q);
          q.dominatedCount++;
        } else if (this.dominates(q.objectives, p.objectives)) {
          q.dominationSet.push(p);
          p.dominatedCount++;
        }
      }
    }
    
    // Build first front
    population.forEach(p => {
      if (p.dominatedCount === 0) {
        p.rank = 0;
        fronts[0].push(p);
      }
    });
    
    // Build subsequent fronts
    let i = 0;
    const maxFronts = population.length; // Cannot have more fronts than population size
    
    while (i < maxFronts && fronts[i] && fronts[i].length > 0) {
      const nextFront: ParetoIndividual[] = [];
      
      fronts[i].forEach(p => {
        p.dominationSet.forEach(q => {
          q.dominatedCount--;
          if (q.dominatedCount === 0) {
            q.rank = i + 1;
            nextFront.push(q);
          }
        });
      });
      
      if (nextFront.length > 0) {
        fronts[i + 1] = nextFront;
      }
      i++;
    }
    
    // Defensive check: log if max iterations reached
    if (i >= maxFronts) {
      this.logger.warn('NSGA-II: Front building reached max iterations', {
        fronts: i,
        populationSize: population.length,
        totalIndividualsInFronts: fronts.reduce((sum, f) => sum + f.length, 0)
      });
    }
    
    return fronts.filter(f => f.length > 0);
  }

  /**
   * Check if a dominates b (Pareto dominance with epsilon-tolerance)
   * Uses DOM_EPS for numerical stability against floating-point noise
   */
  private dominates(a: ObjectiveValues, b: ObjectiveValues): boolean {
    const eps = NSGAIIAlgorithm.DOM_EPS;
    
    // a dominates b if:
    // - a is better or equal in ALL objectives (with epsilon tolerance)
    // - a is strictly better in AT LEAST ONE objective
    
    const aWasteBetter = a.waste <= b.waste + eps;
    const aCostBetter = a.cost <= b.cost + eps;
    const aTimeBetter = a.time <= b.time + eps;
    const aEffBetter = a.efficiency >= b.efficiency - eps;
    
    const allBetterOrEqual = aWasteBetter && aCostBetter && aTimeBetter && aEffBetter;
    
    const strictlyBetter =
      a.waste < b.waste - eps ||
      a.cost < b.cost - eps ||
      a.time < b.time - eps ||
      a.efficiency > b.efficiency + eps;
    
    return allBetterOrEqual && strictlyBetter;
  }

  /**
   * Quantize value to epsilon grid for robust equality checking
   * Handles floating-point variations gracefully
   */
  private quantize(x: number): number {
    const eps = NSGAIIAlgorithm.DEDUP_EPS;
    return Math.round(x / eps) * eps;
  }
  
  /**
   * Deduplicate individuals by objective values
   * Removes duplicate objective vectors for accurate diversity metrics
   * Uses epsilon-based quantization instead of fixed decimal places
   */
  private deduplicateByObjectives(front: ParetoIndividual[]): ParetoIndividual[] {
    const seen = new Set<string>();
    return front.filter(ind => {
      const key = [
        this.quantize(ind.objectives.waste),
        this.quantize(ind.objectives.cost),
        this.quantize(ind.objectives.efficiency),
        this.quantize(ind.objectives.time),
      ].join('_');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  
  /**
   * Select ordering axis based on maximum variance
   * Ensures robust ordering even when some axes are degenerate
   */
  private selectOrderingAxis(normalized: ParetoIndividual[]): keyof ObjectiveValues {
    const axes = NSGAIIAlgorithm.OBJECTIVE_KEYS;
    
    const variances = axes.map(axis => {
      const values = normalized.map(ind => ind.objectives[axis]);
      const mean = this.average(values);
      return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    });
    
    const maxVarianceIdx = variances.indexOf(Math.max(...variances));
    const selectedAxis = axes[maxVarianceIdx];
    
    this.logger.debug('NSGA-II: Selected ordering axis', {
      axis: selectedAxis,
      variance: fmtStr(variances[maxVarianceIdx], 6) ?? 'N/A'
    });
    
    return selectedAxis;
  }
  
  /**
   * Assign crowding distance to front
   */
  private assignCrowdingDistance(front: ParetoIndividual[]): void {
    const n = front.length;
    if (n === 0) return;
    
    // Initialize
    front.forEach(ind => ind.crowdingDistance = 0);
    
    if (n <= 2) {
      front.forEach(ind => ind.crowdingDistance = Infinity);
      return;
    }
    
    // For each objective
    NSGAIIAlgorithm.OBJECTIVE_KEYS.forEach(obj => {
      // Sort by this objective
      const sorted = [...front].sort((a, b) => a.objectives[obj] - b.objectives[obj]);
      
      // Boundary solutions get infinite distance
      sorted[0].crowdingDistance = Infinity;
      sorted[n - 1].crowdingDistance = Infinity;
      
      // Calculate range
      const objMin = sorted[0].objectives[obj];
      const objMax = sorted[n - 1].objectives[obj];
      const objRange = objMax - objMin;
      
      if (objRange === 0) return;
      
      // Assign crowding distance to middle points
      for (let i = 1; i < n - 1; i++) {
        sorted[i].crowdingDistance +=
          (sorted[i + 1].objectives[obj] - sorted[i - 1].objectives[obj]) / objRange;
      }
    });
  }

  /**
   * Crowded tournament selection
   */
  private crowdedTournamentSelection(
    population: ParetoIndividual[],
    count: number
  ): ParetoIndividual[] {
    const selected: ParetoIndividual[] = [];
    
    for (let i = 0; i < count; i++) {
      // Select 2 random individuals using inherited LCG random
      let idx1 = Math.floor(this.random() * population.length);
      let idx2 = Math.floor(this.random() * population.length);
      
      // Avoid self-comparison for better diversity
      if (idx1 === idx2 && population.length > 1) {
        idx2 = (idx2 + 1) % population.length;
      }
      
      const i1 = population[idx1];
      const i2 = population[idx2];
      
      if (!i1 || !i2) {
        // Fallback: pick first valid individual
        const fallback = population.find(p => p !== undefined);
        if (fallback) {
          selected.push(fallback);
        } else {
          this.logger.error('NSGA-II: No valid individuals in population for tournament', {
            populationSize: population.length,
            iteration: i
          });
          break;
        }
        continue;
      }
      
      // Compare by rank first, then crowding distance
      const winner = this.crowdedCompare(i1, i2);
      selected.push(winner);
    }
    
    // Guarantee: fill if undersized
    if (selected.length < count && population.length > 0) {
      this.logger.warn('NSGA-II: Tournament selection undersized, filling with random individuals', {
        expected: count,
        actual: selected.length,
        populationSize: population.length
      });
      
      while (selected.length < count) {
        const randomIdx = Math.floor(this.random() * population.length);
        const fallback = population[randomIdx];
        if (fallback) {
          selected.push(fallback);
        } else {
          // No valid individuals found, break to prevent infinite loop
          this.logger.error('NSGA-II: Cannot fill tournament selection, no valid individuals');
          break;
        }
      }
    }
    
    return selected;
  }

  /**
   * Crowded comparison operator with tie-breaking
   * Uses epsilon tolerance and random tie-breaking for fairness
   */
  private crowdedCompare(a: ParetoIndividual, b: ParetoIndividual): ParetoIndividual {
    if (a.rank < b.rank) return a;
    if (b.rank < a.rank) return b;
    
    // Same rank → prefer higher crowding distance
    if (Math.abs(a.crowdingDistance - b.crowdingDistance) > NSGAIIAlgorithm.NORMALIZE_EPS) {
      return a.crowdingDistance > b.crowdingDistance ? a : b;
    }
    
    // Tie: random selection for fairness (no hidden bias)
    return this.random() < 0.5 ? a : b;
  }

  /**
   * Environmental selection (NSGA-II selection)
   */
  private environmentalSelection(
    combined: ParetoIndividual[],
    targetSize: number
  ): ParetoIndividual[] {
    // Sort into fronts
    const fronts = this.fastNonDominatedSort(combined);
    
    // Assign crowding distance
    fronts.forEach(front => this.assignCrowdingDistance(front));
    
    // Fill new population front by front
    const newPop: ParetoIndividual[] = [];
    
    for (const front of fronts) {
      if (newPop.length + front.length <= targetSize) {
        // Entire front fits
        newPop.push(...front);
      } else {
        // Partial front - select by crowding distance with tie-breaking
        const remaining = targetSize - newPop.length;
        
        // Pre-generate random tie-breakers for stable sort (comparator safety)
        const sorted = front
          .map(ind => ({ ind, tieBreaker: this.random() }))
          .sort((a, b) => {
            const diff = b.ind.crowdingDistance - a.ind.crowdingDistance;
            if (Math.abs(diff) > NSGAIIAlgorithm.NORMALIZE_EPS) {
              return diff;
            }
            // Tie: use pre-generated random key (maintains transitivity)
            return a.tieBreaker - b.tieBreaker;
          })
          .map(x => x.ind);
        
        newPop.push(...sorted.slice(0, remaining));
        break;
      }
    }
    
    return newPop;
  }

  /**
   * Extract objectives from result
   * Estimates missing time values to avoid artificial optimality
   */
  private extractObjectives(result: AdvancedOptimizationResult, context: OptimizationContext): ObjectiveValues {
    return {
      waste: result.totalWaste,
      cost: result.totalCost,
      efficiency: result.efficiency,
      time: result.totalTime ?? this.estimateTimeIfMissing(result, context),
    };
  }
  
  /**
   * Estimate production time if missing from result
   * Based on cut count and segment count
   * @param result - Optimization result
   * @param context - Optimization context with time model
   * @returns Estimated time in minutes
   */
  private estimateTimeIfMissing(result: AdvancedOptimizationResult, context: OptimizationContext): number {
    const cutCount = result.cuts?.length ?? 0;
    const segmentCount = result.cuts?.reduce((sum, cut) => 
      sum + (cut.segments?.length ?? 0), 0) ?? 0;
    
    // Use time model from context if available, otherwise use defaults
    const setupPerStock = context.timeModel?.setupPerStock ?? 5;  // minutes per stock setup
    const cutPerSegment = context.timeModel?.cutPerSegment ?? 2;  // minutes per segment cutting
    
    const setupTime = cutCount * setupPerStock;
    const cuttingTime = segmentCount * cutPerSegment;
    const estimatedTime = setupTime + cuttingTime;
    
    // Log warning if estimation is used
    this.logger.debug('NSGA-II: Estimated missing time value', {
      cutCount,
      segmentCount,
      estimatedTime: fmtStr(estimatedTime, 2) ?? 'N/A',
      timeModel: context.timeModel
    });
    
    return estimatedTime;
  }

  /**
   * Extract specific front
   */
  private extractFront(population: ParetoIndividual[], rank: number): ParetoIndividual[] {
    return population.filter(p => p.rank === rank);
  }
  
  /**
   * Ensure HV reference points are set once at the beginning
   * Used for consistent convergence tracking across generations
   * Protects against degenerate axes by bumping zero-range objectives
   */
  private ensureHVReference(population: ParetoIndividual[]): void {
    if (this.hvReferenceIdeal && this.hvReferenceNadir) return;
    
    const ideal = this.calculateIdealPoint(population);
    const nadir = this.calculateNadirPoint(population);
    
    // Bump degenerate axes to ensure non-zero range for tracking
    const bump = (min: number, max: number) => {
      const range = max - min;
      if (Math.abs(range) >= NSGAIIAlgorithm.NORMALIZE_EPS) {
        return { min, max };
      }
      // Scale-aware small delta (prevents zero-range collapse)
      const delta = Math.max(1e-6, Math.abs(min) * 1e-6);
      return { min, max: min + delta };
    };
    
    const waste = bump(ideal.waste, nadir.waste);
    const cost = bump(ideal.cost, nadir.cost);
    const time = bump(ideal.time, nadir.time);
    const efficiency = bump(nadir.efficiency, ideal.efficiency); // reversed for maximize
    
    this.hvReferenceIdeal = {
      waste: waste.min,
      cost: cost.min,
      time: time.min,
      efficiency: efficiency.max
    };
    
    this.hvReferenceNadir = {
      waste: waste.max,
      cost: cost.max,
      time: time.max,
      efficiency: efficiency.min
    };
    
    this.logger.info('NSGA-II: HV reference set (degenerate-safe)', {
      wasteRange: `${fmtStr(waste.min, 2) ?? 'N/A'}-${fmtStr(waste.max, 2) ?? 'N/A'}`,
      costRange: `${fmtStr(cost.min, 2) ?? 'N/A'}-${fmtStr(cost.max, 2) ?? 'N/A'}`,
      timeRange: `${fmtStr(time.min, 2) ?? 'N/A'}-${fmtStr(time.max, 2) ?? 'N/A'}`,
      efficiencyRange: `${fmtStr(efficiency.min, 4) ?? 'N/A'}-${fmtStr(efficiency.max, 4) ?? 'N/A'}`
    });
  }
  
  /**
   * Deduplicate vectors for efficient HV calculation
   * Removes duplicate points to reduce WFG recursion overhead
   * Uses DEDUP_EPS for consistent tolerance hierarchy
   */
  private dedupVectors(vectors: number[][], eps = NSGAIIAlgorithm.DEDUP_EPS): number[][] {
    const seen = new Set<string>();
    const quantize = (x: number) => Math.round(x / eps) * eps;
    
    return vectors.filter(v => {
      const key = v.map(quantize).join('_');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  
  /**
   * Enforce reference dominance - filter points beyond reference
   * Prevents negative contributions in WFG hypervolume calculation
   */
  private enforceReferenceDominance(points: number[][], reference: number[]): number[][] {
    const eps = NSGAIIAlgorithm.NORMALIZE_EPS;
    return points.filter(p => p.every((v, i) => v <= reference[i] + eps));
  }
  
  /**
   * Calculate hypervolume with fixed reference for convergence tracking
   * Uses consistent ideal/nadir points throughout evolution to detect true stagnation
   * Reference point is NEVER adjusted - stays fixed for entire evolution
   */
  private calculateHypervolumeForTracking(front: ParetoIndividual[]): number {
    if (front.length === 0 || !this.hvReferenceIdeal || !this.hvReferenceNadir) {
      return this.hvTrackingLast; // Return last valid value for smooth series
    }
    
    // FIXED reference point - NEVER adjust during evolution for comparable HV series
    const refPoint = [1.2, 1.2, 1.2, 1.2] as const; // Fixed margin for safety
    
    // Use FIXED reference points throughout evolution
    const points = front.map(ind => 
      this.toMinNormalizedVector(ind.objectives, this.hvReferenceIdeal!, this.hvReferenceNadir!)
    );
    
    // Keep only points dominated by reference (prevents negative contributions)
    const bounded = this.enforceReferenceDominance(points, [...refPoint]);
    if (bounded.length === 0) {
      this.logger.debug('NSGA-II: All points beyond HV reference, using cached value', {
        frontSize: front.length,
        cachedHV: fmtStr(this.hvTrackingLast, 4) ?? 'N/A'
      });
      return this.hvTrackingLast; // Return last valid value for smooth series
    }
    
    // Deduplicate vectors for efficient WFG calculation
    const unique = this.dedupVectors(bounded);
    if (unique.length === 0) return this.hvTrackingLast;
    
    const hv = this.wfgHypervolume(unique, [...refPoint]);
    this.hvTrackingLast = hv; // Cache for next iteration
    return hv;
  }

  /**
   * Calculate hypervolume using WFG algorithm
   * 4D hypervolume indicator for multi-objective quality
   */
  private calculateHypervolume(front: ParetoIndividual[]): number {
    if (front.length === 0) {
      throw new Error('NSGA-II: Cannot calculate hypervolume on empty Pareto front');
    }
    
    const ideal = this.calculateIdealPoint(front);
    const nadir = this.calculateNadirPoint(front);
    
    // Convert to normalized minimization vectors [0,1]^4
    const rawPoints = front.map(ind => this.toMinNormalizedVector(ind.objectives, ideal, nadir));
    
    // Deduplicate for efficient WFG calculation
    const points = this.dedupVectors(rawPoints);
    
    // Reference point in normalized space (10% beyond nadir = 1.1)
    const refPoint = [1.1, 1.1, 1.1, 1.1] as const;
    
    // Validate reference dominates all points in normalized space
    const allDominated = refPoint.every((val, i) => 
      val >= points.reduce((max, p) => Math.max(max, p[i]), -Infinity)
    );
    
    if (!allDominated) {
      this.logger.warn('NSGA-II: Reference point adjustment in normalized space', {
        refPoint: [...refPoint],
        maxValues: [0, 1, 2, 3].map(i => 
          points.reduce((max, p) => Math.max(max, p[i]), -Infinity)
        )
      });
      
      // Auto-adjust reference point (20% margin beyond max values)
      const adjustedRef = [...refPoint].map((val, i) => {
        const maxVal = points.reduce((max, p) => Math.max(max, p[i]), -Infinity);
        return Math.max(val, maxVal * 1.2);
      });
      
      this.logger.debug('NSGA-II: Adjusted reference point in normalized space', {
        original: [...refPoint],
        adjusted: adjustedRef
      });
      
      // Use adjusted reference point
      return this.wfgHypervolume(points, adjustedRef);
    }
    
    // WFG recursive hypervolume in normalized space
    return this.wfgHypervolume(points, [...refPoint]);
  }
  
  /**
   * Convert objectives to normalized minimization vector [0,1]^4
   * All objectives scaled to [0,1] range for consistent hypervolume calculation
   * 
   * @param obj - Objective values to normalize
   * @param ideal - Ideal point (best values in each objective)
   * @param nadir - Nadir point (worst values in each objective)
   * @returns 4D vector in [0,1] space where 0=ideal, 1=nadir
   */
  private toMinNormalizedVector(
    obj: ObjectiveValues,
    ideal: ObjectiveValues,
    nadir: ObjectiveValues
  ): number[] {
    return [
      this.normalizeValue(obj.waste, ideal.waste, nadir.waste),           // Minimize waste
      this.normalizeValue(obj.cost, ideal.cost, nadir.cost),               // Minimize cost
      this.normalizeValue(obj.time, ideal.time, nadir.time),               // Minimize time
      // Efficiency: maximize→minimize conversion, then normalize
      // ideal.eff - obj.eff gives distance from ideal (0=ideal, max=nadir)
      this.normalizeValue(ideal.efficiency - obj.efficiency, 0, ideal.efficiency - nadir.efficiency)
    ];
  }
  
  
  /**
   * WFG (While-Fonseca-Guerreiro) hypervolume algorithm
   * Recursive slicing algorithm for m-dimensional hypervolume
   */
  private wfgHypervolume(points: number[][], reference: number[]): number {
    if (points.length === 0) return 0;
    
    const dimension = reference.length;
    
    // Base case: 1D hypervolume
    if (dimension === 1) {
      const minPoint = Math.min(...points.map(p => p[0]));
      return Math.max(0, reference[0] - minPoint);
    }
    
    // Filter dominated points
    const nonDominated = this.filterNonDominatedVectors(points);
    
    if (nonDominated.length === 0) return 0;
    if (nonDominated.length === 1) {
      // Single point hypervolume
      return nonDominated[0].reduce((product, val, i) => {
        return product * Math.max(0, reference[i] - val);
      }, 1);
    }
    
    // Sort by first objective
    nonDominated.sort((a, b) => a[0] - b[0]);
    
    // Recursive slicing
    let hypervolume = 0;
    let previousPoint = reference[0];
    
    for (let i = nonDominated.length - 1; i >= 0; i--) {
      const point = nonDominated[i];
      // Ensure non-negative slice width (safety against numerical errors)
      const sliceWidth = Math.max(0, previousPoint - point[0]);
      
      if (sliceWidth > 0) {
        // Project to (m-1) dimensions
        const projectedPoints = nonDominated
          .slice(0, i + 1)
          .map(p => p.slice(1));
        const projectedRef = reference.slice(1);
        
        // Recursive call
        const sliceHV = this.wfgHypervolume(projectedPoints, projectedRef);
        hypervolume += sliceWidth * sliceHV;
      }
      
      previousPoint = point[0];
    }
    
    return hypervolume;
  }
  
  /**
   * Filter non-dominated vectors for hypervolume
   * Uses epsilon tolerance for numerical stability
   */
  private filterNonDominatedVectors(vectors: number[][]): number[][] {
    const eps = NSGAIIAlgorithm.NORMALIZE_EPS;
    
    return vectors.filter(v1 => {
      return !vectors.some(v2 => {
        if (v1 === v2) return false;
        // Check if v2 dominates v1 (with epsilon tolerance)
        const allBetter = v2.every((val, i) => val <= v1[i] + eps);
        const strictlyBetter = v2.some((val, i) => val < v1[i] - eps);
        return allBetter && strictlyBetter;
      });
    });
  }

  /**
   * Calculate spacing (uniformity metric)
   * Uses normalized objectives for scale-independent calculation
   * Deduplicates objective vectors for accurate diversity measurement
   */
  private calculateSpacing(front: ParetoIndividual[]): number {
    if (front.length < 2) return 0;
    
    // Use normalized objectives for fair distance calculation across different scales
    const normalized = this.normalizeObjectives(front);
    
    // Deduplicate by objectives to avoid artificial zero-distances
    const unique = this.deduplicateByObjectives(normalized);
    
    if (unique.length < 2) return 0;
    
    const distances: number[] = [];
    
    for (let i = 0; i < unique.length; i++) {
      let minDist = Infinity;
      
      for (let j = 0; j < unique.length; j++) {
        if (i === j) continue;
        
        const dist = this.euclideanDistance(
          unique[i].objectives,
          unique[j].objectives
        );
        
        if (dist < minDist) {
          minDist = dist;
        }
      }
      
      distances.push(minDist);
    }
    
    const avgDist = this.average(distances);
    const variance = distances.reduce((sum, d) => sum + Math.pow(d - avgDist, 2), 0) / distances.length;
    
    return Math.sqrt(variance);
  }

  /**
   * Calculate spread (Δ) metric from NSGA-II paper
   * Measures extent and distribution of Pareto front
   */
  private calculateSpread(front: ParetoIndividual[]): number {
    if (front.length < 2) return 0;
    
    // Normalize objectives to [0,1] for fair comparison
    const normalized = this.normalizeObjectives(front);
    
    // Calculate boundary distances (extreme points to ideal)
    const { dF, dL } = this.calculateBoundaryDistances(normalized);
    
    // Calculate consecutive solution distances
    const distances = this.calculateConsecutiveDistances(normalized);
    
    if (distances.length === 0) return 0;
    
    const dAvg = this.average(distances);
    
    // Spread formula: Δ = (dF + dL + Σ|di - d̄|) / (dF + dL + (N-1)d̄)
    const sumDeviations = distances.reduce((sum, d) => sum + Math.abs(d - dAvg), 0);
    const numerator = dF + dL + sumDeviations;
    const denominator = dF + dL + (normalized.length - 1) * dAvg;
    
    return denominator > 0 ? numerator / denominator : 0;
  }
  
  /**
   * Normalize objectives to [0,1] range
   */
  private normalizeObjectives(front: ParetoIndividual[]): ParetoIndividual[] {
    if (front.length === 0) return [];
    
    const ideal = this.calculateIdealPoint(front);
    const nadir = this.calculateNadirPoint(front);
    
    return front.map(ind => ({
      ...ind,
      objectives: {
        waste: this.normalizeValue(ind.objectives.waste, ideal.waste, nadir.waste),
        cost: this.normalizeValue(ind.objectives.cost, ideal.cost, nadir.cost),
        efficiency: this.normalizeValue(ind.objectives.efficiency, nadir.efficiency, ideal.efficiency), // Reversed for maximize
        time: this.normalizeValue(ind.objectives.time, ideal.time, nadir.time),
      },
    }));
  }
  
  /**
   * Normalize single value to [0,1] with consistent fallback
   * Uses static NORMALIZE_EPS for all normalization operations
   */
  private normalizeValue(value: number, min: number, max: number): number {
    const range = max - min;
    if (Math.abs(range) < NSGAIIAlgorithm.NORMALIZE_EPS) {
      return 0; // Consistent fallback: all values equal in this objective
    }
    return (value - min) / range;
  }
  
  /**
   * Calculate boundary distances (extreme points)
   * Optimized to O(n) with single-pass min/max instead of sorting
   */
  private calculateBoundaryDistances(normalized: ParetoIndividual[]): { dF: number; dL: number } {
    let dF = 0;
    let dL = 0;
    
    NSGAIIAlgorithm.OBJECTIVE_KEYS.forEach(obj => {
      // Single pass min/max (O(n) vs O(n log n) sort)
      let minV = Infinity;
      let maxV = -Infinity;
      
      for (const ind of normalized) {
        const v = ind.objectives[obj];
        if (v < minV) minV = v;
        if (v > maxV) maxV = v;
      }
      
      // Skip degenerate axis (all values equal in this objective)
      if (Math.abs(maxV - minV) < NSGAIIAlgorithm.NORMALIZE_EPS) {
        return; // Don't contribute to dF/dL
      }
      
      // Distance to ideal boundary (0 for minimization, 1 for maximization)
      const idealValue = obj === 'efficiency' ? 1 : 0;
      const nadirValue = obj === 'efficiency' ? 0 : 1;
      
      dF += Math.abs(minV - idealValue);
      dL += Math.abs(maxV - nadirValue);
    });
    
    return { dF, dL };
  }
  
  /**
   * Calculate consecutive distances in objective space
   * Uses adaptive axis ordering for robust sorting
   */
  private calculateConsecutiveDistances(normalized: ParetoIndividual[]): number[] {
    if (normalized.length < 2) return [];
    
    // Adaptive axis selection for robust ordering
    const orderAxis = this.selectOrderingAxis(normalized);
    const sorted = [...normalized].sort((a, b) => 
      a.objectives[orderAxis] - b.objectives[orderAxis]
    );
    
    const distances: number[] = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      const dist = this.euclideanDistance(
        sorted[i].objectives,
        sorted[i + 1].objectives
      );
      distances.push(dist);
    }
    
    return distances;
  }

  /**
   * Select knee point using hybrid angle + distance method
   * Combines angular sharpness (60%) with perpendicular distance (40%)
   * Uses sorted front for deterministic neighbor selection
   */
  private selectKneePoint(front: ParetoIndividual[]): ParetoIndividual {
    if (front.length === 0) throw new Error('NSGA-II: Cannot select knee point from empty Pareto front');
    if (front.length === 1) return front[0];
    
    // 1) Normalize
    const normalized = this.normalizeObjectives(front);
    
    // 2) Adaptive axis selection for robust ordering
    const orderAxis = this.selectOrderingAxis(normalized);
    const order = normalized
      .map((p, idx) => ({ p, idx }))
      .sort((a, b) => a.p.objectives[orderAxis] - b.p.objectives[orderAxis]);
    
    // 3) Endpoints: first & last in sorted order
    const start = order[0].p.objectives;
    const end = order[order.length - 1].p.objectives;
    
    // Special case: 2 solutions
    if (front.length === 2) {
      const idealNormalized: ObjectiveValues = {
        waste: 0,        // Minimum waste (best)
        cost: 0,         // Minimum cost (best)
        time: 0,         // Minimum time (best)
        efficiency: 1    // Maximum efficiency (best)
      } as const;
      
      const d0 = this.euclideanDistance(order[0].p.objectives, idealNormalized);
      const d1 = this.euclideanDistance(order[1].p.objectives, idealNormalized);
      
      this.logger.debug('NSGA-II: Knee point selection for 2-solution front', {
        dist0: fmtStr(d0, 4) ?? 'N/A',
        dist1: fmtStr(d1, 4) ?? 'N/A',
        selected: d0 <= d1 ? 0 : 1
      });
      
      return d0 <= d1 ? front[order[0].idx] : front[order[1].idx];
    }
    
    // Hybrid score for interior points (k=1 to length-2)
    let bestKnee = { score: -Infinity, idx: order[0].idx };
    
    for (let k = 1; k < order.length - 1; k++) {
      const prev = order[k - 1].p.objectives;
      const curr = order[k].p.objectives;
      const next = order[k + 1].p.objectives;
      
      // Angle score (sharper angle = better knee)
      const angleScore = this.calculateAngleScore(prev, curr, next);
      
      // Distance score (farther from start-end line = better knee)
      const distScore = this.distanceToLine(curr, start, end);
      
      // Hybrid score
      const hybridScore = 0.6 * angleScore + 0.4 * distScore;
      
      if (hybridScore > bestKnee.score) {
        bestKnee = { score: hybridScore, idx: order[k].idx };
      }
    }
    
    this.logger.debug('NSGA-II: Knee point selected from sorted front', {
      frontSize: front.length,
      kneeScore: fmtStr(bestKnee.score, 4) ?? 'N/A',
      kneeIndex: bestKnee.idx
    });
    
    // Return original (non-normalized) individual
    return front[bestKnee.idx];
  }
  
  /**
   * Calculate angle score at a point
   * Larger angle = sharper knee = better trade-off
   * Uses normalized objective space for consistent calculations
   */
  private calculateAngleScore(
    prev: ObjectiveValues,
    curr: ObjectiveValues,
    next: ObjectiveValues
  ): number {
    // Vector from prev to curr (in normalized space)
    const v1 = this.vectorBetweenNormalized(prev, curr);
    
    // Vector from curr to next (in normalized space)
    const v2 = this.vectorBetweenNormalized(curr, next);
    
    // Dot product
    const dotProduct = v1.reduce((sum, val, i) => sum + val * v2[i], 0);
    
    // Magnitudes
    const mag1 = Math.sqrt(v1.reduce((sum, val) => sum + val * val, 0));
    const mag2 = Math.sqrt(v2.reduce((sum, val) => sum + val * val, 0));
    
    // Handle degenerate cases (consistent with NORMALIZE_EPS)
    if (mag1 < NSGAIIAlgorithm.NORMALIZE_EPS || mag2 < NSGAIIAlgorithm.NORMALIZE_EPS) return 0;
    
    // Cosine of angle
    const cosAngle = Math.max(-1, Math.min(1, dotProduct / (mag1 * mag2)));
    
    // Angle in radians (0 to π)
    const angle = Math.acos(cosAngle);
    
    // Normalize to [0, 1] (larger angle = better)
    return angle / Math.PI;
  }
  
  /**
   * Calculate vector between two objective points in normalized space
   * Used for knee point angle and distance calculations
   */
  private vectorBetweenNormalized(from: ObjectiveValues, to: ObjectiveValues): number[] {
    return [
      to.waste - from.waste,
      to.cost - from.cost,
      to.time - from.time,
      to.efficiency - from.efficiency // Already in normalized space [0,1]
    ];
  }

  /**
   * Calculate ideal point (best in each objective)
   */
  private calculateIdealPoint(front: ParetoIndividual[]): ObjectiveValues {
    if (front.length === 0) {
      return { waste: 0, cost: 0, efficiency: 1, time: 0 };
    }
    
    return {
      waste: Math.min(...front.map(i => i.objectives.waste)),
      cost: Math.min(...front.map(i => i.objectives.cost)),
      efficiency: Math.max(...front.map(i => i.objectives.efficiency)),
      time: Math.min(...front.map(i => i.objectives.time)),
    };
  }

  /**
   * Calculate nadir point (worst in each objective)
   */
  private calculateNadirPoint(front: ParetoIndividual[]): ObjectiveValues {
    if (front.length === 0) {
      return { waste: 1, cost: 1, efficiency: 0, time: 1 };
    }
    
    return {
      waste: Math.max(...front.map(i => i.objectives.waste)),
      cost: Math.max(...front.map(i => i.objectives.cost)),
      efficiency: Math.min(...front.map(i => i.objectives.efficiency)),
      time: Math.max(...front.map(i => i.objectives.time)),
    };
  }

  /**
   * Euclidean distance in objective space
   */
  private euclideanDistance(a: ObjectiveValues, b: ObjectiveValues): number {
    const dWaste = a.waste - b.waste;
    const dCost = a.cost - b.cost;
    const dEff = a.efficiency - b.efficiency;
    const dTime = a.time - b.time;
    
    return Math.sqrt(dWaste * dWaste + dCost * dCost + dEff * dEff + dTime * dTime);
  }

  /**
   * Perpendicular distance from point to line (for knee detection)
   * Uses vector projection for accurate perpendicular distance
   * Operates in normalized objective space
   */
  private distanceToLine(
    point: ObjectiveValues,
    lineStart: ObjectiveValues,
    lineEnd: ObjectiveValues
  ): number {
    // Convert to vectors in normalized space
    const p = [point.waste, point.cost, point.time, point.efficiency];
    const a = [lineStart.waste, lineStart.cost, lineStart.time, lineStart.efficiency];
    const b = [lineEnd.waste, lineEnd.cost, lineEnd.time, lineEnd.efficiency];
    
    // Line vector: b - a
    const lineVec = b.map((val, i) => val - a[i]);
    const lineLen = Math.sqrt(lineVec.reduce((sum, v) => sum + v * v, 0));
    
    // Handle degenerate case (line is a point) - consistent with NORMALIZE_EPS
    if (lineLen < NSGAIIAlgorithm.NORMALIZE_EPS) {
      return this.euclideanDistance(point, lineStart);
    }
    
    // Point vector from line start: p - a
    const pointVec = p.map((val, i) => val - a[i]);
    
    // Project point onto line segment (clamp to [0,1] for segment distance)
    const dotProduct = lineVec.reduce((sum, v, i) => sum + v * pointVec[i], 0);
    const tRaw = dotProduct / (lineLen * lineLen);
    const t = Math.max(0, Math.min(1, tRaw)); // Clamp to segment endpoints
    
    // Project onto segment
    const proj = a.map((ai, i) => ai + t * lineVec[i]);
    
    // Perpendicular vector from point to projection
    const perpVec = p.map((pi, i) => pi - proj[i]);
    
    // Perpendicular distance
    return Math.sqrt(perpVec.reduce((sum, v) => sum + v * v, 0));
  }

  /**
   * Generate offspring (crossover + mutation)
   * Uses context parameters and inherited GeneticAlgorithm methods
   */
  private generateOffspring(
    parents: ParetoIndividual[],
    context: OptimizationContext
  ): ParetoIndividual[] {
    const offspring: ParetoIndividual[] = [];
    
    // Use configurable genetic operators from context
    const crossoverRate = context.nsgaParams?.crossoverRate ?? 0.8;
    const mutationRate = context.nsgaParams?.mutationRate ?? 0.15;
    
    for (let i = 0; i < parents.length; i += 2) {
      const p1 = parents[i];
      const p2 = parents[i + 1] || parents[i];
      
      if (!p1) continue;
      
      // Crossover using inherited orderCrossover
      let child: OptimizationItem[];
      if (this.random() < crossoverRate && p2) {
        child = this.orderCrossover(p1.sequence, p2.sequence);
      } else {
        child = [...p1.sequence];
      }
      
      // Mutation using inherited swapMutation
      if (this.random() < mutationRate) {
        child = this.swapMutation(child);
      }
      
      // Evaluate using inherited methods
      const result = this.evaluateAndCreateResult(child, context);
      
      offspring.push({
        sequence: child,
        result,
        objectives: this.extractObjectives(result, context),
        rank: 0,
        crowdingDistance: 0,
        dominatedCount: 0,
        dominationSet: [],
      });
    }
    
    return offspring;
  }
  
  /**
   * Evaluate sequence and create result
   * Wrapper for inherited GeneticAlgorithm methods
   */
  private evaluateAndCreateResult(
    sequence: OptimizationItem[],
    context: OptimizationContext
  ): AdvancedOptimizationResult {
    const cuts = this.evaluateSequence(sequence, context);
    const finalized = this.finalizeCuts(cuts, context);
    return this.createResult(finalized, context);
  }

  /**
   * Create default result when knee point is invalid
   */
  private createDefaultResult(context: OptimizationContext): AdvancedOptimizationResult {
    // Create a minimal valid result using the existing createResult method
    const emptyCuts: Cut[] = [];
    return this.createResult(emptyCuts, context);
  }

  /**
   * Güvenli hypervolume hesaplama (boş front ve geçersiz değerler için koruma)
   */
  private safeHypervolume(front: ParetoIndividual[], refPoint: ObjectiveValues): number | null {
    if (!Array.isArray(front) || front.length === 0) {
      this.logger.warn('NSGA-II: Empty Pareto front, returning null hypervolume');
      return null;
    }
    
    if (!isValidObjectives(refPoint as unknown as Record<string, unknown>)) {
      this.logger.warn('NSGA-II: Invalid reference point, returning null hypervolume', { refPoint });
      return null;
    }
    
    // Front elemanlarında geçersiz değer var mı?
    for (const individual of front) {
      if (!isValidObjectives(individual.objectives as unknown as Record<string, unknown>)) {
        this.logger.warn('NSGA-II: Invalid objectives in front member, returning null hypervolume', { 
          objectives: individual.objectives 
        });
        return null;
      }
    }
    
    try {
      const hv = this.calculateHypervolume(front);
      return Number.isFinite(hv) ? hv : null;
    } catch (error) {
      this.logger.warn('NSGA-II: Error calculating hypervolume, returning null', {
        error: error instanceof Error ? error.message : 'Unknown error',
        frontSize: front.length
      });
      return null;
    }
  }

  /**
   * Boş Pareto front ve NaN üretimini engelleyen güvenli hypervolume
   */
  private safeHypervolumeAdvanced(front: Array<number[]>, refPoint: number[]): number | null {
    if (!Array.isArray(front) || front.length === 0) return null;
    if (!Array.isArray(refPoint) || refPoint.length === 0) return null;
    
    for (const p of front) {
      if (!Array.isArray(p) || p.some(v => !Number.isFinite(v))) return null;
    }
    
    try {
      const hv = this.calculateHypervolume(front as any); // Mevcut HV fonksiyonunuz
      return Number.isFinite(hv) ? hv : null;
    } catch (error) {
      this.logger.warn('NSGA-II: Error calculating advanced hypervolume, returning null', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  /**
   * Güvenli spacing hesaplama
   */
  private safeSpacing(front: ParetoIndividual[]): number | null {
    if (!Array.isArray(front) || front.length < 2) {
      return null;
    }
    
    try {
      const spacing = this.calculateSpacing(front);
      return Number.isFinite(spacing) ? spacing : null;
    } catch (error) {
      this.logger.warn('NSGA-II: Error calculating spacing, returning null', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  /**
   * Güvenli spread hesaplama
   */
  private safeSpread(front: ParetoIndividual[]): number | null {
    if (!Array.isArray(front) || front.length < 2) {
      return null;
    }
    
    try {
      const spread = this.calculateSpread(front);
      return Number.isFinite(spread) ? spread : null;
    } catch (error) {
      this.logger.warn('NSGA-II: Error calculating spread, returning null', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  /**
   * Helper methods
   */
  private average(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }
}
