/**
 * @fileoverview Statistics Routes - Analytics API Endpoints
 * @module StatisticsRoutes
 * @version 1.0.0 - Enterprise Analytics Engine
 */

import { Router, type Router as ExpressRouter } from "express";
import { statisticsController } from "../controllers/statisticsController";
import {
  verifyToken,
  requirePermission,
  Permission,
} from "../middleware/authorization";
import { handleValidationErrors } from "../middleware/validation";
import { createRateLimit } from "../middleware/rateLimiting";
import { logger } from "../services/logger";

// ============================================================================
// ROUTER CONFIGURATION
// ============================================================================

const router: ExpressRouter = Router();

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Apply rate limiting to all statistics routes
router.use(createRateLimit("default"));

// Apply authentication to all routes (except public endpoints)
// Public endpoints: /health, /metrics (rate-limited only)
// All other endpoints require authentication

// ============================================================================
// OVERVIEW ENDPOINTS
// ============================================================================

/**
 * ✅ P2-8: GET /api/statistics/batch
 * Get multiple statistics in one request
 * Query params: types (comma-separated: overview,performance,usage,optimization,health)
 * Auth: Requires authentication (all authenticated users)
 */
router.get("/batch", verifyToken, statisticsController.getBatchStatistics);

/**
 * GET /api/statistics/overview
 * Get comprehensive statistics overview
 * Auth: Requires authentication (all authenticated users)
 */
router.get("/overview", verifyToken, statisticsController.getOverview);

/**
 * GET /api/statistics/performance
 * Get performance metrics
 * Auth: Requires authentication (all authenticated users)
 */
router.get(
  "/performance",
  verifyToken,
  statisticsController.getPerformanceMetrics,
);

// ============================================================================
// USAGE ANALYTICS ENDPOINTS
// ============================================================================

/**
 * GET /api/statistics/usage
 * Get usage analytics
 * Query params: days (default: 30)
 * Auth: Requires authentication (all authenticated users)
 */
router.get(
  "/usage",
  verifyToken,
  handleValidationErrors,
  statisticsController.getUsageAnalytics,
);

/**
 * GET /api/statistics/profiles/usage
 * Get profile usage statistics
 * Query params: limit (default: 50)
 * Auth: Requires VIEW_METRICS permission (Viewer+)
 */
router.get(
  "/profiles/usage",
  verifyToken,
  requirePermission(Permission.VIEW_METRICS),
  handleValidationErrors,
  statisticsController.getProfileUsageStats,
);

/**
 * GET /api/statistics/cutting-lists/trends
 * Get cutting list trends over time
 * Query params: days (default: 30)
 * Auth: Requires VIEW_METRICS permission (Viewer+)
 */
router.get(
  "/cutting-lists/trends",
  verifyToken,
  requirePermission(Permission.VIEW_METRICS),
  handleValidationErrors,
  statisticsController.getCuttingListTrends,
);

// ============================================================================
// OPTIMIZATION ANALYTICS ENDPOINTS
// ============================================================================

/**
 * GET /api/statistics/optimization
 * Get optimization analytics
 * Auth: Requires VIEW_METRICS permission (Viewer+)
 */
router.get(
  "/optimization",
  verifyToken,
  requirePermission(Permission.VIEW_METRICS),
  statisticsController.getOptimizationAnalytics,
);

/**
 * GET /api/statistics/optimization/algorithms
 * Get algorithm performance metrics
 * Auth: Requires VIEW_METRICS permission (Viewer+)
 */
router.get(
  "/optimization/algorithms",
  verifyToken,
  requirePermission(Permission.VIEW_METRICS),
  statisticsController.getAlgorithmPerformance,
);

/**
 * GET /api/statistics/optimization/waste-reduction
 * Get waste reduction trends
 * Auth: Requires VIEW_METRICS permission (Viewer+)
 */
router.get(
  "/optimization/waste-reduction",
  verifyToken,
  requirePermission(Permission.VIEW_METRICS),
  statisticsController.getWasteReductionTrends,
);

// ============================================================================
// SYSTEM HEALTH ENDPOINTS
// ============================================================================

