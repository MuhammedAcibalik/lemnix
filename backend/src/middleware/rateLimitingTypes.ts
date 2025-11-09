/**
 * Rate Limiting Types
 * Type definitions for advanced rate limiting
 *
 * @module middleware
 * @version 2.0.0
 *
 * Moved from types/ to middleware/ for better colocation (2025-01-05)
 */

// Request flow types
export type RequestFlow =
  | "read"
  | "write"
  | "export"
  | "optimization"
  | "analysis";

// Protection level types
export type ProtectionLevel = "low" | "medium" | "high";

// Resource protection configuration
export interface SizeLimit {
  readonly maxBodySize: number;
  readonly maxFileSize: number;
  readonly maxArrayLength: number;
}

export interface TimeoutConfig {
  readonly request: number;
  readonly query: number;
  readonly export: number;
}

export interface RateLimitConfig {
  readonly requests: number;
  readonly window: number;
  readonly burst: number;
}

export interface BurstDetectionConfig {
  readonly enabled: boolean;
  readonly threshold: number;
  readonly windowMs: number;
}

export interface ResourceProtectionConfig {
  readonly flow: RequestFlow;
  readonly level: ProtectionLevel;
  readonly sizeLimit: SizeLimit;
  readonly timeout: TimeoutConfig;
  readonly rateLimit: RateLimitConfig;
  readonly burstDetection: BurstDetectionConfig;
}

export interface ResourceMetrics {
  readonly requestCount: number;
  readonly avgResponseTime: number;
  readonly errorRate: number;
  readonly burstDetected: boolean;
}

export interface RateLimitViolation {
  identifier: string;
  timestamp: number;
  endpoint: string;
  violationType: "burst" | "sustained" | "anomaly";
  severity: "low" | "medium" | "high";
  correlationId?: string;
  flow?: RequestFlow;
}

export interface RateLimitContext {
  identifier: string;
  endpoint: string;
  currentCount: number;
  windowStart: number;
  violations: RateLimitViolation[];
}

export interface ThrottleResponse {
  allowed: boolean;
  retryAfter?: number;
  remaining?: number;
  resetTime?: number;
}

// Constants
export const FLOW_CONFIGS: Record<RequestFlow, ResourceProtectionConfig> = {
  read: {
    flow: "read",
    level: "low",
    sizeLimit: {
      maxBodySize: 1024 * 100,
      maxFileSize: 0,
      maxArrayLength: 1000,
    },
    timeout: { request: 10000, query: 5000, export: 0 },
    rateLimit: { requests: 100, window: 60000, burst: 120 },
    burstDetection: { enabled: true, threshold: 150, windowMs: 10000 },
  },
  write: {
    flow: "write",
    level: "medium",
    sizeLimit: {
      maxBodySize: 1024 * 1024,
      maxFileSize: 1024 * 1024 * 5,
      maxArrayLength: 5000,
    },
    timeout: { request: 30000, query: 15000, export: 0 },
    rateLimit: { requests: 50, window: 60000, burst: 60 },
    burstDetection: { enabled: true, threshold: 80, windowMs: 10000 },
  },
  export: {
    flow: "export",
    level: "high",
    sizeLimit: {
      maxBodySize: 1024 * 1024 * 10,
      maxFileSize: 1024 * 1024 * 50,
      maxArrayLength: 50000,
    },
    timeout: { request: 120000, query: 60000, export: 180000 },
    rateLimit: { requests: 10, window: 60000, burst: 12 },
    burstDetection: { enabled: true, threshold: 15, windowMs: 10000 },
  },
  optimization: {
    flow: "optimization",
    level: "high",
    sizeLimit: {
      maxBodySize: 1024 * 1024 * 5,
      maxFileSize: 0,
      maxArrayLength: 10000,
    },
    timeout: { request: 60000, query: 30000, export: 0 },
    rateLimit: { requests: 20, window: 60000, burst: 25 },
    burstDetection: { enabled: true, threshold: 30, windowMs: 10000 },
  },
  analysis: {
    flow: "analysis",
    level: "medium",
    sizeLimit: {
      maxBodySize: 1024 * 500,
      maxFileSize: 0,
      maxArrayLength: 5000,
    },
    timeout: { request: 30000, query: 15000, export: 0 },
    rateLimit: { requests: 30, window: 60000, burst: 40 },
    burstDetection: { enabled: true, threshold: 50, windowMs: 10000 },
  },
};

export const BURST_DETECTION_CONFIG: BurstDetectionConfig = {
  enabled: true,
  threshold: 100,
  windowMs: 10000,
};

export const RATE_LIMIT_ERROR_CODES = {
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  BURST_DETECTED: "BURST_DETECTED",
  RESOURCE_EXHAUSTED: "RESOURCE_EXHAUSTED",
  TIMEOUT: "TIMEOUT",
} as const;
