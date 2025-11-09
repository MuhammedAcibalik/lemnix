/**
 * Cutting List Validation Schemas (Phase 1 Implementation)
 * Using Zod for runtime type validation
 * 
 * @module middleware/validation/cuttingListSchemas
 * @version 1.0.0
 */

import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { CuttingListStatus, ItemPriority } from '../../types';

// ============================================================================
// ENUM SCHEMAS
// ============================================================================

export const CuttingListStatusSchema = z.nativeEnum(CuttingListStatus, {
  errorMap: () => ({ 
    message: 'Status must be one of: DRAFT, READY, PROCESSING, COMPLETED, ARCHIVED' 
  })
});

export const ItemPrioritySchema = z.nativeEnum(ItemPriority, {
  errorMap: () => ({ 
    message: 'Priority must be one of: LOW, MEDIUM, HIGH, URGENT' 
  })
});

// ============================================================================
// CREATE CUTTING LIST SCHEMA
// ============================================================================

export const createCuttingListSchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  weekNumber: z.number()
    .int('Week number must be an integer')
    .min(1, 'Week number must be at least 1')
    .max(53, 'Week number must be at most 53'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  status: CuttingListStatusSchema.optional().default(CuttingListStatus.DRAFT)
});

export type CreateCuttingListInput = z.infer<typeof createCuttingListSchema>;

// ============================================================================
// UPDATE CUTTING LIST SCHEMA
// ============================================================================

export const updateCuttingListSchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim()
    .optional(),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  status: CuttingListStatusSchema.optional()
});

export type UpdateCuttingListInput = z.infer<typeof updateCuttingListSchema>;

// ============================================================================
// ADD PRODUCT SECTION SCHEMA
// ============================================================================

export const addProductSectionSchema = z.object({
  productName: z.string()
    .min(1, 'Product name is required')
    .max(100, 'Product name must be less than 100 characters')
    .trim()
});

export type AddProductSectionInput = z.infer<typeof addProductSectionSchema>;

// ============================================================================
// PROFILE SCHEMA
// ============================================================================

export const profileSchema = z.object({
  id: z.string().optional(),
  profile: z.string()
    .min(1, 'Profile type is required')
    .trim(),
  measurement: z.string()
    .regex(/^\d+mm$/, 'Measurement must be in format: {number}mm (e.g., 2500mm)')
    .trim(),
  quantity: z.number()
    .int('Quantity must be an integer')
    .positive('Quantity must be positive')
});

export type ProfileInput = z.infer<typeof profileSchema>;

// ============================================================================
// ADD ITEM SCHEMA
// ============================================================================

export const addItemSchema = z.object({
  workOrderId: z.string()
    .min(1, 'Work order ID is required')
    .trim(),
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in format: YYYY-MM-DD')
    .optional(),
  version: z.string()
    .min(1, 'Version is required')
    .trim(),
  color: z.string()
    .min(1, 'Color is required')
    .trim(),
  size: z.string()
    .min(1, 'Size is required')
    .trim(),
  orderQuantity: z.number()
    .int('Order quantity must be an integer')
    .positive('Order quantity must be positive'),
  profiles: z.array(profileSchema)
    .min(1, 'At least one profile is required')
    .max(20, 'Maximum 20 profiles per item'),
  priority: ItemPrioritySchema.optional().default(ItemPriority.MEDIUM),
  status: CuttingListStatusSchema.optional().default(CuttingListStatus.DRAFT),
  note: z.string()
    .max(500, 'Note must be less than 500 characters')
    .optional()
});

export type AddItemInput = z.infer<typeof addItemSchema>;

// ============================================================================
// UPDATE ITEM SCHEMA
// ============================================================================

export const updateItemSchema = addItemSchema.partial().extend({
  workOrderId: z.string().min(1, 'Work order ID is required').trim()
});

export type UpdateItemInput = z.infer<typeof updateItemSchema>;

// ============================================================================
// QUERY PARAMETERS SCHEMAS
// ============================================================================

export const paginationSchema = z.object({
  page: z.number()
    .int('Page must be an integer')
    .min(1, 'Page must be at least 1')
    .optional()
    .default(1),
  pageSize: z.number()
    .int('Page size must be an integer')
    .min(1, 'Page size must be at least 1')
    .max(100, 'Page size must be at most 100')
    .optional()
    .default(20),
  sortBy: z.string().optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc')
});

export type PaginationParams = z.infer<typeof paginationSchema>;

export const cuttingListFilterSchema = z.object({
  status: z.array(CuttingListStatusSchema).optional(),
  weekNumber: z.union([
    z.number().int().min(1).max(53),
    z.array(z.number().int().min(1).max(53))
  ]).optional(),
  search: z.string().max(100).optional(),
  createdAfter: z.string().datetime().optional(),
  createdBefore: z.string().datetime().optional()
});

export type CuttingListFilters = z.infer<typeof cuttingListFilterSchema>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate and parse input with Zod schema
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      );
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
}

import { Request, Response, NextFunction } from 'express';

// ... rest of imports and code ...

/**
 * Create validation middleware for Express routes
 */
export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = validateInput(schema, req.body);
    if (!result.success) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: result.errors
        }
      });
      return;
    }
    (req as Request & { validatedData: T }).validatedData = result.data as T;
    next();
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  createCuttingListSchema,
  updateCuttingListSchema,
  addProductSectionSchema,
  addItemSchema,
  updateItemSchema,
  profileSchema,
  paginationSchema,
  cuttingListFilterSchema,
  validateInput,
  createValidationMiddleware
};
