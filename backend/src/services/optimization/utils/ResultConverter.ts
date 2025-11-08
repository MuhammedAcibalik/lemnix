/**
 * Result Converter
 * 
 * Converts CuttingOptimizerResult to AdvancedOptimizationResult
 * for integration with Lemnix's existing optimization infrastructure.
 * 
 * @module optimization/utils
 */

import type { ILogger } from '../../logger';
import { OptimizationItem, Cut, CuttingSegment, WasteCategory } from '../../../types';
import type { OptimizationAlgorithm, MaterialStockLength } from '../../../types';
import type { AdvancedOptimizationResult, StockSummary } from '../types';
import type { CuttingOptimizerResult } from '../CuttingOptimizer';
import type { Pattern } from './PatternGenerator';

/**
 * Result Converter
 */
export class ResultConverter {
  constructor(private readonly logger: ILogger) {}

  /**
   * Convert CuttingOptimizerResult to AdvancedOptimizationResult
   * 
   * @param optimizerResult - Result from CuttingOptimizer
   * @param items - Original optimization items
   * @param stockLengths - Available stock lengths
   * @param algorithm - Algorithm used
   * @param executionTimeMs - Execution time in milliseconds
   * @param requestId - Request ID for logging
   * @returns AdvancedOptimizationResult compatible with Lemnix
   */
  convertToAdvancedOptimizationResult(
    optimizerResult: CuttingOptimizerResult,
    items: ReadonlyArray<OptimizationItem>,
    stockLengths: ReadonlyArray<number>,
    algorithm: OptimizationAlgorithm,
    executionTimeMs: number,
    requestId: string
  ): AdvancedOptimizationResult {
    this.logger.debug('[ResultConverter] Converting result:', {
      requestId,
      totalBars: optimizerResult.solution.totalBars,
      totalWaste: optimizerResult.solution.totalWaste
    });

    // 1. Convert patterns to cuts
    const cuts = this.convertPatternsToCuts(
      optimizerResult.patterns,
      optimizerResult.solution.picks,
      stockLengths
    );

    // 2. Calculate metrics
    const totalSegments = cuts.reduce((sum, cut) => sum + cut.segmentCount, 0);
    const totalLength = cuts.reduce((sum, cut) => sum + cut.usedLength, 0);
    const averageCutsPerStock = cuts.length > 0 ? totalSegments / cuts.length : 0;
    
    // 3. Calculate waste distribution
    const wasteDistribution = this.calculateWasteDistribution(cuts);
    
    // 4. Calculate costs (simplified)
    const materialCost = this.calculateMaterialCost(cuts);
    const wasteCost = this.calculateWasteCost(optimizerResult.solution.totalWaste);
    const laborCost = this.calculateLaborCost(cuts);
    const totalCost = materialCost + wasteCost + laborCost;
    
    // 5. Calculate efficiency
    const efficiency = this.calculateEfficiency(totalLength, optimizerResult.solution.totalWaste, cuts);
    
    // 6. Build stock summary
    const stockSummary = this.buildStockSummary(cuts, stockLengths);
    
    // 7. Calculate quality score
    const qualityScore = this.calculateQualityScore(efficiency, wasteDistribution);
    
    // 8. Build result
    const result: AdvancedOptimizationResult = {
      cuts: [...cuts], // Convert readonly to mutable
      totalWaste: optimizerResult.solution.totalWaste,
      efficiency,
      stockCount: optimizerResult.solution.totalBars,
      totalSegments,
      wastePercentage: this.calculateWastePercentage(cuts),
      averageCutsPerStock,
      totalLength,
      setupTime: this.calculateSetupTime(cuts),
      materialUtilization: efficiency,
      cuttingComplexity: this.calculateCuttingComplexity(cuts),
      cuttingTime: this.calculateCuttingTime(cuts),
      totalTime: this.calculateTotalTime(cuts),
      materialCost,
      wasteCost,
      laborCost,
      totalCost,
      costPerMeter: totalCost / (totalLength / 1000), // Convert mm to meters
      qualityScore,
      reclaimableWastePercentage: this.calculateReclaimableWastePercentage(cuts),
      algorithm,
      executionTimeMs,
      wasteDistribution,
      constraints: {} as any, // TODO: pass from original constraints
      efficiencyCategory: this.categorizeEfficiency(efficiency),
      detailedWasteAnalysis: wasteDistribution,
      optimizationScore: qualityScore,
      paretoFrontier: [],
      costBreakdown: {
        materialCost,
        cuttingCost: 0, // TODO
        setupCost: 0, // TODO
        wasteCost,
        timeCost: 0, // TODO
        energyCost: 0, // TODO
        totalCost
      },
      performanceMetrics: {
        algorithmComplexity: 'O(2^n)',
        convergenceRate: 1.0,
        memoryUsage: 0,
        cpuUsage: 0,
        scalability: 8
      },
      recommendations: [],
      confidence: 0.95,
      totalKerfLoss: this.calculateTotalKerfLoss(cuts),
      totalSafetyReserve: this.calculateTotalSafetyReserve(cuts),
      stockSummary
    };

    this.logger.info('[ResultConverter] Conversion complete:', {
      requestId,
      cuts: cuts.length,
      efficiency: result.efficiency,
      totalCost: result.totalCost
    });

    return result;
  }

