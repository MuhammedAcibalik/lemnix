/**
 * @fileoverview Dashboard Routes - Real Data API Endpoints
 * @module DashboardRoutes
 * @version 1.0.0 - Real Database Integration
 */

import { Router, type Router as ExpressRouter } from "express";
import { dashboardController } from "../controllers/dashboardController";
import { verifyToken } from "../middleware/authorization";
import { createRateLimit } from "../middleware/rateLimiting";
import { logger } from "../services/logger";

// ============================================================================
// ROUTER CONFIGURATION
// ============================================================================

const router: ExpressRouter = Router();

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Apply rate limiting to all dashboard routes
router.use(createRateLimit("default"));

// Apply authentication to all routes
router.use(verifyToken);

// ============================================================================
// DASHBOARD ENDPOINTS
// ============================================================================

/**
 * GET /api/dashboard/data
 * Get comprehensive dashboard data (all metrics in one call)
 * Auth: Requires authentication (all authenticated users)
 */
router.get("/data", dashboardController.getDashboardData);

/**
 * GET /api/dashboard/metrics
 * Get dashboard metrics only (for polling)
 * Auth: Requires authentication (all authenticated users)
 */
router.get("/metrics", dashboardController.getMetrics);

/**
 * GET /api/dashboard/algorithm-performance
 * Get algorithm performance data
 * Auth: Requires authentication (all authenticated users)
 */
router.get(
  "/algorithm-performance",
  dashboardController.getAlgorithmPerformance,
);

/**
 * GET /api/dashboard/waste-trend
 * Get waste reduction trend
 * Query params: days (default: 30)
 * Auth: Requires authentication (all authenticated users)
 */
router.get("/waste-trend", dashboardController.getWasteTrend);

/**
 * GET /api/dashboard/activities
 * Get recent activities
 * Query params: limit (default: 10)
 * Auth: Requires authentication (all authenticated users)
 */
router.get("/activities", dashboardController.getActivities);

/**
 * GET /api/dashboard/profile-usage
 * Get profile usage statistics
 * Query params: limit (default: 10)
 * Auth: Requires authentication (all authenticated users)
 */
router.get("/profile-usage", dashboardController.getProfileUsage);

/**
 * GET /api/dashboard/health
 * Get system health metrics
 * Auth: Requires authentication (all authenticated users)
 */
router.get("/health", dashboardController.getHealth);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// Handle 404 for dashboard routes
router.use("*", (req, res) => {
  logger.warn(`Dashboard route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: "Dashboard endpoint not found",
    message: `The requested dashboard endpoint '${req.method} ${req.originalUrl}' does not exist`,
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// ROUTE INFORMATION
// ============================================================================

logger.info("Dashboard routes initialized with the following endpoints:");
logger.info("  GET  /api/dashboard/data - Get comprehensive dashboard data");
logger.info("  GET  /api/dashboard/metrics - Get dashboard metrics");
logger.info(
  "  GET  /api/dashboard/algorithm-performance - Get algorithm performance",
);
logger.info("  GET  /api/dashboard/waste-trend - Get waste reduction trend");
logger.info("  GET  /api/dashboard/activities - Get recent activities");
logger.info(
  "  GET  /api/dashboard/profile-usage - Get profile usage statistics",
);
logger.info("  GET  /api/dashboard/health - Get system health");

export default router;
