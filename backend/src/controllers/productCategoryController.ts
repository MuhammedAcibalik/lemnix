/**
 * Product Category Controller
 * Handles HTTP requests for product category operations
 *
 * @module controllers/productCategoryController
 * @version 1.0.0
 */

import { Request, Response } from "express";
import { productCategoryRepository } from "../repositories/ProductCategoryRepository";
import { logger } from "../services/logger";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface ApiResponse<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly message?: string;
  readonly timestamp: string;
}

// ============================================================================
// CONTROLLER CLASS
// ============================================================================

export class ProductCategoryController {
  private requestCounter: number = 0;

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    this.requestCounter++;
    return `REQ-${Date.now()}-${this.requestCounter}`;
  }

  /**
   * Create standardized API response
   */
  private createResponse<T>(
    success: boolean,
    data?: T,
    error?: string,
    message?: string,
  ): ApiResponse<T> {
    return {
      success,
      data,
      error,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Async handler wrapper for error handling
   */
  private asyncHandler = (
    fn: (req: Request, res: Response) => Promise<void>,
  ) => {
    return async (req: Request, res: Response): Promise<void> => {
      try {
        await fn(req, res);
      } catch (error) {
        const requestId = this.generateRequestId();
        logger.error(`[${requestId}] Controller error`, {
          error,
          path: req.path,
        });
        const errorMessage =
          error instanceof Error ? error.message : "Internal server error";
        res
          .status(500)
          .json(this.createResponse(false, undefined, errorMessage));
      }
    };
  };

  // ==========================================================================
  // CRUD ENDPOINTS
  // ==========================================================================

  /**
   * GET /api/product-categories
   * Get all product categories
   */
  public getAllCategories = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      logger.info(`[${requestId}] Getting all product categories`);

      try {
        const categories = await productCategoryRepository.findAll();

        logger.info(`[${requestId}] Retrieved ${categories.length} categories`);

        res.json(
          this.createResponse(
            true,
            categories,
            undefined,
            "Categories retrieved successfully",
          ),
        );
      } catch (error) {
        logger.error(`[${requestId}] Failed to get categories`, { error });
        throw error;
      }
    },
  );

  /**
   * GET /api/product-categories/:id
   * Get category by ID
   */
  public getCategoryById = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const { id } = req.params;

      logger.info(`[${requestId}] Getting category by ID: ${id}`);

      try {
        const category = await productCategoryRepository.findById(id);

        if (!category) {
          res
            .status(404)
            .json(this.createResponse(false, undefined, "Category not found"));
          return;
        }

        logger.info(`[${requestId}] Category retrieved: ${category.name}`);

        res.json(
          this.createResponse(
            true,
            category,
            undefined,
            "Category retrieved successfully",
          ),
        );
      } catch (error) {
        logger.error(`[${requestId}] Failed to get category`, { error, id });
        throw error;
      }
    },
  );

  /**
   * POST /api/product-categories
   * Create a new category
   */
  public createCategory = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const { name, description } = req.body;

      logger.info(`[${requestId}] Creating category: ${name}`);

      try {
        if (!name || typeof name !== "string" || !name.trim()) {
          res
            .status(400)
            .json(
              this.createResponse(
                false,
                undefined,
                "Category name is required",
              ),
            );
          return;
        }

        const category = await productCategoryRepository.create({
          name: name.trim(),
          description: description?.trim(),
        });

        logger.info(`[${requestId}] Category created: ${category.id}`);

        res
          .status(201)
          .json(
            this.createResponse(
              true,
              category,
              undefined,
              "Category created successfully",
            ),
          );
      } catch (error) {
        logger.error(`[${requestId}] Failed to create category`, {
          error,
          name,
        });
        throw error;
      }
    },
  );

  /**
   * PUT /api/product-categories/:id
   * Update category
   */
  public updateCategory = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const { id } = req.params;
      const { name, description } = req.body;

      logger.info(`[${requestId}] Updating category: ${id}`);

      try {
        const category = await productCategoryRepository.update(id, {
          name: name?.trim(),
          description: description?.trim(),
        });

        logger.info(`[${requestId}] Category updated: ${category.id}`);

        res.json(
          this.createResponse(
            true,
            category,
            undefined,
            "Category updated successfully",
          ),
        );
      } catch (error) {
        logger.error(`[${requestId}] Failed to update category`, { error, id });
        throw error;
      }
    },
  );

  /**
   * DELETE /api/product-categories/:id
   * Delete category
   */
  public deleteCategory = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const { id } = req.params;

      logger.info(`[${requestId}] Deleting category: ${id}`);

      try {
        await productCategoryRepository.delete(id);

        logger.info(`[${requestId}] Category deleted: ${id}`);

        res.json(
          this.createResponse(
            true,
            undefined,
            undefined,
            "Category deleted successfully",
          ),
        );
      } catch (error) {
        logger.error(`[${requestId}] Failed to delete category`, { error, id });
        throw error;
      }
    },
  );

  // ==========================================================================
  // PRODUCT MAPPING ENDPOINTS
  // ==========================================================================

  /**
   * GET /api/product-categories/product/:productName
   * Get category by product name
   */
  public getCategoryByProduct = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const { productName } = req.params;

      // Express automatically decodes URL parameters, but handle edge cases
      const decodedProductName = productName
        ? decodeURIComponent(productName)
        : "";

      logger.info(`[${requestId}] Getting category for product`, {
        raw: productName,
        decoded: decodedProductName,
      });

      try {
        if (
          !decodedProductName ||
          typeof decodedProductName !== "string" ||
          decodedProductName.trim().length === 0
        ) {
          res
            .status(400)
            .json(
              this.createResponse(false, undefined, "Product name is required"),
            );
          return;
        }

        const category =
          await productCategoryRepository.getCategoryByProductName(
            decodedProductName.trim(),
          );

        if (!category) {
          res
            .status(404)
            .json(
              this.createResponse(
                false,
                undefined,
                "Category not found for this product",
              ),
            );
          return;
        }

        logger.info(`[${requestId}] Category found: ${category.name}`);

        res.json(
          this.createResponse(
            true,
            category,
            undefined,
            "Category retrieved successfully",
          ),
        );
      } catch (error) {
        logger.error(`[${requestId}] Failed to get category by product`, {
          error,
          productName,
        });
        throw error;
      }
    },
  );

  /**
   * POST /api/product-categories/map
   * Map product to category
   */
  public mapProductToCategory = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const { productName, categoryId } = req.body;

      logger.info(`[${requestId}] Mapping product to category`, {
        productName,
        categoryId,
      });

      try {
        if (
          !productName ||
          typeof productName !== "string" ||
          !productName.trim()
        ) {
          res
            .status(400)
            .json(
              this.createResponse(false, undefined, "Product name is required"),
            );
          return;
        }

        if (
          !categoryId ||
          typeof categoryId !== "string" ||
          !categoryId.trim()
        ) {
          res
            .status(400)
            .json(
              this.createResponse(false, undefined, "Category ID is required"),
            );
          return;
        }

        const mapping = await productCategoryRepository.mapProductToCategory(
          productName.trim(),
          categoryId.trim(),
        );

        logger.info(`[${requestId}] Product mapped successfully`);

        res
          .status(201)
          .json(
            this.createResponse(
              true,
              mapping,
              undefined,
              "Product mapped to category successfully",
            ),
          );
      } catch (error) {
        logger.error(`[${requestId}] Failed to map product to category`, {
          error,
          productName,
          categoryId,
        });
        throw error;
      }
    },
  );

  /**
   * GET /api/product-categories/:id/products
   * Get products by category
   */
  public getProductsByCategory = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();
      const { id } = req.params;

      logger.info(`[${requestId}] Getting products for category: ${id}`);

      try {
        const products =
          await productCategoryRepository.getProductsByCategory(id);

        logger.info(`[${requestId}] Retrieved ${products.length} products`);

        res.json(
          this.createResponse(
            true,
            products,
            undefined,
            "Products retrieved successfully",
          ),
        );
      } catch (error) {
        logger.error(`[${requestId}] Failed to get products by category`, {
          error,
          id,
        });
        throw error;
      }
    },
  );
}

// Export singleton instance
export const productCategoryController = new ProductCategoryController();
