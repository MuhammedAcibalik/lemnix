/**
 * LEMNİX Stock Calculator
 * Handles all stock-related calculations (kerf, safety, max pieces)
 * 
 * @module optimization/helpers
 * @version 1.0.0
 * @architecture Pure functions (no side effects)
 */

import { EnhancedConstraints } from '../types';

/**
 * Stock calculator with pure mathematical functions
 * All methods are static and side-effect free
 */
export class StockCalculator {
  /**
   * Calculate maximum pieces that can fit on a single bar
   * 
   * Formula: s₁ + n·L + (n−1)·k + s₂ ≤ S
   * Solving for n: n ≤ (S - s₁ - s₂ + k) / (L + k)
   * 
   * @param itemLength - Length of item to fit (mm)
   * @param stockLength - Total stock length (mm)
   * @param kerfWidth - Saw kerf width (mm)
   * @param startSafety - Start safety margin (mm)
   * @param endSafety - End safety margin (mm)
   * @returns Maximum number of pieces that fit
   */
  public static calculateMaxPiecesOnBar(
    itemLength: number,
    stockLength: number,
    kerfWidth: number,
    startSafety: number,
    endSafety: number
  ): number {
    const effectiveLength = stockLength - startSafety - endSafety;
    const maxPieces = Math.floor((effectiveLength + kerfWidth) / (itemLength + kerfWidth));
    return Math.max(0, maxPieces);
  }

  /**
   * Select best stock length for waste minimization
   * ✅ OPTIMIZED: Waste-per-item strategy - minimize fire per piece
   * 
   * Strategy: Select stock with minimum waste-per-item ratio
   * This balances stock count and total waste efficiently
   * 
   * @param itemLength - Length of item to fit (mm)
   * @param availableStockLengths - Available stock lengths sorted (mm)
   * @param kerfWidth - Saw kerf width (mm)
   * @param startSafety - Start safety margin (mm)
   * @param endSafety - End safety margin (mm)
   * @param quantity - Number of items to place (default: 1)
   * @returns Optimal stock length
   */
  public static selectBestStockLengthForItem(
    itemLength: number,
    availableStockLengths: ReadonlyArray<number>,
    kerfWidth: number,
    startSafety: number,
    endSafety: number,
    quantity: number = 1
  ): number {
    if (availableStockLengths.length === 0) {
      return 6100; // Default fallback
    }
    
    // ✅ WASTE-PER-ITEM STRATEGY: Minimize waste per piece placed
    // Example: 918mm → 6000mm fits 6pcs (492mm waste ÷ 6 = 82mm/pc)
    //          918mm → 3400mm fits 3pcs (646mm waste ÷ 3 = 215mm/pc)
    // → Select 6000mm (lower waste per piece)
    
    let bestStock = availableStockLengths[0];
    let bestWastePerPiece = Infinity;
    
    for (const stockLength of availableStockLengths) {
      const maxPieces = this.calculateMaxPiecesOnBar(
        itemLength,
        stockLength,
        kerfWidth,
        startSafety,
        endSafety
      );
      
      if (maxPieces === 0) continue; // Skip if doesn't fit
      
      // Calculate waste per piece
      const usedLength = startSafety + 
        maxPieces * itemLength + 
        (maxPieces > 0 ? (maxPieces - 1) * kerfWidth : 0) + 
        endSafety;
      const waste = stockLength - usedLength;
      const wastePerPiece = waste / maxPieces;
      
      // Select stock with minimum waste per piece
      if (wastePerPiece < bestWastePerPiece) {
        bestStock = stockLength;
        bestWastePerPiece = wastePerPiece;
      }
    }
    
    return bestStock;
  }

  /**
   * Calculate kerf needed between pieces
   * 
   * @param currentPieceCount - Number of pieces already placed
   * @param kerfWidth - Saw kerf width (mm)
   * @returns Kerf needed before placing next piece
   */
  public static calculateKerfNeeded(currentPieceCount: number, kerfWidth: number): number {
    // ✅ FIX: Kerf width 0 ise kerf hesaplama yapma (kesim listelerindeki ölçüler zaten kerf payı eklenmiş)
    if (kerfWidth <= 0) {
      return 0;
    }
    return currentPieceCount > 0 ? kerfWidth : 0;
  }

