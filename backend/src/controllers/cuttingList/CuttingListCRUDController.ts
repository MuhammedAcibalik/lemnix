/**
 * @fileoverview Cutting List CRUD Controller
 * @module controllers/cuttingList/CuttingListCRUDController
 * @version 1.0.0
 * @description Controller for cutting list CRUD operations
 */

import { Request, Response } from "express";
import type { CuttingList as PrismaCuttingList, Prisma } from "@prisma/client";
import { cuttingListRepository } from "../../repositories/CuttingListRepository";
import { prisma, databaseManager } from "../../config/database";
import { logger } from "../../services/logger";
import { CuttingListBaseController } from "./shared/CuttingListBaseController";
import type {
  CuttingList,
  ProductSection,
  CuttingListItem,
  ProfileItem,
} from "../../types/cuttingList";
import { normalizeItemPriority } from "../../types/cuttingList";

/**
 * Cutting List CRUD Controller
 * Handles create, read, update, delete operations for cutting lists
 */
export class CuttingListCRUDController extends CuttingListBaseController {
  /**
   * Get all cutting lists data (public method for internal use)
   * ✅ MIGRATED: Now fetches from PostgreSQL instead of in-memory Map
   */
  public async getAllCuttingListsData(): Promise<CuttingList[]> {
    try {
      const dbLists = await cuttingListRepository.findAll();
      // Transform Prisma models to CuttingList format
      return dbLists.map((list) => ({
        id: list.id,
        title: list.name,
        weekNumber: list.weekNumber || 0,
        sections: (list.sections as unknown as ProductSection[]) || [],
        createdAt: list.createdAt.toISOString(),
        updatedAt: list.updatedAt.toISOString(),
      }));
    } catch (error) {
      logger.error(
        "[CuttingList] Error fetching cutting lists data",
        error instanceof Error ? error : new Error(String(error)),
      );
      return [];
    }
  }

  /**
   * Create new cutting list
   */
  public createCuttingList = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const { name, title, weekNumber } = req.body;

      // Support both 'name' and 'title' for backward compatibility
      const cuttingListTitle = name || title;

      logger.info("[CuttingList] Creating cutting list", {
        requestId,
        title: cuttingListTitle,
        weekNumber,
      });

