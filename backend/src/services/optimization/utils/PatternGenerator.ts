/**
 * Pattern Generator
 *
 * Generates cutting patterns using hybrid strategy:
 * - Brute-force (N²/N³) for ≤8 distinct pieces (fast, simple)
 * - DP-based for >8 pieces (powerful, handles large combinations)
 *
 * @module optimization/utils
 */

import type { ILogger } from "../../logger";
import type { PieceDef } from "./OptimizationInputNormalizer";
import type { StockDef } from "./StockDefinitionMapper";

/**
 * Pattern structure
 */
export interface Pattern {
  readonly stockId: string;
  readonly stockLength: number;
  readonly usable: number;
  readonly cuts: Array<{ pieceId: string; qty: number }>;
  readonly usedLength: number;
  readonly waste: number;
}

/**
 * Pattern generation config
 */
export interface PatternConfig {
  readonly maxPiecesPerStock: number;
  readonly kerfWidth: number;
}

/**
 * Pattern generation strategy interface
 */
export interface PatternGenerationStrategy {
  generate(
    stock: StockDef,
    pieces: ReadonlyArray<PieceDef>,
    config: PatternConfig,
  ): ReadonlyArray<Pattern>;
}

/**
 * Brute-force pattern generator
 *
 * Simple N²/N³ nested loops for combining 2-3 pieces.
 * Fast and efficient for ≤8 distinct pieces.
 */
export class BruteForcePatternGenerator implements PatternGenerationStrategy {
  generate(
    stock: StockDef,
    pieces: ReadonlyArray<PieceDef>,
    config: PatternConfig,
  ): ReadonlyArray<Pattern> {
    const patterns: Pattern[] = [];
    const usable = stock.usable;
    const kerfWidth = config.kerfWidth;

    // Limit pieces to avoid explosion
    const limited = pieces.slice(0, config.maxPiecesPerStock);

    // Generate single-piece patterns
    for (const piece of limited) {
      const maxQty = Math.floor(usable / piece.size);

      for (let qty = 1; qty <= maxQty; qty++) {
        const usedLength = piece.size * qty;
        const kerfNeeded = (qty - 1) * kerfWidth;
        const totalUsed = usedLength + kerfNeeded;

        if (totalUsed <= usable) {
          patterns.push({
            stockId: stock.id,
            stockLength: stock.rawLength,
            usable,
            cuts: [{ pieceId: piece.id, qty }],
            usedLength: totalUsed,
            waste: usable - totalUsed,
          });
        }
      }
    }

    // Generate two-piece combinations
    for (let i = 0; i < limited.length; i++) {
      const p1 = limited[i]!;
      const max1 = Math.floor(usable / p1.size);

      for (let c1 = 1; c1 <= max1; c1++) {
        const used1 = p1.size * c1;
        const kerf1 = (c1 - 1) * kerfWidth;
        const totalUsed1 = used1 + kerf1;

        if (totalUsed1 > usable) continue;

        const remaining = usable - totalUsed1;

        for (let j = i + 1; j < limited.length; j++) {
          const p2 = limited[j]!;
          const max2 = Math.floor(remaining / p2.size);

          for (let c2 = 1; c2 <= max2; c2++) {
            const used2 = p2.size * c2;
            const kerf2 = c2 > 0 && c1 > 0 ? kerfWidth : 0; // kerf between pieces
            const totalUsed2 = used2 + kerf2;

            if (totalUsed1 + totalUsed2 <= usable) {
              const cuts = [];
              if (c1 > 0) cuts.push({ pieceId: p1.id, qty: c1 });
              if (c2 > 0) cuts.push({ pieceId: p2.id, qty: c2 });

              const finalUsed = totalUsed1 + totalUsed2;

              patterns.push({
                stockId: stock.id,
                stockLength: stock.rawLength,
                usable,
                cuts,
                usedLength: finalUsed,
                waste: usable - finalUsed,
              });
            }
          }
        }
      }
    }

    // Generate three-piece combinations (optional, more expensive)
    // Only if pieces count is small
    if (limited.length <= 5) {
      for (let i = 0; i < limited.length; i++) {
        const p1 = limited[i]!;
        const max1 = Math.floor(usable / p1.size);

        for (let c1 = 1; c1 <= max1; c1++) {
          const used1 = p1.size * c1;
          const kerf1 = (c1 - 1) * kerfWidth;
          const totalUsed1 = used1 + kerf1;

          if (totalUsed1 > usable) continue;

          const remaining1 = usable - totalUsed1;

          for (let j = i + 1; j < limited.length; j++) {
            const p2 = limited[j]!;
            const max2 = Math.floor(remaining1 / p2.size);

            for (let c2 = 1; c2 <= max2; c2++) {
              const used2 = p2.size * c2;
              const kerf2 = c1 > 0 ? kerfWidth : 0;
              const totalUsed2 = used2 + kerf2;

              if (totalUsed1 + totalUsed2 > usable) continue;

              const remaining2 = usable - totalUsed1 - totalUsed2;

              for (let k = j + 1; k < limited.length; k++) {
                const p3 = limited[k]!;
                const max3 = Math.floor(remaining2 / p3.size);

                for (let c3 = 1; c3 <= max3; c3++) {
                  const used3 = p3.size * c3;
                  const kerf3 = c2 > 0 ? kerfWidth : 0;
                  const totalUsed3 = used3 + kerf3;

                  if (totalUsed1 + totalUsed2 + totalUsed3 <= usable) {
                    const cuts = [];
                    if (c1 > 0) cuts.push({ pieceId: p1.id, qty: c1 });
                    if (c2 > 0) cuts.push({ pieceId: p2.id, qty: c2 });
                    if (c3 > 0) cuts.push({ pieceId: p3.id, qty: c3 });

                    const finalUsed = totalUsed1 + totalUsed2 + totalUsed3;

                    patterns.push({
                      stockId: stock.id,
                      stockLength: stock.rawLength,
                      usable,
                      cuts,
                      usedLength: finalUsed,
                      waste: usable - finalUsed,
                    });
                  }
                }
              }
            }
          }
        }
      }
    }

    return patterns;
  }
}

