/**
 * LEMNİX Statistics Entity Response Schemas
 * Zod schemas for backend response validation
 *
 * @module entities/statistics/model
 * @version 1.0.0 - Response Validation Layer
 */

import { z } from "zod";

/**
 * Statistics overview schema
 */
export const statisticsOverviewSchema = z.object({
  totalOptimizations: z.number().int().nonnegative(),
  averageEfficiency: z.number().min(0).max(1),
  totalWasteSaved: z.number().nonnegative(),
  totalCostSavings: z.number().nonnegative(),
});

/**
 * Algorithm performance schema
 */
export const algorithmPerformanceSchema = z.object({
  algorithm: z.string(),
  count: z.number().int().nonnegative(),
  averageEfficiency: z.number().min(0).max(1),
  averageWaste: z.number().nonnegative(),
  averageTime: z.number().nonnegative(),
});

/**
 * Usage analytics schema
 */
export const usageAnalyticsSchema = z.object({
  totalRequests: z.number().int().nonnegative(),
  uniqueUsers: z.number().int().nonnegative(),
  averageResponseTime: z.number().nonnegative(),
  requestsByEndpoint: z.record(z.number().int().nonnegative()),
  requestsByHour: z
    .array(
      z.object({
        hour: z.number().int().min(0).max(23),
        count: z.number().int().nonnegative(),
      }),
    )
    .readonly(),
  peakHour: z.number().int().min(0).max(23),
  activeUsers: z.number().int().nonnegative(),
});

/**
 * Profile usage stats schema
 */
export const profileUsageStatsSchema = z.object({
  profileType: z.string(),
  usageCount: z.number().int().nonnegative(),
  totalLength: z.number().nonnegative(),
  averageQuantity: z.number().nonnegative(),
  lastUsed: z.string().datetime(),
});

/**
 * Cutting list trends schema
 */
export const cuttingListTrendsSchema = z.object({
  daily: z
    .array(
      z.object({
        date: z.string(),
        count: z.number().int().nonnegative(),
        totalLength: z.number().nonnegative(),
        averageEfficiency: z.number().min(0).max(1),
      }),
    )
    .readonly(),
  totalLists: z.number().int().nonnegative(),
  averageItemsPerList: z.number().nonnegative(),
  trend: z.enum(["increasing", "stable", "decreasing"]),
});

/**
 * Waste reduction trends schema
 */
export const wasteReductionTrendsSchema = z.object({
  daily: z
    .array(
      z.object({
        date: z.string(),
        wasteReduction: z.number().nonnegative(),
        costSavings: z.number().nonnegative(),
      }),
    )
    .readonly(),
  totalWasteSaved: z.number().nonnegative(),
  totalCostSaved: z.number().nonnegative(),
  averageReductionRate: z.number().min(0).max(1),
});

/**
 * System health metrics schema
 */
export const systemHealthMetricsSchema = z.object({
  status: z.enum(["healthy", "degraded", "unhealthy"]),
  uptime: z.number().int().nonnegative(),
  cpu: z.object({
    usage: z.number().min(0).max(100),
    loadAverage: z.array(z.number().nonnegative()).readonly(),
  }),
  memory: z.object({
    used: z.number().nonnegative(),
    total: z.number().positive(),
    percentage: z.number().min(0).max(100),
  }),
  database: z.object({
    connected: z.boolean(),
    responseTime: z.number().nonnegative(),
  }),
  lastCheck: z.string().datetime(),
});

/**
 * Performance metrics schema
 */
export const performanceMetricsSchema = z.object({
  averageOptimizationTime: z.number().nonnegative(),
  throughput: z.number().nonnegative(),
  errorRate: z.number().min(0).max(100),
  p95ResponseTime: z.number().nonnegative(),
  p99ResponseTime: z.number().nonnegative(),
});

/**
 * Optimization analytics schema
 */
export const optimizationAnalyticsSchema = z.object({
  totalOptimizations: z.number().int().nonnegative(),
  byAlgorithm: z.record(z.number().int().nonnegative()),
  averageEfficiency: z.number().min(0).max(1),
  averageWaste: z.number().nonnegative(),
  averageCost: z.number().nonnegative(),
  successRate: z.number().min(0).max(1),
});

/**
 * Validation helpers
 */
export const validateStatisticsOverview = (data: unknown) =>
  statisticsOverviewSchema.safeParse(data).data ?? null;

export const validateAlgorithmPerformance = (data: unknown) =>
  z.array(algorithmPerformanceSchema).safeParse(data).data ?? null;

export const validateUsageAnalytics = (data: unknown) =>
  usageAnalyticsSchema.safeParse(data).data ?? null;

export const validateProfileUsageStats = (data: unknown) =>
  z.array(profileUsageStatsSchema).safeParse(data).data ?? null;

export const validateCuttingListTrends = (data: unknown) =>
  cuttingListTrendsSchema.safeParse(data).data ?? null;

export const validateWasteReductionTrends = (data: unknown) =>
  wasteReductionTrendsSchema.safeParse(data).data ?? null;

export const validateSystemHealthMetrics = (data: unknown) =>
  systemHealthMetricsSchema.safeParse(data).data ?? null;

export const validatePerformanceMetrics = (data: unknown) =>
  performanceMetricsSchema.safeParse(data).data ?? null;

export const validateOptimizationAnalytics = (data: unknown) =>
  optimizationAnalyticsSchema.safeParse(data).data ?? null;
