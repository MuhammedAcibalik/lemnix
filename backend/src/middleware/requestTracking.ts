/**
 * Request Tracking Middleware (Phase 1, Step 2)
 * Automatically adds request ID and timing to all requests
 * 
 * @module middleware/requestTracking
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import { attachRequestId, attachStartTime } from '../types/apiResponse';

/**
 * Middleware to attach unique request ID and start time
 * This enables consistent tracking and timing across all endpoints
 */
export function requestTrackingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Attach unique request ID
  attachRequestId(req);
  
  // Attach start time for processing time calculation
  attachStartTime(req);
  
  // Log request (optional, can be configured)
  if (process.env.LOG_REQUESTS !== 'false') {
    console.log(`[${req.requestId}] ${req.method} ${req.path} - Started`);
  }
  
  // Log response when finished (optional)
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    if (process.env.LOG_REQUESTS !== 'false') {
      console.log(
        `[${req.requestId}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`
      );
    }
  });
  
  next();
}

/**
 * Extended Express Request with tracking properties
 */
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      startTime?: number;
    }
  }
}

export default requestTrackingMiddleware;
