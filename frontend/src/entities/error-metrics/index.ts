/**
 * Error Metrics Entity
 * Public API exports
 *
 * @module entities/error-metrics
 */

export {
  getAllErrorMetrics,
  getErrorRatesByClass,
  getErrorTrends,
  getErrorHealthCheck,
  resetErrorMetrics,
} from "./api/errorMetricsApi";

export {
  useErrorMetrics,
  useErrorRatesByClass,
  useErrorTrends,
  useErrorHealthCheck,
  useResetErrorMetrics,
  errorMetricsKeys,
} from "./api/errorMetricsQueries";

export type {
  ErrorClass,
  ErrorSeverity,
  HealthStatus,
  ErrorTrend,
  ErrorMetrics,
  ErrorDistribution,
  ErrorTrends,
  AllErrorMetrics,
  ErrorRatesByClass,
  ErrorHealthCheck,
} from "./model/types";
