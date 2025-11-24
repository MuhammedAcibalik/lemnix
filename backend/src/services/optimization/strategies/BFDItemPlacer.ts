/**
 * BFD Item Placement Strategy
 * Handles item placement, cut management, and remaining space optimization
 *
 * @module optimization/strategies
 * @version 1.0.0
 * @description Item placement and cut management logic for BFD algorithm
 */

import {
  OptimizationItem,
  Cut,
  CuttingSegment,
  ProfileType,
  WasteCategory,
} from "../../../types";
import { OptimizationContext } from "../core/OptimizationContext";
import { StockCalculator } from "../helpers/StockCalculator";
import {
  BFDBestFitFinder,
  type BestFitResult,
  type MultiStockBins,
} from "./BFDBestFitFinder";
import { BFDStockSelectionStrategy } from "./BFDStockSelectionStrategy";
import type { ILogger } from "../../logger";

/**
 * Material type constant
 */
const MATERIAL_TYPE = "aluminum" as const;

/**
 * Plan ID prefix
 */
const PLAN_ID_PREFIX = "bfd-plan";

/**
 * BFD Item Placer
 * Handles optimal item placement and cut management
 */
export class BFDItemPlacer {
  private readonly stockSelectionStrategy: BFDStockSelectionStrategy;

  constructor(
    private readonly logger: ILogger,
    private readonly bestFitFinder: BFDBestFitFinder,
    stockSelectionStrategy?: BFDStockSelectionStrategy,
  ) {
    // Use provided strategy or create new one
    this.stockSelectionStrategy =
      stockSelectionStrategy ?? new BFDStockSelectionStrategy(logger);
  }

  /**
   * Place item optimally using best-fit strategy
   * TRUE PIECE-BY-PIECE APPROACH: Each piece is processed individually, exactly like AI model
   *
   * Strategy (matching AI approach):
   * 1. For EACH piece individually:
   *    a) Check ALL existing cuts to find the one with minimum remaining space
   *    b) If found, place the piece in that cut
   *    c) If not found, create new cut with optimal stock length and place the piece
   * 2. This ensures maximum flexibility - each piece finds its optimal location independently
   *
   * Benefits:
   * - Maximum waste minimization (each piece goes to best possible location)
   * - No forced grouping (pieces can be distributed across different cuts)
   * - Matches AI model approach exactly
   *
   * @param item - Item to place
   * @param bins - Multi-stock bins
   * @param context - Optimization context
   * @param upcomingItems - Upcoming items for look-ahead (optional)
   */
  public placeItemOptimally(
    item: OptimizationItem,
    bins: MultiStockBins,
    context: OptimizationContext,
    upcomingItems: ReadonlyArray<OptimizationItem> = [],
    usedQuantities?: Map<number, number>, // Optional: track quantities used by optimizeRemainingSpace
  ): void {
    // Use provided usedQuantities map or create a new one
    const localUsedQuantities = usedQuantities || new Map<number, number>();

    // TRUE PIECE-BY-PIECE: Process each piece individually
    // This matches the AI model approach exactly
    for (let pieceIndex = 0; pieceIndex < item.quantity; pieceIndex++) {
      // Create single-piece item for this iteration
      const singlePieceItem: OptimizationItem = { ...item, quantity: 1 };

      // Find best fit location for this single piece across ALL existing cuts
      const bestFit = this.bestFitFinder.findBestFitLocation(
        singlePieceItem,
        bins,
        context,
        upcomingItems,
      );

      if (bestFit !== null) {
        // Place this single piece in the best-fit existing cut
        this.placeItemInExistingCut(
          singlePieceItem,
          bestFit,
          bins,
          context,
          upcomingItems,
          localUsedQuantities,
        );
      } else {
        // No existing cut fits this piece, create new cut with optimal stock
        const optimalStockLength =
          this.stockSelectionStrategy.selectOptimalStockLength(
            singlePieceItem,
            context,
            upcomingItems,
          );

        const placedQuantity = this.placeItemInNewCutSafe(
          singlePieceItem,
          bins,
          context,
          upcomingItems,
          {
            selectOptimalStockLength: () => optimalStockLength,
          },
          localUsedQuantities,
        );

        if (placedQuantity === 0) {
          // This should not happen if validation is correct
          this.logger.error(
            "[BFDItemPlacer] Failed to place piece in new stock - item too large?",
            {
              itemLength: item.length,
              pieceIndex: pieceIndex + 1,
              totalPieces: item.quantity,
              stockLengths: context.stockLengths,
              constraints: context.constraints,
            },
          );
          // Continue with next piece instead of breaking
        }
      }
    }
  }

