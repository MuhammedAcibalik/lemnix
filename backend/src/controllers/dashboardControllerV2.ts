/**
 * Dashboard Controller v2.0
 * HTTP handlers for dashboard endpoints
 * 
 * @module controllers
 * @version 2.0.0 - Complete Reboot
 */

import { Request, Response } from 'express';
import { 
  getHeroMetrics,
  getOptimizationPerformance,
  getActiveOperations,
  getSmartInsights,
  getActivityTimeline
} from '../services/monitoring/dashboardServiceV2';
import { logger } from '../services/logger';

/**
 * Get dashboard metrics
 */
export async function getDashboardMetrics(req: Request, res: Response): Promise<void> {
  try {
    const options = {
      timeRange: req.query.timeRange as '24h' | '7d' | '30d' | '90d' || '7d',
      includeInactive: req.query.includeInactive === 'true'
    };
    
    const [heroMetrics, performance, activeOps, insights, timeline] = await Promise.all([
      getHeroMetrics(options),
      getOptimizationPerformance(options),
      getActiveOperations(),
      getSmartInsights(options),
      getActivityTimeline({ limit: 20 })
    ]);
    
    res.json({
      success: true,
      data: {
        heroMetrics,
        optimizationPerformance: performance,
        activeOperations: activeOps,
        smartInsights: insights,
        activityTimeline: timeline,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Dashboard metrics error', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DASHBOARD_METRICS_ERROR',
        message: 'Failed to fetch dashboard metrics'
      }
    });
  }
}

/**
 * Get hero metrics only
 */
export async function getHeroMetricsOnly(req: Request, res: Response): Promise<void> {
  try {
    const options = {
      timeRange: req.query.timeRange as '24h' | '7d' | '30d' | '90d' || '7d'
    };
    
    const data = await getHeroMetrics(options);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    logger.error('Hero metrics error', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'HERO_METRICS_ERROR',
        message: 'Failed to fetch hero metrics'
      }
    });
  }
}

/**
 * Get optimization performance
 */
export async function getOptimizationPerformanceOnly(req: Request, res: Response): Promise<void> {
  try {
    const options = {
      timeRange: req.query.timeRange as '24h' | '7d' | '30d' | '90d' || '7d'
    };
    
    const data = await getOptimizationPerformance(options);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    logger.error('Optimization performance error', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'OPTIMIZATION_PERFORMANCE_ERROR',
        message: 'Failed to fetch optimization performance'
      }
    });
  }
}

/**
 * Get active operations
 */
export async function getActiveOperationsOnly(req: Request, res: Response): Promise<void> {
  try {
    const data = await getActiveOperations();
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    logger.error('Active operations error', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ACTIVE_OPERATIONS_ERROR',
        message: 'Failed to fetch active operations'
      }
    });
  }
}

/**
 * Get smart insights
 */
export async function getSmartInsightsOnly(req: Request, res: Response): Promise<void> {
  try {
    const options = {
      timeRange: req.query.timeRange as '24h' | '7d' | '30d' | '90d' || '7d'
    };
    
    const data = await getSmartInsights(options);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    logger.error('Smart insights error', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SMART_INSIGHTS_ERROR',
        message: 'Failed to fetch smart insights'
      }
    });
  }
}

/**
 * Get activity timeline
 */
export async function getActivityTimelineOnly(req: Request, res: Response): Promise<void> {
  try {
    const filter = {
      limit: parseInt(req.query.limit as string) || 20,
      type: req.query.type as string || undefined
    };
    
    const data = await getActivityTimeline(filter);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    logger.error('Activity timeline error', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ACTIVITY_TIMELINE_ERROR',
        message: 'Failed to fetch activity timeline'
      }
    });
  }
}

