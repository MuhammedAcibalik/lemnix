/**
 * @fileoverview HTTP Caching Middleware
 * @module CachingMiddleware
 * @version 1.0.0
 * 
 * ✅ P2-7: ETag support for efficient caching
 * ✅ 304 Not Modified responses
 * ✅ Cache-Control headers
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger } from '../services/logger';

/**
 * Generate ETag from response data
 */
export function generateETag(data: unknown): string {
  const content = JSON.stringify(data);
  return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * Cache configuration per endpoint
 */
interface CacheConfig {
  readonly maxAge: number; // seconds
  readonly mustRevalidate: boolean;
  readonly isPublic: boolean;
}

const CACHE_CONFIGS: Record<string, CacheConfig> = {
  // Cutting lists - Private, revalidate
  '/cutting-list': {
    maxAge: 300, // 5 minutes
    mustRevalidate: true,
    isPublic: false,
  },
  
  // Statistics - Private, longer cache
  '/statistics': {
    maxAge: 600, // 10 minutes
    mustRevalidate: true,
    isPublic: false,
  },
  
  // Optimization results - Private, short cache
  '/enterprise/results': {
    maxAge: 60, // 1 minute
    mustRevalidate: true,
    isPublic: false,
  },
  
  // Default
  default: {
    maxAge: 300,
    mustRevalidate: true,
    isPublic: false,
  },
};

/**
 * Get cache config for endpoint
 */
function getCacheConfig(path: string): CacheConfig {
  for (const [key, config] of Object.entries(CACHE_CONFIGS)) {
    if (path.startsWith(key)) {
      return config;
    }
  }
  return CACHE_CONFIGS.default;
}

/**
 * ETag middleware - Add ETag and handle conditional requests
 */
export function etagMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Only apply to GET requests
  if (req.method !== 'GET') {
    next();
    return;
  }

  // Store original res.json
  const originalJson = res.json.bind(res);

  // Override res.json to add ETag
  res.json = function (data: unknown): Response {
    // Generate ETag from response data
    const etag = generateETag(data);
    
    // Get client's If-None-Match header
    const clientETag = req.headers['if-none-match'];
    
    // If ETags match, return 304 Not Modified
    if (clientETag === etag) {
      logger.info('[CACHE] 304 Not Modified', {
        url: req.url,
        etag,
      });
      
      res.status(304).end();
      return res;
    }
    
    // Set ETag header
    res.setHeader('ETag', etag);
    
    // Get cache config
    const config = getCacheConfig(req.path);
    
    // Set Cache-Control header
    const cacheControl = [
      config.isPublic ? 'public' : 'private',
      `max-age=${config.maxAge}`,
      config.mustRevalidate ? 'must-revalidate' : '',
    ]
      .filter(Boolean)
      .join(', ');
    
    res.setHeader('Cache-Control', cacheControl);
    
    // Log cache headers
    if (process.env.NODE_ENV === 'development') {
      logger.debug('[CACHE] Headers set', {
        url: req.url,
        etag,
        cacheControl,
      });
    }
    
    // Call original json
    return originalJson(data);
  };

  next();
}

/**
 * Cache-Control middleware for specific routes
 */
export function setCacheControl(config: Partial<CacheConfig>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const finalConfig = {
      maxAge: config.maxAge ?? 300,
      mustRevalidate: config.mustRevalidate ?? true,
      isPublic: config.isPublic ?? false,
    };
    
    const cacheControl = [
      finalConfig.isPublic ? 'public' : 'private',
      `max-age=${finalConfig.maxAge}`,
      finalConfig.mustRevalidate ? 'must-revalidate' : '',
    ]
      .filter(Boolean)
      .join(', ');
    
    res.setHeader('Cache-Control', cacheControl);
    next();
  };
}

/**
 * No cache middleware (for mutations)
 */
export function noCache(req: Request, res: Response, next: NextFunction): void {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
}

/**
 * Vary header middleware (for conditional responses)
 */
export function setVaryHeader(headers: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    res.setHeader('Vary', headers.join(', '));
    next();
  };
}

