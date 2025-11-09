/**
 * LEMNİX WebGPU Entity - Public API
 *
 * @module entities/webgpu
 * @version 1.0.0
 */

// Types
export type {
  WebGPUStatus,
  WebGPUInfo,
  WebGPUOptimizationRequest,
  WebGPUOptimizationResult,
  WebGPUPerformanceMetrics,
  WebGPUPreference,
} from "./model/types";

// API functions
export {
  getWebGPUStatus,
  initializeWebGPU,
  runWebGPUOptimization,
  getWebGPUInfo,
  cleanupWebGPU,
} from "./api/webgpuApi";

// React Query hooks
export {
  webgpuKeys,
  useWebGPUStatus,
  useWebGPUInfo,
  useInitializeWebGPU,
  useWebGPUOptimization,
  useCleanupWebGPU,
} from "./api/webgpuQueries";
