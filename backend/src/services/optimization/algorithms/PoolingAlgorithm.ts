/**
 * LEMNİX Profile Pooling Algorithm
 * Advanced same-profile consolidation for multi-work-order optimization
 *
 * @module optimization/algorithms
 * @version 1.0.0
 * @architecture Domain-driven pooling strategy
 *
 * Algorithm:
 * 1. Group items by profile characteristics (type, die, alloy, surface, tolerance)
 * 2. Create demand vectors for each unique length in pool
 * 3. Generate candidate bar patterns (single-length + mixed)
 * 4. Select optimal patterns using greedy coverage
 * 5. Distribute segments back to work orders proportionally
 *
 * Time Complexity: O(n² × p) where p = number of pools
 * Space Complexity: O(n × w) where w = number of work orders
 * Best For: Multi-work-order scenarios, minimizing mixed bars
 */

import {
  OptimizationItem,
  Cut,
  CuttingSegment,
  WasteCategory,
  OptimizationAlgorithm,
} from "../../../types";
import { BaseAlgorithm } from "../core/BaseAlgorithm";
import { OptimizationContext } from "../core/OptimizationContext";
import { AdvancedOptimizationResult } from "../types";
import { StockCalculator } from "../helpers/StockCalculator";
import { WasteAnalyzer } from "../helpers/WasteAnalyzer";
import { CostCalculator } from "../helpers/CostCalculator";
import { MetricsCalculator } from "../helpers/MetricsCalculator";

/**
 * Material type constant
 */
const MATERIAL_TYPE = "aluminum" as const;

/**
 * Pooling threshold constants
 */
const POOLING_THRESHOLDS = {
  WASTE_REDUCTION_MIN: 0.01, // 1% of baseline
  EFFICIENCY_DROP_MAX: 0.002, // 0.2 percentage points
  MIXED_BAR_RATIO_MAX: 0.3, // 30% max mixed bars
} as const;

/**
 * Pool key for grouping items
 */
interface PoolKey {
  profileType: string;
  dieId: string;
  alloy: string;
  surface: string;
  tolerance: string;
}

/**
 * Demand vector for a specific length
 */
interface DemandVector {
  length: number;
  quantity: number;
  workOrders: Map<string, number>; // workOrderId -> quantity
}

/**
 * Profile pool (items with same characteristics)
 */
interface ProfilePool {
  poolKey: string;
  profileType: string;
  demandVector: Map<number, DemandVector>;
  stockLengths: ReadonlyArray<number>;
  kerf: number;
  startSafety: number;
  endSafety: number;
}

/**
 * Bar cutting pattern
 */
interface BarPattern {
  stockLength: number;
  plan: Array<{ length: number; count: number; workOrderId?: string }>;
  planLabel: string;
  used: number;
  remaining: number;
  pieceCount: number;
}

/**
 * Work order breakdown for mixed bars
 */
interface WorkOrderBreakdown {
  workOrderId: string | number;
  count: number;
}

/**
 * Extended Cut with pooling metadata
 */
interface PooledCut extends Cut {
  workOrderBreakdown?: WorkOrderBreakdown[];
  isMixed?: boolean;
  poolKey?: string;
}

/**
 * Pooling Algorithm implementation
 */
export class PoolingAlgorithm extends BaseAlgorithm {
  public readonly name = OptimizationAlgorithm.PROFILE_POOLING;
  public readonly complexity = "O(n²)" as const;
  public readonly scalability = 8;

