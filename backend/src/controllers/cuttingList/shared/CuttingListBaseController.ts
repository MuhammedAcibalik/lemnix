/**
 * @fileoverview Cutting List Base Controller
 * @module controllers/cuttingList/shared/CuttingListBaseController
 * @version 1.0.0
 * @description Base controller with shared utilities for cutting list controllers
 */

import { Request, Response, NextFunction } from "express";

/**
 * API Response structure (legacy - will be migrated to ApiSuccessResponse)
 */
export interface ApiResponse<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly message?: string;
  readonly timestamp: string;
  readonly requestId?: string;
}

/**
 * Base controller with shared utilities
 */
export abstract class CuttingListBaseController {
  protected requestCounter: number = 0;

  /**
   * Generate unique request ID
   */
  protected generateRequestId(): string {
    return `REQ-${Date.now()}-${++this.requestCounter}`;
  }

  /**
   * Generate unique ID
   */
  protected generateId(): string {
    return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create API response
   */
  protected createResponse<T>(
    success: boolean,
    data?: T,
    error?: string,
    requestId?: string,
  ): ApiResponse<T> {
    const response = {
      success,
      timestamp: new Date().toISOString(),
      requestId: requestId || this.generateRequestId(),
    } as ApiResponse<T>;

    if (data !== undefined) {
      (response as ApiResponse<T> & { data: T }).data = data;
    }

    if (error !== undefined) {
      (response as ApiResponse<T> & { error: string }).error = error;
    }

    return response;
  }

  /**
   * Handle async errors
   */
  protected asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
  ) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  };
}
