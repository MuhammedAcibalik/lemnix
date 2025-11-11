/**
 * @fileoverview Work Order Validator
 * @module WorkOrderValidator
 * @version 1.0.0
 * @description Validates work order IDs and profile types
 * Extracted from ExcelAnalyzer to follow Single Responsibility Principle
 */

import { ExcelCellUtils, CellValue } from "./ExcelCellUtils";

/**
 * Service for validating work order data
 * Follows Single Responsibility Principle (SRP)
 */
export class WorkOrderValidator {
  /**
   * Check if value is a valid work order ID
   */
  public static isValidWorkOrderId(value: string): boolean {
    if (!value || typeof value !== "string") return false;

    const trimmed = value.trim();

    // Must not be empty
    if (trimmed.length === 0) return false;

    // Must have some alphanumeric characters
    if (!/[a-zA-Z0-9]/.test(trimmed)) return false;

    // Common patterns for work order IDs:
    // - Pure numbers: "12345"
    // - Prefixed numbers: "WO-12345", "IS-001"
    // - Date-based: "2024-001"
    // - Mixed: "WO2024001"

    const patterns = [
      /^\d+$/, // Pure numbers
      /^[A-Z]{2,4}[-\s]?\d+$/i, // Prefixed: WO-123, IS 456
      /^\d{4}[-\s]\d{3,}$/i, // Year-based: 2024-001
      /^[A-Z]+\d+$/i, // Mixed: WO123
    ];

    return patterns.some((pattern) => pattern.test(trimmed));
  }

  /**
   * Check if value looks like a profile type
   */
  public static looksLikeProfileType(value: string): boolean {
    if (!value || typeof value !== "string") return false;

    const normalized = ExcelCellUtils.normalizeText(value);

    // Common profile type indicators
    const profileIndicators = [
      "KAPALI ALT",
      "AÇIK ALT",
      "KAPALI ÜST",
      "AÇIK ÜST",
      "DİK",
      "YATAY",
      "KÖŞE",
      "PROFİL",
      "KASA",
      "KANAT",
      "ÇERÇEVE",
      "TRAVERSE",
      "İMPOST",
    ];

    return profileIndicators.some((indicator) =>
      normalized.includes(indicator),
    );
  }

  /**
   * Extract and validate work order ID from a cell value
   */
  public static extractWorkOrderId(value: CellValue): string | null {
    if (ExcelCellUtils.isNullOrUndefined(value)) return null;

    const str = ExcelCellUtils.toString(value);

    if (!this.isValidWorkOrderId(str)) return null;

    return str.trim();
  }

  /**
   * Validate a complete work order has required fields
   */
  public static isCompleteWorkOrder(data: {
    workOrderId?: string;
    profiles?: unknown[];
  }): boolean {
    // Must have a valid work order ID
    if (!data.workOrderId || !this.isValidWorkOrderId(data.workOrderId)) {
      return false;
    }

    // Must have at least one profile
    if (!data.profiles || !Array.isArray(data.profiles) || data.profiles.length === 0) {
      return false;
    }

    return true;
  }
}
