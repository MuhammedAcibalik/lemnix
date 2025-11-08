/**
 * LEMNİX Advanced Optimization Service (Refactored)
 * Thin orchestrator for algorithm execution
 * 
 * @module optimization
 * @version 5.0.0 - Modular Architecture
 * @architecture Thin orchestrator + Factory pattern
 * 
 * Changes from v4:
 * - Algorithms extracted to separate classes
 * - Helpers extracted to utility classes  
 * - Service now only orchestrates
 * - Full SOLID compliance
 */

import { performance } from 'node:perf_hooks';
import { OptimizationItem, MaterialStockLength, OptimizationAlgorithm, ProfileType } from '../../types';
import { ILogger, NoOpLogger } from '../logger';
import { toFixedOrNA, toRoundedOrNull, safeAverage, fmt, toFiniteNumber, fmtNum, fmtStr } from '../../utils/number';
import { AlgorithmFactory } from './core/AlgorithmFactory';
import { OptimizationContext } from './core/OptimizationContext';
import { 
  AdvancedOptimizationResult, 
  AdvancedOptimizationParams,
  EnhancedConstraints,
  CostModel,
  AlgorithmLabel
} from './types';
import { TheoreticalMinimumCalculator } from './utils/TheoreticalMinimumCalculator';
import { ProfileResolverService } from '../ProfileResolverService';
import { PrismaClient } from '@prisma/client';

// Import algorithm implementations
import { FFDAlgorithm } from './algorithms/FFDAlgorithm';
import { BFDAlgorithm } from './algorithms/BFDAlgorithm';
import { GeneticAlgorithm } from './algorithms/GeneticAlgorithm';
import { PoolingAlgorithm } from './algorithms/PoolingAlgorithm';
import { PatternExactAlgorithm } from './algorithms/PatternExactAlgorithm';
import type { AlgorithmMetadata } from './core/IOptimizationAlgorithm';
import type { BaseAlgorithm } from './core/BaseAlgorithm';

// Import NSGA-II and smart selector
import { NSGAIIAlgorithm, type ParetoOptimizationResult } from './algorithms/advanced/NSGAII';
import { SmartAlgorithmSelector, type AlgorithmMode } from './AlgorithmFactory';

/**
 * Real data access interfaces (optional)
 */
export interface DataProvider {
  getOptimizationItems(params?: { workOrderIds?: string[]; profileTypes?: string[] }): Promise<ReadonlyArray<OptimizationItem>>;
  getMaterialStockLengths(): Promise<ReadonlyArray<MaterialStockLength>>;
  getConstraints(): Promise<EnhancedConstraints>;
  getWorkOrderItems(workOrderId: string): Promise<ReadonlyArray<OptimizationItem>>;
}

export interface RealDataParams {
  items?: ReadonlyArray<OptimizationItem>;
  materialStockLengths?: ReadonlyArray<MaterialStockLength>;
  constraints?: EnhancedConstraints;
  provider?: DataProvider;
}

/**
 * Advanced Optimization Service (Thin Orchestrator)
 */
export class AdvancedOptimizationService {
  private readonly logger: ILogger;
  private readonly algorithmFactory: AlgorithmFactory;
  private readonly smartSelector: SmartAlgorithmSelector;
  private readonly profileResolver: ProfileResolverService | null;
  private readonly defaultConstraints: EnhancedConstraints;
  private readonly defaultCostModel: CostModel;
  private sequenceCounter = 0;

  constructor(logger?: ILogger, prisma?: PrismaClient) {
    this.logger = logger || new NoOpLogger();
    this.algorithmFactory = new AlgorithmFactory(this.logger);
    this.smartSelector = new SmartAlgorithmSelector(this.logger);
    this.profileResolver = prisma ? new ProfileResolverService(prisma, this.logger) : null;
    this.defaultConstraints = this.getDefaultConstraints();
    this.defaultCostModel = this.getDefaultCostModel();
    
    this.registerAlgorithms();
    this.logger.info('AdvancedOptimizationService initialized (v5.0.0 + Hybrid Algorithm Support + Profile Management)');
  }

