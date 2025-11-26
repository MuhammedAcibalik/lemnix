/**
 * Optimization Repository
 * Data access layer for Optimization operations
 *
 * @module repositories/OptimizationRepository
 * @version 1.0.0
 */

import { prisma } from "../config/database";
import { Optimization, OptimizationStatistics, Prisma } from "@prisma/client";
import { logger } from "../services/logger";

export class OptimizationRepository {
  private static instance: OptimizationRepository;

  private constructor() {}

  public static getInstance(): OptimizationRepository {
    if (!OptimizationRepository.instance) {
      OptimizationRepository.instance = new OptimizationRepository();
    }
    return OptimizationRepository.instance;
  }

  /**
   * Create a new optimization record
   */
  public async create(
    data: Prisma.OptimizationCreateInput,
  ): Promise<Optimization> {
    try {
      return await prisma.optimization.create({ data });
    } catch (error) {
      logger.error("Failed to create optimization", { error });
      throw error;
    }
  }

  /**
   * Find optimization by ID
   */
  public async findById(id: string): Promise<Optimization | null> {
    try {
      return await prisma.optimization.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
    } catch (error) {
      logger.error("Failed to find optimization", { id, error });
      throw error;
    }
  }

  /**
   * Find recent optimizations for a user
   */
  public async findRecent(
    userId: string,
    limit: number = 10,
  ): Promise<Optimization[]> {
    try {
      return await prisma.optimization.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
    } catch (error) {
      logger.error("Failed to find recent optimizations", {
        userId,
        limit,
        error,
      });
      throw error;
    }
  }

  /**
   * Find by algorithm and status
   */
  public async findByAlgorithm(
    algorithm: string,
    status?: string,
    limit: number = 50,
  ): Promise<Optimization[]> {
    try {
      return await prisma.optimization.findMany({
        where: {
          algorithm,
          ...(status && { status }),
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
    } catch (error) {
      logger.error("Failed to find by algorithm", { algorithm, status, error });
      throw error;
    }
  }

  /**
   * Update optimization status and result
   */
  public async update(
    id: string,
    data: Prisma.OptimizationUpdateInput,
  ): Promise<Optimization> {
    try {
      return await prisma.optimization.update({
        where: { id },
        data,
      });
    } catch (error) {
      logger.error("Failed to update optimization", { id, error });
      throw error;
    }
  }

  /**
   * Get optimization statistics by algorithm
   */
  public async getStatistics(
    algorithm?: string,
  ): Promise<OptimizationStatistics[]> {
    try {
      return await prisma.optimizationStatistics.findMany({
        where: algorithm ? { algorithm } : undefined,
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      logger.error("Failed to get optimization statistics", {
        algorithm,
        error,
      });
      throw error;
    }
  }

  /**
   * Create optimization statistics record
   */
  public async createStatistics(
    data: Prisma.OptimizationStatisticsCreateInput,
  ): Promise<OptimizationStatistics> {
    try {
      return await prisma.optimizationStatistics.create({ data });
    } catch (error) {
      logger.error("Failed to create optimization statistics", { error });
      throw error;
    }
  }

  /**
   * Get algorithm performance summary
   */
  public async getAlgorithmPerformance(): Promise<
    Array<{
      algorithm: string;
      avgExecutionTime: number;
      totalRuns: number;
      avgEfficiency: number;
    }>
  > {
    try {
      const stats = await prisma.optimizationStatistics.groupBy({
        by: ["algorithm"],
        _avg: {
          executionTimeMs: true,
          averageEfficiency: true,
        },
        _count: true,
      });

      return stats.map((stat) => ({
        algorithm: stat.algorithm,
        avgExecutionTime: stat._avg.executionTimeMs || 0,
        totalRuns: stat._count,
        avgEfficiency: stat._avg.averageEfficiency ? Number(stat._avg.averageEfficiency) : 0,
      }));
    } catch (error) {
      logger.error("Failed to get algorithm performance", { error });
      throw error;
    }
  }

  /**
   * Delete old optimizations (cleanup)
   */
  public async deleteOlderThan(days: number): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const result = await prisma.optimization.deleteMany({
        where: {
          createdAt: { lt: cutoffDate },
          status: "completed",
        },
      });

      return result.count;
    } catch (error) {
      logger.error("Failed to delete old optimizations", { days, error });
      throw error;
    }
  }
}

export const optimizationRepository = OptimizationRepository.getInstance();
