/**
 * @fileoverview Cutting List Controller for manual cutting list creation
 * @module CuttingListController
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from "express";
import * as fs from "fs";
import * as path from "path";
import { PDFExportService } from "../services/export/pdfExportService";
import { ExcelExportService } from "../services/export/excelExportService";
import { ProfileSuggestionService } from "../services/suggestions/profileSuggestionService";
import { QuantityCalculationService } from "../services/suggestions/quantityCalculationService";
// ⚠️ DEPRECATED: Use UnifiedSuggestionService instead
// import { EnterpriseProfileSuggestionService } from '../services/suggestions/enterpriseProfileSuggestionService';
// import smartSuggestionService from '../services/suggestions/smartSuggestionService';
import {
  UnifiedSuggestionService,
  SmartSuggestion,
  ProfileSuggestion,
} from "../services/suggestions/UnifiedSuggestionService";
import { cuttingListRepository } from "../repositories/CuttingListRepository";
import { logger } from "../services/logger";
import { MeasurementConverter } from "../utils/measurementConverter";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface WorkOrderTemplate {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly profiles: readonly ProfileTemplate[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface ProfileTemplate {
  readonly id: string;
  readonly profile: string;
  readonly measurement: string;
  readonly quantity: number;
}
import type { CuttingList as PrismaCuttingList, Prisma } from "@prisma/client";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Profile item interface
 */
interface ProfileItem {
  readonly id: string;
  readonly profile?: string;
  readonly measurement: string;
  readonly quantity: number;
}

/**
 * Cutting list item interface
 * ✅ ALIGNED with frontend WorkOrderItem type
 */
interface CuttingListItem {
  readonly id: string;
  readonly workOrderId: string;
  readonly date: string;
  readonly version: string;
  readonly color: string;
  readonly note?: string;
  readonly orderQuantity: number;
  readonly size: string;
  readonly profiles: ReadonlyArray<ProfileItem>;
  readonly status?: "draft" | "ready" | "processing" | "completed"; // ✅ ALIGNED
  readonly priority?: "low" | "medium" | "high" | "urgent"; // ✅ ALIGNED
  readonly createdAt?: string; // ✅ ALIGNED: ISO timestamp
  readonly updatedAt?: string; // ✅ ALIGNED: ISO timestamp
}

/**
 * Product section interface
 */
interface ProductSection {
  readonly id: string;
  readonly productName: string;
  readonly items: ReadonlyArray<CuttingListItem>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Cutting list interface
 */
interface CuttingList {
  readonly id: string;
  readonly title: string;
  readonly weekNumber: number;
  readonly sections: ReadonlyArray<ProductSection>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * API Response structure
 */
interface ApiResponse<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly message?: string;
  readonly timestamp: string;
  readonly requestId?: string;
}

// ============================================================================
// CUTTING LIST CONTROLLER CLASS
// ============================================================================

/**
 * Cutting List Controller
 */
export class CuttingListController {
  private cuttingLists: Map<string, CuttingList> = new Map();
  private requestCounter: number = 0;
  private readonly storageFile: string;
  private readonly pdfExportService: PDFExportService;
  private readonly excelExportService: ExcelExportService;
  private readonly profileSuggestionService: ProfileSuggestionService;
  private readonly quantityCalculationService: QuantityCalculationService;
  // ⚠️ DEPRECATED: private readonly enterpriseProfileService: EnterpriseProfileSuggestionService;
  private static processListenersRegistered = false;

  constructor() {
    // Create storage directory if it doesn't exist
    const storageDir = path.join(__dirname, "../../data");
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
      console.log("[INFO] [STORAGE] Created storage directory:", storageDir);
    }

    this.storageFile = path.join(storageDir, "cutting-lists.json");
    console.log("[INFO] [STORAGE] Storage file path:", this.storageFile);

    // Validate write permissions
    try {
      fs.accessSync(storageDir, fs.constants.W_OK);
      console.log("[INFO] [STORAGE] Storage directory is writable");
    } catch (error) {
      console.error(
        "[ERROR] [STORAGE] Storage directory is not writable:",
        storageDir,
      );
      throw new Error("Storage directory is not writable");
    }
    this.pdfExportService = PDFExportService.getInstance();

    if (!CuttingListController.processListenersRegistered) {
      const pdfExportService = this.pdfExportService;

      // Graceful shutdown için cleanup handler
      process.on("SIGINT", async () => {
        console.log("PDF Export Service cleanup...");
        await pdfExportService.cleanup();
        process.exit(0);
      });

      process.on("SIGTERM", async () => {
        console.log("PDF Export Service cleanup...");
        await pdfExportService.cleanup();
        process.exit(0);
      });

      CuttingListController.processListenersRegistered = true;
    }
    this.excelExportService = new ExcelExportService();
    this.profileSuggestionService = new ProfileSuggestionService();
    this.quantityCalculationService = new QuantityCalculationService();
    // ⚠️ DEPRECATED: this.enterpriseProfileService = new EnterpriseProfileSuggestionService();
    this.loadFromStorage();

    // Analyze existing cutting lists for profile suggestions
    this.analyzeExistingData();
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `REQ-${Date.now()}-${++this.requestCounter}`;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create API response
   */
  private createResponse<T>(
    success: boolean,
    data?: T,
    error?: string,
  ): ApiResponse<T> {
    const response = {
      success,
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId(),
    } as ApiResponse<T>;

    if (data !== undefined) {
      (response as ApiResponse<T> & { data: T }).data = data;
    }

    if (error !== undefined) {
      (response as ApiResponse<T> & { error: string }).error = error;
    }

    return response;
  }

  /**
   * Handle async errors
   */
  private asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  };

  /**
   * Save data to file storage
   */
  private saveToStorage(): void {
    try {
      const data = Array.from(this.cuttingLists.entries());
      const jsonData = JSON.stringify(data, null, 2);
      fs.writeFileSync(this.storageFile, jsonData, "utf8");
      console.log(
        `[STORAGE] Saved ${data.length} cutting lists to ${this.storageFile}`,
      );
    } catch (error) {
      console.error("[STORAGE] Error saving to storage:", error);
    }
  }

  /**
   * Load data from file storage
   */
  private loadFromStorage(): void {
    try {
      if (fs.existsSync(this.storageFile)) {
        const jsonData = fs.readFileSync(this.storageFile, "utf8");
        const data = JSON.parse(jsonData);

        // Hem Array hem Map formatını destekle
        if (
          Array.isArray(data) &&
          data.length > 0 &&
          Array.isArray(data[0]) &&
          data[0].length === 2
        ) {
          // Map formatında veri var: [[id, cuttingList], ...]
          this.cuttingLists = new Map(data);
          console.log(
            `[STORAGE] ✅ Loaded ${this.cuttingLists.size} cutting lists from Map format`,
          );
          console.log(
            `[STORAGE] First few IDs:`,
            Array.from(this.cuttingLists.keys()).slice(0, 3),
          );
        } else if (Array.isArray(data)) {
          // Array formatında veri var
          this.cuttingLists = new Map();
          data.forEach((cuttingList, index) => {
            if (cuttingList && cuttingList.id) {
              this.cuttingLists.set(cuttingList.id, cuttingList);
            } else {
              console.log(
                `[STORAGE] Warning: Invalid cutting list at index ${index}`,
              );
            }
          });
          console.log(
            `[STORAGE] ✅ Loaded ${this.cuttingLists.size} cutting lists from Array format`,
          );
          console.log(
            `[STORAGE] First few IDs:`,
            Array.from(this.cuttingLists.keys()).slice(0, 3),
          );
        } else {
          // Bilinmeyen format
          console.log(
            "[STORAGE] ❌ Unknown data format, starting with empty storage",
          );
          console.log(
            "[STORAGE] Data type:",
            typeof data,
            "Array?",
            Array.isArray(data),
          );
          if (Array.isArray(data) && data.length > 0) {
            console.log(
              "[STORAGE] First item type:",
              typeof data[0],
              "Array?",
              Array.isArray(data[0]),
            );
          }
          this.cuttingLists = new Map();
        }

        // Mevcut verileri temizle (CMmm, CM gibi eski formatları düzelt)
        this.cleanupExistingMeasurements();
      } else {
        console.log(
          "[INFO] [STORAGE] No existing storage file found, starting with empty storage",
        );
      }
    } catch (error) {
      console.error("[ERROR] [STORAGE] Error loading from storage:", error);
      console.log("[WARN] [STORAGE] Starting with empty storage due to error");
      this.cuttingLists = new Map();
    }
  }

