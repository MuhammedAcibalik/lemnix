/**
 * LEMNİX Dashboard Entity - Public API
 * 
 * @module entities/dashboard
 * @version 1.0.0 - FSD Compliant
 */

// Types
export type {
  DashboardData,
  DashboardHeroMetrics,
  AlgorithmPerformanceStats,
  OptimizationPerformanceData,
  ActiveOperationStatus,
  ActiveOperation,
  RecentCompletion,
  ActiveOperationsData,
  TopProfile,
  BestAlgorithm,
  PeakHour,
  SmartInsightsData,
  ActivityEventType,
  TimelineEvent,
  ActivityFilter,
  ActivityTimelineData,
  DashboardMetricsOptions,
  QuickActionType,
  QuickAction
} from './model/types';

// API Functions
export {
  getDashboardData,
  getHeroMetrics,
  getOptimizationPerformance,
  getActiveOperations,
  getSmartInsights,
  getActivityTimeline
} from './api/dashboardApi';

// React Query Hooks
export {
  useDashboardData,
  useHeroMetrics,
  useOptimizationPerformance,
  useActiveOperations,
  useSmartInsights,
  useActivityTimeline,
  dashboardKeys
} from './api/dashboardQueries';