  /**
   * Main optimization method
   */
  public async optimize(
    context: OptimizationContext,
  ): Promise<AdvancedOptimizationResult> {
    this.logger.info("Starting Profile Pooling optimization", {
      requestId: context.requestId,
      items: context.items.length,
      totalPieces: context.getTotalItemCount(),
    });

    // Validate context
    const validation = this.canOptimize(context);
    if (!validation.valid) {
      throw new Error(`Pooling optimization failed: ${validation.reason}`);
    }

    // Preprocess items
    const preprocessed = this.preprocessItems(context.items);

    // ✅ FIX: Collect work order information for tracking
    const workOrderIds = this.collectWorkOrderIds(preprocessed);
    this.logger.info(
      `Found ${workOrderIds.length} work orders: ${workOrderIds.join(", ")}`,
    );

    // Collect profile pools
    const pools = this.collectProfilePools(preprocessed, context);
    this.logger.info(`Created ${pools.length} profile pools`);

    // Optimize each pool
    const allCuts: PooledCut[] = [];
    let totalSegments = 0;

    for (let i = 0; i < pools.length; i++) {
      const pool = pools[i];
      if (!pool) continue;

      this.logger.debug(
        `Optimizing pool ${i + 1}/${pools.length}: ${pool.profileType}`,
      );

      const poolCuts = this.optimizePool(pool, context);
      allCuts.push(...poolCuts);
      totalSegments += poolCuts.reduce((sum, cut) => sum + cut.segmentCount, 0);
    }

    // Finalize and validate
    const finalizedCuts = this.finalizeCuts(allCuts, context);
    this.validateGlobalInvariants(finalizedCuts, context.items);

    // Create result with work order information
    const result = this.createResult(finalizedCuts, context, workOrderIds);

    this.logger.info("Profile Pooling optimization completed", {
      cuts: result.cuts.length,
      efficiency: result.efficiency.toFixed(2),
      mixedBars: finalizedCuts.filter((c) => (c as PooledCut).isMixed).length,
      executionTime: this.getExecutionTime(context),
    });

    return result;
  }

  /**
   * ✅ FIX: Collect work order IDs from items
   */
  private collectWorkOrderIds(
    items: ReadonlyArray<OptimizationItem>,
  ): string[] {
    const workOrderSet = new Set<string>();

    for (const item of items) {
      if (item.workOrderId && item.workOrderId.trim()) {
        workOrderSet.add(item.workOrderId.trim());
      }
    }

    return Array.from(workOrderSet).sort();
  }

  /**
   * Collect profile pools from items
   */
  private collectProfilePools(
    items: ReadonlyArray<OptimizationItem>,
    context: OptimizationContext,
  ): ProfilePool[] {
    const poolMap = new Map<string, ProfilePool>();

    for (const item of items) {
      const poolKey = this.generatePoolKey(item);

      if (!poolMap.has(poolKey)) {
        poolMap.set(poolKey, {
          poolKey,
          profileType: item.profileType,
          demandVector: new Map(),
          stockLengths: context.stockLengths,
          kerf: context.constraints.kerfWidth,
          startSafety: context.constraints.startSafety,
          endSafety: context.constraints.endSafety,
        });
      }

      const pool = poolMap.get(poolKey)!;

      if (pool.demandVector.has(item.length)) {
        const demand = pool.demandVector.get(item.length)!;
        demand.quantity += item.quantity;
        if (item.workOrderId) {
          const currentQty = demand.workOrders.get(item.workOrderId) || 0;
          demand.workOrders.set(item.workOrderId, currentQty + item.quantity);
        }
      } else {
        const workOrders = new Map<string, number>();
        if (item.workOrderId) {
          workOrders.set(item.workOrderId, item.quantity);
        }
        pool.demandVector.set(item.length, {
          length: item.length,
          quantity: item.quantity,
          workOrders,
        });
      }
    }

    return Array.from(poolMap.values());
  }

  /**
   * Generate pool key from item
   */
  private generatePoolKey(item: OptimizationItem): string {
    const poolKey: PoolKey = {
      profileType: item.profileType,
      dieId: this.extractProperty(item, "dieId", "UNKNOWN"),
      alloy: this.extractProperty(item, "alloy", "AA6063"),
      surface: this.extractProperty(item, "surface", "E6"),
      tolerance: this.extractProperty(item, "tolerance", "TOL-N"),
    };

    return `${poolKey.profileType}|${poolKey.dieId}|${poolKey.alloy}|${poolKey.surface}|${poolKey.tolerance}`;
  }

  /**
   * Extract property from item (with fallback)
   */
  private extractProperty(
    item: OptimizationItem,
    property: string,
    fallback: string,
  ): string {
    const extendedItem = item as OptimizationItem & Record<string, unknown>;
    const value = extendedItem[property];
    return typeof value === "string" ? value : fallback;
  }

  /**
   * Optimize single pool
   */
  private optimizePool(
    pool: ProfilePool,
    context: OptimizationContext,
  ): PooledCut[] {
    // Generate candidate patterns for all stock lengths
    const allPatterns: BarPattern[] = [];
    for (const stockLength of pool.stockLengths) {
      const patterns = this.generateBarPatterns(pool, stockLength);
      allPatterns.push(...patterns);
    }

    // Select patterns to cover demand
    const selectedBars = this.selectBarsToCoverDemand(pool, allPatterns);

    // Distribute segments to work orders
    const cuts = this.distributeSegmentsToWorkOrders(
      selectedBars,
      pool,
      context,
    );

    return cuts;
  }

