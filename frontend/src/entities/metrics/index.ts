/**
 * Metrics Entity
 * Public API exports
 *
 * @module entities/metrics
 */

export { reportWebVital, getWebVitalsSummary } from "./api/metricsApi";
export { useWebVitalsSummary, metricsKeys } from "./api/metricsQueries";

export type { WebVitalMetric, WebVitalsSummary } from "./model/types";
