/**
 * @fileoverview Enterprise-Grade Optimization Routes
 * @module EnterpriseOptimizationRoutes
 * @version 4.0.0 - Enterprise Production API Routes
 * 
 * Bu modül, enterprise seviyede optimizasyon API route'larını tanımlar.
 * Advanced algorithms, performance optimization, monitoring ve comprehensive error handling içerir.
 * 
 * Features:
 * - Advanced Mathematical Algorithms
 * - Performance Optimization
 * - Real-time Monitoring
 * - Health Checks
 * - Metrics Collection
 * - Algorithm Comparison
 * - SLA Compliance
 * - Export/Import Functionality
 * - Audit Trail
 * - Performance Analytics
 * - System Health Monitoring
 * 
 * Version: 4.0.0
 * Last Updated: 2025
 */

import { Router, Request, Response, NextFunction } from 'express';
import { EnterpriseOptimizationController } from '../controllers/enterpriseOptimizationController';

const router = Router();
const enterpriseOptimizationController = new EnterpriseOptimizationController();

// ============================================================================
// ENTERPRISE OPTIMIZATION ROUTES
// ============================================================================

/**
 * @route POST /api/enterprise/optimize
 * @desc Advanced enterprise optimization with multiple algorithms
 * @access Public
 * @body {
 *   items: OptimizationItem[],
 *   algorithm: 'linear-programming' | 'integer-programming' | 'genetic-advanced' | 'neural-network' | 'hybrid',
 *   objectives: OptimizationObjective[],
 *   constraints: AdvancedConstraints,
 *   performance: PerformanceSettings,
 *   costModel: CostModel,
 *   materialStockLengths?: MaterialStockLength[]
 * }
 */
router.post('/optimize', enterpriseOptimizationController.optimize);

/**
 * @route POST /api/enterprise/optimize-by-profile
 * @desc Profile type based optimization
 * @access Public
 * @body {
 *   items: OptimizationItem[]
 * }
 * @response {
 *   success: boolean,
 *   data: {
 *     optimizationResult: OptimizationResult,
 *     performanceMetrics: PerformanceMetrics,
 *     costAnalysis: CostAnalysis,
 *     recommendations: Recommendation[],
 *     confidence: number,
 *     profileGroups: ProfileGroup[]
 *   },
 *   metadata: { requestId: string, timestamp: string, version: string, algorithm: string }
 * }
 */
router.post('/optimize-by-profile', enterpriseOptimizationController.optimizeByProfileType);

/**
 * @route GET /api/enterprise/health
 * @desc System health check endpoint
 * @access Public
 * @response {
 *   success: boolean,
 *   data: HealthCheckResult,
 *   metadata: { timestamp: string, version: string }
 * }
 */
router.get('/health', enterpriseOptimizationController.healthCheck);

/**
 * @route GET /api/enterprise/metrics
 * @desc Get system and optimization metrics
 * @access Public
 * @query { limit?: number }
 * @response {
 *   success: boolean,
 *   data: {
 *     systemMetrics: SystemMetrics[],
 *     optimizationMetrics: OptimizationMetrics[],
 *     activeAlerts: Alert[],
 *     slaResults: SLAResult[]
 *   },
 *   metadata: { timestamp: string, version: string }
 * }
 */
router.get('/metrics', enterpriseOptimizationController.getMetrics);

/**
 * @route GET /api/enterprise/performance
 * @desc Performance analysis endpoint
 * @access Public
 * @query { algorithm?: string, itemCount?: number, timeRange?: string }
 * @response {
 *   success: boolean,
 *   data: {
 *     statistics: PerformanceStats,
 *     metrics: OptimizationMetrics[]
 *   },
 *   metadata: { timestamp: string, version: string }
 * }
 */
router.get('/performance', enterpriseOptimizationController.analyzePerformance);

/**
 * @route POST /api/enterprise/compare
 * @desc Compare multiple optimization algorithms
 * @access Public
 * @body {
 *   items: OptimizationItem[],
 *   algorithms?: string[]
 * }
 * @response {
 *   success: boolean,
 *   data: {
 *     comparison: AlgorithmComparison[],
 *     bestAlgorithm: string,
 *     summary: ComparisonSummary
 *   },
 *   metadata: { timestamp: string, version: string }
 * }
 */
router.post('/compare', enterpriseOptimizationController.compareAlgorithms);

// ============================================================================
// ENTERPRISE EXPORT & ANALYTICS ROUTES
// ============================================================================

/**
 * @route POST /api/enterprise/export
 * @desc Export optimization results in various formats
 * @access Public
 * @body {
 *   resultId: string,
 *   format: 'pdf' | 'excel' | 'json' | 'csv',
 *   includeCharts: boolean,
 *   includeDetails: boolean,
 *   language: 'tr' | 'en'
 * }
 * @response {
 *   success: boolean,
 *   data: {
 *     downloadUrl: string,
 *     format: string,
 *     size: number,
 *     expiresAt: string
 *   },
 *   timestamp: string
 * }
 */
