/**
 * LEMNİX WebGPU Entity API
 * Backend API calls for WebGPU operations
 * 
 * @module entities/webgpu/api
 * @version 1.0.0 - Enterprise WebGPU Integration
 */

import { api } from '@/shared/api/client';
import type {
  WebGPUStatus,
  WebGPUInfo,
  WebGPUOptimizationRequest,
  WebGPUOptimizationResult,
} from '../model/types';

/**
 * API endpoints
 */
const ENDPOINTS = {
  STATUS: '/webgpu/status',
  INITIALIZE: '/webgpu/initialize',
  OPTIMIZE: '/webgpu/optimize',
  INFO: '/webgpu/info',
  CLEANUP: '/webgpu/cleanup',
} as const;

/**
 * Get WebGPU status
 * Checks if WebGPU is supported and initialized
 */
export async function getWebGPUStatus(): Promise<WebGPUStatus> {
  try {
    const response = await api.get<WebGPUStatus>(ENDPOINTS.STATUS);
    return response.data;
  } catch (error) {
    console.warn('WebGPU status check failed:', error);
    return {
      supported: false,
      initialized: false,
      error: 'Failed to fetch WebGPU status',
    };
  }
}

/**
 * Initialize WebGPU
 * Attempts to initialize WebGPU device
 */
export async function initializeWebGPU(): Promise<WebGPUStatus> {
  try {
    const response = await api.post<WebGPUStatus>(ENDPOINTS.INITIALIZE);
    return response.data;
  } catch (error) {
    console.error('Failed to initialize WebGPU:', error);
    throw error;
  }
}

/**
 * Run WebGPU optimization
 * GPU-accelerated optimization (FFD/BFD only)
 */
export async function runWebGPUOptimization(
  request: WebGPUOptimizationRequest
): Promise<WebGPUOptimizationResult> {
  try {
    const response = await api.post<WebGPUOptimizationResult>(
      ENDPOINTS.OPTIMIZE,
      request,
      {
        timeout: 60000, // 60 seconds for GPU computation
      }
    );
    return response.data;
  } catch (error) {
    console.error('WebGPU optimization failed:', error);
    throw error;
  }
}

/**
 * Get WebGPU device information
 * Detailed hardware capabilities
 */
export async function getWebGPUInfo(): Promise<WebGPUInfo> {
  try {
    const response = await api.get<WebGPUInfo>(ENDPOINTS.INFO);
    return response.data;
  } catch (error) {
    console.warn('Failed to fetch WebGPU info:', error);
    return {
      adapter: undefined,
      device: undefined,
      capabilities: undefined,
    };
  }
}

/**
 * Cleanup WebGPU resources
 * Releases GPU memory and resources
 */
export async function cleanupWebGPU(): Promise<void> {
  try {
    await api.post(ENDPOINTS.CLEANUP);
  } catch (error) {
    console.warn('Failed to cleanup WebGPU resources:', error);
  }
}

