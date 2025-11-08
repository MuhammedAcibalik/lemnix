/**
 * General Purpose Cutting Optimizer
 * 
 * High-level API for cutting optimization that works with any cutting list.
 * Orchestrates pattern generation, Pareto filtering, and priority search.
 * 
 * @module optimization
 */

import type { ILogger } from '../logger';
import type { OptimizationItem, MaterialStockLength } from '../../types';
import type { EnhancedConstraints, AdvancedOptimizationResult } from './types';
import { OptimizationInputNormalizer } from './utils/OptimizationInputNormalizer';
import { StockDefinitionMapper } from './utils/StockDefinitionMapper';
import { HybridPatternGenerator, type Pattern } from './utils/PatternGenerator';
import { ParetoFilter } from './utils/ParetoFilter';
import { PrioritySearchSolver, type SearchPattern } from './algorithms/PrioritySearchSolver';
import { ResultConverter } from './utils/ResultConverter';

/**
 * Optimization configuration
 */
export interface OptimizeConfig {
  readonly maxStates: number;
  readonly overProduction: number;
  readonly wasteNorm: number;
  readonly maxPiecesPerStock: number;
}

/**
 * Cutting optimizer result
 */
export interface CuttingOptimizerResult {
  readonly demand: Map<number, number>;
  readonly solution: {
    readonly produced: Map<number, number>;
    readonly totalBars: number;
    readonly totalWaste: number;
    readonly picks: readonly number[];
  };
  readonly patterns: readonly Pattern[];
}

/**
 * General Purpose Cutting Optimizer
 */
export class CuttingOptimizer {
  private readonly normalizer: OptimizationInputNormalizer;
  private readonly stockMapper: StockDefinitionMapper;
  private readonly patternGenerator: HybridPatternGenerator;
  private readonly paretoFilter: ParetoFilter;
  private readonly solver: PrioritySearchSolver;

  constructor(private readonly logger: ILogger) {
    this.normalizer = new OptimizationInputNormalizer(logger);
    this.stockMapper = new StockDefinitionMapper(logger);
    this.patternGenerator = new HybridPatternGenerator(logger);
    this.paretoFilter = new ParetoFilter(logger);
    this.solver = new PrioritySearchSolver(logger);
  }

  /**
   * Optimize cutting for given items
   * 
   * @param items - Items to optimize
   * @param materialStocks - Available stock lengths
   * @param constraints - Optimization constraints
   * @param config - Optional optimization configuration
   * @returns Cutting optimizer result
   */
  optimize(
    items: ReadonlyArray<OptimizationItem>,
    materialStocks: ReadonlyArray<MaterialStockLength>,
    constraints: EnhancedConstraints,
    config?: Partial<OptimizeConfig>
  ): CuttingOptimizerResult {
    const optimizerConfig: OptimizeConfig = {
      maxStates: config?.maxStates ?? 5000,
      overProduction: config?.overProduction ?? 2,
      wasteNorm: config?.wasteNorm ?? 1500,
      maxPiecesPerStock: config?.maxPiecesPerStock ?? 8
    };

    this.logger.info('[CuttingOptimizer] Starting optimization:', {
      itemsCount: items.length,
      stockCount: materialStocks.length,
      config: optimizerConfig
    });

    // 1. Normalize input
    const demand = this.normalizer.buildDemandFromItems(items);
    const pieces = this.normalizer.piecesFromDemand(demand);

    this.logger.debug('[CuttingOptimizer] Normalized input:', {
      uniqueLengths: demand.size,
      pieces: pieces.map(p => ({ id: p.id, size: p.size }))
    });

    // 2. Map stocks
    const stocks = this.stockMapper.mapStockLengths(materialStocks, constraints);

    this.logger.debug('[CuttingOptimizer] Mapped stocks:', {
      stocks: stocks.map(s => ({ id: s.id, raw: s.rawLength, usable: s.usable }))
    });

    // 3. Generate patterns (hybrid strategy)
    const patternConfig = {
      maxPiecesPerStock: optimizerConfig.maxPiecesPerStock,
      kerfWidth: constraints.kerfWidth
    };

    const allPatterns = stocks.flatMap(stock =>
      this.patternGenerator.generate(stock, pieces, patternConfig)
    );

    this.logger.debug('[CuttingOptimizer] Generated patterns:', {
      totalPatterns: allPatterns.length,
      perStock: stocks.map(s => ({
        stockId: s.id,
        patterns: allPatterns.filter(p => p.stockId === s.id).length
      }))
    });

    // 4. Pareto filter
    const filteredPatterns = this.paretoFilter.paretoPerStock(allPatterns);

    this.logger.debug('[CuttingOptimizer] Filtered patterns:', {
      inputCount: allPatterns.length,
      outputCount: filteredPatterns.length,
      reduction: allPatterns.length - filteredPatterns.length
    });

    // 5. Convert to search patterns
    const searchPatterns = this.convertToSearchPatterns(filteredPatterns);

    // 6. Priority search
    const solution = this.solver.solve(
      [...searchPatterns], // Convert readonly to mutable
      demand,
      {
        maxStates: optimizerConfig.maxStates,
        overProductionTolerance: optimizerConfig.overProduction,
        wasteNormalization: optimizerConfig.wasteNorm
      }
    );

    if (!solution) {
      throw new Error('No solution found');
    }

    this.logger.info('[CuttingOptimizer] Solution found:', {
      totalBars: solution.totalBars,
      totalWaste: solution.totalWaste,
      picks: solution.picks.length
    });

    // 7. Return result
    return {
      demand,
      solution: {
        produced: solution.produced,
        totalBars: solution.totalBars,
        totalWaste: solution.totalWaste,
        picks: solution.picks
      },
      patterns: filteredPatterns
    };
  }

  /**
   * Convert patterns to search patterns
   */
  private convertToSearchPatterns(patterns: ReadonlyArray<Pattern>): readonly SearchPattern[] {
    return patterns.map(p => ({
      stockLength: p.stockLength,
      pattern: new Map<number, number>(
        p.cuts.map(cut => {
          // Extract length from "918mm" -> 918
          const length = Number(cut.pieceId.replace('mm', ''));
          return [length, cut.qty];
        })
      ),
      used: p.usedLength,
      waste: p.waste
    }));
  }
}

