/**
 * Environment Variable Validation with Zod
 *
 * Validates and type-checks all VITE_* environment variables at build time.
 * Prevents runtime errors from missing/invalid configuration.
 *
 * @module shared/config/env
 */

import { z } from "zod";

/**
 * Environment schema definition for frontend
 */
const envSchema = z.object({
  // API Configuration
  VITE_API_URL: z.string().url().default("http://localhost:3001"),

  // WebSocket Configuration
  VITE_WS_URL: z.string().url().optional().default("ws://localhost:3001"),

  // Environment
  MODE: z.enum(["development", "production", "test"]).default("development"),

  // Sentry Configuration (optional)
  VITE_SENTRY_DSN: z.string().url().optional(),

  // Feature Flags (optional)
  // Vite always returns strings from import.meta.env, but we handle both string and boolean for safety
  VITE_ENABLE_ANALYTICS: z
    .preprocess((val) => {
      if (val === undefined || val === null) return false;
      if (typeof val === "boolean") return val;
      if (typeof val === "string") {
        const normalized = val.toLowerCase().trim();
        return (
          normalized === "true" || normalized === "1" || normalized === "yes"
        );
      }
      return false;
    }, z.boolean().default(false))
    .optional(),
});

/**
 * Parse and validate environment variables
 */
function validateEnv() {
  try {
    const parsed = envSchema.parse({
      VITE_API_URL: import.meta.env.VITE_API_URL,
      VITE_WS_URL: import.meta.env.VITE_WS_URL,
      MODE: import.meta.env.MODE,
      VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
      VITE_ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS,
    });
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formatted = error.errors
        .map((err) => {
          const path = err.path.join(".");
          return `  - ${path}: ${err.message}`;
        })
        .join("\n");

      throw new Error(
        `❌ Frontend environment validation failed:\n${formatted}\n\n` +
          "Please check your .env file and ensure all required variables are set correctly.",
      );
    }
    throw error;
  }
}

/**
 * Validated environment variables (singleton)
 */
export const env = validateEnv();

/**
 * Check if running in production
 */
export const isProduction = env.MODE === "production";

/**
 * Check if running in development
 */
export const isDevelopment = env.MODE === "development";

/**
 * Check if running in test
 */
export const isTest = env.MODE === "test";
