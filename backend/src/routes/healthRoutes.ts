/**
 * Health Check Routes
 * Database and system health monitoring endpoints
 *
 * @module routes/healthRoutes
 * @version 2.0.0 - Enhanced with deep health checks
 */

import { Router, Request, Response } from "express";
import type { Router as ExpressRouter } from "express";
import { databaseManager, prisma } from "../config/database";
import { getDatabaseStats } from "../middleware/queryMonitoring";
import { cacheService } from "../services/cache/RedisCache";
import { queryPerformanceMonitor } from "../services/monitoring/QueryPerformanceMonitor";

const router: ExpressRouter = Router();

/**
 * GET /health/database
 * Database health check
 */
router.get("/database", async (_req: Request, res: Response) => {
  try {
    const isHealthy = await databaseManager.healthCheck();
    const stats = await getDatabaseStats();

    res.json({
      success: true,
      data: {
        healthy: isHealthy,
        database: "postgresql",
        version: "18.0",
        connections: stats.connections,
        cacheHitRatio: `${stats.cacheHitRatio.toFixed(2)}%`,
        status: isHealthy ? "connected" : "disconnected",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: "Database health check failed",
        code: "HEALTH_CHECK_FAILED",
      },
    });
  }
});

/**
 * GET /health/deep
 * Deep health check with write test
 */
router.get("/deep", async (_req: Request, res: Response) => {
  const checks = {
    database: false,
    write: false,
    read: false,
    cache: false,
  };

  try {
    // 1. Connection check
    checks.database = await databaseManager.healthCheck();

    // 2. Write test (INSERT + DELETE)
    const testId = `health-check-${Date.now()}`;
    await prisma.stockLength.create({
      data: {
        id: testId,
        length: 6000,
        isActive: false,
      },
    });
    checks.write = true;

    // 3. Read test
    const readTest = await prisma.stockLength.findUnique({
      where: { id: testId },
    });
    checks.read = readTest !== null;

    // 4. Cleanup
    await prisma.stockLength.delete({
      where: { id: testId },
    });

    // 5. Cache check
    const cacheStats = cacheService.getStats();
    checks.cache = true;

    const allHealthy = Object.values(checks).every((v) => v);

    res.status(allHealthy ? 200 : 503).json({
      success: allHealthy,
      data: {
        status: allHealthy ? "healthy" : "degraded",
        checks,
        cache: cacheStats,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      data: {
        status: "unhealthy",
        checks,
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
  }
});

/**
 * GET /health/system
 * System health overview
 */
router.get("/system", async (_req: Request, res: Response) => {
  try {
    const dbHealthy = await databaseManager.healthCheck();
    const stats = await getDatabaseStats();

    res.json({
      success: true,
      data: {
        status: "healthy",
        uptime: process.uptime(),
        memory: {
          used: process.memoryUsage().heapUsed / 1024 / 1024,
          total: process.memoryUsage().heapTotal / 1024 / 1024,
          unit: "MB",
        },
        database: {
          healthy: dbHealthy,
          connections: stats.connections,
          cacheHitRatio: stats.cacheHitRatio,
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: "System health check failed",
        code: "SYSTEM_HEALTH_FAILED",
      },
    });
  }
});

/**
 * GET /health/queries
 * Query performance metrics
 */
router.get("/queries", (_req: Request, res: Response) => {
  try {
    const stats = queryPerformanceMonitor.getStats();
    const slowQueries = queryPerformanceMonitor.getSlowQueries(20);
    const patterns = queryPerformanceMonitor.getQueryPatterns();

    // Convert Map to object for JSON serialization
    const topPatterns = Array.from(patterns.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([signature, data]) => ({ signature, ...data }));

    res.json({
      success: true,
      data: {
        performance: stats,
        slowQueries: slowQueries.map((q) => ({
          query: q.query.substring(0, 200),
          duration: q.duration,
          timestamp: new Date(q.timestamp).toISOString(),
        })),
        topPatterns,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to get query metrics",
        code: "QUERY_METRICS_FAILED",
      },
    });
  }
});

/**
 * GET /health/cache
 * Cache performance metrics
 */
router.get("/cache", (_req: Request, res: Response) => {
  try {
    const stats = cacheService.getStats();

    res.json({
      success: true,
      data: {
        cache: stats,
        recommendation:
          stats.hitRate < 50
            ? "Consider increasing TTL or cache size"
            : stats.hitRate > 80
              ? "Cache performing well"
              : "Cache performance is acceptable",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to get cache metrics",
        code: "CACHE_METRICS_FAILED",
      },
    });
  }
});

/**
 * GET /health/gpu
 * GPU status and capabilities check
 */
router.get("/gpu", async (_req: Request, res: Response) => {
  try {
    // In Node.js backend, WebGPU is not available
    // This endpoint provides information about GPU support in browser environment
    const isWebGPUSupported = false; // Always false in Node.js
    const gpuAvailable = false;
    const environment = "nodejs";

    res.json({
      success: true,
      data: {
        available: gpuAvailable,
        webGPUSupported: isWebGPUSupported,
        environment,
        gpu: {
          message: "GPU detection is handled by frontend browser environment",
          backendSupport: false,
        },
        recommendation:
          "GPU acceleration is handled by frontend WebGPU API. Backend provides CPU fallback for optimization algorithms.",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: "GPU status check failed",
        code: "GPU_STATUS_FAILED",
      },
    });
  }
});

export default router;
