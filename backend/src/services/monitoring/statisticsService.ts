/**
 * @fileoverview Statistics Service - Advanced Analytics & Metrics
 * @module StatisticsService
 * @version 1.0.0 - Enterprise Analytics Engine
 */

import { prisma } from "../../config/database";
import { logger } from "../logger";

// Type definitions for cutting list data
interface CuttingListItem {
  id: string;
  workOrderId: string;
  date: string;
  version: string;
  color: string;
  size: string;
  profileType: string;
  measurement: string;
  quantity: number;
  orderQuantity: number;
}
import { Prisma } from "@prisma/client";

interface CuttingListData {
  readonly title: string;
  readonly weekNumber: number;
  readonly sections?: readonly CuttingListSection[];
}

interface CuttingListSection {
  readonly productName: string;
  readonly items?: readonly CuttingListItem[];
}

interface ProfileItem {
  readonly profile: string;
  readonly measurement: string;
  readonly quantity: number;
}

export interface StatisticsOverview {
  totalCuttingLists: number;
  totalWorkOrders: number;
  totalProfiles: number;
  totalProductSections: number;
  completedWorkOrders: number;
  pendingWorkOrders: number;
  mostUsedColor: string;
  mostUsedSize: string;
  // Legacy fields for compatibility
  averageEfficiency: number;
  totalWasteReduction: number;
  optimizationSuccessRate: number;
  activeUsers: number;
  systemUptime: number;
}

export interface PerformanceMetrics {
  wastePercentage: number;
  efficiencyScore: number;
  optimizationCount: number;
  averageProcessingTime: number;
  successRate: number;
}

export interface UsageAnalytics {
  profileUsageCounts: Array<{
    profileType: string;
    profileName: string;
    measurement: number;
    usageCount: number;
    popularityScore: number;
  }>;
  cuttingListTrends: Array<{
    date: string;
    count: number;
    efficiency: number;
  }>;
  userActivityStats: Array<{
    activityType: string;
    count: number;
    lastActivity: string;
  }>;
}

export interface OptimizationAnalytics {
  algorithmPerformance: Array<{
    algorithm: string;
    averageEfficiency: number;
    successRate: number;
    executionTime: number;
    usageCount: number;
  }>;
  wasteReductionTrends: Array<{
    date: string;
    averageWasteReduction: number;
    optimizationCount: number;
  }>;
}

export interface SystemHealthMetrics {
  responseTime: number;
  errorRate: number;
  activeConnections: number;
  memoryUsage: number;
  cpuUsage: number;
  databaseConnections: number;
}

// ============================================================================
// STATISTICS SERVICE CLASS
// ============================================================================

/**
 * Statistics Service for comprehensive analytics and metrics
 */
export class StatisticsService {
  private static instance: StatisticsService;

  private constructor() {}

  public static getInstance(): StatisticsService {
    if (!StatisticsService.instance) {
      StatisticsService.instance = new StatisticsService();
    }
    return StatisticsService.instance;
  }

  // ============================================================================
  // OVERVIEW STATISTICS
  // ============================================================================

