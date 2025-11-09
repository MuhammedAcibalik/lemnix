/**
 * @fileoverview Suggestion Pattern Repository
 * @module repositories/SuggestionPatternRepository
 * @version 1.0.0
 *
 * Data access layer for SuggestionPattern operations
 * Follows SOLID principles with single responsibility
 */

import { prisma } from "../config/database";
import { Prisma } from "@prisma/client";
import { logger } from "../services/logger";
import {
  normalizeString,
  createContextKey,
  createPatternKey,
} from "../utils/stringNormalizer";

// Type-safe Prisma client wrapper
const suggestionPatternClient = prisma as unknown as {
  suggestionPattern: {
    create: (args: {
      data: Record<string, unknown>;
    }) => Promise<Record<string, unknown>>;
    findMany: (args?: {
      where?: Record<string, unknown>;
      orderBy?: Record<string, unknown> | Record<string, unknown>[];
      take?: number;
      distinct?: string[];
      select?: Record<string, unknown>;
    }) => Promise<Record<string, unknown>[]>;
    findUnique: (args: {
      where: Record<string, unknown>;
    }) => Promise<Record<string, unknown> | null>;
    update: (args: {
      where: Record<string, unknown>;
      data: Record<string, unknown>;
    }) => Promise<Record<string, unknown>>;
    upsert: (args: {
      where: Record<string, unknown>;
      create: Record<string, unknown>;
      update: Record<string, unknown>;
    }) => Promise<Record<string, unknown>>;
    count: (args?: { where?: Record<string, unknown> }) => Promise<number>;
    aggregate: (args: {
      _avg: Record<string, unknown>;
    }) => Promise<{ _avg: Record<string, unknown> }>;
    groupBy: (args: { by: string[] }) => Promise<Record<string, unknown>[]>;
    deleteMany: (args: {
      where: Record<string, unknown>;
    }) => Promise<{ count: number }>;
  };
};

type SuggestionPattern = Record<string, unknown>;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface PatternStatistics {
  readonly totalPatterns: number;
  readonly highConfidence: number;
  readonly mediumConfidence: number;
  readonly lowConfidence: number;
  readonly averageConfidence: number;
  readonly mostFrequent: ReadonlyArray<SuggestionPattern>;
}

interface PatternCreateInput {
  readonly contextKey: string;
  readonly patternKey: string;
  readonly productName: string;
  readonly size: string;
  readonly profile: string;
  readonly measurement: string;
  readonly quantity: number;
  readonly orderQuantity: number;
  readonly ratio: number;
  readonly frequency: number;
  readonly confidence: number;
  readonly lastUsed: Date;
  readonly averageQuantity: number;
  readonly averageRatio: number;
  readonly contexts: readonly string[];
  readonly variations: readonly string[];
  readonly ratioHistory: Array<{
    orderQty: number;
    profileQty: number;
    ratio: number;
  }>;
  readonly metadata?: Record<string, unknown>;
}

// ============================================================================
// REPOSITORY
// ============================================================================

export class SuggestionPatternRepository {
  private static instance: SuggestionPatternRepository;

  private constructor() {}

  public static getInstance(): SuggestionPatternRepository {
    if (!SuggestionPatternRepository.instance) {
      SuggestionPatternRepository.instance = new SuggestionPatternRepository();
    }
    return SuggestionPatternRepository.instance;
  }

  // ==========================================================================
  // CRUD OPERATIONS
  // ==========================================================================

  /**
   * Create a new pattern
   */
  async create(data: PatternCreateInput): Promise<SuggestionPattern> {
    try {
      return await suggestionPatternClient.suggestionPattern.create({
        data: {
          contextKey: data.contextKey,
          patternKey: data.patternKey,
          productName: data.productName,
          size: data.size,
          profile: data.profile,
          measurement: data.measurement,
          quantity: data.quantity,
          frequency: data.frequency,
          confidence: data.confidence,
          lastUsed: data.lastUsed,
          averageQuantity: data.averageQuantity,
          contexts: data.contexts as Prisma.InputJsonValue,
          variations: data.variations as Prisma.InputJsonValue,
          metadata: data.metadata as Prisma.InputJsonValue,
        },
      });
    } catch (error) {
      logger.error("Failed to create suggestion pattern", { error, data });
      throw error;
    }
  }

  /**
   * Find patterns by context key
   */
  async findByContextKey(contextKey: string): Promise<SuggestionPattern[]> {
    try {
      // Get all patterns for this context
      const patterns = await suggestionPatternClient.suggestionPattern.findMany(
        {
          where: { contextKey },
          orderBy: { createdAt: "asc" },
        },
      );

      // ✅ FIXED: Sort by metadata.originalIndex if available
      return patterns.sort((a, b) => {
        const aIndex =
          ((a.metadata as Record<string, unknown>)?.originalIndex as number) ??
          999;
        const bIndex =
          ((b.metadata as Record<string, unknown>)?.originalIndex as number) ??
          999;
        return aIndex - bIndex;
      });
    } catch (error) {
      logger.error("Failed to find patterns by context key", {
        error,
        contextKey,
      });
      throw error;
    }
  }

