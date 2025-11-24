/**
 * Production Plan Repository (Legacy Adapter)
 *
 * Wraps the new PrismaProductionPlanRepository to maintain backward compatibility
 * Returns Prisma models instead of domain entities
 *
 * @module repositories/ProductionPlanRepository
 * @version 2.0.0 - Adapter pattern for backward compatibility
 * @deprecated Use PrismaProductionPlanRepository directly for new code
 */

import { CuttingList, Prisma, ProductionPlanItem } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";
import { PrismaProductionPlanRepository } from "../infrastructure/repositories/PrismaProductionPlanRepository";

export class ProductionPlanRepository extends BaseRepository {
  private static instance: ProductionPlanRepository;
  private readonly prismaRepository: PrismaProductionPlanRepository;

  private constructor() {
    super();
    this.prismaRepository = new PrismaProductionPlanRepository();
  }

  public static getInstance(): ProductionPlanRepository {
    if (!ProductionPlanRepository.instance) {
      ProductionPlanRepository.instance = new ProductionPlanRepository();
    }
    return ProductionPlanRepository.instance;
  }

  public async findPlanItemsByIds(
    ids: string[],
  ): Promise<ProductionPlanItem[]> {
    const domainItems = await this.prismaRepository.findItemsByIds(ids);
    // Convert domain entities back to Prisma models
    return await this.prismaRepository.prisma.productionPlanItem.findMany({
      where: { id: { in: ids } },
    });
  }

  /**
   * Create cutting list with items atomically
   */
  public async createCuttingListWithItems(
    listData: Prisma.CuttingListCreateInput,
    itemsData: Prisma.CuttingListItemCreateManyInput[],
  ): Promise<CuttingList> {
    return await this.prismaRepository.prisma.cuttingList.create({
      data: {
        ...listData,
        items: {
          createMany: {
            data: itemsData,
          },
        },
      },
      include: {
        items: true,
      },
    });
  }

  public async createCuttingList(
    data: Prisma.CuttingListCreateInput,
  ): Promise<CuttingList> {
    return await this.prismaRepository.prisma.cuttingList.create({ data });
  }

  public async createCuttingListItems(
    data: Prisma.CuttingListItemCreateManyInput[],
  ): Promise<number> {
    const result =
      await this.prismaRepository.prisma.cuttingListItem.createMany({ data });
    return result.count;
  }

  public async linkPlanItemsToCuttingList(
    ids: string[],
    cuttingListId: string,
  ): Promise<void> {
    await this.prismaRepository.linkItemsToCuttingList(ids, cuttingListId);
  }

  public async linkPlanItem(id: string, cuttingListId: string): Promise<void> {
    await this.prismaRepository.linkItemToCuttingList(id, cuttingListId);
  }

  public async findPlanItemWithCuttingList(id: string) {
    return this.prismaRepository.prisma.productionPlanItem.findUnique({
      where: { id },
      include: {
        linkedCuttingList: true,
      },
    });
  }
}

export const productionPlanRepository = ProductionPlanRepository.getInstance();
