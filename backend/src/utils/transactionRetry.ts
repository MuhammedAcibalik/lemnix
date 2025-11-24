/**
 * Transaction Retry Utility
 *
 * Provides retry logic for database transactions that may fail due to
 * deadlocks or transient errors
 *
 * @module utils/transactionRetry
 * @version 1.0.0
 */

import { Prisma, PrismaClient } from "@prisma/client";
import { logger } from "../services/logger";
import { PrismaErrorCode, isRetryableError } from "./prismaErrorHandler";

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number; // milliseconds
  backoffMultiplier?: number;
}

const DEFAULT_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  retryDelay: 100, // 100ms initial delay
  backoffMultiplier: 2, // Exponential backoff
};

/**
 * Execute a transaction with retry logic for transient errors
 *
 * @param client - Prisma client instance
 * @param handler - Transaction handler function
 * @param options - Transaction options
 * @param retryConfig - Retry configuration
 * @returns Result of the transaction
 */
export async function executeWithRetry<T>(
  client: {
    $transaction: <T>(
      handler: (tx: Prisma.TransactionClient) => Promise<T>,
      options?: Parameters<PrismaClient["$transaction"]>[1],
    ) => Promise<T>;
  },
  handler: (tx: Prisma.TransactionClient) => Promise<T>,
  options?: Parameters<PrismaClient["$transaction"]>[1],
  retryConfig: RetryConfig = {},
): Promise<T> {
  const config = { ...DEFAULT_CONFIG, ...retryConfig };
  let lastError: unknown;
  let delay = config.retryDelay;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await client.$transaction(handler, options);
    } catch (error) {
      lastError = error;

      // Check if error is retryable
      if (!isRetryableError(error)) {
        logger.debug("Non-retryable error, not retrying", {
          attempt,
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }

      // Check if it's a transaction failure (deadlock, etc.)
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === PrismaErrorCode.TRANSACTION_FAILED ||
          error.code === "P2034")
      ) {
        if (attempt < config.maxRetries) {
          logger.warn("Transaction failed, retrying", {
            attempt: attempt + 1,
            maxRetries: config.maxRetries,
            delay,
            error: error.message,
          });

          // Wait before retrying (exponential backoff)
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= config.backoffMultiplier;
          continue;
        }
      }

      // For other retryable errors, retry immediately
      if (attempt < config.maxRetries) {
        logger.warn("Retryable error, retrying", {
          attempt: attempt + 1,
          maxRetries: config.maxRetries,
          error: error instanceof Error ? error.message : String(error),
        });
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= config.backoffMultiplier;
        continue;
      }

      // Max retries reached
      logger.error("Max retries reached for transaction", {
        maxRetries: config.maxRetries,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError;
}
