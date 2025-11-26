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
import * as fs from "fs";
import * as path from "path";
dotenv.config();

import { z } from "zod";

/**
 * Read secret from Docker secrets file or environment variable
 * Docker secrets are mounted at /run/secrets/<secret_name>
 */
function readSecret(envVar: string, secretFile?: string): string | undefined {
  // Try Docker secret file first (production)
  if (secretFile) {
    const secretPath = `/run/secrets/${secretFile}`;
    try {
      if (fs.existsSync(secretPath)) {
        const secret = fs.readFileSync(secretPath, "utf-8").trim();
        if (secret) {
          return secret;
        }
      }
    } catch (error) {
      // Ignore errors, fall back to environment variable
    }
  }

  // Fall back to environment variable
  return process.env[envVar];
}

/**
 * Environment schema definition
 */
const envSchema = z.object({
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

  // CORS Origins (comma-separated list)
  CORS_ORIGINS: z
    .string()
    .optional()
    .transform((val) => {
      if (val) {
        return val.split(",").map((origin) => origin.trim());
      }
      return undefined;
    }),

  // Database
  DATABASE_URL: z
    .string()
    .regex(
      /^postgres(?:ql)?:\/\/.+/,
      "DATABASE_URL must be a valid PostgreSQL connection string (e.g. postgres://user:pass@host:5432/db)",
    )
    .refine(
      (url) => {
        // In production, require SSL
        if (process.env.NODE_ENV === 'production') {
          try {
            const urlObj = new URL(url);
            const params = new URLSearchParams(urlObj.search);
            const sslMode = params.get('sslmode');
            return sslMode === 'require' || sslMode === 'prefer';
          } catch {
            return false;
          }
        }
        return true;
      },
      {
        message: "DATABASE_URL must use sslmode=require in production",
      },
    ),
  
  // Database connection pool settings (optional)
  DATABASE_CONNECTION_LIMIT: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().positive().max(200))
    .optional(),
  
  DATABASE_POOL_TIMEOUT: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().positive().max(300))
    .optional(),
  
  DATABASE_TRANSACTION_TIMEOUT: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().positive().max(60000))
    .optional(),
  
  DATABASE_RETRY_ATTEMPTS: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().positive().max(10))
    .optional(),
  
  DATABASE_RETRY_DELAY: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().positive().max(10000))
    .optional(),
  
  DATABASE_SLOW_QUERY_THRESHOLD_MS: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().positive().max(10000))
    .optional(),
  
  DATABASE_SSL_ENABLED: z
    .string()
    .transform((val) => val !== 'false')
    .optional(),

  // JWT Authentication (REQUIRED in all environments for security hardening)
  JWT_SECRET: z
    .string()
    .min(32)
    .transform((val) => {
      // Try reading from Docker secret file first
      const secretValue = readSecret("JWT_SECRET", "jwt_secret") || val;
      // ✅ SECURITY: JWT_SECRET is required in all environments
      if (!secretValue) {
        throw new Error(
          "JWT_SECRET is required. Please set JWT_SECRET environment variable or provide Docker secret file.",
        );
      }
      return secretValue;
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

  // Redis (optional, for caching and rate limiting)
  REDIS_URL: z.string().url().optional(),

  // Encryption Master Key (REQUIRED in production)
  ENCRYPTION_MASTER_KEY: z
    .string()
    .min(32)
    .optional()
    .transform((val) => {
      // Try reading from Docker secret file first
      const secretValue =
        readSecret("ENCRYPTION_MASTER_KEY", "encryption_master_key") || val;
      // In production, ENCRYPTION_MASTER_KEY is required
      if (process.env.NODE_ENV === "production" && !secretValue) {
        throw new Error(
          "ENCRYPTION_MASTER_KEY is required in production environment",
        );
      }
      return secretValue;
    }),
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
