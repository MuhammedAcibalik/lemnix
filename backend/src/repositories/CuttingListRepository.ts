/**
 * Cutting List Repository
 * Data access layer for CuttingList operations
 *
 * @module repositories/CuttingListRepository
 * @version 1.0.0
 */

import { prisma } from "../config/database";
import {
  CuttingList,
  CuttingListItem as PrismaCuttingListItem,
  Prisma,
} from "@prisma/client";
import { logger } from "../services/logger";
import {
  cacheService,
  CacheKeys,
  CacheTags,
} from "../services/cache/RedisCache";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface CuttingListSection {
  id: string;
  productName: string;
  items: PrismaCuttingListItem[];
  createdAt: string;
  updatedAt: string;
}

// Using PrismaCuttingListItem from @prisma/client instead of local interface

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

export class CuttingListRepository {
  private static instance: CuttingListRepository;

  private constructor() {}

  public static getInstance(): CuttingListRepository {
    if (!CuttingListRepository.instance) {
      CuttingListRepository.instance = new CuttingListRepository();
    }
    return CuttingListRepository.instance;
  }

  /**
   * Create a new cutting list
   */
  public async create(
    data: Prisma.CuttingListCreateInput,
  ): Promise<CuttingList> {
    try {
      const result = await prisma.cuttingList.create({
        data,
        include: {
          items: true,
          statistics: true,
        },
      });

      // Cache invalidation
      await cacheService.invalidateByTag(CacheTags.CUTTING_LISTS);

      return result;
    } catch (error) {
      logger.error("Failed to create cutting list", { error });
      throw error;
    }
  }

