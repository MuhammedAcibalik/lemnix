/**
 * LEMNİX WebGPU Entity API
 * Backend API calls for WebGPU operations
 *
 * @module entities/webgpu/api
 * @version 1.0.0 - Enterprise WebGPU Integration
 */

import { api } from "@/shared/api/client";
import type { WebGPUStatus } from "../model/types";

/**
 * API endpoints
 * Note: Only STATUS endpoint is used. WebGPU operations run in browser, not backend.
 */
const ENDPOINTS = {
  STATUS: "/webgpu/status",
} as const;

/**
 * Get WebGPU status
 * Checks if WebGPU is supported and initialized
 * WebGPU operations run in browser, backend only provides status information
 */
export async function getWebGPUStatus(): Promise<WebGPUStatus> {
  try {
    const response = await api.get<WebGPUStatus>(ENDPOINTS.STATUS);
    return response.data;
  } catch (error) {
    console.warn("WebGPU status check failed:", error);
    return {
      supported: false,
      initialized: false,
      error: "Failed to fetch WebGPU status",
    };
  }
}