  /**
   * Convert patterns to cuts
   */
  private convertPatternsToCuts(
    patterns: ReadonlyArray<Pattern>,
    picks: readonly number[],
    stockLengths: ReadonlyArray<number>
  ): ReadonlyArray<Cut> {
    const cuts: Cut[] = [];
    let cutIndex = 0;

    // Group picks by pattern
    const patternCounts = new Map<number, number>();
    for (const pick of picks) {
      const count = patternCounts.get(pick) || 0;
      patternCounts.set(pick, count + 1);
    }

    // Create cut for each pattern instance
    for (const [patternIndex, count] of patternCounts.entries()) {
      const pattern = patterns[patternIndex];
      if (!pattern) continue;

      for (let i = 0; i < count; i++) {
        const cut = this.convertPatternToCut(pattern, cutIndex, stockLengths);
        cuts.push(cut);
        cutIndex++;
      }
    }

    return cuts;
  }

  /**
   * Convert a single pattern to a cut
   */
  private convertPatternToCut(
    pattern: Pattern,
    cutIndex: number,
    stockLengths: ReadonlyArray<number>
  ): Cut {
    const stockLength = pattern.stockLength;
    const usable = pattern.usable;
    
    // Convert cuts to segments
    const segments: CuttingSegment[] = [];
    let position = 0;
    let totalLength = 0;

    for (const cut of pattern.cuts) {
      const length = Number(cut.pieceId.replace('mm', ''));
      
      for (let i = 0; i < cut.qty; i++) {
        const segment: CuttingSegment = {
          id: `seg-${cutIndex}-${segments.length}`,
          cutId: `cut-${cutIndex}`,
          sequenceNumber: segments.length + 1,
          profileType: 'Generic', // TODO: map from original items
          length,
          quantity: 1,
          position,
          endPosition: position + length,
          tolerance: 0.5,
          workOrderItemId: `woi-${cutIndex}-${segments.length}`,
          originalLength: length,
          qualityCheck: true,
          unitCost: 0,
          totalCost: 0
        };
        
        segments.push(segment);
        position += length;
        totalLength += length;
      }
    }

    // Calculate remaining length and waste category
    const remainingLength = pattern.waste;
    const wasteCategory = this.categorizeWaste(remainingLength);
    const isReclaimable = remainingLength >= 75; // TODO: from constraints

    return {
      id: `cut-${cutIndex}`,
      cuttingPlanId: `plan-${pattern.stockId}`,
      stockIndex: cutIndex,
      stockLength,
      materialType: 'Generic', // TODO: map from original items
      segments,
      segmentCount: segments.length,
      usedLength: totalLength,
      remainingLength,
      wasteCategory,
      isReclaimable,
      estimatedCuttingTime: segments.length * 2, // TODO: calculate properly
      setupTime: 5, // TODO: from constraints
      kerfLoss: this.calculateKerfLoss(segments),
      safetyMargin: pattern.stockLength - pattern.usable,
      toleranceCheck: true,
      sequence: cutIndex
    };
  }

