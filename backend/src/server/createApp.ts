import express, { Express, Request, Response } from "express";
import compression from "compression";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { Server as SocketIOServer } from "socket.io";
import * as fs from "fs";
import * as path from "path";
import {
  correlationIdMiddleware,
  requestTimingMiddleware,
} from "../middleware/correlationId";
import {
  auditMiddleware,
  auditSecurityMiddleware,
} from "../middleware/auditMiddleware";
import {
  decryptDataMiddleware,
  encryptDataMiddleware,
} from "../middleware/encryptionMiddleware";
import { etagMiddleware } from "../middleware/caching";
import { createErrorHandler } from "../middleware/errorHandler";
import { logger } from "../services/logger";
import enterpriseOptimizationRoutes from "../routes/enterpriseOptimizationRoutes";
import cuttingListRoutes from "../routes/cuttingListRoutes";
import errorMetricsRoutes from "../routes/errorMetricsRoutes";
import statisticsRoutes from "../routes/statisticsRoutes";
import metricsRoutes from "../routes/metricsRoutes";
import healthRoutes from "../routes/healthRoutes";
import suggestionRoutes from "../routes/suggestionRoutes";
import dashboardRoutes from "../routes/dashboardRoutes";
import productionPlanRoutes from "../routes/productionPlanRoutes";
import { materialProfileMappingRoutes } from "../routes/materialProfileMappingRoutes";
import { createProgressiveRoutes } from "../routes/progressiveRoutes";
import profileManagementRoutes from "../routes/profileManagementRoutes";
import productCategoryRoutes from "../routes/productCategoryRoutes";
import { env, isDevelopment } from "../config/env";
import { loggerMiddleware } from "./requestLogger";
import {
  prometheusMiddleware,
  prometheusMetricsHandler,
} from "../monitoring/prometheus";

/**
 * Get request size limit based on endpoint type
 */
function getRequestSizeLimit(endpointType: string): string {
  const limits: Record<string, string> = {
    default: "10mb",
    optimization: "50mb", // Large optimization requests
    export: "100mb", // Large export requests
    upload: "50mb", // File uploads
  };

  return limits[endpointType] || limits.default;
}

interface CreateAppOptions {
  io: SocketIOServer;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  service: string;
  version: string;
  environment: string;
  uptime: number;
}

interface ApiErrorBody {
  message: string;
  code: string;
  details?: unknown;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiErrorBody;
}

const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      fontSrc: ["'self'", "https:", "data:"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      objectSrc: ["'none'"],
      scriptSrc: ["'self'"],
      scriptSrcAttr: ["'none'"],
      styleSrc: ["'self'", "https:", "'unsafe-inline'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: { policy: "same-origin" as const },
  crossOriginResourcePolicy: { policy: "same-origin" as const },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" as const },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" as const },
  referrerPolicy: { policy: "no-referrer" as const },
  xssFilter: true,
};

// Get allowed origins from environment or use defaults
const getAllowedOrigins = (): string[] => {
  if (env.CORS_ORIGINS && env.CORS_ORIGINS.length > 0) {
    return env.CORS_ORIGINS;
  }

  // Default origins (development + production)
  const defaults = [
    env.FRONTEND_URL,
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:3001",
  ];

  // Add production URLs if in production
  if (env.NODE_ENV === "production") {
    defaults.push("https://www.lemnix.com", "https://lemnix.com");
  }

  return defaults;
};

const allowedOrigins = getAllowedOrigins();

const corsConfig = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    logger.warn("CORS blocked origin", { origin, allowedOrigins });
    callback(new Error("Not allowed by CORS"), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "X-API-Key",
    "X-Client-Version",
    "X-Request-ID",
  ],
  exposedHeaders: ["X-Request-ID", "X-Response-Time", "X-Rate-Limit-Remaining"],
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

