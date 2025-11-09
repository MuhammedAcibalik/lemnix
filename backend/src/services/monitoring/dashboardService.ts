/**
 * @fileoverview Dashboard Service - Real Data Aggregation
 * @module DashboardService
 * @version 1.0.0 - Real Database Queries
 */

import { PrismaClient } from "@prisma/client";
import { logger } from "../logger";

const prisma = new PrismaClient();

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface DashboardMetrics {
  readonly totalCuttingLists: number;
  readonly totalWorkOrders: number;
  readonly totalProfiles: number;
  readonly completedWorkOrders: number;
  readonly pendingWorkOrders: number;
  readonly averageEfficiency: number;
  readonly totalWasteReduction: number;
  readonly optimizationSuccessRate: number;
  readonly activeUsers: number;
  readonly systemUptime: number;
}

export interface AlgorithmPerformance {
  readonly algorithm: string;
  readonly count: number;
  readonly averageEfficiency: number;
  readonly averageWaste: number;
  readonly averageTime: number;
}

export interface WasteReductionTrend {
  readonly date: string;
  readonly wasteReduction: number;
  readonly costSavings: number;
}

export interface RecentActivity {
  readonly id: string;
  readonly type: "cutting_list" | "optimization" | "work_order";
  readonly title: string;
  readonly date: string;
  readonly status: "completed" | "pending" | "failed";
  readonly metadata?: {
    readonly itemCount?: number;
    readonly algorithm?: string;
    readonly efficiency?: number;
  };
}

export interface ProfileUsageStats {
  readonly profileType: string;
  readonly usageCount: number;
  readonly totalLength: number;
  readonly averageQuantity: number;
}

export interface SystemHealth {
  readonly status: "healthy" | "degraded" | "unhealthy";
  readonly uptime: number;
  readonly cpu: {
    readonly usage: number;
    readonly loadAverage: readonly [number, number, number];
  };
  readonly memory: {
    readonly used: number;
    readonly total: number;
    readonly percentage: number;
  };
  readonly database: {
    readonly connected: boolean;
    readonly responseTime: number;
  };
  readonly lastCheck: string;
}

// ============================================================================
// DASHBOARD SERVICE CLASS
// ============================================================================

export class DashboardService {
  /**
   * Get comprehensive dashboard metrics from real database
   */
  public async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Parallel execution for performance
      const [
        totalCuttingLists,
        workOrderStats,
        profileCount,
        optimizationStats,
        activeUsers,
      ]: [
        number,
        Array<{ status: string; _count: number }>,
        Array<{ profileType: string }>,
        {
          _avg: {
            averageEfficiency: number | null;
            wasteReductionPercent: number | null;
            successRate: number | null;
          };
          _count: number;
        },
        number,
      ] = await Promise.all([
        // Total cutting lists (not archived)
        prisma.cuttingList.count({
          where: { status: { not: "ARCHIVED" } },
        }),

        // Work orders by status - check if model exists
        typeof prisma.workOrder !== 'undefined' 
          ? prisma.workOrder.groupBy({
              by: ["status"],
              _count: true,
            })
          : Promise.resolve([]),

        // Distinct profile types
        prisma.cuttingListItem.findMany({
          distinct: ["profileType"],
          select: { profileType: true },
        }),

        // Optimization statistics (last 30 days)
        prisma.optimizationStatistics.aggregate({
          _avg: {
            averageEfficiency: true,
            wasteReductionPercent: true,
            successRate: true,
          },
          _count: true,
          where: { createdAt: { gte: thirtyDaysAgo } },
        }),

        // Active users (logged in last 30 days)
        prisma.user.count({
          where: {
            isActive: true,
            lastLogin: { gte: thirtyDaysAgo },
          },
        }),
      ]);

      // Calculate work order counts
      const completedWorkOrders =
        workOrderStats.find((s) => s.status === "completed")?._count ?? 0;
      const pendingWorkOrders = workOrderStats
        .filter((s) => s.status === "pending" || s.status === "in_progress")
        .reduce((sum, s) => sum + s._count, 0);
      const totalWorkOrders = workOrderStats.reduce(
        (sum, s) => sum + s._count,
        0,
      );

