/**
 * Base Handler (Template Method Pattern)
 * Common error handling and response formatting
 * 
 * @module enterprise/core
 * @version 1.0.0
 */

import { Response } from 'express';
import type { ErrorResponse } from '../../types/enterprise';

/**
 * Abstract base handler with common utilities
 */
export abstract class BaseHandler {
  /**
   * Send error response with consistent format
   */
  protected sendError(
    res: Response,
    statusCode: number,
    code: string,
    message: string,
    details?: Record<string, unknown>
  ): void {
    const response: ErrorResponse = {
      success: false,
      error: {
        code,
        message,
        ...(details && { details })
      },
      metadata: {
        timestamp: new Date().toISOString(),
        version: '5.0.0',
        requestId: this.generateRequestId()
      }
    };

    res.status(statusCode).json(response);
  }

  /**
   * Send success response with consistent format
   */
  protected sendSuccess<T>(
    res: Response,
    data: T,
    metadata?: Record<string, unknown>
  ): void {
    res.status(200).json({
      success: true,
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        version: '5.0.0',
        ...metadata
      }
    });
  }

  /**
   * Generate unique request ID
   */
  protected generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Handle errors with proper typing
   */
  protected handleError(
    res: Response,
    error: unknown,
    code: string = 'INTERNAL_ERROR'
  ): void {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    const details = error instanceof Error && process.env['NODE_ENV'] !== 'production' 
      ? { stack: error.stack } 
      : undefined;

    this.sendError(res, 500, code, message, details);
  }
}

