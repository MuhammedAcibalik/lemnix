/**
 * @fileoverview Excel Cell Value Utilities
 * @module ExcelCellUtils
 * @version 1.0.0
 * @description Utility functions for handling Excel cell values
 * Extracted from ExcelAnalyzer to follow Single Responsibility Principle
 */

export type CellValue = string | number | boolean | Date | null | undefined;

/**
 * Utility class for Excel cell value operations
 * Follows Single Responsibility Principle (SRP)
 */
export class ExcelCellUtils {
  /**
   * Type guard: Check if value is string
   */
  public static isString(value: CellValue): value is string {
    return typeof value === "string";
  }

  /**
   * Type guard: Check if value is number
   */
  public static isNumber(value: CellValue): value is number {
    return typeof value === "number" && !isNaN(value) && isFinite(value);
  }

  /**
   * Type guard: Check if value is date
   */
  public static isDate(value: CellValue): value is Date {
    return value instanceof Date && !isNaN(value.getTime());
  }

  /**
   * Type guard: Check if value is null or undefined
   */
  public static isNullOrUndefined(value: CellValue): value is null | undefined {
    return value === null || value === undefined;
  }

  /**
   * Check if value is a valid, non-empty string
   */
  public static isValidString(value: CellValue): boolean {
    return (
      this.isString(value) && value.trim().length > 0 && value.trim() !== "-"
    );
  }

  /**
   * Convert cell value to string
   */
  public static toString(value: CellValue): string {
    if (this.isNullOrUndefined(value)) return "";
    if (this.isString(value)) return value.trim();
    return String(value);
  }

  /**
   * Convert cell value to number
   */
  public static toNumber(value: CellValue): number | undefined {
    if (this.isNullOrUndefined(value)) return undefined;
    if (this.isNumber(value)) return value;
    if (this.isString(value)) {
      const trimmed = value.trim();
      if (!trimmed) return undefined;
      const num = parseFloat(trimmed);
      return isNaN(num) ? undefined : num;
    }
    return undefined;
  }

  /**
   * Extract number from mixed string (e.g., "123adet" -> 123)
   */
  public static extractNumber(value: CellValue): number | undefined {
    const str = this.toString(value);
    const match = str.match(/\d+(?:[.,]\d+)?/);
    return match ? parseFloat(match[0].replace(",", ".")) : undefined;
  }

  /**
   * Normalize text: trim, uppercase, remove extra spaces
   */
  public static normalizeText(value: CellValue): string {
    if (!this.isValidString(value)) return "";
    return this.toString(value)
      .toUpperCase()
      .replace(/\s+/g, " ")
      .trim();
  }
}