router.post('/export', enterpriseOptimizationController.exportResults);

/**
 * @route GET /api/enterprise/analytics
 * @desc Get performance analytics
 * @access Public
 * @query { timeRange?: string, metrics?: string[], algorithm?: string }
 * @response {
 *   success: boolean,
 *   data: AnalyticsData,
 *   timestamp: string
 * }
 */
router.get('/analytics', enterpriseOptimizationController.getAnalytics);

/**
 * @route GET /api/enterprise/audit
 * @desc Get audit trail
 * @access Public
 * @query { userId?: string, action?: string, startDate?: string, endDate?: string, limit?: number }
 * @response {
 *   success: boolean,
 *   data: {
 *     logs: AuditLogEntry[],
 *     total: number,
 *     hasMore: boolean
 *   },
 *   timestamp: string
 * }
 */
router.get('/audit', enterpriseOptimizationController.getAuditTrail);

/**
 * @route GET /api/enterprise/system-health
 * @desc Get system health status
 * @access Public
 * @response {
 *   success: boolean,
 *   data: SystemHealthData,
 *   timestamp: string
 * }
 */
router.get('/system-health', enterpriseOptimizationController.getSystemHealth);

/**
 * @route GET /api/enterprise/history
 * @desc Get optimization history
 * @access Public
 * @query { userId?: string, algorithm?: string, startDate?: string, endDate?: string, limit?: number }
 * @response {
 *   success: boolean,
 *   data: {
 *     optimizations: OptimizationHistory[],
 *     total: number,
 *     hasMore: boolean
 *   },
 *   timestamp: string
 * }
 */
router.get('/history', enterpriseOptimizationController.getOptimizationHistory);

// ============================================================================
// ADVANCED ALGORITHM SPECIFIC ROUTES
// ============================================================================

/**
 * @route POST /api/enterprise/linear-programming
 * @desc Linear Programming optimization
 * @access Public
 * @body {
 *   items: OptimizationItem[],
 *   objectives: OptimizationObjective[],
 *   constraints: AdvancedConstraints,
 *   materialStockLengths?: MaterialStockLength[]
 * }
 */
router.post('/linear-programming', async (req, res) => {
  // Create new request object with algorithm set
  const modifiedReq = Object.assign(req, {
    body: {
      ...req.body,
      algorithm: 'linear-programming'
    }
  });
  return enterpriseOptimizationController.optimize(modifiedReq, res);
});

/**
 * @route POST /api/enterprise/integer-programming
 * @desc Integer Programming optimization
 * @access Public
 * @body {
 *   items: OptimizationItem[],
 *   objectives: OptimizationObjective[],
 *   constraints: AdvancedConstraints,
 *   materialStockLengths?: MaterialStockLength[]
 * }
 */
router.post('/integer-programming', async (req, res) => {
  // Create new request object with algorithm set
  const modifiedReq = Object.assign(req, {
    body: {
      ...req.body,
      algorithm: 'integer-programming'
    }
  });
  return enterpriseOptimizationController.optimize(modifiedReq, res);
});

/**
 * @route POST /api/enterprise/genetic-advanced
 * @desc Advanced Genetic Algorithm optimization
 * @access Public
 * @body {
 *   items: OptimizationItem[],
 *   objectives: OptimizationObjective[],
 *   constraints: AdvancedConstraints,
 *   materialStockLengths?: MaterialStockLength[]
 * }
 */
router.post('/genetic-advanced', async (req, res) => {
  // Create new request object with algorithm set
  const modifiedReq = Object.assign(req, {
    body: {
      ...req.body,
      algorithm: 'genetic-advanced'
    }
  });
  return enterpriseOptimizationController.optimize(modifiedReq, res);
});

/**
 * @route POST /api/enterprise/neural-network
 * @desc Neural Network optimization
 * @access Public
 * @body {
 *   items: OptimizationItem[],
 *   objectives: OptimizationObjective[],
 *   constraints: AdvancedConstraints,
 *   materialStockLengths?: MaterialStockLength[]
 * }
 */
router.post('/neural-network', async (req, res) => {
  // Create new request object with algorithm set
  const modifiedReq = Object.assign(req, {
    body: {
      ...req.body,
      algorithm: 'neural-network'
    }
  });
  return enterpriseOptimizationController.optimize(modifiedReq, res);
});

/**
 * @route POST /api/enterprise/hybrid
 * @desc Hybrid optimization (combines multiple algorithms)
 * @access Public
 * @body {
 *   items: OptimizationItem[],
 *   objectives: OptimizationObjective[],
 *   constraints: AdvancedConstraints,
 *   materialStockLengths?: MaterialStockLength[]
 * }
 */
