/**
 * WebGPU Controller
 * Handles WebGPU status, initialization, and optimization endpoints
 *
 * @module controllers
 * @version 1.0.0
 */

import { Request, Response } from "express";
import { WebGPUOptimizationService } from "../services/optimization/webgpuOptimizationService";
import { logger } from "../services/logger";

/**
 * WebGPU Controller
 * Thin controller for WebGPU operations
 * Delegates to WebGPUOptimizationService
 */
export class WebGPUController {
  private readonly webgpuService: WebGPUOptimizationService;

  constructor() {
    this.webgpuService = WebGPUOptimizationService.getInstance();
  }

  /**
   * GET /api/webgpu/status
   * Get WebGPU status and support information
   */
  public async getStatus(_req: Request, res: Response): Promise<void> {
    try {
      const isAvailable = this.webgpuService.isAvailable();
      const gpuInfo = this.webgpuService.getCurrentGPUInfo();

      res.json({
        success: true,
        data: {
          available: isAvailable,
          gpuInfo,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error("WebGPU status error", {
        error: error instanceof Error ? error.message : "Unknown error",
      });

      res.status(500).json({
        success: false,
        error: {
          code: "WEBGPU_STATUS_ERROR",
          message: "Failed to get WebGPU status",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      });
    }
  }

  /**
   * POST /api/webgpu/initialize
   * Initialize WebGPU
   */
  public async initialize(_req: Request, res: Response): Promise<void> {
    try {
      const initialized = await this.webgpuService.initialize();

      if (initialized) {
        const gpuInfo = this.webgpuService.getCurrentGPUInfo();

        res.json({
          success: true,
          data: {
            initialized: true,
            gpuInfo,
            timestamp: new Date().toISOString(),
          },
        });
      } else {
        res.status(400).json({
          success: false,
          error: {
            code: "WEBGPU_INIT_FAILED",
            message: "Failed to initialize WebGPU",
            details: "WebGPU initialization failed",
          },
        });
      }
    } catch (error) {
      logger.error("WebGPU initialization error", {
        error: error instanceof Error ? error.message : "Unknown error",
      });

      res.status(500).json({
        success: false,
        error: {
          code: "WEBGPU_INIT_ERROR",
          message: "WebGPU initialization error",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      });
    }
  }

  /**
   * POST /api/webgpu/optimize
   * Run WebGPU optimization
   */
  public async optimize(req: Request, res: Response): Promise<void> {
    try {
      const {
        population,
        fitnessWeights,
        generations,
        mutationRate,
        crossoverRate,
      } = req.body as {
        population?: unknown;
        fitnessWeights?: unknown;
        generations?: number;
        mutationRate?: number;
        crossoverRate?: number;
      };

      // Validate input
      if (!Array.isArray(population) || population.length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid population data",
            details: "Population must be a non-empty array",
          },
        });
        return;
      }

      if (!Array.isArray(fitnessWeights) || fitnessWeights.length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid fitness weights",
            details: "Fitness weights must be a non-empty array",
          },
        });
        return;
      }

      const params = {
        population,
        fitnessWeights,
        generations: generations || 100,
        mutationRate: mutationRate || 0.1,
        crossoverRate: crossoverRate || 0.8,
      };

      const result = await this.webgpuService.optimizeGeneticAlgorithm(params);

      if (result.success) {
        res.json({
          success: true,
          data: {
            result,
            timestamp: new Date().toISOString(),
          },
        });
      } else {
        res.status(400).json({
          success: false,
          error: {
            code: "WEBGPU_OPTIMIZATION_FAILED",
            message: "WebGPU optimization failed",
            details: result.error || "Unknown error",
          },
        });
      }
    } catch (error) {
      logger.error("WebGPU optimization error", {
        error: error instanceof Error ? error.message : "Unknown error",
      });

      res.status(500).json({
        success: false,
        error: {
          code: "WEBGPU_OPTIMIZATION_ERROR",
          message: "WebGPU optimization error",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      });
    }
  }

  /**
   * GET /api/webgpu/info
   * Get WebGPU device information
   */
  public async getInfo(_req: Request, res: Response): Promise<void> {
    try {
      const gpuInfo = this.webgpuService.getCurrentGPUInfo();
      const isAvailable = this.webgpuService.isAvailable();

      res.json({
        success: true,
        data: {
          available: isAvailable,
          gpuInfo,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error("WebGPU info error", {
        error: error instanceof Error ? error.message : "Unknown error",
      });

      res.status(500).json({
        success: false,
        error: {
          code: "WEBGPU_INFO_ERROR",
          message: "Failed to get WebGPU info",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      });
    }
  }

  /**
   * POST /api/webgpu/cleanup
   * Cleanup WebGPU resources
   */
  public async cleanup(_req: Request, res: Response): Promise<void> {
    try {
      await this.webgpuService.cleanup();

      res.json({
        success: true,
        data: {
          message: "WebGPU resources cleaned up",
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error("WebGPU cleanup error", {
        error: error instanceof Error ? error.message : "Unknown error",
      });

      res.status(500).json({
        success: false,
        error: {
          code: "WEBGPU_CLEANUP_ERROR",
          message: "WebGPU cleanup error",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      });
    }
  }
}
