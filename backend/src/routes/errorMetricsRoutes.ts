/**
 * @fileoverview Error Metrics Routes
 * @module ErrorMetricsRoutes
 * @version 2.0.0
 */

import {
  Router,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
import { ErrorClass, ErrorSeverity } from "../types/errorTypes";
import { getErrorMetricsService } from "../services/monitoring/errorMetricsService";
import { logger } from "../services/logger";
import { createRateLimit } from "../middleware/rateLimiting";
import {
  verifyToken,
  requirePermission,
  Permission,
} from "../middleware/authorization";

const RATE_LIMITERS = {
  monitoring: createRateLimit("monitoring"),
  default: createRateLimit("default"),
} as const;

type RateLimiterKey = keyof typeof RATE_LIMITERS;
type HTTPVerb = "get" | "post";
type ControllerHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => unknown;

const SLO_THRESHOLDS = {
  [ErrorClass.CLIENT]: 5,
  [ErrorClass.BUSINESS]: 2,
  [ErrorClass.INTEGRATION]: 1,
  [ErrorClass.SYSTEM]: 0.5,
} as const;

const ERROR_RATE_THRESHOLDS = {
  WARNING: 10,
  CRITICAL: 20,
  HIGH_THRESHOLD: 10,
  TREND_THRESHOLD: 50,
} as const;

type HealthStatus = "healthy" | "warning" | "critical";

interface RouteConfig {
  readonly path: string;
  readonly method: HTTPVerb;
  readonly handler: ControllerHandler;
  readonly middleware?: ReadonlyArray<RequestHandler>;
  readonly requiresAuth?: boolean;
  readonly permission?: Permission;
  readonly rateLimit?: RateLimiterKey;
}

interface IRouteRegistry {
  register(config: RouteConfig): void;
  registerBatch(configs: ReadonlyArray<RouteConfig>): void;
  build(): Router;
}

const asyncify = (fn: ControllerHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const startedAt = Date.now();

    res.once("finish", () => {
      const duration = Date.now() - startedAt;
      if (duration > 3000) {
        logger.warn("Slow error metrics request", {
          path: req.path,
          method: req.method,
          duration,
          userId: req.user?.userId,
          statusCode: res.statusCode,
        });
      }
    });

    try {
      Promise.resolve(fn(req, res, next)).catch((error: unknown) => {
        const err = error as Error;
        logger.error("Error metrics route error", {
          error: err.message,
          path: req.path,
          method: req.method,
          userId: req.user?.userId,
          stack: err.stack,
        });
        next(error);
      });
    } catch (error: unknown) {
      const err = error as Error;
      logger.error("Error metrics route sync error", {
        error: err.message,
        path: req.path,
        method: req.method,
        userId: req.user?.userId,
        stack: err.stack,
      });
      next(error);
    }
  };
};

class RouteRegistry implements IRouteRegistry {
  private readonly rateLimiters = RATE_LIMITERS;

  constructor(private readonly router: Router) {}

  public register(config: RouteConfig): void {
    const middlewares: RequestHandler[] = [];

    if (config.rateLimit) {
      middlewares.push(this.rateLimiters[config.rateLimit]);
    }

    if (config.requiresAuth) {
      middlewares.push(verifyToken);
    }

    if (config.permission) {
      middlewares.push(requirePermission(config.permission));
    }

    if (config.middleware) {
      middlewares.push(...config.middleware);
    }

    middlewares.push(asyncify(config.handler));
    this.router[config.method](config.path, ...middlewares);
  }

  public registerBatch(configs: ReadonlyArray<RouteConfig>): void {
    configs.forEach((config) => this.register(config));
  }

  public build(): Router {
    return this.router;
  }
}

interface HealthCheckResult {
  readonly status: HealthStatus;
  readonly issues: readonly string[];
}

class ErrorMetricsHandlers {
  constructor(
    private readonly errorMetricsService: ReturnType<
      typeof getErrorMetricsService
    >,
  ) {}

  private createTimestampedResponse<T>(data: T): { timestamp: string } & T {
    return {
      timestamp: new Date().toISOString(),
      ...data,
    };
  }

  private calculateHealthStatus(
    currentRate: number,
    trends: ReturnType<typeof this.errorMetricsService.getErrorTrends>,
    distribution: ReturnType<
      typeof this.errorMetricsService.getErrorDistribution
    >,
  ): HealthCheckResult {
    let status: HealthStatus = "healthy";
    const issues: string[] = [];

    if (currentRate > ERROR_RATE_THRESHOLDS.CRITICAL) {
      status = "critical";
      issues.push(`High error rate: ${currentRate} errors/min`);
    } else if (currentRate > ERROR_RATE_THRESHOLDS.WARNING) {
      status = "warning";
      issues.push(`Elevated error rate: ${currentRate} errors/min`);
    }

    if (
      trends.trend === "increasing" &&
      trends.changePercent > ERROR_RATE_THRESHOLDS.TREND_THRESHOLD
    ) {
      if (status === "healthy") status = "warning";
      issues.push(
        `Increasing error trend: +${trends.changePercent.toFixed(1)}%`,
      );
    }

    const criticalErrors =
      distribution.bySeverity.get(ErrorSeverity.CRITICAL) || 0;
    if (criticalErrors > 0) {
      status = "critical";
      issues.push(`${criticalErrors} critical errors detected`);
    }

    return { status, issues };
  }

