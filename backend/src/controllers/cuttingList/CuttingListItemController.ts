/**
 * @fileoverview Cutting List Item Controller
 * @module controllers/cuttingList/CuttingListItemController
 * @version 1.0.0
 * @description Controller for item management operations within sections
 */

import { Request, Response } from "express";
import { cuttingListRepository } from "../../repositories/CuttingListRepository";
import { logger } from "../../services/logger";
import { MeasurementConverter } from "../../utils/measurementConverter";
import { getCuttingListLearningService } from "../../services/cuttingList";
import { CuttingListBaseController } from "./shared/CuttingListBaseController";

/**
 * Cutting List Item Controller
 * Handles item management operations within sections
 */
export class CuttingListItemController extends CuttingListBaseController {
  private readonly learningService = getCuttingListLearningService();

  /**
   * Add item to product section
   */
  public addItemToSection = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const { cuttingListId, sectionId } = req.params;
      const itemData = req.body;

      logger.info("[CuttingList] Adding item to section", {
        requestId,
        sectionId,
        itemData,
      });

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
                requestId,
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
            logger.warn("[CuttingList] Missing required field", {
              requestId,
              field,
              availableFields: Object.keys(itemData),
              fieldValues: {
                workOrderId: itemData.workOrderId,
                date: itemData.date,
                version: itemData.version,
                color: itemData.color,
                orderQuantity: itemData.orderQuantity,
                size: itemData.size,
                profiles: itemData.profiles,
              },
            });
            res
              .status(400)
              .json(
                this.createResponse(
                  false,
                  undefined,
                  `Field '${field}' is required`,
                  requestId,
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
                requestId,
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
                requestId,
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
                  requestId,
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
                  requestId,
                ),
              );
            return;
          }
        }

        // ✅ MIGRATED: Use PostgreSQL instead of in-memory Map

        // Extract required fields from profiles
        const firstProfile = itemData.profiles[0];
        if (!firstProfile) {
          res
            .status(400)
            .json(
              this.createResponse(
                false,
                undefined,
                "At least one profile is required",
                requestId,
              ),
            );
          return;
        }

        const profileType = firstProfile.profile || "";
        const lengthStr = MeasurementConverter.convertToMM(
          firstProfile.measurement,
        );
        const length = parseFloat(lengthStr) || 0;
        const quantity = itemData.profiles.reduce(
          (sum: number, p: { quantity: string | number }) =>
            sum + parseInt(String(p.quantity)),
          0,
        );

        // Prepare item data for repository
        const newItem = await cuttingListRepository.addItemToSection(
          cuttingListId,
          sectionId,
          {
            workOrderId: itemData.workOrderId,
            date: itemData.date,
            version: itemData.version,
            color: itemData.color,
            notes: itemData.note, // Map note to notes field
            orderQuantity,
            size: itemData.size,
            profileType,
            length,
            quantity,
            priority: itemData.priority || "medium",
            status: itemData.status || "draft",
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

          await this.learningService.learnFromNewItem(
            {
              workOrderId: itemData.workOrderId,
              date: itemData.date,
              version: itemData.version,
              color: itemData.color,
              note: itemData.note, // Map note to note field
              orderQuantity,
              size: itemData.size,
              priority: itemData.priority || "medium",
              status: itemData.status || "draft",
              profiles: itemData.profiles.map(
                (p: {
                  id?: string;
                  profile?: string;
                  measurement: string;
                  quantity: string | number;
                }) => ({
                  id: p.id || this.generateId(),
                  profile: p.profile || "",
                  measurement: p.measurement,
                  quantity: parseInt(String(p.quantity)),
                }),
              ),
            },
            {
              id: newItem.id,
              sectionId: sectionId,
              cuttingListId: newItem.cuttingListId,
            },
          );

          logger.info(`[${requestId}] Smart suggestion learning completed`, {
            productName: itemData.size, // This should be productName from section
            size: itemData.size,
            orderQuantity: itemData.orderQuantity,
            profileCount: itemData.profiles.length,
          });
        } catch (learningError) {
          logger.warn(
            `[${requestId}] Smart suggestion learning failed (non-critical)`,
            {
              learningError:
                learningError instanceof Error
                  ? learningError
                  : new Error(String(learningError)),
            },
          );
          // Don't fail the main request if learning fails
        }

        res
          .status(201)
          .json(this.createResponse(true, newItem, undefined, requestId));
      } catch (error) {
        logger.error(
          "[CuttingList] Error adding item",
          error instanceof Error ? error : new Error(String(error)),
          { requestId, sectionId },
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
   * Update item in section
   */
  public updateItemInSection = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const { cuttingListId, sectionId, itemId } = req.params;
      const itemData = req.body;

      logger.info("[CuttingList] Updating item", {
        requestId,
        itemId,
        sectionId,
        cuttingListId,
        itemData,
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
                requestId,
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
            logger.warn("[CuttingList] Missing required field", {
              requestId,
              field,
              availableFields: Object.keys(itemData),
            });
            res
              .status(400)
              .json(
                this.createResponse(
                  false,
                  undefined,
                  `Field '${field}' is required`,
                  requestId,
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
                requestId,
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
                requestId,
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
                  requestId,
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
                  requestId,
                ),
              );
            return;
          }
        }

        // ✅ MIGRATED: Use PostgreSQL instead of in-memory Map

        // Prepare updated item data for repository
        const updatedItem = await cuttingListRepository.updateItemInSection(
          cuttingListId,
          itemId,
          {
            workOrderId: itemData.workOrderId,
            date: itemData.date,
            version: itemData.version,
            color: itemData.color,
            notes: itemData.note, // Map note to notes field
            orderQuantity,
            size: itemData.size,
            priority: itemData.priority || "medium",
            status: itemData.status || "draft",
          },
        );

        logger.info(`[${requestId}] Item updated via PostgreSQL`, {
          cuttingListId,
          sectionId,
          itemId,
        });

        res.json(this.createResponse(true, updatedItem, undefined, requestId));
      } catch (error) {
        logger.error(
          "[CuttingList] Error updating item",
          error instanceof Error ? error : new Error(String(error)),
          { requestId, itemId, sectionId },
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
   * Delete item from section
   */
  public deleteItemFromSection = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const { cuttingListId, sectionId, itemId } = req.params;

      logger.info("[CuttingList] Deleting item", {
        requestId,
        itemId,
        sectionId,
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
                requestId,
              ),
            );
          return;
        }

        // ✅ MIGRATED: Use PostgreSQL instead of in-memory Map
        await cuttingListRepository.deleteItemFromSection(
          cuttingListId,
          itemId,
        );

        logger.info(`[${requestId}] Item deleted via PostgreSQL`, {
          cuttingListId,
          sectionId,
          itemId,
        });

        res.json(
          this.createResponse(
            true,
            { message: "Item deleted successfully" },
            undefined,
            requestId,
          ),
        );
      } catch (error) {
        logger.error(
          "[CuttingList] Error deleting item",
          error instanceof Error ? error : new Error(String(error)),
          { requestId, itemId, sectionId },
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