  /**
   * Find cutting list by ID (with caching)
   */
  public async findById(id: string): Promise<CuttingListWithRelations | null> {
    try {
      // Try cache first (non-blocking)
      let cached: CuttingListWithRelations | null = null;
      try {
        cached = await cacheService.get<CuttingListWithRelations>(
          CacheKeys.cuttingList(id),
        );
        if (cached) {
          return cached;
        }
      } catch (cacheError) {
        logger.warn("Cache get failed (non-critical)", { id, cacheError });
      }

      // Fetch from database
      const list = await prisma.cuttingList.findUnique({
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

      // Cache result (5 minutes) - non-blocking
      if (list) {
        try {
          await cacheService.set(CacheKeys.cuttingList(id), list, {
            ttl: 300,
            tags: [CacheTags.CUTTING_LISTS],
          });
        } catch (cacheError) {
          logger.warn("Cache set failed (non-critical)", { id, cacheError });
        }
      }

      return list;
    } catch (error) {
      logger.error("Failed to find cutting list", { id, error });
      throw error;
    }
  }

  /**
   * Find all cutting lists for a user
   */
  public async findByUserId(
    userId: string,
    filters?: { status?: string; weekNumber?: number },
  ): Promise<CuttingList[]> {
    try {
      return await prisma.cuttingList.findMany({
        where: {
          userId,
          ...(filters?.status && { status: filters.status }),
          ...(filters?.weekNumber && { weekNumber: filters.weekNumber }),
        },
        include: {
          items: true,
          statistics: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      logger.error("Failed to find cutting lists", { userId, filters, error });
      throw error;
    }
  }

  /**
   * Find all cutting lists (with cache busting)
   */
  public async findAll(): Promise<CuttingList[]> {
    try {
      const lists = await prisma.cuttingList.findMany({
        include: {
          items: true,
          statistics: true,
        },
        orderBy: { createdAt: "desc" },
      });

      // Log for debugging
      logger.info(`Found ${lists.length} cutting lists`);

      // 🐛 DEBUG: Log items for each list
      lists.forEach((list) => {
        console.log(
          `🔍 List ${list.id} has ${list.items.length} items:`,
          list.items.map((i) => ({
            id: i.id,
            profileType: i.profileType,
            quantity: i.quantity,
            length: i.length,
          })),
        );
      });

      return lists;
    } catch (error) {
      logger.error("Failed to find all cutting lists", { error });
      throw error;
    }
  }

  /**
   * Find by week number and user
   */
  public async findByWeekNumber(
    userId: string,
    weekNumber: number,
  ): Promise<CuttingList | null> {
    try {
      return await prisma.cuttingList.findFirst({
        where: { userId, weekNumber },
        include: {
          items: true,
          statistics: true,
        },
      });
    } catch (error) {
      logger.error("Failed to find cutting list by week", {
        userId,
        weekNumber,
        error,
      });
      throw error;
    }
  }

  /**
   * Find all cutting lists by week number (for duplicate check)
   */
  public async findAllByWeekNumber(
    weekNumber: number,
  ): Promise<ReadonlyArray<CuttingList>> {
    try {
      return await prisma.cuttingList.findMany({
        where: { weekNumber },
      });
    } catch (error) {
      logger.error("Failed to find cutting lists by week number", {
        weekNumber,
        error,
      });
      throw error;
    }
  }

  /**
   * Update cutting list
   */
  public async update(
    id: string,
    data: Prisma.CuttingListUpdateInput,
  ): Promise<CuttingList> {
    try {
      const result = await prisma.cuttingList.update({
        where: { id },
        data,
        include: {
          items: true,
          statistics: true,
        },
      });

      // Cache invalidation
      await cacheService.delete(CacheKeys.cuttingList(id));
      await cacheService.invalidateByTag(CacheTags.CUTTING_LISTS);

      return result;
    } catch (error) {
      logger.error("Failed to update cutting list", { id, error });
      throw error;
    }
  }

  /**
   * Delete cutting list (Hard delete - permanently remove from database)
   */
  public async delete(id: string): Promise<void> {
    try {
      // Hard delete - permanently remove from database
      // Cascade delete will handle related items and statistics
      await prisma.cuttingList.delete({
        where: { id },
      });

      // Invalidate cache
      await cacheService.delete(CacheKeys.cuttingList(id));
      await cacheService.invalidateByTag(CacheTags.CUTTING_LISTS);

      logger.info("Cutting list permanently deleted from database", { id });
    } catch (error) {
      logger.error("Failed to delete cutting list", { id, error });
      throw error;
    }
  }

  /**
   * Count cutting lists by status
   */
  public async countByStatus(userId: string): Promise<Record<string, number>> {
    try {
      const counts = await prisma.cuttingList.groupBy({
        by: ["status"],
        where: { userId },
        _count: true,
      });

      return counts.reduce(
        (acc, { status, _count }) => {
          acc[status] = _count;
          return acc;
        },
        {} as Record<string, number>,
      );
    } catch (error) {
      logger.error("Failed to count by status", { userId, error });
      throw error;
    }
  }

  /**
   * Find many with cursor-based pagination
   */
  public async findManyPaginated(options: {
    cursor?: string;
    take?: number;
    userId?: string;
    status?: string;
    includeItems?: boolean;
    includeStats?: boolean;
  }): Promise<{ data: CuttingList[]; nextCursor?: string }> {
    try {
      const {
        cursor,
        take = 50,
        userId,
        status,
        includeItems = false,
        includeStats = false,
      } = options;

      const lists = await prisma.cuttingList.findMany({
        take: take + 1, // Fetch one extra to determine if there's a next page
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
        where: {
          ...(userId && { userId }),
          ...(status && { status }),
        },
        include: {
          items: includeItems,
          statistics: includeStats,
        },
        orderBy: { createdAt: "desc" },
      });

      const hasMore = lists.length > take;
      const data = hasMore ? lists.slice(0, -1) : lists;
      const nextCursor = hasMore ? data[data.length - 1]?.id : undefined;

      return { data, nextCursor };
    } catch (error) {
      logger.error("Failed to paginate cutting lists", { options, error });
      throw error;
    }
  }

  /**
   * Batch load by IDs (for DataLoader pattern)
   */
  public async batchLoadByIds(
    ids: readonly string[],
  ): Promise<(CuttingList | null)[]> {
    try {
      const lists = await prisma.cuttingList.findMany({
        where: { id: { in: [...ids] } },
        include: {
          items: true,
          statistics: true,
        },
      });

      // Create a map for O(1) lookup
      const listMap = new Map(lists.map((list) => [list.id, list]));

      // Return in the same order as input IDs
      return ids.map((id) => listMap.get(id) ?? null);
    } catch (error) {
      logger.error("Failed to batch load cutting lists", { ids, error });
      throw error;
    }
  }

  /**
   * Add product section to cutting list
   */
  public async addProductSection(
    cuttingListId: string,
    data: { productName: string },
  ): Promise<{
    id: string;
    productName: string;
    items: any[];
    createdAt: string;
    updatedAt: string;
  }> {
    try {
      // Check if cutting list exists
      const cuttingList = await prisma.cuttingList.findUnique({
        where: { id: cuttingListId },
      });

      if (!cuttingList) {
        throw new Error("Cutting list not found");
      }

      // Create new product section
      const now = new Date();
      const newSection = {
        id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        productName: data.productName,
        items: [],
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      // 🐛 DEBUG: Log the new section being created
      console.log(
        "🔍 Creating new section:",
        JSON.stringify(newSection, null, 2),
      );

      // Parse existing sections from JSON
      let existingSections: CuttingListSection[] = [];
      try {
        existingSections = Array.isArray(cuttingList.sections)
          ? cuttingList.sections
          : cuttingList.sections
            ? JSON.parse(JSON.stringify(cuttingList.sections))
            : [];
      } catch (parseError) {
        logger.warn("Failed to parse existing sections, starting fresh", {
          cuttingListId,
          parseError,
        });
        existingSections = [];
      }

      // 🐛 DEBUG: Log existing sections
      console.log(
        "🔍 Existing sections before update:",
        existingSections.length,
        existingSections.map((s) => s.productName),
      );

      const updatedSections = [...existingSections, newSection];

      // 🐛 DEBUG: Log what will be saved
      console.log(
        "🔍 Updated sections to save:",
        updatedSections.length,
        updatedSections.map((s) => s.productName),
      );
      console.log(
        "🔍 Full updated sections:",
        JSON.stringify(
          updatedSections.map((s) => ({
            id: s.id,
            productName: s.productName,
            itemsCount: s.items.length,
          })),
          null,
          2,
        ),
      );

      await prisma.cuttingList.update({
        where: { id: cuttingListId },
        data: {
          sections: updatedSections as unknown as Prisma.InputJsonValue, // Prisma Json type
          updatedAt: now,
        },
      });

      // 🐛 DEBUG: Verify what was saved
      const saved = await prisma.cuttingList.findUnique({
        where: { id: cuttingListId },
      });
      console.log(
        "🔍 Verified saved sections:",
        JSON.stringify(saved?.sections, null, 2),
      );

      // Invalidate cache (non-blocking)
      try {
        await cacheService.delete(CacheKeys.cuttingList(cuttingListId));
        await cacheService.invalidateByTag(CacheTags.CUTTING_LISTS);
      } catch (cacheError) {
        // Log but don't fail - cache is optional
        logger.warn("Cache invalidation failed (non-critical)", {
          cuttingListId,
          cacheError,
        });
      }

      logger.info("Product section added successfully", {
        cuttingListId,
        sectionId: newSection.id,
        productName: data.productName,
      });

      return newSection;
    } catch (error) {
      logger.error("Failed to add product section", { cuttingListId, error });
      throw error;
    }
  }

  /**
   * Add item to section
   */
  public async addItemToSection(
    cuttingListId: string,
    sectionId: string,
    itemData: {
      readonly workOrderId: string;
      readonly date: string;
      readonly version: string;
      readonly color: string;
      readonly note?: string;
      readonly orderQuantity: number;
      readonly size: string;
      readonly priority: string;
      readonly status: string;
      readonly profileType?: string;
      readonly measurement?: string;
      readonly quantity?: number;
      readonly profiles: ReadonlyArray<{
        readonly id: string;
        readonly profile: string;
        readonly measurement: string;
        readonly quantity: number;
      }>;
    },
  ): Promise<any> {
    try {
      // Fetch cutting list from PostgreSQL
      const cuttingList = await prisma.cuttingList.findUnique({
        where: { id: cuttingListId },
      });

      if (!cuttingList) {
        throw new Error("Cutting list not found");
      }

      // Parse existing sections from JSONB
      let existingSections: CuttingListSection[] = [];
      try {
        existingSections = Array.isArray(cuttingList.sections)
          ? cuttingList.sections
          : cuttingList.sections
            ? JSON.parse(JSON.stringify(cuttingList.sections))
            : [];
      } catch (parseError) {
        logger.warn("Failed to parse existing sections", {
          cuttingListId,
          parseError,
        });
        throw new Error("Invalid sections data");
      }

      // Find target section by sectionId - support both old and new ID formats
      const sectionIndex = existingSections.findIndex(
        (s: CuttingListSection) => {
          // Direct match
          if (s.id === sectionId) {
            return true;
          }

          // Support new format: section-{cuttingListId}-{index}
          const match = sectionId.match(/^section-(.+)-(\d+)$/);
          if (match) {
            const [, listId, index] = match;
            const expectedId = `section-${listId}-${index}`;
            return s.id === expectedId;
          }

          // Fallback: Try to match by index only if cuttingListId matches
          const indexMatch = sectionId.match(/-(\d+)$/);
          if (indexMatch) {
            const index = parseInt(indexMatch[1]);
            return (
              index < existingSections.length &&
              existingSections[index] !== undefined
            );
          }

          return false;
        },
      );

      if (sectionIndex === -1) {
        logger.error("Section not found", {
          sectionId,
          availableSections: existingSections.map((s) => s.id),
        });
        throw new Error("Product section not found");
      }

      // Create new item with unique ID
      const now = new Date();
      const newItem = {
        id: `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        cuttingListId: cuttingListId, // ✅ ADD - CRITICAL for smart learning
        workOrderId: itemData.workOrderId,
        date: itemData.date,
        version: itemData.version,
        color: itemData.color,
        notes: itemData.note || null,
        orderQuantity: itemData.orderQuantity,
        size: itemData.size,
        priority: itemData.priority,
        status: itemData.status,
        // profiles: itemData.profiles, // Removed - not part of PrismaCuttingListItem interface
        profileType: itemData.profileType || "Unknown",
        // measurement: itemData.measurement || '0mm', // Removed - not part of PrismaCuttingListItem interface
        quantity: itemData.quantity || 1,
        length: 0, // Default value
        cuttingPattern: null, // Default value
        // Üretim planı entegrasyonu
        materialNumber: null, // Malzeme numarası (üretim planından)
        materialDescription: null, // Malzeme açıklaması (üretim planından)
        productionPlanItemId: null, // Hangi plan itemından geldiği
        createdAt: now,
        updatedAt: now,
      } as PrismaCuttingListItem;

      // Add item to section.items array
      const targetSection = existingSections[sectionIndex];
      targetSection.items = [...(targetSection.items || []), newItem];
      targetSection.updatedAt = now.toISOString();

      // ✅ CRITICAL FIX: Create CuttingListItem records for each profile
      console.log(
        "🔍 Creating DB items for profiles:",
        itemData.profiles.length,
        "profiles",
      );
      const dbItems = [];
      for (const profile of itemData.profiles) {
        const profileData = {
          id: `${newItem.id}-${profile.id}`,
          cuttingListId: cuttingListId,
          workOrderId: itemData.workOrderId,
          date: itemData.date,
          version: itemData.version,
          color: itemData.color,
          notes: itemData.note || null,
          orderQuantity: itemData.orderQuantity,
          size: itemData.size,
          priority: itemData.priority,
          status: itemData.status,
          profileType: profile.profile, // Profil tipi (örn: "HELEZON", "DİREK")
          quantity: profile.quantity, // Profil adedi
          length:
            parseFloat(profile.measurement?.replace("mm", "") || "0") || 0, // Ölçü (mm'den sayıya çevir)
          cuttingPattern: null,
          materialNumber: null,
          materialDescription: null,
          productionPlanItemId: null,
        };

        console.log(
          "🔍 Creating DB item:",
          JSON.stringify(profileData, null, 2),
        );

        const profileItem = await prisma.cuttingListItem.create({
          data: profileData,
        });
        dbItems.push(profileItem);
        console.log("✅ DB item created:", profileItem.id);
      }

      console.log("✅ Total DB items created:", dbItems.length);

      // Update cutting list in PostgreSQL
      await prisma.cuttingList.update({
        where: { id: cuttingListId },
        data: {
          sections: existingSections as unknown as Prisma.InputJsonValue,
          updatedAt: now,
        },
      });

      console.log("✅ Cutting list sections updated with new item");

      // Invalidate cache (non-blocking)
      try {
        await cacheService.delete(CacheKeys.cuttingList(cuttingListId));
        await cacheService.invalidateByTag(CacheTags.CUTTING_LISTS);
      } catch (cacheError) {
        logger.warn("Cache invalidation failed (non-critical)", {
          cuttingListId,
          cacheError,
        });
      }

      // 🐛 DEBUG: Verify items were saved by querying them back
      const verifyItems = await prisma.cuttingListItem.findMany({
        where: { cuttingListId, workOrderId: itemData.workOrderId },
      });
      console.log("🔍 Verified saved items in DB:", verifyItems.length);
      console.log(
        "🔍 Verified items:",
        JSON.stringify(
          verifyItems.map((i) => ({
            id: i.id,
            profileType: i.profileType,
            quantity: i.quantity,
            length: i.length,
          })),
          null,
          2,
        ),
      );

      logger.info("Item added to section successfully", {
        cuttingListId,
        sectionId,
        itemId: newItem.id,
        dbItemsCount: dbItems.length,
      });

      return dbItems[0]; // İlk profil item'ını döndür (backward compatibility için)
    } catch (error) {
      logger.error("Failed to add item to section", {
        cuttingListId,
        sectionId,
        error,
      });
      throw error;
    }
  }

  /**
   * Update item in section
   */
  public async updateItemInSection(
    cuttingListId: string,
    sectionId: string,
    itemId: string,
    itemData: Partial<{
      readonly workOrderId: string;
      readonly date: string;
      readonly version: string;
      readonly color: string;
      readonly note?: string;
      readonly orderQuantity: number;
      readonly size: string;
      readonly priority: string;
      readonly status: string;
      readonly profiles: ReadonlyArray<{
        readonly id: string;
        readonly profile: string;
        readonly measurement: string;
        readonly quantity: number;
      }>;
    }>,
  ): Promise<any> {
    try {
      // Fetch cutting list from PostgreSQL
      const cuttingList = await prisma.cuttingList.findUnique({
        where: { id: cuttingListId },
      });

      if (!cuttingList) {
        throw new Error("Cutting list not found");
      }

      // Parse existing sections from JSONB
      let existingSections: CuttingListSection[] = [];
      try {
        existingSections = Array.isArray(cuttingList.sections)
          ? cuttingList.sections
          : cuttingList.sections
            ? JSON.parse(JSON.stringify(cuttingList.sections))
            : [];
      } catch (parseError) {
        logger.warn("Failed to parse existing sections", {
          cuttingListId,
          parseError,
        });
        throw new Error("Invalid sections data");
      }

      // DEBUG: Log section matching details
      logger.info("🔍 Section matching debug", {
        cuttingListId,
        sectionId,
        existingSectionsCount: existingSections.length,
        existingSectionIds: existingSections.map((s) => s.id),
        sections: existingSections.map((s) => ({
          id: s.id,
          productName: s.productName,
        })),
      });

      // Find target section - support both old and new ID formats
      const sectionIndex = existingSections.findIndex(
        (s: CuttingListSection) => {
          // Direct match
          if (s.id === sectionId) {
            logger.info("✅ Direct match found", {
              sectionId,
              matchedId: s.id,
            });
            return true;
          }

          // Support new format: section-{cuttingListId}-{index}
          // Extract index from sectionId like "section-cmhayo93u00188etahqedmf6q-0"
          const match = sectionId.match(/^section-(.+)-(\d+)$/);
          if (match) {
            const [, listId, index] = match;
            const expectedId = `section-${listId}-${index}`;
            logger.info("🔍 Checking new format", {
              sectionId,
              listId,
              index,
              expectedId,
              actualId: s.id,
            });
            if (s.id === expectedId) {
              logger.info("✅ New format match found", {
                sectionId,
                expectedId,
                matchedId: s.id,
              });
              return true;
            }
          }

          // Fallback: Try to match by index only if cuttingListId matches
          const indexMatch = sectionId.match(/-(\d+)$/);
          if (indexMatch) {
            const index = parseInt(indexMatch[1]);
            const isMatch =
              index < existingSections.length &&
              existingSections[index] !== undefined;
            logger.info("🔍 Checking index fallback", {
              sectionId,
              index,
              isMatch,
              sectionExists: existingSections[index]?.id,
            });
            if (isMatch) {
              logger.info("✅ Index fallback match found", {
                sectionId,
                index,
                matchedId: existingSections[index]?.id,
              });
              return true;
            }
          }

          return false;
        },
      );

      if (sectionIndex === -1) {
        logger.error("Section not found", {
          sectionId,
          availableSections: existingSections.map((s) => s.id),
        });
        throw new Error("Product section not found");
      }

      const targetSection = existingSections[sectionIndex];

      // DEBUG: Log item matching details
      logger.info("🔍 Item matching debug", {
        itemId,
        sectionId,
        targetSectionId: targetSection.id,
        itemsCount: targetSection.items?.length || 0,
        itemIds: targetSection.items?.map((item) => item.id) || [],
        items:
          targetSection.items?.map((item) => ({
            id: item.id,
            workOrderId: item.workOrderId,
          })) || [],
      });

      // Find target item - try by ID first, then by workOrderId if itemId starts with "workorder-"
      let itemIndex =
        targetSection.items?.findIndex(
          (item: PrismaCuttingListItem) => item.id === itemId,
        ) ?? -1;

      if (itemIndex === -1 && itemId.startsWith("workorder-")) {
        // Extract workOrderId from itemId (e.g., "workorder-2355572" -> "2355572")
        const workOrderId = itemId.replace("workorder-", "");
        logger.info("🔍 Trying to match by workOrderId", {
          itemId,
          workOrderId,
        });
        itemIndex =
          targetSection.items?.findIndex(
            (item: PrismaCuttingListItem) => item.workOrderId === workOrderId,
          ) ?? -1;
      }

      if (itemIndex === -1) {
        logger.error("❌ Item not found in section", {
          itemId,
          sectionId,
          availableItemIds: targetSection.items?.map((item) => item.id) || [],
          availableWorkOrderIds:
            targetSection.items?.map((item) => item.workOrderId) || [],
          targetSectionId: targetSection.id,
        });
        throw new Error("Item not found");
      }

      logger.info("✅ Item found", { itemId, itemIndex });

      // Update item with new data
      const now = new Date();
      const currentItem = targetSection.items[
        itemIndex
      ] as PrismaCuttingListItem;

      // Safe property access with fallbacks
      const safeCurrentItem = {
        workOrderId: currentItem?.workOrderId || "",
        date: currentItem?.date || "",
        version: currentItem?.version || "",
        color: currentItem?.color || "",
        notes: currentItem?.notes || null,
        orderQuantity: currentItem?.orderQuantity || 0,
        size: currentItem?.size || "",
        priority: currentItem?.priority || "1",
        status: currentItem?.status || "pending",
      };

      const updatedItem = {
        ...currentItem,
        ...itemData,
        updatedAt: now,
      };

      targetSection.items[itemIndex] = updatedItem;
      targetSection.updatedAt = now.toISOString();

      // ✅ CRITICAL FIX: Update CuttingListItem records in database
      if (itemData.profiles && Array.isArray(itemData.profiles)) {
        try {
          // Delete existing CuttingListItem records for this item
          await prisma.cuttingListItem.deleteMany({
            where: {
              cuttingListId: cuttingListId,
              workOrderId: safeCurrentItem.workOrderId,
            },
          });

          // Create new CuttingListItem records for each profile
          for (const profile of itemData.profiles) {
            await prisma.cuttingListItem.create({
              data: {
                id: `${itemId}-${profile.id}`,
                cuttingListId: cuttingListId,
                workOrderId:
                  itemData.workOrderId || safeCurrentItem.workOrderId,
                date: itemData.date || safeCurrentItem.date,
                version: itemData.version || safeCurrentItem.version,
                color: itemData.color || safeCurrentItem.color,
                notes: itemData.note || safeCurrentItem.notes || null,
                orderQuantity:
                  itemData.orderQuantity || safeCurrentItem.orderQuantity,
                size: itemData.size || safeCurrentItem.size,
                priority: itemData.priority || safeCurrentItem.priority,
                status: itemData.status || safeCurrentItem.status,
                profileType: profile.profile || "Unknown",
                quantity: profile.quantity || 0,
                length:
                  parseFloat(profile.measurement?.replace("mm", "") || "0") ||
                  0,
                cuttingPattern: null,
                materialNumber: null,
                materialDescription: null,
                productionPlanItemId: null,
              },
            });
          }
        } catch (dbError) {
          logger.error("Failed to update CuttingListItem records", {
            cuttingListId,
            itemId,
            error: dbError,
          });
          // Don't fail the main request if DB update fails
        }
      }

      // Update cutting list in PostgreSQL
      await prisma.cuttingList.update({
        where: { id: cuttingListId },
        data: {
          sections: existingSections as unknown as Prisma.InputJsonValue,
          updatedAt: now,
        },
      });

      // Invalidate cache (non-blocking)
      try {
        await cacheService.delete(CacheKeys.cuttingList(cuttingListId));
        await cacheService.invalidateByTag(CacheTags.CUTTING_LISTS);
      } catch (cacheError) {
        logger.warn("Cache invalidation failed (non-critical)", {
          cuttingListId,
          cacheError,
        });
      }

      logger.info("Item updated successfully", {
        cuttingListId,
        sectionId,
        itemId,
      });

      return updatedItem;
    } catch (error) {
      logger.error("Failed to update item", {
        cuttingListId,
        sectionId,
        itemId,
        error,
      });
      throw error;
    }
  }

  /**
   * Delete item from section
   */
  public async deleteItemFromSection(
    cuttingListId: string,
    sectionId: string,
    itemId: string,
  ): Promise<void> {
    try {
      // Fetch cutting list from PostgreSQL
      const cuttingList = await prisma.cuttingList.findUnique({
        where: { id: cuttingListId },
      });

      if (!cuttingList) {
        throw new Error("Cutting list not found");
      }

      // Parse existing sections from JSONB
      let existingSections: CuttingListSection[] = [];
      try {
        existingSections = Array.isArray(cuttingList.sections)
          ? cuttingList.sections
          : cuttingList.sections
            ? JSON.parse(JSON.stringify(cuttingList.sections))
            : [];
      } catch (parseError) {
        logger.warn("Failed to parse existing sections", {
          cuttingListId,
          parseError,
        });
        throw new Error("Invalid sections data");
      }

      // Find target section - support both old and new ID formats
      const sectionIndex = existingSections.findIndex(
        (s: CuttingListSection) => {
          // Direct match
          if (s.id === sectionId) {
            return true;
          }

          // Support new format: section-{cuttingListId}-{index}
          const match = sectionId.match(/^section-(.+)-(\d+)$/);
          if (match) {
            const [, listId, index] = match;
            const expectedId = `section-${listId}-${index}`;
            return s.id === expectedId;
          }

          // Fallback: Try to match by index only if cuttingListId matches
          const indexMatch = sectionId.match(/-(\d+)$/);
          if (indexMatch) {
            const index = parseInt(indexMatch[1]);
            return (
              index < existingSections.length &&
              existingSections[index] !== undefined
            );
          }

          return false;
        },
      );

      if (sectionIndex === -1) {
        logger.error("Section not found", {
          sectionId,
          availableSections: existingSections.map((s) => s.id),
        });
        throw new Error("Product section not found");
      }

      const targetSection = existingSections[sectionIndex];

      // Filter out the item - try by ID first, then by workOrderId if itemId starts with "workorder-"
      const originalLength = targetSection.items?.length || 0;
      let filteredItems = (targetSection.items || []).filter(
        (item: any) => item.id !== itemId,
      );

      // If no items were filtered and itemId starts with "workorder-", try by workOrderId
      if (
        filteredItems.length === originalLength &&
        itemId.startsWith("workorder-")
      ) {
        const workOrderId = itemId.replace("workorder-", "");
        logger.info("🔍 Delete: Trying to match by workOrderId", {
          itemId,
          workOrderId,
        });
        filteredItems = (targetSection.items || []).filter(
          (item: any) => item.workOrderId !== workOrderId,
        );
      }

      targetSection.items = filteredItems;

      if (targetSection.items.length === originalLength) {
        logger.error("❌ Item not found for deletion", {
          itemId,
          sectionId,
          availableItemIds: targetSection.items?.map((item) => item.id) || [],
          availableWorkOrderIds:
            targetSection.items?.map((item) => item.workOrderId) || [],
        });
        throw new Error("Item not found");
      }

      // Update section timestamp
      const now = new Date();
      targetSection.updatedAt = now.toISOString();

      // Update cutting list in PostgreSQL
      await prisma.cuttingList.update({
        where: { id: cuttingListId },
        data: {
          sections: existingSections as unknown as Prisma.InputJsonValue,
          updatedAt: now,
        },
      });

      // Invalidate cache (non-blocking)
      try {
        await cacheService.delete(CacheKeys.cuttingList(cuttingListId));
        await cacheService.invalidateByTag(CacheTags.CUTTING_LISTS);
      } catch (cacheError) {
        logger.warn("Cache invalidation failed (non-critical)", {
          cuttingListId,
          cacheError,
        });
      }

      logger.info("Item deleted successfully", {
        cuttingListId,
        sectionId,
        itemId,
      });
    } catch (error) {
      logger.error("Failed to delete item", {
        cuttingListId,
        sectionId,
        itemId,
        error,
      });
      throw error;
    }
  }

  /**
   * Add item to cutting list (simple version for Excel upload)
   */
  public async addItem(
    cuttingListId: string,
    itemData: {
      readonly workOrderId: string;
      readonly date: string;
      readonly color: string;
      readonly version: string;
      readonly size: string;
      readonly profileType: string;
      readonly length: number;
      readonly quantity: number;
      readonly orderQuantity: number;
      readonly cuttingPattern: string;
      readonly notes?: string;
      readonly priority: string;
      readonly status: string;
    },
  ): Promise<void> {
    try {
      // Check if cutting list exists
      const cuttingList = await prisma.cuttingList.findUnique({
        where: { id: cuttingListId },
      });

      if (!cuttingList) {
        throw new Error("Cutting list not found");
      }

      // Add item directly to cutting list (no sections needed)
      await prisma.cuttingListItem.create({
        data: {
          cuttingListId: cuttingListId,
          workOrderId: itemData.workOrderId,
          date: itemData.date,
          version: itemData.version,
          color: itemData.color,
          notes: itemData.notes || "", // ✅ DÜZELTME: note -> notes
          orderQuantity: itemData.orderQuantity,
          size: itemData.size,
          priority: itemData.priority,
          status: itemData.status,
          profileType: itemData.profileType,
          length: itemData.length, // ✅ DÜZELTME: measurement yerine length
          quantity: itemData.quantity,
        },
      });

      // Invalidate cache
      await this.invalidateCache(cuttingListId, "system-user");
    } catch (error) {
      logger.error("Failed to add item", { cuttingListId, itemData, error });
      throw error;
    }
  }

  /**
   * Invalidate cache for cutting list
   */
  public async invalidateCache(id: string, userId: string): Promise<void> {
    await cacheService.delete(CacheKeys.cuttingList(id));
    await cacheService.delete(CacheKeys.cuttingLists(userId));
    await cacheService.invalidateByTag(CacheTags.CUTTING_LISTS);
  }
}

export const cuttingListRepository = CuttingListRepository.getInstance();
