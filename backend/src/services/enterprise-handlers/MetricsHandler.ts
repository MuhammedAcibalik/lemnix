/**
 * Metrics Handler - Type-safe analytics & metrics
 */

import { Request, Response } from "express";
import { BaseHandler } from "../enterprise-core/BaseHandler";
import type { IMetricsOperations } from "../enterprise-core/IHandler";
import { EnterpriseMonitoringService } from "../monitoring/enterpriseMonitoringService";

interface OptimizationMetric {
  algorithm: string;
  itemCount: number;
  efficiency: number;
  executionTime: number;
  waste: number;
  success: boolean;
}

interface SystemMetric {
  cpu?: { usage: number };
  memory?: { usage: number };
  disk?: { usage: number };
  application?: { averageResponseTime: number };
}

export class MetricsHandler extends BaseHandler implements IMetricsOperations {
  constructor(private readonly monitoringService: EnterpriseMonitoringService) {
    super();
  }

  public async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      const limit = this.parseLimit(req.query["limit"]);

      this.sendSuccess(res, {
        systemMetrics: this.monitoringService.getSystemMetrics(limit),
        optimizationMetrics:
          this.monitoringService.getOptimizationMetrics(limit),
        activeAlerts: this.monitoringService.getActiveAlerts(),
        slaResults: this.monitoringService.getSLAResults(),
      });
    } catch (error) {
      this.handleError(res, error, "METRICS_ERROR");
    }
  }

  public async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const timeRange = this.parseStringQuery(req.query["timeRange"]) || "day";
      const algorithm = this.parseStringQuery(req.query["algorithm"]);

      const optMetrics = this.monitoringService.getOptimizationMetrics(
        100,
      ) as OptimizationMetric[];
      const sysMetrics = this.monitoringService.getSystemMetrics(
        10,
      ) as SystemMetric[];

      const analytics = this.calculateAnalytics(
        optMetrics,
        sysMetrics,
        timeRange,
        algorithm,
      );

      this.sendSuccess(res, analytics);
    } catch (error) {
      this.handleError(res, error, "ANALYTICS_ERROR");
    }
  }

  public async analyzePerformance(req: Request, res: Response): Promise<void> {
    try {
      const algorithm = this.parseStringQuery(req.query["algorithm"]);
      const itemCount = this.parseNumberQuery(req.query["itemCount"]);

      let metrics = this.monitoringService.getOptimizationMetrics(
        1000,
      ) as OptimizationMetric[];

      if (algorithm) {
        metrics = metrics.filter((m) => m.algorithm === algorithm);
      }

      if (itemCount !== undefined) {
        metrics = metrics.filter(
          (m) =>
            m.itemCount >= itemCount * 0.9 && m.itemCount <= itemCount * 1.1,
        );
      }

      this.sendSuccess(res, {
        statistics: this.calculateStats(metrics),
        metrics: metrics.slice(-100),
      });
    } catch (error) {
      this.handleError(res, error, "ANALYSIS_ERROR");
    }
  }

  public async getOptimizationHistory(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const limit = this.parseLimit(req.query["limit"]) || 50;
      const history: unknown[] = []; // Real data source integration needed

      this.sendSuccess(res, {
        optimizations: history,
        total: history.length,
        hasMore: history.length === limit,
      });
    } catch (error) {
      this.handleError(res, error, "HISTORY_FAILED");
    }
  }

  private calculateAnalytics(
    optMetrics: OptimizationMetric[],
    _sysMetrics: SystemMetric[],
    timeRange: string,
    algorithm?: string,
  ): Record<string, unknown> {
    if (optMetrics.length === 0) {
      return {
        timeRange,
        metrics: {},
        algorithm: algorithm || "N/A",
        generatedAt: new Date().toISOString(),
      };
    }

    const filtered = algorithm
      ? optMetrics.filter((m) => m.algorithm === algorithm)
      : optMetrics;
    const current = filtered[filtered.length - 1];
    const avg = (key: keyof OptimizationMetric): number =>
      filtered.reduce((s, m) => s + (Number(m[key]) || 0), 0) /
      (filtered.length || 1);

    return {
      timeRange,
      metrics: {
        efficiency: {
          current: current?.efficiency || 0,
          average: avg("efficiency"),
          trend: "stable" as const,
        },
        cost: {
          current: current?.executionTime || 0,
          average: avg("executionTime"),
          trend: "stable" as const,
        },
        waste: {
          current: current?.waste || 0,
          average: avg("waste"),
          trend: "stable" as const,
        },
      },
      algorithm: algorithm || "N/A",
      generatedAt: new Date().toISOString(),
    };
  }

  private calculateStats(
    metrics: OptimizationMetric[],
  ): Record<string, number> {
    if (metrics.length === 0) {
      return {
        averageExecutionTime: 0,
        averageEfficiency: 0,
        successRate: 0,
        totalOptimizations: 0,
      };
    }

    const successful = metrics.filter((m) => m.success);
    return {
      averageExecutionTime:
        metrics.reduce((s, m) => s + m.executionTime, 0) / metrics.length,
      averageEfficiency:
        successful.reduce((s, m) => s + m.efficiency, 0) /
        (successful.length || 1),
      successRate: (successful.length / metrics.length) * 100,
      totalOptimizations: metrics.length,
    };
  }

  private parseLimit(value: unknown): number {
    const parsed = typeof value === "string" ? parseInt(value, 10) : undefined;
    return parsed && !isNaN(parsed) ? parsed : 100;
  }

  private parseStringQuery(value: unknown): string | undefined {
    return typeof value === "string" ? value : undefined;
  }

  private parseNumberQuery(value: unknown): number | undefined {
    const parsed = typeof value === "string" ? parseInt(value, 10) : undefined;
    return parsed && !isNaN(parsed) ? parsed : undefined;
  }
}
