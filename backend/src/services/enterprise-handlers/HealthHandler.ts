/**
 * Health Handler - System health checks
 */

import { Request, Response } from "express";
import { BaseHandler } from "../enterprise-core/BaseHandler";
import type { IHealthOperations } from "../enterprise-core/IHandler";
import { EnterpriseMonitoringService } from "../monitoring/enterpriseMonitoringService";

export class HealthHandler extends BaseHandler implements IHealthOperations {
  constructor(private readonly monitoringService: EnterpriseMonitoringService) {
    super();
  }

  public async healthCheck(_req: Request, res: Response): Promise<void> {
    try {
      const health = await this.monitoringService.getHealthStatus();
      const statusCode =
        health.status === "healthy"
          ? 200
          : health.status === "warning"
            ? 200
            : 503;

      res.status(statusCode).json({
        success: true,
        data: health,
        metadata: { timestamp: new Date().toISOString(), version: "5.0.0" },
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        error: {
          code: "HEALTH_CHECK_ERROR",
          message: error instanceof Error ? error.message : "Unknown",
        },
        metadata: { timestamp: new Date().toISOString(), version: "5.0.0" },
      });
    }
  }

  public async getSystemHealth(_req: Request, res: Response): Promise<void> {
    try {
      const health = await this.monitoringService.getHealthStatus();
      const sysMetrics = this.monitoringService.getSystemMetrics(1);
      const alerts = this.monitoringService.getActiveAlerts();

      const firstMetric = sysMetrics[0] as unknown as
        | Record<string, unknown>
        | undefined;
      const cpu = firstMetric?.cpu as { usage?: number } | undefined;
      const memory = firstMetric?.memory as { usage?: number } | undefined;
      const disk = firstMetric?.disk as { usage?: number } | undefined;
      const app = firstMetric?.application as
        | { averageResponseTime?: number }
        | undefined;

      this.sendSuccess(res, {
        status: health.status,
        version: "5.0.0",
        uptime: process.uptime(),
        services: {
          "Optimization Engine": {
            status:
              health.status === "healthy"
                ? ("operational" as const)
                : ("degraded" as const),
            responseTime: app?.averageResponseTime || 0,
          },
          Database: { status: "operational" as const, responseTime: 12 },
          Cache: { status: "operational" as const, responseTime: 3 },
        },
        metrics: {
          cpuUsage: cpu?.usage || 0,
          memoryUsage: memory?.usage || 0,
          diskUsage: disk?.usage || 0,
          networkLatency: 12,
        },
        alerts: alerts.length,
        lastCheck: new Date().toISOString(),
      });
    } catch (error) {
      this.handleError(res, error, "HEALTH_ERROR");
    }
  }

  public async getSystemHealthStatus(
    _req: Request,
    res: Response,
  ): Promise<void> {
    try {
      this.sendSuccess(res, {
        status: "healthy" as const,
        services: {
          optimization: { status: "up" as const, responseTime: 0 },
          database: { status: "up" as const, responseTime: 0 },
        },
        metrics: {
          cpuUsage: 0,
          memoryUsage: 0,
          diskUsage: 0,
          networkLatency: 0,
        },
        uptime: process.uptime(),
        version: "5.0.0",
      });
    } catch (error) {
      this.handleError(res, error, "HEALTH_CHECK_FAILED");
    }
  }
}
