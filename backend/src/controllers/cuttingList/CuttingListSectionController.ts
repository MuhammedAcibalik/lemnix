/**
 * @fileoverview Cutting List Section Controller
 * @module controllers/cuttingList/CuttingListSectionController
 * @version 1.0.0
 * @description Controller for product section management operations
 */

import { Request, Response } from "express";
import { cuttingListRepository } from "../../repositories/CuttingListRepository";
import { logger } from "../../services/logger";
import { CuttingListBaseController } from "./shared/CuttingListBaseController";

/**
 * Cutting List Section Controller
 * Handles product section management operations
 */
export class CuttingListSectionController extends CuttingListBaseController {
  /**
   * Add product section to cutting list
   */
  public addProductSection = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const { cuttingListId } = req.params;
      const { productName, productCategory } = req.body;

      logger.info(`[${requestId}] 📦 ADD PRODUCT SECTION REQUEST`, {
        cuttingListId,
        productName,
        productCategory,
        path: req.path,
        method: req.method,
      });
      logger.info("[CuttingList] Adding product section", {
        requestId,
        productName,
        cuttingListId,
      });

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
                requestId,
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
              this.createResponse(
                false,
                undefined,
                "Product name is required",
                requestId,
              ),
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
              this.createResponse(
                false,
                undefined,
                "Cutting list not found",
                requestId,
              ),
            );
          return;
        }

        // Determine product category
        let finalProductCategory: string | undefined = productCategory;

        // If category not provided, try to get from existing mapping
        if (!finalProductCategory) {
          const { productCategoryRepository } = await import(
            "../../repositories/ProductCategoryRepository"
          );
          const existingCategory =
            await productCategoryRepository.getCategoryByProductName(
              productName.trim(),
            );
          if (existingCategory) {
            finalProductCategory = existingCategory.name;
          }
        }

        // If still no category, require it (frontend should send it for new products)
        if (!finalProductCategory) {
          res
            .status(400)
            .json(
              this.createResponse(
                false,
                undefined,
                "Product category is required for new products",
                requestId,
              ),
            );
          return;
        }

        // Create new product section in database
        const newSection = await cuttingListRepository.addProductSection(
          cuttingListId,
          {
            productName: productName.trim(),
            productCategory: finalProductCategory,
          },
        );

        logger.info("[CuttingList] Product section added", {
          requestId,
          sectionId: newSection.id,
        });

        res.json(this.createResponse(true, newSection, undefined, requestId));
      } catch (error) {
        logger.error(
          "[CuttingList] Error adding product section",
          error instanceof Error ? error : new Error(String(error)),
          { requestId, cuttingListId },
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
   * Delete product section
   * ✅ FIXED: Now deletes from database using repository
   */
  public deleteProductSection = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const { cuttingListId, sectionId } = req.params;

      logger.info(`[${requestId}] Deleting product section`, {
        cuttingListId,
        sectionId,
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

        // ✅ FIXED: Delete from database using repository
        await cuttingListRepository.deleteSection(cuttingListId, sectionId);

        logger.info(`[${requestId}] Product section deleted successfully`, {
          cuttingListId,
          sectionId,
        });

        res.json(
          this.createResponse(
            true,
            { message: "Product section deleted successfully" },
            undefined,
            requestId,
          ),
        );
      } catch (error) {
        logger.error(`[${requestId}] Error deleting product section`, {
          cuttingListId,
          sectionId,
          error: error instanceof Error ? error : new Error(String(error)),
        });

        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        res
          .status(500)
          .json(this.createResponse(false, undefined, errorMessage, requestId));
      }
    },
  );
}