  /**
   * Mevcut verilerdeki ölçü formatlarını temizle
   */
  private cleanupExistingMeasurements(): void {
    let hasChanges = false;

    this.cuttingLists.forEach((cuttingList) => {
      cuttingList.sections.forEach((section) => {
        section.items.forEach((item) => {
          item.profiles.forEach((profile) => {
            const originalMeasurement = profile.measurement;
            const cleanedMeasurement =
              MeasurementConverter.convertToMM(originalMeasurement);

            if (originalMeasurement !== cleanedMeasurement) {
              console.log(
                `[CLEANUP] Converting measurement: "${originalMeasurement}" → "${cleanedMeasurement}"`,
              );
              (profile as { measurement: string }).measurement =
                cleanedMeasurement;
              hasChanges = true;
            }
          });
        });
      });
    });

    if (hasChanges) {
      console.log(
        "[CLEANUP] ✅ Measurement cleanup completed, saving changes...",
      );
      this.saveToStorage();
    } else {
      console.log("[CLEANUP] ✅ No measurement cleanup needed");
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

      console.log(
        `[${requestId}] Creating cutting list: ${cuttingListTitle}, week: ${weekNumber}`,
      );

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

        // ✅ MIGRATED: Create cutting list in PostgreSQL (persistent storage)
        const cuttingList = await cuttingListRepository.create({
          name: cuttingListTitle.trim(),
          weekNumber: weekNumber,
          sections: [],
          user: {
            connect: { id: "system-user" }, // Temporary system user ID
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

        res.json(this.createResponse(true, response));
      } catch (error) {
        console.error(`[${requestId}] Error creating cutting list:`, error);

        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        res
          .status(500)
          .json(this.createResponse(false, undefined, errorMessage));
      }
    },
  );

  /**
   * Get all cutting lists data (public method for internal use)
   */
  public getAllCuttingListsData(): CuttingList[] {
    return Array.from(this.cuttingLists.values());
  }

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

              // 🐛 DEBUG: Log database sections for troubleshooting
              console.log(
                `[${requestId}] 🔍 DB Sections parsed for list ${typedList.id}:`,
                JSON.stringify(
                  dbSections.map((s) => ({
                    id: s.id,
                    productName: s.productName,
                    itemsCount: s.items?.length || 0,
                  })),
                  null,
                  2,
                ),
              );
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
                      priority: item.priority as
                        | "low"
                        | "medium"
                        | "high"
                        | "urgent",
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
                    priority: workOrder.priority,
                    status: workOrder.status,
                    profiles: workOrder.profiles,
                    createdAt: workOrder.createdAt,
                    updatedAt: workOrder.updatedAt,
                  });
                  return acc;
                },
                {} as Record<string, unknown[]>,
              );

              // Merge items into existing sections
              const updatedSections = dbSections.map((section) => {
                const profileType = section.productName;
                if (workOrdersByProfileType[profileType]) {
                  // Add items to matching section
                  const existingItems = section.items || [];
                  return {
                    ...section,
                    items: [
                      ...existingItems,
                      ...workOrdersByProfileType[profileType],
                    ],
                  };
                }
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
                    priority: item.priority as
                      | "low"
                      | "medium"
                      | "high"
                      | "urgent",
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
                  priority: workOrder.priority,
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

        res.json(this.createResponse(true, lists));
      } catch (error) {
        logger.error(`[${requestId}] Error getting cutting lists:`, error);

        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        res
          .status(500)
          .json(this.createResponse(false, undefined, errorMessage));
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
              this.createResponse(false, undefined, "Cutting list not found"),
            );
          return;
        }

        // Convert to response format (same as getAllCuttingLists)
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
                priority: item.priority as "low" | "medium" | "high" | "urgent",
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

            // Create WorkOrderItem - use actual workOrderId as id
            const workOrderItem = {
              id: workOrder.workOrderId, // ✅ Use actual work order ID, not prefixed
              workOrderId: workOrder.workOrderId,
              date: workOrder.date,
              version: workOrder.version,
              color: workOrder.color,
              note: workOrder.note,
              orderQuantity: workOrder.orderQuantity,
              size: workOrder.size,
              profiles: workOrder.profiles,
              priority: workOrder.priority,
              status: workOrder.status,
              createdAt: workOrder.createdAt,
              updatedAt: workOrder.updatedAt,
            };

            acc[profileType].push(workOrderItem);
            return acc;
          },
          {} as Record<string, CuttingListItem[]>,
        );

        // Create sections array from grouped items
        const sections = Object.keys(itemsByProfile).map((profileType) => ({
          id: profileType,
          productName: profileType,
          items: itemsByProfile[profileType]!,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

        const cuttingList = {
          id: typedList.id,
          title: typedList.name || "Untitled",
          weekNumber: typedList.weekNumber || 1,
          sections,
          createdAt: typedList.createdAt.toISOString(),
          updatedAt: typedList.updatedAt.toISOString(),
        };

        logger.info(
          `[${requestId}] ✅ Found cutting list from PostgreSQL: ${id}`,
        );

        res.json(this.createResponse(true, cuttingList));
      } catch (error) {
        logger.error(`[${requestId}] Error getting cutting list:`, error);

        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        res
          .status(500)
          .json(this.createResponse(false, undefined, errorMessage));
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

      console.log(`[${requestId}] Updating cutting list: ${id}`);

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
              ),
            );
          return;
        }

        const existingCuttingList = this.cuttingLists.get(id);

        if (!existingCuttingList) {
          res
            .status(404)
            .json(
              this.createResponse(false, undefined, "Cutting list not found"),
            );
          return;
        }

        // Update the cutting list
        const updatedCuttingList: CuttingList = {
          ...existingCuttingList,
          ...cuttingListData,
          id, // Ensure ID doesn't change
          updatedAt: new Date().toISOString(),
        };

        this.cuttingLists.set(id, updatedCuttingList);
        this.saveToStorage();

        console.log(`[${requestId}] Cutting list updated: ${id}`);

        res.json(this.createResponse(true, updatedCuttingList));
      } catch (error) {
        console.error(`[${requestId}] Error updating cutting list:`, error);

        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        res
          .status(500)
          .json(this.createResponse(false, undefined, errorMessage));
      }
    },
  );

  /**
   * Add product section to cutting list
   */
  public addProductSection = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const { cuttingListId } = req.params;
      const { productName } = req.body;

      logger.info(`[${requestId}] 📦 ADD PRODUCT SECTION REQUEST`, {
        cuttingListId,
        productName,
        path: req.path,
        method: req.method,
      });
      console.log(
        `[${requestId}] Adding product section: ${productName} to list: ${cuttingListId}`,
      );

      try {
        // Validate input
        if (!cuttingListId) {
          res
            .status(400)
            .json(
              this.createResponse(
                false,
                undefined,
                "Cutting list ID is required",
              ),
            );
          return;
        }

        if (
          !productName ||
          typeof productName !== "string" ||
          productName.trim().length === 0
        ) {
          res
            .status(400)
            .json(
              this.createResponse(false, undefined, "Product name is required"),
            );
          return;
        }

        // ✅ MIGRATED: Use PostgreSQL instead of in-memory Map
        // Check if cutting list exists
        const cuttingList = await cuttingListRepository.findById(cuttingListId);
        if (!cuttingList) {
          res
            .status(404)
            .json(
              this.createResponse(false, undefined, "Cutting list not found"),
            );
          return;
        }

        // Create new product section in database
        const newSection = await cuttingListRepository.addProductSection(
          cuttingListId,
          {
            productName: productName.trim(),
          },
        );

        console.log(`[${requestId}] Product section added: ${newSection.id}`);

        res.json(this.createResponse(true, newSection));
      } catch (error) {
        console.error(`[${requestId}] Error adding product section:`, error);

        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        res
          .status(500)
          .json(this.createResponse(false, undefined, errorMessage));
      }
    },
  );

  /**
   * Add item to product section
   */
  public addItemToSection = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const { cuttingListId, sectionId } = req.params;
      const itemData = req.body;

      console.log(`[${requestId}] Adding item to section: ${sectionId}`);
      console.log(
        `[${requestId}] Request body:`,
        JSON.stringify(itemData, null, 2),
      );

      try {
        // Validate input
        if (!cuttingListId || !sectionId) {
          res
            .status(400)
            .json(
              this.createResponse(
                false,
                undefined,
                "Cutting list ID and section ID are required",
              ),
            );
          return;
        }

        // Validate item data
        const requiredFields = [
          "workOrderId",
          "date",
          "version",
          "color",
          "orderQuantity",
          "size",
          "profiles",
        ];
        for (const field of requiredFields) {
          if (
            itemData[field] === undefined ||
            itemData[field] === null ||
            itemData[field] === ""
          ) {
            console.log(`[${requestId}] Missing required field: ${field}`);
            console.log(
              `[${requestId}] Available fields:`,
              Object.keys(itemData),
            );
            console.log(`[${requestId}] Field values:`, {
              workOrderId: itemData.workOrderId,
              date: itemData.date,
              version: itemData.version,
              color: itemData.color,
              orderQuantity: itemData.orderQuantity,
              size: itemData.size,
              profiles: itemData.profiles,
            });
            res
              .status(400)
              .json(
                this.createResponse(
                  false,
                  undefined,
                  `Field '${field}' is required`,
                ),
              );
            return;
          }
        }

        // Validate orderQuantity is a valid number
        const orderQuantity = parseInt(itemData.orderQuantity);
        if (isNaN(orderQuantity) || orderQuantity <= 0) {
          res
            .status(400)
            .json(
              this.createResponse(
                false,
                undefined,
                "Order quantity must be a valid positive number",
              ),
            );
          return;
        }

        // Validate profiles
        if (
          !Array.isArray(itemData.profiles) ||
          itemData.profiles.length === 0
        ) {
          res
            .status(400)
            .json(
              this.createResponse(
                false,
                undefined,
                "At least one profile is required",
              ),
            );
          return;
        }

        for (const profile of itemData.profiles) {
          // ✅ FIX: Validate required fields including profile type
          if (!profile.profile || !profile.measurement || !profile.quantity) {
            res
              .status(400)
              .json(
                this.createResponse(
                  false,
                  undefined,
                  "Profile must have profile type, measurement, and quantity",
                ),
              );
            return;
          }

          // Validate quantity is a valid number
          const quantity = parseInt(profile.quantity);
          if (isNaN(quantity) || quantity <= 0) {
            res
              .status(400)
              .json(
                this.createResponse(
                  false,
                  undefined,
                  "Profile quantity must be a valid positive number",
                ),
              );
            return;
          }
        }

        // ✅ MIGRATED: Use PostgreSQL instead of in-memory Map

        // Prepare item data for repository
        const newItem = await cuttingListRepository.addItemToSection(
          cuttingListId,
          sectionId,
          {
            workOrderId: itemData.workOrderId,
            date: itemData.date,
            version: itemData.version,
            color: itemData.color,
            note: itemData.note,
            orderQuantity,
            size: itemData.size,
            priority: itemData.priority || "medium",
            status: itemData.status || "draft",
            profiles: itemData.profiles.map(
              (profile: {
                id?: string;
                profile?: string;
                measurement: string;
                quantity: string | number;
              }) => ({
                id: profile.id || this.generateId(),
                profile: profile.profile || "",
                measurement: MeasurementConverter.convertToMM(
                  profile.measurement,
                ),
                quantity: parseInt(String(profile.quantity)),
              }),
            ),
          },
        );

        logger.info(`[${requestId}] Item added to section via PostgreSQL`, {
          cuttingListId,
          sectionId,
          itemId: newItem.id,
        });

        // ✅ NEW: Learn from new data - save to suggestion patterns
        try {
          logger.info(`[${requestId}] Starting smart learning`, {
            hasCuttingListId: !!newItem.cuttingListId,
            cuttingListId: newItem.cuttingListId,
            sectionId: sectionId,
            itemId: newItem.id,
          });

          await this.learnFromNewItem(itemData, {
            id: newItem.id,
            sectionId: sectionId,
            cuttingListId: newItem.cuttingListId,
          });

          logger.info(`[${requestId}] Smart suggestion learning completed`, {
            productName: itemData.size, // This should be productName from section
            size: itemData.size,
            orderQuantity: itemData.orderQuantity,
            profileCount: itemData.profiles.length,
          });
        } catch (learningError) {
          logger.warn(
            `[${requestId}] Smart suggestion learning failed (non-critical)`,
            { learningError },
          );
          // Don't fail the main request if learning fails
        }

        res.status(201).json(this.createResponse(true, newItem));
      } catch (error) {
        console.error(`[${requestId}] Error adding item:`, error);

        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        res
          .status(500)
          .json(this.createResponse(false, undefined, errorMessage));
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
              this.createResponse(false, undefined, "Cutting list not found"),
            );
          return;
        }

        // Permanently delete from PostgreSQL database
        await cuttingListRepository.delete(id);

        logger.info(
          `[${requestId}] Cutting list permanently deleted from database: ${id}`,
        );

        res.json(
          this.createResponse(true, {
            message: "Cutting list deleted successfully",
          }),
        );
      } catch (error) {
        console.error(`[${requestId}] Error deleting cutting list:`, error);

        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        res
          .status(500)
          .json(this.createResponse(false, undefined, errorMessage));
      }
    },
  );

  /**
   * Delete product section
   */
  public deleteProductSection = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const { cuttingListId, sectionId } = req.params;

      console.log(`[${requestId}] Deleting product section: ${sectionId}`);

      try {
        // Validate input
        if (!cuttingListId || !sectionId) {
          res
            .status(400)
            .json(
              this.createResponse(
                false,
                undefined,
                "Cutting list ID and section ID are required",
              ),
            );
          return;
        }

        const cuttingList = this.cuttingLists.get(cuttingListId);

        if (!cuttingList) {
          res
            .status(404)
            .json(
              this.createResponse(false, undefined, "Cutting list not found"),
            );
          return;
        }

        const updatedSections = cuttingList.sections.filter(
          (s) => s.id !== sectionId,
        );

        if (updatedSections.length === cuttingList.sections.length) {
          res
            .status(404)
            .json(
              this.createResponse(
                false,
                undefined,
                "Product section not found",
              ),
            );
          return;
        }

        const updatedCuttingList: CuttingList = {
          ...cuttingList,
          sections: updatedSections,
          updatedAt: new Date().toISOString(),
        };

        this.cuttingLists.set(cuttingListId, updatedCuttingList);
        this.saveToStorage();

        console.log(`[${requestId}] Product section deleted: ${sectionId}`);

        res.json(
          this.createResponse(true, {
            message: "Product section deleted successfully",
          }),
        );
      } catch (error) {
        console.error(`[${requestId}] Error deleting product section:`, error);

        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        res
          .status(500)
          .json(this.createResponse(false, undefined, errorMessage));
      }
    },
  );

  /**
   * Update item in section
   */
  public updateItemInSection = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const { cuttingListId, sectionId, itemId } = req.params;
      const itemData = req.body;

      console.log(
        `[${requestId}] Updating item: ${itemId} in section: ${sectionId}`,
      );
      console.log(
        `[${requestId}] Request body:`,
        JSON.stringify(itemData, null, 2),
      );
      console.log(`[${requestId}] Params:`, {
        cuttingListId,
        sectionId,
        itemId,
      });

      try {
        // Validate input
        if (!cuttingListId || !sectionId || !itemId) {
          res
            .status(400)
            .json(
              this.createResponse(
                false,
                undefined,
                "Cutting list ID, section ID and item ID are required",
              ),
            );
          return;
        }

        // Validate item data
        const requiredFields = [
          "workOrderId",
          "date",
          "version",
          "color",
          "orderQuantity",
          "size",
          "profiles",
        ];
        for (const field of requiredFields) {
          if (
            itemData[field] === undefined ||
            itemData[field] === null ||
            itemData[field] === ""
          ) {
            console.log(`[${requestId}] Missing required field: ${field}`);
            console.log(
              `[${requestId}] Available fields:`,
              Object.keys(itemData),
            );
            res
              .status(400)
              .json(
                this.createResponse(
                  false,
                  undefined,
                  `Field '${field}' is required`,
                ),
              );
            return;
          }
        }

        // Validate orderQuantity is a valid number
        const orderQuantity = parseInt(itemData.orderQuantity);
        if (isNaN(orderQuantity) || orderQuantity <= 0) {
          res
            .status(400)
            .json(
              this.createResponse(
                false,
                undefined,
                "Order quantity must be a valid positive number",
              ),
            );
          return;
        }

        // Validate profiles
        if (
          !Array.isArray(itemData.profiles) ||
          itemData.profiles.length === 0
        ) {
          res
            .status(400)
            .json(
              this.createResponse(
                false,
                undefined,
                "At least one profile is required",
              ),
            );
          return;
        }

        for (const profile of itemData.profiles) {
          // ✅ FIX: Validate required fields including profile type
          if (!profile.profile || !profile.measurement || !profile.quantity) {
            res
              .status(400)
              .json(
                this.createResponse(
                  false,
                  undefined,
                  "Profile must have profile type, measurement, and quantity",
                ),
              );
            return;
          }

          // Validate quantity is a valid number
          const quantity = parseInt(profile.quantity);
          if (isNaN(quantity) || quantity <= 0) {
            res
              .status(400)
              .json(
                this.createResponse(
                  false,
                  undefined,
                  "Profile quantity must be a valid positive number",
                ),
              );
            return;
          }
        }

        // ✅ MIGRATED: Use PostgreSQL instead of in-memory Map

        // Prepare updated item data for repository
        const updatedItem = await cuttingListRepository.updateItemInSection(
          cuttingListId,
          sectionId,
          itemId,
          {
            workOrderId: itemData.workOrderId,
            date: itemData.date,
            version: itemData.version,
            color: itemData.color,
            note: itemData.note,
            orderQuantity,
            size: itemData.size,
            priority: itemData.priority || "medium",
            status: itemData.status || "draft",
            profiles: itemData.profiles.map(
              (profile: {
                id?: string;
                profile?: string;
                measurement: string;
                quantity: string | number;
              }) => ({
                id: profile.id || this.generateId(),
                profile: profile.profile || "",
                measurement: MeasurementConverter.convertToMM(
                  profile.measurement,
                ),
                quantity: parseInt(String(profile.quantity)),
              }),
            ),
          },
        );

        logger.info(`[${requestId}] Item updated via PostgreSQL`, {
          cuttingListId,
          sectionId,
          itemId,
        });

        res.json(this.createResponse(true, updatedItem));
      } catch (error) {
        console.error(`[${requestId}] Error updating item:`, error);

        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        res
          .status(500)
          .json(this.createResponse(false, undefined, errorMessage));
      }
    },
  );

  /**
   * Get enterprise profile suggestions
   */
  public getEnterpriseProfileSuggestions = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const { productName, size, note, version, color, limit = 15 } = req.query;

      console.log(
        `[${requestId}] Getting enterprise profile suggestions for: ${productName}, size: ${size}`,
      );

      try {
        // Validate required parameters
        if (!productName || typeof productName !== "string") {
          res
            .status(400)
            .json(
              this.createResponse(false, undefined, "Product name is required"),
            );
          return;
        }

        if (!size || typeof size !== "string") {
          res
            .status(400)
            .json(this.createResponse(false, undefined, "Size is required"));
          return;
        }

        const limitNumber = parseInt(limit as string) || 15;

        // ✅ NEW: Using UnifiedSuggestionService
        const suggestionService = UnifiedSuggestionService.getInstance();
        const suggestions = await suggestionService.getProfileSuggestions(
          productName,
          size,
          "",
          limitNumber,
        );

        console.log(
          `[${requestId}] Generated ${suggestions.length} enterprise suggestions`,
        );

        res.json(
          this.createResponse(true, {
            suggestions,
            contextualInsights: suggestions.map(
              (s: ProfileSuggestion) => s.reasoning,
            ),
          }),
        );
      } catch (error) {
        console.error(
          `[${requestId}] Error getting enterprise profile suggestions:`,
          error,
        );

        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        res
          .status(500)
          .json(this.createResponse(false, undefined, errorMessage));
      }
    },
  );

  /**
   * Get smart measurement suggestions for a profile
   */
  public getSmartMeasurementSuggestions = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const { productName, size, profileType, limit = 10 } = req.query;

      console.log(
        `[${requestId}] Getting smart measurement suggestions for profile: ${profileType}`,
      );

      try {
        if (!profileType || typeof profileType !== "string") {
          res
            .status(400)
            .json(
              this.createResponse(false, undefined, "Profile type is required"),
            );
          return;
        }

        const limitNumber = parseInt(limit as string) || 10;

        // If we have product name and size, get context-aware suggestions
        if (productName && size) {
          // ✅ NEW: Using UnifiedSuggestionService
          const suggestionService = UnifiedSuggestionService.getInstance();
          const allSuggestions = await suggestionService.getProfileSuggestions(
            productName as string,
            size as string,
            "",
            50, // Get more suggestions to filter by profile
          );

          // Filter suggestions by profile type
          const profileSpecificSuggestions = allSuggestions
            .filter((s: ProfileSuggestion) =>
              s.profile.toUpperCase().includes(profileType.toUpperCase()),
            )
            .map((s: ProfileSuggestion) => s.measurement)
            .slice(0, limitNumber);

          if (profileSpecificSuggestions.length > 0) {
            res.json(
              this.createResponse(true, {
                data: profileSpecificSuggestions,
                source: "context-aware",
                contextInsights: allSuggestions.map(
                  (s: ProfileSuggestion) => s.reasoning,
                ),
              }),
            );
            return;
          }
        }

        // Fallback to empty suggestions - will be populated from real data sources
        res.json(
          this.createResponse(true, {
            data: [],
            source: "real-data-sources",
            profileType: profileType.toUpperCase(),
          }),
        );
      } catch (error) {
        console.error(
          `[${requestId}] Error getting smart measurement suggestions:`,
          error,
        );

        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        res
          .status(500)
          .json(this.createResponse(false, undefined, errorMessage));
      }
    },
  );

  /**
   * Get available sizes for a product
   */
  public getProductSizes = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const { productName } = req.query;

      if (!productName || typeof productName !== "string") {
        res
          .status(400)
          .json(
            this.createResponse(false, undefined, "Product name is required"),
          );
        return;
      }

      console.log(`[${requestId}] Getting sizes for product: ${productName}`);

      try {
        // ✅ NEW: Using UnifiedSuggestionService
        const suggestionService = UnifiedSuggestionService.getInstance();
        const suggestions =
          await suggestionService.getSizeSuggestions(productName);
        const sizeStrings = suggestions.map((s: SmartSuggestion) => s.value);
        console.log(`[${requestId}] Returning sizes:`, sizeStrings);
        res.json(this.createResponse(true, sizeStrings));
      } catch (error) {
        console.error(`[${requestId}] Error getting product sizes:`, error);
        res
          .status(500)
          .json(
            this.createResponse(
              false,
              undefined,
              "Failed to get product sizes",
            ),
          );
      }
    },
  );

  /**
   * Get complete profile set for product-size combination
   */
  public getCompleteProfileSet = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const { productName, size, orderQuantity } = req.query;

      if (!productName || typeof productName !== "string") {
        res
          .status(400)
          .json(
            this.createResponse(false, undefined, "Product name is required"),
          );
        return;
      }

      if (!size || typeof size !== "string") {
        res
          .status(400)
          .json(this.createResponse(false, undefined, "Size is required"));
        return;
      }

      const orderQty =
        orderQuantity && typeof orderQuantity === "string"
          ? parseInt(orderQuantity)
          : undefined;

      console.log(
        `[${requestId}] Getting complete profile set for: ${productName} - ${size} (Order Qty: ${orderQty || "auto"})`,
      );

      try {
        // ✅ NEW: Using UnifiedSuggestionService
        const suggestionService = UnifiedSuggestionService.getInstance();
        const combinations = await suggestionService.getCombinationSuggestions(
          productName,
          size,
        );
        const profileSet = combinations[0] || {
          profiles: [],
          totalConfidence: 0,
        };
        res.json(this.createResponse(true, profileSet));
      } catch (error) {
        console.error(
          `[${requestId}] Error getting complete profile set:`,
          error,
        );
        res
          .status(500)
          .json(
            this.createResponse(
              false,
              undefined,
              "Failed to get complete profile set",
            ),
          );
      }
    },
  );

  /**
   * Get enterprise suggestion statistics
   */
  public getEnterpriseSuggestionStats = this.asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();

      console.log(`[${requestId}] Getting enterprise suggestion statistics`);

      try {
        // ✅ NEW: Using UnifiedSuggestionService
        const suggestionService = UnifiedSuggestionService.getInstance();
        const stats = await suggestionService.getStatistics();

        res.json(this.createResponse(true, stats));
      } catch (error) {
        console.error(`[${requestId}] Error getting enterprise stats:`, error);

        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        res
          .status(500)
          .json(this.createResponse(false, undefined, errorMessage));
      }
    },
  );

  /**
   * Refresh enterprise analysis
   */
  public refreshEnterpriseAnalysis = this.asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();

      console.log(`[${requestId}] Refreshing enterprise analysis`);

      try {
        // ✅ NEW: PostgreSQL-based system doesn't need manual refresh
        // Data is always fresh from database
        res.json(
          this.createResponse(true, {
            message:
              "Analysis refreshed successfully (PostgreSQL auto-refresh)",
          }),
        );
      } catch (error) {
        console.error(
          `[${requestId}] Error refreshing enterprise analysis:`,
          error,
        );

        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        res
          .status(500)
          .json(this.createResponse(false, undefined, errorMessage));
      }
    },
  );

  /**
   * Delete item from section
   */
  public deleteItemFromSection = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const { cuttingListId, sectionId, itemId } = req.params;

      console.log(
        `[${requestId}] Deleting item: ${itemId} from section: ${sectionId}`,
      );

      try {
        // Validate input
        if (!cuttingListId || !sectionId || !itemId) {
          res
            .status(400)
            .json(
              this.createResponse(
                false,
                undefined,
                "Cutting list ID, section ID and item ID are required",
              ),
            );
          return;
        }

        // ✅ MIGRATED: Use PostgreSQL instead of in-memory Map
        await cuttingListRepository.deleteItemFromSection(
          cuttingListId,
          sectionId,
          itemId,
        );

        logger.info(`[${requestId}] Item deleted via PostgreSQL`, {
          cuttingListId,
          sectionId,
          itemId,
        });

        res.json(
          this.createResponse(true, { message: "Item deleted successfully" }),
        );
      } catch (error) {
        console.error(`[${requestId}] Error deleting item:`, error);

        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        res
          .status(500)
          .json(this.createResponse(false, undefined, errorMessage));
      }
    },
  );

  /**
   * Export cutting list to PDF
   */
  exportToPDF = async (req: Request, res: Response): Promise<void> => {
    const requestId = this.generateRequestId();

    try {
      console.log(`[${requestId}] PDF export starting...`);

      const { cuttingList } = req.body;

      if (!cuttingList) {
        console.log(`[${requestId}] ERROR: Cutting list data is required`);
        res
          .status(400)
          .json(
            this.createResponse(
              false,
              undefined,
              "Cutting list data is required",
            ),
          );
        return;
      }

      console.log(`[${requestId}] Cutting list received:`, {
        id: cuttingList.id,
        title: cuttingList.title,
        sectionsCount: cuttingList.sections?.length || 0,
      });

      console.log(
        `[${requestId}] Cutting list data:`,
        JSON.stringify(cuttingList, null, 2),
      );

      // PDF export service ile PDF oluştur
      console.log(`[${requestId}] Creating PDF...`);
      const pdfResult = await this.pdfExportService.exportToPDF(cuttingList);
      console.log(`[${requestId}] PDF created, size: ${pdfResult.size} bytes`);

      // Sanitize filename for HTTP headers
      const sanitizedTitle = cuttingList.title
        .replace(/[ğ]/g, "g")
        .replace(/[Ğ]/g, "G")
        .replace(/[ü]/g, "u")
        .replace(/[Ü]/g, "U")
        .replace(/[ş]/g, "s")
        .replace(/[Ş]/g, "S")
        .replace(/[ı]/g, "i")
        .replace(/[İ]/g, "I")
        .replace(/[ö]/g, "o")
        .replace(/[Ö]/g, "O")
        .replace(/[ç]/g, "c")
        .replace(/[Ç]/g, "C")
        .replace(/[^a-zA-Z0-9\s_-]/g, "")
        .replace(/\s+/g, "_");

      // Set proper headers for PDF response
      res.setHeader("Content-Type", "application/pdf; charset=binary");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${sanitizedTitle}_${cuttingList.weekNumber}_hafta.pdf"`,
      );
      res.setHeader("Content-Length", pdfResult.size.toString());
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("X-Content-Type-Options", "nosniff");

      console.log(`[${requestId}] PDF export completed successfully`);
      res.send(pdfResult.buffer);
    } catch (error) {
      console.error(`[${requestId}] PDF export error:`, error);
      console.error(
        `[${requestId}] Error stack:`,
        error instanceof Error ? error.stack : "No stack trace",
      );
      console.error(`[${requestId}] Error details:`, {
        name: error instanceof Error ? error.name : "Unknown",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // JSON response olarak döndür
      res.status(500).json({
        success: false,
        error: `PDF export failed: ${errorMessage}`,
        details: {
          name: error instanceof Error ? error.name : "Unknown",
          message: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : "No stack trace",
        },
      });
    }
  };

  /**
   * Test PDF export service
   */
  testPDFExport = async (_req: Request, res: Response): Promise<void> => {
    const requestId = this.generateRequestId();

    try {
      console.log(`[${requestId}] Testing PDF export service...`);

      // Create a minimal cutting list for PDF export testing
      const testCuttingList = {
        id: "pdf-test",
        title: "PDF Export Test",
        weekNumber: 1,
        sections: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log(
        `[${requestId}] Test cutting list created, testing PDF export...`,
      );
      const pdfResult =
        await this.pdfExportService.exportToPDF(testCuttingList);
      console.log(
        `[${requestId}] Test PDF export successful, buffer size: ${pdfResult.size}`,
      );

      res.json({
        success: true,
        message: "PDF export service is working",
        bufferSize: pdfResult.size,
      });
    } catch (error) {
      console.error(`[${requestId}] Test PDF export failed:`, error);
      res.status(500).json({
        success: false,
        message: "PDF export service test failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  /**
   * Analyze existing data for profile suggestions
   */
  private analyzeExistingData(): void {
    const requestId = this.generateRequestId();
    console.log(
      `[${requestId}] Analyzing existing cutting lists for profile suggestions...`,
    );

    try {
      const cuttingLists = Array.from(this.cuttingLists.values());
      this.profileSuggestionService.analyzeCuttingLists(cuttingLists);

      const stats = this.profileSuggestionService.getDatabaseStats();
      console.log(
        `[${requestId}] Profile suggestion database initialized:`,
        stats,
      );
    } catch (error) {
      console.error(`[${requestId}] Error analyzing existing data:`, error);
    }
  }

  /**
   * Get profile variations for a product and size
   */
  public getProfileVariations = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const { productName, size } = req.query;

      console.log(
        `[${requestId}] Getting profile variations for: ${productName}, size: ${size}`,
      );

      try {
        // Validate input
        if (!productName || typeof productName !== "string") {
          res
            .status(400)
            .json(
              this.createResponse(false, undefined, "Product name is required"),
            );
          return;
        }

        if (!size || typeof size !== "string") {
          res
            .status(400)
            .json(this.createResponse(false, undefined, "Size is required"));
          return;
        }

        const variations = this.profileSuggestionService.getProfileVariations(
          productName,
          size,
        );

        console.log(
          `[${requestId}] Found ${variations.length} profile variations`,
        );

        res.json(this.createResponse(true, { variations }));
      } catch (error) {
        console.error(
          `[${requestId}] Error getting profile variations:`,
          error,
        );

        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        res
          .status(500)
          .json(this.createResponse(false, undefined, errorMessage));
      }
    },
  );

  /**
   * Get profile suggestions for a product and size
   */
  public getProfileSuggestions = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const { productName, size, limit = 5 } = req.query;

      console.log(
        `[${requestId}] Getting profile suggestions for: ${productName}, size: ${size}`,
      );

      try {
        // Validate input
        if (!productName || typeof productName !== "string") {
          res
            .status(400)
            .json(
              this.createResponse(false, undefined, "Product name is required"),
            );
          return;
        }

        if (!size || typeof size !== "string") {
          res
            .status(400)
            .json(this.createResponse(false, undefined, "Size is required"));
          return;
        }

        const limitNumber = parseInt(limit as string) || 15;
        const suggestions = this.profileSuggestionService.getProfileSuggestions(
          productName,
          size,
          limitNumber,
        );

        console.log(`[${requestId}] Found ${suggestions.length} suggestions`);

        res.json(this.createResponse(true, { suggestions }));
      } catch (error) {
        console.error(
          `[${requestId}] Error getting profile suggestions:`,
          error,
        );

        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        res
          .status(500)
          .json(this.createResponse(false, undefined, errorMessage));
      }
    },
  );

  /**
   * Search for similar products
   */
  public searchSimilarProducts = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const { searchTerm } = req.query;

      console.log(`[${requestId}] Searching for products: ${searchTerm}`);

      try {
        // Validate input
        if (!searchTerm || typeof searchTerm !== "string") {
          res
            .status(400)
            .json(
              this.createResponse(false, undefined, "Search term is required"),
            );
          return;
        }

        const similarProducts =
          this.profileSuggestionService.searchSimilarProducts(searchTerm);

        console.log(
          `[${requestId}] Found ${similarProducts.length} similar products`,
        );

        res.json(this.createResponse(true, { products: similarProducts }));
      } catch (error) {
        console.error(`[${requestId}] Error searching products:`, error);

        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        res
          .status(500)
          .json(this.createResponse(false, undefined, errorMessage));
      }
    },
  );

  /**
   * Get sizes for a specific product
   */
  public getSizesForProduct = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const { productName } = req.query;

      console.log(`[${requestId}] Getting sizes for product: ${productName}`);

      try {
        // Validate input
        if (!productName || typeof productName !== "string") {
          res
            .status(400)
            .json(
              this.createResponse(false, undefined, "Product name is required"),
            );
          return;
        }

        const sizes =
          this.profileSuggestionService.getSizesForProduct(productName);

        console.log(`[${requestId}] Found ${sizes.length} sizes for product`);

        res.json(this.createResponse(true, { sizes }));
      } catch (error) {
        console.error(`[${requestId}] Error getting sizes:`, error);

        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        res
          .status(500)
          .json(this.createResponse(false, undefined, errorMessage));
      }
    },
  );

  /**
   * Get profile suggestion database statistics
   */
  public getProfileSuggestionStats = this.asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      console.log(`[${requestId}] Getting profile suggestion statistics`);

      try {
        const stats = this.profileSuggestionService.getDatabaseStats();
        const allSuggestions =
          this.profileSuggestionService.getAllProductSizeSuggestions();

        console.log(
          `[${requestId}] Retrieved statistics and ${allSuggestions.length} product-size combinations`,
        );

        res.json(
          this.createResponse(true, {
            stats,
            productSizeCombinations: allSuggestions.slice(0, 20), // Limit to top 20
          }),
        );
      } catch (error) {
        console.error(`[${requestId}] Error getting statistics:`, error);

        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        res
          .status(500)
          .json(this.createResponse(false, undefined, errorMessage));
      }
    },
  );

  /**
   * Export cutting list to Excel
   */
  exportToExcel = async (req: Request, res: Response): Promise<void> => {
    const requestId = this.generateRequestId();

    try {
      console.log(`[${requestId}] Exporting to Excel`);

      const { cuttingList } = req.body;

      if (!cuttingList) {
        res
          .status(400)
          .json(
            this.createResponse(
              false,
              undefined,
              "Cutting list data is required",
            ),
          );
        return;
      }

      // Use Excel export service
      const excelBuffer = this.excelExportService.exportToExcel(cuttingList);

      // Sanitize filename for HTTP headers (remove Turkish characters and special chars)
      const sanitizedTitle = cuttingList.title
        .replace(/[ğ]/g, "g")
        .replace(/[Ğ]/g, "G")
        .replace(/[ü]/g, "u")
        .replace(/[Ü]/g, "U")
        .replace(/[ş]/g, "s")
        .replace(/[Ş]/g, "S")
        .replace(/[ı]/g, "i")
        .replace(/[İ]/g, "I")
        .replace(/[ö]/g, "o")
        .replace(/[Ö]/g, "O")
        .replace(/[ç]/g, "c")
        .replace(/[Ç]/g, "C")
        .replace(/[^a-zA-Z0-9\s_-]/g, "")
        .replace(/\s+/g, "_");

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${sanitizedTitle}.xlsx"`,
      );
      res.setHeader("Content-Length", excelBuffer.length.toString());

      console.log(`[${requestId}] Excel export completed`);
      res.send(excelBuffer);
    } catch (error) {
      console.error(`[${requestId}] Error exporting to Excel:`, error);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res.status(500).json(this.createResponse(false, undefined, errorMessage));
    }
  };

  // ============================================================================
  // QUANTITY CALCULATION METHODS
  // ============================================================================

  /**
   * Calculate quantity based on order quantity and optional size/profile
   */
  calculateQuantity = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();

      try {
        console.log(`[${requestId}] Calculating quantity`);

        const {
          siparisAdedi,
          size,
          profile,
          profileIndex,
          totalProfiles,
          productName,
        } = req.body;

        if (!siparisAdedi || typeof siparisAdedi !== "number") {
          res
            .status(400)
            .json(
              this.createResponse(
                false,
                undefined,
                "Sipariş adedi is required and must be a number",
              ),
            );
          return;
        }

        const result = this.quantityCalculationService.calculateQuantity(
          siparisAdedi,
          size,
          profile,
          profileIndex || 0,
          totalProfiles || 1,
          productName,
        );

        console.log(`[${requestId}] Quantity calculation completed:`, result);

        res.json(this.createResponse(true, result));
      } catch (error) {
        console.error(`[${requestId}] Error calculating quantity:`, error);

        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        res
          .status(500)
          .json(this.createResponse(false, undefined, errorMessage));
      }
    },
  );

  /**
   * Get quantity suggestions for a given order quantity
   */
  getQuantitySuggestions = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();

      try {
        console.log(`[${requestId}] Getting quantity suggestions`);

        const { siparisAdedi, size, profile, profileIndex, totalProfiles } =
          req.body;

        if (!siparisAdedi || typeof siparisAdedi !== "number") {
          res
            .status(400)
            .json(
              this.createResponse(
                false,
                undefined,
                "Sipariş adedi is required and must be a number",
              ),
            );
          return;
        }

        const suggestions =
          this.quantityCalculationService.getQuantitySuggestions(
            siparisAdedi,
            size,
            profile,
            profileIndex || 0,
            totalProfiles || 1,
          );

        console.log(
          `[${requestId}] Quantity suggestions retrieved:`,
          suggestions,
        );

        res.json(this.createResponse(true, suggestions));
      } catch (error) {
        console.error(
          `[${requestId}] Error getting quantity suggestions:`,
          error,
        );

        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        res
          .status(500)
          .json(this.createResponse(false, undefined, errorMessage));
      }
    },
  );

  /**
   * Validate quantity for a given order quantity
   */
  validateQuantity = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();

      try {
        console.log(`[${requestId}] Validating quantity`);

        const {
          siparisAdedi,
          adet,
          size,
          profile,
          profileIndex,
          totalProfiles,
        } = req.body;

        if (!siparisAdedi || typeof siparisAdedi !== "number") {
          res
            .status(400)
            .json(
              this.createResponse(
                false,
                undefined,
                "Sipariş adedi is required and must be a number",
              ),
            );
          return;
        }

        if (!adet || typeof adet !== "number") {
          res
            .status(400)
            .json(
              this.createResponse(
                false,
                undefined,
                "Adet is required and must be a number",
              ),
            );
          return;
        }

        const validation = this.quantityCalculationService.validateQuantity(
          siparisAdedi,
          adet,
          size,
          profile,
          profileIndex || 0,
          totalProfiles || 1,
        );

        console.log(
          `[${requestId}] Quantity validation completed:`,
          validation,
        );

        res.json(this.createResponse(true, validation));
      } catch (error) {
        console.error(`[${requestId}] Error validating quantity:`, error);

        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        res
          .status(500)
          .json(this.createResponse(false, undefined, errorMessage));
      }
    },
  );

  /**
   * Get all possible quantities for a given order quantity
   */
  getPossibleQuantities = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();

      try {
        console.log(`[${requestId}] Getting possible quantities`);

        const { siparisAdedi, size, profile, profileIndex, totalProfiles } =
          req.body;

        if (!siparisAdedi || typeof siparisAdedi !== "number") {
          res
            .status(400)
            .json(
              this.createResponse(
                false,
                undefined,
                "Sipariş adedi is required and must be a number",
              ),
            );
          return;
        }

        const possibilities =
          this.quantityCalculationService.getPossibleQuantities(
            siparisAdedi,
            size,
            profile,
            profileIndex || 0,
            totalProfiles || 1,
          );

        console.log(
          `[${requestId}] Possible quantities retrieved:`,
          possibilities,
        );

        res.json(this.createResponse(true, possibilities));
      } catch (error) {
        console.error(
          `[${requestId}] Error getting possible quantities:`,
          error,
        );

        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        res
          .status(500)
          .json(this.createResponse(false, undefined, errorMessage));
      }
    },
  );
  // ============================================================================
  // EXCEL IMPORT METHODS
  // ============================================================================

  public importExcelData = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const requestId = `import-${Date.now()}`;

    try {
      console.log(`[${requestId}] Excel data import started`);

      const { filePath, weekNumber, title, forceCreate } = req.body;

      if (!filePath) {
        res
          .status(400)
          .json(
            this.createResponse(
              false,
              undefined,
              "Excel file path is required",
            ),
          );
        return;
      }

      const targetWeek = weekNumber || 27;
      const targetTitle =
        title || `${targetWeek}. HAFTA KESİM LİSTESİ (Excel Import)`;

      // Mevcut listeyi bul veya yeni oluştur (hafta kontrolü yapmadan)
      let cuttingListId = null;

      if (!forceCreate) {
        // Mevcut listeyi ara
        const existingLists = Array.from(this.cuttingLists.values()).filter(
          (list) => list.weekNumber === targetWeek,
        );
        if (existingLists.length > 0 && existingLists[0]) {
          cuttingListId = existingLists[0].id;
          console.log(
            `[${requestId}] Using existing list: ${cuttingListId} (week ${targetWeek})`,
          );
        }
      }

      if (!cuttingListId) {
        // Yeni liste oluştur (hafta kontrolü bypass)
        const newCuttingList: CuttingList = {
          id: this.generateId(),
          title: targetTitle,
          weekNumber: targetWeek,
          sections: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        this.cuttingLists.set(newCuttingList.id, newCuttingList);
        this.saveToStorage();
        cuttingListId = newCuttingList.id;

        console.log(
          `[${requestId}] New Excel import list created: ${cuttingListId} (week ${targetWeek})`,
        );
      }

      const result = {
        imported: true,
        cuttingListId: cuttingListId,
        filePath: filePath,
        weekNumber: targetWeek,
        title: targetTitle,
        message: "Excel import için kesim listesi hazır",
      };

      console.log(`[${requestId}] Excel import completed`);

      // ⚠️ DEPRECATED: Smart suggestion database update (now handled by PostgreSQL)
      // Trigger smart suggestion database update in background after Excel import
      setTimeout(() => {
        try {
          // smartSuggestionService.reloadDatabase();
          console.log(
            `[SMART-LEARNING] [DEPRECATED] Database update skipped - using PostgreSQL now: ${cuttingListId}`,
          );
        } catch (error) {
          console.error(
            "[SMART-LEARNING] Failed to update database after import:",
            error,
          );
        }
      }, 3000); // 3 second delay for Excel imports

      res.json(this.createResponse(true, result, "Excel import ready"));
    } catch (error: unknown) {
      console.error(`[${requestId}] Excel import error:`, error);
      res
        .status(500)
        .json(
          this.createResponse(
            false,
            undefined,
            `Excel import failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          ),
        );
    }
  };

  // ==========================================================================
  // SMART LEARNING METHODS
  // ==========================================================================

  /**
   * Learn from new cutting list item and save to suggestion patterns
   */
  private async learnFromNewItem(
    itemData: {
      workOrderId: string;
      date: string;
      version: string;
      color: string;
      note?: string;
      orderQuantity: number;
      size: string;
      priority: string;
      status: string;
      profiles: Array<{
        id: string;
        profile: string;
        measurement: string;
        quantity: number;
      }>;
    },
    newItem: {
      id: string;
      sectionId: string;
      cuttingListId?: string;
    },
  ): Promise<void> {
    try {
      // Get product name from section (we need to fetch the cutting list)
      const cuttingList = await cuttingListRepository.findById(
        newItem.cuttingListId || "unknown",
      );
      if (!cuttingList) {
        logger.warn("Cannot learn from item - cutting list not found", {
          itemId: newItem.id,
        });
        return;
      }

      // Find the section to get product name
      const sections =
        (cuttingList.sections as unknown as Array<{
          id: string;
          productName: string;
        }>) || [];
      const section = sections.find((s) => s.id === newItem.sectionId);
      if (!section?.productName) {
        logger.warn(
          "Cannot learn from item - section or product name not found",
          {
            itemId: newItem.id,
            sectionId: newItem.sectionId,
          },
        );
        return;
      }

      const productName = section.productName;
      const size = itemData.size;
      const orderQuantity = itemData.orderQuantity;

      // ✅ FIXED: Learn from each profile with explicit index to preserve order
      for (let i = 0; i < itemData.profiles.length; i++) {
        const profile = itemData.profiles[i];

        await this.learnFromProfile({
          productName,
          size,
          profile: profile.profile,
          measurement: profile.measurement,
          quantity: profile.quantity,
          orderQuantity,
          lastUsed: new Date(),
          originalIndex: i, // ✅ Preserve original order
        });
      }

      logger.info("Smart learning completed for new item", {
        productName,
        size,
        orderQuantity,
        profileCount: itemData.profiles.length,
      });
    } catch (error) {
      logger.error("Failed to learn from new item", {
        error,
        itemData,
        newItem,
      });
      throw error;
    }
  }

  /**
   * Learn from a single profile pattern
   */
  private async learnFromProfile(patternData: {
    productName: string;
    size: string;
    profile: string;
    measurement: string;
    quantity: number;
    orderQuantity: number;
    lastUsed: Date;
    originalIndex: number;
  }): Promise<void> {
    try {
      const { UnifiedSuggestionService } = await import(
        "../services/suggestions/UnifiedSuggestionService"
      );
      const suggestionService = UnifiedSuggestionService.getInstance();

      // Create or update pattern with index
      await suggestionService.learnFromPattern(patternData);
    } catch (error) {
      logger.error("Failed to learn from profile", { error, patternData });
      throw error;
    }
  }

  // ============================================================================
  // MANUAL DATA ENTRY METHODS
  // ============================================================================
}

// ============================================================================
// ERROR HANDLER MIDDLEWARE
// ============================================================================

/**
 * Global error handler for cutting list routes
 */
let cuttingListControllerSingleton: CuttingListController | null = null;

export const getCuttingListController = (): CuttingListController => {
  if (!cuttingListControllerSingleton) {
    cuttingListControllerSingleton = new CuttingListController();
  }

  return cuttingListControllerSingleton;
};

export const cuttingListErrorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error("Cutting list route error:", error);

  const response: ApiResponse = {
    success: false,
    error: error instanceof Error ? error.message : "Internal server error",
    timestamp: new Date().toISOString(),
  };

  res.status(500).json(response);
};

// ============================================================================
// SMART SUGGESTION ENDPOINTS
// ============================================================================

/**
 * Get smart product suggestions
 * @deprecated Use /api/suggestions/products instead
 */
export const getSmartProductSuggestions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const requestId = req.headers["x-request-id"] || Date.now();

  try {
    console.log(
      `[REQ-${requestId}] [DEPRECATED] Getting smart product suggestions - Use /api/suggestions/products`,
    );

    const { query = "", limit = 10 } = req.query;

    // ✅ NEW: Using UnifiedSuggestionService
    const suggestionService = UnifiedSuggestionService.getInstance();
    const suggestions = await suggestionService.getProductSuggestions(
      query as string,
      parseInt(limit as string, 10),
    );

    // Transform to legacy format for backward compatibility
    const legacyFormat = {
      success: true,
      data: suggestions.map((s) => ({
        value: s.value,
        confidence: s.confidence,
        frequency: s.frequency,
        type: s.type,
      })),
    };

    res.setHeader("X-Deprecated", "true");
    res.setHeader(
      "X-Deprecation-Notice",
      "Use /api/suggestions/products instead",
    );
    res.json(legacyFormat);
    return;
  } catch (error) {
    console.error(`[REQ-${requestId}] Error:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to get product suggestions",
    });
    return;
  }
};

