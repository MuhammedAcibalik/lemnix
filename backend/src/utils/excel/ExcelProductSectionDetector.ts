/**
 * @fileoverview Excel Product Section Detector
 * @module ExcelProductSectionDetector
 * @version 1.0.0
 * @description Detects product sections in Excel data
 * Extracted from ExcelAnalyzer to follow Single Responsibility Principle
 */

import { ExcelCellUtils, CellValue } from "./ExcelCellUtils";

export type ExcelRow = ReadonlyArray<CellValue>;

/**
 * Service for detecting product sections in Excel sheets
 * Follows Single Responsibility Principle (SRP)
 */
export class ExcelProductSectionDetector {
  /**
   * Check if a value is obviously not a product name
   */
  public static isObviouslyNotProduct(value: string): boolean {
    const normalized = value.toLowerCase().trim();

    // Empty or just whitespace
    if (!normalized) return true;

    // Too short to be meaningful
    if (normalized.length < 2) return true;

    // Common header keywords
    const headerKeywords = [
      "tarih",
      "date",
      "iş emri",
      "work order",
      "sipariş",
      "renk",
      "color",
      "ebat",
      "size",
      "adet",
      "quantity",
      "profil",
      "profile",
      "ölçü",
      "measurement",
    ];

    if (headerKeywords.some((keyword) => normalized.includes(keyword))) {
      return true;
    }

    // Just numbers or special characters
    if (/^[\d\s\-_.,;:]+$/.test(normalized)) return true;

    return false;
  }

  /**
   * Check if value has product characteristics
   */
  public static hasProductCharacteristics(value: string): boolean {
    const normalized = value.trim();

    // Should have reasonable length
    if (normalized.length < 3 || normalized.length > 100) return false;

    // Should contain letters
    if (!/[a-zA-ZğüşıöçĞÜŞİÖÇ]/.test(normalized)) return false;

    // Common product indicators
    const productIndicators = [
      "kapı",
      "pencere",
      "çerçeve",
      "door",
      "window",
      "frame",
      "panel",
      "kasa",
      "kanat",
      "cam",
    ];

    const hasIndicator = productIndicators.some((indicator) =>
      normalized.toLowerCase().includes(indicator),
    );

    return hasIndicator;
  }

  /**
   * Check if value is a valid product name
   */
  public static isValidProductName(value: string): boolean {
    if (this.isObviouslyNotProduct(value)) return false;

    // Additional validation
    const normalized = value.trim();

    // Should not be purely numeric
    if (/^\d+$/.test(normalized)) return false;

    // Should not be too short
    if (normalized.length < 3) return false;

    return true;
  }

  /**
   * Calculate confidence score for a product name
   */
  public static calculateProductNameConfidence(value: string): number {
    if (!this.isValidProductName(value)) return 0;

    let confidence = 0.5; // Base confidence

    // Boost for product indicators
    if (this.hasProductCharacteristics(value)) {
      confidence += 0.3;
    }

    // Boost for reasonable length
    const length = value.trim().length;
    if (length >= 5 && length <= 50) {
      confidence += 0.1;
    }

    // Boost for mixed case or all caps (formatted names)
    if (value !== value.toLowerCase()) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Check if row is likely a data row (contains work order data)
   */
  public static isDataRow(row: ExcelRow): boolean {
    if (!row || row.length === 0) return false;

    // Data rows typically have:
    // 1. At least one valid string
    // 2. At least one number
    // 3. Multiple non-empty cells

    let validStringCount = 0;
    let numberCount = 0;
    let nonEmptyCount = 0;

    for (const cell of row) {
      if (!ExcelCellUtils.isNullOrUndefined(cell)) {
        nonEmptyCount++;

        if (ExcelCellUtils.isValidString(cell)) {
          validStringCount++;
        }

        if (ExcelCellUtils.isNumber(cell)) {
          numberCount++;
        }
      }
    }

    // Data row should have at least 3 non-empty cells
    if (nonEmptyCount < 3) return false;

    // Should have both strings and numbers (mixed data)
    if (validStringCount === 0 || numberCount === 0) return false;

    return true;
  }
}
