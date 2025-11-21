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
  getGPUStatus,
} from "./api/healthApi";

export {
  useDatabaseHealth,
  useDeepHealthCheck,
  useSystemHealth,
  useQueryPerformanceMetrics,
  useCachePerformanceMetrics,
  useGPUStatus,
  healthKeys,
} from "./api/healthQueries";

export type {
  DatabaseHealth,
  DeepHealthCheck,
  SystemHealth,
  QueryPerformanceMetrics,
  CachePerformanceMetrics,
  GPUStatus,
} from "./model/types";
