/**
 * WebGPU Routes
 * API endpoints for WebGPU status
 *
 * Note: WebGPU operations run in browser, not backend.
 * Backend only provides status information.
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
 * WebGPU operations run in browser, backend only provides status information
 */
router.get("/status", controller.getStatus.bind(controller));

export default router;
