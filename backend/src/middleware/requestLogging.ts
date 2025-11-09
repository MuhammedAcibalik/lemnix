/**
 * @fileoverview Request Logging Middleware
 * @module middleware/requestLogging
 * @version 1.0.0
 *
 * 📊 CRITICAL: Request logging and monitoring
 * - Logs all incoming requests
 * - Tracks performance metrics
 * - Maintains audit trail
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export interface LoggedRequest extends Request {
  startTime?: number;
  requestId?: string;
}

/**
 * Log request details
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export function logRequestDetails(
  req: LoggedRequest,
  res: Response,
  next: NextFunction,
): void {
  try {
    // Generate unique request ID
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    req.requestId = requestId;
    req.startTime = Date.now();

    // Log request details
    logger.info("Request received", {
      requestId,
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      contentType: req.get("Content-Type"),
      contentLength: req.get("Content-Length"),
      timestamp: new Date().toISOString(),
    });

    // Log response when finished
    res.on("finish", () => {
      const duration = req.startTime ? Date.now() - req.startTime : 0;

      logger.info("Request completed", {
        requestId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        timestamp: new Date().toISOString(),
      });
    });

    // Log errors
    res.on("error", (error) => {
      logger.error("Request error", {
        requestId,
        method: req.method,
        url: req.url,
        error: error.message,
        stack: error.stack,
        ip: req.ip,
        timestamp: new Date().toISOString(),
      });
    });

    next();
  } catch (error) {
    logger.error("Request logging error", {
      error: (error as Error).message,
      stack: (error as Error).stack,
      ip: req.ip,
    });

    // Don't block the request if logging fails
    next();
  }
}