  /**
   * Register all available algorithms
   */
  private registerAlgorithms(): void {
    // Register FFD
    this.algorithmFactory.register(FFDAlgorithm, {
      name: OptimizationAlgorithm.FIRST_FIT_DECREASING,
      displayName: 'First Fit Decreasing (FFD)',
      description: 'Industry-standard bin packing, balanced quality/speed',
      complexity: 'O(n²)',
      scalability: 8,
      recommendedFor: ['General-purpose', 'Balanced optimization', 'Medium-large datasets'],
      notRecommendedFor: ['Very large datasets (>5000 items)', 'Real-time requirements']
    } satisfies AlgorithmMetadata);

    // Register BFD
    this.algorithmFactory.register(BFDAlgorithm, {
      name: OptimizationAlgorithm.BEST_FIT_DECREASING,
      displayName: 'Best Fit Decreasing (BFD)',
      description: 'Minimizes waste per placement, quality-focused',
      complexity: 'O(n²)',
      scalability: 8,
      recommendedFor: ['Waste minimization', 'Quality over speed', 'High-value materials'],
      notRecommendedFor: ['Very large datasets', 'Real-time optimization']
    } satisfies AlgorithmMetadata);

    // Register Genetic
    this.algorithmFactory.register(GeneticAlgorithm, {
      name: OptimizationAlgorithm.GENETIC_ALGORITHM,
      displayName: 'Genetic Algorithm (GPU-Accelerated)',
      description: 'Evolutionary optimization with WebGPU support',
      complexity: 'O(n²)',
      scalability: 7,
      recommendedFor: ['Complex problems', 'GPU available', 'Quality-focused', 'Multi-objective'],
      notRecommendedFor: ['Small datasets (<20 items)', 'No GPU available', 'Real-time requirements']
    } satisfies AlgorithmMetadata);

    // Register Pooling
    this.algorithmFactory.register(PoolingAlgorithm, {
      name: OptimizationAlgorithm.PROFILE_POOLING,
      displayName: 'Profile Pooling',
      description: 'Same-profile consolidation for multi-work-order optimization',
      complexity: 'O(n²)',
      scalability: 8,
      recommendedFor: ['Multi-work-order', 'Same-profile items', 'Batch optimization'],
      notRecommendedFor: ['Single work order', 'Diverse profiles', 'Real-time optimization']
    } satisfies AlgorithmMetadata);

    // Register Pattern Exact
    this.algorithmFactory.register(PatternExactAlgorithm, {
      name: OptimizationAlgorithm.PATTERN_EXACT,
      displayName: 'Pattern Exact Search',
      description: 'Exact pattern-based optimization with guaranteed minimum stocks and waste',
      complexity: 'O(2^n)',
      scalability: 7,
      recommendedFor: ['Exact solutions', 'Guaranteed optimality', 'Small-medium problems (<100 items)', 'Critical waste minimization'],
      notRecommendedFor: ['Very large problems (>200 items)', 'Real-time optimization', 'Single stock length only']
    } satisfies AlgorithmMetadata);

    this.logger.info('Registered algorithms', {
      count: this.algorithmFactory.getRegisteredAlgorithms().length,
      algorithms: this.algorithmFactory.getRegisteredAlgorithms()
    });
  }

