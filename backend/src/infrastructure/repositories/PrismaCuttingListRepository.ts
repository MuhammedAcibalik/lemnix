/**
 * Prisma Cutting List Repository Implementation
 *
 * Adapter for CuttingList data access using Prisma
 *
 * @module infrastructure/repositories/PrismaCuttingListRepository
 * @version 1.0.0
 */

import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaRepository } from "./PrismaRepository";
import {
  ICuttingListRepository,
  CuttingListFilters,
  PaginationOptions,
  PaginatedResult,
} from "../../domain/repositories/ICuttingListRepository";
import { CuttingList } from "../../domain/entities/CuttingList";
import { CuttingListItem } from "../../domain/entities/CuttingListItem";
import { WeekNumber } from "../../domain/valueObjects/WeekNumber";
import { CuttingListMapper } from "../mappers/CuttingListMapper";
import { CuttingListStatus } from "@prisma/client";
import { logger } from "../../services/logger";
import {
  cacheService,
  CacheKeys,
  CacheTags,
} from "../../services/cache/RedisCache";
import { prisma } from "../../config/database";

/**
 * Prisma Cutting List Repository
 */
export class PrismaCuttingListRepository
  extends PrismaRepository<CuttingList, string>
  implements ICuttingListRepository
{
  constructor(client?: PrismaClient) {
    super(client ?? prisma);
  }
  /**
   * Find cutting list by ID
   */
  public async findById(id: string): Promise<CuttingList | null> {
    try {
      const prisma = await this.prisma.cuttingList.findUnique({
        where: { id },
      });

      if (!prisma) {
        return null;
      }

      return CuttingListMapper.toDomain(prisma);
    } catch (error) {
      const errorInfo = this.handlePrismaError(error, {
        operation: "findById",
        model: "CuttingList",
        value: id,
      });
      throw new Error(errorInfo.userMessage);
    }
  }

  /**
   * Find cutting list by ID with relations
   */
  public async findByIdWithRelations(id: string): Promise<CuttingList | null> {
    try {
      // Try cache first
      let cached: CuttingList | null = null;
      try {
        cached = await cacheService.get<CuttingList>(CacheKeys.cuttingList(id));
        if (cached) {
          return cached;
        }
      } catch (cacheError) {
        logger.warn("Cache get failed (non-critical)", { id, cacheError });
      }

      const prisma = await this.prisma.cuttingList.findUnique({
        where: { id },
        include: {
          items: true,
          statistics: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
        },
      });

      if (!prisma) {
        return null;
      }

      const domain = CuttingListMapper.toDomain(prisma);

      // Cache result (non-blocking)
      try {
        await cacheService.set(CacheKeys.cuttingList(id), domain, {
          ttl: 3600,
        });
      } catch (cacheError) {
        logger.warn("Cache set failed (non-critical)", { id, cacheError });
      }

      return domain;
    } catch (error) {
      const errorInfo = this.handlePrismaError(error, {
        operation: "findByIdWithRelations",
        model: "CuttingList",
        value: id,
      });
      throw new Error(errorInfo.userMessage);
    }
  }

  /**
   * Find all cutting lists with filters
   */
  public async findAll(
    filters?: CuttingListFilters,
  ): Promise<readonly CuttingList[]> {
    try {
      const where: Prisma.CuttingListWhereInput = {};

      if (filters?.userId) {
        where.userId = filters.userId;
      }
      if (filters?.status) {
        where.status = filters.status;
      }
      if (filters?.weekNumber !== undefined) {
        where.weekNumber = filters.weekNumber;
      }
      if (filters?.search) {
        where.OR = [
          {
            name: {
              contains: filters.search,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: filters.search,
              mode: "insensitive",
            },
          },
        ];
      }

      const prismaResults = await this.prisma.cuttingList.findMany({
        where,
        include: {
          items: true,
          statistics: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return prismaResults.map((prisma) => CuttingListMapper.toDomain(prisma));
    } catch (error) {
      const errorInfo = this.handlePrismaError(error, {
        operation: "findAll",
        model: "CuttingList",
      });
      throw new Error(errorInfo.userMessage);
    }
  }

  /**
   * Find cutting lists with pagination
   */
  public async findPaginated(
    filters?: CuttingListFilters,
    pagination?: PaginationOptions,
  ): Promise<PaginatedResult<CuttingList>> {
    try {
      const page = pagination?.page || 1;
      const pageSize = pagination?.pageSize || 20;
      const skip = (page - 1) * pageSize;

      const where: Prisma.CuttingListWhereInput = {};

      if (filters?.userId) {
        where.userId = filters.userId;
      }
      if (filters?.status) {
        where.status = filters.status;
      }
      if (filters?.weekNumber !== undefined) {
        where.weekNumber = filters.weekNumber;
      }
      if (filters?.search) {
        where.OR = [
          {
            name: {
              contains: filters.search,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: filters.search,
              mode: "insensitive",
            },
          },
        ];
      }

      const [data, total] = await Promise.all([
        this.prisma.cuttingList.findMany({
          where,
          include: {
            items: true,
            statistics: true,
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: pageSize,
        }),
        this.prisma.cuttingList.count({ where }),
      ]);

      return {
        data: data.map((prisma) => CuttingListMapper.toDomain(prisma)),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    } catch (error) {
      const errorInfo = this.handlePrismaError(error, {
        operation: "findPaginated",
        model: "CuttingList",
      });
      throw new Error(errorInfo.userMessage);
    }
  }

  /**
   * Find cutting list by week number and user
   */
  public async findByWeekNumber(
    userId: string,
    weekNumber: WeekNumber | null,
  ): Promise<CuttingList | null> {
    try {
      const prisma = await this.prisma.cuttingList.findFirst({
        where: {
          userId,
          weekNumber: weekNumber?.getValue() || null,
        },
        include: {
          items: true,
          statistics: true,
        },
      });

      if (!prisma) {
        return null;
      }

      return CuttingListMapper.toDomain(prisma);
    } catch (error) {
      const errorInfo = this.handlePrismaError(error, {
        operation: "findByWeekNumber",
        model: "CuttingList",
      });
      throw new Error(errorInfo.userMessage);
    }
  }

  /**
   * Find all cutting lists by week number
   */
  public async findAllByWeekNumber(
    weekNumber: number,
  ): Promise<readonly CuttingList[]> {
    try {
      const prismaResults = await this.prisma.cuttingList.findMany({
        where: { weekNumber },
      });

      return prismaResults.map((prisma) => CuttingListMapper.toDomain(prisma));
    } catch (error) {
      const errorInfo = this.handlePrismaError(error, {
        operation: "findAllByWeekNumber",
        model: "CuttingList",
      });
      throw new Error(errorInfo.userMessage);
    }
  }

  /**
   * Create cutting list
   */
  public async create(cuttingList: CuttingList): Promise<CuttingList> {
    try {
      const createData = CuttingListMapper.toPrismaCreate(cuttingList);

      const result = await this.transaction(
        async (tx) => {
          const created = await tx.cuttingList.create({
            data: createData,
            include: {
              items: true,
              statistics: true,
            },
          });

          // Verify
          const verify = await tx.cuttingList.findUnique({
            where: { id: created.id },
          });

          if (!verify) {
            throw new Error("Created cutting list not found in database");
          }

          return created;
        },
        {
          maxWait: 5000,
          timeout: 10000,
        },
      );

      // Cache invalidation (non-blocking)
      try {
        await cacheService.invalidateByTag(CacheTags.CUTTING_LISTS);
      } catch (cacheError) {
        logger.warn("Cache invalidation failed (non-critical)", { cacheError });
      }

      logger.info("Cutting list created successfully", {
        id: result.id,
        name: result.name,
        weekNumber: result.weekNumber,
        status: result.status,
      });

      return CuttingListMapper.toDomain(result);
    } catch (error) {
      const errorInfo = this.handlePrismaError(error, {
        operation: "create",
        model: "CuttingList",
        field: cuttingList.weekNumber ? "weekNumber" : undefined,
        value: cuttingList.weekNumber?.getValue(),
      });

      logger.error("Failed to create cutting list", {
        error,
        errorCode: errorInfo.code,
      });

      throw new Error(errorInfo.userMessage);
    }
  }

  /**
   * Update cutting list
   */
  public async update(
    id: string,
    cuttingList: Partial<CuttingList>,
  ): Promise<CuttingList> {
    try {
      const updateData = CuttingListMapper.toPrismaUpdate(cuttingList);

      const result = await this.transaction(
        async (tx) => {
          return await tx.cuttingList.update({
            where: { id },
            data: updateData,
            include: {
              items: true,
              statistics: true,
            },
          });
        },
        {
          maxWait: 5000,
          timeout: 10000,
        },
      );

      // Cache invalidation (non-blocking)
      try {
        await cacheService.delete(CacheKeys.cuttingList(id));
        await cacheService.invalidateByTag(CacheTags.CUTTING_LISTS);
      } catch (cacheError) {
        logger.warn("Cache invalidation failed (non-critical)", { cacheError });
      }

      return CuttingListMapper.toDomain(result);
    } catch (error) {
      const errorInfo = this.handlePrismaError(error, {
        operation: "update",
        model: "CuttingList",
        value: id,
      });

      logger.error("Failed to update cutting list", {
        id,
        error,
        errorCode: errorInfo.code,
      });

      throw new Error(errorInfo.userMessage);
    }
  }

  /**
   * Delete cutting list
   */
  public async delete(id: string): Promise<void> {
    try {
      await this.transaction(
        async (tx) => {
          await tx.cuttingList.delete({
            where: { id },
          });
        },
        {
          maxWait: 5000,
          timeout: 10000,
        },
      );

      // Cache invalidation (non-blocking)
      try {
        await cacheService.delete(CacheKeys.cuttingList(id));
        await cacheService.invalidateByTag(CacheTags.CUTTING_LISTS);
      } catch (cacheError) {
        logger.warn("Cache invalidation failed (non-critical)", { cacheError });
      }

      logger.info("Cutting list permanently deleted from database", { id });
    } catch (error) {
      const errorInfo = this.handlePrismaError(error, {
        operation: "delete",
        model: "CuttingList",
        value: id,
      });

      logger.error("Failed to delete cutting list", {
        id,
        error,
        errorCode: errorInfo.code,
      });

      throw new Error(errorInfo.userMessage);
    }
  }

  /**
   * Add item to cutting list
   */
  public async addItem(
    cuttingListId: string,
    item: CuttingListItem,
  ): Promise<CuttingListItem> {
    try {
      const createData = CuttingListMapper.itemToPrismaCreate(item);

      const result = await this.prisma.cuttingListItem.create({
        data: {
          ...createData,
          cuttingListId,
        },
      });

      // Cache invalidation (non-blocking)
      try {
        await cacheService.delete(CacheKeys.cuttingList(cuttingListId));
        await cacheService.invalidateByTag(CacheTags.CUTTING_LISTS);
      } catch (cacheError) {
        logger.warn("Cache invalidation failed (non-critical)", { cacheError });
      }

      return CuttingListMapper.itemToDomain(result);
    } catch (error) {
      const errorInfo = this.handlePrismaError(error, {
        operation: "addItem",
        model: "CuttingListItem",
        value: cuttingListId,
      });
      throw new Error(errorInfo.userMessage);
    }
  }

  /**
   * Update item in cutting list
   */
  public async updateItem(
    cuttingListId: string,
    itemId: string,
    item: Partial<CuttingListItem>,
  ): Promise<CuttingListItem> {
    try {
      const updateData = CuttingListMapper.itemToPrismaUpdate(item);

      const result = await this.prisma.cuttingListItem.update({
        where: { id: itemId },
        data: updateData,
      });

      // Cache invalidation (non-blocking)
      try {
        await cacheService.delete(CacheKeys.cuttingList(cuttingListId));
        await cacheService.invalidateByTag(CacheTags.CUTTING_LISTS);
      } catch (cacheError) {
        logger.warn("Cache invalidation failed (non-critical)", { cacheError });
      }

      return CuttingListMapper.itemToDomain(result);
    } catch (error) {
      const errorInfo = this.handlePrismaError(error, {
        operation: "updateItem",
        model: "CuttingListItem",
        value: itemId,
      });
      throw new Error(errorInfo.userMessage);
    }
  }

  /**
   * Remove item from cutting list
   */
  public async removeItem(
    cuttingListId: string,
    itemId: string,
  ): Promise<void> {
    try {
      await this.prisma.cuttingListItem.delete({
        where: { id: itemId },
      });

      // Cache invalidation (non-blocking)
      try {
        await cacheService.delete(CacheKeys.cuttingList(cuttingListId));
        await cacheService.invalidateByTag(CacheTags.CUTTING_LISTS);
      } catch (cacheError) {
        logger.warn("Cache invalidation failed (non-critical)", { cacheError });
      }
    } catch (error) {
      const errorInfo = this.handlePrismaError(error, {
        operation: "removeItem",
        model: "CuttingListItem",
        value: itemId,
      });
      throw new Error(errorInfo.userMessage);
    }
  }

  /**
   * Find items by cutting list ID
   */
  public async findItemsByCuttingListId(
    cuttingListId: string,
  ): Promise<readonly CuttingListItem[]> {
    try {
      const prismaResults = await this.prisma.cuttingListItem.findMany({
        where: { cuttingListId },
        orderBy: { createdAt: "asc" },
      });

      return prismaResults.map((prisma) =>
        CuttingListMapper.itemToDomain(prisma),
      );
    } catch (error) {
      const errorInfo = this.handlePrismaError(error, {
        operation: "findItemsByCuttingListId",
        model: "CuttingListItem",
        value: cuttingListId,
      });
      throw new Error(errorInfo.userMessage);
    }
  }

  /**
   * Count cutting lists by status
   */
  public async countByStatus(userId: string): Promise<Record<string, number>> {
    try {
      const counts = await this.prisma.cuttingList.groupBy({
        by: ["status"],
        where: { userId },
        _count: {
          id: true,
        },
      });

      const result: Record<string, number> = {};
      for (const count of counts) {
        result[count.status] = count._count.id;
      }
      return result;
    } catch (error) {
      const errorInfo = this.handlePrismaError(error, {
        operation: "countByStatus",
        model: "CuttingList",
        value: userId,
      });
      throw new Error(errorInfo.userMessage);
    }
  }

  /**
   * Check if week number exists for user
   */
  public async existsWeekNumberForUser(
    userId: string,
    weekNumber: WeekNumber | null,
  ): Promise<boolean> {
    try {
      const count = await this.prisma.cuttingList.count({
        where: {
          userId,
          weekNumber: weekNumber?.getValue() || null,
        },
      });
      return count > 0;
    } catch (error) {
      const errorInfo = this.handlePrismaError(error, {
        operation: "existsWeekNumberForUser",
        model: "CuttingList",
      });
      throw new Error(errorInfo.userMessage);
    }
  }

  /**
   * Count entities
   */
  public async count(): Promise<number> {
    try {
      return await this.prisma.cuttingList.count();
    } catch (error) {
      const errorInfo = this.handlePrismaError(error, {
        operation: "count",
        model: "CuttingList",
      });
      throw new Error(errorInfo.userMessage);
    }
  }
}
