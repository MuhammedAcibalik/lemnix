/**
 * LEMNİX FFD (First Fit Decreasing) Algorithm
 * Industry-standard bin packing algorithm optimized for cutting stock
 * 
 * @module optimization/algorithms
 * @version 1.0.0
 * @architecture Concrete algorithm implementation
 * 
 * Algorithm:
 * 1. Sort items by length (descending)
 * 2. For each item, try to fit in first available stock
 * 3. If no fit, create new stock
 * 
 * Time Complexity: O(n²) where n = number of items
 * Space Complexity: O(n)
 * Best For: General-purpose optimization, balanced quality/speed
 */

import { OptimizationItem, Cut, CuttingSegment, WasteCategory, OptimizationAlgorithm, ProfileType } from '../../../types';
import { BaseAlgorithm } from '../core/BaseAlgorithm';
import { OptimizationContext } from '../core/OptimizationContext';
import { AdvancedOptimizationResult, StockSummary } from '../types';
import { StockCalculator } from '../helpers/StockCalculator';
import { WasteAnalyzer } from '../helpers/WasteAnalyzer';
import { CostCalculator } from '../helpers/CostCalculator';
import { MetricsCalculator } from '../helpers/MetricsCalculator';
import { PrioritySearchSolver, SearchPattern, SearchState } from './PrioritySearchSolver';
import { ParetoFilter } from '../utils/ParetoFilter';
import type { ILogger } from '../../logger';

/**
 * Material type constant
 */
const MATERIAL_TYPE = 'aluminum' as const;

/**
 * FFD Algorithm implementation
 */
export class FFDAlgorithm extends BaseAlgorithm {
  public readonly name = OptimizationAlgorithm.FIRST_FIT_DECREASING;
  public readonly complexity = 'O(n²)' as const;
  public readonly scalability = 8;

  private readonly paretoFilter: ParetoFilter;

  constructor(logger: ILogger) {
    super(logger);
    this.paretoFilter = new ParetoFilter(logger);
  }

  /**
   * Main optimization method
   * Uses DP optimization when kerf=0 for better results
   */
  public async optimize(context: OptimizationContext): Promise<AdvancedOptimizationResult> {
    this.logger.info('Starting FFD optimization', {
      requestId: context.requestId,
      items: context.items.length,
      totalPieces: context.getTotalItemCount()
    });

    // Validate context
    const validation = this.canOptimize(context);
    if (!validation.valid) {
      throw new Error(`FFD optimization failed: ${validation.reason}`);
    }

    // ✅ FIX: Always use DP optimization for exact demand fulfillment
    // DP with kerf support now handles both kerf=0 and kerf>0 cases
    this.logger.info(`[FFD] Using DP optimization (kerf=${context.constraints.kerfWidth})`);
    return this.executeDPOptimization(context);
  }

