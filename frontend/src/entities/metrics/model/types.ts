/**
 * Metrics Entity Types
 * Types for performance metrics and Web Vitals
 *
 * @module entities/metrics/model
 * @version 1.0.0
 */

/**
 * Web Vital metric
 */
export interface WebVitalMetric {
  readonly name: string; // LCP, CLS, INP, FCP, TTFB
  readonly value: number;
  readonly rating: "good" | "needs-improvement" | "poor";
  readonly delta: number;
  readonly id: string;
  readonly navigationType: string;
}

/**
 * Web Vitals summary
 */
export interface WebVitalsSummary {
  readonly lcp: {
    readonly p75: number;
    readonly p95: number;
    readonly samples: number;
  };
  readonly cls: {
    readonly p75: number;
    readonly p95: number;
    readonly samples: number;
  };
  readonly inp: {
    readonly p75: number;
    readonly p95: number;
    readonly samples: number;
  };
  readonly fcp: {
    readonly p75: number;
    readonly p95: number;
    readonly samples: number;
  };
  readonly ttfb: {
    readonly p75: number;
    readonly p95: number;
    readonly samples: number;
  };
}
