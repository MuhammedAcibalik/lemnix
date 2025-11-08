/**
 * @fileoverview Zod Validation Middleware
 * @module ZodValidationMiddleware
 * @version 1.0.0
 * 
 * ✅ MIGRATION: express-validator → Zod
 * ✅ ALIGNMENT: Shared schemas with frontend
 * ✅ TYPE SAFETY: Full TypeScript inference
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodSchema } from 'zod';
import { logger } from '../services/logger';

/**
 * Zod validation result
 */
interface ValidationResult<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly errors?: ReadonlyArray<{
    readonly field: string;
    readonly message: string;
    readonly code: string;
  }>;
}

/**
 * Create Zod validation middleware
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated; // Replace with validated data
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        logger.warn('[VALIDATION] Request validation failed', {
          url: req.url,
          method: req.method,
          errors,
          ip: req.ip,
        });

        res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: errors,
          },
        });
        return;
      }

      // Unknown error
      logger.error('[VALIDATION] Unexpected validation error', { error });
      res.status(500).json({
        success: false,
        error: {
          message: 'Internal validation error',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  };
}

/**
 * Validate query parameters
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated as Record<string, string | string[] | undefined>;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        res.status(400).json({
          success: false,
          error: {
            message: 'Query validation failed',
            code: 'VALIDATION_ERROR',
            details: errors,
          },
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          message: 'Internal validation error',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  };
}

/**
 * Validate path parameters
 */
export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.params);
      req.params = validated as Record<string, string>;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        res.status(400).json({
          success: false,
          error: {
            message: 'Path parameter validation failed',
            code: 'VALIDATION_ERROR',
            details: errors,
          },
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          message: 'Internal validation error',
          code: 'INTERNAL_ERROR',
        },
      });
    }
  };
}

// ============================================================================
// SHARED ZOD SCHEMAS (aligned with frontend)
// ============================================================================

/**
 * Profile item schema
 */
export const profileItemSchema = z.object({
  id: z.string().min(1),
  profile: z.string().min(1).max(50).optional(),
  measurement: z.string().min(1).max(20),
  quantity: z.number().int().positive().max(1000),
});

/**
 * Cutting list item schema
 * ✅ ALIGNED with frontend WorkOrderItem
 */
export const cuttingListItemSchema = z.object({
  id: z.string().min(1).max(50),
  workOrderId: z.string().min(1).max(50).trim(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  version: z.string().min(1).max(20).trim(),
  color: z.string().min(1).max(30).trim(),
  note: z.string().max(500).trim().optional(),
  orderQuantity: z.number().int().positive().max(10000),
  size: z.string().min(1).max(20).trim(),
  profiles: z.array(profileItemSchema).min(1),
  status: z.enum(['draft', 'ready', 'processing', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
});

/**
 * Product section schema
 */
export const productSectionSchema = z.object({
  id: z.string().min(1),
  productName: z.string().min(1).max(100).trim(),
  items: z.array(cuttingListItemSchema),
});

/**
 * Cutting list schema
 */
export const cuttingListSchema = z.object({
  id: z.string().min(1).optional(),
  title: z.string().min(1).max(200).trim(),
  weekNumber: z.number().int().min(1).max(53),
  sections: z.array(productSectionSchema),
});

/**
 * Optimization objective schema
 * ✅ ALIGNED with frontend
 */
export const optimizationObjectiveSchema = z.object({
  type: z.enum(['minimize-waste', 'maximize-efficiency', 'minimize-cost', 'minimize-time']),
  weight: z.number().min(0).max(1),
  priority: z.enum(['low', 'medium', 'high']),
});

/**
 * Optimization constraints schema
 * ✅ ALIGNED with frontend
 */
export const optimizationConstraintsSchema = z.object({
  kerfWidth: z.number().min(0.1).max(10),
  startSafety: z.number().min(0).max(50),
  endSafety: z.number().min(0).max(50),
  minScrapLength: z.number().min(10).max(500),
  maxWastePercentage: z.number().min(1).max(50),
  maxCutsPerStock: z.number().int().min(1).max(100),
  allowPartialStocks: z.boolean().optional(),
  prioritizeSmallWaste: z.boolean().optional(),
});

/**
 * Performance settings schema
 * ✅ ALIGNED with frontend (GA v1.7.1 support)
 */
export const performanceSettingsSchema = z.object({
  maxExecutionTime: z.number().int().min(10).max(300).optional(),
  parallelProcessing: z.boolean().optional(),
  cacheResults: z.boolean().optional(),
  
  // GA-specific
  populationSize: z.number().int().min(10).max(100).optional(),
  generations: z.number().int().min(10).max(200).optional(),
  mutationRate: z.number().min(0.01).max(0.5).optional(),
  crossoverRate: z.number().min(0.5).max(1.0).optional(),
});

/**
 * Cost model schema
 */
export const costModelSchema = z.object({
  materialCostPerMeter: z.number().min(0),
  cuttingCostPerCut: z.number().min(0),
  setupCostPerStock: z.number().min(0),
  laborCostPerHour: z.number().min(0),
  wasteCostPerMeter: z.number().min(0),
});

/**
 * Optimization item schema
 */
export const optimizationItemSchema = z.object({
  id: z.string().min(1),
  workOrderId: z.string().min(1),
  profileType: z.string().min(1).max(50),
  length: z.number().positive().max(20000),
  quantity: z.number().int().positive().max(1000),
  color: z.string().max(30).optional(),
  version: z.string().max(20).optional(),
  size: z.string().max(20).optional(),
  note: z.string().max(500).optional(),
});

/**
 * Material stock length schema
 */
export const materialStockLengthSchema = z.object({
  profileType: z.string().min(1),
  stockLength: z.number().min(1000).max(20000),
});

/**
 * Optimization parameters schema
 */
export const optimizationParamsSchema = z.object({
  algorithm: z.enum(['ffd', 'bfd', 'genetic', 'pooling']),
  objectives: z.array(optimizationObjectiveSchema).min(1),
  constraints: optimizationConstraintsSchema,
  performance: performanceSettingsSchema.optional(),
  costModel: costModelSchema.optional(),
});

/**
 * Complete optimization request schema
 */
export const optimizationRequestSchema = z.object({
  items: z.array(optimizationItemSchema).min(1),
  params: optimizationParamsSchema,
  materialStockLengths: z.array(materialStockLengthSchema).optional(),
});

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(1000)).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
});

/**
 * ID parameter schema
 */
export const idParamSchema = z.object({
  id: z.string().min(1).max(50),
});

/**
 * Search query schema
 */
export const searchQuerySchema = z.object({
  search: z.string().max(100).trim().optional(),
});

/**
 * Helper: Sanitize string (XSS prevention)
 */
export const sanitizedStringSchema = (maxLength: number = 255) =>
  z.string()
    .trim()
    .transform((val) =>
      val
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/data:/gi, '')
        .replace(/vbscript:/gi, '')
        .substring(0, maxLength)
    );

/**
 * Helper: Validate and parse
 */
export function validateAndParse<T>(
  schema: ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const validated = schema.parse(data);
    return {
      success: true,
      data: validated,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        errors: error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        })),
      };
    }

    return {
      success: false,
      errors: [
        {
          field: 'unknown',
          message: 'Validation failed',
          code: 'UNKNOWN_ERROR',
        },
      ],
    };
  }
}