  /**
   * Calculate total stock length used
   * 
   * Formula: used = s₁ + Σ(L_i) + (n-1)·k + s₂
   * 
   * @param pieceCount - Number of pieces
   * @param totalPieceLength - Sum of all piece lengths (mm)
   * @param kerfWidth - Saw kerf width (mm)
   * @param startSafety - Start safety margin (mm)
   * @param endSafety - End safety margin (mm)
   * @returns Total used length
   */
  public static calculateUsedLength(
    pieceCount: number,
    totalPieceLength: number,
    kerfWidth: number,
    startSafety: number,
    endSafety: number
  ): number {
    // ✅ FIX: Kerf width 0 ise kerf hesaplama yapma (kesim listelerindeki ölçüler zaten kerf payı eklenmiş)
    const kerfLoss = (kerfWidth > 0 && pieceCount > 0) ? (pieceCount - 1) * kerfWidth : 0;
    return startSafety + totalPieceLength + kerfLoss + endSafety;
  }

  /**
   * Calculate remaining length on stock
   * 
   * @param stockLength - Total stock length (mm)
   * @param usedLength - Used length (mm)
   * @returns Remaining length
   */
  public static calculateRemainingLength(stockLength: number, usedLength: number): number {
    return Math.max(0, stockLength - usedLength);
  }

  /**
   * Check if item fits in remaining space
   * 
   * @param itemLength - Length of item (mm)
   * @param remainingLength - Available remaining length (mm)
   * @param currentPieceCount - Number of pieces already placed
   * @param kerfWidth - Saw kerf width (mm)
   * @returns True if item fits
   */
  public static canFitItem(
    itemLength: number,
    remainingLength: number,
    currentPieceCount: number,
    kerfWidth: number
  ): boolean {
    const kerfNeeded = this.calculateKerfNeeded(currentPieceCount, kerfWidth);
    const totalNeeded = itemLength + kerfNeeded;
    return remainingLength >= totalNeeded;
  }

  /**
   * Calculate efficiency percentage
   * 
   * @param totalStockLength - Sum of all stock lengths used (mm)
   * @param totalWaste - Sum of all waste (mm)
   * @returns Efficiency percentage (0-100)
   */
  public static calculateEfficiency(totalStockLength: number, totalWaste: number): number {
    if (totalStockLength <= 0) return 0;
    return ((totalStockLength - totalWaste) / totalStockLength) * 100;
  }

  /**
   * Validate stock accounting
   * 
   * Ensures: usedLength + remainingLength === stockLength
   * 
   * @param usedLength - Used length (mm)
   * @param remainingLength - Remaining length (mm)
   * @param stockLength - Total stock length (mm)
   * @param tolerance - Numerical tolerance (default: 1e-9)
   * @returns True if accounting is valid
   */
  public static validateStockAccounting(
    usedLength: number,
    remainingLength: number,
    stockLength: number,
    tolerance: number = 1e-9
  ): boolean {
    const sum = usedLength + remainingLength;
    return Math.abs(sum - stockLength) < tolerance;
  }

  /**
   * Get standard stock lengths (industry standard)
   * 
   * @returns Array of standard aluminum extrusion lengths (mm)
   */
  public static getStandardStockLengths(): ReadonlyArray<number> {
    return Object.freeze([6100, 6500, 7300, 8000]);
  }

  /**
   * Get standard kerf width for aluminum
   * 
   * @returns Standard saw kerf width (mm)
   */
  public static getStandardKerfWidth(): number {
    return 3.5;
  }

  /**
   * Get standard safety margins
   * 
   * @returns Object with start and end safety margins (mm)
   */
  public static getStandardSafetyMargins(): { start: number; end: number } {
    return { start: 2.0, end: 2.0 };
  }
}