  /**
   * Calculate kerf loss for segments
   */
  private calculateKerfLoss(segments: ReadonlyArray<CuttingSegment>): number {
    if (segments.length <= 1) return 0;
    return (segments.length - 1) * 3.5; // TODO: from constraints
  }

  /**
   * Categorize waste by length
   */
  private categorizeWaste(length: number): WasteCategory {
    if (length < 50) return WasteCategory.MINIMAL;
    if (length < 150) return WasteCategory.SMALL;
    if (length < 300) return WasteCategory.MEDIUM;
    if (length < 500) return WasteCategory.LARGE;
    return WasteCategory.EXCESSIVE;
  }

  /**
   * Calculate waste distribution
   */
  private calculateWasteDistribution(cuts: ReadonlyArray<Cut>): {
    minimal: number;
    small: number;
    medium: number;
    large: number;
    excessive: number;
    reclaimable: number;
    totalPieces: number;
    averageWaste: number;
  } {
    const distribution = {
      minimal: 0,
      small: 0,
      medium: 0,
      large: 0,
      excessive: 0,
      reclaimable: 0,
      totalPieces: 0,
      averageWaste: 0
    };

    for (const cut of cuts) {
      distribution.totalPieces++;
      
      if (cut.isReclaimable) {
        distribution.reclaimable += cut.remainingLength;
      }
      
      switch (cut.wasteCategory) {
        case WasteCategory.MINIMAL:
          distribution.minimal++;
          break;
        case WasteCategory.SMALL:
          distribution.small++;
          break;
        case WasteCategory.MEDIUM:
          distribution.medium++;
          break;
        case WasteCategory.LARGE:
          distribution.large++;
          break;
        case WasteCategory.EXCESSIVE:
          distribution.excessive++;
          break;
      }
    }

    if (distribution.totalPieces > 0) {
      distribution.averageWaste = cuts.reduce((sum, c) => sum + c.remainingLength, 0) / distribution.totalPieces;
    }

    return distribution;
  }

  /**
   * Calculate efficiency
   */
  private calculateEfficiency(
    totalLength: number,
    totalWaste: number,
    cuts: ReadonlyArray<Cut>
  ): number {
    const totalUsed = totalLength + totalWaste;
    if (totalUsed === 0) return 0;
    return (totalLength / totalUsed) * 100;
  }

  /**
   * Calculate waste percentage
   */
  private calculateWastePercentage(cuts: ReadonlyArray<Cut>): number {
    const totalUsed = cuts.reduce((sum, c) => sum + c.usedLength, 0);
    const totalWaste = cuts.reduce((sum, c) => sum + c.remainingLength, 0);
    const total = totalUsed + totalWaste;
    
    if (total === 0) return 0;
    return (totalWaste / total) * 100;
  }

  /**
   * Build stock summary
   */
  private buildStockSummary(
    cuts: ReadonlyArray<Cut>,
    stockLengths: ReadonlyArray<number>
  ): readonly StockSummary[] {
    const summary = new Map<number, StockSummary>();

    for (const cut of cuts) {
      const existing = summary.get(cut.stockLength);
      
      if (existing) {
        summary.set(cut.stockLength, {
          stockLength: cut.stockLength,
          cutCount: existing.cutCount + 1,
          patterns: existing.patterns, // TODO: track patterns
          avgWaste: (existing.avgWaste * existing.cutCount + cut.remainingLength) / (existing.cutCount + 1),
          totalWaste: existing.totalWaste + cut.remainingLength,
          efficiency: 0 // TODO: calculate
        });
      } else {
        summary.set(cut.stockLength, {
          stockLength: cut.stockLength,
          cutCount: 1,
          patterns: [],
          avgWaste: cut.remainingLength,
          totalWaste: cut.remainingLength,
          efficiency: 0 // TODO: calculate
        });
      }
    }

    return Array.from(summary.values());
  }

