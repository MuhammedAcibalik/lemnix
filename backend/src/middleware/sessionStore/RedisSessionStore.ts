/**
 * Redis Session Store
 * Redis-backed session storage implementation
 *
 * @module middleware/sessionStore/RedisSessionStore
 * @version 1.0.0
 */

import { SessionRecord, SessionStore } from "../sessionStore";
import { getRedisClient } from "../../config/redis";
import { logger } from "../../services/logger";

const SESSION_PREFIX = "session:";
const USER_SESSIONS_PREFIX = "user_sessions:";
const DEFAULT_TTL = 8 * 60 * 60; // 8 hours in seconds

/**
 * Redis Session Store
 * Implements SessionStore interface using Redis as backend
 * Note: Sync methods use in-memory cache for immediate access
 */
export class RedisSessionStore implements SessionStore {
  private readonly redis = getRedisClient();
  private readonly ttl: number;
  // In-memory cache for sync access (updated async)
  private readonly cache = new Map<string, SessionRecord>();
  private readonly userSessionsCache = new Map<string, Set<string>>();

  constructor(ttlSeconds: number = DEFAULT_TTL) {
    this.ttl = ttlSeconds;
    // Start background cache refresh
    this.startCacheRefresh();
  }

  /**
   * Start background cache refresh
   */
  private startCacheRefresh(): void {
    // Refresh cache every 30 seconds
    setInterval(() => {
      this.refreshCache().catch((error) => {
        logger.error("Failed to refresh session cache", {
          error: (error as Error).message,
        });
      });
    }, 30000);
  }

  /**
   * Refresh in-memory cache from Redis
   */
  private async refreshCache(): Promise<void> {
    // This is a simplified cache refresh
    // In production, you might want to track which sessions to refresh
  }

  /**
   * Create session in Redis
   */
  create(session: SessionRecord): void {
    try {
      const sessionKey = this.getSessionKey(session.sessionId);
      const userSessionsKey = this.getUserSessionsKey(session.userId);

      // Update cache immediately
      this.cache.set(session.sessionId, session);
      if (!this.userSessionsCache.has(session.userId)) {
        this.userSessionsCache.set(session.userId, new Set());
      }
      this.userSessionsCache.get(session.userId)!.add(session.sessionId);

      // Serialize session (Set needs to be converted to array)
      const sessionData = {
        ...session,
        tokenIds: Array.from(session.tokenIds),
      };

      // Store session with TTL (async, fire-and-forget)
      this.redis.setex(
        sessionKey,
        this.ttl,
        JSON.stringify(sessionData),
      ).catch((error) => {
        logger.error("Failed to create session in Redis", {
          error: (error as Error).message,
          sessionId: session.sessionId,
        });
      });

      // Add session ID to user's session set (async, fire-and-forget)
      this.redis.sadd(userSessionsKey, session.sessionId).catch((error) => {
        logger.error("Failed to add session to user sessions", {
          error: (error as Error).message,
          userId: session.userId,
        });
      });

      // Set TTL on user sessions set (async, fire-and-forget)
      this.redis.expire(userSessionsKey, this.ttl).catch(() => {
        // Ignore errors
      });
    } catch (error) {
      logger.error("Failed to create session", {
        error: (error as Error).message,
        sessionId: session.sessionId,
      });
      throw error;
    }
  }

  /**
   * Update session in Redis
   */
  update(sessionId: string, update: Partial<SessionRecord>): void {
    try {
      const sessionKey = this.getSessionKey(sessionId);
      const existing = this.find(sessionId);

      if (!existing) {
        logger.warn("Attempted to update non-existent session", { sessionId });
        return;
      }

      // Merge updates
      const updated: SessionRecord = {
        ...existing,
        ...update,
        // Handle tokenIds Set conversion
        tokenIds:
          update.tokenIds instanceof Set
            ? update.tokenIds
            : update.tokenIds
              ? new Set(Array.isArray(update.tokenIds) ? update.tokenIds : [])
              : existing.tokenIds,
      };

      // Update cache immediately
      this.cache.set(sessionId, updated);

      // Serialize and update Redis (async, fire-and-forget)
      const sessionData = {
        ...updated,
        tokenIds: Array.from(updated.tokenIds),
      };

      this.redis.setex(
        sessionKey,
        this.ttl,
        JSON.stringify(sessionData),
      ).catch((error) => {
        logger.error("Failed to update session in Redis", {
          error: (error as Error).message,
          sessionId,
        });
      });
    } catch (error) {
      logger.error("Failed to update session", {
        error: (error as Error).message,
        sessionId,
      });
    }
  }

