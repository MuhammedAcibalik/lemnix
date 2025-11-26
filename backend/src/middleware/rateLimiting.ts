/**
 * Rate Limiting Middleware
 * @fileoverview Request rate limiting with adaptive throttling
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "../services/logger";
import { RedisRateLimitStore } from "./rateLimiting/RedisRateLimitStore";
import { InMemoryRateLimitStore } from "./rateLimiting/InMemoryRateLimitStore";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  burstLimit: number;
  burstWindowMs: number;
  adaptiveThrottling: boolean;
  queueDepthThreshold?: number;
}

interface RequestRecord {
  count: number;
  burstCount: number;
  firstRequest: number;
  lastRequest: number;
  blockedCount: number;
}

const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  optimization: {
    windowMs: 10 * 60 * 1000,
    maxRequests: 100, // ✅ Increased for development
    burstLimit: 20, // ✅ Increased for development
    burstWindowMs: 30 * 1000,
    adaptiveThrottling: true,
    queueDepthThreshold: 10,
  },
  export: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 10,
    burstLimit: 3,
    burstWindowMs: 30 * 1000,
    adaptiveThrottling: false,
  },
  monitoring: {
    windowMs: 60 * 1000,
    maxRequests: 60,
    burstLimit: 20,
    burstWindowMs: 10 * 1000,
    adaptiveThrottling: true,
  },
  auth: {
    windowMs: 10 * 60 * 1000,
    maxRequests: 10,
    burstLimit: 3,
    burstWindowMs: 30 * 1000,
    adaptiveThrottling: false,
  },
  default: {
    windowMs: 60 * 1000,
    maxRequests: 100,
    burstLimit: 30,
    burstWindowMs: 10 * 1000,
    adaptiveThrottling: true,
  },
};

/**
 * Rate Limit Store Interface
 */
interface IRateLimitStore {
  getRecord(key: string): Promise<RequestRecord>;
  updateRecord(key: string, record: RequestRecord): Promise<void>;
  getStats(): Promise<{ totalKeys: number; activeRecords: number }>;
  reset(key: string): Promise<boolean>;
}

/**
 * In-Memory Rate Limit Store (for development/fallback)
 */
class InMemoryRateLimitStore implements IRateLimitStore {
  private store = new Map<string, RequestRecord>();

  constructor() {
    setInterval(() => this.cleanupExpiredRecords(), 5 * 60 * 1000);
  }

  async getRecord(key: string): Promise<RequestRecord> {
    if (!this.store.has(key)) {
      const now = Date.now();
      this.store.set(key, {
        count: 0,
        burstCount: 0,
        firstRequest: now,
        lastRequest: now,
        blockedCount: 0,
      });
    }
    return this.store.get(key)!;
  }

  async updateRecord(key: string, record: RequestRecord): Promise<void> {
    this.store.set(key, record);
  }

  private cleanupExpiredRecords(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000;

    for (const [key, record] of this.store) {
      if (now - record.lastRequest > maxAge) {
        this.store.delete(key);
      }
    }
  }

  async getStats(): Promise<{ totalKeys: number; activeRecords: number }> {
    return {
      totalKeys: this.store.size,
      activeRecords: Array.from(this.store.values()).filter((r) => r.count > 0)
        .length,
    };
  }

  async reset(key: string): Promise<boolean> {
    if (this.store.has(key)) {
      const now = Date.now();
      this.store.set(key, {
        count: 0,
        burstCount: 0,
        firstRequest: now,
        lastRequest: now,
        blockedCount: 0,
      });
      return true;
    }
    return false;
  }
}

/**
 * Create rate limit store based on environment
 * Production requires Redis, development can use in-memory fallback
 */
function createRateLimitStore(): IRateLimitStore {
  const isProduction = process.env.NODE_ENV === "production";
  const useRedis = process.env.RATE_LIMIT_STORE === "redis" || isProduction;

  if (useRedis) {
    try {
      logger.info("Using Redis rate limit store");
      return new RedisRateLimitStore();
    } catch (error) {
      if (isProduction) {
        logger.error(
          "Redis is required for production rate limiting. Application cannot start without Redis.",
          error as Error,
        );
        throw new Error(
          "Redis connection failed. Production requires Redis for rate limiting.",
        );
      }
      logger.warn(
        "Redis rate limit store failed, falling back to in-memory store",
        { error: (error as Error).message },
      );
      return new InMemoryRateLimitStore();
    }
  }

  logger.info("Using in-memory rate limit store");
  return new InMemoryRateLimitStore();
}

const rateLimitStore = createRateLimitStore();

const generateRateLimitKey = (req: Request, configType: string): string => {
  const identifier = req.user?.userId || req.ip || "anonymous";
  return `${configType}:${identifier}`;
};