/**
 * GET /api/statistics/health
 * Get system health metrics
 * Auth: Public endpoint (rate-limited only)
 */
router.get("/health", statisticsController.getSystemHealth);

/**
 * GET /api/statistics/metrics
 * Get system metrics (for monitoring tools)
 * Auth: Public endpoint (rate-limited only)
 */
router.get("/metrics", statisticsController.getSystemHealth);

// ============================================================================
// DATA COLLECTION ENDPOINTS
// ============================================================================

/**
 * POST /api/statistics/cutting-lists/:cuttingListId/update
 * Update cutting list statistics
 * Auth: Requires MANAGE_CONFIG permission (Admin only)
 */
router.post(
  "/cutting-lists/:cuttingListId/update",
  verifyToken,
  requirePermission(Permission.MANAGE_CONFIG),
  handleValidationErrors,
  statisticsController.updateCuttingListStats,
);

/**
 * POST /api/statistics/activities
 * Record user activity
 * Auth: Requires MANAGE_CONFIG permission (Admin only)
 */
router.post(
  "/activities",
  verifyToken,
  requirePermission(Permission.MANAGE_CONFIG),
  handleValidationErrors,
  statisticsController.recordUserActivity,
);

/**
 * POST /api/statistics/metrics
 * Record system metric
 * Auth: Requires MANAGE_CONFIG permission (Admin only)
 */
router.post(
  "/metrics",
  verifyToken,
  requirePermission(Permission.MANAGE_CONFIG),
  handleValidationErrors,
  statisticsController.recordSystemMetric,
);

/**
 * GET /api/statistics/profile-analysis
 * Auth: Requires VIEW_METRICS permission (Viewer+)
 */
router.get(
  "/profile-analysis",
  verifyToken,
  requirePermission(Permission.VIEW_METRICS),
  statisticsController.getProfileAnalysis,
);

/**
 * GET /api/statistics/product-categories
 * Auth: Requires VIEW_METRICS permission (Viewer+)
 */
router.get(
  "/product-categories",
  verifyToken,
  requirePermission(Permission.VIEW_METRICS),
  statisticsController.getProductCategoriesAnalysis,
);

/**
 * GET /api/statistics/color-size
 * Auth: Requires VIEW_METRICS permission (Viewer+)
 */
router.get(
  "/color-size",
  verifyToken,
  requirePermission(Permission.VIEW_METRICS),
  statisticsController.getColorSizeAnalysis,
);

/**
 * GET /api/statistics/work-order-analysis
 * Auth: Requires VIEW_METRICS permission (Viewer+)
 */
router.get(
  "/work-order-analysis",
  verifyToken,
  requirePermission(Permission.VIEW_METRICS),
  statisticsController.getWorkOrderAnalysis,
);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// Handle 404 for statistics routes
router.use("*", (req, res) => {
  logger.warn(`Statistics route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: "Statistics endpoint not found",
    message: `The requested statistics endpoint '${req.method} ${req.originalUrl}' does not exist`,
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// ROUTE INFORMATION
// ============================================================================

logger.info("Statistics routes initialized with the following endpoints:");
logger.info(
  "  GET  /api/statistics/overview - Get comprehensive statistics overview",
);
logger.info("  GET  /api/statistics/performance - Get performance metrics");
logger.info("  GET  /api/statistics/usage - Get usage analytics");
logger.info(
  "  GET  /api/statistics/profiles/usage - Get profile usage statistics",
);
logger.info(
  "  GET  /api/statistics/cutting-lists/trends - Get cutting list trends",
);
logger.info("  GET  /api/statistics/optimization - Get optimization analytics");
logger.info(
  "  GET  /api/statistics/optimization/algorithms - Get algorithm performance",
);
logger.info(
  "  GET  /api/statistics/optimization/waste-reduction - Get waste reduction trends",
);
logger.info("  GET  /api/statistics/health - Get system health metrics");
logger.info("  GET  /api/statistics/metrics - Get system metrics");
logger.info(
  "  POST /api/statistics/cutting-lists/:id/update - Update cutting list statistics",
);
logger.info("  POST /api/statistics/activities - Record user activity");
logger.info("  POST /api/statistics/metrics - Record system metric");

export default router;