  /**
   * Main optimization entry point with algorithm mode support
   */
  public async optimize(
    items: OptimizationItem[],
    params: AdvancedOptimizationParams,
    materialStockLengths?: MaterialStockLength[],
    realDataParams?: RealDataParams,
    profileParams?: {
      workOrderId?: string;
      profileType?: string;
      weekNumber?: number;
      year?: number;
    }
  ): Promise<AdvancedOptimizationResult> {
    const startTime = performance.now();
    const requestId = this.generateRequestId();

    this.logger.info('Starting optimization', {
      requestId,
      algorithm: params.algorithm,
      items: items.length,
      objectives: params.objectives.length,
      profileParams
    });

    try {
      // Validate algorithm
      if (!this.algorithmFactory.isRegistered(this.mapLabelToEnum(params.algorithm))) {
        throw new Error(`Algorithm '${params.algorithm}' not registered. Available: ${this.algorithmFactory.getRegisteredAlgorithms().join(', ')}`);
      }

      // Resolve profile-based stock lengths if profile parameters provided
      let resolvedStockLengths = materialStockLengths;
      let profileInfo: {
        profileId: string;
        profileCode: string;
        profileName: string;
        source: 'mapping' | 'fallback';
      } | null = null;

      if (this.profileResolver && profileParams?.workOrderId && profileParams?.profileType) {
        const profileResult = await this.profileResolver.resolveProfileForWorkOrder({
          workOrderId: profileParams.workOrderId,
          profileType: profileParams.profileType,
          weekNumber: profileParams.weekNumber,
          year: profileParams.year
        });

        if (profileResult) {
          this.logger.info('[Optimization] Profile resolved', {
            profileCode: profileResult.profileCode,
            profileName: profileResult.profileName,
            source: profileResult.source,
            stockLengths: profileResult.stockLengths
          });

          // Override stock lengths with profile-specific lengths
          // Create proper MaterialStockLength objects
          resolvedStockLengths = profileResult.stockLengths.map(length => ({
            profileType: (profileParams?.profileType || 'Unknown') as ProfileType,
            stockLength: length,
            availability: 1000, // Default availability
            costPerMm: 0.1, // Default cost
            costPerStock: length * 0.1, // Default total cost
            materialGrade: 'Standard',
            weight: length * 0.5 / 1000 // Approximate weight
          }));

          profileInfo = {
            profileId: profileResult.profileId,
            profileCode: profileResult.profileCode,
            profileName: profileResult.profileName,
            source: profileResult.source
          };
        } else {
          this.logger.warn('[Optimization] No profile found, using default stock lengths', {
            workOrderId: profileParams.workOrderId,
            profileType: profileParams.profileType
          });
        }
      }

      // Merge constraints with defaults
      const constraints = this.mergeConstraints(params.constraints);

      // Build optimization context
      const context = new OptimizationContext({
        items,
        materialStockLengths: resolvedStockLengths ?? undefined,
        constraints,
        objectives: params.objectives,
        performance: params.performance,
        costModel: params.costModel || this.defaultCostModel,
        logger: this.logger,
        startTime,
        requestId
      });

      // Get algorithm instance
      const algorithmEnum = this.mapLabelToEnum(params.algorithm);
      const algorithm = this.algorithmFactory.create(algorithmEnum);

      // Run optimization
      const result = await algorithm.optimize(context);

      // Validate result against theoretical minimum
      this.validateResult(result, items, context);

      // Add profile information to metadata if available
      const enhancedMetadata = profileInfo
        ? {
            ...result.metadata,
            profile: {
              profileId: profileInfo.profileId,
              profileCode: profileInfo.profileCode,
              profileName: profileInfo.profileName,
              source: profileInfo.source,
              stockLengths: resolvedStockLengths?.map(sl => sl.stockLength) ?? []
            }
          }
        : result.metadata;

      const enhancedResult: AdvancedOptimizationResult = {
        ...result,
        metadata: enhancedMetadata as typeof result.metadata
      };

      const executionTime = performance.now() - startTime;
      this.logger.info('Optimization completed', {
        requestId,
        algorithm: params.algorithm,
        executionTime: fmtStr(executionTime, 2) ?? '0.00',
        efficiency: fmtStr(result.efficiency, 2) ?? '0.00',
        cuts: result.cuts.length,
        profileUsed: profileInfo ? `${profileInfo.profileCode} (${profileInfo.source})` : 'none'
      });

      return enhancedResult;
    } catch (error) {
      this.logger.error('Optimization failed', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw new Error(`Optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`, { cause: error });
    }
  }

  /**
   * Validate optimization result against theoretical minimum
   * 
   * @param result - Optimization result to validate
   * @param items - Original items that were optimized
   * @param context - Optimization context
   */
  private validateResult(
    result: AdvancedOptimizationResult,
    items: OptimizationItem[],
    context: OptimizationContext
  ): void {
    const theoreticalMin = TheoreticalMinimumCalculator.calculateMinimumStock(
      items,
      context.stockLengths,
      context.constraints
    );
    
    const totalCuts = result.cuts.length;
    const totalSegments = result.cuts.reduce((sum, cut) => sum + cut.segmentCount, 0);
    const expectedSegments = items.reduce((sum, item) => sum + item.quantity, 0);
    
    // Check 1: No deficits (allow minimal overproduction)
    if (totalSegments < expectedSegments) {
      this.logger.error(`Missing items: ${expectedSegments - totalSegments} items not placed`, {
        totalSegments,
        expectedSegments,
        missingItems: expectedSegments - totalSegments
      });
      throw new Error(`Missing items: ${expectedSegments - totalSegments} items not placed`);
    }
    if (totalSegments > expectedSegments) {
      this.logger.warn(`Overproduction detected: +${totalSegments - expectedSegments} segments`, {
        totalSegments,
        expectedSegments,
        overProduced: totalSegments - expectedSegments
      });
    }
    
    // Check 2: Not grossly over minimum
    if (totalCuts > theoreticalMin.minStockCount * 2) {
      this.logger.warn(`Algorithm used ${totalCuts} cuts, theoretical minimum is ${theoreticalMin.minStockCount} (${Math.round((totalCuts / theoreticalMin.minStockCount - 1) * 100)}% over)`, {
        actualCuts: totalCuts,
        theoreticalMin: theoreticalMin.minStockCount,
        overheadPercentage: Math.round((totalCuts / theoreticalMin.minStockCount - 1) * 100)
      });
    }
    
    // Check 3: Total length reasonable
    const totalUsed = result.cuts.reduce((sum, cut) => sum + cut.stockLength, 0);
    if (totalUsed > theoreticalMin.totalRequired * 1.5) {
      this.logger.warn(`Total stock used ${totalUsed}mm is ${Math.round((totalUsed / theoreticalMin.totalRequired - 1) * 100)}% over theoretical ${theoreticalMin.totalRequired}mm`, {
        totalUsed,
        theoreticalRequired: theoreticalMin.totalRequired,
        overheadPercentage: Math.round((totalUsed / theoreticalMin.totalRequired - 1) * 100)
      });
    }
    
    this.logger.info('Result validation completed', {
      totalCuts,
      theoreticalMin: theoreticalMin.minStockCount,
      overheadPercentage: Math.round((totalCuts / theoreticalMin.minStockCount - 1) * 100),
      totalUsed,
      theoreticalRequired: theoreticalMin.totalRequired
    });
  }

  /**
   * Optimize with smart algorithm selection
   * Uses SmartAlgorithmSelector for hybrid approach
   * 
   * @param items - Items to optimize
   * @param params - Optimization parameters
   * @param mode - Algorithm mode (standard/advanced/auto)
   * @param materialStockLengths - Available stock lengths
   * @returns Optimization result (knee point for advanced mode)
   */
  public async optimizeWithMode(
    items: OptimizationItem[],
    params: AdvancedOptimizationParams,
    mode: AlgorithmMode = 'standard',
    materialStockLengths?: MaterialStockLength[],
    profileParams?: {
      workOrderId?: string;
      profileType?: string;
      weekNumber?: number;
      year?: number;
    }
  ): Promise<AdvancedOptimizationResult> {
    const startTime = performance.now();
    const requestId = this.generateRequestId();

    // Validate inputs
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('Items array is required and must not be empty');
    }

    if (!params || !params.objectives || !Array.isArray(params.objectives) || params.objectives.length === 0) {
      throw new Error('Objectives array is required and must not be empty');
    }

    this.logger.info('Starting optimization with mode selection', {
      requestId,
      mode,
      items: items.length,
      itemsDetail: items.map(item => ({ profileType: item.profileType, length: item.length, quantity: item.quantity, workOrderId: item.workOrderId })),
      objectives: params.objectives.length,
      profileParams
    });

    try {
      const constraints = this.mergeConstraints(params.constraints);

      // Resolve profile-based stock lengths if profile parameters provided
      let resolvedStockLengths = materialStockLengths;
      let profileInfo: {
        profileId: string;
        profileCode: string;
        profileName: string;
        source: 'mapping' | 'fallback';
      } | null = null;

      if (this.profileResolver && profileParams?.workOrderId && profileParams?.profileType) {
        this.logger.info('[optimizeWithMode] 🔍 ProfileResolver çalışıyor', {
          workOrderId: profileParams.workOrderId,
          profileType: profileParams.profileType,
          weekNumber: profileParams.weekNumber,
          year: profileParams.year
        });
        
        const profileResult = await this.profileResolver.resolveProfileForWorkOrder({
          workOrderId: profileParams.workOrderId,
          profileType: profileParams.profileType,
          weekNumber: profileParams.weekNumber,
          year: profileParams.year
        });
        
        this.logger.info('[optimizeWithMode] 🔍 ProfileResult:', {
          found: !!profileResult,
          profileCode: profileResult?.profileCode,
          profileName: profileResult?.profileName,
          source: profileResult?.source,
          stockLengths: profileResult?.stockLengths
        });

        if (profileResult) {
          this.logger.info('[Optimization] Profile resolved', {
            profileCode: profileResult.profileCode,
            profileName: profileResult.profileName,
            source: profileResult.source,
            stockLengths: profileResult.stockLengths
          });

          // Override stock lengths with profile-specific lengths
          resolvedStockLengths = profileResult.stockLengths.map(length => ({
            profileType: (profileParams?.profileType || 'Unknown') as ProfileType,
            stockLength: length,
            availability: 1000,
            costPerMm: 0.1,
            costPerStock: length * 0.1,
            materialGrade: 'Standard',
            weight: length * 0.5 / 1000
          }));

          profileInfo = {
            profileId: profileResult.profileId,
            profileCode: profileResult.profileCode,
            profileName: profileResult.profileName,
            source: profileResult.source
          };
        } else {
          this.logger.warn('[Optimization] No profile found, using default stock lengths', {
            workOrderId: profileParams.workOrderId,
            profileType: profileParams.profileType
          });
        }
      }

      // 🔍 DEBUG: Context oluşturma öncesi kontrol
      this.logger.debug('AdvancedOptimizationService DEBUG - Context creation:', {
        itemsCount: items.length,
        materialStockLengths: resolvedStockLengths?.map(s => ({ stockLength: s.stockLength, availability: s.availability })),
        constraints: {
          kerfWidth: constraints.kerfWidth,
          startSafety: constraints.startSafety,
          endSafety: constraints.endSafety,
          minScrapLength: constraints.minScrapLength
        },
        selectedAlgorithm: params.algorithm
      });

      const context = new OptimizationContext({
        items,
        materialStockLengths: resolvedStockLengths ?? undefined,
        constraints,
        objectives: params.objectives,
        performance: params.performance,
        costModel: params.costModel || this.defaultCostModel,
        logger: this.logger,
        startTime,
        requestId,
      });

      // ✅ FIX: Use user's selected algorithm instead of smart selector
      let algorithm: BaseAlgorithm;
      
      // Convert string algorithm to lowercase for comparison
      const selectedAlgo = (params.algorithm as string).toLowerCase();
      
      this.logger.info('[AdvancedOptimizationService] Algorithm selection', {
        originalAlgorithm: params.algorithm,
        selectedAlgo,
        mode
      });
      
      if (selectedAlgo === 'bfd') {
        this.logger.info('Using BFD algorithm (user selected)', { itemCount: items.length, selectedAlgo, originalAlgorithm: params.algorithm });
        algorithm = new BFDAlgorithm(this.logger);
      } else if (selectedAlgo === 'ffd') {
        this.logger.info('Using FFD algorithm (user selected)', { itemCount: items.length });
        algorithm = new FFDAlgorithm(this.logger);
      } else if (selectedAlgo === 'genetic') {
        this.logger.info('Using Genetic algorithm (user selected)', { itemCount: items.length });
        algorithm = new GeneticAlgorithm(this.logger);
      } else if (selectedAlgo === 'pooling') {
        this.logger.info('Using Pooling algorithm (user selected)', { itemCount: items.length });
        algorithm = new PoolingAlgorithm(this.logger);
      } else if (selectedAlgo === 'pattern-exact') {
        this.logger.info('Using Pattern Exact algorithm (user selected)', { itemCount: items.length });
        algorithm = new PatternExactAlgorithm(this.logger);
      } else if (mode === 'advanced') {
        this.logger.info('Using NSGA-II (advanced mode)', { itemCount: items.length });
        algorithm = new NSGAIIAlgorithm(this.logger);
      } else {
        // Fallback to smart selector
        this.logger.info('Using SmartAlgorithmSelector (fallback)', { itemCount: items.length, mode, selectedAlgo });
        algorithm = this.smartSelector.selectAlgorithm(context, mode);
      }

      // Run optimization (returns knee point for NSGA-II)
      const result = await algorithm.optimize(context);

      // Add profile information to metadata if available
      const enhancedMetadata = profileInfo
        ? {
            ...result.metadata,
            profile: {
              profileId: profileInfo.profileId,
              profileCode: profileInfo.profileCode,
              profileName: profileInfo.profileName,
              source: profileInfo.source,
              stockLengths: resolvedStockLengths?.map(sl => sl.stockLength) ?? []
            }
          }
        : result.metadata;

      const enhancedResult = {
        ...result,
        metadata: enhancedMetadata as typeof result.metadata
      };

      const executionTime = performance.now() - startTime;
      this.logger.info('Optimization with mode completed', {
        requestId,
        mode,
        selectedAlgorithm: algorithm.name,
        executionTime: fmtStr(executionTime, 2) ?? '0.00',
        efficiency: fmtStr(result.efficiency, 2) ?? '0.00',
        cuts: result.cuts.length,
        profileUsed: profileInfo ? `${profileInfo.profileCode} (${profileInfo.source})` : 'none'
      });

      // ✅ FIX: Add algorithm enum to result
      return {
        ...enhancedResult,
        algorithm: this.mapLabelToEnum(params.algorithm)
      };
    } catch (error) {
      this.logger.error('Optimization with mode failed', {
        requestId,
        mode,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new Error(
        `Optimization with mode failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { cause: error }
      );
    }
  }

  /**
   * Advanced multi-objective optimization
   * Returns full Pareto front (NSGA-II only)
   * 
   * @param items - Items to optimize
   * @param params - Optimization parameters
   * @param materialStockLengths - Available stock lengths
   * @returns Pareto optimization result with full front
   */
  public async optimizeMultiObjective(
    items: OptimizationItem[],
    params: AdvancedOptimizationParams,
    materialStockLengths?: MaterialStockLength[]
  ): Promise<ParetoOptimizationResult> {
    const startTime = performance.now();
    const requestId = this.generateRequestId();

    this.logger.info('Starting multi-objective optimization (NSGA-II)', {
      requestId,
      items: items.length,
      objectives: params.objectives.length,
    });

    try {
      const constraints = this.mergeConstraints(params.constraints);

      const context = new OptimizationContext({
        items,
        materialStockLengths: materialStockLengths ?? undefined,
        constraints,
        objectives: params.objectives,
        performance: params.performance,
        costModel: params.costModel || this.defaultCostModel,
        logger: this.logger,
        startTime,
        requestId,
      });

      // Create NSGA-II instance
      const nsgaII = new NSGAIIAlgorithm(this.logger);

      // Run multi-objective optimization
      const result = await nsgaII.optimizeMultiObjective(context);

      const executionTime = performance.now() - startTime;
      // Anlık teşhis log'u (geçici)
      this.logger.error('[MO-FAIL preflight]', {
        hypervolume_raw: result.hypervolume,
        spread_raw: result.spread,
        spacing_raw: result.spacing,
        paretoFrontSize: result.frontSize ?? null,
        requestId: requestId ?? null,
        resultKeys: Object.keys(result)
      });

      // Güvenli biçimlendirme - tüm .toFixed çağrıları kaldırıldı
      const hv = fmtNum(result.hypervolume, 4);
      const spread = fmtNum(result.spread, 4);
      const spacing = fmtNum(result.spacing, 4);

      this.logger.info('Multi-objective optimization completed', {
        requestId,
        frontSize: result.frontSize || 0,
        hypervolume: hv,
        spread: spread,
        spacing: spacing,
        executionTime: fmtStr(executionTime, 2) ?? '0.00',
      });

      return result;
    } catch (error) {
      this.logger.error('Multi-objective optimization failed', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new Error(
        `Multi-objective optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { cause: error }
      );
    }
  }

  /**
   * Get default constraints
   */
  private getDefaultConstraints(): EnhancedConstraints {
    return {
      kerfWidth: 3.5,
      startSafety: 100.0, // ✅ CRITICAL: 100mm fire from start of each stock
      endSafety: 0, // ✅ No end safety - all fire is cut from start
      minScrapLength: 75,
      energyPerStock: 0.5,
      maxWastePercentage: 10,
      maxCutsPerStock: 50,
      safetyMargin: 2,
      allowPartialStocks: true,
      prioritizeSmallWaste: true,
      reclaimWasteOnly: false,
      balanceComplexity: true,
      respectMaterialGrades: true
    };
  }

  /**
   * Get default cost model
   */
  private getDefaultCostModel(): CostModel {
    return {
      materialCost: 0.05,
      cuttingCost: 0.10,
      setupCost: 2.00,
      wasteCost: 0.03,
      timeCost: 0.50,
      energyCost: 0.15
    };
  }

  /**
   * Get default cost model value (for external access)
   */
  public getDefaultCostModelValue(): CostModel {
    return this.defaultCostModel;
  }

  /**
   * Merge constraints with defaults
   */
  private mergeConstraints(constraints: Partial<EnhancedConstraints>): EnhancedConstraints {
    return {
      ...this.defaultConstraints,
      ...constraints
    };
  }

  /**
   * Map algorithm label to enum
   * Only includes active, supported algorithms
   */
  private mapLabelToEnum(label: AlgorithmLabel): OptimizationAlgorithm {
    const mapping: Record<AlgorithmLabel, OptimizationAlgorithm> = {
      'ffd': OptimizationAlgorithm.FIRST_FIT_DECREASING,
      'bfd': OptimizationAlgorithm.BEST_FIT_DECREASING,
      'genetic': OptimizationAlgorithm.GENETIC_ALGORITHM,
      'pooling': OptimizationAlgorithm.PROFILE_POOLING,
      'pattern-exact': OptimizationAlgorithm.PATTERN_EXACT
    };
    return mapping[label];
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `opt-${Date.now()}-${this.sequenceCounter++}`;
  }

  /**
   * Get algorithm metadata
   */
  public getAlgorithmInfo(algorithm: AlgorithmLabel): AlgorithmMetadata | undefined {
    return this.algorithmFactory.getMetadata(this.mapLabelToEnum(algorithm));
  }

  /**
   * Get algorithm display name for frontend
   */
  private getAlgorithmDisplayName(algorithm: string, mode: AlgorithmMode): string {
    const algo = algorithm.toLowerCase();
    
    if (algo === 'bfd') return 'Best Fit Decreasing';
    if (algo === 'ffd') return 'First Fit Decreasing';
    if (algo === 'genetic') return 'Genetic Algorithm';
    if (algo === 'pooling') return 'Profile Pooling';
    if (algo === 'pattern-exact') return 'Pattern Exact Search';
    if (mode === 'advanced') return 'NSGA-II';
    
    return 'Smart Algorithm';
  }

  /**
   * Get all available algorithms
   */
  public getAvailableAlgorithms(): AlgorithmMetadata[] {
    return this.algorithmFactory.getAllMetadata();
  }

  /**
   * Get recommended algorithm for item count
   */
  public getRecommendedAlgorithm(itemCount: number): OptimizationAlgorithm | undefined {
    return this.algorithmFactory.getRecommendedAlgorithm(itemCount);
  }

  /**
   * Get recommended algorithm mode
   * Delegates to SmartAlgorithmSelector
   */
  public getRecommendedMode(itemCount: number): AlgorithmMode {
    return this.smartSelector.getRecommendedMode(itemCount);
  }

  /**
   * Get algorithm info for mode
   */
  public getAlgorithmInfoForMode(mode: AlgorithmMode, itemCount?: number) {
    return this.smartSelector.getAlgorithmInfo(mode, itemCount);
  }
}

