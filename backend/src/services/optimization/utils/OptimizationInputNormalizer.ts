/**
 * Optimization Input Normalizer
 *
 * Handles normalization of various input formats for cutting optimization.
 * Converts different length formats ("918mm", 918, "918,0") to consistent numeric values.
 *
 * @module optimization/utils
 */

import type { ILogger } from "../../logger";
import type { OptimizationItem } from "../../../types";

/**
 * Piece definition for pattern generation
 */
export interface PieceDef {
  readonly id: string; // "918mm"
  readonly size: number; // 918
}

/**
 * Optimization Input Normalizer
 */
export class OptimizationInputNormalizer {
  constructor(private readonly logger: ILogger) {}

  /**
   * Parse length value from various formats
   *
   * Handles:
   * - Numbers: 918
   * - Strings: "918mm", "918", "918,0", "918.5"
   *
   * @param v - Length value (string or number)
   * @returns Normalized numeric length
   * @throws {Error} If value cannot be parsed to number
   */
  parseNumberLike(v: string | number): number {
    if (typeof v === "number") {
      return v;
    }

    // Remove "mm" suffix if present, replace comma with dot
    const cleaned = v.replace(/mm$/i, "").replace(",", ".").trim();
    const parsed = Number(cleaned);

    if (Number.isNaN(parsed)) {
      throw new Error(`Length value cannot be parsed to number: ${v}`);
    }

    return parsed;
  }

  /**
   * Convert length in mm to piece ID string
   *
   * @param lenMm - Length in millimeters
   * @returns Piece ID (e.g., "918mm")
   */
  toPieceId(lenMm: number): string {
    return `${Math.round(lenMm)}mm`;
  }

  /**
   * Build demand map from optimization items
   *
   * Group items by length and sum quantities.
   *
   * @param items - Array of optimization items
   * @returns Demand map (length -> quantity)
   */
  buildDemandFromItems(
    items: ReadonlyArray<OptimizationItem>,
  ): Map<number, number> {
    const demand = new Map<number, number>();

    for (const item of items) {
      const length = this.parseNumberLike(item.length);
      const quantity =
        typeof item.quantity === "string"
          ? Number(item.quantity)
          : item.quantity;

      if (Number.isNaN(quantity)) {
        this.logger.warn("[Normalizer] Skipping item with invalid quantity:", {
          item,
        });
        continue;
      }

      const currentDemand = demand.get(length) || 0;
      demand.set(length, currentDemand + quantity);
    }

    this.logger.debug("[Normalizer] Built demand map:", {
      itemsCount: items.length,
      uniqueLengths: demand.size,
      demand: Object.fromEntries(demand),
    });

    return demand;
  }

  /**
   * Extract piece definitions from demand map
   *
   * @param demand - Demand map (length -> quantity)
   * @returns Array of piece definitions
   */
  piecesFromDemand(demand: Map<number, number>): ReadonlyArray<PieceDef> {
    const pieces: PieceDef[] = [];

    for (const [length] of demand.entries()) {
      pieces.push({
        id: this.toPieceId(length),
        size: length,
      });
    }

    // Sort by size descending (largest first)
    pieces.sort((a, b) => b.size - a.size);

    this.logger.debug("[Normalizer] Extracted pieces:", {
      count: pieces.length,
      pieces: pieces.map((p) => ({ id: p.id, size: p.size })),
    });

    return pieces;
  }

  /**
   * Build demand map from raw cut rows
   *
   * Used for direct input (Excel import, manual entry).
   *
   * @param rows - Array of raw cut rows
   * @returns Demand map (length -> quantity)
   */
  buildDemandFromRawRows(
    rows: ReadonlyArray<{ length: string | number; qty: string | number }>,
  ): Map<number, number> {
    const demand = new Map<number, number>();

    for (const row of rows) {
      const length = this.parseNumberLike(row.length);
      const qty = typeof row.qty === "string" ? Number(row.qty) : row.qty;

      if (Number.isNaN(qty)) {
        this.logger.warn("[Normalizer] Skipping row with invalid quantity:", {
          row,
        });
        continue;
      }

      const currentDemand = demand.get(length) || 0;
      demand.set(length, currentDemand + qty);
    }

    this.logger.debug("[Normalizer] Built demand from raw rows:", {
      rowsCount: rows.length,
      uniqueLengths: demand.size,
      demand: Object.fromEntries(demand),
    });

    return demand;
  }
}
