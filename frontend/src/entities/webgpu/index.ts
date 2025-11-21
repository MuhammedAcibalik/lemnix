/**
 * LEMNİX WebGPU Entity - Public API
 *
 * @module entities/webgpu
 * @version 1.0.0
 */

// Types
export type {
  WebGPUStatus,
  WebGPUPerformanceMetrics,
  WebGPUPreference,
} from "./model/types";

// API functions
export { getWebGPUStatus } from "./api/webgpuApi";

// React Query hooks
export { webgpuKeys, useWebGPUStatus } from "./api/webgpuQueries";
