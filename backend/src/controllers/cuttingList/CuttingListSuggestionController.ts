/**
 * @fileoverview Cutting List Suggestion Controller
 * @module controllers/cuttingList/CuttingListSuggestionController
 * @version 1.0.0
 * @description Controller for suggestion operations (profile, size, measurement)
 */

import { Request, Response } from "express";
import { ProfileSuggestionService } from "../../services/suggestions/profileSuggestionService";
import {
  UnifiedSuggestionService,
  type ProfileSuggestion,
  type SmartSuggestion,
} from "../../services/suggestions/UnifiedSuggestionService";
import { logger } from "../../services/logger";
import { CuttingListBaseController } from "./shared/CuttingListBaseController";

/**
 * Cutting List Suggestion Controller
 * Handles suggestion operations for profiles, sizes, and measurements
 */
export class CuttingListSuggestionController extends CuttingListBaseController {
  private readonly profileSuggestionService: ProfileSuggestionService;

  constructor() {
    super();
    this.profileSuggestionService = new ProfileSuggestionService();
  }

  /**
   * Get enterprise profile suggestions
   */
  public getEnterpriseProfileSuggestions = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const { productName, size, note, version, color, limit = 15 } = req.query;

      logger.info("[CuttingList] Getting enterprise profile suggestions", {
        requestId,
        productName,
        size,
      });

