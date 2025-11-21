/**
 * WebGPU Controller
 * Handles WebGPU status endpoint
 *
 * Note: WebGPU operations run in browser, not backend.
 * Backend only provides status information.
 *
 * @module controllers
 * @version 1.0.0
 */

import { Request, Response } from "express";
import { WebGPUOptimizationService } from "../services/optimization/webgpuOptimizationService";
import { logger } from "../services/logger";

/**
 * WebGPU Controller
 * Thin controller for WebGPU status
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
   * WebGPU operations run in browser, backend only provides status information
   */
  public async getStatus(_req: Request, res: Response): Promise<void> {
    try {
      // Safely check WebGPU availability
      let isAvailable = false;
      let gpuInfo = null;

      try {
        isAvailable = this.webgpuService.isAvailable();
        gpuInfo = this.webgpuService.getCurrentGPUInfo();
      } catch (serviceError) {
        logger.warn("WebGPU service check failed", {
          error:
            serviceError instanceof Error
              ? serviceError.message
              : "Unknown error",
        });
        // Continue with default values (WebGPU not available)
      }

      res.json({
        success: true,
        data: {
          available: isAvailable,
          gpuInfo: gpuInfo || {
            name: "Not Available",
            type: "unknown",
            memory: 0,
            driver: "N/A",
            version: "N/A",
          },
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
}
