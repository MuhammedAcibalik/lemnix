/**
 * BullMQ Queue Configuration
 * Queue setup for async job processing
 *
 * @module config/queue
 * @version 1.0.0
 */

import { Queue, QueueOptions, Worker, WorkerOptions } from "bullmq";
import { getRedisClient } from "./redis";
import { logger } from "../services/logger";

const QUEUE_NAME = "optimization";
const CONCURRENCY = parseInt(process.env.QUEUE_CONCURRENCY || "5", 10);

/**
 * Redis connection for BullMQ
 */
function getRedisConnection() {
  const redisUrl = process.env.QUEUE_REDIS_URL || process.env.REDIS_URL || "redis://localhost:6379";
  const redisPassword = process.env.REDIS_PASSWORD;

  // If URL format, use it directly (BullMQ/ioredis supports URL format)
  if (redisUrl.startsWith("redis://") || redisUrl.startsWith("rediss://")) {
    // Parse URL for password if included
    try {
      const url = new URL(redisUrl);
      const password = url.password || redisPassword;
      return {
        connection: redisUrl, // BullMQ accepts URL string directly
      };
    } catch {
      // Fallback to object format
      return {
        connection: {
          host: "localhost",
          port: 6379,
          password: redisPassword,
        },
      };
    }
  }

  // Fallback to host:port format
  const urlParts = redisUrl.split(":");
  return {
    connection: {
      host: urlParts[0] || "localhost",
      port: parseInt(urlParts[1] || "6379", 10),
      password: redisPassword,
    },
  };
}

/**
 * Queue options
 */
const queueOptions: QueueOptions = {
  ...getRedisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 1000, // Keep last 1000 completed jobs
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
};

/**
 * Worker options
 */
const workerOptions: WorkerOptions = {
  ...getRedisConnection(),
  concurrency: CONCURRENCY,
  limiter: {
    max: 10, // Max 10 jobs per interval
    duration: 1000, // Per second
  },
};

/**
 * Optimization queue instance
 */
let optimizationQueue: Queue | null = null;

/**
 * Get or create optimization queue instance
 */
export function getOptimizationQueue(): Queue {
  if (optimizationQueue) {
    return optimizationQueue;
  }

  optimizationQueue = new Queue(QUEUE_NAME, queueOptions);

  optimizationQueue.on("error", (error) => {
    logger.error("Queue error", { error: error.message });
  });

  logger.info("Optimization queue initialized", {
    queueName: QUEUE_NAME,
    concurrency: CONCURRENCY,
  });

  return optimizationQueue;
}

/**
 * Get worker options
 */
export function getWorkerOptions(): WorkerOptions {
  return workerOptions;
}

/**
 * Close queue connection
 */
export async function closeQueue(): Promise<void> {
  if (optimizationQueue) {
    await optimizationQueue.close();
    optimizationQueue = null;
    logger.info("Queue closed");
  }
}