/**
 * DP-based pattern generator
 *
 * Uses recursive dynamic programming to generate all valid combinations.
 * More powerful than brute-force, handles larger piece sets efficiently.
 */
export class DPPatternGenerator implements PatternGenerationStrategy {
  constructor(private readonly logger: ILogger) {}

  generate(
    stock: StockDef,
    pieces: ReadonlyArray<PieceDef>,
    config: PatternConfig,
  ): ReadonlyArray<Pattern> {
    const patterns: Pattern[] = [];
    const usable = stock.usable;
    const kerfWidth = config.kerfWidth;

    // Sort pieces by size descending
    const sorted = [...pieces].sort((a, b) => b.size - a.size);
    const limited = sorted.slice(0, config.maxPiecesPerStock);

    // Convert to lengths and maxCounts arrays
    const lengths = limited.map((p) => p.size);
    const maxCounts = lengths.map((len) => Math.floor(usable / len));

    // Generate patterns recursively
    this.generateCombinations(
      lengths,
      maxCounts,
      usable,
      stock,
      kerfWidth,
      new Map<number, number>(),
      0,
      patterns,
      limited,
    );

    this.logger.debug("[DPGenerator] Generated patterns:", {
      stockId: stock.id,
      patternsCount: patterns.length,
    });

    return patterns;
  }

  /**
   * Recursively generate all valid combinations
   */
  private generateCombinations(
    lengths: ReadonlyArray<number>,
    maxCounts: ReadonlyArray<number>,
    usableLength: number,
    stock: StockDef,
    kerfWidth: number,
    currentPattern: Map<number, number>,
    itemIndex: number,
    patterns: Pattern[],
    pieces: ReadonlyArray<PieceDef>,
  ): void {
    if (itemIndex >= lengths.length) {
      // Terminal: check if pattern is valid
      if (currentPattern.size > 0) {
        let used = 0;
        let totalSegments = 0;

        for (const [length, count] of currentPattern.entries()) {
          used += length * count;
          totalSegments += count;
        }

        // Add kerf: (totalSegments - 1) × kerfWidth
        if (kerfWidth > 0 && totalSegments > 0) {
          const kerfNeeded = (totalSegments - 1) * kerfWidth;
          used += kerfNeeded;
        }

        if (used <= usableLength) {
          const waste = usableLength - used;

          // Convert Map<number, number> to Array<{pieceId, qty}>
          const cuts = Array.from(currentPattern.entries())
            .map(([length, qty]) => {
              const piece = pieces.find((p) => p.size === length);
              return piece ? { pieceId: piece.id, qty } : null;
            })
            .filter(
              (cut): cut is { pieceId: string; qty: number } => cut !== null,
            );

          patterns.push({
            stockId: stock.id,
            stockLength: stock.rawLength,
            usable: usableLength,
            cuts,
            usedLength: used,
            waste,
          });
        }
      }
      return;
    }

    const currentLength = lengths[itemIndex]!;

    // Calculate remaining space in current pattern
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

    // Calculate max count for current item based on remaining space
    const maxCount =
      kerfWidth === 0
        ? Math.min(
            maxCounts[itemIndex]!,
            Math.floor(remainingSpace / currentLength),
          )
        : Math.min(
            maxCounts[itemIndex]!,
            Math.floor(
              (remainingSpace + kerfWidth) / (currentLength + kerfWidth),
            ),
          );

    // Try all quantities from 0 to maxCount
    for (let count = 0; count <= maxCount; count++) {
      if (count === 0) {
        // Skip this item
        this.generateCombinations(
          lengths,
          maxCounts,
          usableLength,
          stock,
          kerfWidth,
          currentPattern,
          itemIndex + 1,
          patterns,
          pieces,
        );
      } else {
        // Add this item
        const newPattern = new Map(currentPattern);
        newPattern.set(currentLength, count);

        this.generateCombinations(
          lengths,
          maxCounts,
          usableLength,
          stock,
          kerfWidth,
          newPattern,
          itemIndex + 1,
          patterns,
          pieces,
        );
      }
    }
  }
}

/**
 * Hybrid pattern generator
 *
 * Selects strategy based on number of distinct pieces:
 * - ≤8 pieces: brute-force (fast)
 * - >8 pieces: DP (powerful)
 */
export class HybridPatternGenerator implements PatternGenerationStrategy {
  private readonly bruteForce: BruteForcePatternGenerator;
  private readonly dp: DPPatternGenerator;

  constructor(logger: ILogger) {
    this.bruteForce = new BruteForcePatternGenerator();
    this.dp = new DPPatternGenerator(logger);
  }

  generate(
    stock: StockDef,
    pieces: ReadonlyArray<PieceDef>,
    config: PatternConfig,
  ): ReadonlyArray<Pattern> {
    const distinctPieces = pieces.length;
    const threshold = 8;

    if (distinctPieces <= threshold) {
      return this.bruteForce.generate(stock, pieces, config);
    }

    return this.dp.generate(stock, pieces, config);
  }
}
