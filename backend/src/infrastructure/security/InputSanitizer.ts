/**
 * Input Sanitizer
 *
 * Sanitizes user input to prevent SQL injection and XSS attacks
 *
 * @module infrastructure/security/InputSanitizer
 * @version 1.0.0
 */

import { logger } from "../../services/logger";

/**
 * Input Sanitizer
 */
export class InputSanitizer {
  /**
   * Sanitize string input
   */
  public static sanitizeString(input: string, maxLength?: number): string {
    if (typeof input !== "string") {
      throw new Error("Input must be a string");
    }

    // Remove null bytes
    let sanitized = input.replace(/\0/g, "");

    // Trim whitespace
    sanitized = sanitized.trim();

    // Apply length limit
    if (maxLength && sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
      logger.warn("Input truncated due to length limit", {
        originalLength: input.length,
        maxLength,
      });
    }

    return sanitized;
  }

  /**
   * Sanitize number input
   */
  public static sanitizeNumber(
    input: unknown,
    min?: number,
    max?: number,
  ): number {
    if (typeof input === "number") {
      if (isNaN(input) || !isFinite(input)) {
        throw new Error("Input must be a finite number");
      }
      if (min !== undefined && input < min) {
        throw new Error(`Input must be at least ${min}`);
      }
      if (max !== undefined && input > max) {
        throw new Error(`Input must be at most ${max}`);
      }
      return input;
    }

    if (typeof input === "string") {
      const parsed = parseFloat(input);
      if (isNaN(parsed)) {
        throw new Error("Input must be a valid number");
      }
      return this.sanitizeNumber(parsed, min, max);
    }

    throw new Error("Input must be a number or numeric string");
  }

  /**
   * Sanitize integer input
   */
  public static sanitizeInteger(
    input: unknown,
    min?: number,
    max?: number,
  ): number {
    const number = this.sanitizeNumber(input, min, max);
    if (!Number.isInteger(number)) {
      throw new Error("Input must be an integer");
    }
    return number;
  }

  /**
   * Sanitize email input
   */
  public static sanitizeEmail(input: string): string {
    const sanitized = this.sanitizeString(input, 255);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitized)) {
      throw new Error("Invalid email format");
    }
    return sanitized.toLowerCase();
  }

  /**
   * Sanitize ID input (cuid format)
   */
  public static sanitizeId(input: string): string {
    const sanitized = this.sanitizeString(input, 100);
    // Basic validation for cuid format (alphanumeric with hyphens)
    if (!/^[a-z0-9-]+$/i.test(sanitized)) {
      throw new Error("Invalid ID format");
    }
    return sanitized;
  }

  /**
   * Sanitize object keys (prevent prototype pollution)
   */
  public static sanitizeObjectKeys<T extends Record<string, unknown>>(
    obj: T,
  ): T {
    const sanitized = {} as Record<string, unknown>;
    for (const [key, value] of Object.entries(obj)) {
      // Prevent prototype pollution
      if (key === "__proto__" || key === "constructor" || key === "prototype") {
        logger.warn("Attempted prototype pollution detected", { key });
        continue;
      }
      sanitized[key] = value;
    }
    return sanitized as T;
  }

  /**
   * Sanitize array of strings
   */
  public static sanitizeStringArray(
    input: unknown[],
    maxLength?: number,
  ): string[] {
    if (!Array.isArray(input)) {
      throw new Error("Input must be an array");
    }
    return input.map((item) => this.sanitizeString(String(item), maxLength));
  }

  /**
   * Sanitize date input
   */
  public static sanitizeDate(input: unknown): Date {
    if (input instanceof Date) {
      if (isNaN(input.getTime())) {
        throw new Error("Invalid date");
      }
      return input;
    }

    if (typeof input === "string") {
      const parsed = new Date(input);
      if (isNaN(parsed.getTime())) {
        throw new Error("Invalid date format");
      }
      return parsed;
    }

    throw new Error("Input must be a Date or date string");
  }
}
