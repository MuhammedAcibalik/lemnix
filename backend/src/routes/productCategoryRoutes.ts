/**
 * Product Category Routes
 * API endpoints for product category management
 *
 * @module routes/productCategoryRoutes
 * @version 1.0.0
 */

import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { productCategoryController } from "../controllers/productCategoryController";
import { verifyToken } from "../middleware/authorization";

const router: ExpressRouter = Router();

// All routes require authentication
router.use(verifyToken);

// ============================================================================
// CRUD ROUTES
// ============================================================================

/**
 * GET /api/product-categories
 * Get all product categories
 */
router.get("/", productCategoryController.getAllCategories);

/**
 * POST /api/product-categories
 * Create a new category
 */
router.post("/", productCategoryController.createCategory);

/**
 * POST /api/product-categories/map
 * Map product to category
 */
router.post("/map", productCategoryController.mapProductToCategory);

// ============================================================================
// PRODUCT MAPPING ROUTES (Must be before /:id routes)
// ============================================================================

/**
 * GET /api/product-categories/product/:productName
 * Get category by product name
 * IMPORTANT: This must come before /:id route to avoid route conflicts
 */
router.get(
  "/product/:productName",
  productCategoryController.getCategoryByProduct,
);

/**
 * GET /api/product-categories/:id/products
 * Get products by category
 * IMPORTANT: This must come before /:id route to avoid route conflicts
 */
router.get("/:id/products", productCategoryController.getProductsByCategory);

// ============================================================================
// ID-BASED ROUTES (Must be last to avoid conflicts)
// ============================================================================

/**
 * GET /api/product-categories/:id
 * Get category by ID
 */
router.get("/:id", productCategoryController.getCategoryById);

/**
 * PUT /api/product-categories/:id
 * Update category
 */
router.put("/:id", productCategoryController.updateCategory);

/**
 * DELETE /api/product-categories/:id
 * Delete category
 */
router.delete("/:id", productCategoryController.deleteCategory);

export default router;
