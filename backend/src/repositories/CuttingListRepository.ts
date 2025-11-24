/**
 * Cutting List Repository (Legacy Adapter)
 *
 * Wraps the new PrismaCuttingListRepository to maintain backward compatibility
 * Returns Prisma models instead of domain entities
 *
 * @module repositories/CuttingListRepository
 * @version 2.0.0 - Adapter pattern for backward compatibility
 * @deprecated Use PrismaCuttingListRepository directly for new code
 */

import {
  CuttingList,
  CuttingListItem as PrismaCuttingListItem,
  CuttingListStatus,
  ItemPriority,
  Prisma,
} from "@prisma/client";
import { PrismaCuttingListRepository } from "../infrastructure/repositories/PrismaCuttingListRepository";

// ============================================================================
// TYPE DEFINITIONS (for backward compatibility)
// ============================================================================

interface CuttingListSection {
  id: string;
  productName: string;
  productCategory?: string;
  items: PrismaCuttingListItem[];
  createdAt: string;
  updatedAt: string;
}

interface ProfileItem {
  readonly id: string;
  readonly profile: string;
  readonly measurement: string;
  readonly quantity: number;
}

type CuttingListWithRelations = CuttingList & {
  items?: PrismaCuttingListItem[];
  statistics?: unknown[];
  user?: unknown;
};

/**
 * Cutting List Repository (Legacy Adapter)
 * Maintains backward compatibility by returning Prisma models
 */
export class CuttingListRepository {
  private static instance: CuttingListRepository;
  private readonly prismaRepository: PrismaCuttingListRepository;

  private constructor() {
    this.prismaRepository = new PrismaCuttingListRepository();
  }

  public static getInstance(): CuttingListRepository {
    if (!CuttingListRepository.instance) {
      CuttingListRepository.instance = new CuttingListRepository();
    }
    return CuttingListRepository.instance;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create a new cutting list
   */
  public async create(
    data: Prisma.CuttingListCreateInput,
  ): Promise<CuttingList> {
    // Use Prisma client directly for backward compatibility
    return await this.prismaRepository.prisma.cuttingList.create({
      data,
      include: {
        items: true,
        statistics: true,
      },
    });
  }

  /**
   * Find cutting list by ID (with caching)
   */
  public async findById(id: string): Promise<CuttingListWithRelations | null> {
    // Use Prisma client directly for backward compatibility
    return await this.prismaRepository.prisma.cuttingList.findUnique({
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
  }

  /**
   * Find all cutting lists for a user
   */
  public async findByUserId(
    userId: string,
    filters?: { status?: CuttingListStatus; weekNumber?: number },
  ): Promise<CuttingList[]> {
    return await this.prismaRepository.prisma.cuttingList.findMany({
      where: {
        userId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.weekNumber && { weekNumber: filters.weekNumber }),
      },
      include: { items: true, statistics: true },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Find all cutting lists (with cache busting)
   */
  public async findAll(): Promise<CuttingList[]> {
    return await this.prismaRepository.prisma.cuttingList.findMany({
      include: { items: true, statistics: true },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Find by week number and user
   */
  public async findByWeekNumber(
    userId: string,
    weekNumber: number,
  ): Promise<CuttingList | null> {
    return await this.prismaRepository.prisma.cuttingList.findFirst({
      where: { userId, weekNumber },
      include: { items: true, statistics: true },
    });
  }

  /**
   * Find all cutting lists by week number
   */
  public async findAllByWeekNumber(weekNumber: number): Promise<CuttingList[]> {
    return await this.prismaRepository.prisma.cuttingList.findMany({
      where: { weekNumber },
      include: { items: true, statistics: true },
    });
  }

  /**
   * Update cutting list
   */
  public async update(
    id: string,
    data: Partial<Prisma.CuttingListUpdateInput>,
  ): Promise<CuttingList> {
    return await this.prismaRepository.prisma.cuttingList.update({
      where: { id },
      data,
      include: { items: true, statistics: true },
    });
  }

  /**
   * Delete cutting list
   */
  public async delete(id: string): Promise<void> {
    await this.prismaRepository.delete(id);
  }

  /**
   * Add item to cutting list
   */
  public async addItemToSection(
    cuttingListId: string,
    sectionId: string,
    item: Omit<Prisma.CuttingListItemCreateInput, "cuttingList">,
  ): Promise<PrismaCuttingListItem> {
    return await this.prismaRepository.prisma.cuttingListItem.create({
      data: {
        ...item,
        cuttingListId,
      },
    });
  }

  /**
   * Update item in cutting list
   */
  public async updateItemInSection(
    cuttingListId: string,
    itemId: string,
    updates: Partial<Prisma.CuttingListItemUpdateInput>,
  ): Promise<PrismaCuttingListItem> {
    return await this.prismaRepository.prisma.cuttingListItem.update({
      where: { id: itemId },
      data: updates,
    });
  }

  /**
   * Delete item from cutting list
   */
  public async deleteItemFromSection(
    cuttingListId: string,
    itemId: string,
  ): Promise<void> {
    await this.prismaRepository.prisma.cuttingListItem.delete({
      where: { id: itemId },
    });
  }

  /**
   * Add product section to cutting list
   */
  public async addProductSection(
    cuttingListId: string,
    section: { productName: string; productCategory?: string },
  ): Promise<CuttingListSection> {
    const cuttingList =
      await this.prismaRepository.prisma.cuttingList.findUnique({
        where: { id: cuttingListId },
      });

    if (!cuttingList) {
      throw new Error("Cutting list not found");
    }

    const sections = (cuttingList.sections as Record<string, unknown>) || {};
    const sectionId = this.generateId();
    const newSection: CuttingListSection = {
      id: sectionId,
      productName: section.productName,
      productCategory: section.productCategory,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    sections[sectionId] = newSection;

    await this.prismaRepository.prisma.cuttingList.update({
      where: { id: cuttingListId },
      data: {
        sections: sections as Prisma.InputJsonValue,
      },
    });

    return newSection;
  }

  /**
   * Delete section from cutting list
   */
  public async deleteSection(
    cuttingListId: string,
    sectionId: string,
  ): Promise<void> {
    // Get cutting list
    const cuttingList =
      await this.prismaRepository.prisma.cuttingList.findUnique({
        where: { id: cuttingListId },
      });

    if (!cuttingList) {
      throw new Error("Cutting list not found");
    }

    // Update sections JSON
    const sections = (cuttingList.sections as Record<string, unknown>) || {};
    delete sections[sectionId];

    await this.prismaRepository.prisma.cuttingList.update({
      where: { id: cuttingListId },
      data: {
        sections:
          Object.keys(sections).length > 0
            ? (sections as Prisma.InputJsonValue)
            : undefined,
      },
    });
  }
}

/**
 * Singleton instance for backward compatibility
 */
export const cuttingListRepository = CuttingListRepository.getInstance();
