/**
 * LEMNİX Selection Log Routes v3.0.0
 * Algorithm selection monitoring, dashboard integration, and canary analysis
 * 
 * @module routes/selectionLogRoutes
 * @version 3.0.0
 * @architecture Factory Pattern + Dependency Injection + RBAC
 */

import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { SelectionLogService } from '../services/policies/selectionLogService';
import { ILogger } from '../services/logger';
import { verifyToken, requirePermission, Permission } from '../middleware/authorization';
import { createRateLimit } from '../middleware/rateLimiting';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Extracts function property keys from a type
 */
type FnKeys<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

/**
 * Standard controller handler signature
 */
type ControllerHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => unknown;

/**
 * HTTP methods supported by the router
 */
type HTTPVerb = 'get' | 'post' | 'put' | 'delete' | 'patch';

/**
 * Rate limiter configuration keys
 */
const RATE_LIMITERS = {
  default: createRateLimit('default'),
  monitoring: createRateLimit('monitoring')
} as const;

type RateLimiterKey = keyof typeof RATE_LIMITERS;

/**
 * Declarative route configuration
 */
interface RouteConfig {
  readonly path: string;
  readonly method: HTTPVerb;
  readonly handler: ControllerHandler;
  readonly middleware?: ReadonlyArray<RequestHandler>;
  readonly requiresAuth?: boolean;
  readonly permission?: Permission;
  readonly rateLimit?: RateLimiterKey;
}

/**
 * Standard API error response structure
 */
interface ErrorResponse {
  readonly error: {
    readonly id: string;
    readonly correlationId: string;
    readonly class: string;
    readonly code: string;
    readonly message: string;
    readonly recoverable: boolean;
    readonly timestamp: string;
  };
}

/**
 * Standard API success response structure
 */
interface SuccessResponse<T = unknown> {
  readonly success: true;
  readonly data: T;
  readonly timestamp: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Error codes for selection log operations
 */
const ERROR_CODES = {
  ITEMS_MISSING: 'SELECTION_ITEMS_MISSING',
  RESULTS_MISSING: 'SELECTION_RESULTS_MISSING',
  LOG_NOT_FOUND: 'SELECTION_LOG_NOT_FOUND',
  CANARY_DATA_MISSING: 'CANARY_DATA_MISSING',
  CANARY_NOT_FOUND: 'CANARY_DATA_NOT_FOUND'
} as const;

/**
 * Error messages for selection log operations
 */
const ERROR_MESSAGES = {
  [ERROR_CODES.ITEMS_MISSING]: 'Items array is required',
  [ERROR_CODES.RESULTS_MISSING]: 'Results object is required',
  [ERROR_CODES.LOG_NOT_FOUND]: 'Selection log not found',
  [ERROR_CODES.CANARY_DATA_MISSING]: 'Algorithm, workloadClass, metrics, and baseline are required',
  [ERROR_CODES.CANARY_NOT_FOUND]: 'Canary data not found'
} as const;

/**
 * Dashboard metrics constants
 */
const DASHBOARD_CONSTANTS = {
  TOP_ALGORITHMS_LIMIT: 5,
  DEFAULT_TIME_WINDOW: '24h',
  PRECISION_DECIMALS: 2
} as const;

/**
 * Slow request threshold in milliseconds
 */
const SLOW_REQUEST_THRESHOLD_MS = 3000;

// ============================================================================
// RESPONSE HELPERS
// ============================================================================

/**
 * Helper class for building standardized responses
 */
class ResponseHelpers {
  /**
   * Get correlation ID from request
   */
  static getCorrelationId(req: Request): string {
    return (req.headers['x-correlation-id'] as string) || 'unknown';
  }

  /**
   * Build error response
   */
  static buildError(
    correlationId: string,
    code: keyof typeof ERROR_CODES,
    statusCode: number
  ): { status: number; body: ErrorResponse } {
    return {
      status: statusCode,
      body: {
        error: {
          id: correlationId,
          correlationId,
          class: 'CLIENT',
          code: ERROR_CODES[code],
          message: ERROR_MESSAGES[ERROR_CODES[code]],
          recoverable: false,
          timestamp: new Date().toISOString()
        }
      }
    };
  }

