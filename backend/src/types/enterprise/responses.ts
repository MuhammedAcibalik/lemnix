/**
 * Enterprise Controller Response Types
 *
 * @module enterprise/types
 * @version 1.0.0
 */

/**
 * Enterprise optimization response
 */
export interface EnterpriseOptimizationResponse {
  readonly success: boolean;
  readonly data?: {
    readonly optimizationResult: unknown;
    readonly performanceMetrics: unknown;
    readonly costAnalysis: unknown;
    readonly recommendations: unknown[];
    readonly confidence: number;
  };
  readonly error?: {
    readonly code: string;
    readonly message: string;
    readonly details?: Record<string, unknown>;
  };
  readonly metadata: {
    readonly requestId: string;
    readonly timestamp: string;
    readonly processingTime: number;
    readonly algorithm: string;
    readonly version: string;
  };
}

/**
 * Health check response
 */
export interface HealthResponse {
  readonly success: boolean;
  readonly data?: {
    readonly status: "healthy" | "warning" | "critical";
    readonly services: Record<string, ServiceStatus>;
    readonly metrics: SystemMetrics;
    readonly uptime: number;
    readonly version: string;
  };
  readonly metadata: {
    readonly timestamp: string;
    readonly version: string;
  };
}

/**
 * Service status
 */
export interface ServiceStatus {
  readonly status: "operational" | "degraded" | "down";
  readonly responseTime: number;
}

/**
 * System metrics
 */
export interface SystemMetrics {
  readonly cpuUsage: number;
  readonly memoryUsage: number;
  readonly diskUsage: number;
  readonly networkLatency: number;
}

/**
 * Metrics response
 */
export interface MetricsResponse {
  readonly success: boolean;
  readonly data: {
    readonly systemMetrics: unknown[];
    readonly optimizationMetrics: unknown[];
    readonly activeAlerts: unknown[];
    readonly slaResults: unknown;
  };
  readonly metadata: {
    readonly timestamp: string;
    readonly version: string;
  };
}

/**
 * Analytics response
 */
export interface AnalyticsResponse {
  readonly success: boolean;
  readonly data: {
    readonly timeRange: string;
    readonly metrics: Record<string, MetricData>;
    readonly algorithm?: string;
    readonly generatedAt: string;
  };
  readonly metadata: {
    readonly timestamp: string;
    readonly version: string;
  };
}

/**
 * Metric data point
 */
export interface MetricData {
  readonly current: number;
  readonly average: number;
  readonly trend: "up" | "down" | "stable";
}

/**
 * Export response
 */
export interface ExportResponse {
  readonly success: boolean;
  readonly data?: {
    readonly downloadUrl: string;
    readonly format: string;
    readonly size: number;
    readonly expiresAt: string;
  };
  readonly error?: {
    readonly code: string;
    readonly message: string;
    readonly details?: string;
  };
  readonly timestamp: string;
}

/**
 * Generic success response
 */
export interface SuccessResponse<T = unknown> {
  readonly success: true;
  readonly data: T;
  readonly metadata?: {
    readonly timestamp: string;
    readonly version: string;
    readonly requestId?: string;
  };
}

/**
 * Generic error response
 */
export interface ErrorResponse {
  readonly success: false;
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details?: Record<string, unknown>;
  };
  readonly metadata: {
    readonly timestamp: string;
    readonly version: string;
    readonly requestId?: string;
  };
}
