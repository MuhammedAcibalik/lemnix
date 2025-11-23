/**
 * Environment Variable Validation with Zod
 *
 * Validates and type-checks all environment variables at startup.
 * Prevents runtime errors from missing/invalid configuration.
 *
 * @module config/env
 */

// Load environment variables first (before validation)
import dotenv from "dotenv";
dotenv.config();

import { z } from "zod";

/**
 * Environment schema definition
 */
const envSchema = z
  .object({
    // Node environment
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),

    // Server configuration
    PORT: z
      .string()
      .regex(/^\d+$/, "PORT must be a number")
      .transform(Number)
      .pipe(z.number().int().positive().max(65535))
      .default("3001"),

    // Frontend URL for CORS
    FRONTEND_URL: z.string().url().default("http://localhost:3000"),

    // Database
    DATABASE_URL: z
      .string()
      .regex(
        /^postgres(?:ql)?:\/\/.+/,
        "DATABASE_URL must be a valid PostgreSQL connection string (e.g. postgres://user:pass@host:5432/db)",
      ),

    // JWT Authentication (REQUIRED in production, optional in development)
    JWT_SECRET: z
      .string()
      .min(32)
      .optional()
      .transform((val) => {
        // In production, JWT_SECRET is required
        if (process.env.NODE_ENV === "production" && !val) {
          throw new Error("JWT_SECRET is required in production environment");
        }
        // In development, provide a default
        return val || "dev-secret-key-DO-NOT-USE-IN-PRODUCTION-12345678";
      }),
    JWT_EXPIRES_IN: z.string().default("7d"),

    // Rate limiting
    RATE_LIMIT_WINDOW_MS: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .pipe(z.number().int().positive())
      .default("60000"),

    RATE_LIMIT_MAX_REQUESTS: z
      .string()
      .regex(/^\d+$/)
      .transform(Number)
      .pipe(z.number().int().positive())
      .default("100"),

    // Logging
    LOG_LEVEL: z
      .enum(["error", "warn", "info", "debug", "verbose"])
      .default("info"),

    // Session management
    SESSION_STORE_DRIVER: z
      .enum(["memory", "redis"])
      .default(process.env.NODE_ENV === "production" ? "redis" : "memory"),
    REDIS_URL: z
      .string()
      .regex(
        /^rediss?:\/\/.+/,
        "REDIS_URL must be a valid redis connection string (e.g. redis://user:pass@host:6379/0)",
      )
      .optional(),

    // GPU optimization settings
    ENABLE_GPU: z
      .string()
      .transform((val) => val === "true")
      .pipe(z.boolean())
      .default("false"),

    // Security
    ENABLE_HELMET: z
      .string()
      .transform((val) => val === "true")
      .pipe(z.boolean())
      .default("true"),

    ENABLE_CORS: z
      .string()
      .transform((val) => val === "true")
      .pipe(z.boolean())
      .default("true"),
  })
  .superRefine((config, ctx) => {
    if (config.SESSION_STORE_DRIVER === "redis" && !config.REDIS_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "REDIS_URL is required when SESSION_STORE_DRIVER is set to 'redis' (default in production)",
        path: ["REDIS_URL"],
      });
    }
  });

/**
 * Parsed and validated environment variables
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Validate environment variables
 *
 * @throws {z.ZodError} If validation fails
 * @returns Validated environment variables
 */
export function validateEnv(): Env {
  try {
    // 6432 → 5432 otomatik düzeltme (eski PgBouncer URL'leri için)
    const rawDatabaseUrl = process.env.DATABASE_URL;
    const normalizedDatabaseUrl = rawDatabaseUrl?.includes("localhost:6432")
      ? rawDatabaseUrl.replace("localhost:6432", "localhost:5432")
      : rawDatabaseUrl;

    const parsed = envSchema.parse({
      ...process.env,
      DATABASE_URL: normalizedDatabaseUrl,
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
        `❌ Environment validation failed:\n${formatted}\n\n` +
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
export const isProduction = env.NODE_ENV === "production";

/**
 * Check if running in development
 */
export const isDevelopment = env.NODE_ENV === "development";

/**
 * Check if running in test
 */
export const isTest = env.NODE_ENV === "test";
