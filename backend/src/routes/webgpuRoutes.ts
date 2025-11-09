/**
 * WebGPU Routes
 * API endpoints for WebGPU optimization
 *
 * @module routes
 * @version 2.0.0 - Refactored to use controller
 */

import { Router, type Router as ExpressRouter } from "express";
import { WebGPUController } from "../controllers/webgpuController";

const router: ExpressRouter = Router();
const controller = new WebGPUController();

/**
 * GET /api/webgpu/status
 * Get WebGPU status and support information
 */
router.get("/status", controller.getStatus.bind(controller));

/**
 * POST /api/webgpu/initialize
 * Initialize WebGPU
 */
router.post("/initialize", controller.initialize.bind(controller));

/**
 * POST /api/webgpu/optimize
 * Run WebGPU optimization
 */
router.post("/optimize", controller.optimize.bind(controller));

/**
 * GET /api/webgpu/info
 * Get WebGPU device information
 */
router.get("/info", controller.getInfo.bind(controller));

/**
 * POST /api/webgpu/cleanup
 * Cleanup WebGPU resources
 */
router.post("/cleanup", controller.cleanup.bind(controller));

export default router;