  /**
   * Find patterns by product and size
   */
  async findByProductAndSize(
    productName: string,
    size: string,
  ): Promise<SuggestionPattern[]> {
    try {
      // ✅ USE NORMALIZER: Handles quotes, case, whitespace
      const contextKey = createContextKey(productName, size);
      logger.info("Finding patterns by product and size", {
        productName,
        size,
        normalizedContextKey: contextKey,
      });
      return await this.findByContextKey(contextKey);
    } catch (error) {
      logger.error("Failed to find patterns by product and size", {
        error,
        productName,
        size,
      });
      throw error;
    }
  }

  /**
   * Find pattern by unique pattern key
   */
  async findByPatternKey(
    patternKey: string,
  ): Promise<SuggestionPattern | null> {
    try {
      return await suggestionPatternClient.suggestionPattern.findUnique({
        where: { patternKey },
      });
    } catch (error) {
      logger.error("Failed to find pattern by key", { error, patternKey });
      throw error;
    }
  }

  /**
   * Update existing pattern
   */
  async update(
    id: string,
    data: Partial<{
      frequency: number;
      lastUsed: Date;
      averageRatio: number;
      ratioHistory: Array<{
        orderQty: number;
        profileQty: number;
        ratio: number;
      }>;
      orderQuantity: number;
      ratio: number;
    }>,
  ): Promise<SuggestionPattern> {
    try {
      return await suggestionPatternClient.suggestionPattern.update({
        where: { id },
        data: {
          frequency: data.frequency,
          lastUsed: data.lastUsed,
          averageRatio: data.averageRatio,
          ratioHistory: data.ratioHistory as unknown as Prisma.InputJsonValue,
          orderQuantity: data.orderQuantity,
          ratio: data.ratio,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      logger.error("Failed to update pattern", { error, id, data });
      throw error;
    }
  }

  /**
   * Update pattern frequency and last used
   */
  async updateFrequency(id: string, increment: number = 1): Promise<void> {
    try {
      await suggestionPatternClient.suggestionPattern.update({
        where: { id },
        data: {
          frequency: { increment },
          lastUsed: new Date(),
        },
      });
    } catch (error) {
      logger.error("Failed to update pattern frequency", {
        error,
        id,
        increment,
      });
      throw error;
    }
  }

  /**
   * Update pattern confidence
   */
  async updateConfidence(id: string, confidence: number): Promise<void> {
    try {
      await suggestionPatternClient.suggestionPattern.update({
        where: { id },
        data: { confidence },
      });
    } catch (error) {
      logger.error("Failed to update pattern confidence", {
        error,
        id,
        confidence,
      });
      throw error;
    }
  }

  // ==========================================================================
  // BULK OPERATIONS
  // ==========================================================================

  /**
   * Bulk upsert patterns
   */
  async bulkUpsert(patterns: readonly PatternCreateInput[]): Promise<void> {
    try {
      await (
        prisma as unknown as {
          $transaction: (queries: Promise<unknown>[]) => Promise<unknown[]>;
        }
      ).$transaction(
        patterns.map((pattern) =>
          suggestionPatternClient.suggestionPattern.upsert({
            where: { patternKey: pattern.patternKey },
            create: {
              contextKey: pattern.contextKey,
              patternKey: pattern.patternKey,
              productName: pattern.productName,
              size: pattern.size,
              profile: pattern.profile,
              measurement: pattern.measurement,
              quantity: pattern.quantity,
              frequency: pattern.frequency,
              confidence: pattern.confidence,
              lastUsed: pattern.lastUsed,
              averageQuantity: pattern.averageQuantity,
              contexts: pattern.contexts as Prisma.InputJsonValue,
              variations: pattern.variations as Prisma.InputJsonValue,
              metadata: pattern.metadata as Prisma.InputJsonValue,
            },
            update: {
              frequency: { increment: 1 },
              lastUsed: pattern.lastUsed,
              contexts: pattern.contexts as Prisma.InputJsonValue,
              variations: pattern.variations as Prisma.InputJsonValue,
            },
          }),
        ),
      );

      logger.info("Bulk upserted patterns", { count: patterns.length });
    } catch (error) {
      logger.error("Failed to bulk upsert patterns", {
        error,
        count: patterns.length,
      });
      throw error;
    }
  }

  /**
   * Bulk update confidence scores
   */
  async bulkUpdateConfidence(
    updates: readonly { id: string; confidence: number }[],
  ): Promise<void> {
    try {
      await (
        prisma as unknown as {
          $transaction: (queries: Promise<unknown>[]) => Promise<unknown[]>;
        }
      ).$transaction(
        updates.map((update) =>
          suggestionPatternClient.suggestionPattern.update({
            where: { id: update.id },
            data: { confidence: update.confidence },
          }),
        ),
      );

      logger.info("Bulk updated confidence scores", { count: updates.length });
    } catch (error) {
      logger.error("Failed to bulk update confidence", {
        error,
        count: updates.length,
      });
      throw error;
    }
  }

  // ==========================================================================
  // QUERY OPERATIONS
  // ==========================================================================

  /**
   * Get most frequent patterns
   */
  async getMostFrequentPatterns(
    limit: number = 10,
  ): Promise<SuggestionPattern[]> {
    try {
      return await suggestionPatternClient.suggestionPattern.findMany({
        orderBy: { frequency: "desc" },
        take: limit,
      });
    } catch (error) {
      logger.error("Failed to get most frequent patterns", { error, limit });
      throw error;
    }
  }

  /**
   * Get recent patterns (used within N days)
   */
  async getRecentPatterns(days: number = 30): Promise<SuggestionPattern[]> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      return await suggestionPatternClient.suggestionPattern.findMany({
        where: {
          lastUsed: { gte: cutoffDate },
        },
        orderBy: { lastUsed: "desc" },
      });
    } catch (error) {
      logger.error("Failed to get recent patterns", { error, days });
      throw error;
    }
  }

  /**
   * Search patterns by product name (fuzzy)
   */
  async searchByProduct(
    query: string,
    limit: number = 20,
  ): Promise<SuggestionPattern[]> {
    try {
      const queryUpper = query.toUpperCase().trim();

      return await suggestionPatternClient.suggestionPattern.findMany({
        where: {
          productName: {
            contains: queryUpper,
            mode: "insensitive",
          },
        },
        orderBy: [
          { confidence: "desc" } as Record<string, unknown>,
          { frequency: "desc" } as Record<string, unknown>,
        ],
        take: limit,
      });
    } catch (error) {
      logger.error("Failed to search patterns by product", {
        error,
        query,
        limit,
      });
      throw error;
    }
  }

  // ==========================================================================
  // ANALYTICS
  // ==========================================================================

  /**
   * Get pattern statistics
   */
  async getStatistics(): Promise<PatternStatistics> {
    try {
      const [
        totalPatterns,
        highConfidence,
        mediumConfidence,
        lowConfidence,
        avgResult,
        mostFrequent,
      ] = await Promise.all([
        suggestionPatternClient.suggestionPattern.count(),
        suggestionPatternClient.suggestionPattern.count({
          where: { confidence: { gte: 70 } },
        }),
        suggestionPatternClient.suggestionPattern.count({
          where: {
            confidence: { gte: 40, lt: 70 },
          },
        }),
        suggestionPatternClient.suggestionPattern.count({
          where: { confidence: { lt: 40 } },
        }),
        suggestionPatternClient.suggestionPattern.aggregate({
          _avg: { confidence: true },
        }),
        this.getMostFrequentPatterns(10),
      ]);

      return {
        totalPatterns,
        highConfidence,
        mediumConfidence,
        lowConfidence,
        averageConfidence: (avgResult._avg.confidence as number) ?? 0,
        mostFrequent,
      };
    } catch (error) {
      logger.error("Failed to get pattern statistics", { error });
      throw error;
    }
  }

  /**
   * Get unique products count
   */
  async getUniqueProductsCount(): Promise<number> {
    try {
      const result = await suggestionPatternClient.suggestionPattern.groupBy({
        by: ["productName"],
      });
      return (result as unknown[]).length;
    } catch (error) {
      logger.error("Failed to get unique products count", { error });
      throw error;
    }
  }

  /**
   * Get unique sizes for a product
   */
  async getUniqueSizesForProduct(productName: string): Promise<string[]> {
    try {
      const patterns = await suggestionPatternClient.suggestionPattern.findMany(
        {
          where: {
            productName: productName.toUpperCase().trim(),
          },
          distinct: ["size"],
          select: { size: true },
        },
      );

      return patterns.map((p: Record<string, unknown>) => p.size as string);
    } catch (error) {
      logger.error("Failed to get unique sizes for product", {
        error,
        productName,
      });
      throw error;
    }
  }

  // ==========================================================================
  // MAINTENANCE
  // ==========================================================================

  /**
   * Delete old patterns (not used for N days)
   */
  async deleteOldPatterns(days: number = 180): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const result = await suggestionPatternClient.suggestionPattern.deleteMany(
        {
          where: {
            lastUsed: { lt: cutoffDate },
            frequency: { lt: 5 }, // Keep frequently used patterns even if old
          },
        },
      );

      logger.info("Deleted old patterns", { count: result.count, days });
      return result.count;
    } catch (error) {
      logger.error("Failed to delete old patterns", { error, days });
      throw error;
    }
  }
}