export function createApp({ io }: CreateAppOptions): Express {
  const app = express();

  if (env.ENABLE_HELMET) {
    app.use(helmet(helmetConfig));
  }

  if (env.ENABLE_CORS) {
    app.use(cors(corsConfig));
  }

  // Compression with brotli support (if available)
  app.use(
    compression({
      filter: (req, res) => {
        if (req.headers["x-no-compression"]) {
          return false;
        }
        return compression.filter(req, res);
      },
      level: 6, // Compression level (0-9)
      threshold: 1024, // Only compress responses > 1KB
    }),
  );
  app.use(correlationIdMiddleware);
  app.use(requestTimingMiddleware);
  app.use(auditMiddleware);
  app.use(auditSecurityMiddleware);
  app.use(encryptDataMiddleware);
  app.use(decryptDataMiddleware);
  app.use(etagMiddleware);

  app.use(
    morgan("combined", {
      skip: (req) => req.path === "/health" || req.path === "/readyz",
    }),
  );

  // Dynamic request size limits based on endpoint
  // Default: 10MB, but can be overridden per route
  app.use(express.json({ limit: getRequestSizeLimit("default") }));
  app.use(
    express.urlencoded({
      extended: true,
      limit: getRequestSizeLimit("default"),
    }),
  );

  app.use(loggerMiddleware);

  // Prometheus metrics middleware
  app.use(prometheusMiddleware);

  // Prometheus metrics endpoint
  app.get("/metrics", prometheusMetricsHandler);

  registerHealthEndpoints(app);
  registerRoutes(app, io);
  registerRootEndpoint(app);
  registerNotFoundHandler(app);
  registerErrorHandler(app);

  return app;
}

function registerHealthEndpoints(app: Express): void {
  // Liveness probe - simple health check
  app.get("/health", (_req: Request, res: Response<HealthResponse>) => {
    res.status(200).json({
      status: "OK",
      timestamp: new Date().toISOString(),
      service: "LEMNİX Backend API",
      version: "1.0.0",
      environment: env.NODE_ENV,
      uptime: process.uptime(),
    });
  });

  // Readiness probe - checks if service is ready to accept traffic
  app.get("/readyz", async (_req: Request, res: Response) => {
    try {
      // Check database connection
      const { databaseManager } = await import("../config/database.js");
      const dbHealthy = await databaseManager.healthCheck();

      if (!dbHealthy) {
        res.status(503).json({
          status: "NOT_READY",
          reason: "Database connection failed",
        });
        return;
      }

      // Check uploads directory (if needed)
      const uploadsDir = path.join(process.cwd(), "..", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        // Try to create it
        try {
          fs.mkdirSync(uploadsDir, { recursive: true });
        } catch (error) {
          res.status(503).json({
            status: "NOT_READY",
            reason: "Uploads directory not accessible",
          });
          return;
        }
      }

      res.status(200).json({ status: "READY" });
    } catch (error) {
      logger.error("Readiness check failed", error as Error);
      res
        .status(503)
        .json({ status: "NOT_READY", reason: "System check failed" });
    }
  });
}

function registerRoutes(app: Express, io: SocketIOServer): void {
  app.use("/api/cutting-list", cuttingListRoutes);
  app.use("/api/enterprise", enterpriseOptimizationRoutes);
  app.use("/api/error-metrics", errorMetricsRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/statistics", statisticsRoutes);
  app.use("/api/metrics", metricsRoutes);
  app.use("/api/health", healthRoutes);
  app.use("/api/suggestions", suggestionRoutes);
  app.use("/api/production-plan", productionPlanRoutes);
  app.use("/api/production-plan", createProgressiveRoutes(io));
  app.use("/api/material-profile-mappings", materialProfileMappingRoutes);
  app.use("/api/profile-management", profileManagementRoutes);
  app.use("/api/product-categories", productCategoryRoutes);
}

function registerRootEndpoint(app: Express): void {
  app.get("/", (_req: Request, res: Response) => {
    res.json({
      message: "LEMNİX Alüminyum Kesim Optimizasyonu API",
      version: "1.0.0",
      environment: env.NODE_ENV,
      endpoints: {
        health: "/health",
        ready: "/readyz",
        cuttingList: "/api/cutting-list",
        enterprise: "/api/enterprise",
      },
    });
  });
}

function registerNotFoundHandler(app: Express): void {
  app.use("*", (_req: Request, res: Response<ApiResponse>) => {
    res.status(404).json({
      success: false,
      error: {
        message: "Endpoint not found",
        code: "NOT_FOUND",
      },
    });
  });
}

function registerErrorHandler(app: Express): void {
  const errorHandler = createErrorHandler({
    logger,
    enableStackTrace: isDevelopment,
    enableDetailedErrors: isDevelopment,
    maxErrorRate: 100,
  });

  app.use(errorHandler);
}
