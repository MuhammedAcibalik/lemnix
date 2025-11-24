/**
 * Health Entity
 * Public API exports
 *
 * @module entities/health
 */

export {
  getDatabaseHealth,
  getDeepHealthCheck,
  getSystemHealth,
  getQueryPerformanceMetrics,
  getCachePerformanceMetrics,
} from "./api/healthApi";

export {
  useDatabaseHealth,
  useDeepHealthCheck,
  useSystemHealth,
  useQueryPerformanceMetrics,
  useCachePerformanceMetrics,
  healthKeys,
} from "./api/healthQueries";

export type {
  DatabaseHealth,
  DeepHealthCheck,
  SystemHealth,
  QueryPerformanceMetrics,
  CachePerformanceMetrics,
} from "./model/types";
