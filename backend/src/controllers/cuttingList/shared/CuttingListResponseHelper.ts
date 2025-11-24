/**
 * @fileoverview Cutting List Response Helper
 * @module controllers/cuttingList/shared/CuttingListResponseHelper
 * @version 1.0.0
 * @description Response formatting utilities for cutting list controllers
 */

import type { ApiResponse } from "./CuttingListBaseController";

/**
 * Response helper utilities
 */
export class CuttingListResponseHelper {
  /**
   * Create standardized API response
   */
  static createApiResponse<T>(
    success: boolean,
    data?: T,
    error?: string,
    requestId?: string,
  ): ApiResponse<T> {
    const response = {
      success,
      timestamp: new Date().toISOString(),
      requestId: requestId || `REQ-${Date.now()}`,
    } as ApiResponse<T>;

    if (data !== undefined) {
      (response as ApiResponse<T> & { data: T }).data = data;
    }

    if (error !== undefined) {
      (response as ApiResponse<T> & { error: string }).error = error;
    }

    return response;
  }
}
