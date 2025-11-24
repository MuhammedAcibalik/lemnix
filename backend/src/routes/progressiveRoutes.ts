/**
 * @fileoverview Progressive Routes
 * @module routes/progressiveRoutes
 * @version 1.0.0
 *
 * ⚡🔐 CRITICAL: Real-time progress tracking routes
 * - WebSocket-enabled endpoints
 * - Security maintained throughout
 * - Real-time user feedback
 */

import { Router } from "express";
import {
  ProgressiveController,
  setupProgressiveWebSocket,
} from "../controllers/progressiveController";
import { authenticateToken } from "../middleware/authentication";
import { validateSession } from "../middleware/authentication";
import { logRequestDetails } from "../middleware/requestLogging";
import { Server as SocketIOServer } from "socket.io";

// ============================================================================
// ROUTES
// ============================================================================

export function createProgressiveRoutes(io: SocketIOServer): Router {
  const router = Router();
  const progressiveController = new ProgressiveController(io);

  // Setup WebSocket handlers
  setupProgressiveWebSocket(io);

  /**
   * @route POST /api/production-plan/upload-progressive
   * @desc Upload production plan with real-time progress
   * @access Private (requires authentication)
   */
  router.post(
    "/upload-progressive",
    authenticateToken,
    validateSession,
    logRequestDetails,
    (req, res) =>
      progressiveController.uploadProductionPlanProgressive(req, res),
  );

  /**
   * @route GET /api/production-plan/progressive
   * @desc Get production plans with real-time progress
   * @access Private (requires authentication)
   */
  router.get(
    "/progressive",
    authenticateToken,
    validateSession,
    logRequestDetails,
    (req, res) => progressiveController.getProductionPlansProgressive(req, res),
  );

  /**
   * @route GET /api/production-plan/progress/:sessionId
   * @desc Get current progress for a session
   * @access Private (requires authentication)
   */
  router.get(
    "/progress/:sessionId",
    authenticateToken,
    validateSession,
    logRequestDetails,
    (req, res) => progressiveController.getProgress(req, res),
  );

  return router;
}