  /**
   * Calculate costs (simplified)
   */
  private calculateMaterialCost(cuts: ReadonlyArray<Cut>): number {
    return cuts.reduce((sum, c) => sum + (c.stockLength * 0.001), 0); // TODO: actual cost model
  }

  private calculateWasteCost(totalWaste: number): number {
    return totalWaste * 0.001; // TODO: actual cost model
  }

  private calculateLaborCost(cuts: ReadonlyArray<Cut>): number {
    return cuts.length * 0.5; // TODO: actual cost model
  }

  /**
   * Calculate quality score
   */
  private calculateQualityScore(efficiency: number, wasteDistribution: any): number {
    const wasteScore = this.calculateWasteScore(wasteDistribution);
    return (efficiency * 0.7) + (wasteScore * 0.3);
  }

  private calculateWasteScore(wasteDistribution: any): number {
    const excessivePenalty = wasteDistribution.excessive * 20;
    const largePenalty = wasteDistribution.large * 10;
    const mediumPenalty = wasteDistribution.medium * 5;
    
    return Math.max(0, 100 - excessivePenalty - largePenalty - mediumPenalty);
  }

  /**
   * Categorize efficiency
   */
  private categorizeEfficiency(efficiency: number): 'excellent' | 'good' | 'average' | 'poor' {
    if (efficiency >= 95) return 'excellent';
    if (efficiency >= 90) return 'good';
    if (efficiency >= 85) return 'average';
    return 'poor';
  }

  /**
   * Calculate times (simplified)
   */
  private calculateSetupTime(cuts: ReadonlyArray<Cut>): number {
    return cuts.reduce((sum, c) => sum + c.setupTime, 0);
  }

  private calculateCuttingTime(cuts: ReadonlyArray<Cut>): number {
    return cuts.reduce((sum, c) => sum + c.estimatedCuttingTime, 0);
  }

  private calculateTotalTime(cuts: ReadonlyArray<Cut>): number {
    return this.calculateSetupTime(cuts) + this.calculateCuttingTime(cuts);
  }

  /**
   * Calculate complexity
   */
  private calculateCuttingComplexity(cuts: ReadonlyArray<Cut>): number {
    const avgSegmentsPerCut = cuts.reduce((sum, c) => sum + c.segmentCount, 0) / cuts.length;
    return avgSegmentsPerCut / 10; // Normalize to 0-10
  }

  /**
   * Calculate reclaimable waste percentage
   */
  private calculateReclaimableWastePercentage(cuts: ReadonlyArray<Cut>): number {
    const reclaimableWaste = cuts.filter(c => c.isReclaimable)
      .reduce((sum, c) => sum + c.remainingLength, 0);
    const totalWaste = cuts.reduce((sum, c) => sum + c.remainingLength, 0);
    
    if (totalWaste === 0) return 0;
    return (reclaimableWaste / totalWaste) * 100;
  }

  /**
   * Calculate total kerf loss
   */
  private calculateTotalKerfLoss(cuts: ReadonlyArray<Cut>): number {
    return cuts.reduce((sum, c) => sum + (c.kerfLoss ?? 0), 0);
  }

  /**
   * Calculate total safety reserve
   */
  private calculateTotalSafetyReserve(cuts: ReadonlyArray<Cut>): number {
    return cuts.reduce((sum, c) => sum + (c.safetyMargin ?? 0), 0);
  }
}