      try {
        // Validate required parameters
        if (!productName || typeof productName !== "string") {
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

        if (!size || typeof size !== "string") {
          res
            .status(400)
            .json(
              this.createResponse(
                false,
                undefined,
                "Size is required",
                requestId,
              ),
            );
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

        logger.info("[CuttingList] Generated enterprise suggestions", {
          requestId,
          count: suggestions.length,
        });

        res.json(
          this.createResponse(
            true,
            {
              suggestions,
              contextualInsights: suggestions.map(
                (s: ProfileSuggestion) => s.reasoning,
              ),
            },
            undefined,
            requestId,
          ),
        );
      } catch (error) {
        logger.error(
          "[CuttingList] Error getting enterprise profile suggestions",
          error instanceof Error ? error : new Error(String(error)),
          { requestId, productName, size },
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
   * Get smart measurement suggestions for a profile
   */
  public getSmartMeasurementSuggestions = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const { productName, size, profileType, limit = 10 } = req.query;

      logger.info("[CuttingList] Getting smart measurement suggestions", {
        requestId,
        profileType,
      });

      try {
        if (!profileType || typeof profileType !== "string") {
          res
            .status(400)
            .json(
              this.createResponse(
                false,
                undefined,
                "Profile type is required",
                requestId,
              ),
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
              this.createResponse(
                true,
                {
                  data: profileSpecificSuggestions,
                  source: "context-aware",
                  contextInsights: allSuggestions.map(
                    (s: ProfileSuggestion) => s.reasoning,
                  ),
                },
                undefined,
                requestId,
              ),
            );
            return;
          }
        }

        // Fallback to empty suggestions - will be populated from real data sources
        res.json(
          this.createResponse(
            true,
            {
              data: [],
              source: "real-data-sources",
              profileType: profileType.toUpperCase(),
            },
            undefined,
            requestId,
          ),
        );
      } catch (error) {
        logger.error(
          "[CuttingList] Error getting smart measurement suggestions",
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
            this.createResponse(
              false,
              undefined,
              "Product name is required",
              requestId,
            ),
          );
        return;
      }

      logger.info(`[${requestId}] Getting sizes for product: ${productName}`);

      try {
        // ✅ NEW: Using UnifiedSuggestionService
        const suggestionService = UnifiedSuggestionService.getInstance();
        const suggestions =
          await suggestionService.getSizeSuggestions(productName);
        const sizeStrings = suggestions.map((s: SmartSuggestion) => s.value);
        logger.debug("[CuttingList] Returning sizes", {
          requestId,
          sizes: sizeStrings,
        });
        res.json(this.createResponse(true, sizeStrings, undefined, requestId));
      } catch (error) {
        logger.error(
          "[CuttingList] Error getting product sizes",
          error instanceof Error ? error : new Error(String(error)),
          { requestId, productName },
        );
        res
          .status(500)
          .json(
            this.createResponse(
              false,
              undefined,
              "Failed to get product sizes",
              requestId,
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
            this.createResponse(
              false,
              undefined,
              "Product name is required",
              requestId,
            ),
          );
        return;
      }

      if (!size || typeof size !== "string") {
        res
          .status(400)
          .json(
            this.createResponse(
              false,
              undefined,
              "Size is required",
              requestId,
            ),
          );
        return;
      }

      const orderQty =
        orderQuantity && typeof orderQuantity === "string"
          ? parseInt(orderQuantity)
          : undefined;

      logger.info("[CuttingList] Getting complete profile set", {
        requestId,
        productName,
        size,
        orderQty: orderQty || "auto",
      });

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
        res.json(this.createResponse(true, profileSet, undefined, requestId));
      } catch (error) {
        logger.error(
          "[CuttingList] Error getting complete profile set",
          error instanceof Error ? error : new Error(String(error)),
          { requestId, productName, size },
        );
        res
          .status(500)
          .json(
            this.createResponse(
              false,
              undefined,
              "Failed to get complete profile set",
              requestId,
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

      logger.info("[CuttingList] Getting enterprise suggestion statistics", {
        requestId,
      });

      try {
        // ✅ NEW: Using UnifiedSuggestionService
        const suggestionService = UnifiedSuggestionService.getInstance();
        const stats = await suggestionService.getStatistics();

        res.json(this.createResponse(true, stats, undefined, requestId));
      } catch (error) {
        logger.error(
          "[CuttingList] Error getting enterprise stats",
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
   * Refresh enterprise analysis
   */
  public refreshEnterpriseAnalysis = this.asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();

      logger.info("[CuttingList] Refreshing enterprise analysis", {
        requestId,
      });

      try {
        // ✅ NEW: PostgreSQL-based system doesn't need manual refresh
        // Data is always fresh from database
        res.json(
          this.createResponse(
            true,
            {
              message:
                "Analysis refreshed successfully (PostgreSQL auto-refresh)",
            },
            undefined,
            requestId,
          ),
        );
      } catch (error) {
        logger.error(
          "[CuttingList] Error refreshing enterprise analysis",
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
   * Get profile variations for a product and size
   */
  public getProfileVariations = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const { productName, size } = req.query;

      logger.info("[CuttingList] Getting profile variations", {
        requestId,
        productName,
        size,
      });

      try {
        // Validate input
        if (!productName || typeof productName !== "string") {
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

        if (!size || typeof size !== "string") {
          res
            .status(400)
            .json(
              this.createResponse(
                false,
                undefined,
                "Size is required",
                requestId,
              ),
            );
          return;
        }

        const variations = this.profileSuggestionService.getProfileVariations(
          productName,
          size,
        );

        logger.debug("[CuttingList] Found profile variations", {
          requestId,
          count: variations.length,
        });

        res.json(
          this.createResponse(true, { variations }, undefined, requestId),
        );
      } catch (error) {
        logger.error(
          "[CuttingList] Error getting profile variations",
          error instanceof Error ? error : new Error(String(error)),
          { requestId, productName, size },
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
   * Get profile suggestions for a product and size
   */
  public getProfileSuggestions = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const { productName, size, limit = 5 } = req.query;

      logger.info("[CuttingList] Getting profile suggestions", {
        requestId,
        productName,
        size,
      });

      try {
        // Validate input
        if (!productName || typeof productName !== "string") {
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

        if (!size || typeof size !== "string") {
          res
            .status(400)
            .json(
              this.createResponse(
                false,
                undefined,
                "Size is required",
                requestId,
              ),
            );
          return;
        }

        const limitNumber = parseInt(limit as string) || 15;
        const suggestions = this.profileSuggestionService.getProfileSuggestions(
          productName,
          size,
          limitNumber,
        );

        logger.debug("[CuttingList] Found profile suggestions", {
          requestId,
          count: suggestions.length,
        });

        res.json(
          this.createResponse(true, { suggestions }, undefined, requestId),
        );
      } catch (error) {
        logger.error(
          "[CuttingList] Error getting profile suggestions",
          error instanceof Error ? error : new Error(String(error)),
          { requestId, productName, size },
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
   * Search for similar products
   */
  public searchSimilarProducts = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const { searchTerm } = req.query;

      logger.info("[CuttingList] Searching for products", {
        requestId,
        searchTerm,
      });

      try {
        // Validate input
        if (!searchTerm || typeof searchTerm !== "string") {
          res
            .status(400)
            .json(
              this.createResponse(
                false,
                undefined,
                "Search term is required",
                requestId,
              ),
            );
          return;
        }

        const similarProducts =
          this.profileSuggestionService.searchSimilarProducts(searchTerm);

        logger.debug("[CuttingList] Found similar products", {
          requestId,
          count: similarProducts.length,
        });

        res.json(
          this.createResponse(
            true,
            { products: similarProducts },
            undefined,
            requestId,
          ),
        );
      } catch (error) {
        logger.error(
          "[CuttingList] Error searching products",
          error instanceof Error ? error : new Error(String(error)),
          { requestId, searchTerm },
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
   * Get sizes for a specific product
   */
  public getSizesForProduct = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const { productName } = req.query;

      logger.info(`[${requestId}] Getting sizes for product: ${productName}`);

      try {
        // Validate input
        if (!productName || typeof productName !== "string") {
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

        const sizes =
          this.profileSuggestionService.getSizesForProduct(productName);

        logger.debug("[CuttingList] Found sizes for product", {
          requestId,
          count: sizes.length,
        });

        res.json(this.createResponse(true, { sizes }, undefined, requestId));
      } catch (error) {
        logger.error(
          "[CuttingList] Error getting sizes",
          error instanceof Error ? error : new Error(String(error)),
          { requestId, productName },
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
   * Get profile suggestion database statistics
   */
  public getProfileSuggestionStats = this.asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      logger.info("[CuttingList] Getting profile suggestion statistics", {
        requestId,
      });

      try {
        const stats = this.profileSuggestionService.getDatabaseStats();
        const allSuggestions =
          this.profileSuggestionService.getAllProductSizeSuggestions();

        logger.debug("[CuttingList] Retrieved statistics", {
          requestId,
          suggestionsCount: allSuggestions.length,
        });

        res.json(
          this.createResponse(
            true,
            {
              stats,
              productSizeCombinations: allSuggestions.slice(0, 20), // Limit to top 20
            },
            undefined,
            requestId,
          ),
        );
      } catch (error) {
        logger.error(
          "[CuttingList] Error getting statistics",
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