  /**
   * Calculate how many pieces of an item can fit in a cut
   * Enhanced with numerical stability checks
   *
   * @param item - Item to calculate
   * @param cut - Cut to check
   * @param context - Optimization context
   * @returns Number of pieces that fit
   */
  public calculatePiecesThatFit(
    item: OptimizationItem,
    cut: Cut,
    context: OptimizationContext,
  ): number {
    // ✅ CRITICAL FIX: Calculate pieces that fit more accurately
    // First piece: item.length + kerfNeeded (if segmentCount > 0)
    // Subsequent pieces: item.length + kerfWidth (each)
    const kerfWidth = context.constraints.kerfWidth;
    const firstPieceKerf = StockCalculator.calculateKerfNeeded(
      cut.segmentCount,
      kerfWidth,
    );
    const firstPieceSpace = item.length + firstPieceKerf;

    if (cut.remainingLength < firstPieceSpace) {
      this.logger.info(
        "[BFDItemPlacer] DIAGNOSTIC - calculatePiecesThatFit: No space for first piece",
        {
          remainingLength: cut.remainingLength,
          firstPieceSpace,
          itemLength: item.length,
        },
      );
      return 0;
    }

    // Calculate remaining space after first piece
    const remainingAfterFirst = cut.remainingLength - firstPieceSpace;

    // Subsequent pieces need: item.length + kerfWidth each
    const spacePerSubsequentPiece =
      item.length + (kerfWidth > 0 ? kerfWidth : 0);

    // Calculate how many additional pieces fit
    const additionalPieces =
      spacePerSubsequentPiece > 0
        ? Math.floor(remainingAfterFirst / spacePerSubsequentPiece)
        : 0;

    const totalPiecesThatFit = 1 + additionalPieces;

    // Safety check: Ensure result is finite and non-negative
    if (!Number.isFinite(totalPiecesThatFit) || totalPiecesThatFit < 0) {
      this.logger.error(
        "[BFDItemPlacer] Numerical instability in calculatePiecesThatFit",
        {
          itemLength: item.length,
          remainingLength: cut.remainingLength,
          firstPieceKerf,
          firstPieceSpace,
          spacePerSubsequentPiece,
          totalPiecesThatFit,
        },
      );
      return 0; // Safe fallback
    }

    const result = Math.min(totalPiecesThatFit, item.quantity);

    this.logger.info(
      "[BFDItemPlacer] DIAGNOSTIC - calculatePiecesThatFit result",
      {
        itemLength: item.length,
        itemQuantity: item.quantity,
        cutRemainingLength: cut.remainingLength,
        cutSegmentCount: cut.segmentCount,
        kerfWidth,
        firstPieceKerf,
        firstPieceSpace,
        remainingAfterFirst,
        spacePerSubsequentPiece,
        additionalPieces,
        totalPiecesThatFit,
        finalResult: result,
      },
    );

    return result;
  }

