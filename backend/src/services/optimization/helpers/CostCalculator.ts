/**
 * LEMNİX Cost Calculator
 * Calculates cost breakdowns and financial metrics
 * 
 * @module optimization/helpers
 * @version 1.0.0
 * @architecture Pure functions + financial calculations
 */

import { Cut } from '../../../types';
import { CostModel, CostBreakdown, ParetoPoint, EnhancedConstraints } from '../types';

/**
 * Cost calculator for financial analysis
 */
export class CostCalculator {
  /**
   * Calculate cost breakdown from cuts
   * 
   * @param cuts - Array of cuts
   * @param costModel - Cost model with unit costs
   * @param constraints - Optimization constraints
   * @returns Detailed cost breakdown
   */
  public static calculateCostBreakdown(
    cuts: ReadonlyArray<Cut>,
    costModel: CostModel,
    constraints: EnhancedConstraints
  ): CostBreakdown {
    const totalSegments = cuts.reduce((sum, cut) => sum + cut.segmentCount, 0);
    const totalLength = cuts.reduce((sum, cut) => sum + cut.usedLength, 0);
    const totalWaste = cuts.reduce((sum, cut) => sum + cut.remainingLength, 0);
    const totalTime = cuts.reduce(
      (sum, cut) => sum + (cut.estimatedCuttingTime || 0) + (cut.setupTime || 0),
      0
    );

    const materialCost = totalLength * costModel.materialCost;
    const cuttingCost = totalSegments * costModel.cuttingCost;
    const setupCost = cuts.length * costModel.setupCost;
    const wasteCost = totalWaste * costModel.wasteCost;
    const timeCost = totalTime * costModel.timeCost;
    const energyCost = cuts.length * (constraints.energyPerStock ?? 0.5) * costModel.energyCost;
    const totalCost = materialCost + cuttingCost + setupCost + wasteCost + timeCost + energyCost;

    return {
      materialCost,
      cuttingCost,
      setupCost,
      wasteCost,
      timeCost,
      energyCost,
      totalCost
    };
  }

  /**
   * Calculate cost per meter
   * 
   * @param totalCost - Total cost
   * @param totalLength - Total length (mm)
   * @returns Cost per meter
   */
  public static calculateCostPerMeter(totalCost: number, totalLength: number): number {
    if (totalLength <= 0) return 0;
    return totalCost / (totalLength / 1000);
  }

  /**
   * Calculate Pareto frontier points
   * 
   * Simplified version - generates sample points for multi-objective optimization
   * 
   * @param baseWaste - Base waste value
   * @param baseCost - Base cost value
   * @param baseTime - Base time value
   * @param baseEfficiency - Base efficiency value
   * @param points - Number of points to generate (default: 5)
   * @returns Array of Pareto points
   */
  public static calculateParetoFrontier(
    baseWaste: number,
    baseCost: number,
    baseTime: number,
    baseEfficiency: number,
    points: number = 5
  ): ParetoPoint[] {
    const paretoPoints: ParetoPoint[] = [];
    
    for (let i = 0; i < points; i++) {
      const factor = i / (points - 1);
      paretoPoints.push({
        waste: baseWaste + factor * (baseWaste * 0.5),
        cost: baseCost + factor * (baseCost * 0.4),
        time: baseTime + factor * (baseTime * 0.5),
        efficiency: baseEfficiency - factor * (baseEfficiency * 0.2)
      });
    }
    
    return this.removeDominatedSolutions(paretoPoints);
  }

  /**
   * Remove dominated solutions from Pareto frontier
   * 
   * A solution is dominated if another solution is better in all objectives
   * 
   * @param points - Array of Pareto points
   * @returns Non-dominated solutions
   */
  private static removeDominatedSolutions(points: ParetoPoint[]): ParetoPoint[] {
    return points.filter((point, index) => {
      return !points.some((other, otherIndex) => {
        if (index === otherIndex) return false;
        return other.waste <= point.waste &&
               other.cost <= point.cost &&
               other.time <= point.time &&
               other.efficiency >= point.efficiency &&
               (other.waste < point.waste || other.cost < point.cost || 
                other.time < point.time || other.efficiency > point.efficiency);
      });
    });
  }

  /**
   * Calculate ROI (Return on Investment)
   * 
   * @param totalCost - Total cost
   * @param totalWaste - Total waste (mm)
   * @param wasteValuePerMm - Value of waste per mm
   * @returns ROI percentage
   */
  public static calculateROI(
    totalCost: number,
    totalWaste: number,
    wasteValuePerMm: number = 0.03
  ): number {
    const wasteValue = totalWaste * wasteValuePerMm;
    const savings = wasteValue;
    
    if (totalCost <= 0) return 0;
    return (savings / totalCost) * 100;
  }

  /**
   * Calculate cost savings compared to baseline
   * 
   * @param currentCost - Current optimization cost
   * @param baselineCost - Baseline (unoptimized) cost
   * @returns Savings amount and percentage
   */
  public static calculateSavings(
    currentCost: number,
    baselineCost: number
  ): { amount: number; percentage: number } {
    const amount = baselineCost - currentCost;
    const percentage = baselineCost > 0 ? (amount / baselineCost) * 100 : 0;
    
    return { amount, percentage };
  }

  /**
   * Get cost summary with all key metrics
   * 
   * @param cuts - Array of cuts
   * @param costModel - Cost model
   * @param constraints - Optimization constraints
   * @returns Cost summary object
   */
  public static getCostSummary(
    cuts: ReadonlyArray<Cut>,
    costModel: CostModel,
    constraints: EnhancedConstraints
  ): {
    readonly breakdown: CostBreakdown;
    readonly costPerMeter: number;
    readonly costPerCut: number;
    readonly costPerSegment: number;
  } {
    const breakdown = this.calculateCostBreakdown(cuts, costModel, constraints);
    const totalLength = cuts.reduce((sum, cut) => sum + cut.usedLength, 0);
    const totalSegments = cuts.reduce((sum, cut) => sum + cut.segmentCount, 0);
    
    return {
      breakdown,
      costPerMeter: this.calculateCostPerMeter(breakdown.totalCost, totalLength),
      costPerCut: cuts.length > 0 ? breakdown.totalCost / cuts.length : 0,
      costPerSegment: totalSegments > 0 ? breakdown.totalCost / totalSegments : 0
    };
  }
}

