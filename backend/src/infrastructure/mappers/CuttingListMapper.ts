/**
 * Cutting List Mapper
 *
 * Maps between Prisma models and Domain entities
 *
 * @module infrastructure/mappers/CuttingListMapper
 * @version 1.0.0
 */

import {
  CuttingList as PrismaCuttingList,
  CuttingListItem as PrismaCuttingListItem,
  CuttingListStatus,
  ItemPriority,
  Prisma,
} from "@prisma/client";
import { CuttingList } from "../../domain/entities/CuttingList";
import { CuttingListItem } from "../../domain/entities/CuttingListItem";
import { WeekNumber } from "../../domain/valueObjects/WeekNumber";
import { Quantity } from "../../domain/valueObjects/Quantity";

/**
 * Cutting List Mapper
 */
export class CuttingListMapper {
  /**
   * Map Prisma model to Domain entity
   */
  public static toDomain(
    prisma: PrismaCuttingList & { items?: PrismaCuttingListItem[] },
  ): CuttingList {
    return CuttingList.fromPersistence({
      id: prisma.id,
      name: prisma.name,
      description: prisma.description || undefined,
      status: prisma.status,
      userId: prisma.userId,
      weekNumber: WeekNumber.fromNullable(prisma.weekNumber),
      metadata: (prisma.metadata as Record<string, unknown>) || null,
      sections: (prisma.sections as Record<string, unknown>) || null,
      items: prisma.items?.map((item) => this.itemToDomain(item)) || [],
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
    });
  }

  /**
   * Map Domain entity to Prisma create input
   */
  public static toPrismaCreate(domain: CuttingList): {
    name: string;
    description?: string;
    status: CuttingListStatus;
    userId: string;
    weekNumber?: number | null;
    metadata?: Prisma.InputJsonValue;
    sections?: Prisma.InputJsonValue;
  } {
    return {
      name: domain.name,
      description: domain.description,
      status: domain.status as CuttingListStatus,
      userId: domain.userId,
      weekNumber: domain.weekNumber?.getValue() || null,
      metadata: (domain.metadata === null ? undefined : domain.metadata) as
        | Prisma.InputJsonValue
        | undefined,
      sections: (domain.sections === null ? undefined : domain.sections) as
        | Prisma.InputJsonValue
        | undefined,
    };
  }

  /**
   * Map Domain entity to Prisma update input
   */
  public static toPrismaUpdate(domain: Partial<CuttingList>): {
    name?: string;
    description?: string;
    status?: CuttingListStatus;
    weekNumber?: number | null;
    metadata?: Prisma.InputJsonValue;
    sections?: Prisma.InputJsonValue;
    updatedAt?: Date;
  } {
    const update: {
      name?: string;
      description?: string;
      status?: CuttingListStatus;
      weekNumber?: number | null;
      metadata?: Prisma.InputJsonValue;
      sections?: Prisma.InputJsonValue;
      updatedAt?: Date;
    } = {};

    if (domain.name !== undefined) {
      update.name = domain.name;
    }
    if (domain.description !== undefined) {
      update.description = domain.description;
    }
    if (domain.status !== undefined) {
      update.status = domain.status;
    }
    if (domain.weekNumber !== undefined) {
      update.weekNumber = domain.weekNumber?.getValue() || null;
    }
    if (domain.metadata !== undefined) {
      update.metadata = (
        domain.metadata === null ? undefined : domain.metadata
      ) as Prisma.InputJsonValue | undefined;
    }
    if (domain.sections !== undefined) {
      update.sections = (
        domain.sections === null ? undefined : domain.sections
      ) as Prisma.InputJsonValue | undefined;
    }
    update.updatedAt = new Date();

    return update;
  }

