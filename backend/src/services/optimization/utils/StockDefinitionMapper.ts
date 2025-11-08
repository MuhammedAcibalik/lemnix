/**
 * Stock Definition Mapper
 * 
 * Maps Lemnix's MaterialStockLength[] to normalized StockDef[]
 * for the general-purpose optimizer.
 * 
 * @module optimization/utils
 */

import type { ILogger } from '../../logger';
import type { MaterialStockLength } from '../../../types';
import type { EnhancedConstraints } from '../types';

/**
 * Normalized stock definition
 */
export interface StockDef {
  readonly id: string;        // "STK6100"
  readonly rawLength: number; // 6100
  readonly safety: number;    // 100 (from constraints.startSafety)
  readonly usable: number;    // 6000 (rawLength - safety)
}

/**
 * Stock Definition Mapper
 */
export class StockDefinitionMapper {
  constructor(private readonly logger: ILogger) {}

  /**
   * Map MaterialStockLength[] to StockDef[]
   * 
   * @param stocks - Array of material stock lengths
   * @param constraints - Optimization constraints (for safety margins)
   * @returns Array of normalized stock definitions
   */
  mapStockLengths(
    stocks: ReadonlyArray<MaterialStockLength>,
    constraints: EnhancedConstraints
  ): ReadonlyArray<StockDef> {
    const stockDefs: StockDef[] = [];
    const safety = constraints.startSafety || 0;

    for (const stock of stocks) {
      const rawLength = stock.stockLength;
      const usableLength = rawLength - safety;

      if (usableLength <= 0) {
        this.logger.warn('[StockMapper] Skipping stock with invalid usable length:', {
          stockLength: rawLength,
          safety,
          usableLength
        });
        continue;
      }

      stockDefs.push({
        id: `STK${rawLength}`,
        rawLength,
        safety,
        usable: usableLength
      });
    }

    // Sort by raw length descending (largest first)
    stockDefs.sort((a, b) => b.rawLength - a.rawLength);

    this.logger.debug('[StockMapper] Mapped stock lengths:', {
      inputCount: stocks.length,
      outputCount: stockDefs.length,
      stocks: stockDefs.map(s => ({
        id: s.id,
        raw: s.rawLength,
        safety: s.safety,
        usable: s.usable
      }))
    });

    return stockDefs;
  }

  /**
   * Create default stock definitions from length array
   * 
   * Used when MaterialStockLength[] is not available.
   * 
   * @param lengths - Array of stock lengths
   * @param safety - Safety margin to subtract from start
   * @returns Array of normalized stock definitions
   */
  createDefaultStocks(
    lengths: ReadonlyArray<number>,
    safety: number
  ): ReadonlyArray<StockDef> {
    const stockDefs: StockDef[] = [];

    for (const length of lengths) {
      const usableLength = length - safety;

      if (usableLength <= 0) {
        this.logger.warn('[StockMapper] Skipping length with invalid usable length:', {
          length,
          safety,
          usableLength
        });
        continue;
      }

      stockDefs.push({
        id: `STK${length}`,
        rawLength: length,
        safety,
        usable: usableLength
      });
    }

    // Sort by raw length descending (largest first)
    stockDefs.sort((a, b) => b.rawLength - a.rawLength);

    this.logger.debug('[StockMapper] Created default stocks:', {
      inputCount: lengths.length,
      outputCount: stockDefs.length,
      stocks: stockDefs.map(s => ({
        id: s.id,
        raw: s.rawLength,
        safety: s.safety,
        usable: s.usable
      }))
    });

    return stockDefs;
  }
}

