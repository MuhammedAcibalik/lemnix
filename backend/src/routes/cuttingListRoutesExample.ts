/**
 * Cutting List Routes - Example Implementation with Phase 1 Improvements
 * Demonstrates use of validation middleware and standardized responses
 *
 * @module routes/cuttingListRoutesExample
 * @version 2.0.0
 *
 * This file shows how to apply Phase 1 improvements:
 * - Zod validation middleware
 * - Standardized API responses
 * - Request tracking
 * - Type-safe error handling
 */

import { Router, Request, Response, type RequestHandler } from "express";
import { z } from "zod";

// Import validation schemas
import {
  createCuttingListSchema,
  updateCuttingListSchema,
  addProductSectionSchema,
  addItemSchema,
  updateItemSchema,
  paginationSchema,
  cuttingListFilterSchema,
} from "../middleware/validation/cuttingListSchemas";

// Import validation middleware
import {
  validateBody,
  validateQuery,
  validateParams,
  composeValidations,
  getValidatedData,
} from "../middleware/validation/validationMiddleware";

// Import request tracking
import requestTrackingMiddleware from "../middleware/requestTracking";

// Import response helpers
import {
  sendSuccess,
  sendError,
  sendPaginated,
  CuttingListErrorCode,
  createPaginationMeta,
} from "../types/apiResponse";

// Import repository (example)
// import { CuttingListRepository } from '../repositories/CuttingListRepository';

const router: Router = Router();

// Apply request tracking to all routes
router.use(requestTrackingMiddleware);

// ============================================================================
// ROUTE PARAMETER SCHEMAS
// ============================================================================

const idParamSchema = z.object({
  id: z.string().cuid(),
});

const sectionParamsSchema = z.object({
  listId: z.string().cuid(),
  sectionId: z.string().uuid(),
});

const itemParamsSchema = z.object({
  listId: z.string().cuid(),
  sectionId: z.string().uuid(),
  itemId: z.string().cuid(),
});

// ============================================================================
// CRUD ENDPOINTS - EXAMPLE IMPLEMENTATIONS
// ============================================================================

/**
 * GET /api/cutting-list
 * List cutting lists with pagination and filtering
 */
router.get(
  "/",
  validateQuery(paginationSchema.merge(cuttingListFilterSchema)),
  async (req: Request, res: Response) => {
    try {
      const query = getValidatedData<{
        page: number;
        pageSize: number;
        sortBy: string;
        order: "asc" | "desc";
        status?: string[];
        weekNumber?: number | number[];
        search?: string;
      }>(req);

      // Example: Fetch from repository
      // const { data, total } = await repository.findPaginated(query);

      // Mock data for example
      const data: any[] = [];
      const total = 0;

      const pagination = createPaginationMeta(
        query.page,
        query.pageSize,
        total,
      );

      sendPaginated(res, data, pagination);
    } catch (error) {
      sendError(
        res,
        CuttingListErrorCode.INTERNAL_ERROR,
        "Failed to fetch cutting lists",
        { error: (error as Error).message },
      );
    }
  },
);

/**
 * GET /api/cutting-list/:id
 * Get a single cutting list by ID
 */
router.get(
  "/:id",
  validateParams(idParamSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = getValidatedData<{ id: string }>(req);

      // Example: Fetch from repository
      // const list = await repository.findById(id);
      const list = null; // Mock

      if (!list) {
        return sendError(
          res,
          CuttingListErrorCode.NOT_FOUND,
          "Cutting list not found",
          { id },
          404,
        );
      }

      sendSuccess(res, list);
    } catch (error) {
      sendError(
        res,
        CuttingListErrorCode.INTERNAL_ERROR,
        "Failed to fetch cutting list",
        { error: (error as Error).message },
      );
    }
  },
);

/**
 * POST /api/cutting-list
 * Create a new cutting list
 */
router.post(
  "/",
  validateBody(createCuttingListSchema),
  async (req: Request, res: Response) => {
    try {
      const data = getValidatedData<{
        name: string;
        weekNumber: number;
        description?: string;
      }>(req);

      // Example: Create via repository
      // const list = await repository.create(data);

      // Mock response
      const list = {
        id: "new-id",
        ...data,
        status: "DRAFT" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      sendSuccess(res, list, 201);
    } catch (error) {
      const err = error as any;

      // Handle duplicate week number
      if (err.code === "P2002") {
        return sendError(
          res,
          CuttingListErrorCode.DUPLICATE_WEEK_NUMBER,
          "A cutting list already exists for this week",
          { weekNumber: req.body.weekNumber },
          409,
        );
      }

      sendError(
        res,
        CuttingListErrorCode.INTERNAL_ERROR,
        "Failed to create cutting list",
        { error: err.message },
      );
    }
  },
);

/**
 * PUT /api/cutting-list/:id
 * Update a cutting list
 */
router.put(
  "/:id",
  ...composeValidations({
    params: idParamSchema,
    body: updateCuttingListSchema,
  }),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = getValidatedData<{
        name?: string;
        description?: string;
        status?: string;
      }>(req);

      // Example: Update via repository
      // const list = await repository.update(id, updates);

      const list = { id, ...updates }; // Mock

      sendSuccess(res, list);
    } catch (error) {
      sendError(
        res,
        CuttingListErrorCode.INTERNAL_ERROR,
        "Failed to update cutting list",
        { error: (error as Error).message },
      );
    }
  },
);

