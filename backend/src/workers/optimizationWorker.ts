/**
 * Optimization Worker
 * BullMQ worker with sandboxed processor to prevent event loop blocking
 *
 * @module workers/optimizationWorker
 * @version 2.0.0 - Sandboxed Processor
 */

import { Worker } from "bullmq";
import { getWorkerOptions } from "../config/queue";
import { logger } from "../services/logger";
import type {
  OptimizationJobData,
  OptimizationJobResult,
} from "./processors/optimizationProcessor";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

/**
 * Create optimization worker with sandboxed processor
 * 
 * Uses BullMQ's sandboxed processor feature to run CPU-intensive
 * optimization tasks in a separate process, preventing event loop blocking.
 */
export function createOptimizationWorker(): Worker<
  OptimizationJobData,
  OptimizationJobResult
> {
  // Get processor file path for sandboxed execution
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const processorPath = join(__dirname, "processors", "optimizationProcessor.js");

  const workerOptions = getWorkerOptions();

  // Create worker with sandboxed processor
  // BullMQ will execute the processor file in a separate process
  const worker = new Worker<OptimizationJobData, OptimizationJobResult>(
    "optimization",
    processorPath, // File path instead of inline function
    workerOptions,
  );

  worker.on("completed", (job) => {
    logger.info("Job completed", {
      jobId: job.id,
      requestId: job.data.requestId,
    });
  });

  worker.on("failed", (job, error) => {
    logger.error("Job failed", {
      jobId: job?.id,
      requestId: job?.data.requestId,
      error: (error as Error).message,
    });
  });

  worker.on("error", (error) => {
    logger.error("Worker error", {
      error: (error as Error).message,
    });
  });

  worker.on("stalled", (jobId) => {
    logger.warn("Job stalled", { jobId });
  });

  return worker;
}

