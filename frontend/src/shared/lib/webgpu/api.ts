/**
 * WebGPU API Client
 *
 * @module shared/lib/webgpu
 * @version 1.0.0
 */

import { api } from "@/shared/api";
import type { WebGPUStatus, WebGPUInfo } from "./types";

const WEBGPU_ENDPOINTS = {
  STATUS: "/webgpu/status",
  INITIALIZE: "/webgpu/initialize",
  INFO: "/webgpu/info",
  CLEANUP: "/webgpu/cleanup",
} as const;

/**
 * Get WebGPU status
 */
export async function getWebGPUStatus(): Promise<WebGPUStatus> {
  try {
    const response = await api.get<WebGPUStatus>(WEBGPU_ENDPOINTS.STATUS);
    return response.data;
  } catch (error) {
    console.warn("WebGPU status check failed:", error);
    return {
      supported: false,
      initialized: false,
    };
  }
}

/**
 * Initialize WebGPU
 */
export async function initializeWebGPU(): Promise<WebGPUStatus> {
  const response = await api.post<WebGPUStatus>(WEBGPU_ENDPOINTS.INITIALIZE);
  return response.data;
}

/**
 * Get WebGPU device info
 */
export async function getWebGPUInfo(): Promise<WebGPUInfo> {
  const response = await api.get<WebGPUInfo>(WEBGPU_ENDPOINTS.INFO);
  return response.data;
}

/**
 * Cleanup WebGPU resources
 */
export async function cleanupWebGPU(): Promise<void> {
  await api.post(WEBGPU_ENDPOINTS.CLEANUP);
}
