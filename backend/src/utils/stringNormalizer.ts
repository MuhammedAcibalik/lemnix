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
  return input
    .toUpperCase()
    .trim()
    // Remove ALL quote/apostrophe characters for consistent matching
    // This handles: ", ", ', ', ", ', ', '', '', etc.
    .replace(/["""'''`´]/g, '')
    // Replace multiple spaces with single space
    .replace(/\s+/g, ' ');
}

/**
 * Create context key (for Product|Size pattern)
 */
export function createContextKey(productName: string, size: string): string {
  return `${normalizeString(productName)}|${normalizeString(size)}`;
}

/**
 * Create pattern key (for Product|Size|Profile|Measurement pattern)
 */
export function createPatternKey(
  productName: string,
  size: string,
  profile: string,
  measurement: string
): string {
  return `${createContextKey(productName, size)}|${normalizeString(profile)}|${normalizeString(measurement)}`;
}

/**
 * Check if two strings match after normalization
 */
export function stringsMatch(str1: string, str2: string): boolean {
  return normalizeString(str1) === normalizeString(str2);
}

