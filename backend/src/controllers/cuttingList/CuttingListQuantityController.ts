/**
 * @fileoverview Cutting List Quantity Controller
 * @module controllers/cuttingList/CuttingListQuantityController
 * @version 1.0.0
 * @description Controller for quantity calculation operations
 */

import { Request, Response } from "express";
import { QuantityCalculationService } from "../../services/suggestions/quantityCalculationService";
import { logger } from "../../services/logger";
import { CuttingListBaseController } from "./shared/CuttingListBaseController";

/**
 * Cutting List Quantity Controller
 * Handles quantity calculation operations
 */
export class CuttingListQuantityController extends CuttingListBaseController {
  private readonly quantityCalculationService: QuantityCalculationService;

  constructor() {
    super();
    this.quantityCalculationService = new QuantityCalculationService();
  }

  /**
   * Calculate quantity based on order quantity and optional size/profile
   */
  public calculateQuantity = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();

      try {
        logger.info("[CuttingList] Calculating quantity", { requestId });

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
                requestId,
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

        logger.debug("[CuttingList] Quantity calculation completed", {
          requestId,
          result,
        });

        res.json(this.createResponse(true, result, undefined, requestId));
      } catch (error) {
        logger.error(
          "[CuttingList] Error calculating quantity",
          error instanceof Error ? error : new Error(String(error)),
          { requestId },
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
   * Get quantity suggestions for a given order quantity
   */
  public getQuantitySuggestions = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();

      try {
        logger.info("[CuttingList] Getting quantity suggestions", {
          requestId,
        });

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
                requestId,
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

        logger.debug("[CuttingList] Quantity suggestions retrieved", {
          requestId,
          count: suggestions.length,
        });

        res.json(this.createResponse(true, suggestions, undefined, requestId));
      } catch (error) {
        logger.error(
          "[CuttingList] Error getting quantity suggestions",
          error instanceof Error ? error : new Error(String(error)),
          { requestId },
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
   * Validate quantity for a given order quantity
   */
  public validateQuantity = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();

      try {
        logger.info("[CuttingList] Validating quantity", { requestId });

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
                requestId,
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
                requestId,
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

        logger.debug("[CuttingList] Quantity validation completed", {
          requestId,
          validation,
        });

        res.json(this.createResponse(true, validation, undefined, requestId));
      } catch (error) {
        logger.error(
          "[CuttingList] Error validating quantity",
          error instanceof Error ? error : new Error(String(error)),
          { requestId },
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
   * Get all possible quantities for a given order quantity
   */
  public getPossibleQuantities = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();

      try {
        logger.info("[CuttingList] Getting possible quantities", {
          requestId,
        });

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
                requestId,
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

        logger.debug("[CuttingList] Possible quantities retrieved", {
          requestId,
          count: possibilities.length,
        });

        res.json(
          this.createResponse(true, possibilities, undefined, requestId),
        );
      } catch (error) {
        logger.error(
          "[CuttingList] Error getting possible quantities",
          error instanceof Error ? error : new Error(String(error)),
          { requestId },
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
