/**
 * Dashboard Routes
 * HTTP routes for dashboard endpoints
 *
 * @module routes
 * @version 2.0.0
 */

import { Router } from "express";
import {
  getDashboardMetrics,
  getHeroMetricsOnly,
  getOptimizationPerformanceOnly,
  getActiveOperationsOnly,
  getSmartInsightsOnly,
  getActivityTimelineOnly,
} from "../controllers/dashboardController";
import { createRateLimit } from "../middleware/rateLimiting";

const router: Router = Router();
const dashboardRateLimit = createRateLimit("default");

/**
 * Routes
 */

// Get complete dashboard data
router.get("/metrics", dashboardRateLimit, getDashboardMetrics);

// Get individual sections (for performance)
router.get("/hero-metrics", dashboardRateLimit, getHeroMetricsOnly);
router.get(
  "/optimization-performance",
  dashboardRateLimit,
  getOptimizationPerformanceOnly,
);
router.get("/active-operations", dashboardRateLimit, getActiveOperationsOnly);
router.get("/insights", dashboardRateLimit, getSmartInsightsOnly);
router.get("/activity-timeline", dashboardRateLimit, getActivityTimelineOnly);

export default router;