  /**
   * Generate bar patterns for a stock length
   */
  private generateBarPatterns(
    pool: ProfilePool,
    stockLength: number,
  ): BarPattern[] {
    const patterns: BarPattern[] = [];
    const demandArray = Array.from(pool.demandVector.values()).sort(
      (a, b) => b.length - a.length,
    );

    // Single-length patterns
    for (const demand of demandArray) {
      const maxFit = StockCalculator.calculateMaxPiecesOnBar(
        demand.length,
        stockLength,
        pool.kerf,
        pool.startSafety,
        pool.endSafety,
      );

      if (maxFit > 0) {
        const used =
          pool.startSafety +
          maxFit * demand.length +
          (maxFit - 1) * pool.kerf +
          pool.endSafety;
        const remaining = stockLength - used;

        patterns.push({
          stockLength,
          plan: [{ length: demand.length, count: maxFit }],
          planLabel: `${maxFit} × ${demand.length} mm`,
          used,
          remaining,
          pieceCount: maxFit,
        });
      }
    }

    // Mixed-length patterns
    const mixedPatterns = this.generateMixedPatterns(
      pool,
      stockLength,
      demandArray,
    );
    patterns.push(...mixedPatterns);

    return patterns;
  }

  /**
   * Generate mixed-length patterns
   */
  private generateMixedPatterns(
    pool: ProfilePool,
    stockLength: number,
    demandArray: DemandVector[],
  ): BarPattern[] {
    const patterns: BarPattern[] = [];

    // Try pairwise combinations
    for (let i = 0; i < demandArray.length; i++) {
      for (let j = i + 1; j < demandArray.length; j++) {
        const length1 = demandArray[i]?.length;
        const length2 = demandArray[j]?.length;

        if (!length1 || !length2) continue;

        const plan: Array<{ length: number; count: number }> = [];
        let used = pool.startSafety + pool.endSafety;
        let count1 = 0;
        let count2 = 0;

        // Greedy placement
        while (used + (count1 > 0 ? pool.kerf : 0) + length1 <= stockLength) {
          used += (count1 > 0 ? pool.kerf : 0) + length1;
          count1++;
        }

        while (used + (count2 > 0 ? pool.kerf : 0) + length2 <= stockLength) {
          used += (count2 > 0 ? pool.kerf : 0) + length2;
          count2++;
        }

        if (count1 > 0 || count2 > 0) {
          if (count1 > 0) plan.push({ length: length1, count: count1 });
          if (count2 > 0) plan.push({ length: length2, count: count2 });

          patterns.push({
            stockLength,
            plan,
            planLabel: plan
              .map((p) => `${p.count} × ${p.length} mm`)
              .join(" + "),
            used,
            remaining: stockLength - used,
            pieceCount: count1 + count2,
          });
        }
      }
    }

    return patterns;
  }

