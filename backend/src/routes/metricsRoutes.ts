/**
 * @fileoverview Metrics Routes - Performance Monitoring
 * @module MetricsRoutes
 * @version 1.0.0
 *
 * ✅ P3-12: Web Vitals backend reporting
 */

import { Router, Request, Response } from "express";
import type { Router as ExpressRouter } from "express";
import { logger } from "../services/logger";

const router: ExpressRouter = Router();

/**
 * Web Vitals metric interface
 */
interface WebVitalMetric {
  readonly name: string; // LCP, CLS, INP, FCP, TTFB
  readonly value: number;
  readonly rating: "good" | "needs-improvement" | "poor";
  readonly delta: number;
  readonly id: string;
  readonly navigationType: string;
}

/**
 * POST /api/metrics/web-vitals
 * ✅ P3-12: Receive Web Vitals metrics from frontend
 */
router.post("/web-vitals", (req: Request, res: Response): void => {
  try {
    const metric: WebVitalMetric = req.body;

    // Validation - check for required fields
    if (!metric || !metric.name || typeof metric.value !== "number") {
      logger.warn("[WEB-VITALS] Invalid metric data", {
        hasBody: !!req.body,
        hasName: !!metric?.name,
        valueType: typeof metric?.value,
      });
      res.status(400).json({
        success: false,
        error: {
          message: "Invalid metric: name and numeric value required",
          code: "INVALID_METRIC",
        },
      });
      return;
    }

    // Log metric (with safe access for optional fields)
    logger.info("[WEB-VITALS] Metric received", {
      name: metric.name,
      value: metric.value,
      rating: metric.rating || "unknown",
      navigationType: metric.navigationType || "unknown",
      timestamp: new Date().toISOString(),
    });

    // TODO: Store in database (SystemMetrics table)
    // await prisma.systemMetrics.create({
    //   data: {
    //     metricType: 'performance',
    //     metricName: metric.name,
    //     metricValue: metric.value,
    //     metricUnit: metric.name === 'CLS' ? 'score' : 'milliseconds',
    //     metadata: JSON.stringify({
    //       rating: metric.rating,
    //       delta: metric.delta,
    //       navigationType: metric.navigationType,
    //     }),
    //   },
    // });

    res.status(200).json({
      success: true,
      message: "Metric received",
    });
  } catch (error) {
    logger.error("[WEB-VITALS] Error storing metric", { error });
    res.status(500).json({
      success: false,
      error: { message: "Failed to store metric", code: "INTERNAL_ERROR" },
    });
  }
});

/**
 * GET /api/metrics/web-vitals/summary
 * Get aggregated Web Vitals summary
 */
router.get("/web-vitals/summary", (req: Request, res: Response): void => {
  try {
    // TODO: Query SystemMetrics table and aggregate
    // For now, return placeholder
    res.json({
      success: true,
      data: {
        lcp: { p75: 1200, p95: 2400, samples: 0 },
        cls: { p75: 0.05, p95: 0.15, samples: 0 },
        inp: { p75: 150, p95: 300, samples: 0 },
        fcp: { p75: 800, p95: 1500, samples: 0 },
        ttfb: { p75: 200, p95: 500, samples: 0 },
      },
    });
  } catch (error) {
    logger.error("[WEB-VITALS] Error getting summary", { error });
    res.status(500).json({
      success: false,
      error: { message: "Failed to get summary", code: "INTERNAL_ERROR" },
    });
  }
});

export default router;
