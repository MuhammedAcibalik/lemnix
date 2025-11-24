/**
 * Batch Repository Operations
 *
 * Provides batch operations for repositories
 *
 * @module infrastructure/repositories/BatchRepository
 * @version 1.0.0
 */

import { PrismaClient, Prisma } from "@prisma/client";
import { logger } from "../../services/logger";

/**
 * Batch Repository Helper
 */
export class BatchRepository {
  /**
   * Batch create entities
   */
  public static async batchCreate<T>(
    client: PrismaClient,
    model: keyof PrismaClient,
    data: readonly T[],
    batchSize = 1000,
  ): Promise<number> {
    if (data.length === 0) {
      return 0;
    }

    let totalCreated = 0;

    // Process in batches
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      try {
        const modelClient = client[model] as unknown as {
          createMany: (args: {
            data: T[];
            skipDuplicates?: boolean;
          }) => Promise<{ count: number }>;
        };

        const result = await modelClient.createMany({
          data: batch,
          skipDuplicates: true,
        });

        totalCreated += result.count;
      } catch (error) {
        logger.error("Batch create failed", {
          model: String(model),
          batchStart: i,
          batchSize: batch.length,
          error,
        });
        throw error;
      }
    }

    return totalCreated;
  }

  /**
   * Batch update entities
   */
  public static async batchUpdate<T>(
    client: PrismaClient,
    model: keyof PrismaClient,
    updates: Array<{ where: Record<string, unknown>; data: Partial<T> }>,
    batchSize = 100,
  ): Promise<number> {
    if (updates.length === 0) {
      return 0;
    }

    let totalUpdated = 0;

    // Process in batches
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      try {
        const modelClient = client[model] as unknown as {
          updateMany: (args: {
            where: Record<string, unknown>;
            data: Partial<T>;
          }) => Promise<{ count: number }>;
        };

        // Note: Prisma updateMany doesn't support array of updates directly
        // We need to execute them individually or use a transaction
        const results = await Promise.all(
          batch.map((update) =>
            modelClient.updateMany({
              where: update.where,
              data: update.data,
            }),
          ),
        );

        totalUpdated += results.reduce((sum, r) => sum + r.count, 0);
      } catch (error) {
        logger.error("Batch update failed", {
          model: String(model),
          batchStart: i,
          batchSize: batch.length,
          error,
        });
        throw error;
      }
    }

    return totalUpdated;
  }

  /**
   * Batch delete entities
   */
  public static async batchDelete(
    client: PrismaClient,
    model: keyof PrismaClient,
    ids: readonly string[],
    batchSize = 1000,
  ): Promise<number> {
    if (ids.length === 0) {
      return 0;
    }

    let totalDeleted = 0;

    // Process in batches
    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = ids.slice(i, i + batchSize);
      try {
        const modelClient = client[model] as unknown as {
          deleteMany: (args: {
            where: { id: { in: readonly string[] } };
          }) => Promise<{ count: number }>;
        };

        const result = await modelClient.deleteMany({
          where: {
            id: { in: [...batch] },
          },
        });

        totalDeleted += result.count;
      } catch (error) {
        logger.error("Batch delete failed", {
          model: String(model),
          batchStart: i,
          batchSize: batch.length,
          error,
        });
        throw error;
      }
    }

    return totalDeleted;
  }
}