  /**
   * Select bars to cover demand (greedy with mixed bar ratio constraint)
   */
  private selectBarsToCoverDemand(
    pool: ProfilePool,
    patterns: BarPattern[],
  ): BarPattern[] {
    const selectedBars: BarPattern[] = [];
    const remainingDemand = new Map(pool.demandVector);

    // Separate single and mixed patterns for ratio control
    const singlePatterns = patterns.filter((p) => p.plan.length === 1);
    const mixedPatterns = patterns.filter((p) => p.plan.length > 1);

    while (remainingDemand.size > 0) {
      let bestPattern: BarPattern | null = null;
      let bestScore = -1;

      // ✅ IMPROVED: Calculate mixed bar ratio by material volume instead of count
      const mixedMaterial = selectedBars
        .filter((b) => b.plan.length > 1)
        .reduce((sum, b) => sum + b.stockLength, 0);
      const totalMaterial = selectedBars.reduce(
        (sum, b) => sum + b.stockLength,
        0,
      );
      const mixedBarRatio =
        totalMaterial > 0 ? mixedMaterial / totalMaterial : 0;

      // Choose candidate patterns based on mixed bar ratio constraint
      const candidatePatterns =
        mixedBarRatio >= POOLING_THRESHOLDS.MIXED_BAR_RATIO_MAX
          ? singlePatterns // Only single patterns if ratio limit reached
          : patterns; // All patterns if under limit

      for (const pattern of candidatePatterns) {
        let canSatisfy = false;
        let totalPieces = 0;

        for (const planItem of pattern.plan) {
          const demand = remainingDemand.get(planItem.length);
          if (demand && demand.quantity > 0) {
            canSatisfy = true;
            totalPieces += Math.min(planItem.count, demand.quantity);
          }
        }

        if (canSatisfy && totalPieces > 0) {
          // ✅ IMPROVED: Normalize by waste ratio instead of absolute waste
          const wasteRatio = pattern.remaining / pattern.stockLength;
          const score = totalPieces / (wasteRatio + 0.01); // Normalize by waste %
          if (score > bestScore) {
            bestScore = score;
            bestPattern = pattern;
          }
        }
      }

      if (!bestPattern) break;

      selectedBars.push(bestPattern);

      // Update remaining demand
      for (const planItem of bestPattern.plan) {
        const demand = remainingDemand.get(planItem.length);
        if (demand) {
          demand.quantity = Math.max(0, demand.quantity - planItem.count);
          if (demand.quantity === 0) {
            remainingDemand.delete(planItem.length);
          }
        }
      }
    }

    // Log mixed bar ratio for monitoring (by material volume)
    const finalMixedMaterial = selectedBars
      .filter((b) => b.plan.length > 1)
      .reduce((sum, b) => sum + b.stockLength, 0);
    const finalTotalMaterial = selectedBars.reduce(
      (sum, b) => sum + b.stockLength,
      0,
    );
    const finalMixedRatio =
      finalTotalMaterial > 0 ? finalMixedMaterial / finalTotalMaterial : 0;
    const finalMixedCount = selectedBars.filter(
      (b) => b.plan.length > 1,
    ).length;

    console.log(
      `[PoolingAlgorithm] 📊 Mixed bar ratio: ${(finalMixedRatio * 100).toFixed(1)}% (${finalMixedCount}/${selectedBars.length} bars, ${finalMixedMaterial}mm/${finalTotalMaterial}mm material)`,
      {
        limit: `${(POOLING_THRESHOLDS.MIXED_BAR_RATIO_MAX * 100).toFixed(1)}%`,
        withinLimit: finalMixedRatio <= POOLING_THRESHOLDS.MIXED_BAR_RATIO_MAX,
      },
    );

    return selectedBars;
  }

  /**
   * Distribute segments to work orders
   */
  private distributeSegmentsToWorkOrders(
    selectedBars: BarPattern[],
    pool: ProfilePool,
    context: OptimizationContext,
  ): PooledCut[] {
    const cuts: PooledCut[] = [];
    const workOrderDemand = new Map<string, Map<number, number>>();

    // Initialize work order demand tracking
    for (const [length, demand] of pool.demandVector) {
      for (const [workOrderId, qty] of demand.workOrders) {
        if (!workOrderDemand.has(workOrderId)) {
          workOrderDemand.set(workOrderId, new Map());
        }
        workOrderDemand
          .get(workOrderId)!
          .set(
            length,
            (workOrderDemand.get(workOrderId)!.get(length) || 0) + qty,
          );
      }
    }

    for (let i = 0; i < selectedBars.length; i++) {
      const bar = selectedBars[i];
      if (!bar) continue;

      const segments: CuttingSegment[] = [];
      const workOrderBreakdown: WorkOrderBreakdown[] = [];
      const workOrderCounts = new Map<string, number>();

      // Create segments
      for (const planItem of bar.plan) {
        for (let j = 0; j < planItem.count; j++) {
          segments.push(
            this.createSegment(
              segments.length,
              `cut_${i}`,
              planItem.length,
              pool.profileType,
              context,
              planItem.workOrderId, // ✅ FIX: Pass workOrderId from plan item
            ),
          );
        }

        // Distribute to work orders proportionally
        const demandVector = pool.demandVector.get(planItem.length);
        if (demandVector) {
          const totalDemand = Array.from(
            demandVector.workOrders.values(),
          ).reduce((a, b) => a + b, 0);

          if (totalDemand > 0) {
            for (const [workOrderId, woNeed] of demandVector.workOrders) {
              if (woNeed > 0) {
                const proportion = woNeed / totalDemand;
                const assigned = Math.floor(planItem.count * proportion);

                if (assigned > 0) {
                  workOrderCounts.set(
                    workOrderId,
                    (workOrderCounts.get(workOrderId) || 0) + assigned,
                  );
                  demandVector.workOrders.set(
                    workOrderId,
                    Math.max(0, woNeed - assigned),
                  );
                }
              }
            }
          }
        }
      }

      // Create work order breakdown
      for (const [workOrderId, count] of workOrderCounts) {
        workOrderBreakdown.push({ workOrderId, count });
      }

      const cut: PooledCut = {
        id: this.generateCutId(),
        cuttingPlanId: `pool-plan-${i}`,
        stockIndex: i,
        stockLength: bar.stockLength,
        materialType: MATERIAL_TYPE,
        segments,
        usedLength: bar.used,
        remainingLength: bar.remaining,
        plan: bar.plan,
        planLabel: bar.planLabel,
        segmentCount: segments.length,
        isReclaimable: bar.remaining >= context.constraints.minScrapLength,
        estimatedCuttingTime: segments.length * 2,
        setupTime: 5,
        kerfLoss: pool.kerf,
        safetyMargin: pool.startSafety + pool.endSafety,
        toleranceCheck: true,
        sequence: i + 1,
        wasteCategory: WasteAnalyzer.calculateWasteCategory(bar.remaining),
        workOrderBreakdown,
        isMixed: workOrderBreakdown.length > 1,
        poolKey: pool.poolKey,
        profileType: pool.profileType,
      };

      cuts.push(cut);
    }

    return cuts;
  }

