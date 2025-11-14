/**
 * @fileoverview Production Plan to Cutting List Service
 * @module services/productionPlanToCuttingListService
 * @version 1.0.0
 */

import { PrismaClient, ItemPriority } from "@prisma/client";
import { prisma as prismaClient } from "../config/database";

export interface CreateCuttingListFromPlanRequest {
  readonly productionPlanItems: Array<{
    readonly planItemId: string;
    readonly profileType: string;
    readonly length: number;
    readonly quantity: number;
  }>;
  readonly cuttingListMetadata: {
    readonly name: string;
    readonly description?: string;
  };
  readonly userId: string;
}

export interface CuttingListFromPlanResult {
  readonly success: boolean;
  readonly data?: {
    readonly cuttingListId: string;
    readonly name: string;
    readonly itemCount: number;
  };
  readonly error?: string;
}

export class ProductionPlanToCuttingListService {
  constructor(private readonly prisma: PrismaClient = prismaClient) {}

  /**
   * Plan itemlarından kesim listesi oluştur
   */
  async createCuttingListFromPlan(
    request: CreateCuttingListFromPlanRequest,
  ): Promise<CuttingListFromPlanResult> {
    try {
      // Plan itemlarını doğrula
      const planItems = await this.validatePlanItems(
        request.productionPlanItems,
      );
      if (!planItems.success) {
        return { success: false, error: planItems.error };
      }

      // Kesim listesi oluştur
      const cuttingList = await this.prisma.cuttingList.create({
        data: {
          name: request.cuttingListMetadata.name,
          description: request.cuttingListMetadata.description || "",
          status: "DRAFT",
          userId: request.userId,
          metadata: {
            source: "production-plan",
            createdFromPlan: true,
            planItemCount: request.productionPlanItems.length,
          },
        },
      });

      // Plan itemlarından kesim listesi itemları oluştur
      const cuttingListItems = await this.createCuttingListItems(
        cuttingList.id,
        request.productionPlanItems,
        planItems.data!,
      );

      // Plan itemları ile kesim listesi arasında link kur
      await this.linkPlanItemsToCuttingList(
        request.productionPlanItems.map((item) => item.planItemId),
        cuttingList.id,
      );

      return {
        success: true,
        data: {
          cuttingListId: cuttingList.id,
          name: cuttingList.name,
          itemCount: cuttingListItems,
        },
      };
    } catch (error) {
      console.error("Error creating cutting list from plan:", error);
      return {
        success: false,
        error: "Kesim listesi oluşturulurken hata oluştu",
      };
    }
  }

  /**
   * Plan itemlarını doğrula ve getir
   */
  private async validatePlanItems(planItemIds: Array<{ planItemId: string }>) {
    try {
      const items = await this.prisma.productionPlanItem.findMany({
        where: {
          id: {
            in: planItemIds.map((item) => item.planItemId),
          },
        },
      });

      if (items.length !== planItemIds.length) {
        return {
          success: false,
          error: "Bazı plan itemları bulunamadı",
        };
      }

      return {
        success: true,
        data: items,
      };
    } catch (error) {
      console.error("Error validating plan items:", error);
      return {
        success: false,
        error: "Plan itemları doğrulanamadı",
      };
    }
  }

  /**
   * Plan itemlarından kesim listesi itemları oluştur
   */
  private async createCuttingListItems(
    cuttingListId: string,
    planItems: CreateCuttingListFromPlanRequest["productionPlanItems"],
    validatedItems: Array<{
      id: string;
      siparis: string;
      miktar: number;
      malzemeNo: string;
      malzemeKisaMetni: string;
      oncelik?: string | null;
    }>,
  ) {
    const itemsToCreate = planItems.map((planItem) => {
      const validatedItem = validatedItems.find(
        (item) => item.id === planItem.planItemId,
      );

      if (!validatedItem) {
        throw new Error(`Plan item not found: ${planItem.planItemId}`);
      }

      return {
        cuttingListId,
        workOrderId: validatedItem.siparis, // Sipariş numarası workOrderId olarak
        profileType: planItem.profileType,
        length: planItem.length,
        quantity: planItem.quantity,
        orderQuantity: validatedItem.miktar,
        materialNumber: validatedItem.malzemeNo,
        materialDescription: validatedItem.malzemeKisaMetni,
        productionPlanItemId: planItem.planItemId,
        color: "Beyaz", // Default color
        version: "1.0", // Default version
        size: "Standard", // Default size
        priority: this.mapPriority(validatedItem.oncelik as string),
        status: "DRAFT" as const,
      };
    });

    const result = await this.prisma.cuttingListItem.createMany({
      data: itemsToCreate,
    });
    return result.count;
  }

  /**
   * Plan itemları ile kesim listesi arasında link kur
   */
  private async linkPlanItemsToCuttingList(
    planItemIds: string[],
    cuttingListId: string,
  ) {
    await this.prisma.productionPlanItem.updateMany({
      where: {
        id: {
          in: planItemIds,
        },
      },
      data: {
        linkedCuttingListId: cuttingListId,
      },
    });
  }

  /**
   * Öncelik mapping'i
   */
  private mapPriority(oncelik: string): ItemPriority {
    switch (oncelik.toLowerCase()) {
      case "yuksek":
      case "yüksek":
        return "HIGH" as ItemPriority;
      case "orta":
        return "MEDIUM" as ItemPriority;
      case "dusuk":
      case "düşük":
        return "LOW" as ItemPriority;
      default:
        return "MEDIUM" as ItemPriority;
    }
  }

  /**
   * Plan item ile kesim listesi arasında link kur
   */
  async linkPlanItemToCuttingList(
    planItemId: string,
    cuttingListId: string,
  ): Promise<void> {
    try {
      await this.prisma.productionPlanItem.update({
        where: { id: planItemId },
        data: { linkedCuttingListId: cuttingListId },
      });
    } catch (error) {
      console.error("Error linking plan item to cutting list:", error);
      throw new Error("Plan itemı kesim listesi ile bağlanamadı");
    }
  }

  /**
   * Plan item'ın bağlı olduğu kesim listesini getir
   */
  async getLinkedCuttingList(planItemId: string) {
    try {
      const planItem = await this.prisma.productionPlanItem.findUnique({
        where: { id: planItemId },
        include: {
          linkedCuttingList: {
            include: {
              items: true,
            },
          },
        },
      });

      return planItem?.linkedCuttingList || null;
    } catch (error) {
      console.error("Error getting linked cutting list:", error);
      return null;
    }
  }

  /**
   * Plan item'ı kesim listesinden ayır
   */
  async unlinkPlanItemFromCuttingList(planItemId: string): Promise<void> {
    try {
      await this.prisma.productionPlanItem.update({
        where: { id: planItemId },
        data: { linkedCuttingListId: null },
      });
    } catch (error) {
      console.error("Error unlinking plan item from cutting list:", error);
      throw new Error("Plan itemı kesim listesinden ayrılamadı");
    }
  }

  /**
   * Kesim listesine bağlı plan itemları getir
   */
  async getLinkedPlanItems(cuttingListId: string) {
    try {
      return await this.prisma.productionPlanItem.findMany({
        where: { linkedCuttingListId: cuttingListId },
        include: {
          plan: true,
        },
      });
    } catch (error) {
      console.error("Error getting linked plan items:", error);
      return [];
    }
  }
}

export const productionPlanToCuttingListService =
  new ProductionPlanToCuttingListService();