  /**
   * Get comprehensive statistics overview
   */
  public async getStatisticsOverview(
    cuttingListId?: string,
  ): Promise<StatisticsOverview> {
    try {
      let totalCuttingLists = 0;
      let totalWorkOrders = 0;
      let totalProfiles = 0;
      let totalProductSections = 0;
      let completedWorkOrders = 0;
      let pendingWorkOrders = 0;
      let mostUsedColor = "Bilinmiyor";
      let mostUsedSize = "Bilinmiyor";

      if (cuttingListId) {
        // Get specific cutting list data from the working API endpoint
        logger.info("Fetching cutting list data for ID", { cuttingListId });

        // Validate cuttingListId to prevent injection
        if (!/^[a-zA-Z0-9_-]+$/.test(cuttingListId)) {
          logger.error("Invalid cuttingListId format", { cuttingListId });
          throw new Error("Invalid cuttingListId format");
        }

        try {
          // Use the same endpoint that works for the frontend
          const cuttingListResponse = await fetch(
            `http://localhost:3001/api/cutting-list/${cuttingListId}`,
          );
          const cuttingListData = (await cuttingListResponse.json()) as {
            success: boolean;
            data: CuttingListData;
          };

          if (cuttingListData.success && cuttingListData.data) {
            const cuttingList = cuttingListData.data;
            logger.info("Successfully fetched cutting list", {
              title: cuttingList.title,
              weekNumber: cuttingList.weekNumber,
            });

            totalCuttingLists = 1;

            // Parse the sections data from the cutting list
            const sections = cuttingList.sections || [];
            totalProductSections = sections.length;

            // Count work orders and profiles from sections
            let totalItems = 0;
            let totalProfileCount = 0;
            const colorCounts: Record<string, number> = {};
            const sizeCounts: Record<string, number> = {};

            sections.forEach((section: CuttingListSection) => {
              if (section.items && Array.isArray(section.items)) {
                totalItems += section.items.length;

                section.items.forEach((item: CuttingListItem) => {
                  // Count order quantity as profiles
                  totalProfileCount +=
                    (item as CuttingListItem).orderQuantity || 0;

                  // Count colors and sizes
                  if ((item as CuttingListItem).color) {
                    colorCounts[(item as CuttingListItem).color] =
                      (colorCounts[(item as CuttingListItem).color] || 0) + 1;
                  }
                  if ((item as CuttingListItem).size) {
                    sizeCounts[(item as CuttingListItem).size] =
                      (sizeCounts[(item as CuttingListItem).size] || 0) + 1;
                  }
                });
              }
            });

            totalWorkOrders = totalItems;
            totalProfiles = totalProfileCount;

            // Find most used color and size
            const sortedColors = Object.entries(colorCounts).sort(
              ([, a], [, b]) => b - a,
            );
            const sortedSizes = Object.entries(sizeCounts).sort(
              ([, a], [, b]) => b - a,
            );

            mostUsedColor = sortedColors[0]?.[0] || "Bilinmiyor";
            mostUsedSize = sortedSizes[0]?.[0] || "Bilinmiyor";

            // For now, assume all work orders are pending (since we don't have status in the data)
            pendingWorkOrders = totalWorkOrders;
            completedWorkOrders = 0;

            logger.info("Calculated statistics:", {
              totalWorkOrders,
              totalProfiles,
              totalProductSections,
              mostUsedColor,
              mostUsedSize,
              weekNumber: cuttingList.weekNumber,
            });
          } else {
            logger.error("Failed to fetch cutting list data:", cuttingListData);
          }
        } catch (error) {
          logger.error("Error fetching cutting list data:", error);
        }
      } else {
        // Get all cutting lists data from the working API endpoint
        logger.info("Fetching all cutting lists data");

        try {
          const allListsResponse = await fetch(
            "http://localhost:3001/api/cutting-list",
          );
          const allListsData = (await allListsResponse.json()) as {
            success: boolean;
            data: CuttingListData[];
          };

          if (allListsData.success && allListsData.data) {
            const cuttingLists = allListsData.data;
            logger.info("Successfully fetched all cutting lists", {
              count: cuttingLists.length,
            });

            totalCuttingLists = cuttingLists.length;

            let totalItems = 0;
            let totalProfileCount = 0;
            const colorCounts: Record<string, number> = {};
            const sizeCounts: Record<string, number> = {};
            const productTypes = new Set<string>();

            cuttingLists.forEach((list: CuttingListData) => {
              const sections = list.sections || [];
              totalProductSections += sections.length;

              sections.forEach((section: CuttingListSection) => {
                if (section.productName) {
                  productTypes.add(section.productName);
                }

                if (section.items && Array.isArray(section.items)) {
                  totalItems += section.items.length;

                  section.items.forEach((item: CuttingListItem) => {
                    // Count order quantity as profiles
                    totalProfileCount +=
                      (item as CuttingListItem).orderQuantity || 0;

                    if (item.color) {
                      colorCounts[item.color] =
                        (colorCounts[item.color] || 0) + 1;
                    }
                    if (item.size) {
                      sizeCounts[item.size] = (sizeCounts[item.size] || 0) + 1;
                    }
                  });
                }
              });
            });

            totalWorkOrders = totalItems;
            totalProfiles = totalProfileCount;
            totalProductSections = productTypes.size;

            const sortedColors = Object.entries(colorCounts).sort(
              ([, a], [, b]) => b - a,
            );
            const sortedSizes = Object.entries(sizeCounts).sort(
              ([, a], [, b]) => b - a,
            );

            mostUsedColor = sortedColors[0]?.[0] || "Bilinmiyor";
            mostUsedSize = sortedSizes[0]?.[0] || "Bilinmiyor";

            pendingWorkOrders = totalWorkOrders;
            completedWorkOrders = 0;

            logger.info("Calculated all lists statistics:", {
              totalCuttingLists,
              totalWorkOrders,
              totalProfiles,
              totalProductSections,
              mostUsedColor,
              mostUsedSize,
            });
          } else {
            logger.error(
              "Failed to fetch all cutting lists data:",
              allListsData,
            );
          }
        } catch (error) {
          logger.error("Error fetching all cutting lists data:", error);
        }
      }

      // Return real calculated data
      const realData = {
        totalCuttingLists,
        totalWorkOrders,
        totalProfiles,
        totalProductSections,
        completedWorkOrders,
        pendingWorkOrders,
        mostUsedColor,
        mostUsedSize,
        // Legacy fields for compatibility (set to 0)
        averageEfficiency: 0,
        totalWasteReduction: 0,
        optimizationSuccessRate: 0,
        activeUsers: 0,
        systemUptime: 0,
      };

      logger.info("Fetched cutting list focused statistics overview", realData);
      return realData;
    } catch (error) {
      logger.error("Failed to get cutting list statistics overview:", error);
      throw error;
    }
  }

