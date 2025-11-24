/**
 * Prisma Production Plan Repository Implementation
 *
 * Adapter for ProductionPlan data access using Prisma
 *
 * @module infrastructure/repositories/PrismaProductionPlanRepository
 * @version 1.0.0
 */

import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaRepository } from "./PrismaRepository";
import {
  IProductionPlanRepository,
  ProductionPlanFilters,
  PaginationOptions,
  PaginatedResult,
} from "../../domain/repositories/IProductionPlanRepository";
import { ProductionPlan } from "../../domain/entities/ProductionPlan";
import { ProductionPlanItem } from "../../domain/entities/ProductionPlanItem";
import { ProductionPlanMapper } from "../mappers/ProductionPlanMapper";
import { logger } from "../../services/logger";

/**
 * Prisma Production Plan Repository
 */
export class PrismaProductionPlanRepository
  extends PrismaRepository<ProductionPlan, string>
  implements IProductionPlanRepository
{
  constructor(client?: PrismaClient) {
    super(client);
  }
  public async findById(id: string): Promise<ProductionPlan | null> {
    try {
      const prisma = await this.prisma.productionPlan.findUnique({
        where: { id },
      });
      return prisma ? ProductionPlanMapper.toDomain(prisma) : null;
    } catch (error) {
      const errorInfo = this.handlePrismaError(error, {
        operation: "findById",
        model: "ProductionPlan",
        value: id,
      });
      throw new Error(errorInfo.userMessage);
    }
  }

  public async findByIdWithItems(id: string): Promise<ProductionPlan | null> {
    try {
      const prisma = await this.prisma.productionPlan.findUnique({
        where: { id },
        include: { items: true },
      });
      return prisma ? ProductionPlanMapper.toDomain(prisma) : null;
    } catch (error) {
      const errorInfo = this.handlePrismaError(error, {
        operation: "findByIdWithItems",
        model: "ProductionPlan",
        value: id,
      });
      throw new Error(errorInfo.userMessage);
    }
  }

  public async findByWeekAndYear(
    weekNumber: number,
    year: number,
  ): Promise<ProductionPlan | null> {
    try {
      const prisma = await this.prisma.productionPlan.findUnique({
        where: { weekNumber_year: { weekNumber, year } },
        include: { items: true },
      });
      return prisma ? ProductionPlanMapper.toDomain(prisma) : null;
    } catch (error) {
      const errorInfo = this.handlePrismaError(error, {
        operation: "findByWeekAndYear",
        model: "ProductionPlan",
      });
      throw new Error(errorInfo.userMessage);
    }
  }

  public async findAll(
    filters?: ProductionPlanFilters,
  ): Promise<readonly ProductionPlan[]> {
    try {
      const where: Prisma.ProductionPlanWhereInput = {};
      if (filters?.weekNumber) where.weekNumber = filters.weekNumber;
      if (filters?.year) where.year = filters.year;
      if (filters?.status) where.status = filters.status;

      const prismaResults = await this.prisma.productionPlan.findMany({
        where,
        include: { items: true },
        orderBy: { uploadedAt: "desc" },
      });
      return prismaResults.map((p) => ProductionPlanMapper.toDomain(p));
    } catch (error) {
      const errorInfo = this.handlePrismaError(error, {
        operation: "findAll",
        model: "ProductionPlan",
      });
      throw new Error(errorInfo.userMessage);
    }
  }

  public async findPaginated(
    filters?: ProductionPlanFilters,
    pagination?: PaginationOptions,
  ): Promise<PaginatedResult<ProductionPlan>> {
    try {
      const page = pagination?.page || 1;
      const pageSize = pagination?.pageSize || 20;
      const skip = (page - 1) * pageSize;

      const where: Prisma.ProductionPlanWhereInput = {};
      if (filters?.weekNumber) where.weekNumber = filters.weekNumber;
      if (filters?.year) where.year = filters.year;
      if (filters?.status) where.status = filters.status;

      const [data, total] = await Promise.all([
        this.prisma.productionPlan.findMany({
          where,
          include: { items: true },
          orderBy: { uploadedAt: "desc" },
          skip,
          take: pageSize,
        }),
        this.prisma.productionPlan.count({ where }),
      ]);

      return {
        data: data.map((p) => ProductionPlanMapper.toDomain(p)),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    } catch (error) {
      const errorInfo = this.handlePrismaError(error, {
        operation: "findPaginated",
        model: "ProductionPlan",
      });
      throw new Error(errorInfo.userMessage);
    }
  }

  public async create(plan: ProductionPlan): Promise<ProductionPlan> {
    try {
      const createData = ProductionPlanMapper.toPrismaCreate(plan);
      const result = await this.transaction(
        async (tx) =>
          await tx.productionPlan.create({
            data: createData,
            include: { items: true },
          }),
        { maxWait: 5000, timeout: 10000 },
      );
      return ProductionPlanMapper.toDomain(result);
    } catch (error) {
      const errorInfo = this.handlePrismaError(error, {
        operation: "create",
        model: "ProductionPlan",
      });
      throw new Error(errorInfo.userMessage);
    }
  }

  public async createWithItems(
    plan: ProductionPlan,
    items: readonly ProductionPlanItem[],
  ): Promise<ProductionPlan> {
    try {
      const createData = ProductionPlanMapper.toPrismaCreate(plan);
      const itemsData = items.map((item) =>
        ProductionPlanMapper.itemToPrismaCreate(item),
      );

      const result = await this.transaction(
        async (tx) => {
          const created = await tx.productionPlan.create({ data: createData });
          if (itemsData.length > 0) {
            await tx.productionPlanItem.createMany({
              data: itemsData.map((item) => ({ ...item, planId: created.id })),
            });
          }
          return await tx.productionPlan.findUniqueOrThrow({
            where: { id: created.id },
            include: { items: true },
          });
        },
        { maxWait: 5000, timeout: 10000 },
      );
      return ProductionPlanMapper.toDomain(result);
    } catch (error) {
      const errorInfo = this.handlePrismaError(error, {
        operation: "createWithItems",
        model: "ProductionPlan",
      });
      throw new Error(errorInfo.userMessage);
    }
  }

  public async update(
    id: string,
    plan: Partial<ProductionPlan>,
  ): Promise<ProductionPlan> {
    try {
      const updateData = ProductionPlanMapper.toPrismaUpdate(plan);
      const result = await this.transaction(
        async (tx) =>
          await tx.productionPlan.update({
            where: { id },
            data: updateData,
            include: { items: true },
          }),
        { maxWait: 5000, timeout: 10000 },
      );
      return ProductionPlanMapper.toDomain(result);
    } catch (error) {
      const errorInfo = this.handlePrismaError(error, {
        operation: "update",
        model: "ProductionPlan",
        value: id,
      });
      throw new Error(errorInfo.userMessage);
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      await this.transaction(
        async (tx) => await tx.productionPlan.delete({ where: { id } }),
        { maxWait: 5000, timeout: 10000 },
      );
    } catch (error) {
      const errorInfo = this.handlePrismaError(error, {
        operation: "delete",
        model: "ProductionPlan",
        value: id,
      });
      throw new Error(errorInfo.userMessage);
    }
  }

  public async findItemsByPlanId(
    planId: string,
  ): Promise<readonly ProductionPlanItem[]> {
    try {
      const prismaResults = await this.prisma.productionPlanItem.findMany({
        where: { planId },
      });
      return prismaResults.map((item) =>
        ProductionPlanMapper.itemToDomain(item),
      );
    } catch (error) {
      const errorInfo = this.handlePrismaError(error, {
        operation: "findItemsByPlanId",
        model: "ProductionPlanItem",
        value: planId,
      });
      throw new Error(errorInfo.userMessage);
    }
  }

  public async findItemsByIds(
    ids: readonly string[],
  ): Promise<readonly ProductionPlanItem[]> {
    try {
      const prismaResults = await this.prisma.productionPlanItem.findMany({
        where: { id: { in: [...ids] } },
      });
      return prismaResults.map((item) =>
        ProductionPlanMapper.itemToDomain(item),
      );
    } catch (error) {
      const errorInfo = this.handlePrismaError(error, {
        operation: "findItemsByIds",
        model: "ProductionPlanItem",
      });
      throw new Error(errorInfo.userMessage);
    }
  }

  public async linkItemsToCuttingList(
    itemIds: readonly string[],
    cuttingListId: string,
  ): Promise<void> {
    try {
      await this.transaction(
        async (tx) =>
          await tx.productionPlanItem.updateMany({
            where: { id: { in: [...itemIds] } },
            data: { linkedCuttingListId: cuttingListId },
          }),
        { maxWait: 5000, timeout: 10000 },
      );
    } catch (error) {
      const errorInfo = this.handlePrismaError(error, {
        operation: "linkItemsToCuttingList",
        model: "ProductionPlanItem",
      });
      throw new Error(errorInfo.userMessage);
    }
  }

  public async linkItemToCuttingList(
    itemId: string,
    cuttingListId: string,
  ): Promise<void> {
    try {
      await this.transaction(
        async (tx) =>
          await tx.productionPlanItem.update({
            where: { id: itemId },
            data: { linkedCuttingListId: cuttingListId },
          }),
        { maxWait: 5000, timeout: 10000 },
      );
    } catch (error) {
      const errorInfo = this.handlePrismaError(error, {
        operation: "linkItemToCuttingList",
        model: "ProductionPlanItem",
        value: itemId,
      });
      throw new Error(errorInfo.userMessage);
    }
  }

  public async createCuttingList(data: {
    name: string;
    userId: string;
    weekNumber?: number | null;
  }): Promise<{ id: string }> {
    try {
      const result = await this.transaction(
        async (tx) =>
          await tx.cuttingList.create({
            data: {
              name: data.name,
              userId: data.userId,
              weekNumber: data.weekNumber || null,
            },
          }),
        { maxWait: 5000, timeout: 10000 },
      );
      return { id: result.id };
    } catch (error) {
      const errorInfo = this.handlePrismaError(error, {
        operation: "createCuttingList",
        model: "CuttingList",
      });
      throw new Error(errorInfo.userMessage);
    }
  }

  public async createCuttingListItems(
    cuttingListId: string,
    items: Array<{
      workOrderId: string;
      profileType: string;
      length: number;
      quantity: number;
      [key: string]: unknown;
    }>,
  ): Promise<number> {
    try {
      const result = await this.transaction(
        async (tx) => {
          const result = await tx.cuttingListItem.createMany({
            data: items.map((item) => ({
              cuttingListId,
              workOrderId: item.workOrderId,
              profileType: item.profileType,
              length: item.length,
              quantity: item.quantity,
              color: "",
              version: "",
              size: "",
              priority: "MEDIUM",
              status: "DRAFT",
            })),
          });
          return result.count;
        },
        { maxWait: 5000, timeout: 10000 },
      );
      return result;
    } catch (error) {
      const errorInfo = this.handlePrismaError(error, {
        operation: "createCuttingListItems",
        model: "CuttingListItem",
      });
      throw new Error(errorInfo.userMessage);
    }
  }

  public async count(): Promise<number> {
    try {
      return await this.prisma.productionPlan.count();
    } catch (error) {
      const errorInfo = this.handlePrismaError(error, {
        operation: "count",
        model: "ProductionPlan",
      });
      throw new Error(errorInfo.userMessage);
    }
  }
}
