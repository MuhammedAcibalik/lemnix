/**
 * In-Memory Rate Limit Store
 * Fallback implementation for development or when Redis is unavailable
 *
 * @module middleware/rateLimiting/InMemoryRateLimitStore
 * @version 1.0.0
 */

import { logger } from "../../services/logger";

interface RequestRecord {
  count: number;
  burstCount: number;
  firstRequest: number;
  lastRequest: number;
  blockedCount: number;
}

/**
 * In-Memory Rate Limit Store
 * For development/fallback use only
 */
export class InMemoryRateLimitStore {
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
      logger.info("Rate limit reset", { key });
      return true;
    }
    return false;
  }
}