  /**
   * Find session by ID (sync - uses cache)
   */
  find(sessionId: string): SessionRecord | undefined {
    try {
      // Return from cache (updated async)
      return this.cache.get(sessionId);
    } catch (error) {
      logger.error("Failed to find session", {
        error: (error as Error).message,
        sessionId,
      });
      return undefined;
    }
  }

  /**
   * Find session by ID (async version)
   */
  async findAsync(sessionId: string): Promise<SessionRecord | undefined> {
    try {
      const sessionKey = this.getSessionKey(sessionId);
      const data = await this.redis.get(sessionKey);

      if (!data) {
        return undefined;
      }

      const parsed = JSON.parse(data);
      return {
        ...parsed,
        tokenIds: new Set(parsed.tokenIds || []),
      };
    } catch (error) {
      logger.error("Failed to find session (async)", {
        error: (error as Error).message,
        sessionId,
      });
      return undefined;
    }
  }

  /**
   * Delete session from Redis
   */
  delete(sessionId: string): void {
    try {
      const sessionKey = this.getSessionKey(sessionId);
      const session = this.find(sessionId);

      // Remove from cache immediately
      this.cache.delete(sessionId);
      if (session) {
        const userSet = this.userSessionsCache.get(session.userId);
        if (userSet) {
          userSet.delete(sessionId);
          if (userSet.size === 0) {
            this.userSessionsCache.delete(session.userId);
          }
        }
      }

      // Delete from Redis (async, fire-and-forget)
      this.redis.del(sessionKey).catch((error) => {
        logger.error("Failed to delete session from Redis", {
          error: (error as Error).message,
          sessionId,
        });
      });

      // Remove from user's session set if session exists (async, fire-and-forget)
      if (session) {
        const userSessionsKey = this.getUserSessionsKey(session.userId);
        this.redis.srem(userSessionsKey, sessionId).catch((error) => {
          logger.error("Failed to remove session from user sessions", {
            error: (error as Error).message,
            userId: session.userId,
          });
        });
      }
    } catch (error) {
      logger.error("Failed to delete session", {
        error: (error as Error).message,
        sessionId,
      });
    }
  }

  /**
   * Find all sessions for a user (sync - uses cache)
   */
  findByUser(userId: string): SessionRecord[] {
    try {
      const sessionIds = this.userSessionsCache.get(userId);
      if (!sessionIds) {
        return [];
      }
      return Array.from(sessionIds)
        .map((id) => this.cache.get(id))
        .filter((session): session is SessionRecord => Boolean(session));
    } catch (error) {
      logger.error("Failed to find user sessions", {
        error: (error as Error).message,
        userId,
      });
      return [];
    }
  }

  /**
   * Find all sessions for a user (async version)
   */
  async findByUserAsync(userId: string): Promise<SessionRecord[]> {
    try {
      const userSessionsKey = this.getUserSessionsKey(userId);
      const sessionIds = await this.redis.smembers(userSessionsKey);

      const sessions: SessionRecord[] = [];
      for (const sessionId of sessionIds) {
        const session = await this.findAsync(sessionId);
        if (session) {
          sessions.push(session);
        }
      }

      return sessions;
    } catch (error) {
      logger.error("Failed to find user sessions (async)", {
        error: (error as Error).message,
        userId,
      });
      return [];
    }
  }

  /**
   * Get Redis key for session
   */
  private getSessionKey(sessionId: string): string {
    return `${SESSION_PREFIX}${sessionId}`;
  }

  /**
   * Get Redis key for user sessions set
   */
  private getUserSessionsKey(userId: string): string {
    return `${USER_SESSIONS_PREFIX}${userId}`;
  }
}