/**
 * DELETE /api/cutting-list/:id
 * Delete a cutting list
 */
router.delete(
  "/:id",
  validateParams(idParamSchema),
  async (req: Request, res: Response) => {
    try {
      const { id } = getValidatedData<{ id: string }>(req);

      // Example: Delete via repository
      // await repository.delete(id);

      sendSuccess(res, {
        message: "Cutting list deleted successfully",
        deletedId: id,
      });
    } catch (error) {
      sendError(
        res,
        CuttingListErrorCode.INTERNAL_ERROR,
        "Failed to delete cutting list",
        { error: (error as Error).message },
      );
    }
  },
);

// ============================================================================
// SECTION ENDPOINTS - EXAMPLE IMPLEMENTATIONS
// ============================================================================

/**
 * POST /api/cutting-list/:listId/sections
 * Add a product section
 */
router.post(
  "/:listId/sections",
  ...composeValidations({
    params: z.object({ listId: z.string().cuid() }),
    body: addProductSectionSchema,
  }),
  async (req: Request, res: Response) => {
    try {
      const { listId } = req.params;
      const data = getValidatedData<{ productName: string }>(req);

      // Example: Add section
      const section = {
        id: "section-id",
        ...data,
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      sendSuccess(res, section, 201);
    } catch (error) {
      sendError(
        res,
        CuttingListErrorCode.INTERNAL_ERROR,
        "Failed to add section",
        { error: (error as Error).message },
      );
    }
  },
);

/**
 * DELETE /api/cutting-list/:listId/sections/:sectionId
 * Delete a section
 */
router.delete(
  "/:listId/sections/:sectionId",
  validateParams(sectionParamsSchema),
  async (req: Request, res: Response) => {
    try {
      const { listId, sectionId } = getValidatedData<{
        listId: string;
        sectionId: string;
      }>(req);

      // Example: Delete section
      // await repository.deleteSection(listId, sectionId);

      sendSuccess(res, {
        message: "Section deleted successfully",
        deletedId: sectionId,
      });
    } catch (error) {
      sendError(
        res,
        CuttingListErrorCode.INTERNAL_ERROR,
        "Failed to delete section",
        { error: (error as Error).message },
      );
    }
  },
);

// ============================================================================
// ITEM ENDPOINTS - EXAMPLE IMPLEMENTATIONS
// ============================================================================

/**
 * POST /api/cutting-list/:listId/sections/:sectionId/items
 * Add an item to a section
 */
router.post(
  "/:listId/sections/:sectionId/items",
  ...composeValidations({
    params: sectionParamsSchema,
    body: addItemSchema,
  }),
  async (req: Request, res: Response) => {
    try {
      const { listId, sectionId } = req.params;
      const data = getValidatedData<any>(req);

      // Example: Add item
      const item = {
        id: "item-id",
        ...data,
        cuttingListId: listId,
        sectionId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      sendSuccess(res, item, 201);
    } catch (error) {
      sendError(
        res,
        CuttingListErrorCode.INTERNAL_ERROR,
        "Failed to add item",
        { error: (error as Error).message },
      );
    }
  },
);

/**
 * PUT /api/cutting-list/:listId/sections/:sectionId/items/:itemId
 * Update an item
 */
router.put(
  "/:listId/sections/:sectionId/items/:itemId",
  ...composeValidations({
    params: itemParamsSchema,
    body: updateItemSchema,
  }),
  async (req: Request, res: Response) => {
    try {
      const { itemId } = req.params;
      const updates = getValidatedData<any>(req);

      // Example: Update item
      const item = { id: itemId, ...updates };

      sendSuccess(res, item);
    } catch (error) {
      sendError(
        res,
        CuttingListErrorCode.INTERNAL_ERROR,
        "Failed to update item",
        { error: (error as Error).message },
      );
    }
  },
);

/**
 * DELETE /api/cutting-list/:listId/sections/:sectionId/items/:itemId
 * Delete an item
 */
router.delete(
  "/:listId/sections/:sectionId/items/:itemId",
  validateParams(itemParamsSchema),
  async (req: Request, res: Response) => {
    try {
      const { itemId } = getValidatedData<{
        listId: string;
        sectionId: string;
        itemId: string;
      }>(req);

      // Example: Delete item
      // await repository.deleteItem(itemId);

      sendSuccess(res, {
        message: "Item deleted successfully",
        deletedId: itemId,
      });
    } catch (error) {
      sendError(
        res,
        CuttingListErrorCode.INTERNAL_ERROR,
        "Failed to delete item",
        { error: (error as Error).message },
      );
    }
  },
);

export default router;