  // ============================================================================
  // PERFORMANCE METRICS
  // ============================================================================

  /**
   * Get performance metrics
   */
  public async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    try {
      const [
        efficiencyStats,
        optimizationCount,
        processingTimeStats,
        successRateStats,
      ] = await Promise.all([
        prisma.cuttingListStatistics.aggregate({
          _avg: { efficiencyScore: true },
        }),
        prisma.optimizationStatistics.count(),
        prisma.optimizationStatistics.aggregate({
          _avg: { executionTimeMs: true },
        }),
        prisma.optimizationStatistics.aggregate({
          _avg: { successRate: true },
        }),
      ]);

      return {
        wastePercentage: 0, // ✅ DEFAULT: No waste data available
        efficiencyScore:
          Math.round((efficiencyStats._avg.efficiencyScore || 0) * 100) / 100,
        optimizationCount,
        averageProcessingTime: Math.round(
          processingTimeStats._avg.executionTimeMs || 0,
        ),
        successRate:
          Math.round((successRateStats._avg.successRate || 0) * 100) / 100,
      };
    } catch (error) {
      logger.error("Failed to get performance metrics:", error);
      throw error;
    }
  }

  // ============================================================================
  // USAGE ANALYTICS
  // ============================================================================

  /**
   * Get usage analytics
   */
  public async getUsageAnalytics(days: number = 30): Promise<UsageAnalytics> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const [profileUsageCounts, cuttingListTrends, userActivityStats] =
        await Promise.all([
          this.getProfileUsageCounts(),
          this.getCuttingListTrends(days),
          this.getUserActivityStats(startDate),
        ]);

      return {
        profileUsageCounts,
        cuttingListTrends,
        userActivityStats,
      };
    } catch (error) {
      logger.error("Failed to get usage analytics:", error);
      throw error;
    }
  }

  /**
   * Get profile usage counts with popularity scores
   */
  private async getProfileUsageCounts(): Promise<
    Array<{
      profileType: string;
      profileName: string;
      measurement: number;
      usageCount: number;
      popularityScore: number;
    }>
  > {
    try {
      const profileStats = await prisma.profileUsageStatistics.findMany({
        orderBy: { totalUsageCount: "desc" },
        take: 20,
      });

      const maxUsage = Math.max(...profileStats.map((p) => p.totalUsageCount));

      return profileStats.map((profile) => ({
        profileType: profile.profileType,
        profileName: profile.profileName,
        measurement: profile.measurement,
        usageCount: profile.totalUsageCount,
        popularityScore: profile.totalUsageCount / maxUsage,
      }));
    } catch (error) {
      logger.error("Failed to get profile usage counts:", error);
      return [];
    }
  }

  /**
   * Get cutting list trends over time
   */
  private async getCuttingListTrends(days: number): Promise<
    Array<{
      date: string;
      count: number;
      efficiency: number;
    }>
  > {
    try {
      const trends = [];
      const now = new Date();

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const [count, efficiency] = await Promise.all([
          prisma.cuttingList.count({
            where: {
              createdAt: {
                gte: date,
                lt: nextDate,
              },
            },
          }),
          prisma.cuttingListStatistics.aggregate({
            where: {
              cuttingList: {
                createdAt: {
                  gte: date,
                  lt: nextDate,
                },
              },
            },
            _avg: { efficiencyScore: true },
          }),
        ]);

        trends.push({
          date: date.toISOString().split("T")[0],
          count,
          efficiency:
            Math.round((efficiency._avg.efficiencyScore || 0) * 100) / 100,
        });
      }

      return trends;
    } catch (error) {
      logger.error("Failed to get cutting list trends:", error);
      return [];
    }
  }

  /**
   * Get user activity statistics
   */
  private async getUserActivityStats(startDate: Date): Promise<
    Array<{
      activityType: string;
      count: number;
      lastActivity: string;
    }>
  > {
    try {
      const activities = await prisma.userActivity.groupBy({
        by: ["activityType"],
        where: {
          createdAt: {
            gte: startDate,
          },
        },
        _count: {
          id: true,
        },
        _max: {
          createdAt: true,
        },
      });

      return activities.map((activity) => ({
        activityType: activity.activityType,
        count: activity._count.id,
        lastActivity: activity._max.createdAt?.toISOString() || "",
      }));
    } catch (error) {
      logger.error("Failed to get user activity stats:", error);
      return [];
    }
  }

  // ============================================================================
  // OPTIMIZATION ANALYTICS
  // ============================================================================

  /**
   * Get optimization analytics
   */
  public async getOptimizationAnalytics(): Promise<OptimizationAnalytics> {
    try {
      const [algorithmPerformance, wasteReductionTrends] = await Promise.all([
        this.getAlgorithmPerformance(),
        this.getWasteReductionTrends(),
      ]);

      return {
        algorithmPerformance,
        wasteReductionTrends,
      };
    } catch (error) {
      logger.error("Failed to get optimization analytics:", error);
      throw error;
    }
  }

  /**
   * Get algorithm performance metrics
   */
  private async getAlgorithmPerformance(): Promise<
    Array<{
      algorithm: string;
      averageEfficiency: number;
      successRate: number;
      executionTime: number;
      usageCount: number;
    }>
  > {
    try {
      const algorithms = await prisma.optimizationStatistics.groupBy({
        by: ["algorithm"],
        _avg: {
          averageEfficiency: true,
          successRate: true,
          executionTimeMs: true,
        },
        _count: {
          id: true,
        },
      });

      return algorithms.map((algorithm) => ({
        algorithm: algorithm.algorithm,
        averageEfficiency:
          Math.round((algorithm._avg.averageEfficiency || 0) * 100) / 100,
        successRate: Math.round((algorithm._avg.successRate || 0) * 100) / 100,
        executionTime: Math.round(algorithm._avg.executionTimeMs || 0),
        usageCount: algorithm._count.id,
      }));
    } catch (error) {
      logger.error("Failed to get algorithm performance:", error);
      return [];
    }
  }

  /**
   * Get waste reduction trends
   */
  private async getWasteReductionTrends(): Promise<
    Array<{
      date: string;
      averageWasteReduction: number;
      optimizationCount: number;
    }>
  > {
    try {
      const trends = [];
      const now = new Date();

      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const [wasteReduction, count] = await Promise.all([
          prisma.optimizationStatistics.aggregate({
            where: {
              createdAt: {
                gte: date,
                lt: nextDate,
              },
            },
            _avg: { wasteReductionPercent: true },
          }),
          prisma.optimizationStatistics.count({
            where: {
              createdAt: {
                gte: date,
                lt: nextDate,
              },
            },
          }),
        ]);

        trends.push({
          date: date.toISOString().split("T")[0],
          averageWasteReduction:
            Math.round((wasteReduction._avg.wasteReductionPercent || 0) * 100) /
            100,
          optimizationCount: count,
        });
      }

      return trends;
    } catch (error) {
      logger.error("Failed to get waste reduction trends:", error);
      return [];
    }
  }

  // ============================================================================
  // SYSTEM HEALTH METRICS
  // ============================================================================

  /**
   * Get system health metrics
   */
  public async getSystemHealthMetrics(): Promise<SystemHealthMetrics> {
    try {
      const [recentErrors, databaseConnections] = await Promise.all([
        prisma.systemMetrics.count({
          where: {
            metricType: "error",
            timestamp: {
              gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
            },
          },
        }),
        prisma.$queryRaw`SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'`,
      ]);

      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      return {
        responseTime: 0, // Will be calculated from request timing
        errorRate: recentErrors,
        activeConnections: 0, // Will be tracked by connection pool
        memoryUsage: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        cpuUsage: Math.round((cpuUsage.user + cpuUsage.system) / 1000000), // seconds
        databaseConnections: 1, // SQLite single connection
      };
    } catch (error) {
      logger.error("Failed to get system health metrics:", error);
      throw error;
    }
  }

  // ============================================================================
  // DATA COLLECTION & UPDATES
  // ============================================================================

  /**
   * Update cutting list statistics
   */
  public async updateCuttingListStatistics(
    cuttingListId: string,
  ): Promise<void> {
    try {
      const cuttingList = await prisma.cuttingList.findUnique({
        where: { id: cuttingListId },
        include: {
          items: true,
          statistics: true,
        },
      });

      if (!cuttingList) {
        throw new Error(`Cutting list not found: ${cuttingListId}`);
      }

      const totalItems = cuttingList.items.length;
      const totalQuantity = cuttingList.items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      const totalProfiles = cuttingList.items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );

      // Calculate efficiency score (simplified)
      const efficiencyScore =
        totalItems > 0 ? Math.min(100, (totalQuantity / totalItems) * 10) : 0;

      const statisticsData = {
        cuttingListId,
        totalItems,
        totalProfiles,
        totalQuantity,
        averageWastePercent: 0, // Will be calculated from optimization data
        optimizationCount: 0, // Will be updated when optimizations are run
        completionRate: cuttingList.status === "COMPLETED" ? 100 : 0,
        efficiencyScore,
      };

      // Update or create statistics
      const existingStats = await prisma.cuttingListStatistics.findFirst({
        where: { cuttingListId },
      });

      if (existingStats) {
        await prisma.cuttingListStatistics.update({
          where: { id: existingStats.id },
          data: statisticsData,
        });
      } else {
        await prisma.cuttingListStatistics.create({
          data: statisticsData,
        });
      }

      logger.info(`Updated cutting list statistics for ${cuttingListId}`);
    } catch (error) {
      logger.error("Failed to update cutting list statistics:", error);
      throw error;
    }
  }

  /**
   * Record user activity
   * @param activityData - JSONB data stored in PostgreSQL
   */
  public async recordUserActivity(
    userId: string,
    activityType: string,
    activityData?: Prisma.InputJsonValue,
    ipAddress?: string,
    userAgent?: string,
    sessionId?: string,
  ): Promise<void> {
    try {
      await prisma.userActivity.create({
        data: {
          userId,
          activityType,
          activityData: activityData ?? Prisma.DbNull,
          ipAddress,
          userAgent,
          sessionId,
        },
      });
    } catch (error) {
      logger.error("Failed to record user activity:", error);
      // Don't throw error for activity recording failures
    }
  }

  /**
   * Record system metric
   * @param metadata - JSONB metadata stored in PostgreSQL
   */
  public async recordSystemMetric(
    metricType: string,
    metricName: string,
    metricValue: number,
    metricUnit?: string,
    metadata?: Prisma.InputJsonValue,
  ): Promise<void> {
    try {
      await prisma.systemMetrics.create({
        data: {
          metricType,
          metricName,
          metricValue,
          metricUnit,
          metadata: metadata ?? Prisma.DbNull,
        },
      });
    } catch (error) {
      logger.error("Failed to record system metric:", error);
      // Don't throw error for metric recording failures
    }
  }
}

// Export singleton instance
export const statisticsService = StatisticsService.getInstance();