      try {
        // Validate input
        if (
          !cuttingListTitle ||
          typeof cuttingListTitle !== "string" ||
          cuttingListTitle.trim().length === 0
        ) {
          res
            .status(400)
            .json(
              this.createResponse(false, undefined, "Name/Title is required"),
            );
          return;
        }

        if (!weekNumber || typeof weekNumber !== "number" || weekNumber < 1) {
          res
            .status(400)
            .json(
              this.createResponse(
                false,
                undefined,
                "Week number is required and must be a positive number",
              ),
            );
          return;
        }

        // ✅ FIXED: Check database connection before querying
        const isConnected = databaseManager.getConnectionStatus();
        if (!isConnected) {
          const healthCheck = await databaseManager.healthCheck();
          if (!healthCheck) {
            res
              .status(503)
              .json(
                this.createResponse(
                  false,
                  undefined,
                  "Veritabanı bağlantı hatası. Lütfen PostgreSQL servisinin çalıştığından emin olun.",
                ),
              );
            return;
          }
        }

        // ✅ FIXED: Check PostgreSQL database instead of in-memory Map
        const existingLists =
          await cuttingListRepository.findAllByWeekNumber(weekNumber);

        if (existingLists.length > 0) {
          // Return 409 Conflict if any list exists for this week
          res
            .status(409)
            .json(
              this.createResponse(
                false,
                undefined,
                `${weekNumber}. Hafta için zaten bir kesim listesi mevcut. Lütfen geçmiş haftalar bölümünden o listeyi görüntüleyin veya önce silin.`,
              ),
            );
          return;
        }

        // ✅ FIXED: Ensure system user exists before creating cutting list
        const systemUser = await prisma.user.upsert({
          where: { id: "system-user" },
          update: {},
          create: {
            id: "system-user",
            email: "system@lemnix.com",
            name: "System User",
            role: "system",
            isActive: true,
          },
        });

        // ✅ MIGRATED: Create cutting list in PostgreSQL (persistent storage)
        // ✅ FIX: Explicitly set status to ensure it's saved
        const cuttingList = await cuttingListRepository.create({
          name: cuttingListTitle.trim(),
          weekNumber: weekNumber,
          status: "DRAFT", // ✅ Explicitly set status
          sections: [],
          user: {
            connect: { id: systemUser.id },
          },
        });

        logger.info(`[${requestId}] ✅ Cutting list created in PostgreSQL`, {
          id: cuttingList.id,
          weekNumber,
          title: cuttingListTitle.trim(),
        });

        // Map Prisma model to API response format
        const response = {
          id: cuttingList.id,
          title: cuttingList.name,
          weekNumber: cuttingList.weekNumber,
          sections: cuttingList.sections,
          createdAt: cuttingList.createdAt.toISOString(),
          updatedAt: cuttingList.updatedAt.toISOString(),
        };

        res.json(this.createResponse(true, response, undefined, requestId));
      } catch (error) {
        const err = error as Error & { code?: string; meta?: unknown };

        logger.error(`[${requestId}] Error creating cutting list:`, {
          error: err.message,
          code: err.code,
          stack: err.stack,
          meta: err.meta,
        });

        // Handle Prisma errors
        if (err.code === "P2002") {
          // Unique constraint violation (duplicate week number)
          res
            .status(409)
            .json(
              this.createResponse(
                false,
                undefined,
                `${weekNumber}. Hafta için zaten bir kesim listesi mevcut.`,
                requestId,
              ),
            );
          return;
        }

        if (err.code === "P2025") {
          // Record not found (user doesn't exist)
          res
            .status(500)
            .json(
              this.createResponse(
                false,
                undefined,
                "System user not found. Please contact administrator.",
                requestId,
              ),
            );
          return;
        }

        // Handle database connection errors
        if (
          err.code === "P1001" ||
          err.code === "P1002" ||
          err.message?.includes("Can't reach database server") ||
          err.message?.includes("database server is running")
        ) {
          logger.error(`[${requestId}] Database connection error:`, {
            code: err.code,
            message: err.message,
          });

          res
            .status(503)
            .json(
              this.createResponse(
                false,
                undefined,
                "Veritabanı bağlantı hatası. Lütfen daha sonra tekrar deneyin veya sistem yöneticisine başvurun.",
                requestId,
              ),
            );
          return;
        }

        // Handle other Prisma errors
        if (err.code?.startsWith("P")) {
          logger.error(`[${requestId}] Prisma error:`, {
            code: err.code,
            message: err.message,
            meta: err.meta,
          });

          res
            .status(500)
            .json(
              this.createResponse(
                false,
                undefined,
                "Veritabanı işlemi başarısız oldu. Lütfen tekrar deneyin.",
                requestId,
              ),
            );
          return;
        }

        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";

        res
          .status(500)
          .json(this.createResponse(false, undefined, errorMessage, requestId));
      }
    },
  );

  /**
   * Get all cutting lists (PostgreSQL)
   */
  public getAllCuttingLists = this.asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      logger.info(`[${requestId}] Getting all cutting lists from PostgreSQL`);

      try {
        // Get all cutting lists from PostgreSQL with items
        const dbLists = await cuttingListRepository.findAll();

        // Type-safe mapping from Prisma to API response
        type CuttingListWithFields = PrismaCuttingList & {
          weekNumber: number | null;
          sections: Prisma.JsonValue;
          items: Array<{
            id: string;
            workOrderId: string;
            date: string | null;
            color: string;
            version: string;
            size: string;
            profileType: string;
            length: number;
            quantity: number;
            orderQuantity: number | null;
            cuttingPattern: string | null;
            notes: string | null;
            priority: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
          }>;
        };

        const lists = dbLists.map((list) => {
          const typedList = list as unknown as CuttingListWithFields;

          // ✅ FIX: Try to parse sections from database JSON field first
          let dbSections: ProductSection[] = [];
          try {
            if (typedList.sections) {
              const parsed =
                typeof typedList.sections === "string"
                  ? JSON.parse(typedList.sections)
                  : typedList.sections;
              dbSections = Array.isArray(parsed) ? parsed : [];

              // DEBUG: Log database sections for troubleshooting
              logger.debug("[CuttingList] DB Sections parsed", {
                requestId,
                cuttingListId: typedList.id,
                sections: dbSections.map((s) => ({
                  id: s.id,
                  productName: s.productName,
                  itemsCount: s.items?.length || 0,
                })),
              });
            }
          } catch (parseError) {
            logger.warn("Failed to parse sections from database", {
              id: typedList.id,
              parseError,
            });
            dbSections = [];
          }

          // ✅ FIX: If we have DB sections, use them as base (preserves user-defined product names)
          if (dbSections.length > 0) {
            logger.info("✅ Using sections from database", {
              id: typedList.id,
              sectionCount: dbSections.length,
            });

            // If we have items, add them to the appropriate sections
            if (typedList.items.length > 0) {
              logger.info("🔧 Adding items to existing sections", {
                id: typedList.id,
                itemCount: typedList.items.length,
              });

              // Group items by workOrderId
              // First group items by workOrderId with mutable arrays
              const mutableItemsByWorkOrder = typedList.items.reduce(
                (acc, item) => {
                  const workOrderId = item.workOrderId;
                  if (!acc[workOrderId]) {
                    acc[workOrderId] = {
                      id: workOrderId,
                      workOrderId: item.workOrderId,
                      date: item.date || new Date().toISOString().split("T")[0],
                      version: item.version,
                      color: item.color,
                      note: item.notes || "",
                      orderQuantity: item.orderQuantity || item.quantity,
                      size: item.size,
                      priority: normalizeItemPriority(item.priority),
                      status: item.status as
                        | "draft"
                        | "ready"
                        | "processing"
                        | "completed",
                      profiles: [] as ProfileItem[],
                      createdAt: item.createdAt.toISOString(),
                      updatedAt: item.updatedAt.toISOString(),
                    };
                  }

                  (acc[workOrderId].profiles as ProfileItem[]).push({
                    id: `${item.id}-profile`,
                    profile: item.profileType,
                    measurement: `${item.length}mm`,
                    quantity: item.quantity,
                  });

                  return acc;
                },
                {} as Record<
                  string,
                  Omit<CuttingListItem, "profiles"> & {
                    profiles: ProfileItem[];
                  }
                >,
              );

              // Convert to readonly structure
              const itemsByWorkOrder = Object.fromEntries(
                Object.entries(mutableItemsByWorkOrder).map(([key, value]) => [
                  key,
                  {
                    ...value,
                    profiles: value.profiles as ReadonlyArray<ProfileItem>,
                  } as CuttingListItem,
                ]),
              ) as Record<string, CuttingListItem>;

              // Add items to existing sections
              const workOrdersByProfileType = Object.values(
                itemsByWorkOrder,
              ).reduce(
                (acc, workOrder) => {
                  const profileType = workOrder.profiles[0]?.profile || "Genel";
                  if (!acc[profileType]) {
                    acc[profileType] = [];
                  }
                  acc[profileType].push({
                    id: `workorder-${workOrder.workOrderId}`,
                    workOrderId: workOrder.workOrderId,
                    date: workOrder.date,
                    version: workOrder.version,
                    color: workOrder.color,
                    note: workOrder.note,
                    orderQuantity: workOrder.orderQuantity,
                    size: workOrder.size,
                    priority: normalizeItemPriority(workOrder.priority),
                    status: workOrder.status,
                    profiles: workOrder.profiles,
                    createdAt: workOrder.createdAt,
                    updatedAt: workOrder.updatedAt,
                  });
                  return acc;
                },
                {} as Record<string, unknown[]>,
              );

              // ✅ FIX: Merge items into existing sections, preserving profiles from both sources
              const updatedSections = dbSections.map((section) => {
                const profileType = section.productName;

                // If section already has items with profiles, preserve them
                const existingItems = (section.items ||
                  []) as CuttingListItem[];

                // If we have items from DB for this profile type, merge them
                if (workOrdersByProfileType[profileType]) {
                  const dbItems = workOrdersByProfileType[
                    profileType
                  ] as CuttingListItem[];

                  // Merge: combine existing items with DB items by workOrderId
                  const itemsMap = new Map<string, CuttingListItem>();

                  // First, add existing items (preserve profiles if they exist)
                  existingItems.forEach((item) => {
                    itemsMap.set(item.workOrderId, item);
                  });

                  // Then, merge or add DB items
                  dbItems.forEach((dbItem) => {
                    const existing = itemsMap.get(dbItem.workOrderId);
                    if (existing) {
                      // Merge: if existing has no profiles, use DB profiles
                      // If existing has profiles, keep them (don't override)
                      itemsMap.set(dbItem.workOrderId, {
                        ...existing,
                        profiles:
                          existing.profiles && existing.profiles.length > 0
                            ? existing.profiles
                            : dbItem.profiles,
                      });
                    } else {
                      itemsMap.set(dbItem.workOrderId, dbItem);
                    }
                  });

                  return {
                    ...section,
                    items: Array.from(itemsMap.values()),
                  };
                }

                // No DB items for this section, return as-is (preserve existing profiles)
                return section;
              });

              return {
                id: typedList.id,
                title: typedList.name,
                weekNumber: typedList.weekNumber || 0,
                sections: updatedSections,
                createdAt: typedList.createdAt.toISOString(),
                updatedAt: typedList.updatedAt.toISOString(),
              };
            }

            // No items, just return DB sections
            return {
              id: typedList.id,
              title: typedList.name,
              weekNumber: typedList.weekNumber || 0,
              sections: dbSections,
              createdAt: typedList.createdAt.toISOString(),
              updatedAt: typedList.updatedAt.toISOString(),
            };
          }

          // If we have items but NO DB sections, group them by workOrderId to create sections
          if (typedList.items.length > 0) {
            // First group items by workOrderId with mutable arrays
            const mutableItemsByWorkOrder = typedList.items.reduce(
              (acc, item) => {
                const workOrderId = item.workOrderId;
                if (!acc[workOrderId]) {
                  acc[workOrderId] = {
                    id: workOrderId,
                    workOrderId: item.workOrderId,
                    date: item.date || new Date().toISOString().split("T")[0],
                    version: item.version,
                    color: item.color,
                    note: item.notes || "",
                    orderQuantity: item.orderQuantity || item.quantity,
                    size: item.size,
                    priority: normalizeItemPriority(item.priority),
                    status: item.status as
                      | "draft"
                      | "ready"
                      | "processing"
                      | "completed",
                    profiles: [] as ProfileItem[],
                    createdAt: item.createdAt.toISOString(),
                    updatedAt: item.updatedAt.toISOString(),
                  };
                }

                // Add profile to existing work order
                (acc[workOrderId].profiles as ProfileItem[]).push({
                  id: `${item.id}-profile`,
                  profile: item.profileType,
                  measurement: `${item.length}mm`,
                  quantity: item.quantity,
                });

                return acc;
              },
              {} as Record<
                string,
                Omit<CuttingListItem, "profiles"> & { profiles: ProfileItem[] }
              >,
            );

            // Convert to readonly structure
            const itemsByWorkOrder = Object.fromEntries(
              Object.entries(mutableItemsByWorkOrder).map(([key, value]) => [
                key,
                {
                  ...value,
                  profiles: value.profiles as ReadonlyArray<ProfileItem>,
                } as CuttingListItem,
              ]),
            ) as Record<string, CuttingListItem>;

            // Convert grouped items to sections by profileType
            const itemsByProfile = Object.values(itemsByWorkOrder).reduce(
              (acc, workOrder) => {
                const profileType = workOrder.profiles[0]?.profile || "Genel";
                if (!acc[profileType]) {
                  acc[profileType] = [];
                }

                // Create WorkOrderItem with unique ID based on workOrderId
                const workOrderItem = {
                  id: `workorder-${workOrder.workOrderId}`, // Use workOrderId for consistent ID
                  workOrderId: workOrder.workOrderId,
                  date: workOrder.date,
                  version: workOrder.version,
                  color: workOrder.color,
                  note: workOrder.note,
                  orderQuantity: workOrder.orderQuantity,
                  size: workOrder.size,
                  priority: normalizeItemPriority(workOrder.priority),
                  status: workOrder.status,
                  profiles: workOrder.profiles,
                  createdAt: workOrder.createdAt,
                  updatedAt: workOrder.updatedAt,
                };

                acc[profileType].push(workOrderItem);
                return acc;
              },
              {} as Record<string, unknown[]>,
            );

            // Convert grouped items to sections
            const sections = Object.entries(itemsByProfile).map(
              ([productName, items], index) => ({
                id: `section-${typedList.id}-${index}`,
                productName,
                items: items as unknown[],
                createdAt: typedList.createdAt.toISOString(),
                updatedAt: typedList.updatedAt.toISOString(),
              }),
            );

            return {
              id: typedList.id,
              title: typedList.name,
              weekNumber: typedList.weekNumber || 0,
              sections,
              createdAt: typedList.createdAt.toISOString(),
              updatedAt: typedList.updatedAt.toISOString(),
            };
          }

          // No items and no DB sections - return empty array
          return {
            id: typedList.id,
            title: typedList.name,
            weekNumber: typedList.weekNumber || 0,
            sections: [],
            createdAt: typedList.createdAt.toISOString(),
            updatedAt: typedList.updatedAt.toISOString(),
          };
        });

        logger.info(
          `[${requestId}] ✅ Found ${lists.length} cutting lists in PostgreSQL`,
        );

        res.json(this.createResponse(true, lists, undefined, requestId));
      } catch (error) {
        logger.error(`[${requestId}] Error getting cutting lists:`, error);

        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        res
          .status(500)
          .json(this.createResponse(false, undefined, errorMessage, requestId));
      }
    },
  );

  /**
   * Get cutting list by ID
   */
  public getCuttingListById = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const { id } = req.params;

      logger.info(`[${requestId}] Getting cutting list from PostgreSQL: ${id}`);

      try {
        // Validate input
        if (!id) {
          res
            .status(400)
            .json(
              this.createResponse(
                false,
                undefined,
                "Cutting list ID is required",
                requestId,
              ),
            );
          return;
        }

        // ✅ FIX: Get from PostgreSQL instead of in-memory Map
        const dbList = await cuttingListRepository.findById(id);

        if (!dbList) {
          res
            .status(404)
            .json(
              this.createResponse(
                false,
                undefined,
                "Cutting list not found",
                requestId,
              ),
            );
          return;
        }

        // ✅ FIX: Use same transformation logic as getAllCuttingLists
        type CuttingListWithFields = PrismaCuttingList & {
          weekNumber: number | null;
          sections: Prisma.JsonValue;
          items: Array<{
            id: string;
            workOrderId: string;
            date: string | null;
            color: string;
            version: string;
            size: string;
            profileType: string;
            length: number;
            quantity: number;
            orderQuantity: number | null;
            cuttingPattern: string | null;
            notes: string | null;
            priority: string;
            status: string;
            createdAt: Date;
            updatedAt: Date;
          }>;
        };

        const typedList = dbList as unknown as CuttingListWithFields;

        // ✅ FIX: Try to parse sections from database JSON field first
        let dbSections: ProductSection[] = [];
        try {
          if (typedList.sections) {
            const parsed =
              typeof typedList.sections === "string"
                ? JSON.parse(typedList.sections)
                : typedList.sections;
            dbSections = Array.isArray(parsed) ? parsed : [];
          }
        } catch (parseError) {
          logger.warn("Failed to parse sections from database", {
            id: typedList.id,
            parseError,
          });
          dbSections = [];
        }

        // ✅ FIX: If we have DB sections, use them as base (preserves user-defined product names and profiles)
        if (dbSections.length > 0) {
          // If we have items, merge them with existing sections
          if (typedList.items.length > 0) {
            // Group items by workOrderId with profiles
            const mutableItemsByWorkOrder = typedList.items.reduce(
              (acc, item) => {
                const workOrderId = item.workOrderId;
                if (!acc[workOrderId]) {
                  acc[workOrderId] = {
                    id: workOrderId,
                    workOrderId: item.workOrderId,
                    date: item.date || new Date().toISOString().split("T")[0],
                    version: item.version,
                    color: item.color,
                    note: item.notes || "",
                    orderQuantity: item.orderQuantity || item.quantity,
                    size: item.size,
                    priority: normalizeItemPriority(item.priority),
                    status: item.status as
                      | "draft"
                      | "ready"
                      | "processing"
                      | "completed",
                    profiles: [] as ProfileItem[],
                    createdAt: item.createdAt.toISOString(),
                    updatedAt: item.updatedAt.toISOString(),
                  };
                }

                (acc[workOrderId].profiles as ProfileItem[]).push({
                  id: `${item.id}-profile`,
                  profile: item.profileType,
                  measurement: `${item.length}mm`,
                  quantity: item.quantity,
                });

                return acc;
              },
              {} as Record<
                string,
                Omit<CuttingListItem, "profiles"> & { profiles: ProfileItem[] }
              >,
            );

            const itemsByWorkOrder = Object.fromEntries(
              Object.entries(mutableItemsByWorkOrder).map(([key, value]) => [
                key,
                {
                  ...value,
                  profiles: value.profiles as ReadonlyArray<ProfileItem>,
                } as CuttingListItem,
              ]),
            ) as Record<string, CuttingListItem>;

            // Group by profile type
            const workOrdersByProfileType = Object.values(
              itemsByWorkOrder,
            ).reduce(
              (acc, workOrder) => {
                const profileType = workOrder.profiles[0]?.profile || "Genel";
                if (!acc[profileType]) {
                  acc[profileType] = [];
                }
                acc[profileType].push({
                  id: `workorder-${workOrder.workOrderId}`,
                  workOrderId: workOrder.workOrderId,
                  date: workOrder.date,
                  version: workOrder.version,
                  color: workOrder.color,
                  note: workOrder.note,
                  orderQuantity: workOrder.orderQuantity,
                  size: workOrder.size,
                  priority: normalizeItemPriority(workOrder.priority),
                  status: workOrder.status,
                  profiles: workOrder.profiles,
                  createdAt: workOrder.createdAt,
                  updatedAt: workOrder.updatedAt,
                });
                return acc;
              },
              {} as Record<string, unknown[]>,
            );

            // Merge items into existing sections, preserving profiles
            const updatedSections = dbSections.map((section) => {
              const profileType = section.productName;
              const existingItems = (section.items || []) as CuttingListItem[];

              if (workOrdersByProfileType[profileType]) {
                const dbItems = workOrdersByProfileType[
                  profileType
                ] as CuttingListItem[];

                const itemsMap = new Map<string, CuttingListItem>();

                existingItems.forEach((item) => {
                  itemsMap.set(item.workOrderId, item);
                });

                dbItems.forEach((dbItem) => {
                  const existing = itemsMap.get(dbItem.workOrderId);
                  if (existing) {
                    itemsMap.set(dbItem.workOrderId, {
                      ...existing,
                      profiles:
                        existing.profiles && existing.profiles.length > 0
                          ? existing.profiles
                          : dbItem.profiles,
                    });
                  } else {
                    itemsMap.set(dbItem.workOrderId, dbItem);
                  }
                });

                return {
                  ...section,
                  items: Array.from(itemsMap.values()),
                };
              }

              return section;
            });

            const cuttingList = {
              id: typedList.id,
              title: typedList.name,
              weekNumber: typedList.weekNumber || 0,
              sections: updatedSections,
              createdAt: typedList.createdAt.toISOString(),
              updatedAt: typedList.updatedAt.toISOString(),
            };

            logger.info(
              `[${requestId}] ✅ Found cutting list from PostgreSQL: ${id}`,
            );
            res.json(
              this.createResponse(true, cuttingList, undefined, requestId),
            );
            return;
          }

          // No items, just return DB sections (with profiles if they exist)
          const cuttingList = {
            id: typedList.id,
            title: typedList.name,
            weekNumber: typedList.weekNumber || 0,
            sections: dbSections,
            createdAt: typedList.createdAt.toISOString(),
            updatedAt: typedList.updatedAt.toISOString(),
          };

          logger.info(
            `[${requestId}] ✅ Found cutting list from PostgreSQL: ${id}`,
          );
          res.json(
            this.createResponse(true, cuttingList, undefined, requestId),
          );
          return;
        }

        // If we have items but NO DB sections, group them by workOrderId to create sections
        if (typedList.items.length > 0) {
          const mutableItemsByWorkOrder = typedList.items.reduce(
            (acc, item) => {
              const workOrderId = item.workOrderId;
              if (!acc[workOrderId]) {
                acc[workOrderId] = {
                  id: workOrderId,
                  workOrderId: item.workOrderId,
                  date: item.date || new Date().toISOString().split("T")[0],
                  version: item.version,
                  color: item.color,
                  note: item.notes || "",
                  orderQuantity: item.orderQuantity || item.quantity,
                  size: item.size,
                  priority: normalizeItemPriority(item.priority),
                  status: item.status as
                    | "draft"
                    | "ready"
                    | "processing"
                    | "completed",
                  profiles: [] as ProfileItem[],
                  createdAt: item.createdAt.toISOString(),
                  updatedAt: item.updatedAt.toISOString(),
                };
              }

              (acc[workOrderId].profiles as ProfileItem[]).push({
                id: `${item.id}-profile`,
                profile: item.profileType,
                measurement: `${item.length}mm`,
                quantity: item.quantity,
              });

              return acc;
            },
            {} as Record<
              string,
              Omit<CuttingListItem, "profiles"> & { profiles: ProfileItem[] }
            >,
          );

          const itemsByWorkOrder = Object.fromEntries(
            Object.entries(mutableItemsByWorkOrder).map(([key, value]) => [
              key,
              {
                ...value,
                profiles: value.profiles as ReadonlyArray<ProfileItem>,
              } as CuttingListItem,
            ]),
          ) as Record<string, CuttingListItem>;

          const itemsByProfile = Object.values(itemsByWorkOrder).reduce(
            (acc, workOrder) => {
              const profileType = workOrder.profiles[0]?.profile || "Genel";
              if (!acc[profileType]) {
                acc[profileType] = [];
              }

              const workOrderItem = {
                id: workOrder.workOrderId,
                workOrderId: workOrder.workOrderId,
                date: workOrder.date,
                version: workOrder.version,
                color: workOrder.color,
                note: workOrder.note,
                orderQuantity: workOrder.orderQuantity,
                size: workOrder.size,
                profiles: workOrder.profiles,
                priority: normalizeItemPriority(workOrder.priority),
                status: workOrder.status,
                createdAt: workOrder.createdAt,
                updatedAt: workOrder.updatedAt,
              };

              acc[profileType].push(workOrderItem);
              return acc;
            },
            {} as Record<string, CuttingListItem[]>,
          );

          const sections = Object.entries(itemsByProfile).map(
            ([productName, items], index) => ({
              id: `section-${typedList.id}-${index}`,
              productName,
              items: items as unknown[],
              createdAt: typedList.createdAt.toISOString(),
              updatedAt: typedList.updatedAt.toISOString(),
            }),
          );

          const cuttingList = {
            id: typedList.id,
            title: typedList.name,
            weekNumber: typedList.weekNumber || 0,
            sections,
            createdAt: typedList.createdAt.toISOString(),
            updatedAt: typedList.updatedAt.toISOString(),
          };

          logger.info(
            `[${requestId}] ✅ Found cutting list from PostgreSQL: ${id}`,
          );
          res.json(
            this.createResponse(true, cuttingList, undefined, requestId),
          );
          return;
        }

        // No items and no DB sections
        const cuttingList = {
          id: typedList.id,
          title: typedList.name || "Untitled",
          weekNumber: typedList.weekNumber || 0,
          sections: [],
          createdAt: typedList.createdAt.toISOString(),
          updatedAt: typedList.updatedAt.toISOString(),
        };

        logger.info(
          `[${requestId}] ✅ Found cutting list from PostgreSQL: ${id}`,
        );

        res.json(this.createResponse(true, cuttingList, undefined, requestId));
      } catch (error) {
        logger.error(`[${requestId}] Error getting cutting list:`, error);

        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        res
          .status(500)
          .json(this.createResponse(false, undefined, errorMessage, requestId));
      }
    },
  );

  /**
   * Update cutting list
   */
  public updateCuttingList = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const { id } = req.params;
      const cuttingListData = req.body;

      logger.info("[CuttingList] Updating cutting list", { requestId, id });

      try {
        // Validate input
        if (!id) {
          res
            .status(400)
            .json(
              this.createResponse(
                false,
                undefined,
                "Cutting list ID is required",
                requestId,
              ),
            );
          return;
        }

        // ✅ MIGRATED: Use PostgreSQL instead of in-memory Map
        const existingCuttingList = await cuttingListRepository.findById(id);

        if (!existingCuttingList) {
          res
            .status(404)
            .json(
              this.createResponse(
                false,
                undefined,
                "Cutting list not found",
                requestId,
              ),
            );
          return;
        }

        // Update the cutting list in PostgreSQL
        const updatedCuttingList = await cuttingListRepository.update(id, {
          name: cuttingListData.title || cuttingListData.name,
          weekNumber: cuttingListData.weekNumber,
          sections: cuttingListData.sections as Prisma.InputJsonValue,
        });

        logger.info("[CuttingList] Cutting list updated", { requestId, id });

        // Transform Prisma model to API response format
        const response = {
          id: updatedCuttingList.id,
          title: updatedCuttingList.name,
          weekNumber: updatedCuttingList.weekNumber || 0,
          sections: updatedCuttingList.sections as unknown as ProductSection[],
          createdAt: updatedCuttingList.createdAt.toISOString(),
          updatedAt: updatedCuttingList.updatedAt.toISOString(),
        };

        res.json(this.createResponse(true, response, undefined, requestId));
      } catch (error) {
        logger.error(
          "[CuttingList] Error updating cutting list",
          error instanceof Error ? error : new Error(String(error)),
          { requestId, id },
        );

        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        res
          .status(500)
          .json(this.createResponse(false, undefined, errorMessage, requestId));
      }
    },
  );

  /**
   * Delete cutting list
   */
  public deleteCuttingList = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const { id } = req.params;

      logger.info(`[${requestId}] Deleting cutting list: ${id}`);

      try {
        // Validate input
        if (!id) {
          res
            .status(400)
            .json(
              this.createResponse(
                false,
                undefined,
                "Cutting list ID is required",
                requestId,
              ),
            );
          return;
        }

        // Check if cutting list exists in database
        const existingList = await cuttingListRepository.findById(id);

        if (!existingList) {
          res
            .status(404)
            .json(
              this.createResponse(
                false,
                undefined,
                "Cutting list not found",
                requestId,
              ),
            );
          return;
        }

        // Permanently delete from PostgreSQL database
        await cuttingListRepository.delete(id);

        logger.info(
          `[${requestId}] Cutting list permanently deleted from database: ${id}`,
        );

        res.json(
          this.createResponse(
            true,
            { message: "Cutting list deleted successfully" },
            undefined,
            requestId,
          ),
        );
      } catch (error) {
        logger.error(
          "[CuttingList] Error deleting cutting list",
          error instanceof Error ? error : new Error(String(error)),
          { requestId, id },
        );

        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        res
          .status(500)
          .json(this.createResponse(false, undefined, errorMessage, requestId));
      }
    },
  );
}
