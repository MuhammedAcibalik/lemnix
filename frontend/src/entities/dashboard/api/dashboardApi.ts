/**
 * LEMNİX Dashboard API Client
 * HTTP client for dashboard data operations
 * 
 * @module entities/dashboard/api
 * @version 1.0.0 - FSD Compliant
 */

import { apiClient } from '@/shared/api';
import type {
  DashboardData,
  DashboardHeroMetrics,
  OptimizationPerformanceData,
  ActiveOperationsData,
  SmartInsightsData,
  ActivityTimelineData,
  DashboardMetricsOptions,
  ActivityFilter
} from '../model/types';

/**
 * API response wrapper
 */
interface ApiResponse<T> {
  readonly success: boolean;
  readonly data: T;
  readonly error?: {
    readonly message: string;
    readonly code: string;
  };
}

/**
 * Get complete dashboard data
 */
export async function getDashboardData(
  options?: DashboardMetricsOptions
): Promise<DashboardData> {
  const response = await apiClient.get<ApiResponse<DashboardData>>(
    '/dashboard/metrics',
    { params: options }
  );
  
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch dashboard data');
  }
  
  return response.data.data;
}

/**
 * Get hero metrics only (lightweight)
 */
export async function getHeroMetrics(
  options?: DashboardMetricsOptions
): Promise<DashboardHeroMetrics> {
  const response = await apiClient.get<ApiResponse<DashboardHeroMetrics>>(
    '/dashboard/hero-metrics',
    { params: options }
  );
  
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch hero metrics');
  }
  
  return response.data.data;
}

/**
 * Get optimization performance data
 */
export async function getOptimizationPerformance(
  options?: DashboardMetricsOptions
): Promise<OptimizationPerformanceData> {
  const response = await apiClient.get<ApiResponse<OptimizationPerformanceData>>(
    '/dashboard/optimization-performance',
    { params: options }
  );
  
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch optimization performance');
  }
  
  return response.data.data;
}

/**
 * Get active operations (real-time)
 */
export async function getActiveOperations(): Promise<ActiveOperationsData> {
  const response = await apiClient.get<ApiResponse<ActiveOperationsData>>(
    '/dashboard/active-operations'
  );
  
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch active operations');
  }
  
  return response.data.data;
}

/**
 * Get smart insights
 */
export async function getSmartInsights(
  options?: DashboardMetricsOptions
): Promise<SmartInsightsData> {
  const response = await apiClient.get<ApiResponse<SmartInsightsData>>(
    '/dashboard/insights',
    { params: options }
  );
  
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch smart insights');
  }
  
  return response.data.data;
}

/**
 * Get activity timeline
 */
export async function getActivityTimeline(
  filter?: ActivityFilter
): Promise<ActivityTimelineData> {
  const response = await apiClient.get<ApiResponse<ActivityTimelineData>>(
    '/dashboard/activity-timeline',
    { params: filter }
  );
  
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch activity timeline');
  }
  
  return response.data.data;
}

