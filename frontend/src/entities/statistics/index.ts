/**
 * Statistics Entity - Public API
 * 
 * @module entities/statistics
 * @version 2.0.0 - Complete Statistics Integration (P2-2)
 */

// Types
export type {
  StatisticsOverview,
  AlgorithmPerformance,
  UsageAnalytics,
  ProfileUsageStats,
  CuttingListTrends,
  WasteReductionTrends,
  SystemHealthMetrics,
  PerformanceMetrics,
  OptimizationAnalytics,
} from './model/types';

// API functions
export {
  getStatisticsOverview,
  getAlgorithmPerformance,
  getBatchStatistics,
  // NEW: P2-2 API functions
  getUsageAnalytics,
  getProfileUsageStats,
  getCuttingListTrends,
  getOptimizationAnalytics,
  getWasteReductionTrends,
  getSystemHealthMetrics,
  getPerformanceMetrics,
  type StatisticsType,
  type BatchStatisticsRequest,
  type BatchStatisticsResponse,
} from './api/statisticsApi';

// React Query hooks (recommended)
export {
  statisticsKeys,
  useStatisticsOverview,
  useAlgorithmPerformance,
  useBatchStatistics,
  // NEW: P2-2 React Query hooks
  useUsageAnalytics,
  useProfileUsageStats,
  useCuttingListTrends,
  useOptimizationAnalytics,
  useWasteReductionTrends,
  useSystemHealthMetrics,
  usePerformanceMetrics,
} from './api/statisticsQueries';
