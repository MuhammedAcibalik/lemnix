/**
 * Statistics API Client
 * 
 * @module entities/statistics/api
 * @version 2.0.0 - Batch Endpoint Integration
 */

import { api } from '@/shared';
import type {
  StatisticsOverview,
  AlgorithmPerformance,
  UsageAnalytics,
  ProfileUsageStats,
  CuttingListTrends,
  WasteReductionTrends,
  SystemHealthMetrics,
  PerformanceMetrics,
  OptimizationAnalytics,
} from '../model/types';
import {
  StatisticsOverviewSchema,
  AlgorithmPerformanceSchema,
  SystemHealthSchema,
} from '../model/schemas';
import {
  validateStatisticsOverview,
  validateAlgorithmPerformance,
  validateUsageAnalytics,
  validateProfileUsageStats,
  validateCuttingListTrends,
  validateWasteReductionTrends,
  validateSystemHealthMetrics,
  validatePerformanceMetrics,
  validateOptimizationAnalytics,
} from '../model/responseSchemas';

const STATS_ENDPOINTS = {
  OVERVIEW: '/statistics/overview',
  PERFORMANCE: '/statistics/performance',
  ALGORITHMS: '/statistics/optimization/algorithms',
  BATCH: '/statistics/batch', // NEW: P2-8 Batch endpoint
  // NEW: P2-2 Complete statistics endpoints
  USAGE: '/statistics/usage',
  PROFILES_USAGE: '/statistics/profiles/usage',
  CUTTING_LISTS_TRENDS: '/statistics/cutting-lists/trends',
  OPTIMIZATION: '/statistics/optimization',
  WASTE_REDUCTION: '/statistics/optimization/waste-reduction',
  HEALTH: '/statistics/health',
  METRICS: '/statistics/metrics',
} as const;

/**
 * Batch statistics types (for /batch endpoint)
 */
export type StatisticsType = 
  | 'overview' 
  | 'performance' 
  | 'usage' 
  | 'optimization' 
  | 'health';

export interface BatchStatisticsRequest {
  readonly types: ReadonlyArray<StatisticsType>;
}

export interface BatchStatisticsResponse {
  readonly overview?: StatisticsOverview;
  readonly performance?: {
    readonly averageOptimizationTime: number;
    readonly throughput: number;
    readonly errorRate: number;
  };
  readonly usage?: {
    readonly totalRequests: number;
    readonly activeUsers: number;
  };
  readonly optimization?: {
    readonly totalOptimizations: number;
    readonly averageEfficiency: number;
  };
  readonly health?: {
    readonly status: 'healthy' | 'degraded' | 'unhealthy';
    readonly uptime: number;
  };
}

/**
 * Get statistics overview
 * ✅ P2-5: Zod validation integrated
 */
export async function getStatisticsOverview(): Promise<StatisticsOverview> {
  try {
    const response = await api.get(STATS_ENDPOINTS.OVERVIEW);
    
    // Runtime validation with Zod
    const validated = StatisticsOverviewSchema.parse(response.data);
    return validated;
  } catch (error: unknown) {
    const err = error as { response?: { status?: number } };
    if (err.response?.status === 401) {
      console.warn('Statistics overview requires authentication - returning empty data');
      // Return empty data for graceful degradation
      return {
        totalCuttingLists: 0,
        totalWorkOrders: 0,
        totalProfiles: 0,
        totalProductSections: 0,
        completedWorkOrders: 0,
        pendingWorkOrders: 0,
        mostUsedColor: '-',
        mostUsedSize: '-',
        averageEfficiency: 0,
        totalWasteReduction: 0,
        optimizationSuccessRate: 0,
        activeUsers: 0,
        systemUptime: 0,
      };
    }
    
    // Log other errors and rethrow
    console.error('Statistics overview failed:', error);
    throw error;
  }
}

/**
 * Get algorithm performance
 * ✅ Zod validation integrated
 */
export async function getAlgorithmPerformance(): Promise<ReadonlyArray<AlgorithmPerformance>> {
  try {
    const response = await api.get(STATS_ENDPOINTS.ALGORITHMS);
    
    // Runtime validation with Zod
    const { z } = await import('zod');
    const validated = z.array(AlgorithmPerformanceSchema).parse(response.data) as readonly AlgorithmPerformance[];
    return validated;
  } catch (error: unknown) {
    const err = error as { response?: { status?: number } };
    if (err.response?.status === 401) {
      console.warn('Algorithm performance requires authentication - returning empty data');
      return [];
    }
    
    console.error('Algorithm performance failed:', error);
    throw error;
  }
}

/**
 * Get batch statistics (optimized single request)
 * ✅ P2-8: Replaces multiple individual requests
 * 
 * @example
 * ```typescript
 * const stats = await getBatchStatistics(['overview', 'performance', 'health']);
 * console.log(stats.overview, stats.performance, stats.health);
 * ```
 */