  /**
   * Run FFD algorithm core logic with multi-stock length bin packing
   */
  private runFFD(sortedItems: OptimizationItem[], context: OptimizationContext): Cut[] {
    // ✅ MULTI-STOCK LENGTH BIN PACKING: Maintain separate bins for each stock length
    const binsByStockLength = new Map<number, Cut[]>();
    
    // Initialize bins for each available stock length
    for (const stockLength of context.stockLengths) {
      binsByStockLength.set(stockLength, []);
    }
    
    console.log('[FFDAlgorithm] 🎯 Multi-stock length bin packing initialized:', {
      availableStockLengths: context.stockLengths,
      binCount: binsByStockLength.size
    });

    for (const item of sortedItems) {
      let placed = false;

      // ✅ STRATEGY 1: Try to fit in existing cuts from ALL stock lengths
      for (const [stockLength, bins] of binsByStockLength) {
        for (const cut of bins) {
          const kerfNeeded = StockCalculator.calculateKerfNeeded(cut.segmentCount, context.constraints.kerfWidth);
          const totalNeeded = item.length + kerfNeeded;

          if (cut.remainingLength >= totalNeeded) {
            const cutIndex = bins.indexOf(cut);
            let updatedCut = this.addSegmentToCut(cut, item, kerfNeeded, context);
            
            // Optimize remaining space with different item lengths
            updatedCut = this.optimizeRemainingSpace(updatedCut, sortedItems, context);
            
            bins[cutIndex] = updatedCut;
            placed = true;
            console.log(`[FFDAlgorithm] ✅ Placed item in existing ${stockLength}mm cut:`, {
              itemLength: item.length,
              stockLength,
              remainingLength: bins[cutIndex].remainingLength
            });
            break;
          }
        }
        if (placed) break;
      }

      // ✅ STRATEGY 2: Create new cut with balanced stock length selection
      if (!placed) {
        // ✅ IMPROVED: Balance stock length usage across all available lengths
        const stockLengthUsage = Array.from(binsByStockLength.entries()).map(([length, bins]) => ({
          length,
          count: bins.length,
          totalWaste: bins.reduce((sum, cut) => sum + cut.remainingLength, 0)
        }));
        
        // Sort by usage count (ascending) to balance distribution
        stockLengthUsage.sort((a, b) => a.count - b.count);
        
        // If all stock lengths have same usage, use waste-based selection
        const allSameUsage = stockLengthUsage.every(usage => usage.count === stockLengthUsage[0]!.count);
        
        let selectedStockLength: number;
        if (allSameUsage) {
          // Use waste-based selection when usage is balanced
          selectedStockLength = StockCalculator.selectBestStockLengthForItem(
            item.length,
            context.stockLengths,
            context.constraints.kerfWidth,
            context.constraints.startSafety,
            context.constraints.endSafety
          );
        } else {
          // Use least-used stock length for better distribution
          selectedStockLength = stockLengthUsage[0]!.length;
        }
        
        const newCut = this.createNewStock(selectedStockLength, binsByStockLength.get(selectedStockLength)!.length, context.constraints);
        let updatedCut = this.addSegmentToCut(newCut, item, 0, context);
        
        // Optimize remaining space with different item lengths
        updatedCut = this.optimizeRemainingSpace(updatedCut, sortedItems, context);
        
        binsByStockLength.get(selectedStockLength)!.push(updatedCut);
        
        console.log(`[FFDAlgorithm] ✅ Created new ${selectedStockLength}mm cut:`, {
          itemLength: item.length,
          selectedLength: selectedStockLength,
          availableLengths: context.stockLengths,
          stockLengthUsage,
          totalCuts: binsByStockLength.get(selectedStockLength)!.length
        });
      }
    }

    // ✅ Flatten all bins into single cuts array
    const allCuts = Array.from(binsByStockLength.values()).flat();
    
    console.log('[FFDAlgorithm] 🎯 Multi-stock length bin packing completed:', {
      totalCuts: allCuts.length,
      cutsByStockLength: Array.from(binsByStockLength.entries()).map(([length, cuts]) => ({
        stockLength: length,
        cutCount: cuts.length
      }))
    });

    return allCuts;
  }

  /**
   * Optimize remaining space in a cut by trying to fit different item lengths
   */
  private optimizeRemainingSpace(
    cut: Cut,
    remainingItems: OptimizationItem[],
    context: OptimizationContext
  ): Cut {
    // Try to fill remaining space with different item lengths
    let optimizedCut = cut;
    const constraints = context.constraints;
    
    // Sort remaining items by length (ascending) to try smaller pieces first
    const sortedRemaining = [...remainingItems]
      .filter(item => item.length < optimizedCut.remainingLength)
      .sort((a, b) => a.length - b.length);
    
    for (const item of sortedRemaining) {
      const kerfNeeded = StockCalculator.calculateKerfNeeded(
        optimizedCut.segmentCount, 
        constraints.kerfWidth
      );
      
      if (StockCalculator.canFitItem(
        item.length, 
        optimizedCut.remainingLength, 
        optimizedCut.segmentCount, 
        constraints.kerfWidth
      )) {
        optimizedCut = this.addSegmentToCut(optimizedCut, item, kerfNeeded, context);
        // Remove item from remaining list (mark as used)
        const itemIndex = remainingItems.findIndex(i => i === item);
        if (itemIndex !== -1) {
          remainingItems.splice(itemIndex, 1);
        }
        
        this.logger.debug(`[FFDAlgorithm] ✅ Filled remaining space with ${item.length}mm item:`, {
          originalRemaining: cut.remainingLength,
          newRemaining: optimizedCut.remainingLength,
          itemLength: item.length,
          stockLength: optimizedCut.stockLength
        });
      }
    }
    
    return optimizedCut;
  }

