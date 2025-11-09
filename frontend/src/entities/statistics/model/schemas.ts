/**
 * Statistics Entity - Zod Schemas
 * Runtime type validation for statistics data
 *
 * @module entities/statistics/model
 */

import { z } from "zod";

// ============================================================================
// STATISTICS OVERVIEW SCHEMA
// ============================================================================

export const StatisticsOverviewSchema = z.object({
  totalCuttingLists: z.number().int().nonnegative(),
  totalWorkOrders: z.number().int().nonnegative(),
  totalProfiles: z.number().int().nonnegative(),
  totalProductSections: z.number().int().nonnegative(),
  completedWorkOrders: z.number().int().nonnegative(),
  pendingWorkOrders: z.number().int().nonnegative(),
  mostUsedColor: z.string(),
  mostUsedSize: z.string(),
  averageEfficiency: z.number().nonnegative(),
  totalWasteReduction: z.number().nonnegative(),
  optimizationSuccessRate: z.number().nonnegative(),
  activeUsers: z.number().int().nonnegative(),
  systemUptime: z.number().nonnegative(),
});

// ============================================================================
// ALGORITHM PERFORMANCE SCHEMA
// ============================================================================

export const AlgorithmPerformanceSchema = z.object({
  algorithm: z.string(),
  count: z.number().int().nonnegative(),
  averageEfficiency: z.number().nonnegative(),
  averageWaste: z.number().nonnegative(),
  averageTime: z.number().nonnegative(),
});

// ============================================================================
// USAGE ANALYTICS SCHEMA
// ============================================================================

export const UsageAnalyticsSchema = z.object({
  date: z.string(),
  optimizations: z.number().int().nonnegative(),
  avgEfficiency: z.number().nonnegative(),
  totalWaste: z.number().nonnegative(),
});

// ============================================================================
// SYSTEM HEALTH SCHEMA
// ============================================================================

export const SystemHealthSchema = z.object({
  status: z.enum(["healthy", "degraded", "critical"]),
  uptime: z.number().nonnegative(),
  memoryUsage: z.number().min(0).max(100),
  cpuUsage: z.number().min(0).max(100),
  activeConnections: z.number().int().nonnegative(),
  lastCheck: z.string().datetime(),
});

export type SystemHealth = z.infer<typeof SystemHealthSchema>;

// ============================================================================
// BATCH STATISTICS SCHEMA
// ============================================================================

export const BatchStatisticsSchema = z.object({
  overview: StatisticsOverviewSchema.optional(),
  performance: z.array(AlgorithmPerformanceSchema).optional(),
  usage: z.array(UsageAnalyticsSchema).optional(),
  optimization: z.any().optional(), // TODO: Define proper schema
  systemHealth: SystemHealthSchema.optional(),
});

export type BatchStatistics = z.infer<typeof BatchStatisticsSchema>;
