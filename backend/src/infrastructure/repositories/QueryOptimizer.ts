/**
 * Query Optimizer
 *
 * Detects and prevents N+1 query problems
 *
 * @module infrastructure/repositories/QueryOptimizer
 * @version 1.0.0
 */

import { Prisma } from "@prisma/client";
import { logger } from "../../services/logger";

export interface QueryAnalysis {
  readonly hasNPlusOneRisk: boolean;
  readonly suggestions: readonly string[];
  readonly estimatedQueryCount: number;
}

/**
 * Query Optimizer
 */
export class QueryOptimizer {
  /**
   * Analyze query for N+1 problems
   */
  public static analyzeQuery(
    baseQuery: Prisma.CuttingListFindManyArgs,
    itemQueries: number,
  ): QueryAnalysis {
    const hasNPlusOneRisk = itemQueries > 0 && !baseQuery.include?.items;
    const suggestions: string[] = [];

    if (hasNPlusOneRisk) {
      suggestions.push(
        "Include 'items' relation in base query to prevent N+1 queries",
      );
    }

    const estimatedQueryCount = hasNPlusOneRisk ? 1 + itemQueries : 1;

    return {
      hasNPlusOneRisk,
      suggestions,
      estimatedQueryCount,
    };
  }

  /**
   * Optimize include clause
   */
  public static optimizeInclude<T extends Prisma.CuttingListInclude>(
    include: T,
    options: {
      includeItems?: boolean;
      includeStatistics?: boolean;
      includeUser?: boolean;
    },
  ): T {
    const optimized = { ...include } as Record<string, unknown>;

    if (options.includeItems && !optimized.items) {
      optimized.items = true;
    }

    if (options.includeStatistics && !optimized.statistics) {
      optimized.statistics = true;
    }

    if (options.includeUser && !optimized.user) {
      optimized.user = {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      };
    }

    return optimized as T;
  }

  /**
   * Log query performance warning
   */
  public static logPerformanceWarning(
    query: string,
    duration: number,
    threshold = 200,
  ): void {
    if (duration > threshold) {
      logger.warn("Slow query detected", {
        query: query.substring(0, 200),
        duration,
        threshold,
      });
    }
  }
}
