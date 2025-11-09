/**
 * WebGPU Module
 *
 * @module shared/lib/webgpu
 * @version 1.0.0
 */

export type { WebGPUStatus, WebGPUInfo } from "./types";
export {
  getWebGPUStatus,
  initializeWebGPU,
  getWebGPUInfo,
  cleanupWebGPU,
} from "./api";
export {
  useWebGPU,
  useWebGPUStatus,
  useInitializeWebGPU,
  useWebGPUInfo,
  webgpuKeys,
} from "./useWebGPU";