  /**
   * Place item in existing cut
   * SIMPLIFIED: Now only places a single piece (quantity=1)
   *
   * @param item - Item to place (should have quantity=1)
   * @param bestFit - Best fit result
   * @param bins - Multi-stock bins
   * @param context - Optimization context
   * @param upcomingItems - Upcoming items (unused, kept for compatibility)
   * @param usedQuantities - Track quantities (unused, kept for compatibility)
   */
  public placeItemInExistingCut(
    item: OptimizationItem,
    bestFit: BestFitResult,
    bins: MultiStockBins,
    context: OptimizationContext,
    upcomingItems: ReadonlyArray<OptimizationItem> = [],
    usedQuantities?: Map<number, number>,
  ): void {
    const stockCuts = bins.binsByLength.get(bestFit.stockLength);
    if (stockCuts === undefined) {
      this.logger.error("[BFDItemPlacer] Stock length not found in bins", {
        requestedLength: bestFit.stockLength,
        availableLengths: Array.from(bins.binsByLength.keys()),
        itemLength: item.length,
      });
      throw new Error(
        `Internal error: Stock length ${bestFit.stockLength}mm not found in bins. Available: ${Array.from(bins.binsByLength.keys()).join(", ")}mm`,
      );
    }

    const cutIndex = stockCuts.findIndex((c) => c.id === bestFit.cut.id);
    if (cutIndex === -1) {
      this.logger.error("[BFDItemPlacer] Cut not found in stock cuts array", {
        stockLength: bestFit.stockLength,
        cutId: bestFit.cut.id,
        availableCuts: stockCuts.length,
      });
      throw new Error(
        `Internal error: Cut ${bestFit.cut.id} not found in stock length ${bestFit.stockLength}mm bins (${stockCuts.length} cuts available)`,
      );
    }

    // Get the CURRENT cut from bins (may have been updated by previous placements)
    const currentCut = stockCuts[cutIndex]!;

    const kerfNeeded = StockCalculator.calculateKerfNeeded(
      currentCut.segmentCount,
      context.constraints.kerfWidth,
    );

    // Add single piece to cut
    const updatedCut = this.addSegmentToCut(
      currentCut,
      item, // item.quantity should be 1
      kerfNeeded,
      context,
    );

    stockCuts[cutIndex] = updatedCut;
  }

  /**
   * Place item in new cut with balanced distribution
   * Enhanced error handling with detailed context
   *
   * @param item - Item to place
   * @param bins - Multi-stock bins
   * @param context - Optimization context
   * @param upcomingItems - Upcoming items for remaining space optimization (optional)
   * @param stockSelectionStrategy - Stock selection strategy (optional, uses default if not provided)
   */
  public placeItemInNewCutSafe(
    item: OptimizationItem,
    bins: MultiStockBins,
    context: OptimizationContext,
    upcomingItems: ReadonlyArray<OptimizationItem> = [],
    stockSelectionStrategy?: {
      selectOptimalStockLength(
        item: OptimizationItem,
        bins: MultiStockBins,
        context: OptimizationContext,
        upcomingItems?: ReadonlyArray<OptimizationItem>,
      ): number;
    },
    usedQuantities?: Map<number, number>, // Track quantities used by optimizeRemainingSpace
  ): number {
    // Use provided strategy or fallback to default logic
    let selectedStockLength: number;
    if (stockSelectionStrategy) {
      selectedStockLength = stockSelectionStrategy.selectOptimalStockLength(
        item,
        bins,
        context,
        upcomingItems,
      );
    } else {
      // Fallback: use smallest stock that fits
      const sortedStocks = [...context.stockLengths].sort((a, b) => a - b);
      selectedStockLength =
        sortedStocks[0] ?? Math.max(...context.stockLengths);
    }

    const stockCuts = bins.binsByLength.get(selectedStockLength);

    if (stockCuts === undefined) {
      this.logger.error(
        "[BFDItemPlacer] Stock length not found when creating new cut",
        {
          selectedLength: selectedStockLength,
          availableLengths: Array.from(bins.binsByLength.keys()),
          itemLength: item.length,
          itemQuantity: item.quantity,
        },
      );
      throw new Error(
        `Internal error: Stock length ${selectedStockLength}mm not found in bins when creating new cut. Available: ${Array.from(bins.binsByLength.keys()).join(", ")}mm`,
      );
    }

    const newCut = this.createNewStock(
      selectedStockLength,
      stockCuts.length,
      context.constraints,
    );

    // ✅ CRITICAL FIX: Calculate how many pieces actually fit in the new stock
    // Instead of trying to add ALL items (which might be 1000s), only add what fits
    const piecesThatFit = this.calculatePiecesThatFit(item, newCut, context);

    this.logger.info(
      "[BFDItemPlacer] DIAGNOSTIC - placeItemInNewCutSafe called",
      {
        methodName: "placeItemInNewCutSafe",
        itemLength: item.length,
        itemQuantity: item.quantity,
        newCutRemainingLength: newCut.remainingLength,
        piecesThatFit,
        stockLength: selectedStockLength,
      },
    );

    if (piecesThatFit <= 0) {
      // This should technically not happen if selectOptimalStockLength works correctly,
      // but if item is longer than stock (minus safety), it might.
      // Or if the smallest stock was selected but item doesn't fit.
      this.logger.warn(
        "[BFDItemPlacer] Item does not fit in selected new stock",
        {
          itemLength: item.length,
          stockLength: selectedStockLength,
          piecesThatFit,
        },
      );
      return 0;
    }

    const quantityToPlace = Math.min(item.quantity, piecesThatFit);

    this.logger.info(
      "[BFDItemPlacer] DIAGNOSTIC - Quantity to place calculated",
      {
        quantityToPlace,
        piecesThatFit,
        requestedQuantity: item.quantity,
      },
    );

    const updatedCut = this.addSegmentToCut(
      newCut,
      { ...item, quantity: quantityToPlace },
      0,
      context,
    );

    // CRITICAL FIX: Disable optimizeRemainingSpace to prevent overproduction
    // This function was causing items to be used multiple times, leading to overproduction
    // Instead, we just use the cut as-is without trying to fill remaining space

    stockCuts.push(updatedCut);

    this.logger.debug("[BFDItemPlacer] Item placed in new cut (v2 fix)", {
      itemLength: item.length,
      requestedQuantity: item.quantity,
      placedQuantity: quantityToPlace,
      selectedLength: selectedStockLength,
      totalCuts: stockCuts.length,
    });

    return quantityToPlace;
  }