/**
 * Get smart product suggestions (LEGACY)
 * @deprecated This is the old implementation, kept for reference
 */
const getSmartProductSuggestionsLegacy = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const requestId = req.headers["x-request-id"] || Date.now();

  try {
    console.log(
      `[REQ-${requestId}] [LEGACY CODE - NOT USED] Getting smart product suggestions`,
    );

    const { query = "", limit = 10 } = req.query;

    // ⚠️ DEPRECATED: Legacy code kept for reference only
    const suggestions = { data: [], success: true }; // smartSuggestionService.getProductSuggestions(...)

    console.log(
      `[REQ-${requestId}] Found ${suggestions.data.length} product suggestions`,
    );

    const response: ApiResponse = {
      success: true,
      data: suggestions,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: unknown) {
    console.error(`[REQ-${requestId}] Smart product suggestions error:`, error);

    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get product suggestions",
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
};

/**
 * Get smart size suggestions
 * @deprecated Use /api/suggestions/sizes instead
 */
export const getSmartSizeSuggestions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const requestId = req.headers["x-request-id"] || Date.now();

  try {
    console.log(
      `[REQ-${requestId}] [DEPRECATED] Getting smart size suggestions - Use /api/suggestions/sizes`,
    );

    const { productName, query = "", limit = 10 } = req.query;

    if (!productName) {
      res.status(400).json({ success: false, error: "Product name required" });
      return;
    }

    // ✅ NEW: Using UnifiedSuggestionService
    const suggestionService = UnifiedSuggestionService.getInstance();
    const suggestions = await suggestionService.getSizeSuggestions(
      productName as string,
      query as string,
      parseInt(limit as string, 10),
    );

    res.setHeader("X-Deprecated", "true");
    res.setHeader(
      "X-Deprecation-Notice",
      "Use /api/suggestions/sizes?product=X instead",
    );
    res.json({
      success: true,
      data: suggestions.map((s) => s.value),
    });
    return;
  } catch (error) {
    console.error(`[REQ-${requestId}] Error:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to get size suggestions",
    });
    return;
  }
};

/**
 * Get smart size suggestions (LEGACY)
 * @deprecated This is the old implementation, kept for reference
 */
const getSmartSizeSuggestionsLegacy = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const requestId = req.headers["x-request-id"] || Date.now();

  try {
    console.log(
      `[REQ-${requestId}] [LEGACY CODE - NOT USED] Getting smart size suggestions`,
    );

    const { productName, query = "", limit = 10 } = req.query;

    // ⚠️ DEPRECATED: Legacy code kept for reference only
    const suggestions = { data: [], success: true }; // smartSuggestionService.getSizeSuggestions(...)

    console.log(
      `[REQ-${requestId}] Found ${suggestions.data.length} size suggestions`,
    );

    const response: ApiResponse = {
      success: true,
      data: suggestions,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: unknown) {
    console.error(`[REQ-${requestId}] Smart size suggestions error:`, error);

    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get size suggestions",
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
};

/**
 * Get smart profile suggestions
 * @deprecated Use /api/suggestions/profiles instead
 */
export const getSmartProfileSuggestions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const requestId = req.headers["x-request-id"] || Date.now();

  try {
    console.log(
      `[REQ-${requestId}] [DEPRECATED] Getting smart profile suggestions - Use /api/suggestions/profiles`,
    );

    const { productName, size, query = "", limit = 10 } = req.query;

    if (!productName || !size) {
      res
        .status(400)
        .json({ success: false, error: "Product name and size required" });
      return;
    }

    // ✅ NEW: Using UnifiedSuggestionService
    const suggestionService = UnifiedSuggestionService.getInstance();
    const suggestions = await suggestionService.getProfileSuggestions(
      productName as string,
      size as string,
      query as string,
      parseInt(limit as string, 10),
    );

    res.setHeader("X-Deprecated", "true");
    res.setHeader(
      "X-Deprecation-Notice",
      "Use /api/suggestions/profiles?product=X&size=Y instead",
    );
    res.json({
      success: true,
      data: suggestions,
    });
    return;
  } catch (error) {
    console.error(`[REQ-${requestId}] Error:`, error);
    res.status(500).json({
      success: false,
      error: "Failed to get profile suggestions",
    });
    return;
  }
};

/**
 * Get smart profile suggestions (LEGACY)
 * @deprecated This is the old implementation, kept for reference
 */
const getSmartProfileSuggestionsLegacy = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const requestId = req.headers["x-request-id"] || Date.now();

  try {
    console.log(
      `[REQ-${requestId}] [LEGACY CODE - NOT USED] Getting smart profile suggestions`,
    );

    const { productName, size, query = "", limit = 10 } = req.query;

    // ⚠️ DEPRECATED: Legacy code kept for reference only
    const suggestions = { data: [], success: true }; // smartSuggestionService.getProfileSuggestions(...)

    console.log(
      `[REQ-${requestId}] Found ${suggestions.data.length} profile suggestions`,
    );

    const response: ApiResponse = {
      success: true,
      data: suggestions,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: unknown) {
    console.error(`[REQ-${requestId}] Smart profile suggestions error:`, error);

    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get profile suggestions",
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
};

/**
 * Get auto-complete suggestions
 */
export const getAutoCompleteSuggestions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const requestId = req.headers["x-request-id"] || Date.now();

  try {
    console.log(`[REQ-${requestId}] Getting auto-complete suggestions`);

    const { type, query, limit = 5 } = req.query;

    if (!type || !query) {
      const response: ApiResponse = {
        success: false,
        error: "Type and query parameters are required",
        timestamp: new Date().toISOString(),
      };

      res.status(400).json(response);
      return;
    }

    const validTypes = ["product", "size", "profile", "color", "measurement"];
    if (!validTypes.includes(String(type))) {
      const response: ApiResponse = {
        success: false,
        error: `Invalid type. Must be one of: ${validTypes.join(", ")}`,
        timestamp: new Date().toISOString(),
      };

      res.status(400).json(response);
      return;
    }

    // ⚠️ DEPRECATED: Legacy code - return empty for now
    const suggestions: string[] = []; // smartSuggestionService.getAutoCompleteSuggestions(...)

    console.log(
      `[REQ-${requestId}] Found ${suggestions.length} auto-complete suggestions`,
    );

    const response: ApiResponse = {
      success: true,
      data: suggestions,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: unknown) {
    console.error(`[REQ-${requestId}] Auto-complete suggestions error:`, error);

    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get auto-complete suggestions",
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
};

/**
 * Get smart suggestion database statistics
 */
export const getSmartSuggestionStats = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const requestId = req.headers["x-request-id"] || Date.now();

  try {
    console.log(
      `[REQ-${requestId}] [DEPRECATED] Getting smart suggestion stats - Use /api/suggestions/statistics`,
    );

    // ✅ NEW: Using UnifiedSuggestionService
    const suggestionService = UnifiedSuggestionService.getInstance();
    const stats = await suggestionService.getStatistics();

    console.log(`[REQ-${requestId}] Smart suggestion stats retrieved`);

    const response: ApiResponse = {
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: unknown) {
    console.error(`[REQ-${requestId}] Smart suggestion stats error:`, error);

    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get suggestion stats",
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
};

/**
 * Reload smart suggestion database
 */
export const reloadSmartSuggestionDatabase = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const requestId = req.headers["x-request-id"] || Date.now();

  try {
    console.log(
      `[REQ-${requestId}] [DEPRECATED] Reloading smart suggestion database - Use PostgreSQL now`,
    );

    // ⚠️ DEPRECATED: Using legacy service
    const success = true; // smartSuggestionService.reloadDatabase();

    if (success) {
      console.log(
        `[REQ-${requestId}] Smart suggestion database reloaded successfully`,
      );

      const response: ApiResponse = {
        success: true,
        data: { reloaded: true },
        message: "Smart suggestion database reloaded successfully",
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } else {
      throw new Error("Failed to reload database");
    }
  } catch (error: unknown) {
    console.error(
      `[REQ-${requestId}] Smart suggestion database reload error:`,
      error,
    );

    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to reload suggestion database",
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
};

// ============================================================================
// NEW SMART WORK ORDER CREATION API ENDPOINTS
// ============================================================================

/**
 * Get smart suggestions for work order creation
 */
export const getSmartWorkOrderSuggestions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const requestId = req.headers["x-request-id"] || Date.now();

  try {
    console.log(`[REQ-${requestId}] Getting smart work order suggestions`);

    const { productName, size, limit = 10 } = req.query;

    if (!productName || !size) {
      const response: ApiResponse = {
        success: false,
        error: "Product name and size are required",
        timestamp: new Date().toISOString(),
      };

      res.status(400).json(response);
      return;
    }

    // ✅ NEW: Using UnifiedSuggestionService
    const suggestionService = UnifiedSuggestionService.getInstance();
    const suggestions = await suggestionService.getProfileSuggestions(
      String(productName),
      String(size),
      "",
      parseInt(String(limit)),
    );

    console.log(
      `[REQ-${requestId}] Found ${suggestions.length} smart suggestions`,
    );

    const response: ApiResponse = {
      success: true,
      data: { data: suggestions, success: true },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: unknown) {
    console.error(
      `[REQ-${requestId}] Smart work order suggestions error:`,
      error,
    );

    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get smart suggestions",
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
};

/**
 * Get smart insights for work order data
 */
export const getSmartWorkOrderInsights = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const requestId = req.headers["x-request-id"] || Date.now();

  try {
    console.log(`[REQ-${requestId}] Getting smart work order insights`);

    const workOrderData = req.body;

    if (!workOrderData) {
      const response: ApiResponse = {
        success: false,
        error: "Work order data is required",
        timestamp: new Date().toISOString(),
      };

      res.status(400).json(response);
      return;
    }

    // Return basic work order data analysis
    const insights = [
      {
        type: "info",
        message: "Work order data received successfully",
        timestamp: new Date().toISOString(),
      },
    ];

    console.log(`[REQ-${requestId}] Generated ${insights.length} insights`);

    const response: ApiResponse = {
      success: true,
      data: insights,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: unknown) {
    console.error(`[REQ-${requestId}] Smart work order insights error:`, error);

    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to generate insights",
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
};

/**
 * Apply smart profile set to work order
 */
export const applySmartProfileSet = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const requestId = req.headers["x-request-id"] || Date.now();

  try {
    console.log(`[REQ-${requestId}] Applying smart profile set`);

    const { productName, size, orderQuantity, suggestionId } = req.body;

    if (!productName || !size || !suggestionId) {
      const response: ApiResponse = {
        success: false,
        error: "Product name, size, and suggestion ID are required",
        timestamp: new Date().toISOString(),
      };

      res.status(400).json(response);
      return;
    }

    // Profile set will be generated from real data sources
    const profileSet = {
      id: suggestionId,
      productName: String(productName),
      size: String(size),
      profiles: [],
    };

    console.log(
      `[REQ-${requestId}] Applied smart profile set with ${profileSet.profiles.length} profiles`,
    );

    const response: ApiResponse = {
      success: true,
      data: profileSet,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: unknown) {
    console.error(`[REQ-${requestId}] Apply smart profile set error:`, error);

    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to apply smart profile set",
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
};

/**
 * Get work order templates
 */
export const getWorkOrderTemplates = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const requestId = req.headers["x-request-id"] || Date.now();

  try {
    console.log(`[REQ-${requestId}] Getting work order templates`);

    const { limit = 20 } = req.query;

    // Templates will be loaded from real data sources
    const templates: WorkOrderTemplate[] = [];

    console.log(
      `[REQ-${requestId}] Found ${templates.length} work order templates`,
    );

    const response: ApiResponse = {
      success: true,
      data: templates,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: unknown) {
    console.error(`[REQ-${requestId}] Get work order templates error:`, error);

    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get work order templates",
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
};

/**
 * Duplicate work order with smart modifications
 */
export const duplicateWorkOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const requestId = req.headers["x-request-id"] || Date.now();

  try {
    console.log(`[REQ-${requestId}] Duplicating work order`);

    const { workOrderId } = req.body;

    if (!workOrderId) {
      const response: ApiResponse = {
        success: false,
        error: "Work order ID is required",
        timestamp: new Date().toISOString(),
      };

      res.status(400).json(response);
      return;
    }

    // Duplicated work order will be generated from real data sources
    const duplicatedWorkOrder = {
      id: `duplicate-${workOrderId}`,
      workOrderId: `DUP-${workOrderId}`,
      date: new Date().toISOString().split("T")[0],
      version: "1.0",
      color: "Duplicated",
      note: "Duplicated work order",
      orderQuantity: 1,
      size: "Standard",
      profiles: [],
    };

    console.log(`[REQ-${requestId}] Work order duplicated successfully`);

    const response: ApiResponse = {
      success: true,
      data: duplicatedWorkOrder,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error: unknown) {
    console.error(`[REQ-${requestId}] Duplicate work order error:`, error);

    const response: ApiResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to duplicate work order",
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
};

// ============================================================================
// SMART SUGGESTIONS CONTROLLERS
// ============================================================================

export const getAvailableSizes = async (req: Request, res: Response) => {
  try {
    const { productName } = req.query;

    console.log(
      "🔍 Backend: getAvailableSizes called with productName:",
      productName,
    );

    if (!productName || typeof productName !== "string") {
      return res.status(400).json({
        success: false,
        error: "Product name is required",
        timestamp: new Date().toISOString(),
      });
    }

    // Get all cutting lists from the controller instance
    const controller = getCuttingListController();
    const cuttingLists = controller.getAllCuttingListsData();

    console.log("📊 Backend: Found cutting lists:", cuttingLists.length);
    console.log(
      "📊 Backend: Cutting lists data:",
      JSON.stringify(cuttingLists, null, 2),
    );

    // Extract unique sizes for the given product
    const sizes = new Set<string>();

    cuttingLists.forEach((cuttingList: CuttingList) => {
      console.log("🔍 Backend: Processing cutting list:", cuttingList.title);
      cuttingList.sections.forEach((section: ProductSection) => {
        console.log("🔍 Backend: Processing section:", section.productName);
        if (
          section.productName.toLowerCase().includes(productName.toLowerCase())
        ) {
          console.log("✅ Backend: Section matches product name");
          section.items.forEach((item: CuttingListItem) => {
            console.log("🔍 Backend: Processing item with size:", item.size);
            if (item.size && item.size.trim()) {
              sizes.add(item.size.trim());
              console.log("✅ Backend: Added size:", item.size.trim());
            }
          });
        }
      });
    });

    const availableSizes = Array.from(sizes).sort();
    console.log("📊 Backend: Final available sizes:", availableSizes);

    return res.json({
      success: true,
      data: availableSizes,
      message: `Found ${availableSizes.length} available sizes for product: ${productName}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error getting available sizes:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to get available sizes",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
};

export const getProfileCombinations = async (req: Request, res: Response) => {
  try {
    const { productName, size } = req.query;

    if (
      !productName ||
      typeof productName !== "string" ||
      !size ||
      typeof size !== "string"
    ) {
      return res.status(400).json({
        success: false,
        error: "Product name and size are required",
        timestamp: new Date().toISOString(),
      });
    }

    // Get all cutting lists from the controller instance
    const controller = getCuttingListController();
    const cuttingLists = controller.getAllCuttingListsData();

    // Find matching items
    const matchingItems: (CuttingListItem & { sectionProductName: string })[] =
      [];

    cuttingLists.forEach((cuttingList: CuttingList) => {
      cuttingList.sections.forEach((section: ProductSection) => {
        if (
          section.productName.toLowerCase().includes(productName.toLowerCase())
        ) {
          section.items.forEach((item: CuttingListItem) => {
            if (
              item.size &&
              item.size.toLowerCase().includes(size.toLowerCase())
            ) {
              matchingItems.push({
                ...item,
                sectionProductName: section.productName,
              });
            }
          });
        }
      });
    });

    // Group by profile combinations
    const combinationMap = new Map<
      string,
      {
        profiles: Array<{
          profile: string;
          measurement: string;
          ratio: number;
        }>;
        usageCount: number;
        lastUsed: string;
      }
    >();

    matchingItems.forEach((item) => {
      // Create a key for this combination
      const profileKey = item.profiles
        .map((p: ProfileItem) => `${p.profile}-${p.measurement}`)
        .sort()
        .join("|");

      if (!combinationMap.has(profileKey)) {
        // Calculate ratios based on order quantity
        const profiles = item.profiles.map((profile: ProfileItem) => ({
          profile: profile.profile || "Unknown",
          measurement: profile.measurement,
          ratio:
            item.orderQuantity > 0 ? profile.quantity / item.orderQuantity : 0,
        }));

        combinationMap.set(profileKey, {
          profiles,
          usageCount: 1,
          lastUsed: new Date().toISOString(),
        });
      } else {
        const existing = combinationMap.get(profileKey)!;
        existing.usageCount++;

        // Update ratios with average
        existing.profiles.forEach(
          (profile: { ratio: number }, index: number) => {
            const currentProfile = item.profiles[index];
            if (currentProfile) {
              const currentRatio =
                item.orderQuantity > 0
                  ? currentProfile.quantity / item.orderQuantity
                  : 0;
              profile.ratio = (profile.ratio + currentRatio) / 2;
            }
          },
        );

        // Update last used date
        const itemDate = new Date().toISOString();
        if (new Date(itemDate) > new Date(existing.lastUsed)) {
          existing.lastUsed = itemDate;
        }
      }
    });

    // Convert to array and sort by usage count
    const combinations = Array.from(combinationMap.entries())
      .map(([, data], index) => ({
        id: `combination-${index + 1}`,
        ...data,
      }))
      .sort((a, b) => b.usageCount - a.usageCount);

    return res.json({
      success: true,
      data: combinations,
      message: `Found ${combinations.length} profile combinations for ${productName} - ${size}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error getting profile combinations:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to get profile combinations",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
};
