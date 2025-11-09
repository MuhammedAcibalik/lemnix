/**
 * @fileoverview Enterprise-Grade Optimization Routes
 * @module EnterpriseOptimizationRoutes
 * @version 5.0.0
 */

import {
  Router,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
import { EnterpriseOptimizationController } from "../controllers/enterpriseOptimizationController";
import { createRateLimit } from "../middleware/rateLimiting";
import {
  verifyToken,
  requirePermission,
  Permission,
} from "../middleware/authorization";
import { logger } from "../services/logger";

const RATE_LIMITERS = {
  optimization: createRateLimit("optimization"),
  export: createRateLimit("export"),
  default: createRateLimit("default"),
} as const;

type RateLimiterKey = keyof typeof RATE_LIMITERS;
type HTTPVerb = "get" | "post" | "put" | "delete";
type ControllerHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => unknown;
type FnKeys<T> = { [K in keyof T]: T[K] extends Function ? K : never }[keyof T];

const VERSION = "5.0.0" as const;

const OPTIMIZATION_ALGORITHMS = [
  "ffd",
  "bfd",
  "genetic",
  "pooling",
  "nsga-ii",
  "pattern-exact",
] as const;

type OptimizationAlgorithm = (typeof OPTIMIZATION_ALGORITHMS)[number];

interface RouteConfig {
  readonly path: string;
  readonly method: HTTPVerb;
  readonly handler:
    | FnKeys<EnterpriseOptimizationController>
    | ControllerHandler;
  readonly middleware?: ReadonlyArray<RequestHandler>;
  readonly requiresAuth?: boolean;
  readonly permission?: Permission;
  readonly rateLimit?: RateLimiterKey;
}

interface IMethodCache<T> {
  getBound(key: FnKeys<T>): ControllerHandler;
  has(key: FnKeys<T>): boolean;
  clear(): void;
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
      if (duration > 5000) {
        logger.warn("Slow optimization request", {
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
        logger.error("Optimization route error", {
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
      logger.error("Optimization route sync error", {
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

class BoundMethodCache<T extends object> implements IMethodCache<T> {
  private readonly cache = new Map<PropertyKey, ControllerHandler>();

  constructor(private readonly instance: T) {}

  public getBound(key: FnKeys<T>): ControllerHandler {
    const k: PropertyKey = key;
    const hit = this.cache.get(k);
    if (hit !== undefined) {
      return hit;
    }

    const value = (this.instance as Record<string, unknown>)[key as string];
    if (typeof value !== "function") {
      throw new TypeError(`${String(key)} is not a method`);
    }

    const bound = (value as Function).bind(this.instance) as ControllerHandler;
    this.cache.set(k, bound);
    return bound;
  }

  public has(key: FnKeys<T>): boolean {
    return this.cache.has(key as PropertyKey);
  }

  public clear(): void {
    this.cache.clear();
  }
}

class RouteRegistry implements IRouteRegistry {
  private readonly rateLimiters = RATE_LIMITERS;

  constructor(
    private readonly router: Router,
    private readonly cache: IMethodCache<EnterpriseOptimizationController>,
  ) {}

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

    const handler =
      typeof config.handler === "string"
        ? asyncify(this.cache.getBound(config.handler) as ControllerHandler)
        : asyncify(config.handler as ControllerHandler);

    middlewares.push(handler);
    this.router[config.method](config.path, ...middlewares);
  }

  public registerBatch(configs: ReadonlyArray<RouteConfig>): void {
    configs.forEach((config) => this.register(config));
  }

  public build(): Router {
    return this.router;
  }
}

const createAlgorithmHandler = (
  algorithm: OptimizationAlgorithm,
): ControllerHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    req.body = {
      ...req.body,
      algorithm,
    };
    next();
  };
};

class EnterpriseOptimizationRouterFactory {
  private readonly algorithmRoutes: ReadonlyArray<RouteConfig>;
  private readonly mainRoutes: ReadonlyArray<RouteConfig>;

  constructor(private readonly controller: EnterpriseOptimizationController) {
    this.algorithmRoutes = OPTIMIZATION_ALGORITHMS.map((algorithm) => ({
      path: `/${algorithm}`,
      method: "post" as const,
      handler: "optimize",
      middleware: [createAlgorithmHandler(algorithm)],
      requiresAuth: true,
      permission: Permission.START_OPTIMIZATION,
      rateLimit: "optimization" as const,
    }));

    this.mainRoutes = [
      {
        path: "/optimize",
        method: "post",
        handler: "optimizeWithMode",
        requiresAuth: true,
        permission: Permission.START_OPTIMIZATION,
        rateLimit: "optimization",
      },
      {
        path: "/optimize-by-profile",
        method: "post",
        handler: "optimizeByProfileType",
        requiresAuth: true,
        permission: Permission.START_OPTIMIZATION,
        rateLimit: "optimization",
      },
      {
        path: "/optimize/pareto",
        method: "post",
        handler: "optimizePareto",
        requiresAuth: true,
        permission: Permission.START_OPTIMIZATION,
        rateLimit: "optimization",
      },
      {
        path: "/optimize/compare",
        method: "post",
        handler: "optimizeCompare",
        requiresAuth: true,
        permission: Permission.START_OPTIMIZATION,
        rateLimit: "optimization",
      },
      {
        path: "/health",
        method: "get",
        handler: "healthCheck",
        requiresAuth: false,
      },
      {
        path: "/metrics",
        method: "get",
        handler: "getMetrics",
        requiresAuth: true,
        permission: Permission.VIEW_METRICS,
      },
      {
        path: "/performance",
        method: "get",
        handler: "analyzePerformance",
        requiresAuth: true,
        permission: Permission.VIEW_METRICS,
      },
      {
        path: "/export",
        method: "post",
        handler: "exportResults",
        requiresAuth: true,
        permission: Permission.EXPORT_REPORTS,
        rateLimit: "export",
      },
      {
        path: "/analytics",
        method: "get",
        handler: "getAnalytics",
        requiresAuth: true,
        permission: Permission.VIEW_METRICS,
      },
      {
        path: "/audit",
        method: "get",
        handler: "getAuditTrail",
        requiresAuth: true,
        permission: Permission.VIEW_SECURITY_LOGS,
      },
      {
        path: "/system-health",
        method: "get",
        handler: "getSystemHealth",
        requiresAuth: true,
        permission: Permission.VIEW_METRICS,
      },
      {
        path: "/history",
        method: "get",
        handler: "getOptimizationHistory",
        requiresAuth: true,
        permission: Permission.VIEW_OPTIMIZATION_RESULTS,
      },
    ];
  }

  public create(): Router {
    const router = Router();
    const cache = new BoundMethodCache(this.controller);
    const registry = new RouteRegistry(router, cache);

    registry.registerBatch(this.mainRoutes);
    registry.registerBatch(this.algorithmRoutes);

    this.registerErrorHandlers(router);

    return registry.build();
  }

  private registerErrorHandlers(router: Router): void {
    router.use(
      (error: Error, _req: Request, res: Response, _next: NextFunction) => {
        logger.error("Enterprise optimization route error", {
          error: error.message,
          stack: error.stack,
          version: VERSION,
        });

        const isDevelopment = process.env["NODE_ENV"] === "development";

        res.status(500).json({
          success: false,
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Internal server error",
            details: isDevelopment
              ? error.message
              : "An unexpected error occurred",
          },
          metadata: {
            timestamp: new Date().toISOString(),
            version: VERSION,
          },
        });
      },
    );

    router.use("*", (req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: `Route ${req.method} ${req.originalUrl} not found`,
          details: "The requested endpoint does not exist",
        },
        metadata: {
          timestamp: new Date().toISOString(),
          version: VERSION,
        },
      });
    });
  }
}

const createRouter = (): Router => {
  const controller = new EnterpriseOptimizationController();
  const factory = new EnterpriseOptimizationRouterFactory(controller);
  return factory.create();
};

export default createRouter();
