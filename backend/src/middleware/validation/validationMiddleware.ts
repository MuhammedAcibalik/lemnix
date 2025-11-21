/**
 * Validation Middleware Wrapper (Phase 1, Step 3)
 * Integrates Zod validation with Express routes
 *
 * @module middleware/validation/validationMiddleware
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  sendError,
  CuttingListErrorCode,
  attachRequestId,
  attachStartTime,
} from "../../types/apiResponse";

/**
 * Extended Request type with validated data
 */
interface RequestWithValidatedData extends Request {
  validatedData?: unknown;
}

/**
 * Validation target options
 */
export type ValidationTarget = "body" | "query" | "params";

/**
 * Validation options
 */
export interface ValidationOptions {
  target?: ValidationTarget;
  stripUnknown?: boolean;
  abortEarly?: boolean;
}

/**
 * Create Express middleware for Zod schema validation
 *
 * @param schema - Zod schema to validate against
 * @param options - Validation options
 * @returns Express middleware function
 *
 * @example
 * ```typescript
 * import { createCuttingListSchema } from './cuttingListSchemas';
 *
 * router.post('/cutting-list',
 *   validateRequest(createCuttingListSchema),
 *   controller.createCuttingList
 * );
 * ```
 */
export function validateRequest<T extends z.ZodType>(
  schema: T,
  options: ValidationOptions = {},
): (req: Request, res: Response, next: NextFunction) => void {
  const { target = "body", stripUnknown = true } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    // Ensure request tracking
    attachRequestId(req);
    attachStartTime(req);

    try {
      // Get data to validate based on target
      const dataToValidate = req[target];

      // Parse and validate
      const validatedData = schema.parse(dataToValidate);

      // Attach validated data to request for controller access
      (req as RequestWithValidatedData).validatedData = validatedData;

      // If stripping unknown fields, replace original data
      if (stripUnknown) {
        req[target] = validatedData;
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format Zod errors for user-friendly response
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        }));

        // Send standardized validation error response
        return sendError(
          res,
          CuttingListErrorCode.VALIDATION_ERROR,
          "Request validation failed",
          { errors },
          400,
        );
      }

      // Unexpected error during validation
      return sendError(
        res,
        CuttingListErrorCode.INTERNAL_ERROR,
        "Validation processing error",
        { error: (error as Error).message },
        500,
      );
    }
  };
}

/**
 * Validate query parameters
 *
 * @example
 * ```typescript
 * router.get('/cutting-list',
 *   validateQuery(paginationSchema),
 *   controller.listCuttingLists
 * );
 * ```
 */
export function validateQuery<T extends z.ZodType>(schema: T) {
  return validateRequest(schema, { target: "query" });
}

/**
 * Validate route parameters
 *
 * @example
 * ```typescript
 * const idSchema = z.object({ id: z.string().cuid() });
 *
 * router.get('/cutting-list/:id',
 *   validateParams(idSchema),
 *   controller.getCuttingList
 * );
 * ```
 */
export function validateParams<T extends z.ZodType>(schema: T) {
  return validateRequest(schema, { target: "params" });
}

/**
 * Validate request body
 *
 * @example
 * ```typescript
 * router.post('/cutting-list',
 *   validateBody(createCuttingListSchema),
 *   controller.createCuttingList
 * );
 * ```
 */
export function validateBody<T extends z.ZodType>(schema: T) {
  return validateRequest(schema, { target: "body" });
}

/**
 * Compose multiple validation middlewares
 *
 * @example
 * ```typescript
 * router.put('/cutting-list/:id',
 *   composeValidations({
 *     params: idSchema,
 *     body: updateCuttingListSchema
 *   }),
 *   controller.updateCuttingList
 * );
 * ```
 */
export function composeValidations(validations: {
  params?: z.ZodType;
  query?: z.ZodType;
  body?: z.ZodType;
}) {
  const middlewares: ((
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void)[] = [];

  if (validations.params) {
    middlewares.push(validateParams(validations.params));
  }
  if (validations.query) {
    middlewares.push(validateQuery(validations.query));
  }
  if (validations.body) {
    middlewares.push(validateBody(validations.body));
  }

  return middlewares;
}

/**
 * Type guard to check if request has validated data
 */
export function hasValidatedData<T>(
  req: Request,
): req is Request & { validatedData: T } {
  return "validatedData" in req;
}

/**
 * Get validated data from request
 * Throws error if validation middleware wasn't applied
 */
export function getValidatedData<T>(req: Request): T {
  if (!hasValidatedData<T>(req)) {
    throw new Error(
      "Request does not have validated data. Did you forget validation middleware?",
    );
  }
  return req.validatedData;
}

// Extended Express Request interface
declare global {
  namespace Express {
    interface Request {
      validatedData?: unknown;
    }
  }
}

export default {
  validateRequest,
  validateQuery,
  validateParams,
  validateBody,
  composeValidations,
  hasValidatedData,
  getValidatedData,
};
