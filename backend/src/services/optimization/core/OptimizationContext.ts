/**
 * LEMNİX Optimization Context
 * Shared state and parameters for all optimization algorithms
 *
 * @module optimization/core
 * @version 1.0.0
 * @architecture Immutable value object pattern
 */

import { OptimizationItem, MaterialStockLength } from "../../../types";
import {
  EnhancedConstraints,
  OptimizationObjective,
  PerformanceSettings,
  CostModel,
  NSGAParams,
  TimeModel,
} from "../types";
import { ILogger } from "../../logger";

/**
 * Immutable optimization context
 * Contains all parameters needed for algorithm execution
 */
export class OptimizationContext {
  /**
   * Preprocessed optimization items (immutable)
   */
  public readonly items: ReadonlyArray<OptimizationItem>;

  /**
   * Available stock lengths sorted ascending (immutable)
   */
  public readonly stockLengths: ReadonlyArray<number>;

  /**
   * Enhanced constraints with defaults applied
   */
  public readonly constraints: EnhancedConstraints;

  /**
   * Optimization objectives (immutable)
   */
  public readonly objectives: ReadonlyArray<OptimizationObjective>;

  /**
   * Performance settings
   */
  public readonly performance: PerformanceSettings;

  /**
   * Cost model for financial calculations
   */
  public readonly costModel: CostModel;

  /**
   * Logger instance for structured logging
   */
  public readonly logger: ILogger;

  /**
   * Optimization start time (for execution time tracking)
   */
  public readonly startTime: number;

  /**
   * Unique request identifier
   */
  public readonly requestId: string;

  /**
   * NSGA-II specific parameters (optional)
   */
  public readonly nsgaParams?: NSGAParams;

  /**
   * Time estimation model (optional)
   */
  public readonly timeModel?: TimeModel;

  constructor(params: {
    readonly items: ReadonlyArray<OptimizationItem>;
    readonly materialStockLengths?: ReadonlyArray<MaterialStockLength>;
    readonly constraints: EnhancedConstraints;
    readonly objectives: ReadonlyArray<OptimizationObjective>;
    readonly performance: PerformanceSettings;
    readonly costModel: CostModel;
    readonly logger: ILogger;
    readonly startTime?: number;
    readonly requestId?: string;
    readonly nsgaParams?: NSGAParams;
    readonly timeModel?: TimeModel;
  }) {
    // Validate items
    if (!params.items || params.items.length === 0) {
      throw new Error("OptimizationContext: items array must be non-empty");
    }

    // Validate objectives
    if (!params.objectives || params.objectives.length === 0) {
      throw new Error(
        "OptimizationContext: at least one objective is required",
      );
    }

    const weightSum = params.objectives.reduce(
      (sum, obj) => sum + obj.weight,
      0,
    );
    if (Math.abs(weightSum - 1) > 1e-6) {
      throw new Error("OptimizationContext: objective weights must sum to 1");
    }

    this.items = Object.freeze([...params.items]);

    // Extract and sort stock lengths
    this.stockLengths = Object.freeze(
      params.materialStockLengths?.length
        ? params.materialStockLengths
            .map((s) => s.stockLength)
            .sort((a, b) => a - b)
        : [6100],
    );

    this.constraints = Object.freeze({ ...params.constraints });
    this.objectives = Object.freeze([...params.objectives]);
    this.performance = Object.freeze({ ...params.performance });
    this.costModel = Object.freeze({ ...params.costModel });
    this.logger = params.logger;
    this.startTime = params.startTime ?? Date.now();
    this.requestId = params.requestId ?? `opt-${Date.now()}`;
    this.nsgaParams = params.nsgaParams
      ? Object.freeze({ ...params.nsgaParams })
      : undefined;
    this.timeModel = params.timeModel
      ? Object.freeze({ ...params.timeModel })
      : undefined;
  }

  /**
   * Get primary stock length (most commonly used)
   */
  public getPrimaryStockLength(): number {
    return this.stockLengths[0] ?? 6100;
  }

  /**
   * Get total item count (sum of quantities)
   */
  public getTotalItemCount(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Get unique item count (distinct items regardless of quantity)
   */
  public getUniqueItemCount(): number {
    return this.items.length;
  }

  /**
   * Check if context has specific objective type
   */
  public hasObjective(type: OptimizationObjective["type"]): boolean {
    return this.objectives.some((obj) => obj.type === type);
  }

  /**
   * Get objective weight for specific type
   */
  public getObjectiveWeight(type: OptimizationObjective["type"]): number {
    return this.objectives.find((obj) => obj.type === type)?.weight ?? 0;
  }
}
