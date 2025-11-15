import { CuttingList, Prisma, ProductionPlanItem } from "@prisma/client";
import { BaseRepository } from "./BaseRepository";

export class ProductionPlanRepository extends BaseRepository {
  private static instance: ProductionPlanRepository;

  private constructor() {
    super();
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
    return this.prisma.productionPlanItem.findMany({
      where: {
        id: { in: ids },
      },
    });
  }

  public async createCuttingList(
    data: Prisma.CuttingListCreateInput,
  ): Promise<CuttingList> {
    return this.prisma.cuttingList.create({ data });
  }

  public async createCuttingListItems(
    data: Prisma.CuttingListItemCreateManyInput[],
  ): Promise<number> {
    const result = await this.prisma.cuttingListItem.createMany({ data });
    return result.count;
  }

  public async linkPlanItemsToCuttingList(
    ids: string[],
    cuttingListId: string,
  ): Promise<void> {
    await this.prisma.productionPlanItem.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        linkedCuttingListId: cuttingListId,
      },
    });
  }

  public async linkPlanItem(id: string, cuttingListId: string): Promise<void> {
    await this.prisma.productionPlanItem.update({
      where: { id },
      data: { linkedCuttingListId: cuttingListId },
    });
  }

  public async findPlanItemWithCuttingList(id: string) {
    return this.prisma.productionPlanItem.findUnique({
      where: { id },
      include: {
        linkedCuttingList: true,
      },
    });
  }
}

export const productionPlanRepository = ProductionPlanRepository.getInstance();
