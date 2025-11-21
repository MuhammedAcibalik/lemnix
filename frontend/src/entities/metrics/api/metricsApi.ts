/**
 * Metrics API Client
 * Backend API calls for performance metrics
 *
 * @module entities/metrics/api
 * @version 1.0.0
 */

import { api } from "@/shared";
import type { WebVitalMetric, WebVitalsSummary } from "../model/types";

/**
 * API endpoints
 */
const ENDPOINTS = {
  WEB_VITALS: "/metrics/web-vitals",
  WEB_VITALS_SUMMARY: "/metrics/web-vitals/summary",
} as const;

/**
 * Report Web Vital metric
 * ✅ P3-12: Backend reporting
 */
export async function reportWebVital(metric: WebVitalMetric): Promise<{
  readonly success: boolean;
  readonly message: string;
}> {
  try {
    const response = await api.post<{
      readonly success: boolean;
      readonly message: string;
    }>(ENDPOINTS.WEB_VITALS, metric);
    return response.data;
  } catch (error) {
    // Silently fail - don't break user experience
    console.warn("Failed to report Web Vital:", error);
    return {
      success: false,
      message: "Failed to report metric",
    };
  }
}

/**
 * Get Web Vitals summary
 */
export async function getWebVitalsSummary(): Promise<WebVitalsSummary> {
  try {
    const response = await api.get<{
      readonly success: boolean;
      readonly data: WebVitalsSummary;
    }>(ENDPOINTS.WEB_VITALS_SUMMARY);
    return response.data.data;
  } catch (error) {
    console.warn("Failed to get Web Vitals summary:", error);
    // Return empty summary
    return {
      lcp: { p75: 0, p95: 0, samples: 0 },
      cls: { p75: 0, p95: 0, samples: 0 },
      inp: { p75: 0, p95: 0, samples: 0 },
      fcp: { p75: 0, p95: 0, samples: 0 },
      ttfb: { p75: 0, p95: 0, samples: 0 },
    };
  }
}
