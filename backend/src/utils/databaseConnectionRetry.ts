/**
 * @fileoverview Database Connection Retry Utility
 * @module DatabaseConnectionRetry
 * @version 1.0.0
 * 
 * Provides retry logic for database operations that may fail due to
 * connection issues or transient errors.
 */

import { Prisma } from '@prisma/client';
import { logger } from '../services/logger';
import { isRetryableError, PrismaErrorCode } from './prismaErrorHandler';

/**
 * Retry configuration
 */
export interface ConnectionRetryConfig {
  maxRetries?: number;
  retryDelay?: number; // milliseconds
  backoffMultiplier?: number;
  retryableErrors?: string[]; // Additional error codes to retry
}

const DEFAULT_CONFIG: Required<ConnectionRetryConfig> = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second initial delay
  backoffMultiplier: 2, // Exponential backoff
  retryableErrors: [],
};

/**
 * Execute a database operation with retry logic for connection errors
 */
export async function executeWithConnectionRetry<T>(
  operation: () => Promise<T>,
  retryConfig: ConnectionRetryConfig = {},
  context?: {
    operation?: string;
    model?: string;
  },
): Promise<T> {
  const config = { ...DEFAULT_CONFIG, ...retryConfig };
  let lastError: unknown;
  let delay = config.retryDelay;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Check if error is retryable
      const isRetryable = isRetryableError(error) ||
        (error instanceof Prisma.PrismaClientKnownRequestError &&
          (error.code === PrismaErrorCode.CONNECTION_ERROR ||
            error.code === PrismaErrorCode.CONNECTION_TIMEOUT ||
            config.retryableErrors.includes(error.code)));

      if (!isRetryable) {
        logger.debug('Non-retryable error, not retrying', {
          attempt,
          context,
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }

      // Check if we should retry
      if (attempt < config.maxRetries) {
        logger.warn('Database operation failed, retrying', {
          attempt: attempt + 1,
          maxRetries: config.maxRetries,
          delay,
          context,
          error: error instanceof Error ? error.message : String(error),
        });

        // Wait before retrying (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= config.backoffMultiplier;
        continue;
      }

      // Max retries reached
      logger.error('Max retries reached for database operation', {
        maxRetries: config.maxRetries,
        context,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError;
}

/**
 * Wrap a Prisma query with connection retry
 */
export function withConnectionRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  retryConfig?: ConnectionRetryConfig,
): T {
  return (async (...args: Parameters<T>) => {
    return executeWithConnectionRetry(
      () => fn(...args),
      retryConfig,
      { operation: fn.name },
    );
  }) as T;
}

