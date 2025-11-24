/**
 * @fileoverview Cutting List Routes
 * @module CuttingListRoutes
 * @version 3.1.0
 */

import {
  Router,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
import {
  CuttingListController,
  cuttingListErrorHandler,
  getCuttingListController,
  getSmartProductSuggestions,
  getSmartSizeSuggestions,
  getSmartProfileSuggestions,
  getAutoCompleteSuggestions,
  getSmartSuggestionStats,
  reloadSmartSuggestionDatabase,
  getSmartWorkOrderSuggestions,
  getSmartWorkOrderInsights,
  applySmartProfileSet,
  getWorkOrderTemplates,
  duplicateWorkOrder,
  getAvailableSizes,
  getProfileCombinations,
} from "../controllers/cuttingListController";
import { handleValidationErrors } from "../middleware/validation";
import { createRateLimit } from "../middleware/rateLimiting";
import {
  verifyToken,
  requirePermission,
  Permission,
} from "../middleware/authorization";
import { logger } from "../services/logger";

const RATE_LIMITERS = {
  default: createRateLimit("default"),
  export: createRateLimit("export"),
  optimization: createRateLimit("optimization"),
} as const;

type RateLimiterKey = keyof typeof RATE_LIMITERS;
type HTTPVerb = "get" | "post" | "put" | "delete" | "patch";
type ControllerHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => unknown;
type FnKeys<T> = { [K in keyof T]: T[K] extends Function ? K : never }[keyof T];

interface RouteConfig {
  readonly path: string;
  readonly method: HTTPVerb;
  readonly handler: FnKeys<CuttingListController> | ControllerHandler;
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
      if (duration > 3000) {
        logger.warn("Slow request detected", {
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
        logger.error("Route handler error", {
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
      logger.error("Route handler sync error", {
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
    private readonly cache: IMethodCache<CuttingListController>,
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

const queryNormalizer: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (q.length > 0) {
    res.locals.query = q;
  }
  next();
};

class CuttingListRouterFactory {
  private readonly routes: ReadonlyArray<RouteConfig> = [
    {
      path: "/",
      method: "post",
      handler: "createCuttingList",
      requiresAuth: false,
    }, // TODO: Re-enable auth after testing
    {
      path: "/",
      method: "get",
      handler: "getAllCuttingLists",
      requiresAuth: false,
    }, // TODO: Re-enable auth after testing
    {
      path: "/test-pdf",
      method: "get",
      handler: "testPDFExport",
      requiresAuth: true,
    },

    // ✅ CRITICAL FIX: Specific routes BEFORE generic /:id routes to prevent path hijacking
    {
      path: "/:cuttingListId/sections/:sectionId/items/:itemId",
      method: "put",
      handler: "updateItemInSection",
      requiresAuth: true,
      permission: Permission.START_OPTIMIZATION,
      middleware: [handleValidationErrors],
    },
    {
      path: "/:cuttingListId/sections/:sectionId/items/:itemId",
      method: "delete",
      handler: "deleteItemFromSection",
      requiresAuth: true,
      permission: Permission.MANAGE_QUARANTINE,
    },
    {
      path: "/:cuttingListId/sections/:sectionId/items",
      method: "post",
      handler: "addItemToSection",
      requiresAuth: true,
      permission: Permission.START_OPTIMIZATION,
      middleware: [handleValidationErrors],
    },

    {
      path: "/:cuttingListId/sections/:sectionId",
      method: "delete",
      handler: "deleteProductSection",
      requiresAuth: true,
      permission: Permission.MANAGE_QUARANTINE,
    },
    {
      path: "/:cuttingListId/sections",
      method: "post",
      handler: "addProductSection",
      requiresAuth: false,
    }, // TODO: Re-enable auth after testing

    // Generic /:id routes LAST
    {
      path: "/:id",
      method: "get",
      handler: "getCuttingListById",
      requiresAuth: true,
      permission: Permission.VIEW_CUTTING_PLANS,
    },
    {
      path: "/:id",
      method: "put",
      handler: "updateCuttingList",
      requiresAuth: true,
      permission: Permission.START_OPTIMIZATION,
    },
    {
      path: "/:id",
      method: "delete",
      handler: "deleteCuttingList",
      requiresAuth: true,
      permission: Permission.MANAGE_QUARANTINE,
    }, // ✅ RE-ENABLED: Allow cutting list deletion

    {
      path: "/export/pdf",
      method: "post",
      handler: "exportToPDF",
      requiresAuth: true,
      permission: Permission.EXPORT_REPORTS,
      rateLimit: "export",
    },
    {
      path: "/export/excel",
      method: "post",
      handler: "exportToExcel",
      requiresAuth: true,
      permission: Permission.EXPORT_REPORTS,
      rateLimit: "export",
    },

    {
      path: "/suggestions/variations",
      method: "get",
      handler: "getProfileVariations",
      requiresAuth: true,
    },
    {
      path: "/suggestions/profiles",
      method: "get",
      handler: "getProfileSuggestions",
      requiresAuth: true,
    },
    {
      path: "/suggestions/products",
      method: "get",
      handler: "searchSimilarProducts",
      requiresAuth: true,
    },
    {
      path: "/suggestions/sizes",
      method: "get",
      handler: "getSizesForProduct",
      requiresAuth: true,
    },
    {
      path: "/suggestions/stats",
      method: "get",
      handler: "getProfileSuggestionStats",
      requiresAuth: true,
    },

    {
      path: "/quantity/calculate",
      method: "post",
      handler: "calculateQuantity",
      requiresAuth: true,
      rateLimit: "optimization",
    },
    {
      path: "/quantity/suggestions",
      method: "post",
      handler: "getQuantitySuggestions",
      requiresAuth: true,
      rateLimit: "optimization",
    },
    {
      path: "/quantity/validate",
      method: "post",
      handler: "validateQuantity",
      requiresAuth: true,
    },
    {
      path: "/quantity/possibilities",
      method: "post",
      handler: "getPossibleQuantities",
      requiresAuth: true,
      rateLimit: "optimization",
    },

    {
      path: "/import/excel",
      method: "post",
      handler: "importExcelData",
      requiresAuth: true,
      permission: Permission.MANAGE_CONFIG,
    },

    {
      path: "/enterprise/profiles",
      method: "get",
      handler: "getEnterpriseProfileSuggestions",
      requiresAuth: true,
    },
    {
      path: "/enterprise/measurements",
      method: "get",
      handler: "getSmartMeasurementSuggestions",
      requiresAuth: true,
    },
    {
      path: "/enterprise/stats",
      method: "get",
      handler: "getEnterpriseSuggestionStats",
      requiresAuth: true,
    },
    {
      path: "/enterprise/refresh",
      method: "post",
      handler: "refreshEnterpriseAnalysis",
      requiresAuth: true,
      permission: Permission.MANAGE_CONFIG,
    },
    {
      path: "/enterprise/product-sizes",
      method: "get",
      handler: "getProductSizes",
      requiresAuth: true,
    },
    {
      path: "/enterprise/complete-profile-set",
      method: "get",
      handler: "getCompleteProfileSet",
      requiresAuth: true,
    },

    {
      path: "/smart/products",
      method: "get",
      handler: getSmartProductSuggestions,
      requiresAuth: true,
    },
    {
      path: "/smart/sizes",
      method: "get",
      handler: getSmartSizeSuggestions,
      requiresAuth: true,
    },
    {
      path: "/smart/profiles",
      method: "get",
      handler: getSmartProfileSuggestions,
      requiresAuth: true,
    },
    {
      path: "/smart/autocomplete",
      method: "get",
      handler: getAutoCompleteSuggestions,
      requiresAuth: true,
    },
    {
      path: "/smart/stats",
      method: "get",
      handler: getSmartSuggestionStats,
      requiresAuth: true,
    },
    {
      path: "/smart/reload",
      method: "post",
      handler: reloadSmartSuggestionDatabase,
      requiresAuth: true,
      permission: Permission.MANAGE_CONFIG,
    },
    {
      path: "/smart/suggestions",
      method: "get",
      handler: getSmartWorkOrderSuggestions,
      requiresAuth: true,
    },
    {
      path: "/smart/insights",
      method: "post",
      handler: getSmartWorkOrderInsights,
      requiresAuth: true,
      rateLimit: "optimization",
    },
    {
      path: "/smart/apply-profile-set",
      method: "post",
      handler: applySmartProfileSet,
      requiresAuth: true,
      permission: Permission.START_OPTIMIZATION,
    },
    {
      path: "/smart/templates",
      method: "get",
      handler: getWorkOrderTemplates,
      requiresAuth: true,
    },
    {
      path: "/smart/duplicate",
      method: "post",
      handler: duplicateWorkOrder,
      requiresAuth: true,
      permission: Permission.START_OPTIMIZATION,
    },

    {
      path: "/profiles/suggestions",
      method: "get",
      handler: getSmartProfileSuggestions,
      requiresAuth: true,
      middleware: [queryNormalizer],
    },
    {
      path: "/smart-suggestions/sizes",
      method: "get",
      handler: getAvailableSizes,
      requiresAuth: true,
    },
    {
      path: "/smart-suggestions/combinations",
      method: "get",
      handler: getProfileCombinations,
      requiresAuth: true,
    },
  ];

  constructor(private readonly controller: CuttingListController) {}

  public create(): Router {
    const router = Router();
    const cache = new BoundMethodCache(this.controller);
    const registry = new RouteRegistry(router, cache);

    logger.info("[CuttingListRoutes] Registering routes", {
      count: this.routes.length,
    });
    this.routes.forEach((route) => {
      logger.debug("[CuttingListRoutes] Route registered", {
        method: route.method.toUpperCase(),
        path: route.path,
        handler: typeof route.handler === "string" ? route.handler : "function",
      });
    });

    registry.registerBatch(this.routes);
    router.use(cuttingListErrorHandler);

    return registry.build();
  }
}

const createRouter = (): Router => {
  try {
    const controller = getCuttingListController();
    const factory = new CuttingListRouterFactory(controller);
    return factory.create();
  } catch (error: unknown) {
    const err = error as Error;
    logger.error("Failed to initialize CuttingListController", {
      error: err.message,
      stack: err.stack,
    });

    const router = Router();
    router.use((req: Request, res: Response) => {
      res.status(500).json({
        success: false,
        error: "Cutting list controller initialization failed",
        message: err.message || "Unknown error",
        timestamp: new Date().toISOString(),
      });
    });

    return router;
  }
};

export default createRouter();