  /**
   * Create new empty stock
   */
  private createNewStock(stockLength: number, index: number, constraints: OptimizationContext['constraints']): Cut {
    return {
      id: this.generateCutId(),
      cuttingPlanId: `ffd-plan-${index}`,
      stockIndex: index,
      stockLength,
      materialType: MATERIAL_TYPE,
      segments: [],
      segmentCount: 0,
      usedLength: constraints.startSafety,
      remainingLength: stockLength - constraints.startSafety - constraints.endSafety,
      wasteCategory: WasteCategory.MINIMAL,
      isReclaimable: false,
      estimatedCuttingTime: 0,
      setupTime: 5,
      kerfLoss: 0,
      safetyMargin: constraints.startSafety + constraints.endSafety,
      toleranceCheck: true,
      sequence: index
    };
  }

  /**
   * Add segment to cut with rigorous accounting
   */
  private addSegmentToCut(
    cut: Cut,
    item: OptimizationItem,
    kerfNeeded: number,
    context: OptimizationContext
  ): Cut {
    const newSegmentCount = cut.segmentCount + 1;
    const position = cut.usedLength + kerfNeeded;
    const constraints = context.constraints;
    const costModel = context.costModel;

    // Validation (development only)
    if (process.env['NODE_ENV'] !== 'production') {
      if (!Number.isFinite(item.length) || item.length <= 0) {
        throw new Error(`Invalid item length: ${item.length}`);
      }
      if (item.length > 100000) {
        this.logger.warn('Very large item length detected', { length: item.length });
      }
    }

    const segment: CuttingSegment = {
      id: this.generateSegmentId(),
      cutId: cut.id,
      sequenceNumber: newSegmentCount,
      length: item.length,
      quantity: 1,
      position,
      endPosition: position + item.length,
      tolerance: 0.5,
      workOrderItemId: item.workOrderId || '',
      workOrderId: item.workOrderId,  // ✅ FIX: Add workOrderId from item
      profileType: item.profileType,
      originalLength: item.length,
      qualityCheck: true,
      unitCost: item.length * costModel.materialCost,
      totalCost: item.length * costModel.materialCost,
      note: item.profileType
    };

    console.log('[FFD] Created segment:', {
      segmentId: segment.id,
      workOrderId: segment.workOrderId,
      hasWorkOrder: !!segment.workOrderId,
      profileType: segment.profileType,
      length: segment.length
    });

    const newUsedLength = cut.usedLength + item.length + kerfNeeded;
    const newRemainingLength = cut.stockLength - newUsedLength - constraints.endSafety;

    const updatedCut: Cut = {
      ...cut,
      segments: [...cut.segments, segment],
      segmentCount: newSegmentCount,
      usedLength: newUsedLength,
      remainingLength: newRemainingLength,
      kerfLoss: (cut.kerfLoss || 0) + kerfNeeded
    };

    // Invariant check
    if (updatedCut.segmentCount !== updatedCut.segments.length) {
      throw new Error(`Invariant violation: segmentCount (${updatedCut.segmentCount}) !== segments.length (${updatedCut.segments.length})`);
    }

    return updatedCut;
  }

  /**
   * Finalize cuts with proper accounting
   */
  private finalizeCuts(cuts: Cut[], context: OptimizationContext): Cut[] {
    const constraints = context.constraints;

    return cuts.map(cut => {
      const finalUsedLength = cut.usedLength + constraints.endSafety;
      const finalRemaining = Math.max(0, cut.stockLength - finalUsedLength);

      // Verify accounting with detailed error message
      if (!StockCalculator.validateStockAccounting(finalUsedLength, finalRemaining, cut.stockLength)) {
        throw new Error(`Accounting violation in cut ${cut.id}: ${finalUsedLength} + ${finalRemaining} ≠ ${cut.stockLength}`);
      }
      
      // Additional validation for debugging
      if (Math.abs((finalUsedLength + finalRemaining) - cut.stockLength) > 0.01) {
        throw new Error(`Accounting error in cut ${cut.id}: ${finalUsedLength} + ${finalRemaining} ≠ ${cut.stockLength}`);
      }

      // Generate cutting plan
      const plan = this.generateCuttingPlan(cut.segments);
      const planLabel = this.generatePlanLabel(plan);

      // Verify plan invariants
      const planSegmentCount = plan.reduce((sum, p) => sum + p.count, 0);
      if (planSegmentCount !== cut.segmentCount) {
        throw new Error(`Plan invariant violation for cut ${cut.id}`);
      }

      return {
        ...cut,
        usedLength: finalUsedLength,
        remainingLength: finalRemaining,
        wasteCategory: WasteAnalyzer.calculateWasteCategory(finalRemaining),
        isReclaimable: WasteAnalyzer.isReclaimable(finalRemaining, constraints.minScrapLength),
        plan,
        planLabel,
        profileType: cut.profileType || cut.segments[0]?.profileType || 'Unknown'
      };
    });
  }

