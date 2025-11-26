/**
 * Redis Rate Limit Store
 * Redis-backed rate limiting store for distributed rate limiting
 *
 * @module middleware/rateLimiting/RedisRateLimitStore
 * @version 1.0.0
 */

import { getRedisClient } from "../../config/redis";
import { logger } from "../../services/logger";

const RATE_LIMIT_PREFIX = "rate_limit:";
const DEFAULT_TTL = 24 * 60 * 60; // 24 hours in seconds

interface RequestRecord {
  count: number;
  burstCount: number;
  firstRequest: number;
  lastRequest: number;
  blockedCount: number;
}

/**
 * Redis Rate Limit Store
 * Implements distributed rate limiting using Redis
 */
export class RedisRateLimitStore {
  private readonly redis = getRedisClient();
  private readonly ttl: number;

  constructor(ttlSeconds: number = DEFAULT_TTL) {
    this.ttl = ttlSeconds;
  }

  /**
   * Get rate limit record from Redis
   */
  async getRecord(key: string): Promise<RequestRecord> {
    try {
      const redisKey = `${RATE_LIMIT_PREFIX}${key}`;
      const data = await this.redis.get(redisKey);

      if (!data) {
        const now = Date.now();
        const defaultRecord: RequestRecord = {
          count: 0,
          burstCount: 0,
          firstRequest: now,
          lastRequest: now,
          blockedCount: 0,
        };
        // Set default record with TTL
        await this.redis.setex(
          redisKey,
          this.ttl,
          JSON.stringify(defaultRecord),
        );
        return defaultRecord;
      }

      return JSON.parse(data) as RequestRecord;
    } catch (error) {
      logger.error("Failed to get rate limit record from Redis", {
        error: (error as Error).message,
        key,
      });
      // Fallback to default record on error
      const now = Date.now();
      return {
        count: 0,
        burstCount: 0,
        firstRequest: now,
        lastRequest: now,
        blockedCount: 0,
      };
    }
  }

  /**
   * Update rate limit record in Redis
   */
  async updateRecord(key: string, record: RequestRecord): Promise<void> {
    try {
      const redisKey = `${RATE_LIMIT_PREFIX}${key}`;
      await this.redis.setex(redisKey, this.ttl, JSON.stringify(record));
    } catch (error) {
      logger.error("Failed to update rate limit record in Redis", {
        error: (error as Error).message,
        key,
      });
      // Don't throw - rate limiting should be permissive on Redis errors
    }
  }

  /**
   * Get statistics about rate limit store
   */
  async getStats(): Promise<{ totalKeys: number; activeRecords: number }> {
    try {
      const pattern = `${RATE_LIMIT_PREFIX}*`;
      const keys = await this.redis.keys(pattern);
      let activeRecords = 0;

      // Count active records (with count > 0)
      for (const key of keys) {
        const data = await this.redis.get(key);
        if (data) {
          const record = JSON.parse(data) as RequestRecord;
          if (record.count > 0) {
            activeRecords++;
          }
        }
      }

      return {
        totalKeys: keys.length,
        activeRecords,
      };
    } catch (error) {
      logger.error("Failed to get rate limit stats from Redis", {
        error: (error as Error).message,
      });
      return {
        totalKeys: 0,
        activeRecords: 0,
      };
    }
  }

  /**
   * Reset rate limit for a specific key
   */
  async reset(key: string): Promise<boolean> {
    try {
      const redisKey = `${RATE_LIMIT_PREFIX}${key}`;
      const now = Date.now();
      const resetRecord: RequestRecord = {
        count: 0,
        burstCount: 0,
        firstRequest: now,
        lastRequest: now,
        blockedCount: 0,
      };
      await this.redis.setex(redisKey, this.ttl, JSON.stringify(resetRecord));
      logger.info("Rate limit reset", { key });
      return true;
    } catch (error) {
      logger.error("Failed to reset rate limit in Redis", {
        error: (error as Error).message,
        key,
      });
      return false;
    }
  }

  /**
   * Delete expired records (cleanup)
   * Redis TTL handles expiration automatically, but this can be used for manual cleanup
   */
  async cleanupExpiredRecords(): Promise<number> {
    try {
      const pattern = `${RATE_LIMIT_PREFIX}*`;
      const keys = await this.redis.keys(pattern);
      let deletedCount = 0;

      for (const key of keys) {
        const ttl = await this.redis.ttl(key);
        if (ttl === -1) {
          // Key exists but has no TTL, set one
          await this.redis.expire(key, this.ttl);
        } else if (ttl === -2) {
          // Key doesn't exist, skip
          continue;
        }
        // Keys with TTL will expire automatically
      }

      return deletedCount;
    } catch (error) {
      logger.error("Failed to cleanup expired rate limit records", {
        error: (error as Error).message,
      });
      return 0;
    }
  }
}

