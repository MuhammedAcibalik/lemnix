/**
 * Production Plan Mapper
 *
 * Maps between Prisma models and Domain entities
 *
 * @module infrastructure/mappers/ProductionPlanMapper
 * @version 1.0.0
 */

import {
  ProductionPlan as PrismaProductionPlan,
  ProductionPlanItem as PrismaProductionPlanItem,
  ProductionPlanPriority,
  Prisma,
} from "@prisma/client";
import { ProductionPlan } from "../../domain/entities/ProductionPlan";
import { ProductionPlanItem } from "../../domain/entities/ProductionPlanItem";

/**
 * Production Plan Mapper
 */
export class ProductionPlanMapper {
  /**
   * Map Prisma model to Domain entity
   */
  public static toDomain(
    prisma: PrismaProductionPlan & { items?: PrismaProductionPlanItem[] },
  ): ProductionPlan {
    return ProductionPlan.fromPersistence({
      id: prisma.id,
      weekNumber: prisma.weekNumber,
      year: prisma.year,
      status: prisma.status,
      uploadedBy: prisma.uploadedBy || null,
      metadata: (prisma.metadata as Record<string, unknown>) || null,
      items: prisma.items?.map((item) => this.itemToDomain(item)) || [],
      uploadedAt: prisma.uploadedAt,
    });
  }

  /**
   * Map Domain entity to Prisma create input
   */
  public static toPrismaCreate(domain: ProductionPlan): {
    weekNumber: number;
    year: number;
    status: string;
    uploadedBy?: string | null;
    metadata?: Prisma.InputJsonValue;
  } {
    return {
      weekNumber: domain.weekNumber,
      year: domain.year,
      status: domain.status,
      uploadedBy: domain.uploadedBy || null,
      metadata: (domain.metadata as Prisma.InputJsonValue) || undefined,
    };
  }

  /**
   * Map Domain entity to Prisma update input
   */
  public static toPrismaUpdate(domain: Partial<ProductionPlan>): {
    weekNumber?: number;
    year?: number;
    status?: string;
    uploadedBy?: string | null;
    metadata?: Prisma.InputJsonValue;
  } {
    const update: {
      weekNumber?: number;
      year?: number;
      status?: string;
      uploadedBy?: string | null;
      metadata?: Prisma.InputJsonValue;
    } = {};

    if (domain.weekNumber !== undefined) {
      update.weekNumber = domain.weekNumber;
    }
    if (domain.year !== undefined) {
      update.year = domain.year;
    }
    if (domain.status !== undefined) {
      update.status = domain.status;
    }
    if (domain.uploadedBy !== undefined) {
      update.uploadedBy = domain.uploadedBy || null;
    }
    if (domain.metadata !== undefined) {
      update.metadata = domain.metadata as Prisma.InputJsonValue;
    }

    return update;
  }

  /**
   * Map Prisma item to Domain entity
   */
  public static itemToDomain(
    prisma: PrismaProductionPlanItem,
  ): ProductionPlanItem {
    return ProductionPlanItem.fromPersistence({
      id: prisma.id,
      planId: prisma.planId,
      ad: prisma.ad,
      siparisVeren: prisma.siparisVeren,
      musteriNo: prisma.musteriNo,
      musteriKalemi: prisma.musteriKalemi,
      siparis: prisma.siparis,
      malzemeNo: prisma.malzemeNo,
      malzemeKisaMetni: prisma.malzemeKisaMetni,
      miktar: Number(prisma.miktar),
      planlananBitisTarihi: prisma.planlananBitisTarihi,
      bolum: prisma.bolum,
      oncelik: prisma.oncelik,
      linkedCuttingListId: prisma.linkedCuttingListId || null,
      encryptedAd: prisma.encryptedAd || null,
      encryptedMalzemeKisaMetni: prisma.encryptedMalzemeKisaMetni || null,
      encryptedMalzemeNo: prisma.encryptedMalzemeNo || null,
      encryptedMusteriKalemi: prisma.encryptedMusteriKalemi || null,
      encryptedMusteriNo: prisma.encryptedMusteriNo || null,
      encryptedSiparis: prisma.encryptedSiparis || null,
      encryptedSiparisVeren: prisma.encryptedSiparisVeren || null,
    });
  }

  /**
   * Map Domain item to Prisma create input
   */
  public static itemToPrismaCreate(domain: ProductionPlanItem): {
    id: string;
    planId: string;
    ad: string;
    siparisVeren: string;
    musteriNo: string;
    musteriKalemi: string;
    siparis: string;
    malzemeNo: string;
    malzemeKisaMetni: string;
    miktar: number;
    planlananBitisTarihi: Date;
    bolum: string;
    oncelik?: ProductionPlanPriority;
    linkedCuttingListId?: string | null;
    encryptedAd?: string | null;
    encryptedMalzemeKisaMetni?: string | null;
    encryptedMalzemeNo?: string | null;
    encryptedMusteriKalemi?: string | null;
    encryptedMusteriNo?: string | null;
    encryptedSiparis?: string | null;
    encryptedSiparisVeren?: string | null;
  } {
    // Convert string oncelik to enum
    let oncelik: ProductionPlanPriority | undefined = undefined;
    if (domain.oncelik) {
      const upperOncelik = domain.oncelik.toUpperCase();
      if (Object.values(ProductionPlanPriority).includes(upperOncelik as ProductionPlanPriority)) {
        oncelik = upperOncelik as ProductionPlanPriority;
      }
    }
    
    return {
      id: domain.id,
      planId: domain.planId,
      ad: domain.ad,
      siparisVeren: domain.siparisVeren,
      musteriNo: domain.musteriNo,
      musteriKalemi: domain.musteriKalemi,
      siparis: domain.siparis,
      malzemeNo: domain.malzemeNo,
      malzemeKisaMetni: domain.malzemeKisaMetni,
      miktar: domain.miktar,
      planlananBitisTarihi: domain.planlananBitisTarihi,
      bolum: domain.bolum,
      ...(oncelik !== undefined ? { oncelik } : {}),
      linkedCuttingListId: domain.linkedCuttingListId || null,
      encryptedAd: domain.encryptedAd || null,
      encryptedMalzemeKisaMetni: domain.encryptedMalzemeKisaMetni || null,
      encryptedMalzemeNo: domain.encryptedMalzemeNo || null,
      encryptedMusteriKalemi: domain.encryptedMusteriKalemi || null,
      encryptedMusteriNo: domain.encryptedMusteriNo || null,
      encryptedSiparis: domain.encryptedSiparis || null,
      encryptedSiparisVeren: domain.encryptedSiparisVeren || null,
    };
  }

  /**
   * Map Domain item to Prisma update input
   */
  public static itemToPrismaUpdate(domain: Partial<ProductionPlanItem>): {
    linkedCuttingListId?: string | null;
    oncelik?: string;
  } {
    const update: {
      linkedCuttingListId?: string | null;
      oncelik?: string;
    } = {};

    if (domain.linkedCuttingListId !== undefined) {
      update.linkedCuttingListId = domain.linkedCuttingListId || null;
    }
    if (domain.oncelik !== undefined) {
      update.oncelik = domain.oncelik;
    }

    return update;
  }
}
