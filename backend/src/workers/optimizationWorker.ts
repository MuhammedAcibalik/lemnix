/**
 * Optimization Worker
 * Worker Threads-based optimization job processor
 *
 * @module workers/optimizationWorker
 * @version 1.0.0
 */

import { Worker, Job } from "bullmq";
import { getWorkerOptions } from "../config/queue";
import { logger } from "../services/logger";
import { AdvancedOptimizationService } from "../services/optimization/AdvancedOptimizationService";
import type {
  AdvancedOptimizationParams,
  AdvancedOptimizationResult,
} from "../services/optimization/types";
import type { OptimizationItem, MaterialStockLength } from "../../types";
import type { AlgorithmMode } from "../services/optimization/AlgorithmModeSelector";

/**
 * Optimization job data
 */
export interface OptimizationJobData {
  items: OptimizationItem[];
  params: AdvancedOptimizationParams;
  mode?: AlgorithmMode;
  materialStockLengths?: MaterialStockLength[];
  profileParams?: {
    workOrderId?: string;
    profileType?: string;
    weekNumber?: number;
    year?: number;
  };
  userId: string;
  requestId: string;
}

/**
 * Optimization job result
 */
export interface OptimizationJobResult {
  result: AdvancedOptimizationResult;
  requestId: string;
}

/**
 * Create optimization worker
 */
export function createOptimizationWorker(): Worker<
  OptimizationJobData,
  OptimizationJobResult
> {
  const worker = new Worker<OptimizationJobData, OptimizationJobResult>(
    "optimization",
    async (job: Job<OptimizationJobData>) => {
      const {
        items,
        params,
        mode = "standard",
        materialStockLengths,
        profileParams,
        userId,
        requestId,
      } = job.data;

      logger.info("Processing optimization job", {
        jobId: job.id,
        requestId,
        userId,
        itemsCount: items.length,
        mode,
      });

      try {
        // Create optimization service instance
        const optimizationService = new AdvancedOptimizationService(logger);

        // Run optimization with mode
        const result = await optimizationService.optimizeWithMode(
          items,
          params,
          mode,
          materialStockLengths,
          profileParams,
        );

        logger.info("Optimization job completed", {
          jobId: job.id,
          requestId,
          userId,
          executionTime: result.performance?.executionTime,
        });

        return {
          result,
          requestId,
        };
      } catch (error) {
        logger.error("Optimization job failed", {
          jobId: job.id,
          requestId,
          userId,
          error: (error as Error).message,
        });
        throw error;
      }
    },
    getWorkerOptions(),
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

  return worker;
}

