/**
 * LEMNİX Correlation ID Middleware
 * Ensures every request has a unique correlation ID for tracking
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface CorrelationRequest extends Request {
  correlationId: string;
  requestId: string;
  startTime: number;
}

export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const correlationId = req.headers['x-correlation-id'] as string || uuidv4();
  const requestId = req.headers['x-request-id'] as string || uuidv4();
  
  (req as CorrelationRequest).correlationId = correlationId;
  (req as CorrelationRequest).requestId = requestId;
  (req as CorrelationRequest).startTime = Date.now();
  
  res.setHeader('X-Correlation-ID', correlationId);
  res.setHeader('X-Request-ID', requestId);
  
  req.headers['x-correlation-id'] = correlationId;
  req.headers['x-request-id'] = requestId;
  
  next();
}

export function requestTimingMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = (req as CorrelationRequest).startTime || Date.now();
  
  const originalEnd = res.end.bind(res);
  res.end = function(chunk?: unknown, encoding?: BufferEncoding | (() => void), cb?: (() => void)) {
    const duration = Date.now() - startTime;
    
    res.setHeader('X-Response-Time', `${duration}ms`);
    res.setHeader('X-Request-Duration', `${duration}ms`);
    
    // Call original end function with proper parameters
    return originalEnd(chunk, encoding as BufferEncoding, cb);
  };
  
  next();
}

export function getCorrelationId(req: Request): string | undefined {
  return (req as CorrelationRequest).correlationId;
}