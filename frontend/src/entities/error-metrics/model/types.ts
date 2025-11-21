/**
 * Error Metrics Entity Types
 * Types for error monitoring and metrics
 *
 * @module entities/error-metrics/model
 * @version 1.0.0
 */

/**
 * Error class types
 */
export type ErrorClass = "CLIENT" | "BUSINESS" | "INTEGRATION" | "SYSTEM";

/**
 * Error severity types
 */
export type ErrorSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

/**
 * Health status
 */
export type HealthStatus = "healthy" | "warning" | "critical";

/**
 * Error trend direction
 */
export type ErrorTrend = "increasing" | "stable" | "decreasing";

/**
 * Error metrics
 */
export interface ErrorMetrics {
  readonly class: ErrorClass;
  readonly severity: ErrorSeverity;
  readonly count: number;
  readonly rate: number; // errors per minute
  readonly lastOccurrence: string;
  readonly affectedEndpoints: readonly string[];
  readonly uniqueUsers: number;
}

/**
 * Error distribution
 */
export interface ErrorDistribution {
  readonly byClass: Record<ErrorClass, number>;
  readonly bySeverity: Record<ErrorSeverity, number>;
  readonly byEndpoint: Record<string, number>;
}

/**
 * Error trends
 */
export interface ErrorTrends {
  readonly trend: ErrorTrend;
  readonly changePercent: number;
  readonly currentRate: number;
  readonly previousRate: number;
}

/**
 * All error metrics response
 */
export interface AllErrorMetrics {
  readonly timestamp: string;
  readonly currentErrorRate: number;
  readonly trends: ErrorTrends;
  readonly distribution: ErrorDistribution;
  readonly detailedMetrics: readonly ErrorMetrics[];
}

/**
 * Error rates by class
 */
export interface ErrorRatesByClass {
  readonly timestamp: string;
  readonly errorRatesByClass: Record<ErrorClass, number>;
  readonly sloThresholds: Record<ErrorClass, number>;
}

/**
 * Error health check result
 */
export interface ErrorHealthCheck {
  readonly timestamp: string;
  readonly status: HealthStatus;
  readonly currentErrorRate: number;
  readonly trend: ErrorTrend;
  readonly issues: readonly string[];
  readonly summary: {
    readonly totalErrors: number;
    readonly criticalErrors: number;
    readonly systemErrors: number;
    readonly integrationErrors: number;
  };
}
