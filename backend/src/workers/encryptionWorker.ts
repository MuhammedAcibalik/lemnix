/**
 * Encryption Worker
 * BullMQ worker with sandboxed processor to prevent event loop blocking
 *
 * @module workers/encryptionWorker
 * @version 1.0.0
 */

import { Worker } from "bullmq";
import { getWorkerOptions } from "../config/queue";
import { logger } from "../services/logger";
import type {
  EncryptionJobData,
  EncryptionJobResult,
} from "./processors/encryptionProcessor";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const ENCRYPTION_QUEUE_NAME = "encryption";

/**
 * Create encryption worker with sandboxed processor
 *
 * Uses BullMQ's sandboxed processor feature to run CPU-intensive
 * encryption tasks in a separate process, preventing event loop blocking.
 */
export function createEncryptionWorker(): Worker<
  EncryptionJobData,
  EncryptionJobResult
> {
  // Get processor file path for sandboxed execution
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const processorPath = join(
    __dirname,
    "processors",
    "encryptionProcessor.js",
  );

  const workerOptions = getWorkerOptions();

  // Create worker with sandboxed processor
  // BullMQ will execute the processor file in a separate process
  const worker = new Worker<EncryptionJobData, EncryptionJobResult>(
    ENCRYPTION_QUEUE_NAME,
    processorPath, // File path instead of inline function
    workerOptions,
  );

  worker.on("completed", (job) => {
    logger.info("Encryption job completed", {
      jobId: job.id,
      requestId: job.data.requestId,
    });
  });

  worker.on("failed", (job, error) => {
    logger.error("Encryption job failed", {
      jobId: job?.id,
      requestId: job?.data.requestId,
      error: (error as Error).message,
    });
  });

  worker.on("error", (error) => {
    logger.error("Encryption worker error", {
      error: (error as Error).message,
    });
  });

  worker.on("stalled", (jobId) => {
    logger.warn("Encryption job stalled", { jobId });
  });

  logger.info("Encryption worker initialized", {
    queueName: ENCRYPTION_QUEUE_NAME,
  });

  return worker;
}