  /**
   * Optimize remaining space in a cut by trying to fit different item lengths
   *
   * Strategy:
   * 1. Sort remaining items by length (ascending) to try smaller pieces first
   * 2. Try to fit each item in remaining space
   * 3. Place items that fit
   * 4. Continue until no more items fit
   *
   * @param cut - Cut to optimize
   * @param remainingItems - Remaining items to try
   * @param context - Optimization context
   * @returns Optimized cut
   */
  public optimizeRemainingSpace(
    cut: Cut,
    remainingItems: OptimizationItem[],
    context: OptimizationContext,
    usedQuantities?: Map<number, number>, // Track quantities used to prevent double-counting
  ): Cut {
    // Try to fill remaining space with different item lengths
    let optimizedCut = cut;
    const constraints = context.constraints;

    // Sort remaining items by length (ascending) to try smaller pieces first
    // CRITICAL FIX: Filter out items that have already been fully consumed
    const sortedRemaining = [...remainingItems]
      .filter((item) => {
        // Check if item still has available quantity
        const used = usedQuantities?.get(item.length) || 0;
        const available = (item.quantity || 1) - used;
        return item.length < optimizedCut.remainingLength && available > 0;
      })
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
        // ✅ CRITICAL FIX: Calculate how many pieces actually fit before adding
        const piecesThatFit = this.calculatePiecesThatFit(
          item,
          optimizedCut,
          context,
        );

        // CRITICAL FIX: Account for already used quantity from this item
        const used = usedQuantities?.get(item.length) || 0;
        const available = (item.quantity || 1) - used;
        const quantityToPlace = Math.min(available, piecesThatFit);

        if (quantityToPlace <= 0) {
          // No available quantity, skip this item
          continue;
        }

        this.logger.info(
          "[BFDItemPlacer] DIAGNOSTIC - optimizeRemainingSpace: Placing item",
          {
            itemLength: item.length,
            itemQuantity: item.quantity,
            usedQuantity: used,
            availableQuantity: available,
            piecesThatFit,
            quantityToPlace,
            cutRemainingLength: optimizedCut.remainingLength,
          },
        );

        optimizedCut = this.addSegmentToCut(
          optimizedCut,
          { ...item, quantity: quantityToPlace },
          kerfNeeded,
          context,
        );

        // CRITICAL FIX: Track used quantity in the shared map
        // This prevents the same item from being used again in future placements
        if (usedQuantities) {
          const currentUsed = usedQuantities.get(item.length) || 0;
          usedQuantities.set(item.length, currentUsed + quantityToPlace);
        } else {
          // Fallback: Update local list if no tracker provided
          const itemIndex = remainingItems.findIndex((i) => i === item);
          if (itemIndex !== -1) {
            const itemToUpdate = remainingItems[itemIndex]!;
            const remainingQuantity =
              (itemToUpdate.quantity || 1) - quantityToPlace;

            if (remainingQuantity <= 0) {
              remainingItems.splice(itemIndex, 1);
            } else {
              remainingItems[itemIndex] = {
                ...itemToUpdate,
                quantity: remainingQuantity,
              };
            }
          }
        }

        this.logger.debug("[BFDItemPlacer] Filled remaining space with item", {
          originalRemaining: cut.remainingLength.toFixed(2),
          newRemaining: optimizedCut.remainingLength.toFixed(2),
          itemLength: item.length,
          stockLength: optimizedCut.stockLength,
        });
      }
    }

    return optimizedCut;
  }

  /**
   * Create new empty stock
   * Enhanced validation for stock configuration
   *
   * @param stockLength - Stock length
   * @param index - Stock index
   * @param constraints - Optimization constraints
   * @returns New cut
   */
  private createNewStock(
    stockLength: number,
    index: number,
    constraints: OptimizationContext["constraints"],
  ): Cut {
    const usableLength =
      stockLength - constraints.startSafety - constraints.endSafety;

    if (usableLength <= 0) {
      this.logger.error(
        "[BFDItemPlacer] Invalid stock configuration detected",
        {
          stockLength,
          startSafety: constraints.startSafety,
          endSafety: constraints.endSafety,
          usableLength,
        },
      );
      throw new Error(
        `Invalid stock configuration: stockLength=${stockLength}mm with safety margins (start=${constraints.startSafety}mm, end=${constraints.endSafety}mm) leaves ${usableLength}mm usable space. This should have been caught in validation.`,
      );
    }

    // Additional safety check for numeric stability
    if (!Number.isFinite(usableLength) || usableLength > stockLength) {
      this.logger.error(
        "[BFDItemPlacer] Numerical instability in usableLength calculation",
        {
          stockLength,
          usableLength,
          constraints,
        },
      );
      throw new Error(
        `Numerical error: Invalid usableLength=${usableLength}mm calculated from stockLength=${stockLength}mm`,
      );
    }

    return {
      id: this.generateCutId(),
      cuttingPlanId: `${PLAN_ID_PREFIX}-${index}`,
      stockIndex: index,
      stockLength,
      materialType: MATERIAL_TYPE,
      segments: [],
      segmentCount: 0,
      usedLength: 0, // CRITICAL FIX: usedLength does NOT include startSafety (startSafety is subtracted from stockLength)
      remainingLength: usableLength,
      wasteCategory: WasteCategory.MINIMAL,
      isReclaimable: false,
      estimatedCuttingTime: 0,
      setupTime: 5,
      kerfLoss: 0,
      safetyMargin: constraints.startSafety + constraints.endSafety,
      toleranceCheck: true,
      sequence: index,
    };
  }

  /**
   * Add segment to cut with rigorous validation
   *
   * @param cut - Cut to add segment to
   * @param item - Item to add
   * @param kerfNeeded - Kerf needed before this segment
   * @param context - Optimization context
   * @returns Updated cut
   */
  private addSegmentToCut(
    cut: Cut,
    item: OptimizationItem,
    _initialKerfNeeded: number, // Deprecated: kerfNeeded is now calculated inside the method
    context: OptimizationContext,
  ): Cut {
    // Handle multiple pieces of the same length
    const quantity = item.quantity || 1;
    let currentCut = cut;

    for (let i = 0; i < quantity; i++) {
      const newSegmentCount = currentCut.segmentCount + 1;

      // ✅ CRITICAL FIX: Recalculate kerfNeeded for each iteration
      // kerfNeeded changes as segmentCount increases (first piece has no kerf before it)
      const kerfNeeded = StockCalculator.calculateKerfNeeded(
        currentCut.segmentCount,
        context.constraints.kerfWidth,
      );

      // ✅ CRITICAL FIX: Validate item fits before adding
      // Calculate what the new usedLength would be
      const newUsedLength = currentCut.usedLength + item.length + kerfNeeded;
      // Calculate available space accounting for startSafety and endSafety
      const availableSpace =
        currentCut.stockLength -
        context.constraints.startSafety -
        context.constraints.endSafety;

      // Validate that newUsedLength doesn't exceed available space
      if (newUsedLength > availableSpace) {
        const overflow = newUsedLength - availableSpace;
        this.logger.error(
          "[BFDItemPlacer] Item exceeds available space - preventing overflow",
          {
            cutId: currentCut.id,
            itemLength: item.length,
            currentUsedLength: currentCut.usedLength,
            newUsedLength,
            availableSpace,
            stockLength: currentCut.stockLength,
            startSafety: context.constraints.startSafety,
            endSafety: context.constraints.endSafety,
            kerfNeeded,
            segmentCount: currentCut.segmentCount,
            iteration: i + 1,
            totalQuantity: quantity,
            overflow: overflow.toFixed(3),
          },
        );
        throw new Error(
          `Cannot add item of length ${item.length}mm to cut ${currentCut.id} ` +
            `(piece ${i + 1} of ${quantity}): ` +
            `would exceed available space. ` +
            `Current used: ${currentCut.usedLength.toFixed(2)}mm, ` +
            `Available: ${availableSpace.toFixed(2)}mm, ` +
            `Overflow: ${overflow.toFixed(3)}mm. ` +
            `[DEBUG: SentQty=${item.quantity}, QtyToPlace=${quantity}]`,
        );
      }

      // CRITICAL FIX: Position includes startSafety (for segment positioning), but usedLength does NOT
      const position =
        context.constraints.startSafety + currentCut.usedLength + kerfNeeded;
      const segment = this.createSegment(
        currentCut,
        { ...item, quantity: 1 }, // Create segment for single piece
        position,
        newSegmentCount,
        context,
      );

      // CRITICAL FIX: Remaining length = stockLength - startSafety - usedLength - endSafety
      const newRemainingLength = Math.max(
        0,
        currentCut.stockLength -
          context.constraints.startSafety -
          newUsedLength -
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
   *
   * @param cut - Cut this segment belongs to
   * @param item - Item for this segment
   * @param position - Start position on stock
   * @param sequenceNumber - Sequence number
   * @param context - Optimization context
   * @returns New segment
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
      tolerance: 0.5,
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
   *
   * @param stockLength - Stock length
   * @param usedLength - Used length
   * @param endSafety - End safety margin
   * @returns Remaining length
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
   * Enhanced error message with context
   *
   * @param cut - Cut to validate
   */
  private validateCutInvariant(cut: Cut): void {
    if (cut.segmentCount !== cut.segments.length) {
      this.logger.error("[BFDItemPlacer] Cut invariant violation detected", {
        cutId: cut.id,
        segmentCount: cut.segmentCount,
        actualSegments: cut.segments.length,
        stockLength: cut.stockLength,
        usedLength: cut.usedLength,
      });
      throw new Error(
        `Invariant violation in cut ${cut.id}: segmentCount=${cut.segmentCount} !== segments.length=${cut.segments.length}. This indicates a programming error in segment management.`,
      );
    }

    // ✅ CRITICAL FIX: Validate accounting - usedLength should not exceed available space
    // Note: usedLength doesn't include startSafety/endSafety, so we check against available space
    // Available space = stockLength - startSafety - endSafety
    // This check is done in addSegmentToCut, but we double-check here for safety
  }

  /**
   * Generate unique cut ID
   */
  private generateCutId(): string {
    return `cut-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique segment ID
   */
  private generateSegmentId(): string {
    return `seg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialize bins for each stock length
   *
   * @param stockLengths - Available stock lengths
   * @returns Multi-stock bins
   */
  public initializeMultiStockBins(
    stockLengths: ReadonlyArray<number>,
  ): MultiStockBins {
    const binsByLength = new Map<number, Cut[]>();

    for (const stockLength of stockLengths) {
      binsByLength.set(stockLength, []);
    }

    return { binsByLength };
  }

  /**
   * Convert bins to cuts
   * NOTE: bins.binsByLength already contains Cut[] objects from placeItemOptimally!
   *
   * @param bins - Multi-stock bins
   * @param context - Optimization context
   * @returns Array of cuts
   */
  public convertBinsToCuts(
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

    this.logger.info("[BFDItemPlacer] Traditional BFD completed:", {
      totalCuts: cuts.length,
      stocksUsed,
    });

    return cuts;
  }

  /**
   * Execute traditional BFD when DP is not applicable
   * Uses BFDItemPlacer service for item placement
   *
   * @param sortedItems - Sorted items (descending by length)
   * @param context - Optimization context
   * @returns Array of cuts
   */
  public executeTraditionalBFD(
    sortedItems: ReadonlyArray<OptimizationItem>,
    context: OptimizationContext,
  ): Cut[] {
    const bins = this.initializeMultiStockBins(context.stockLengths);

    this.logger.debug("Multi-stock length bin packing initialized", {
      availableStockLengths: context.stockLengths,
      binCount: bins.binsByLength.size,
      expandedItems: sortedItems.length,
    });

    // CRITICAL FIX: Track consumed quantities globally to prevent double-counting
    // This Map tracks how much of each item length has been consumed by optimizeRemainingSpace
    // Key insight: optimizeRemainingSpace uses items from upcomingItems, so we need to track
    // what it consumes and subtract that from the original item quantities when we process them
    const globalConsumedQuantities = new Map<number, number>(); // length -> consumed quantity

    // Process each item using BFD strategy
    for (let i = 0; i < sortedItems.length; i++) {
      const item = sortedItems[i]!;
      const upcomingItems = sortedItems.slice(i + 1);

      // CRITICAL FIX: Check if this item was partially consumed by optimizeRemainingSpace
      // If so, we need to account for that and only place the remaining quantity
      const alreadyConsumed = globalConsumedQuantities.get(item.length) || 0;
      const remainingQuantity = item.quantity - alreadyConsumed;

      if (remainingQuantity <= 0) {
        // Item already fully consumed by optimizeRemainingSpace in previous placements
        this.logger.info(
          "[BFDItemPlacer] Item already fully consumed by optimizeRemainingSpace",
          {
            itemLength: item.length,
            originalQuantity: item.quantity,
            consumedQuantity: alreadyConsumed,
          },
        );
        continue;
      }

      // Create item with remaining quantity
      const itemToPlace: OptimizationItem = {
        ...item,
        quantity: remainingQuantity,
      };

      // Create usedQuantities map for this item placement
      // This will be updated by optimizeRemainingSpace to track what it consumes from upcomingItems
      const usedQuantities = new Map<number, number>();

      // Place item with remaining quantity
      // optimizeRemainingSpace will update usedQuantities with items it consumes from upcomingItems
      this.placeItemOptimally(
        itemToPlace,
        bins,
        context,
        upcomingItems,
        usedQuantities,
      );

      // CRITICAL FIX: Update global consumed quantities with what optimizeRemainingSpace used
      // These are items from upcomingItems that were consumed, so we need to subtract them
      // when we process those items later
      for (const [length, used] of usedQuantities.entries()) {
        // Only track consumption of items that are in upcomingItems (future items)
        // Don't track the current item itself, as it's already accounted for in remainingQuantity
        if (length !== item.length) {
          const currentConsumed = globalConsumedQuantities.get(length) || 0;
          globalConsumedQuantities.set(length, currentConsumed + used);

          this.logger.info(
            "[BFDItemPlacer] Tracked consumption from optimizeRemainingSpace",
            {
              itemLength: length,
              consumedQuantity: used,
              totalConsumed: currentConsumed + used,
            },
          );
        }
      }
    }

    // Convert bins to cuts
    return this.convertBinsToCuts(bins, context);
  }
}
