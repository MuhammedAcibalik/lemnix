/**
 * @fileoverview Redis-based caching service with L1/L2 architecture
 * @module RedisCache
 * @version 1.0.0
 */

import { logger } from '../logger';

/**
 * Cache options for TTL and invalidation
 */
interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Tags for cache invalidation
}

/**
 * L1: In-memory cache with TTL
 */
class MemoryCache {
  private cache: Map<string, { value: unknown; expires: number; tags: string[] }> = new Map();
  private readonly defaultTTL = 300; // 5 minutes

  set(key: string, value: unknown, options: CacheOptions = {}): void {
    const ttl = options.ttl ?? this.defaultTTL;
    const expires = Date.now() + ttl * 1000;
    const tags = options.tags ?? [];
    
    this.cache.set(key, { value, expires, tags });
    this.scheduleCleanup();
  }

  get(key: string): unknown | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  invalidateByTag(tag: string): void {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  private scheduleCleanup(): void {
    // Cleanup expired entries every minute
    if (this.cache.size > 100) {
      this.cleanup();
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key);
      }
    }
  }

  getStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0 // TODO: Implement hit rate tracking
    };
  }
}

/**
 * L2: Redis cache (optional, falls back to memory-only)
 * 
 * Note: Redis integration requires redis package and connection setup.
 * For now, this is a placeholder that uses only L1 memory cache.
 * To enable Redis:
 * 1. npm install redis
 * 2. Configure REDIS_URL in environment
 * 3. Implement Redis client connection
 */
export class RedisCache {
  private static instance: RedisCache;
  private memoryCache: MemoryCache;
  private redisEnabled = false;
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0
  };

  private constructor() {
    this.memoryCache = new MemoryCache();
    
    // TODO: Initialize Redis client when redis package is installed
    // this.initializeRedis();
    
    logger.info('Cache service initialized', {
      l1: 'memory',
      l2: this.redisEnabled ? 'redis' : 'disabled'
    });
  }

  public static getInstance(): RedisCache {
    if (!RedisCache.instance) {
      RedisCache.instance = new RedisCache();
    }
    return RedisCache.instance;
  }

  /**
   * Get value from cache (L1 -> L2)
   */
  async get<T>(key: string): Promise<T | null> {
    // Try L1 first (memory)
    const l1Value = this.memoryCache.get(key);
    if (l1Value !== null) {
      this.stats.hits++;
      logger.debug('[Cache] L1 HIT', { key });
      return l1Value as T;
    }

    // Try L2 (Redis) if enabled
    if (this.redisEnabled) {
      // TODO: Implement Redis get
      // const l2Value = await this.redisClient.get(key);
      // if (l2Value) {
      //   const parsed = JSON.parse(l2Value);
      //   this.memoryCache.set(key, parsed); // Populate L1
      //   this.stats.hits++;
      //   return parsed as T;
      // }
    }

    this.stats.misses++;
    logger.debug('[Cache] MISS', { key });
    return null;
  }

  /**
   * Set value in cache (L1 + L2)
   */
  async set(key: string, value: unknown, options: CacheOptions = {}): Promise<void> {
    // Set in L1
    this.memoryCache.set(key, value, options);
    
    // Set in L2 (Redis) if enabled
    if (this.redisEnabled) {
      // TODO: Implement Redis set
      // const ttl = options.ttl ?? 300;
      // await this.redisClient.setex(key, ttl, JSON.stringify(value));
    }

    this.stats.sets++;
    logger.debug('[Cache] SET', { key, ttl: options.ttl });
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
    
    if (this.redisEnabled) {
      // TODO: Implement Redis delete
      // await this.redisClient.del(key);
    }

    this.stats.deletes++;
    logger.debug('[Cache] DELETE', { key });
  }

  /**
   * Invalidate cache by tag
   */
  async invalidateByTag(tag: string): Promise<void> {
    this.memoryCache.invalidateByTag(tag);
    
    if (this.redisEnabled) {
      // TODO: Implement Redis tag-based invalidation
      // This requires maintaining a separate index of tags -> keys
    }

    logger.info('[Cache] Tag invalidated', { tag });
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();
    
    if (this.redisEnabled) {
      // TODO: Implement Redis flush
      // await this.redisClient.flushdb();
    }

    logger.warn('[Cache] Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    l1: { size: number };
    hits: number;
    misses: number;
    hitRate: number;
    sets: number;
    deletes: number;
  } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;

    return {
      l1: this.memoryCache.getStats(),
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: Number(hitRate.toFixed(2)),
      sets: this.stats.sets,
      deletes: this.stats.deletes
    };
  }

  /**
   * Warmup cache with hot data
   */
  async warmup(dataLoader: () => Promise<Map<string, unknown>>): Promise<void> {
    try {
      logger.info('[Cache] Starting cache warmup...');
      const data = await dataLoader();
      
      for (const [key, value] of data.entries()) {
        await this.set(key, value, { ttl: 600 }); // 10 minutes
      }
      
      logger.info('[Cache] Cache warmup completed', { count: data.size });
    } catch (error) {
      logger.error('[Cache] Warmup failed', { error });
    }
  }
}

/**
 * Export singleton instance
 */
export const cacheService = RedisCache.getInstance();

/**
 * Cache key builders for consistency
 */
export const CacheKeys = {
  cuttingList: (id: string) => `cutting-list:${id}`,
  cuttingLists: (userId: string) => `cutting-lists:user:${userId}`,
  cuttingListsByWeek: (userId: string, week: number) => `cutting-lists:user:${userId}:week:${week}`,
  optimization: (id: string) => `optimization:${id}`,
  optimizations: (userId: string) => `optimizations:user:${userId}`,
  optimizationsByAlgorithm: (algorithm: string) => `optimizations:algorithm:${algorithm}`,
  statistics: (listId: string) => `statistics:list:${listId}`,
  profileUsage: (profileType: string) => `profile-usage:${profileType}`,
} as const;

/**
 * Cache tags for invalidation groups
 */
export const CacheTags = {
  CUTTING_LISTS: 'cutting-lists',
  OPTIMIZATIONS: 'optimizations',
  STATISTICS: 'statistics',
  USERS: 'users',
} as const;