      // Calculate system uptime (process uptime in seconds)
      const systemUptime = Math.floor(process.uptime());

      return {
        totalCuttingLists,
        totalWorkOrders,
        totalProfiles: profileCount.length,
        completedWorkOrders,
        pendingWorkOrders,
        averageEfficiency: optimizationStats._avg.averageEfficiency ?? 0,
        totalWasteReduction: optimizationStats._avg.wasteReductionPercent ?? 0,
        optimizationSuccessRate: optimizationStats._avg.successRate ?? 0,
        activeUsers,
        systemUptime,
      };
    } catch (error) {
      logger.error("[DashboardService] Failed to get dashboard metrics", {
        error,
      });
      throw error;
    }
  }

  /**
   * Get algorithm performance from OptimizationStatistics
   * Fallback to Optimization.result JSON parsing if needed
   */
  public async getAlgorithmPerformance(): Promise<
    ReadonlyArray<AlgorithmPerformance>
  > {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Try OptimizationStatistics first (preferred)
      const statsFromTable = await prisma.optimizationStatistics.groupBy({
        by: ["algorithm"],
        _count: true,
        _avg: {
          averageEfficiency: true,
          wasteReductionPercent: true,
          executionTimeMs: true,
        },
        where: { createdAt: { gte: thirtyDaysAgo } },
      });

      if (statsFromTable.length > 0) {
        return statsFromTable.map((stat) => ({
          algorithm: stat.algorithm,
          count: stat._count,
          averageEfficiency: stat._avg.averageEfficiency ?? 0,
          averageWaste: 100 - (stat._avg.wasteReductionPercent ?? 0),
          averageTime: stat._avg.executionTimeMs ?? 0,
        }));
      }

      // Fallback: Parse from Optimization.result JSON
      logger.warn(
        "[DashboardService] No OptimizationStatistics found, falling back to Optimization.result",
      );

      // Filter optimizations with non-null results at query level
      const optimizations = await prisma.optimization.findMany({
        where: {
          status: "completed",
          createdAt: { gte: thirtyDaysAgo },
        },
        select: {
          algorithm: true,
          result: true,
          executionTime: true,
        },
      });

      // Group by algorithm and calculate averages
      const algorithmMap = new Map<
        string,
        {
          count: number;
          totalEfficiency: number;
          totalWaste: number;
          totalTime: number;
        }
      >();

      for (const opt of optimizations) {
        // Type guard: result should be object with known structure
        if (!opt.result || typeof opt.result !== "object") continue;

        const result = opt.result as Record<string, unknown>;
        const efficiency =
          typeof result.efficiency === "number"
            ? result.efficiency
            : typeof result.utilizationRate === "number"
              ? result.utilizationRate
              : 0;
        const waste =
          typeof result.wastePercentage === "number"
            ? result.wastePercentage
            : 100 - efficiency;
        const time = opt.executionTime ?? 0;

        const current = algorithmMap.get(opt.algorithm) ?? {
          count: 0,
          totalEfficiency: 0,
          totalWaste: 0,
          totalTime: 0,
        };

        algorithmMap.set(opt.algorithm, {
          count: current.count + 1,
          totalEfficiency: current.totalEfficiency + efficiency,
          totalWaste: current.totalWaste + waste,
          totalTime: current.totalTime + time,
        });
      }

      const results: AlgorithmPerformance[] = [];
      for (const [algorithm, stats] of algorithmMap.entries()) {
        results.push({
          algorithm,
          count: stats.count,
          averageEfficiency: stats.totalEfficiency / stats.count,
          averageWaste: stats.totalWaste / stats.count,
          averageTime: stats.totalTime / stats.count,
        });
      }

      return results;
    } catch (error) {
      logger.error("[DashboardService] Failed to get algorithm performance", {
        error,
      });
      return [];
    }
  }

  /**
   * Get waste reduction trend (daily aggregation for last N days)
   */
  public async getWasteReductionTrend(
    days: number = 30,
  ): Promise<ReadonlyArray<WasteReductionTrend>> {
    try {
      // Use raw SQL for daily aggregation
      const results = await prisma.$queryRaw<
        Array<{
          date: Date;
          waste_reduction: number;
          optimization_count: number;
        }>
      >`
        SELECT 
          DATE(created_at) as date,
          AVG(waste_reduction_percent) as waste_reduction,
          COUNT(*) as optimization_count
        FROM optimization_statistics
        WHERE created_at >= NOW() - INTERVAL '${days} days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `;

      return results.map((row) => ({
        date: row.date.toISOString().split("T")[0],
        wasteReduction: Number(row.waste_reduction),
        costSavings:
          Number(row.waste_reduction) * Number(row.optimization_count) * 10, // Estimated
      }));
    } catch (error) {
      logger.error("[DashboardService] Failed to get waste reduction trend", {
        error,
      });
      return [];
    }
  }

  /**
   * Get recent activities from UserActivity table
   */
  public async getRecentActivities(
    limit: number = 10,
  ): Promise<ReadonlyArray<RecentActivity>> {
    try {
      const activities = await prisma.userActivity.findMany({
        where: {
          activityType: {
            in: [
              "cutting_list_created",
              "optimization_run",
              "cutting_list_updated",
              "work_order_completed",
            ],
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      return activities.map((activity) => this.transformActivity(activity));
    } catch (error) {
      logger.error("[DashboardService] Failed to get recent activities", {
        error,
      });
      return [];
    }
  }

  /**
   * Parse activity data with type safety
   */
  private parseActivityData(data: unknown): {
    status?: string;
    error?: unknown;
    itemCount?: number;
    itemsLength?: number;
    algorithm?: string;
    efficiency?: number;
    utilizationRate?: number;
  } {
    if (!data || typeof data !== "object") {
      return {};
    }

    const record = data as Record<string, unknown>;

    return {
      status: typeof record.status === "string" ? record.status : undefined,
      error: record.error,
      itemCount:
        typeof record.itemCount === "number" ? record.itemCount : undefined,
      itemsLength: Array.isArray(record.items)
        ? record.items.length
        : undefined,
      algorithm:
        typeof record.algorithm === "string" ? record.algorithm : undefined,
      efficiency:
        typeof record.efficiency === "number" ? record.efficiency : undefined,
      utilizationRate:
        typeof record.utilizationRate === "number"
          ? record.utilizationRate
          : undefined,
    };
  }

  /**
   * Transform UserActivity to RecentActivity format
   */
  private transformActivity(activity: {
    id: string;
    activityType: string;
    activityData: unknown;
    createdAt: Date;
    user?: { name?: string | null; email?: string | null } | null;
  }): RecentActivity {
    // Type guard for activity data
    const data = this.parseActivityData(activity.activityData);

    // Determine type
    let type: "cutting_list" | "optimization" | "work_order" = "cutting_list";
    if (activity.activityType.includes("optimization")) {
      type = "optimization";
    } else if (activity.activityType.includes("work_order")) {
      type = "work_order";
    }

    // Generate title
    let title = "Aktivite";
    switch (activity.activityType) {
      case "cutting_list_created":
        title = `${activity.user?.name ?? "Kullanıcı"} yeni kesim listesi oluşturdu`;
        break;
      case "cutting_list_updated":
        title = `${activity.user?.name ?? "Kullanıcı"} kesim listesini güncelledi`;
        break;
      case "optimization_run":
        title = `${activity.user?.name ?? "Kullanıcı"} optimizasyon çalıştırdı`;
        break;
      case "work_order_completed":
        title = `İş emri tamamlandı`;
        break;
    }

    // Determine status
    let status: "completed" | "pending" | "failed" = "completed";
    if (data.status === "pending" || data.status === "running") {
      status = "pending";
    } else if (data.status === "failed" || data.error) {
      status = "failed";
    }

    // Extract metadata
    const metadata: RecentActivity["metadata"] = {
      itemCount: data.itemCount ?? data.itemsLength,
      algorithm: data.algorithm,
      efficiency: data.efficiency ?? data.utilizationRate,
    };

    return {
      id: activity.id,
      type,
      title,
      date: activity.createdAt.toISOString(),
      status,
      metadata,
    };
  }

  /**
   * Get profile usage statistics (hybrid approach)
   * Combines ProfileUsageStatistics with recent CuttingListItem delta
   */
  public async getProfileUsageStats(
    limit: number = 10,
  ): Promise<ReadonlyArray<ProfileUsageStats>> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Get base stats from ProfileUsageStatistics
      const profileStats = await prisma.profileUsageStatistics.findMany({
        orderBy: { totalUsageCount: "desc" },
        take: limit * 2, // Get more to account for recent changes
      });

      // Get recent usage delta
      const recentUsage = await prisma.cuttingListItem.groupBy({
        by: ["profileType"],
        _sum: {
          quantity: true,
          length: true,
        },
        _count: true,
        where: { createdAt: { gte: sevenDaysAgo } },
      });

      // Create map of recent usage
      const recentMap = new Map(
        recentUsage.map((item) => [
          item.profileType,
          {
            count: item._count,
            totalQuantity: item._sum.quantity ?? 0,
            totalLength: (item._sum.quantity ?? 0) * (item._sum.length ?? 0),
          },
        ]),
      );

      // Merge and recalculate
      const mergedStats = profileStats.map((stat) => {
        const recent = recentMap.get(stat.profileType);
        const usageCount = stat.totalUsageCount + (recent?.count ?? 0);
        const totalQuantity = stat.totalQuantity + (recent?.totalQuantity ?? 0);
        const totalLength = stat.measurement * totalQuantity;

        return {
          profileType: stat.profileType,
          usageCount,
          totalLength,
          averageQuantity: totalQuantity / Math.max(usageCount, 1),
        };
      });

      // Sort by usage count and return top N
      return mergedStats
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, limit);
    } catch (error) {
      logger.error("[DashboardService] Failed to get profile usage stats", {
        error,
      });
      return [];
    }
  }

  /**
   * Get real system health metrics
   */
  public async getSystemHealth(): Promise<SystemHealth> {
    try {
      const startTime = Date.now();

      // Test database connection with simple query
      await prisma.$queryRaw`SELECT 1`;
      const dbResponseTime = Date.now() - startTime;

      // Get memory usage
      const memUsage = process.memoryUsage();
      const totalMemory = memUsage.heapTotal;
      const usedMemory = memUsage.heapUsed;
      const memPercentage = (usedMemory / totalMemory) * 100;

      // Get CPU load average (Node.js specific)
      const loadAverage = process.cpuUsage();
      const cpuUsage = (loadAverage.user + loadAverage.system) / 1000000; // Convert to seconds

      // Determine overall status
      let status: "healthy" | "degraded" | "unhealthy" = "healthy";
      if (dbResponseTime > 1000 || memPercentage > 90) {
        status = "degraded";
      }
      if (dbResponseTime > 5000 || memPercentage > 95) {
        status = "unhealthy";
      }

      return {
        status,
        uptime: Math.floor(process.uptime()),
        cpu: {
          usage: cpuUsage,
          loadAverage: [cpuUsage, cpuUsage, cpuUsage] as [
            number,
            number,
            number,
          ],
        },
        memory: {
          used: usedMemory,
          total: totalMemory,
          percentage: memPercentage,
        },
        database: {
          connected: true,
          responseTime: dbResponseTime,
        },
        lastCheck: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("[DashboardService] Failed to get system health", { error });

      return {
        status: "unhealthy",
        uptime: Math.floor(process.uptime()),
        cpu: { usage: 0, loadAverage: [0, 0, 0] },
        memory: { used: 0, total: 0, percentage: 0 },
        database: { connected: false, responseTime: -1 },
        lastCheck: new Date().toISOString(),
      };
    }
  }
}

// Export singleton instance
export const dashboardService = new DashboardService();