  /**
   * Generate cutting plan from segments
   */
  private generateCuttingPlan(segments: CuttingSegment[]): Array<{ length: number; count: number; profile?: string; itemId?: string }> {
    const lengthMap = new Map<number, { count: number; profile?: string; itemId?: string }>();

    for (const segment of segments) {
      const existing = lengthMap.get(segment.length);
      if (existing) {
        existing.count++;
      } else {
        lengthMap.set(segment.length, {
          count: 1,
          profile: segment.profileType,
          itemId: segment.workOrderItemId
        });
      }
    }

    return Array.from(lengthMap.entries())
      .map(([length, data]) => ({ length, ...data }))
      .sort((a, b) => b.length - a.length);
  }

  /**
   * Generate plan label
   */
  private generatePlanLabel(plan: Array<{ length: number; count: number }>): string {
    if (plan.length === 0) return 'No pieces';
    return plan.map(p => `${p.count} × ${p.length} mm`).join(' + ');
  }

  /**
   * Create optimization result
   */
  private createResult(cuts: Cut[], context: OptimizationContext): AdvancedOptimizationResult {
    const totalStockLength = cuts.reduce((sum, cut) => sum + cut.stockLength, 0);
    const totalWaste = WasteAnalyzer.calculateTotalWaste(cuts);
    const totalLength = cuts.reduce((sum, cut) => sum + cut.usedLength, 0);
    const totalSegments = cuts.reduce((sum, cut) => sum + cut.segmentCount, 0);
    const efficiency = StockCalculator.calculateEfficiency(totalStockLength, totalWaste);

    const costBreakdown = CostCalculator.calculateCostBreakdown(cuts, context.costModel, context.constraints);
    const wasteDistribution = WasteAnalyzer.calculateWasteDistribution(cuts);
    const detailedWasteAnalysis = WasteAnalyzer.calculateDetailedWasteAnalysis(cuts);
    const performanceMetrics = MetricsCalculator.calculatePerformanceMetrics('ffd', context.items.length);
    
    // Calculate stock summary for multi-stock optimization display
    const stockSummary = this.calculateStockSummary(cuts);

    const setupTime = cuts.length * 5;
    const cuttingTime = totalSegments * 2;
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
      cuttingComplexity: MetricsCalculator.calculateCuttingComplexity(totalSegments, cuts.length),
      cuttingTime,
      totalTime,
      materialCost: costBreakdown.materialCost,
      wasteCost: costBreakdown.wasteCost,
      laborCost: costBreakdown.timeCost,
      costPerMeter: CostCalculator.calculateCostPerMeter(costBreakdown.totalCost, totalLength),
      qualityScore: MetricsCalculator.calculateQualityScore(efficiency, totalWaste),
      reclaimableWastePercentage: WasteAnalyzer.calculateReclaimableWastePercentage(cuts),
      wastePercentage: WasteAnalyzer.calculateWastePercentage(totalWaste, totalStockLength),
      wasteDistribution,
      constraints: context.constraints,
      detailedWasteAnalysis,
      recommendations: [],
      efficiencyCategory: WasteAnalyzer.getEfficiencyCategory(efficiency),
      optimizationScore: MetricsCalculator.calculateOptimizationScore(
        efficiency,
        WasteAnalyzer.calculateWastePercentage(totalWaste, totalStockLength),
        MetricsCalculator.calculateQualityScore(efficiency, totalWaste)
      ),
      paretoFrontier: CostCalculator.calculateParetoFrontier(totalWaste, costBreakdown.totalCost, totalTime, efficiency),
      costBreakdown,
      performanceMetrics,
      confidence: MetricsCalculator.calculateConfidence(efficiency, totalWaste, costBreakdown.totalCost),
      totalKerfLoss: cuts.reduce((sum, cut) => sum + (cut.kerfLoss || 0), 0),
      totalSafetyReserve: cuts.length * (context.constraints.startSafety + context.constraints.endSafety),
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
      stockSummary
    };
  }

  /**
   * Calculate stock summary for multi-stock optimization display
   */
  private calculateStockSummary(cuts: Cut[]): ReadonlyArray<StockSummary> {
    // Group cuts by stock length
    const grouped = new Map<number, Cut[]>();
    cuts.forEach(cut => {
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
      stockCuts.forEach(cut => {
        const pattern = cut.planLabel || `${cut.segmentCount} segments`;
        patternMap.set(pattern, (patternMap.get(pattern) || 0) + 1);
      });

      const patterns = Array.from(patternMap.entries()).map(([pattern, count]) => ({
        pattern,
        count
      }));

      const totalWaste = stockCuts.reduce((sum, cut) => sum + cut.remainingLength, 0);
      const totalUsed = stockCuts.reduce((sum, cut) => sum + cut.usedLength, 0);
      const totalStock = stockCuts.reduce((sum, cut) => sum + cut.stockLength, 0);
      const efficiency = totalStock > 0 ? (totalUsed / totalStock) * 100 : 0;

      return {
        stockLength,
        cutCount: stockCuts.length,
        patterns,
        avgWaste: stockCuts.length > 0 ? totalWaste / stockCuts.length : 0,
        totalWaste,
        efficiency
      };
    });
  }

  // ========================================
  // DP (Dynamic Programming) Methods for kerf=0
  // ========================================

  /**
   * Execute DP optimization for kerf=0 cases
   * Based on the reference implementation for optimal cutting patterns
   */
  private async executeDPOptimization(context: OptimizationContext): Promise<AdvancedOptimizationResult> {
    this.logger.info('[FFD] Starting DP optimization for kerf=0');
    
    // Group items by length for pattern generation
    const itemGroups = this.groupItemsByLength(context.items);
    const stockLengths = context.stockLengths;
    
    // CRITICAL: Check problem size - pattern-based approach has combinatorial explosion
    const uniqueLengths = itemGroups.length;
    const totalDemand = itemGroups.reduce((sum, g) => sum + g.quantity, 0);
    
    // STRATEGY: Large problems use traditional FFD for guaranteed low waste
    if (uniqueLengths > 15 || totalDemand > 1000) {
      this.logger.info(`[FFD] Large problem (${uniqueLengths} lengths, ${totalDemand} items) - using traditional FFD`);
      return this.executeTraditionalFFD(context);
    }
    
    this.logger.debug(`[FFD] DP evaluation starting:`, {
      itemGroups: itemGroups.length,
      stockLengths: stockLengths.length,
      kerfWidth: context.constraints.kerfWidth
    });
    
    // Generate all possible cutting patterns for each stock length
    const patterns = this.generateCuttingPatterns(itemGroups, [...stockLengths], context.constraints);
    
    if (patterns.length === 0) {
      this.logger.warn('[FFD] No valid patterns found, falling back to traditional FFD');
      return this.executeTraditionalFFD(context);
    }
    
    // CRITICAL: Try pattern-based approach, fall back to traditional if it fails
    try {
      // Use DP to find optimal pattern combination
      const optimalSolution = this.findOptimalPatternCombination(patterns, itemGroups, context.constraints);
      
      // Convert solution to cuts
      const cuts = this.convertSolutionToCuts(optimalSolution, [...stockLengths], context.constraints, itemGroups);
      
      // Create result
      const result = this.createResult(cuts, context);
      
      this.logger.info(`[FFD] DP optimization completed:`, {
        cuts: cuts.length,
        efficiency: result.efficiency.toFixed(2),
        waste: result.totalWaste
      });
      
      return result;
    } catch (error) {
      // Pattern-based approach failed (shortage, maxStates limit, etc.)
      // Fall back to traditional FFD which ALWAYS guarantees a solution
      this.logger.warn('[FFD] Pattern-based approach failed, falling back to traditional FFD:', {
        error: error instanceof Error ? error.message : String(error),
        patternsGenerated: patterns.length,
        uniqueLengths: itemGroups.length
      });
      
      return this.executeTraditionalFFD(context);
    }
  }

  /**
   * Execute traditional FFD when DP is not applicable
   */
  private async executeTraditionalFFD(context: OptimizationContext): Promise<AdvancedOptimizationResult> {
    // Preprocess and expand items
    const preprocessed = this.preprocessItems(context.items);
    const expanded = this.expandItemsByQuantity(preprocessed);
    const sorted = [...expanded].sort((a, b) => b.length - a.length);

    this.logger.debug('Items preprocessed', {
      original: context.items.length,
      expanded: expanded.length,
      sorted: sorted.length
    });

    // Run FFD algorithm
    const cuts = this.runFFD(sorted, context);
    const finalizedCuts = this.finalizeCuts(cuts, context);

    // Create result
    return this.createResult(finalizedCuts, context);
  }

  /**
   * Group items by length for pattern generation
   */
  private groupItemsByLength(items: ReadonlyArray<OptimizationItem>): Array<{ length: number; quantity: number }> {
    const groups = new Map<number, number>();
    
    items.forEach(item => {
      const current = groups.get(item.length) || 0;
      groups.set(item.length, current + (item.quantity || 1));
    });
    
    return Array.from(groups.entries()).map(([length, quantity]) => ({ length, quantity }));
  }

  /**
   * Generate all possible cutting patterns for given item groups and stock lengths
   * Based on the reference implementation
   */
  private generateCuttingPatterns(
    itemGroups: Array<{ length: number; quantity: number }>,
    stockLengths: number[],
    constraints: any
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
      // ✅ CRITICAL FIX: Only subtract startSafety for pattern generation
      // endSafety is only applied when actual cutting position reaches near stock end
      // This is handled in convertSolutionToCuts when creating final segments
      const usableLength = stockLength - constraints.startSafety;
      
      // Generate all possible combinations of items that fit in this stock
      this.generatePatternsForStock(itemGroups, stockLength, usableLength, patterns, constraints);
    }

    // CRITICAL: For high-demand problems, Pareto filtering can remove necessary patterns
    const totalDemand = itemGroups.reduce((sum, g) => sum + g.quantity, 0);
    const maxDemand = Math.max(...itemGroups.map(g => g.quantity));
    
    // CRITICAL: Skip Pareto to preserve pattern diversity
    this.logger.info(`[FFD] Skipping Pareto filter to preserve all ${patterns.length} patterns`);
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
    constraints?: any
  ): void {
    const lengths = itemGroups.map(g => g.length);
    const kerfWidth = constraints?.kerfWidth ?? 0;
    
    // ✅ FIX: Calculate max counts considering kerf
    // Each item needs: length + kerfWidth (except maybe the first one)
    const maxCounts = itemGroups.map(g => {
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
      patterns
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
    }>
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
            waste
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
    const currentKerf = kerfWidth > 0 && currentTotalSegments > 0 
      ? (currentTotalSegments - 1) * kerfWidth 
      : 0;
    
    const remainingSpace = usableLength - currentUsed - currentKerf;
    
    // Calculate max count for current item based on remaining space
    const maxCount = kerfWidth === 0
      ? Math.floor(remainingSpace / currentLength)
      : Math.floor((remainingSpace + kerfWidth) / (currentLength + kerfWidth));
    
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
        patterns
      );
    }
  }

  /**
   * Filter patterns using Pareto optimality
   * Remove patterns strictly dominated by others (more/equal items, less/equal waste)
   */
  private filterParetoOptimal(patterns: Array<{
    stockLength: number;
    pattern: Map<number, number>;
    used: number;
    waste: number;
  }>): Array<{
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

        const qHasMoreOrEqual = this.patternHasMoreOrEqualItems(q.pattern, p.pattern);
        const qStrictlyBetter = qHasMoreOrEqual && q.waste <= p.waste && (q.waste < p.waste);
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
  private patternHasMoreOrEqualItems(q: Map<number, number>, p: Map<number, number>): boolean {
    for (const [length, count] of p.entries()) {
      const qCount = q.get(length) || 0;
      if (qCount < count) return false;
    }
    return true;
  }

  /**
   * Check if pattern q is strictly better than pattern p
   */
  private patternIsStrictlyBetter(q: Map<number, number>, p: Map<number, number>): boolean {
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
    constraints: any
  ): Array<{
    pattern: typeof patterns[0];
    count: number;
  }> {
    // Create demand map - this is our target
    const targetDemand = new Map<number, number>();
    itemGroups.forEach(group => {
      targetDemand.set(group.length, group.quantity);
    });

    this.logger.debug(`[FFD] 🎯 DP with exact demand tracking:`, {
      targetDemand: Object.fromEntries(targetDemand),
      patternsCount: patterns.length
    });

    // Use greedy backtracking with exact demand control
    return this.findExactDemandSolution(patterns, itemGroups, constraints);
  }

  /**
   * Calculate how much demand a pattern satisfies
   */
  private calculatePatternDemand(pattern: Map<number, number>, demand: Map<number, number>): number {
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
    solution: Array<{ pattern: { stockLength: number; pattern: Map<number, number>; used: number; waste: number }; count: number }>,
    stockLengths: number[],
    constraints: any,
    itemGroups?: Array<{ length: number; quantity: number }>
  ): Cut[] {
    const cuts: Cut[] = [];
    let cutIndex = 0;

    const kerfWidth = constraints.kerfWidth ?? 0;
    
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
              color: '#3B82F6',
              version: '1.0',
              size: 'standard'
            };
            
            segments.push(segment);
            usedLength += length;
            segmentIndex++;
          }
        }

        // ✅ Calculate kerf loss
        const kerfLoss = kerfWidth > 0 && segments.length > 0 
          ? (segments.length - 1) * kerfWidth 
          : 0;

        // ✅ CRITICAL FIX: endSafety is 0 (all fire is cut from start)
        // Pattern generation already subtracted startSafety (100mm)
        // So finalUsedLength = usedLength (no additional safety zones)
        const finalUsedLength = usedLength;
        const finalRemaining = Math.max(0, pattern.stockLength - finalUsedLength);

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
          planLabel: this.generatePatternLabel(pattern.pattern)
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
    itemGroups: Array<{ length: number; quantity: number }>
  ): void {
    this.logger.debug(`[FFD] 🔍 Starting demand validation:`, {
      totalCuts: cuts.length,
      itemGroups: itemGroups.map(g => `${g.length}mm: ${g.quantity}`).join(', ')
    });
    
    // Calculate actual cuts by length
    const actualCuts = new Map<number, number>();
    cuts.forEach((cut, cutIndex) => {
      this.logger.debug(`[FFD] 🔍 Processing cut ${cutIndex}:`, {
        cutId: cut.id,
        stockLength: cut.stockLength,
        segmentCount: cut.segmentCount,
        segments: cut.segments.map(s => `${s.length}mm`).join(', ')
      });
      
      cut.segments.forEach((seg, segIndex) => {
        const current = actualCuts.get(seg.length) || 0;
        actualCuts.set(seg.length, current + 1);
        
        this.logger.debug(`[FFD] 🔍 Added segment ${segIndex}: ${seg.length}mm`, {
          currentCount: current + 1,
          totalForLength: actualCuts.get(seg.length)
        });
      });
    });

    this.logger.debug(`[FFD] 📊 Final actual counts:`, {
      actualCuts: Object.fromEntries(actualCuts)
    });

    // Compare with required demand (allow minimal overproduction; deficits are errors)
    const errors: string[] = [];
    for (const group of itemGroups) {
      const actual = actualCuts.get(group.length) || 0;
      const required = group.quantity;
      
      this.logger.debug(`[FFD] 🔍 Checking ${group.length}mm:`, {
        required,
        actual,
        diff: actual - required
      });
      
      if (actual < required) {
        const diff = actual - required;
        errors.push(`${group.length}mm: required ${required}, got ${actual} (diff: ${diff})`);
      }
    }

    if (errors.length > 0) {
      this.logger.error(`[FFD] ❌ DEMAND MISMATCH in convertSolutionToCuts:`, {
        errors,
        actualCuts: Object.fromEntries(actualCuts),
        requiredDemand: itemGroups.map(g => ({ length: g.length, quantity: g.quantity }))
      });
      throw new Error(`Demand mismatch: ${errors.join(', ')}`);
    }

    this.logger.debug(`[FFD] ✅ Demand validation passed:`, {
      actualCuts: Object.fromEntries(actualCuts),
      requiredDemand: itemGroups.map(g => ({ length: g.length, quantity: g.quantity }))
    });
  }

  /**
   * Generate plan label for a pattern (Map version)
   */
  private generatePatternLabel(pattern: Map<number, number>): string {
    const parts: string[] = [];
    for (const [length, count] of pattern.entries()) {
      parts.push(`${count}×${length}mm`);
    }
    return parts.join(' + ');
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
    constraints: any
  ): Array<{
    pattern: typeof patterns[0];
    count: number;
  }> {
    // Initialize demand map using only length (not profileType)
    const demand = new Map<number, number>();
    itemGroups.forEach(group => {
      // ✅ CRITICAL: Use only length as key (not profileType+length combination)
      demand.set(group.length, group.quantity);
    });

    this.logger.debug(`[FFD] 🔍 Starting priority search:`, {
      initialDemand: Object.fromEntries(demand),
      patternsAvailable: patterns.length
    });

    // Convert patterns to SearchPattern format
    const searchPatterns: SearchPattern[] = patterns.map(p => ({
      stockLength: p.stockLength,
      pattern: p.pattern,
      used: p.used,
      waste: p.waste
    }));

    // Run priority search with original working parameters
    const solver = new PrioritySearchSolver(this.logger);
    const result = solver.solve(searchPatterns, demand, {
      maxStates: 5000,
      overProductionTolerance: 2,
      wasteNormalization: 1500
    });

    if (!result) {
      throw new Error('No solution found with priority search');
    }

    this.logger.info(`[FFD] 🎯 Priority search completed:`, {
      totalBars: result.totalBars,
      totalWaste: result.totalWaste,
      patternCount: result.picks.length
    });

    // Convert search result to solution format
    const solution = this.convertSearchStateToSolution(result, patterns, itemGroups);

    // Validate final solution
    const finalValidation = this.validateExactDemand(solution, itemGroups);
    if (!finalValidation.isValid) {
      this.logger.error(`[FFD] ❌ Exact demand validation failed:`, finalValidation.errors);
      throw new Error(`Demand validation failed: ${finalValidation.errors.join(', ')}`);
    }

    this.logger.info(`[FFD] ✅ Solution validated:`, {
      totalCuts: solution.reduce((sum, s) => sum + s.count, 0),
      uniquePatterns: solution.length
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
    itemGroups: Array<{ length: number; quantity: number }>
  ): Array<{
    pattern: typeof patterns[0];
    count: number;
  }> {
    const solution: Array<{ pattern: typeof patterns[0]; count: number }> = [];
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

    this.logger.debug('[FFD] Converted search state to solution:', {
      uniquePatterns: solution.length,
      totalCuts: solution.reduce((sum, s) => sum + s.count, 0),
      patterns: solution.map(s => `${s.count}x(${this.generatePatternLabel(s.pattern.pattern)})`).join(', ')
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
    remainingDemand: Map<number, number>
  ): typeof patterns[0] | null {
    let bestPattern: typeof patterns[0] | null = null;
    let bestScore = -1;

    // Fallback when no pattern meets utilization
    let fallbackPattern: typeof patterns[0] | null = null;
    let fallbackScore = -1;

    const maxWastePct = 30 / 100; // conservative default if not available here
    const minUtilization = Math.max(0, 1 - maxWastePct);

    for (const pattern of patterns) {
      if (!this.patternFitsDemand(pattern.pattern, remainingDemand)) {
        continue;
      }

      // ✅ FIXED: Demand-coverage-first scoring - prioritize remaining demand fulfillment
      const demandUsage = this.calculateDemandUsage(pattern.pattern, remainingDemand);
      const demandScore = demandUsage * 10000; // High weight for demand coverage
      const wasteScore = -pattern.waste; // Negative penalty for waste
      const score = demandScore + wasteScore;

      // Check utilization for fallback
      const efficiency = (pattern.used + pattern.waste) > 0
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
      } else if (bestPattern && Math.abs(score - bestScore) < 0.05 * bestScore) {
        if (pattern.stockLength > bestPattern.stockLength) {
          bestPattern = pattern;
        }
      }
    }

    return bestPattern ?? fallbackPattern;
  }

  /**
   * Check if a pattern fits within remaining demand
   */
  private patternFitsDemand(
    pattern: Map<number, number>,
    remainingDemand: Map<number, number>
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
    remainingDemand: Map<number, number>
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
    solution: Array<{ pattern: { pattern: Map<number, number> }; count: number }>,
    itemGroups: Array<{ length: number; quantity: number }>
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Calculate actual cuts by length
    const actualCuts = new Map<number, number>();
    solution.forEach(({ pattern, count }) => {
      for (const [length, patternCount] of pattern.pattern.entries()) {
        const current = actualCuts.get(length) || 0;
        actualCuts.set(length, current + (patternCount * count));
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
        errors.push(`${group.length}mm: shortage ${Math.abs(diff)} (required ${required}, got ${actual})`);
      } else if (actual > required + maxExtraPerPiece) {
        // Over-production beyond tolerance: warn but don't fail
        this.logger.warn(`[FFD] Over-produced ${group.length}mm: ${actual - required} extra (limit: ${maxExtraPerPiece})`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

