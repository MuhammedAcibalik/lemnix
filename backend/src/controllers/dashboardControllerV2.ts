/**
 * Dashboard Controller v2.0
 * HTTP handlers for dashboard endpoints
 *
 * @module controllers
 * @version 2.0.0 - Complete Reboot
 */

import { Request, Response } from "express";
import {
  getHeroMetrics,
  getOptimizationPerformance,
  getActiveOperations,
  getSmartInsights,
  getActivityTimeline,
} from "../services/monitoring/dashboardServiceV2";
import { logger } from "../services/logger";

/**
 * Get dashboard metrics
 */
export async function getDashboardMetrics(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const options = {
      timeRange: (req.query.timeRange as "24h" | "7d" | "30d" | "90d") || "7d",
      includeInactive: req.query.includeInactive === "true",
    };

    const [heroMetrics, performance, activeOps, insights, timeline] =
      await Promise.all([
        getHeroMetrics(options),
        getOptimizationPerformance(options),
        getActiveOperations(),
        getSmartInsights(options),
        getActivityTimeline({ limit: 20 }),
      ]);

    res.json({
      success: true,
      data: {
        heroMetrics,
        optimizationPerformance: performance,
        activeOperations: activeOps,
        smartInsights: insights,
        activityTimeline: timeline,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    // In development or when dashboard tables are not ready, do not surface 500
    // to the frontend. Log the error and return safe fallback metrics instead.
    logger.error("Dashboard metrics error", { error });

    res.json({
      success: true,
      data: {
        heroMetrics: {
          activeOptimizations: 0,
          cuttingListsThisWeek: 0,
          averageEfficiency: 0,
          totalWasteSaved: 0,
          efficiencyTrend: [],
          wasteTrend: [],
        },
        optimizationPerformance: {
          algorithmStats: [],
          efficiencyTimeSeries: [],
          wasteTimeSeries: [],
          costSavings: {
            totalSaved: 0,
            savingsTimeSeries: [],
          },
        },
        activeOperations: {
          activeOperations: [],
          queuedCount: 0,
          processingCount: 0,
          recentCompletions: [],
          failedOperations: [],
        },
        smartInsights: {
          topProfiles: [],
          bestAlgorithm: null,
          peakHours: [],
          suggestions: [],
        },
        activityTimeline: {
          events: [],
          totalCount: 0,
          hasMore: false,
        },
        lastUpdated: new Date().toISOString(),
      },
    });
  }
}

/**
 * Get hero metrics only
 */
export async function getHeroMetricsOnly(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const options = {
      timeRange: (req.query.timeRange as "24h" | "7d" | "30d" | "90d") || "7d",
    };

    const data = await getHeroMetrics(options);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    // In development or when dashboard tables are not ready, do not surface 500
    // to the frontend. Log the error and return safe fallback metrics instead.
    logger.error("Hero metrics error", { error });

    res.json({
      success: true,
      data: {
        activeOptimizations: 0,
        cuttingListsThisWeek: 0,
        averageEfficiency: 0,
        totalWasteSaved: 0,
        efficiencyTrend: [],
        wasteTrend: [],
      },
    });
  }
}

/**
 * Get optimization performance
 */
export async function getOptimizationPerformanceOnly(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const options = {
      timeRange: (req.query.timeRange as "24h" | "7d" | "30d" | "90d") || "7d",
    };

    const data = await getOptimizationPerformance(options);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error("Optimization performance error", { error });

    res.json({
      success: true,
      data: {
        algorithmStats: [],
        efficiencyTimeSeries: [],
        wasteTimeSeries: [],
        costSavings: {
          totalSaved: 0,
          savingsTimeSeries: [],
        },
      },
    });
  }
}

/**
 * Get active operations
 */
export async function getActiveOperationsOnly(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const data = await getActiveOperations();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error("Active operations error", { error });

    res.json({
      success: true,
      data: {
        activeOperations: [],
        queuedCount: 0,
        processingCount: 0,
        recentCompletions: [],
        failedOperations: [],
      },
    });
  }
}

/**
 * Get smart insights
 */
export async function getSmartInsightsOnly(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const options = {
      timeRange: (req.query.timeRange as "24h" | "7d" | "30d" | "90d") || "7d",
    };

    const data = await getSmartInsights(options);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error("Smart insights error", { error });

    res.json({
      success: true,
      data: {
        topProfiles: [],
        bestAlgorithm: null,
        peakHours: [],
        suggestions: [],
      },
    });
  }
}

/**
 * Get activity timeline
 */
export async function getActivityTimelineOnly(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const filter = {
      limit: parseInt(req.query.limit as string) || 20,
      type: (req.query.type as string) || undefined,
    };

    const data = await getActivityTimeline(filter);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    logger.error("Activity timeline error", { error });

    res.json({
      success: true,
      data: {
        events: [],
        totalCount: 0,
        hasMore: false,
      },
    });
  }
}