router.post('/hybrid', async (req, res) => {
  // Create new request object with algorithm set
  const modifiedReq = Object.assign(req, {
    body: {
      ...req.body,
      algorithm: 'hybrid'
    }
  });
  return enterpriseOptimizationController.optimize(modifiedReq, res);
});

// ============================================================================
// MONITORING & ANALYTICS ROUTES
// ============================================================================

/**
 * @route GET /api/enterprise/alerts
 * @desc Get active alerts
 * @access Public
 * @response {
 *   success: boolean,
 *   data: Alert[],
 *   metadata: { timestamp: string, version: string }
 * }
 */
router.get('/alerts', async (_req, res) => {
  try {
    const activeAlerts = enterpriseOptimizationController['monitoringService'].getActiveAlerts();
    
    res.status(200).json({
      success: true,
      data: activeAlerts,
      metadata: {
        timestamp: new Date().toISOString(),
        version: '3.0.0'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'ALERTS_ERROR',
        message: 'Failed to retrieve alerts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      metadata: {
        timestamp: new Date().toISOString(),
        version: '3.0.0'
      }
    });
  }
});

/**
 * @route POST /api/enterprise/alerts/:alertId/resolve
 * @desc Resolve an alert
 * @access Public
 * @param { string } alertId - Alert ID
 * @response {
 *   success: boolean,
 *   data: { resolved: boolean },
 *   metadata: { timestamp: string, version: string }
 * }
 */
router.post('/alerts/:alertId/resolve', async (req, res) => {
  try {
    const { alertId } = req.params;
    const resolved = enterpriseOptimizationController['monitoringService'].resolveAlert(alertId);
    
    res.status(200).json({
      success: true,
      data: { resolved },
      metadata: {
        timestamp: new Date().toISOString(),
        version: '3.0.0'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'ALERT_RESOLVE_ERROR',
        message: 'Failed to resolve alert',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      metadata: {
        timestamp: new Date().toISOString(),
        version: '3.0.0'
      }
    });
  }
});

/**
 * @route GET /api/enterprise/sla
 * @desc Get SLA results
 * @access Public
 * @response {
 *   success: boolean,
 *   data: SLAResult[],
 *   metadata: { timestamp: string, version: string }
 * }
 */
router.get('/sla', async (_req, res) => {
  try {
    const slaResults = enterpriseOptimizationController['monitoringService'].getSLAResults();
    
    res.status(200).json({
      success: true,
      data: slaResults,
      metadata: {
        timestamp: new Date().toISOString(),
        version: '3.0.0'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SLA_ERROR',
        message: 'Failed to retrieve SLA results',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      metadata: {
        timestamp: new Date().toISOString(),
        version: '3.0.0'
      }
    });
  }
});

// ============================================================================
// CONFIGURATION ROUTES
// ============================================================================

/**
 * @route GET /api/enterprise/config
 * @desc Get system configuration
 * @access Public
 * @response {
 *   success: boolean,
 *   data: {
 *     algorithms: string[],
 *     objectives: string[],
 *     constraints: string[],
 *     performance: string[],
 *     costModel: string[]
 *   },
 *   metadata: { timestamp: string, version: string }
 * }
 */
router.get('/config', async (_req, res) => {
  try {
    const config = {
      algorithms: [
        'linear-programming',
        'integer-programming',
        'genetic-advanced',
        'neural-network',
        'hybrid'
      ],
      objectives: [
        'minimize-waste',
        'minimize-cost',
        'minimize-time',
        'maximize-efficiency'
      ],
      constraints: [
        'maxProcessingTime',
        'qualityThreshold',
        'costLimit',
        'environmentalFactors'
      ],
      performance: [
        'maxIterations',
        'convergenceThreshold',
        'parallelProcessing',
        'cacheResults'
      ],
      costModel: [
        'materialCost',
        'cuttingCost',
        'setupCost',
        'wasteCost',
        'timeCost',
        'energyCost'
      ]
    };
    
    res.status(200).json({
      success: true,
      data: config,
      metadata: {
        timestamp: new Date().toISOString(),
        version: '3.0.0'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'CONFIG_ERROR',
        message: 'Failed to retrieve configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      metadata: {
        timestamp: new Date().toISOString(),
        version: '3.0.0'
      }
    });
  }
});

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================

/**
 * Global error handler for enterprise optimization routes
 */
router.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[EnterpriseRoutes] Unhandled error:', error);
  
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
      details: (typeof process !== 'undefined' && process.env?.['NODE_ENV'] === 'development') ? (error instanceof Error ? error.message : 'Unknown error') : 'An unexpected error occurred'
    },
    metadata: {
      timestamp: new Date().toISOString(),
      version: '3.0.0'
    }
  });
});

/**
 * 404 handler for enterprise optimization routes
 */
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
      details: 'The requested endpoint does not exist'
    },
    metadata: {
      timestamp: new Date().toISOString(),
      version: '3.0.0'
    }
  });
});

export default router;