  /**
   * Map Prisma item to Domain entity
   */
  public static itemToDomain(prisma: PrismaCuttingListItem): CuttingListItem {
    return CuttingListItem.fromPersistence({
      id: prisma.id,
      workOrderId: prisma.workOrderId,
      date: prisma.date || undefined,
      color: prisma.color,
      version: prisma.version,
      size: prisma.size,
      profileType: prisma.profileType,
      length: Number(prisma.length),
      quantity: Quantity.create(prisma.quantity),
      orderQuantity: prisma.orderQuantity
        ? Quantity.create(prisma.orderQuantity)
        : undefined,
      cuttingPattern: prisma.cuttingPattern || undefined,
      notes: prisma.notes || undefined,
      priority: prisma.priority,
      status: prisma.status,
      cuttingListId: prisma.cuttingListId,
      materialDescription: prisma.materialDescription || undefined,
      materialNumber: prisma.materialNumber || undefined,
      productionPlanItemId: prisma.productionPlanItemId || undefined,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
    });
  }

  /**
   * Map Domain item to Prisma create input
   */
  public static itemToPrismaCreate(domain: CuttingListItem): {
    id: string;
    workOrderId: string;
    date?: string;
    color: string;
    version: string;
    size: string;
    profileType: string;
    length: number;
    quantity: number;
    orderQuantity?: number;
    cuttingPattern?: string;
    notes?: string;
    priority: ItemPriority;
    status: CuttingListStatus;
    cuttingListId: string;
    materialDescription?: string;
    materialNumber?: string;
    productionPlanItemId?: string;
  } {
    return {
      id: domain.id,
      workOrderId: domain.workOrderId,
      date: domain.date,
      color: domain.color,
      version: domain.version,
      size: domain.size,
      profileType: domain.profileType,
      length: domain.length,
      quantity: domain.quantity.getValue(),
      orderQuantity: domain.orderQuantity?.getValue(),
      cuttingPattern: domain.cuttingPattern,
      notes: domain.notes,
      priority: domain.priority as ItemPriority,
      status: domain.status as CuttingListStatus,
      cuttingListId: domain.cuttingListId,
      materialDescription: domain.materialDescription,
      materialNumber: domain.materialNumber,
      productionPlanItemId: domain.productionPlanItemId,
    };
  }

  /**
   * Map Domain item to Prisma update input
   */
  public static itemToPrismaUpdate(domain: Partial<CuttingListItem>): {
    workOrderId?: string;
    date?: string;
    color?: string;
    version?: string;
    size?: string;
    profileType?: string;
    length?: number;
    quantity?: number;
    orderQuantity?: number;
    cuttingPattern?: string;
    notes?: string;
    priority?: ItemPriority;
    status?: CuttingListStatus;
    materialDescription?: string;
    materialNumber?: string;
    updatedAt?: Date;
  } {
    const update: {
      workOrderId?: string;
      date?: string;
      color?: string;
      version?: string;
      size?: string;
      profileType?: string;
      length?: number;
      quantity?: number;
      orderQuantity?: number;
      cuttingPattern?: string;
      notes?: string;
      priority?: ItemPriority;
      status?: CuttingListStatus;
      materialDescription?: string;
      materialNumber?: string;
      updatedAt?: Date;
    } = {};

    if (domain.workOrderId !== undefined) {
      update.workOrderId = domain.workOrderId;
    }
    if (domain.date !== undefined) {
      update.date = domain.date;
    }
    if (domain.color !== undefined) {
      update.color = domain.color;
    }
    if (domain.version !== undefined) {
      update.version = domain.version;
    }
    if (domain.size !== undefined) {
      update.size = domain.size;
    }
    if (domain.profileType !== undefined) {
      update.profileType = domain.profileType;
    }
    if (domain.length !== undefined) {
      update.length = domain.length;
    }
    if (domain.quantity !== undefined) {
      update.quantity = domain.quantity.getValue();
    }
    if (domain.orderQuantity !== undefined) {
      update.orderQuantity = domain.orderQuantity?.getValue();
    }
    if (domain.cuttingPattern !== undefined) {
      update.cuttingPattern = domain.cuttingPattern;
    }
    if (domain.notes !== undefined) {
      update.notes = domain.notes;
    }
    if (domain.priority !== undefined) {
      update.priority = domain.priority as ItemPriority;
    }
    if (domain.status !== undefined) {
      update.status = domain.status as CuttingListStatus;
    }
    if (domain.materialDescription !== undefined) {
      update.materialDescription = domain.materialDescription;
    }
    if (domain.materialNumber !== undefined) {
      update.materialNumber = domain.materialNumber;
    }
    update.updatedAt = new Date();

    return update;
  }
}
