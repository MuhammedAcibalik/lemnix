/**
 * WebGPU API Client
 * Note: Only STATUS endpoint is used. WebGPU operations run in browser, not backend.
 *
 * @module shared/lib/webgpu
 * @version 1.0.0
 */

import { api } from "@/shared/api";
import type { WebGPUStatus } from "./types";

const WEBGPU_ENDPOINTS = {
  STATUS: "/webgpu/status",
} as const;

/**
 * Get WebGPU status
 * WebGPU operations run in browser, backend only provides status information
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
