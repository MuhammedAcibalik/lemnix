/**
 * @fileoverview String Normalization Utility
 * @module utils/stringNormalizer
 *
 * Normalizes strings for consistent comparison
 * Handles special characters, quotes, whitespace, and case
 */

/**
 * Normalize a string for comparison
 * - Uppercase
 * - Trim whitespace
 * - Replace all quote variations with single quote '
 * - Remove extra spaces
 */
export function normalizeString(input: string): string {
  return (
    input
      .toUpperCase()
      .trim()
      // Remove ALL quote/apostrophe characters for consistent matching
      // This handles: ", ", ', ', ", ', ', '', '', etc.
      .replace(/["""'''`´]/g, "")
      // Replace multiple spaces with single space
      .replace(/\s+/g, " ")
  );
}

/**
 * Normalize measurement for consistent comparison
 * - Extract number from string (handles "992mm", "992 mm", "992", etc.)
 * - Standardize to integer format
 * - Fallback to string normalization if no number found
 */
export function normalizeMeasurement(input: string): string {
  if (!input || typeof input !== "string") {
    return normalizeString(input || "");
  }

  // Try to extract number (handles decimals, commas, etc.)
  const match = input.match(/(\d+(?:[.,]\d+)?)/);
  if (match) {
    const number = parseFloat(match[1].replace(",", "."));
    // Standardize to integer (round to nearest integer)
    return `${Math.round(number)}`;
  }

  // Fallback to string normalization if no number found
  return normalizeString(input);
}

/**
 * Normalize profile type for consistent comparison
 * - Uppercase, trim, remove quotes
 * - Normalize spaces (but keep single spaces between words)
 * - Handle common variations (KAPALI ALT vs KAPALIALT)
 */
export function normalizeProfile(input: string): string {
  if (!input || typeof input !== "string") {
    return normalizeString(input || "");
  }

  return normalizeString(input);
}

/**
 * Create context key (for Product|Size pattern)
 */
export function createContextKey(productName: string, size: string): string {
  return `${normalizeString(productName)}|${normalizeString(size)}`;
}

/**
 * Create pattern key (for Product|Size|Profile|Measurement pattern)
 * ✅ FIXED: Uses normalizeMeasurement for consistent measurement comparison
 * ✅ FIXED: Uses normalizeProfile for consistent profile comparison
 */
export function createPatternKey(
  productName: string,
  size: string,
  profile: string,
  measurement: string,
): string {
  return `${createContextKey(productName, size)}|${normalizeProfile(profile)}|${normalizeMeasurement(measurement)}`;
}

/**
 * Check if two strings match after normalization
 */
export function stringsMatch(str1: string, str2: string): boolean {
  return normalizeString(str1) === normalizeString(str2);
}