const checkRateLimit = async (
  config: RateLimitConfig,
  key: string,
): Promise<{ allowed: boolean; retryAfter?: number; reason?: string }> => {
  const now = Date.now();
  const record = await rateLimitStore.getRecord(key);

  if (now - record.lastRequest < config.burstWindowMs) {
    if (record.burstCount >= config.burstLimit) {
      return {
        allowed: false,
        retryAfter: Math.ceil(
          (config.burstWindowMs - (now - record.lastRequest)) / 1000,
        ),
        reason: "burst_limit_exceeded",
      };
    }
  } else {
    record.burstCount = 0;
  }

  if (now - record.firstRequest < config.windowMs) {
    if (record.count >= config.maxRequests) {
      return {
        allowed: false,
        retryAfter: Math.ceil(
          (config.windowMs - (now - record.firstRequest)) / 1000,
        ),
        reason: "rate_limit_exceeded",
      };
    }
  } else {
    record.count = 0;
    record.firstRequest = now;
  }

  if (config.adaptiveThrottling && config.queueDepthThreshold) {
    // TODO: Integrate with actual queue monitoring system
    // const queueDepth = await getActualQueueDepth();
    // if (queueDepth > config.queueDepthThreshold) {
    //   const adaptiveLimit = Math.max(1, Math.floor(config.maxRequests * 0.5));
    //   if (record.count >= adaptiveLimit) {
    //     return {
    //       allowed: false,
    //       retryAfter: 30,
    //       reason: 'adaptive_throttling'
    //     };
    //   }
    // }
  }

  return { allowed: true };
};

const updateRequestRecord = async (key: string): Promise<void> => {
  const now = Date.now();
  const record = await rateLimitStore.getRecord(key);

  record.count++;
  record.burstCount++;
  record.lastRequest = now;

  await rateLimitStore.updateRecord(key, record);
};

export const createRateLimit = (configType: string = "default") => {
  const config =
    RATE_LIMIT_CONFIGS[configType] || RATE_LIMIT_CONFIGS["default"];

  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const key = generateRateLimitKey(req, configType);
    if (!config) {
      res.status(500).json({
        error: "Configuration Error",
        message: "Rate limit configuration not found",
      });
      return;
    }

    try {
      const result = await checkRateLimit(config, key);

      if (!result.allowed) {
        const record = await rateLimitStore.getRecord(key);
        record.blockedCount++;
        await rateLimitStore.updateRecord(key, record);

        logger.warn("Rate limit exceeded", {
          key,
          configType,
          reason: result.reason,
          retryAfter: result.retryAfter,
          userId: req.user?.userId,
          ip: req.ip,
          path: req.path,
          userAgent: req.get("User-Agent"),
        });

        res.status(429).json({
          error: "Too Many Requests",
          message: "Rate limit exceeded",
          retryAfter: result.retryAfter,
          reason: result.reason,
        });
        return;
      }

      await updateRequestRecord(key);

      const record = await rateLimitStore.getRecord(key);
      if (config) {
        const remaining = Math.max(0, config.maxRequests - record.count);
        const resetTime = Math.ceil(
          (record.firstRequest + config.windowMs) / 1000,
        );

        res.set({
          "X-RateLimit-Limit": config.maxRequests.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": resetTime.toString(),
          "X-RateLimit-Window": config.windowMs.toString(),
        });
      }

      next();
    } catch (error) {
      logger.error("Rate limit check failed", {
        error: (error as Error).message,
        key,
      });
      // On error, allow the request (fail open for availability)
      next();
    }
  };
};

export const optimizationRateLimit = createRateLimit("optimization");
export const exportRateLimit = createRateLimit("export");
export const monitoringRateLimit = createRateLimit("monitoring");
export const authRateLimit = createRateLimit("auth");
export const apiRateLimit = createRateLimit("default");

export const getRateLimitStats = async (): Promise<{
  store: Record<string, unknown>;
  configs: Record<string, RateLimitConfig>;
}> => {
  return {
    store: await rateLimitStore.getStats(),
    configs: RATE_LIMIT_CONFIGS,
  };
};

export const resetRateLimit = async (key: string): Promise<boolean> => {
  return await rateLimitStore.reset(key);
};

export const ipBasedRateLimit = (
  maxAttempts: number = 10,
  windowMs: number = 10 * 60 * 1000,
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const ip = req.ip || "unknown";
      const key = `auth_attempts:${ip}`;
      const record = await rateLimitStore.getRecord(key);
      const now = Date.now();

      if (now - record.firstRequest > windowMs) {
        record.count = 0;
        record.firstRequest = now;
      }

      if (record.count >= maxAttempts) {
        logger.warn("IP rate limit exceeded for auth attempts", {
          ip,
          attempts: record.count,
          blockedCount: record.blockedCount,
        });

        res.status(429).json({
          error: "Too Many Requests",
          message: "Too many authentication attempts",
          retryAfter: Math.ceil(
            (windowMs - (now - record.firstRequest)) / 1000,
          ),
        });
        return;
      }

      record.count++;
      record.lastRequest = now;
      await rateLimitStore.updateRecord(key, record);

      next();
    } catch (error) {
      logger.error("IP rate limit check failed", {
        error: (error as Error).message,
      });
      // On error, allow the request (fail open for availability)
      next();
    }
  };
};