  /**
   * Build success response
   */
  static buildSuccess<T>(data: T): SuccessResponse<T> {
    return {
      success: true,
      data,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Round number to specified precision
   */
  static round(value: number, decimals: number = DASHBOARD_CONSTANTS.PRECISION_DECIMALS): number {
    const multiplier = Math.pow(10, decimals);
    return Math.round(value * multiplier) / multiplier;
  }
}

/**
 * Dashboard summary calculation helper
 */
class DashboardSummaryCalculator {
  /**
   * Calculate top algorithms from distribution
   */
  static calculateTopAlgorithms(
    byAlgorithm: Record<string, { count: number; averageQuality: number; averageDuration: number; successRate: number }>
  ): ReadonlyArray<{
    readonly algorithm: string;
    readonly count: number;
    readonly averageQuality: number;
    readonly averageDuration: number;
    readonly successRate: number;
  }> {
    return Object.entries(byAlgorithm)
      .map(([algorithm, stats]) => ({
        algorithm,
        count: stats.count,
        averageQuality: ResponseHelpers.round(stats.averageQuality),
        averageDuration: Math.round(stats.averageDuration),
        successRate: ResponseHelpers.round(stats.successRate)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, DASHBOARD_CONSTANTS.TOP_ALGORITHMS_LIMIT);
  }

  /**
   * Calculate workload distribution
   */
  static calculateWorkloadDistribution(
    byWorkloadClass: Record<string, { count: number; fallbackRate: number; algorithmDistribution: Record<string, number> }>
  ): ReadonlyArray<{
    readonly workloadClass: string;
    readonly count: number;
    readonly fallbackRate: number;
    readonly topAlgorithm: string;
  }> {
    return Object.entries(byWorkloadClass)
      .map(([workloadClass, stats]) => ({
        workloadClass,
        count: stats.count,
        fallbackRate: ResponseHelpers.round(stats.fallbackRate),
        topAlgorithm: Object.entries(stats.algorithmDistribution)
          .sort(([, a], [, b]) => b - a)[0]?.[0] || 'UNKNOWN'
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Calculate selection reasons summary
   */
  static calculateSelectionReasons(
    byReason: Record<string, number>
  ): ReadonlyArray<{ readonly reason: string; readonly count: number }> {
    return Object.entries(byReason)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Calculate fallback triggers summary
   */
  static calculateFallbackTriggers(
    byFallbackTrigger: Record<string, number>
  ): ReadonlyArray<{ readonly trigger: string; readonly count: number }> {
    return Object.entries(byFallbackTrigger)
      .map(([trigger, count]) => ({ trigger, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Calculate recent trend summary
   */
  static calculateRecentTrend(
    dataPoints: ReadonlyArray<{ selections: number; averageQuality: number; fallbackRate: number }>
  ): {
    readonly selectionsLast24h: number;
    readonly averageQualityLast24h: number;
    readonly fallbackRateLast24h: number;
  } {
    const selectionsLast24h = dataPoints.reduce((sum, point) => sum + point.selections, 0);
    const averageQualityLast24h = dataPoints.length > 0
      ? ResponseHelpers.round(dataPoints.reduce((sum, point) => sum + point.averageQuality, 0) / dataPoints.length)
      : 0;
    const fallbackRateLast24h = dataPoints.length > 0
      ? ResponseHelpers.round(dataPoints.reduce((sum, point) => sum + point.fallbackRate, 0) / dataPoints.length)
      : 0;

    return { selectionsLast24h, averageQualityLast24h, fallbackRateLast24h };
  }

  /**
   * Calculate overall averages
   */
  static calculateOverallAverages(
    byAlgorithm: Record<string, { count: number; averageQuality: number; averageDuration: number }>,
    byWorkloadClass: Record<string, { count: number; fallbackRate: number }>
  ): {
    readonly averageQuality: number;
    readonly averageDuration: number;
    readonly fallbackRate: number;
  } {
    let totalQuality = 0;
    let totalDuration = 0;
    let totalFallbacks = 0;
    let totalCount = 0;

    Object.values(byAlgorithm).forEach(stats => {
      totalQuality += stats.averageQuality * stats.count;
      totalDuration += stats.averageDuration * stats.count;
      totalCount += stats.count;
    });

    Object.values(byWorkloadClass).forEach(stats => {
      totalFallbacks += stats.fallbackRate * stats.count;
    });

    return {
      averageQuality: totalCount > 0 ? ResponseHelpers.round(totalQuality / totalCount) : 0,
      averageDuration: totalCount > 0 ? Math.round(totalDuration / totalCount) : 0,
      fallbackRate: totalCount > 0 ? ResponseHelpers.round(totalFallbacks / totalCount) : 0
    };
  }
}

// ============================================================================
// ASYNC ERROR WRAPPER
// ============================================================================

/**
 * Robust async/sync error handler with latency tracking
 * Handles promises, thenables, and synchronous throws
 */
const asyncify = (fn: ControllerHandler, logger: ILogger): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const startedAt = Date.now();

    res.once('finish', () => {
      const duration = Date.now() - startedAt;
      if (duration > SLOW_REQUEST_THRESHOLD_MS) {
        logger.warn('Slow request detected', {
          path: req.path,
          method: req.method,
          duration,
          userId: req.user?.userId
        });
      }
    });

    try {
      Promise.resolve(fn(req, res, next)).catch((error: unknown) => {
        logger.error('Route handler async error', {
          error: error instanceof Error ? error.message : String(error),
          path: req.path,
          method: req.method,
          userId: req.user?.userId,
          stack: error instanceof Error ? error.stack : undefined
        });
        next(error);
      });
    } catch (error: unknown) {
      logger.error('Route handler sync error', {
        error: error instanceof Error ? error.message : String(error),
        path: req.path,
        method: req.method,
        userId: req.user?.userId,
        stack: error instanceof Error ? error.stack : undefined
      });
      next(error);
    }
  };
};

// ============================================================================
// SELECTION LOG HANDLERS
// ============================================================================

/**
 * Selection log route handlers
 * Encapsulates all business logic for selection log routes
 */
class SelectionLogHandlers {
  constructor(
    private readonly selectionLogService: SelectionLogService,
    private readonly logger: ILogger
  ) {}

  /**
   * Create new algorithm selection log
   */
  public createSelectionLog: ControllerHandler = async (req: Request, res: Response): Promise<void> => {
    const { items, constraints } = req.body;
    const correlationId = ResponseHelpers.getCorrelationId(req);

    if (!items || !Array.isArray(items)) {
      const error = ResponseHelpers.buildError(correlationId, 'ITEMS_MISSING', 400);
      res.status(error.status).json(error.body);
      return;
    }

    const selectionLog = await this.selectionLogService.createSelectionLog(
      correlationId,
      items,
      constraints || {}
    );

    res.json(ResponseHelpers.buildSuccess(selectionLog));
  };

  /**
   * Update selection log with execution results
   */
  public updateSelectionLog: ControllerHandler = async (req: Request, res: Response): Promise<void> => {
    const { selectionId } = req.params;
    const { results } = req.body;
    const correlationId = ResponseHelpers.getCorrelationId(req);

    if (!results) {
      const error = ResponseHelpers.buildError(correlationId, 'RESULTS_MISSING', 400);
      res.status(error.status).json(error.body);
      return;
    }

    const success = await this.selectionLogService.updateSelectionLog(selectionId, results);

    if (!success) {
      const error = ResponseHelpers.buildError(correlationId, 'LOG_NOT_FOUND', 404);
      res.status(error.status).json(error.body);
      return;
    }

    res.json(ResponseHelpers.buildSuccess({
      selectionId,
      updated: true,
      timestamp: new Date().toISOString()
    }));
  };

  /**
   * Get specific selection log
   */
  public getSelectionLog: ControllerHandler = (req: Request, res: Response): void => {
    const { selectionId } = req.params;
    const correlationId = ResponseHelpers.getCorrelationId(req);

    const selectionLog = this.selectionLogService.getSelectionLog(selectionId);

    if (!selectionLog) {
      const error = ResponseHelpers.buildError(correlationId, 'LOG_NOT_FOUND', 404);
      res.status(error.status).json(error.body);
      return;
    }

    res.json(ResponseHelpers.buildSuccess(selectionLog));
  };

  /**
   * Get selection distribution dashboard data
   */
  public getDistribution: ControllerHandler = (_req: Request, res: Response): void => {
    const distribution = this.selectionLogService.getSelectionDistribution();
    res.json(ResponseHelpers.buildSuccess(distribution));
  };

  /**
   * Get selection trend data
   */
  public getTrend: ControllerHandler = (req: Request, res: Response): void => {
    const { timeWindow = DASHBOARD_CONSTANTS.DEFAULT_TIME_WINDOW } = req.query;
    const trend = this.selectionLogService.getSelectionTrend(timeWindow as string);
    res.json(ResponseHelpers.buildSuccess(trend));
  };

  /**
   * Get selection dashboard summary
   */
  public getSummary: ControllerHandler = (_req: Request, res: Response): void => {
    const distribution = this.selectionLogService.getSelectionDistribution();
    const trend = this.selectionLogService.getSelectionTrend(DASHBOARD_CONSTANTS.DEFAULT_TIME_WINDOW);

    const overallAverages = DashboardSummaryCalculator.calculateOverallAverages(
      distribution.byAlgorithm,
      distribution.byWorkloadClass
    );

    const summary = {
      totalSelections: distribution.totalSelections,
      ...overallAverages,
      topAlgorithms: DashboardSummaryCalculator.calculateTopAlgorithms(distribution.byAlgorithm),
      workloadDistribution: DashboardSummaryCalculator.calculateWorkloadDistribution(distribution.byWorkloadClass),
      selectionReasons: DashboardSummaryCalculator.calculateSelectionReasons(distribution.byReason),
      fallbackTriggers: DashboardSummaryCalculator.calculateFallbackTriggers(distribution.byFallbackTrigger),
      recentTrend: DashboardSummaryCalculator.calculateRecentTrend(trend.dataPoints)
    };

    res.json(ResponseHelpers.buildSuccess(summary));
  };

  /**
   * Record canary data for change safety
   */
  public recordCanary: ControllerHandler = async (req: Request, res: Response): Promise<void> => {
    const { algorithm, workloadClass, metrics, baseline } = req.body;
    const correlationId = ResponseHelpers.getCorrelationId(req);

    if (!algorithm || !workloadClass || !metrics || !baseline) {
      const error = ResponseHelpers.buildError(correlationId, 'CANARY_DATA_MISSING', 400);
      res.status(error.status).json(error.body);
      return;
    }

    const canaryData = await this.selectionLogService.recordCanaryData(
      correlationId,
      algorithm,
      workloadClass,
      metrics,
      baseline
    );

    res.json(ResponseHelpers.buildSuccess(canaryData));
  };

  /**
   * Get canary data by correlation ID
   */
  public getCanary: ControllerHandler = (req: Request, res: Response): void => {
    const { correlationId } = req.params;
    const canaryData = this.selectionLogService.getCanaryData(correlationId);

    if (!canaryData) {
      const error = ResponseHelpers.buildError(correlationId, 'CANARY_NOT_FOUND', 404);
      res.status(error.status).json(error.body);
      return;
    }

    res.json(ResponseHelpers.buildSuccess(canaryData));
  };

  /**
   * Get algorithm performance comparison
   */
  public getPerformance: ControllerHandler = (_req: Request, res: Response): void => {
    const distribution = this.selectionLogService.getSelectionDistribution();

    const performanceComparison = Object.entries(distribution.byAlgorithm)
      .map(([algorithm, stats]) => ({
        algorithm,
        metrics: {
          count: stats.count,
          averageQuality: ResponseHelpers.round(stats.averageQuality),
          averageDuration: Math.round(stats.averageDuration),
          successRate: ResponseHelpers.round(stats.successRate)
        },
        workloadBreakdown: Object.entries(stats.workloadDistribution)
          .map(([workloadClass, count]) => ({
            workloadClass,
            count,
            percentage: stats.count > 0 ? Math.round((count / stats.count) * 100) : 0
          }))
          .sort((a, b) => b.count - a.count)
      }))
      .sort((a, b) => b.metrics.count - a.metrics.count);

    res.json(ResponseHelpers.buildSuccess({
      performanceComparison,
      totalAlgorithms: performanceComparison.length,
      totalSelections: distribution.totalSelections
    }));
  };

  /**
   * Get fallback analysis data
   */
  public getFallbackAnalysis: ControllerHandler = (_req: Request, res: Response): void => {
    const distribution = this.selectionLogService.getSelectionDistribution();
    const totalFallbacks = Object.values(distribution.byFallbackTrigger).reduce((sum, count) => sum + count, 0);

    const fallbackAnalysis = {
      totalFallbacks,
      fallbackRate: distribution.totalSelections > 0
        ? ResponseHelpers.round((totalFallbacks / distribution.totalSelections) * 100)
        : 0,
      triggers: Object.entries(distribution.byFallbackTrigger)
        .map(([trigger, count]) => ({
          trigger,
          count,
          percentage: distribution.totalSelections > 0
            ? ResponseHelpers.round((count / distribution.totalSelections) * 100)
            : 0
        }))
        .sort((a, b) => b.count - a.count),
      byWorkloadClass: Object.entries(distribution.byWorkloadClass)
        .map(([workloadClass, stats]) => ({
          workloadClass,
          fallbackRate: ResponseHelpers.round(stats.fallbackRate),
          totalSelections: stats.count
        }))
        .sort((a, b) => b.fallbackRate - a.fallbackRate)
    };

    res.json(ResponseHelpers.buildSuccess(fallbackAnalysis));
  };
}

// ============================================================================
// ROUTE REGISTRY
// ============================================================================

/**
 * Route registry for declarative route configuration
 */
class RouteRegistry {
  constructor(
    private readonly router: Router,
    private readonly handlers: SelectionLogHandlers,
    private readonly logger: ILogger
  ) {}

  /**
   * Register a single route with its configuration
   */
  private register(config: RouteConfig): void {
    const middleware: RequestHandler[] = [];

    if (config.rateLimit) {
      middleware.push(RATE_LIMITERS[config.rateLimit]);
    }

    if (config.requiresAuth) {
      middleware.push(verifyToken);
    }

    if (config.permission) {
      middleware.push(requirePermission(config.permission));
    }

    if (config.middleware) {
      middleware.push(...config.middleware);
    }

    const wrappedHandler = asyncify(config.handler, this.logger);
    this.router[config.method](config.path, ...middleware, wrappedHandler);
  }

  /**
   * Register all routes
   */
  public registerAll(routes: ReadonlyArray<RouteConfig>): void {
    routes.forEach(route => this.register(route));
  }
}

// ============================================================================
// ROUTE DEFINITIONS
// ============================================================================

/**
 * Selection log route configurations
 */
const createRouteConfigs = (handlers: SelectionLogHandlers): ReadonlyArray<RouteConfig> => [
  // Selection log CRUD
  {
    path: '/create',
    method: 'post',
    handler: handlers.createSelectionLog,
    requiresAuth: true,
    permission: Permission.START_OPTIMIZATION,
    rateLimit: 'default'
  },
  {
    path: '/:selectionId/update',
    method: 'put',
    handler: handlers.updateSelectionLog,
    requiresAuth: true,
    permission: Permission.START_OPTIMIZATION,
    rateLimit: 'default'
  },
  {
    path: '/:selectionId',
    method: 'get',
    handler: handlers.getSelectionLog,
    requiresAuth: true,
    permission: Permission.VIEW_LOGS,
    rateLimit: 'monitoring'
  },

  // Dashboard endpoints
  {
    path: '/dashboard/distribution',
    method: 'get',
    handler: handlers.getDistribution,
    requiresAuth: true,
    permission: Permission.VIEW_METRICS,
    rateLimit: 'monitoring'
  },
  {
    path: '/dashboard/trend',
    method: 'get',
    handler: handlers.getTrend,
    requiresAuth: true,
    permission: Permission.VIEW_METRICS,
    rateLimit: 'monitoring'
  },
  {
    path: '/dashboard/summary',
    method: 'get',
    handler: handlers.getSummary,
    requiresAuth: true,
    permission: Permission.VIEW_METRICS,
    rateLimit: 'monitoring'
  },
  {
    path: '/dashboard/performance',
    method: 'get',
    handler: handlers.getPerformance,
    requiresAuth: true,
    permission: Permission.VIEW_METRICS,
    rateLimit: 'monitoring'
  },
  {
    path: '/dashboard/fallback-analysis',
    method: 'get',
    handler: handlers.getFallbackAnalysis,
    requiresAuth: true,
    permission: Permission.VIEW_METRICS,
    rateLimit: 'monitoring'
  },

  // Canary endpoints
  {
    path: '/canary',
    method: 'post',
    handler: handlers.recordCanary,
    requiresAuth: true,
    permission: Permission.START_OPTIMIZATION,
    rateLimit: 'default'
  },
  {
    path: '/canary/:correlationId',
    method: 'get',
    handler: handlers.getCanary,
    requiresAuth: true,
    permission: Permission.VIEW_LOGS,
    rateLimit: 'monitoring'
  }
];

// ============================================================================
// ROUTER FACTORY
// ============================================================================

/**
 * Factory for creating selection log router
 * @param selectionLogService - Selection log service instance
 * @param logger - Logger instance
 * @returns Configured Express router
 */
export function createSelectionLogRouter(
  selectionLogService: SelectionLogService,
  logger: ILogger
): Router {
  const router = Router();
  const handlers = new SelectionLogHandlers(selectionLogService, logger);
  const registry = new RouteRegistry(router, handlers, logger);
  const routes = createRouteConfigs(handlers);

  registry.registerAll(routes);

  return router;
}

/**
 * Default router instance (backward compatibility)
 * @deprecated Use createSelectionLogRouter factory instead
 */
export default function createDefaultRouter(
  selectionLogService: SelectionLogService,
  logger: ILogger
): Router {
  return createSelectionLogRouter(selectionLogService, logger);
}
