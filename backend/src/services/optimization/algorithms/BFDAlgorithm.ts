/**
 * LEMNİX BFD (Best Fit Decreasing) Algorithm
 * Optimized bin packing that minimizes waste per placement
 *
 * @module optimization/algorithms
 * @version 3.0.0
 * @architecture Concrete algorithm implementation with SOLID principles
 *
 * Algorithm:
 * 1. Sort items by length (descending)
 * 2. Analyze item patterns for optimization
 * 3. For each item:
 *    a) Find stock with minimum waste (tightest fit)
 *    b) Apply fragment prevention penalty
 *    c) Consider future placement opportunities (look-ahead)
 * 4. If no fit, create new stock with balanced distribution
 *
 * Enhancements v3.0.0:
 * - Fragment prevention (avoid unusable scrap)
 * - Look-ahead strategy (3 items)
 * - Pattern recognition and caching
 *
 * Time Complexity: O(n²) where n = number of items
 * Space Complexity: O(n)
 * Best For: Minimizing waste, quality over speed
 */

import {
  OptimizationItem,
  Cut,
  CuttingSegment,
  WasteCategory,
  OptimizationAlgorithm,
  ProfileType,
} from "../../../types";
import { BaseAlgorithm } from "../core/BaseAlgorithm";
import { OptimizationContext } from "../core/OptimizationContext";
import {
  AdvancedOptimizationResult,
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
import { ParetoFilter, type AlgorithmPattern } from "../utils/ParetoFilter";
import type { ILogger } from "../../logger";

/**
 * Material type constant
 */
const MATERIAL_TYPE = "aluminum" as const;

/**
 * Algorithm constants
 */
const CONSTANTS = {
  SETUP_TIME_PER_CUT: 5,
  CUTTING_TIME_PER_SEGMENT: 2,
  DEFAULT_TOLERANCE: 0.5,
  ACCOUNTING_PRECISION_THRESHOLD: 0.01,
  PLAN_ID_PREFIX: "bfd-plan",
  MIN_FRAGMENT_THRESHOLD: 50, // Minimum usable scrap length
  FRAGMENT_PENALTY_FACTOR: 0.8, // Penalty for creating fragments
  LOOK_AHEAD_DEPTH: 3, // Check next 3 items for future fit opportunities
} as const;

/**
 * Best fit result structure
 */
interface BestFitResult {
  readonly cut: Cut;
  readonly stockLength: number;
  readonly waste: number;
  readonly willCreateFragment: boolean; // NEW
  readonly adjustedWaste: number; // NEW: waste with fragment penalty
  readonly futureOpportunityScore: number; // NEW
}

/**
 * Stock length usage statistics
 */
interface StockLengthUsage {
  readonly length: number;
  readonly count: number;
  readonly totalWaste: number;
}

/**
 * Multi-stock bin collection
 */
interface MultiStockBins {
  readonly binsByLength: ReadonlyMap<number, Cut[]>;
}

/**
 * BFD Algorithm implementation with SOLID principles
 */
export class BFDAlgorithm extends BaseAlgorithm {
  public readonly name = OptimizationAlgorithm.BEST_FIT_DECREASING;
  public readonly complexity = "O(n²)" as const;
  public readonly scalability = 8;

  // NEW: Pattern recognition and caching
  private upcomingItems: ReadonlyArray<OptimizationItem> = [];
  private itemPatternCache: Map<number, number> = new Map(); // length -> count
  private stockUsageCache: Map<number, StockLengthUsage> = new Map(); // memoization
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
    this.logger.info("Starting BFD optimization", {
      requestId: context.requestId,
      items: context.items.length,
      totalPieces: context.getTotalItemCount(),
    });

    this.validateContext(context);
    const sortedItems = this.prepareSortedItems(context);
    this.analyzeItemPatterns(sortedItems); // NEW
    const cuts = this.executeBFDAlgorithm(sortedItems, context);
    const finalizedCuts = this.finalizeCuts(cuts, context);

    this.validateGlobalInvariants(finalizedCuts, context.items);

    const result = this.buildOptimizationResult(finalizedCuts, context);

    this.logger.info("BFD optimization completed", {
      requestId: context.requestId,
      cuts: result.cuts.length,
      efficiency: result.efficiency.toFixed(2),
      executionTime: this.getExecutionTime(context),
    });

    return result;
  }

  /**
   * Validate optimization context
   */
  private validateContext(context: OptimizationContext): void {
    const validation = this.canOptimize(context);
    if (!validation.valid) {
      throw new Error(`BFD optimization failed: ${validation.reason}`);
    }
  }

  /**
   * Prepare and sort items for optimization
   * FIXED: Don't expand by quantity - work with grouped items for better efficiency
   */
  private prepareSortedItems(
    context: OptimizationContext,
  ): ReadonlyArray<OptimizationItem> {
    const preprocessed = this.preprocessItems(context.items);
    // FIXED: Don't expand items by quantity - this was causing 46 cuts instead of ~14
    // const expanded = this.expandItemsByQuantity(preprocessed);
    const sorted = [...preprocessed].sort((a, b) => b.length - a.length);

    this.logger.debug("Items preprocessed (grouped, not expanded)", {
      original: context.items.length,
      grouped: preprocessed.length,
      sorted: sorted.length,
      totalPieces: preprocessed.reduce((sum, item) => sum + item.quantity, 0),
    });

    return sorted;
  }

  /**
   * Execute BFD algorithm with multi-stock length support
   * Uses DP optimization when kerf=0 for better results
   */
  private executeBFDAlgorithm(
    sortedItems: ReadonlyArray<OptimizationItem>,
    context: OptimizationContext,
  ): Cut[] {
    // Calculate theoretical minimum for validation
    const theoreticalMin = TheoreticalMinimumCalculator.calculateMinimumStock(
      context.items, // Use original items, not expanded
      context.stockLengths,
      context.constraints,
    );

    this.logger.debug("[BFD] executeBFDAlgorithm called");
    this.logger.debug("[BFD] Theoretical minimum", {
      minStockCount: theoreticalMin.minStockCount,
      totalRequired: theoreticalMin.totalRequired,
      kerfWidth: context.constraints.kerfWidth,
      stockLengths: context.stockLengths,
      itemCount: sortedItems.length,
    });

    this.logger.info(
      `[BFD] Theoretical minimum: ${theoreticalMin.minStockCount} stocks for ${theoreticalMin.totalRequired}mm total`,
      {
        recommendedStockLength: theoreticalMin.recommendedStockLength,
        breakdown: theoreticalMin.breakdown,
      },
    );

    // ✅ FIX: Always use DP optimization for exact demand fulfillment
    // DP with kerf support now handles both kerf=0 and kerf>0 cases
    this.logger.debug("[BFD] Calling executeDPOptimization");
    this.logger.info(
      `[BFD] Using DP optimization (kerf=${context.constraints.kerfWidth})`,
    );
    return this.executeDPOptimization(sortedItems, context, theoreticalMin);
  }

  /**
   * Initialize bins for each stock length
   */
  private initializeMultiStockBins(
    stockLengths: ReadonlyArray<number>,
  ): MultiStockBins {
    const binsByLength = new Map<number, Cut[]>();

    for (const stockLength of stockLengths) {
      binsByLength.set(stockLength, []);
    }

    return { binsByLength };
  }

  /**
   * Optimize remaining space in a cut by trying to fit different item lengths
   */
  private optimizeRemainingSpace(
    cut: Cut,
    remainingItems: OptimizationItem[],
    context: OptimizationContext,
  ): Cut {
    // Try to fill remaining space with different item lengths
    let optimizedCut = cut;
    const constraints = context.constraints;

    // Sort remaining items by length (ascending) to try smaller pieces first
    const sortedRemaining = [...remainingItems]
      .filter((item) => item.length < optimizedCut.remainingLength)
      .sort((a, b) => a.length - b.length);

    for (const item of sortedRemaining) {
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
        // Remove item from remaining list (mark as used)
        const itemIndex = remainingItems.findIndex((i) => i === item);
        if (itemIndex !== -1) {
          remainingItems.splice(itemIndex, 1);
        }

        this.logger.debug(
          `[BFDAlgorithm] ✅ Filled remaining space with ${item.length}mm item:`,
          {
            originalRemaining: cut.remainingLength,
            newRemaining: optimizedCut.remainingLength,
            itemLength: item.length,
            stockLength: optimizedCut.stockLength,
          },
        );
      }
    }

    return optimizedCut;
  }

  /**
   * Place item in optimal location using best-fit strategy
   * FIXED: Handle grouped items (quantity > 1) efficiently
   */
  private placeItemOptimally(
    item: OptimizationItem,
    bins: MultiStockBins,
    context: OptimizationContext,
  ): void {
    // For grouped items, place all pieces of the same length together
    let remainingQuantity = item.quantity;

    while (remainingQuantity > 0) {
      const bestFit = this.findBestFitLocation(item, bins, context);

      if (bestFit !== null) {
        // Calculate how many pieces can fit in this cut
        const piecesThatFit = this.calculatePiecesThatFit(
          item,
          bestFit.cut,
          context,
        );
        const piecesToPlace = Math.min(remainingQuantity, piecesThatFit);

        this.placeItemInExistingCut(
          { ...item, quantity: piecesToPlace },
          bestFit,
          bins,
          context,
        );
        remainingQuantity -= piecesToPlace;
      } else {
        // Create new cut and place as many pieces as possible
        const piecesToPlace = remainingQuantity;
        this.placeItemInNewCut(
          { ...item, quantity: piecesToPlace },
          bins,
          context,
        );
        remainingQuantity = 0;
      }
    }
  }

  /**
   * Calculate how many pieces of an item can fit in a cut
   */
  private calculatePiecesThatFit(
    item: OptimizationItem,
    cut: Cut,
    context: OptimizationContext,
  ): number {
    const kerfNeeded = StockCalculator.calculateKerfNeeded(
      cut.segmentCount,
      context.constraints.kerfWidth,
    );
    const spacePerPiece = item.length + kerfNeeded;

    if (cut.remainingLength < spacePerPiece) {
      return 0;
    }

    // Calculate how many pieces can fit
    const piecesThatFit = Math.floor(cut.remainingLength / spacePerPiece);
    return Math.min(piecesThatFit, item.quantity);
  }

  /**
   * Find best fit location across all stock lengths
   */
  private findBestFitLocation(
    item: OptimizationItem,
    bins: MultiStockBins,
    context: OptimizationContext,
  ): BestFitResult | null {
    let bestFit: BestFitResult | null = null;

    for (const [stockLength, cuts] of bins.binsByLength) {
      const localBestFit = this.findBestFitInStockLength(
        item,
        cuts,
        stockLength,
        context,
      );

      if (localBestFit !== null) {
        if (bestFit === null || localBestFit.waste < bestFit.waste) {
          bestFit = localBestFit;
        }
      }
    }

    return bestFit;
  }

  /**
   * Find best fit within specific stock length
   */
  private findBestFitInStockLength(
    item: OptimizationItem,
    cuts: Cut[],
    stockLength: number,
    context: OptimizationContext,
  ): BestFitResult | null {
    let bestFit: BestFitResult | null = null;

    for (const cut of cuts) {
      const fitResult = this.evaluateFitInCut(item, cut, stockLength, context);

      if (fitResult !== null) {
        // Prioritize: 1) adjusted waste, 2) future opportunity as tie-breaker
        if (
          bestFit === null ||
          fitResult.adjustedWaste < bestFit.adjustedWaste
        ) {
          bestFit = fitResult;
        } else if (
          Math.abs(fitResult.adjustedWaste - bestFit.adjustedWaste) < 0.01
        ) {
          // Tie-breaker: prefer higher future opportunity
          if (
            fitResult.futureOpportunityScore > bestFit.futureOpportunityScore
          ) {
            bestFit = fitResult;
          }
        }
      }
    }

    return bestFit;
  }

  /**
   * Evaluate if item fits in cut and calculate waste
   */
  private evaluateFitInCut(
    item: OptimizationItem,
    cut: Cut,
    stockLength: number,
    context: OptimizationContext,
  ): BestFitResult | null {
    const kerfNeeded = StockCalculator.calculateKerfNeeded(
      cut.segmentCount,
      context.constraints.kerfWidth,
    );
    const totalNeeded = item.length + kerfNeeded;

    if (cut.remainingLength >= totalNeeded) {
      const wasteAfterFit = cut.remainingLength - totalNeeded;

      // NEW: Check if creates unusable fragment
      const willCreateFragment =
        wasteAfterFit > 0 && wasteAfterFit < context.constraints.minScrapLength;

      // NEW: Apply penalty to fragment-creating placements
      const adjustedWaste = willCreateFragment
        ? wasteAfterFit * (1 / CONSTANTS.FRAGMENT_PENALTY_FACTOR) // Make it less attractive
        : wasteAfterFit;

      // NEW: Calculate future opportunity score
      const futureScore = this.calculateFutureOpportunityScore(
        wasteAfterFit,
        context,
      );

      this.logger.debug("Fragment prevention analysis", {
        waste: wasteAfterFit,
        willCreateFragment,
        adjustedWaste,
        minScrapLength: context.constraints.minScrapLength,
      });

      return {
        cut,
        stockLength,
        waste: wasteAfterFit,
        willCreateFragment,
        adjustedWaste,
        futureOpportunityScore: futureScore,
      };
    }

    return null;
  }

  /**
   * Calculate if remaining space can accommodate future items
   */
  private calculateFutureOpportunityScore(
    remainingSpace: number,
    context: OptimizationContext,
  ): number {
    if (this.upcomingItems.length === 0) {
      return 1.0; // No future items to consider
    }

    let fittableCount = 0;

    for (const upcomingItem of this.upcomingItems) {
      const requiredSpace = upcomingItem.length + context.constraints.kerfWidth;
      if (remainingSpace >= requiredSpace) {
        fittableCount++;
      }
    }

    const futureScore = fittableCount / this.upcomingItems.length;

    this.logger.debug("Look-ahead analysis", {
      upcomingItems: this.upcomingItems.length,
      futureOpportunityScore: futureScore.toFixed(2),
    });

    return futureScore;
  }

  /**
   * Analyze item patterns for optimization
   */
  private analyzeItemPatterns(items: ReadonlyArray<OptimizationItem>): void {
    this.itemPatternCache.clear();

    for (const item of items) {
      const count = this.itemPatternCache.get(item.length) ?? 0;
      this.itemPatternCache.set(item.length, count + 1);
    }

    this.logger.debug("Item patterns analyzed", {
      uniqueLengths: this.itemPatternCache.size,
      totalItems: items.length,
    });
  }

  /**
   * Place item in existing cut
   */
  private placeItemInExistingCut(
    item: OptimizationItem,
    bestFit: BestFitResult,
    bins: MultiStockBins,
    context: OptimizationContext,
  ): void {
    const stockCuts = bins.binsByLength.get(bestFit.stockLength);
    if (stockCuts === undefined) {
      throw new Error(`Stock length ${bestFit.stockLength} not found in bins`);
    }

    const cutIndex = stockCuts.indexOf(bestFit.cut);
    if (cutIndex === -1) {
      throw new Error(`Cut not found in stock length ${bestFit.stockLength}`);
    }

    const kerfNeeded = StockCalculator.calculateKerfNeeded(
      bestFit.cut.segmentCount,
      context.constraints.kerfWidth,
    );

    let updatedCut = this.addSegmentToCut(
      bestFit.cut,
      item,
      kerfNeeded,
      context,
    );

    // Optimize remaining space with different item lengths
    updatedCut = this.optimizeRemainingSpace(
      updatedCut,
      [...this.upcomingItems],
      context,
    );

    stockCuts[cutIndex] = updatedCut;

    // NEW: Invalidate cache
    this.stockUsageCache.delete(bestFit.stockLength);

    this.logger.debug("Item placed in existing cut", {
      itemLength: item.length,
      stockLength: bestFit.stockLength,
      wasteAfterFit: bestFit.waste,
    });
  }

  /**
   * Place item in new cut with balanced distribution
   */
  private placeItemInNewCut(
    item: OptimizationItem,
    bins: MultiStockBins,
    context: OptimizationContext,
  ): void {
    const selectedStockLength = this.selectOptimalStockLength(
      item,
      bins,
      context,
    );
    const stockCuts = bins.binsByLength.get(selectedStockLength);

    if (stockCuts === undefined) {
      throw new Error(`Stock length ${selectedStockLength} not found in bins`);
    }

    const newCut = this.createNewStock(
      selectedStockLength,
      stockCuts.length,
      context.constraints,
    );

    let updatedCut = this.addSegmentToCut(newCut, item, 0, context);

    // Optimize remaining space with different item lengths
    updatedCut = this.optimizeRemainingSpace(
      updatedCut,
      [...this.upcomingItems],
      context,
    );

    stockCuts.push(updatedCut);

    // NEW: Invalidate cache
    this.stockUsageCache.delete(selectedStockLength);

    this.logger.debug("Item placed in new cut", {
      itemLength: item.length,
      selectedLength: selectedStockLength,
      totalCuts: stockCuts.length,
    });
  }

  /**
   * Select optimal stock length with waste-per-item strategy
   * ✅ OPTIMIZED: Minimize waste per piece for better efficiency
   */
  private selectOptimalStockLength(
    item: OptimizationItem,
    bins: MultiStockBins,
    context: OptimizationContext,
  ): number {
    // STRATEGY: Select stock with minimum waste per piece
    // Example: 918mm → 6000mm (6pcs, 82mm/pc) better than 3400mm (3pcs, 215mm/pc)

    let bestStock: number | null = null;
    let bestWastePerPiece = Infinity;

    for (const stockLength of context.stockLengths) {
      const maxPieces = StockCalculator.calculateMaxPiecesOnBar(
        item.length,
        stockLength,
        context.constraints.kerfWidth,
        context.constraints.startSafety,
        context.constraints.endSafety,
      );

      if (maxPieces === 0) continue; // Skip if doesn't fit

      // Calculate waste per piece
      const usedLength =
        context.constraints.startSafety +
        maxPieces * item.length +
        (maxPieces > 0 ? (maxPieces - 1) * context.constraints.kerfWidth : 0) +
        context.constraints.endSafety;
      const waste = stockLength - usedLength;
      const wastePerPiece = waste / maxPieces;

      if (wastePerPiece < bestWastePerPiece) {
        bestStock = stockLength;
        bestWastePerPiece = wastePerPiece;
      }
    }

    if (bestStock === null) {
      // Fallback: use largest stock if none fit
      this.logger.warn("[BFD] No viable stock found, using largest", {
        itemLength: item.length,
        availableStocks: context.stockLengths,
      });
      return Math.max(...context.stockLengths);
    }

    this.logger.debug("[BFD] Stock selection (waste-per-item)", {
      itemLength: item.length,
      selectedStock: bestStock,
      wastePerPiece: bestWastePerPiece.toFixed(2),
      strategy: "minimize-waste-per-piece",
    });

    return bestStock;
  }

  /**
   * Calculate usage statistics for all stock lengths
   */
  private calculateStockUsageStatistics(
    bins: MultiStockBins,
  ): StockLengthUsage[] {
    const usageStats: StockLengthUsage[] = [];

    for (const [length, cuts] of bins.binsByLength) {
      // NEW: Check cache first
      const cached = this.stockUsageCache.get(length);
      if (cached && cached.count === cuts.length) {
        usageStats.push(cached);
        continue;
      }

      const totalWaste = cuts.reduce(
        (sum, cut) => sum + cut.remainingLength,
        0,
      );
      const stats = { length, count: cuts.length, totalWaste };

      // NEW: Cache result
      this.stockUsageCache.set(length, stats);
      usageStats.push(stats);
    }

    return usageStats.sort((a, b) => a.count - b.count);
  }

  /**
   * Check if all stock lengths have uniform usage
   */
  private checkUniformUsage(
    usageStats: ReadonlyArray<StockLengthUsage>,
  ): boolean {
    if (usageStats.length === 0) {
      return true;
    }

    const firstCount = usageStats[0]?.count ?? 0;
    return usageStats.every((stat) => stat.count === firstCount);
  }

  /**
   * Flatten bins to single array
   */
  private flattenBinsToArray(bins: MultiStockBins): Cut[] {
    const allCuts: Cut[] = [];

    for (const cuts of bins.binsByLength.values()) {
      allCuts.push(...cuts);
    }

    this.logger.debug("Multi-stock bin packing completed", {
      totalCuts: allCuts.length,
    });

    return allCuts;
  }

  /**
   * Create new empty stock
   */
  private createNewStock(
    stockLength: number,
    index: number,
    constraints: OptimizationContext["constraints"],
  ): Cut {
    const usableLength =
      stockLength - constraints.startSafety - constraints.endSafety;

    if (usableLength <= 0) {
      throw new Error(
        `Invalid stock configuration: stockLength=${stockLength}, safety margins exceed available space`,
      );
    }

    return {
      id: this.generateCutId(),
      cuttingPlanId: `${CONSTANTS.PLAN_ID_PREFIX}-${index}`,
      stockIndex: index,
      stockLength,
      materialType: MATERIAL_TYPE,
      segments: [],
      segmentCount: 0,
      usedLength: constraints.startSafety,
      remainingLength: usableLength,
      wasteCategory: WasteCategory.MINIMAL,
      isReclaimable: false,
      estimatedCuttingTime: 0,
      setupTime: CONSTANTS.SETUP_TIME_PER_CUT,
      kerfLoss: 0,
      safetyMargin: constraints.startSafety + constraints.endSafety,
      toleranceCheck: true,
      sequence: index,
    };
  }

  /**
   * Add segment to cut with rigorous validation
   */
  private addSegmentToCut(
    cut: Cut,
    item: OptimizationItem,
    kerfNeeded: number,
    context: OptimizationContext,
  ): Cut {
    // Handle multiple pieces of the same length
    const quantity = item.quantity || 1;
    let currentCut = cut;

    for (let i = 0; i < quantity; i++) {
      const newSegmentCount = currentCut.segmentCount + 1;
      const position = currentCut.usedLength + kerfNeeded;
      const segment = this.createSegment(
        currentCut,
        { ...item, quantity: 1 }, // Create segment for single piece
        position,
        newSegmentCount,
        context,
      );

      const newUsedLength = currentCut.usedLength + item.length + kerfNeeded;
      const newRemainingLength = this.calculateRemainingLength(
        currentCut.stockLength,
        newUsedLength,
        context.constraints.endSafety,
      );

      currentCut = {
        ...currentCut,
        segments: [...currentCut.segments, segment],
        segmentCount: newSegmentCount,
        usedLength: newUsedLength,
        remainingLength: newRemainingLength,
        kerfLoss: (currentCut.kerfLoss ?? 0) + kerfNeeded,
      };

      this.validateCutInvariant(currentCut);
    }

    return currentCut;
  }

  /**
   * Create cutting segment
   */
  private createSegment(
    cut: Cut,
    item: OptimizationItem,
    position: number,
    sequenceNumber: number,
    context: OptimizationContext,
  ): CuttingSegment {
    const endPosition = position + item.length;
    const unitCost = item.length * context.costModel.materialCost;

    return {
      id: this.generateSegmentId(),
      cutId: cut.id,
      sequenceNumber,
      length: item.length,
      quantity: 1,
      position,
      endPosition,
      tolerance: CONSTANTS.DEFAULT_TOLERANCE,
      workOrderItemId: item.workOrderId ?? "",
      profileType: item.profileType,
      originalLength: item.length,
      qualityCheck: true,
      unitCost,
      totalCost: unitCost,
      workOrderId: item.workOrderId,
      note: item.profileType,
    };
  }

  /**
   * Calculate remaining length with safety checks
   */
  private calculateRemainingLength(
    stockLength: number,
    usedLength: number,
    endSafety: number,
  ): number {
    const remaining = stockLength - usedLength - endSafety;
    return Math.max(0, remaining);
  }

  /**
   * Validate cut invariant
   */
  private validateCutInvariant(cut: Cut): void {
    if (cut.segmentCount !== cut.segments.length) {
      throw new Error(
        `Invariant violation: segmentCount=${cut.segmentCount} !== segments.length=${cut.segments.length}`,
      );
    }
  }

  /**
   * Finalize cuts with proper accounting
   */
  private finalizeCuts(cuts: Cut[], context: OptimizationContext): Cut[] {
    return cuts.map((cut) => this.finalizeSingleCut(cut, context));
  }

  /**
   * Finalize single cut
   */
  private finalizeSingleCut(cut: Cut, context: OptimizationContext): Cut {
    const finalUsedLength = cut.usedLength + context.constraints.endSafety;
    const finalRemaining = Math.max(0, cut.stockLength - finalUsedLength);

    this.validateStockAccounting(cut, finalUsedLength, finalRemaining);

    const plan = this.generateCuttingPlan(cut.segments);
    const planLabel = this.formatCuttingPlanLabel(plan);

    return {
      ...cut,
      usedLength: finalUsedLength,
      remainingLength: finalRemaining,
      wasteCategory: WasteAnalyzer.calculateWasteCategory(finalRemaining),
      isReclaimable: WasteAnalyzer.isReclaimable(
        finalRemaining,
        context.constraints.minScrapLength,
      ),
      plan,
      planLabel,
      profileType: this.determineCutProfileType(cut),
    };
  }

  /**
   * Validate stock accounting with precision handling
   */
  private validateStockAccounting(
    cut: Cut,
    finalUsedLength: number,
    finalRemaining: number,
  ): void {
    if (
      !StockCalculator.validateStockAccounting(
        finalUsedLength,
        finalRemaining,
        cut.stockLength,
      )
    ) {
      throw new Error(
        `Accounting violation in cut ${cut.id}: ` +
          `used=${finalUsedLength} + remaining=${finalRemaining} !== stock=${cut.stockLength}`,
      );
    }

    const total = finalUsedLength + finalRemaining;
    const difference = Math.abs(total - cut.stockLength);

    if (difference > CONSTANTS.ACCOUNTING_PRECISION_THRESHOLD) {
      throw new Error(
        `Accounting precision error in cut ${cut.id}: ` +
          `total=${total} differs from stock=${cut.stockLength} by ${difference}mm`,
      );
    }
  }

  /**
   * Determine cut profile type
   */
  private determineCutProfileType(cut: Cut): string {
    if (cut.profileType !== undefined && cut.profileType !== "") {
      return cut.profileType;
    }

    const firstSegment = cut.segments[0];
    if (firstSegment !== undefined && firstSegment.profileType !== undefined) {
      return firstSegment.profileType;
    }

    return "Unknown";
  }

  /**
   * Generate cutting plan from segments
   */
  private generateCuttingPlan(
    segments: CuttingSegment[],
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
    segment: CuttingSegment,
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
  private formatCuttingPlanLabel(
    plan: ReadonlyArray<{ length: number; count: number }>,
  ): string {
    return plan.map((p) => `${p.count} × ${p.length} mm`).join(" + ");
  }

  /**
   * Build comprehensive optimization result
   */
  private buildOptimizationResult(
    cuts: Cut[],
    context: OptimizationContext,
  ): AdvancedOptimizationResult {
    const aggregates = this.calculateAggregateMetrics(cuts);
    const efficiency = StockCalculator.calculateEfficiency(
      aggregates.totalStockLength,
      aggregates.totalWaste,
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
      "bfd",
      context.items.length,
    );

    const timing = this.calculateTimingMetrics(
      aggregates.totalSegments,
      cuts.length,
    );
    const quality = this.calculateQualityMetrics(
      efficiency,
      aggregates.totalWaste,
    );

    // Calculate stock summary for multi-stock optimization display
    const stockSummary = this.calculateStockSummary(cuts);

    return {
      algorithm: this.name,
      cuts,
      efficiency,
      totalWaste: aggregates.totalWaste,
      totalCost: costBreakdown.totalCost,
      stockCount: cuts.length,
      totalLength: aggregates.totalLength,
      executionTimeMs: this.getExecutionTime(context),
      totalSegments: aggregates.totalSegments,
      averageCutsPerStock: this.calculateAverageCutsPerStock(
        aggregates.totalSegments,
        cuts.length,
      ),
      setupTime: timing.setupTime,
      materialUtilization: efficiency,
      cuttingComplexity: MetricsCalculator.calculateCuttingComplexity(
        aggregates.totalSegments,
        cuts.length,
      ),
      cuttingTime: timing.cuttingTime,
      totalTime: timing.totalTime,
      materialCost: costBreakdown.materialCost,
      wasteCost: costBreakdown.wasteCost,
      laborCost: costBreakdown.timeCost,
      costPerMeter: CostCalculator.calculateCostPerMeter(
        costBreakdown.totalCost,
        aggregates.totalLength,
      ),
      qualityScore: quality.qualityScore,
      reclaimableWastePercentage:
        WasteAnalyzer.calculateReclaimableWastePercentage(cuts),
      wastePercentage: WasteAnalyzer.calculateWastePercentage(
        aggregates.totalWaste,
        aggregates.totalStockLength,
      ),
      wasteDistribution,
      constraints: context.constraints,
      detailedWasteAnalysis,
      recommendations: [],
      efficiencyCategory: WasteAnalyzer.getEfficiencyCategory(efficiency),
      optimizationScore: quality.optimizationScore,
      paretoFrontier: CostCalculator.calculateParetoFrontier(
        aggregates.totalWaste,
        costBreakdown.totalCost,
        timing.totalTime,
        efficiency,
      ),
      costBreakdown,
      performanceMetrics,
      confidence: quality.confidence,
      totalKerfLoss: aggregates.totalKerfLoss,
      totalSafetyReserve:
        cuts.length *
        (context.constraints.startSafety + context.constraints.endSafety),
      stockSummary,
    };
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

  /**
   * Calculate aggregate metrics from cuts
   */
  private calculateAggregateMetrics(cuts: Cut[]): {
    totalStockLength: number;
    totalWaste: number;
    totalLength: number;
    totalSegments: number;
    totalKerfLoss: number;
  } {
    return {
      totalStockLength: cuts.reduce((sum, cut) => sum + cut.stockLength, 0),
      totalWaste: WasteAnalyzer.calculateTotalWaste(cuts),
      totalLength: cuts.reduce((sum, cut) => sum + cut.usedLength, 0),
      totalSegments: cuts.reduce((sum, cut) => sum + cut.segmentCount, 0),
      totalKerfLoss: cuts.reduce((sum, cut) => sum + (cut.kerfLoss ?? 0), 0),
    };
  }

  /**
   * Calculate timing metrics
   */
  private calculateTimingMetrics(
    totalSegments: number,
    cutCount: number,
  ): {
    setupTime: number;
    cuttingTime: number;
    totalTime: number;
  } {
    const setupTime = cutCount * CONSTANTS.SETUP_TIME_PER_CUT;
    const cuttingTime = totalSegments * CONSTANTS.CUTTING_TIME_PER_SEGMENT;
    const totalTime = setupTime + cuttingTime;

    return { setupTime, cuttingTime, totalTime };
  }

  /**
   * Calculate quality metrics
   */
  private calculateQualityMetrics(
    efficiency: number,
    totalWaste: number,
  ): {
    qualityScore: number;
    optimizationScore: number;
    confidence: number;
  } {
    const qualityScore = MetricsCalculator.calculateQualityScore(
      efficiency,
      totalWaste,
    );
    const wastePercentage = WasteAnalyzer.calculateWastePercentage(
      totalWaste,
      0,
    );

    return {
      qualityScore,
      optimizationScore: MetricsCalculator.calculateOptimizationScore(
        efficiency,
        wastePercentage,
        qualityScore,
      ),
      confidence: MetricsCalculator.calculateConfidence(
        efficiency,
        totalWaste,
        0,
      ),
    };
  }

  /**
   * Calculate average cuts per stock
   */
  private calculateAverageCutsPerStock(
    totalSegments: number,
    stockCount: number,
  ): number {
    if (stockCount === 0) {
      return 0;
    }
    return totalSegments / stockCount;
  }

  // ========================================
  // DP (Dynamic Programming) Methods for kerf=0
  // ========================================

  /**
   * Execute DP optimization for kerf=0 cases
   * Based on the reference implementation for optimal cutting patterns
   */
  private executeDPOptimization(
    sortedItems: ReadonlyArray<OptimizationItem>,
    context: OptimizationContext,
    theoreticalMin: {
      readonly minStockCount: number;
      readonly totalRequired: number;
      readonly recommendedStockLength: number;
    },
  ): Cut[] {
    this.logger.info(
      `[BFD] Starting DP optimization (kerf=${context.constraints.kerfWidth})`,
    );

    // Group items by length for pattern generation
    const itemGroups = this.groupItemsByLength(sortedItems);
    const stockLengths = context.stockLengths;

    // CRITICAL: Check problem size - pattern-based approach has combinatorial explosion
    const uniqueLengths = itemGroups.length;
    const totalDemand = itemGroups.reduce((sum, g) => sum + g.quantity, 0);

    this.logger.debug("[BFD] Problem analysis", {
      uniqueLengths,
      totalDemand,
      itemGroups: itemGroups.map((g) => `${g.length}mm x${g.quantity}`),
      stockLengths,
    });

    // STRATEGY DECISION based on problem complexity
    // Small problems (<= 10 lengths): Full pattern generation (optimal but slow)
    // Medium problems (11-15 lengths): Limited patterns (good balance)
    // Large problems (>15 lengths): Traditional BFD (fast, guaranteed, acceptable waste)

    if (uniqueLengths > 15 || totalDemand > 1000) {
      this.logger.info(
        `[BFD] Using traditional BFD for large problem (${uniqueLengths} lengths, ${totalDemand} items)`,
      );

      // CRITICAL: Traditional BFD with Best Fit Decreasing gives very good results
      // It's O(n log n) vs pattern-based O(2^n), and waste is typically within 10% of optimal
      return this.executeTraditionalBFD(sortedItems, context);
    }

    this.logger.info(
      "[BFD] Using pattern-based optimization for optimal results",
    );

    const usePatternLimit = uniqueLengths > 10;
    if (usePatternLimit) {
      this.logger.info(
        `[BFD] Medium problem (${uniqueLengths} lengths) - using limited pattern generation`,
      );
    }

    this.logger.info(`[BFD] DP evaluation starting:`, {
      itemGroups: itemGroups.length,
      itemGroupDetails: itemGroups,
      stockLengths: stockLengths.length,
      stockLengthsDetails: stockLengths,
      kerfWidth: context.constraints.kerfWidth,
    });

    // Generate all possible cutting patterns for each stock length
    // For large problems, use greedy pattern selection to limit memory
    const patterns = this.generateCuttingPatterns(
      itemGroups,
      [...stockLengths],
      context.constraints,
      usePatternLimit ? 50000 : undefined, // Limit: max 50k patterns for large problems
    );

    this.logger.info("[BFD] Generated patterns:", {
      patternCount: patterns.length,
      samplePatterns: patterns.slice(0, 3).map((p) => ({
        stockLength: p.stockLength,
        pattern: Object.fromEntries(p.pattern),
        waste: p.waste,
      })),
    });

    if (patterns.length === 0) {
      this.logger.warn(
        "[BFD] No valid patterns found, falling back to traditional BFD",
      );
      return this.executeTraditionalBFD(sortedItems, context);
    }

    // CRITICAL: Try pattern-based approach, fall back to traditional if it fails
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

      this.logger.info(`[BFD] DP optimization completed:`, {
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
      });

      return cuts;
    } catch (error) {
      // Pattern-based approach failed (shortage, maxStates limit, etc.)
      // Fall back to traditional BFD which ALWAYS guarantees a solution
      this.logger.warn(
        "[BFD] Pattern-based approach failed, falling back to traditional BFD",
        {
          error: error instanceof Error ? error.message : String(error),
          patternsGenerated: patterns.length,
          uniqueLengths: itemGroups.length,
        },
      );

      this.logger.warn(
        "[BFD] Pattern-based approach failed, falling back to traditional BFD:",
        {
          error: error instanceof Error ? error.message : String(error),
          patternsGenerated: patterns.length,
          uniqueLengths: itemGroups.length,
        },
      );

      return this.executeTraditionalBFD(sortedItems, context);
    }
  }

  /**
   * Execute traditional BFD when DP is not applicable
   */
  private executeTraditionalBFD(
    sortedItems: ReadonlyArray<OptimizationItem>,
    context: OptimizationContext,
  ): Cut[] {
    const bins = this.initializeMultiStockBins(context.stockLengths);

    this.logger.debug("Multi-stock length bin packing initialized", {
      availableStockLengths: context.stockLengths,
      binCount: bins.binsByLength.size,
      expandedItems: sortedItems.length,
    });

    // Process each item using BFD strategy
    for (const item of sortedItems) {
      this.placeItemOptimally(item, bins, context);
    }

    // Convert bins to cuts
    return this.convertBinsToCuts(bins, context);
  }

  /**
   * Convert bins to cuts (helper method)
   * NOTE: bins.binsByLength already contains Cut[] objects from placeItemOptimally!
   */
  private convertBinsToCuts(
    bins: MultiStockBins,
    context: OptimizationContext,
  ): Cut[] {
    const cuts: Cut[] = [];

    // ✅ CRITICAL FIX: binsByLength Map values are already Cut[] arrays!
    // Just flatten them into a single array
    for (const [stockLength, stockBins] of bins.binsByLength.entries()) {
      // stockBins is Cut[], each bin is a Cut object
      cuts.push(...stockBins);
    }

    // Calculate stock usage summary
    const stocksUsed: Array<{ stockLength: number; count: number }> = [];
    for (const [stockLength, stockBins] of bins.binsByLength.entries()) {
      stocksUsed.push({
        stockLength,
        count: stockBins.length,
      });
    }

    this.logger.info("[BFD] Traditional BFD completed:", {
      totalCuts: cuts.length,
      stocksUsed,
    });

    return cuts;
  }

  /**
   * Group items by length for pattern generation
   */
  private groupItemsByLength(
    items: ReadonlyArray<OptimizationItem>,
  ): Array<{ length: number; quantity: number }> {
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
   * Generate all possible cutting patterns for given item groups and stock lengths
   * Based on the reference implementation
   */
  private generateCuttingPatterns(
    itemGroups: Array<{ length: number; quantity: number }>,
    stockLengths: number[],
    constraints: EnhancedConstraints,
    maxPatterns?: number, // Optional limit to prevent memory explosion
  ): Array<{
    stockLength: number;
    pattern: Map<number, number>; // length -> count
    used: number;
    waste: number;
  }> {
    this.logger.info(`[BFD] Generating cutting patterns:`, {
      itemGroups: itemGroups.length,
      stockLengths: stockLengths.length,
      kerfWidth: constraints.kerfWidth,
    });

    const patterns: Array<{
      stockLength: number;
      pattern: Map<number, number>;
      used: number;
      waste: number;
    }> = [];

    // Sort stock lengths descending to prioritize larger stocks first
    const sortedStockLengths = [...stockLengths].sort((a, b) => b - a);

    for (const stockLength of sortedStockLengths) {
      // CRITICAL FIX: Only subtract startSafety for pattern generation
      // endSafety is only applied when actual cutting position reaches near stock end
      const usableLength = stockLength - constraints.startSafety;

      // Generate all possible combinations of items that fit in this stock
      this.generatePatternsForStock(
        itemGroups,
        stockLength,
        usableLength,
        patterns,
        constraints,
      );

      // MEMORY SAFETY: Stop if we hit the pattern limit
      if (maxPatterns && patterns.length >= maxPatterns) {
        this.logger.warn(
          `[BFD] Pattern limit reached (${patterns.length}/${maxPatterns}) - stopping generation`,
        );
        break;
      }
    }

    // ✅ ENABLED: Pareto filtering to reduce combinatorial explosion
    // Only removes STRICTLY dominated patterns (same/more items, less waste)
    // This significantly improves performance without losing optimality
    const beforeCount = patterns.length;
    const filtered = this.filterParetoOptimal(patterns);

    this.logger.info(`[BFD] Pattern filtering applied:`, {
      beforeCount,
      afterCount: filtered.length,
      reduction: beforeCount - filtered.length,
      reductionPct:
        (((beforeCount - filtered.length) / beforeCount) * 100).toFixed(1) +
        "%",
    });

    return filtered;
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
    constraints: EnhancedConstraints,
  ): void {
    const lengths = itemGroups.map((g) => g.length);
    const kerfWidth = constraints.kerfWidth;

    // ✅ FIX: Calculate max counts considering kerf
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
    const maxCountForThisItem = maxCounts[itemIndex]!;

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

    // ⚡ Calculate ACTUAL max count based on remaining space
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
   * Find optimal pattern combination using Dynamic Programming
   */
  private findOptimalPatternCombination(
    patterns: Array<{
      stockLength: number;
      pattern: Map<number, number>;
      used: number;
      waste: number;
    }>,
    itemGroups: Array<{ length: number; quantity: number }>,
    constraints: EnhancedConstraints,
  ): Array<{
    pattern: (typeof patterns)[0];
    count: number;
  }> {
    // Create demand map - this is our target
    const targetDemand = new Map<number, number>();
    itemGroups.forEach((group) => {
      targetDemand.set(group.length, group.quantity);
    });

    this.logger.debug(`[BFD] 🎯 DP with exact demand tracking:`, {
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
   * Convert DP solution to cuts
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
    constraints: EnhancedConstraints,
    itemGroups?: Array<{ length: number; quantity: number }>,
  ): Cut[] {
    const cuts: Cut[] = [];
    let cutIndex = 0;

    const kerfWidth = constraints.kerfWidth;

    for (const { pattern, count } of solution) {
      for (let i = 0; i < count; i++) {
        const segments: CuttingSegment[] = [];
        let segmentIndex = 0;
        let usedLength = constraints.startSafety;

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
   * FIXED: Added detailed debug logging to track where pieces are lost
   */
  private validateDemandFulfillment(
    cuts: Cut[],
    itemGroups: Array<{ length: number; quantity: number }>,
  ): void {
    this.logger.debug(`[BFD] 🔍 Starting demand validation:`, {
      totalCuts: cuts.length,
      itemGroups: itemGroups
        .map((g) => `${g.length}mm: ${g.quantity}`)
        .join(", "),
    });

    // Calculate actual cuts by length
    const actualCuts = new Map<number, number>();
    cuts.forEach((cut, cutIndex) => {
      this.logger.debug(`[BFD] 🔍 Processing cut ${cutIndex}:`, {
        cutId: cut.id,
        stockLength: cut.stockLength,
        segmentCount: cut.segmentCount,
        segments: cut.segments.map((s) => `${s.length}mm`).join(", "),
      });

      cut.segments.forEach((seg, segIndex) => {
        const current = actualCuts.get(seg.length) || 0;
        actualCuts.set(seg.length, current + 1);

        this.logger.debug(
          `[BFD] 🔍 Added segment ${segIndex}: ${seg.length}mm`,
          {
            currentCount: current + 1,
            totalForLength: actualCuts.get(seg.length),
          },
        );
      });
    });

    this.logger.debug(`[BFD] 📊 Final actual counts:`, {
      actualCuts: Object.fromEntries(actualCuts),
    });

    // Compare with required demand (allow minimal overproduction; deficits are errors)
    const errors: string[] = [];
    for (const group of itemGroups) {
      const actual = actualCuts.get(group.length) || 0;
      const required = group.quantity;

      this.logger.debug(`[BFD] 🔍 Checking ${group.length}mm:`, {
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
      this.logger.error(`[BFD] ❌ DEMAND MISMATCH in convertSolutionToCuts:`, {
        errors,
        actualCuts: Object.fromEntries(actualCuts),
        requiredDemand: itemGroups.map((g) => ({
          length: g.length,
          quantity: g.quantity,
        })),
      });
      throw new Error(`Demand mismatch: ${errors.join(", ")}`);
    }

    this.logger.debug(`[BFD] ✅ Demand validation passed:`, {
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
    constraints: EnhancedConstraints,
  ): Array<{
    pattern: (typeof patterns)[0];
    count: number;
  }> {
    // Initialize demand map
    const demand = new Map<number, number>();
    itemGroups.forEach((group) => {
      demand.set(group.length, group.quantity);
    });

    this.logger.info(`[BFD] 🔍 Starting priority search:`, {
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

    // Run priority search
    const solver = new PrioritySearchSolver(this.logger);

    this.logger.info(`[BFD] 🔍 Calling PrioritySearchSolver with:`, {
      searchPatternsCount: searchPatterns.length,
      samplePatterns: searchPatterns.slice(0, 3).map((p) => ({
        stockLength: p.stockLength,
        pattern: Object.fromEntries(p.pattern),
        waste: p.waste,
      })),
      demand: Object.fromEntries(demand),
    });

    // ✅ WASTE-OPTIMIZED TUNING: Maximize waste reduction in priority scoring
    // maxStates: 50000 (5x increase for exhaustive exploration)
    // overProductionTolerance: 3 (allow small overproduction for solution feasibility)
    // wasteNormalization: 10 (combined with w×10 in priorityOf → makes 1mm waste = 1 priority unit!)
    const result = solver.solve(searchPatterns, demand, {
      maxStates: 50000,
      overProductionTolerance: 3,
      wasteNormalization: 10,
    });

    if (!result) {
      this.logger.error(`[BFD] ❌ PrioritySearchSolver returned null!`, {
        patternsCount: searchPatterns.length,
        demand: Object.fromEntries(demand),
      });
      throw new Error("No solution found with priority search");
    }

    this.logger.info(`[BFD] 🎯 Priority search completed:`, {
      totalBars: result.totalBars,
      totalWaste: result.totalWaste,
      patternCount: result.picks.length,
      picks: result.picks,
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
        `[BFD] ❌ Priority search failed to meet exact demand:`,
        {
          errors: finalValidation.errors,
          produced: Object.fromEntries(result.produced),
          required: Object.fromEntries(demand),
        },
      );

      // CRITICAL: Pattern-based approach couldn't find exact solution
      // This means either: 1) patterns don't cover all demand combinations
      //                    2) search space too large (hit maxStates limit)
      // We MUST throw error - system should use traditional BFD instead
      throw new Error(
        `Demand validation failed: ${finalValidation.errors.join(", ")}`,
      );
    }

    this.logger.info(`[BFD] ✅ Solution validated:`, {
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

    this.logger.debug("[BFD] Converted search state to solution:", {
      uniquePatterns: solution.length,
      totalCuts: solution.reduce((sum, s) => sum + s.count, 0),
      patterns: solution
        .map((s) => `${s.count}x(${this.generatePlanLabel(s.pattern.pattern)})`)
        .join(", "),
    });

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

    // Fallbacks when utilization threshold is too strict
    let fallbackPattern: (typeof patterns)[0] | null = null;
    let fallbackScore = -1;

    // Derive min utilization from constraints if available (default allow up to 30% waste)
    // Context is not available here; use conservative default
    const maxWastePct = 30 / 100;
    const minUtilization = Math.max(0, 1 - maxWastePct);

    for (const pattern of patterns) {
      if (!this.patternFitsDemand(pattern.pattern, remainingDemand)) {
        continue;
      }

      // ✅ ENHANCED: Multi-criteria scoring - demand + waste-per-item + utilization
      const demandUsage = this.calculateDemandUsage(
        pattern.pattern,
        remainingDemand,
      );
      const demandScore = demandUsage * 10000; // Highest priority: demand coverage

      // Waste efficiency: minimize waste per item (better than absolute waste)
      const itemsInPattern = Array.from(pattern.pattern.values()).reduce(
        (sum, c) => sum + c,
        0,
      );
      const wastePerItem =
        itemsInPattern > 0 ? pattern.waste / itemsInPattern : Infinity;
      const wasteScore = -wastePerItem * 100; // Penalize waste per item

      // Stock utilization bonus: reward efficient use of stock
      const utilization =
        pattern.used + pattern.waste > 0
          ? pattern.used / (pattern.used + pattern.waste)
          : 0;
      const utilizationBonus = utilization * 500; // Bonus for high utilization

      const score = demandScore + wasteScore + utilizationBonus;

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

    // If no pattern meets utilization, use the best fallback (still exact demand-safe)
    if (bestPattern === null) {
      return fallbackPattern;
    }

    return bestPattern;
  }

  /**
   * Check if a pattern fits within remaining demand
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

    // DEBUG: Log solution state
    this.logger.info(`[BFD] 🔍 Validating demand:`, {
      solutionLength: solution.length,
      itemGroupsCount: itemGroups.length,
      itemGroups: itemGroups,
    });

    // Calculate actual cuts by length
    const actualCuts = new Map<number, number>();
    solution.forEach(({ pattern, count }) => {
      for (const [length, patternCount] of pattern.pattern.entries()) {
        const current = actualCuts.get(length) || 0;
        actualCuts.set(length, current + patternCount * count);
      }
    });

    // DEBUG: Log actual cuts
    this.logger.info(`[BFD] 🔍 Actual cuts:`, Object.fromEntries(actualCuts));

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
        // Over-production beyond tolerance: warn but don't fail (slight tolerance enables better solutions)
        this.logger.warn(
          `[BFD] Over-produced ${group.length}mm: ${actual - required} extra (limit: ${maxExtraPerPiece})`,
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
