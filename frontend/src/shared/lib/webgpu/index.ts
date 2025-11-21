/**
 * WebGPU Module
 * Note: Only STATUS endpoint is used. WebGPU operations run in browser, not backend.
 *
 * @module shared/lib/webgpu
 * @version 1.0.0
 */

export type { WebGPUStatus } from "./types";
export { getWebGPUStatus } from "./api";
export { useWebGPU, useWebGPUStatus, webgpuKeys } from "./useWebGPU";