export async function getBatchStatistics(
  types: ReadonlyArray<StatisticsType>
): Promise<BatchStatisticsResponse> {
  try {
    const params = { types: types.join(',') };
    const response = await api.get<BatchStatisticsResponse>(
      STATS_ENDPOINTS.BATCH,
      { params }
    );
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { status?: number } };
    
    if (err.response?.status === 401) {
      console.warn('Batch statistics requires authentication - returning empty data');
    } else {
      console.warn('Batch statistics failed:', error);
    }
    
    // Return empty structure
    return {
      overview: types.includes('overview') ? {
        totalCuttingLists: 0,
        totalWorkOrders: 0,
        totalProfiles: 0,
        totalProductSections: 0,
        completedWorkOrders: 0,
        pendingWorkOrders: 0,
        mostUsedColor: '-',
        mostUsedSize: '-',
        averageEfficiency: 0,
        totalWasteReduction: 0,
        optimizationSuccessRate: 0,
        activeUsers: 0,
        systemUptime: 0,
      } : undefined,
      performance: types.includes('performance') ? {
        averageOptimizationTime: 0,
        throughput: 0,
        errorRate: 0,
      } : undefined,
      usage: types.includes('usage') ? {
        totalRequests: 0,
        activeUsers: 0,
      } : undefined,
      optimization: types.includes('optimization') ? {
        totalOptimizations: 0,
        averageEfficiency: 0,
      } : undefined,
      health: types.includes('health') ? {
        status: 'healthy',
        uptime: 0,
      } : undefined,
    };
  }
}

/**
 * Get usage analytics
 * ✅ P2-2: Usage statistics endpoint integration
 */
export async function getUsageAnalytics(days: number = 30): Promise<UsageAnalytics> {
  try {
    const response = await api.get<UsageAnalytics>(
      STATS_ENDPOINTS.USAGE,
      { params: { days } }
    );
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { status?: number } };
    if (err.response?.status === 401 || err.response?.status === 403) {
      console.warn('Usage analytics require authentication/permission');
    }
    return {
      totalRequests: 0,
      uniqueUsers: 0,
      averageResponseTime: 0,
      requestsByEndpoint: {},
      requestsByHour: [],
      peakHour: 0,
      activeUsers: 0,
    };
  }
}

/**
 * Get profile usage statistics
 * ✅ P2-2: Profile usage endpoint integration
 */
export async function getProfileUsageStats(limit: number = 50): Promise<ReadonlyArray<ProfileUsageStats>> {
  try {
    const response = await api.get<ReadonlyArray<ProfileUsageStats>>(
      STATS_ENDPOINTS.PROFILES_USAGE,
      { params: { limit } }
    );
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { status?: number } };
    if (err.response?.status === 401 || err.response?.status === 403) {
      console.warn('Profile usage stats require authentication/permission');
    }
    return [];
  }
}

/**
 * Get cutting list trends
 * ✅ P2-2: Cutting list trends endpoint integration
 */
export async function getCuttingListTrends(days: number = 30): Promise<CuttingListTrends> {
  try {
    const response = await api.get<CuttingListTrends>(
      STATS_ENDPOINTS.CUTTING_LISTS_TRENDS,
      { params: { days } }
    );
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { status?: number } };
    if (err.response?.status === 401 || err.response?.status === 403) {
      console.warn('Cutting list trends require authentication/permission');
    }
    return {
      daily: [],
      totalLists: 0,
      averageItemsPerList: 0,
      trend: 'stable',
    };
  }
}

/**
 * Get optimization analytics
 * ✅ P2-2: Optimization analytics endpoint integration
 */
export async function getOptimizationAnalytics(): Promise<OptimizationAnalytics> {
  try {
    const response = await api.get<OptimizationAnalytics>(STATS_ENDPOINTS.OPTIMIZATION);
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { status?: number } };
    if (err.response?.status === 401 || err.response?.status === 403) {
      console.warn('Optimization analytics require authentication/permission');
    }
    return {
      totalOptimizations: 0,
      byAlgorithm: {},
      averageEfficiency: 0,
      averageWaste: 0,
      averageCost: 0,
      successRate: 0,
    };
  }
}

/**
 * Get waste reduction trends
 * ✅ P2-2: Waste reduction endpoint integration
 */
export async function getWasteReductionTrends(): Promise<WasteReductionTrends> {
  try {
    const response = await api.get<WasteReductionTrends>(STATS_ENDPOINTS.WASTE_REDUCTION);
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { status?: number } };
    if (err.response?.status === 401 || err.response?.status === 403) {
      console.warn('Waste reduction trends require authentication/permission');
    }
    return {
      daily: [],
      totalWasteSaved: 0,
      totalCostSaved: 0,
      averageReductionRate: 0,
    };
  }
}

/**
 * Get system health metrics
 * ✅ P2-2: System health endpoint integration
 */
export async function getSystemHealthMetrics(): Promise<SystemHealthMetrics> {
  try {
    const response = await api.get<SystemHealthMetrics>(STATS_ENDPOINTS.HEALTH);
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { status?: number } };
    if (err.response?.status === 401 || err.response?.status === 403) {
      console.warn('System health metrics require authentication/permission');
    }
    return {
      status: 'healthy',
      uptime: 0,
      cpu: { usage: 0, loadAverage: [] },
      memory: { used: 0, total: 0, percentage: 0 },
      database: { connected: false, responseTime: 0 },
      lastCheck: new Date().toISOString(),
    };
  }
}

/**
 * Get performance metrics
 * ✅ P2-2: Performance metrics endpoint integration
 */
export async function getPerformanceMetrics(): Promise<PerformanceMetrics> {
  try {
    const response = await api.get<PerformanceMetrics>(STATS_ENDPOINTS.PERFORMANCE);
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { status?: number } };
    if (err.response?.status === 401 || err.response?.status === 403) {
      console.warn('Performance metrics require authentication/permission');
    }
    return {
      averageOptimizationTime: 0,
      throughput: 0,
      errorRate: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
    };
  }
}
