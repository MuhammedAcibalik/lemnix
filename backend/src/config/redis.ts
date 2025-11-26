/**
 * Redis Client Configuration
 * Singleton Redis client with connection pooling and error handling
 *
 * @module config/redis
 * @version 1.0.0
 */

import Redis, { RedisOptions } from "ioredis";
import { logger } from "../services/logger";

let redisClient: Redis | null = null;

/**
 * Redis connection options
 */
function getRedisOptions(): RedisOptions {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  const redisPassword = process.env.REDIS_PASSWORD;

  const options: RedisOptions = {
    maxRetriesPerRequest: 3,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    reconnectOnError: (err: Error) => {
      const targetError = "READONLY";
      if (err.message.includes(targetError)) {
        // Only reconnect when the error contains "READONLY"
        return true;
      }
      return false;
    },
    enableReadyCheck: true,
    enableOfflineQueue: false, // Don't queue commands when offline
  };

  // Parse Redis URL if provided
  if (redisUrl.startsWith("redis://") || redisUrl.startsWith("rediss://")) {
    // ioredis can parse URL directly
    return {
      ...options,
      host: undefined,
      port: undefined,
      password: redisPassword,
      // Let ioredis parse the URL
    };
  }

  // Fallback to individual options
  const urlParts = redisUrl.split(":");
  return {
    ...options,
    host: urlParts[0] || "localhost",
    port: parseInt(urlParts[1] || "6379", 10),
    password: redisPassword,
  };
}

/**
 * Get or create Redis client instance (singleton)
 * @returns Redis client instance
 */
export function getRedisClient(): Redis {
  if (redisClient && redisClient.status === "ready") {
    return redisClient;
  }

  const options = getRedisOptions();
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

  // Create new client (ioredis handles URL parsing)
  redisClient = redisUrl.startsWith("redis://") || redisUrl.startsWith("rediss://")
    ? new Redis(redisUrl, options)
    : new Redis(options);

  // Event handlers
  redisClient.on("connect", () => {
    logger.info("Redis client connecting", {
      host: options.host || "from URL",
      port: options.port || "from URL",
    });
  });

  redisClient.on("ready", () => {
    logger.info("Redis client ready");
  });

  redisClient.on("error", (error: Error) => {
    logger.error("Redis client error", { error: error.message });
  });

  redisClient.on("close", () => {
    logger.warn("Redis client connection closed");
  });

  redisClient.on("reconnecting", () => {
    logger.info("Redis client reconnecting");
  });

  return redisClient;
}

/**
 * Close Redis client connection
 */
export async function closeRedisClient(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info("Redis client closed");
  }
}

/**
 * Check if Redis is connected
 * @returns True if connected
 */
export function isRedisConnected(): boolean {
  return redisClient !== null && redisClient.status === "ready";
}

/**
 * Get Redis client instance (for direct access if needed)
 */
export const redis = getRedisClient();