  public getAllMetrics: ControllerHandler = (
    _req: Request,
    res: Response,
  ): void => {
    const metrics = this.errorMetricsService.getErrorMetrics();
    const distribution = this.errorMetricsService.getErrorDistribution();
    const trends = this.errorMetricsService.getErrorTrends();
    const currentRate = this.errorMetricsService.getCurrentErrorRate();

    const response = this.createTimestampedResponse({
      currentErrorRate: currentRate,
      trends,
      distribution: {
        byClass: Object.fromEntries(distribution.byClass),
        bySeverity: Object.fromEntries(distribution.bySeverity),
        byEndpoint: Object.fromEntries(distribution.byEndpoint),
      },
      detailedMetrics: Array.from(metrics.values()).map((metric) => ({
        class: metric.class,
        severity: metric.severity,
        count: metric.count,
        rate: metric.rate,
        lastOccurrence: metric.lastOccurrence,
        affectedEndpoints: metric.affectedEndpoints,
        uniqueUsers: metric.uniqueUsers,
      })),
    });

    res.json(response);
  };

  public getMetricsByClass: ControllerHandler = (
    _req: Request,
    res: Response,
  ): void => {
    const rates = this.errorMetricsService.getErrorRateByClass();

    const response = this.createTimestampedResponse({
      errorRatesByClass: Object.fromEntries(rates),
      sloThresholds: SLO_THRESHOLDS,
    });

    res.json(response);
  };

  public getTrends: ControllerHandler = (
    _req: Request,
    res: Response,
  ): void => {
    const trends = this.errorMetricsService.getErrorTrends();
    const distribution = this.errorMetricsService.getErrorDistribution();
    const currentRate = this.errorMetricsService.getCurrentErrorRate();

    const response = this.createTimestampedResponse({
      currentRate,
      trend: trends.trend,
      changePercent: trends.changePercent,
      distribution: {
        byClass: Object.fromEntries(distribution.byClass),
        bySeverity: Object.fromEntries(distribution.bySeverity),
      },
      alerts: {
        highErrorRate: this.errorMetricsService.isErrorRateHigh(
          ERROR_RATE_THRESHOLDS.HIGH_THRESHOLD,
        ),
        increasingTrend: trends.trend === "increasing",
        criticalErrors:
          distribution.bySeverity.get(ErrorSeverity.CRITICAL) || 0,
      },
    });

    res.json(response);
  };

  public getHealth: ControllerHandler = (
    _req: Request,
    res: Response,
  ): void => {
    const currentRate = this.errorMetricsService.getCurrentErrorRate();
    const trends = this.errorMetricsService.getErrorTrends();
    const distribution = this.errorMetricsService.getErrorDistribution();

    const { status, issues } = this.calculateHealthStatus(
      currentRate,
      trends,
      distribution,
    );

    const response = this.createTimestampedResponse({
      status,
      currentErrorRate: currentRate,
      trend: trends.trend,
      issues,
      summary: {
        totalErrors: Array.from(distribution.byClass.values()).reduce(
          (sum, count) => sum + count,
          0,
        ),
        criticalErrors:
          distribution.bySeverity.get(ErrorSeverity.CRITICAL) || 0,
        systemErrors: distribution.byClass.get(ErrorClass.SYSTEM) || 0,
        integrationErrors:
          distribution.byClass.get(ErrorClass.INTEGRATION) || 0,
      },
    });

    res.status(status === "critical" ? 503 : 200).json(response);
  };

  public resetMetrics: ControllerHandler = (
    req: Request,
    res: Response,
  ): void => {
    this.errorMetricsService.resetMetrics();

    logger.info("Error metrics reset", {
      userId: req.user?.userId,
      correlationId: req.headers["x-correlation-id"],
    });

    res.json(
      this.createTimestampedResponse({
        message: "Error metrics reset successfully",
      }),
    );
  };
}

class ErrorMetricsRouterFactory {
  private readonly routes: ReadonlyArray<RouteConfig>;

  constructor(private readonly handlers: ErrorMetricsHandlers) {
    this.routes = [
      {
        path: "/",
        method: "get",
        handler: handlers.getAllMetrics,
        requiresAuth: true,
        permission: Permission.VIEW_METRICS,
        rateLimit: "monitoring",
      },
      {
        path: "/by-class",
        method: "get",
        handler: handlers.getMetricsByClass,
        requiresAuth: true,
        permission: Permission.VIEW_METRICS,
        rateLimit: "monitoring",
      },
      {
        path: "/trends",
        method: "get",
        handler: handlers.getTrends,
        requiresAuth: true,
        permission: Permission.VIEW_METRICS,
        rateLimit: "monitoring",
      },
      {
        path: "/health",
        method: "get",
        handler: handlers.getHealth,
        requiresAuth: false,
        rateLimit: "monitoring",
      },
      {
        path: "/reset",
        method: "post",
        handler: handlers.resetMetrics,
        requiresAuth: true,
        permission: Permission.MANAGE_CONFIG,
      },
    ];
  }

  public create(): Router {
    const router = Router();
    const registry = new RouteRegistry(router);

    registry.registerBatch(this.routes);

    return registry.build();
  }
}

const createRouter = (): Router => {
  const errorMetricsService = getErrorMetricsService(logger);
  const handlers = new ErrorMetricsHandlers(errorMetricsService);
  const factory = new ErrorMetricsRouterFactory(handlers);
  return factory.create();
};

export default createRouter();
