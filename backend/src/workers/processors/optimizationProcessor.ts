/**
 * Optimization Processor
 * Sandboxed processor for BullMQ worker
 * 
 * This file is executed in a separate process to prevent event loop blocking
 * 
 * @module workers/processors/optimizationProcessor
 * @version 1.0.0
 */

import { Job } from "bullmq";
import { AdvancedOptimizationService } from "../../services/optimization/AdvancedOptimizationService";
import { logger } from "../../services/logger";
import type {
  AdvancedOptimizationParams,
  AdvancedOptimizationResult,
} from "../../services/optimization/types";
import type { OptimizationItem, MaterialStockLength } from "../../../types";
import type { AlgorithmMode } from "../../services/optimization/AlgorithmModeSelector";

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
 * Process optimization job
 * This function runs in a sandboxed process to prevent event loop blocking
 * 
 * @param job - BullMQ job instance
 * @returns Optimization result
 */
export default async function processOptimizationJob(
  job: Job<OptimizationJobData>,
): Promise<OptimizationJobResult> {
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
}