  /**
   * Create segment
   */
  private createSegment(
    index: number,
    cutId: string,
    length: number,
    profileType: string,
    context: OptimizationContext,
    workOrderId?: string,
  ): CuttingSegment {
    return {
      id: this.generateSegmentId(),
      cutId,
      sequenceNumber: index + 1,
      length,
      quantity: 1,
      position: 0, // Will be calculated during finalization
      endPosition: length,
      tolerance: 0.5,
      workOrderItemId: workOrderId || "",
      workOrderId: workOrderId || "POOLED", // ✅ FIX: Add workOrderId from plan item
      profileType,
      originalLength: length,
      qualityCheck: true,
      unitCost: length * context.costModel.materialCost,
      totalCost: length * context.costModel.materialCost,
    };
  }

  /**
   * Finalize cuts
   */
  private finalizeCuts(cuts: PooledCut[], context: OptimizationContext): Cut[] {
    return cuts.map((cut) => ({
      ...cut,
      profileType: cut.profileType || "Unknown",
    }));
  }

  /**
   * ✅ FIX: Calculate work order breakdown from cuts
   */
  private calculateWorkOrderBreakdown(
    cuts: Cut[],
    workOrderIds: string[],
  ): Array<{ workOrderId: string; pieceCount: number }> {
    const workOrderCounts = new Map<string, number>();

    // Initialize all work orders with 0 count
    for (const workOrderId of workOrderIds) {
      workOrderCounts.set(workOrderId, 0);
    }

    // Count pieces from cuts
    for (const cut of cuts) {
      const pooledCut = cut as PooledCut;
      if (pooledCut.workOrderBreakdown) {
        for (const breakdown of pooledCut.workOrderBreakdown) {
          const workOrderId = String(breakdown.workOrderId);
          const currentCount = workOrderCounts.get(workOrderId) || 0;
          workOrderCounts.set(workOrderId, currentCount + breakdown.count);
        }
      }
    }

    // Convert to array format
    return Array.from(workOrderCounts.entries()).map(
      ([workOrderId, pieceCount]) => ({
        workOrderId,
        pieceCount,
      }),
    );
  }

  /**
   * Create result
   */
  private createResult(
    cuts: Cut[],
    context: OptimizationContext,
    workOrderIds: string[],
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
      "pooling",
      context.items.length,
    );

    const setupTime = cuts.length * 5;
    const cuttingTime = totalSegments * 2;
    const totalTime = setupTime + cuttingTime;

    // ✅ FIX: Calculate work order breakdown
    const workOrderBreakdown = this.calculateWorkOrderBreakdown(
      cuts,
      workOrderIds,
    );

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
      paretoFrontier: CostCalculator.calculateParetoFrontier(
        totalWaste,
        costBreakdown.totalCost,
        totalTime,
        efficiency,
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
        gpuUsage: 0,
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
      // ✅ FIX: Add work order information
      workOrders: {
        ids: workOrderIds,
        count: workOrderIds.length,
        breakdown: workOrderBreakdown,
      },
    };
  }
}
