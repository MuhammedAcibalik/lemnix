/**
 * Standardized API Response Types (Phase 1, Step 2)
 * Consistent response structure for all Cutting List endpoints
 *
 * @module types/apiResponse
 * @version 1.0.0
 */

// ============================================================================
// CORE RESPONSE TYPES
// ============================================================================

/**
 * Standard metadata included in all API responses
 */
export interface ApiMetadata {
  readonly timestamp: string; // ISO 8601 timestamp
  readonly requestId: string; // Unique request identifier
  readonly version: string; // API version (e.g., "v1")
  readonly processingTime?: number; // Processing time in milliseconds
}

/**
 * Standard pagination metadata
 */
export interface PaginationMeta {
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
  readonly totalPages: number;
  readonly hasNext: boolean;
  readonly hasPrevious: boolean;
}

/**
 * Standard error details
 */
export interface ApiError {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
  readonly field?: string; // Field that caused the error
  readonly stack?: string; // Stack trace (only in development)
}

// ============================================================================
// GENERIC RESPONSE TYPES
// ============================================================================

/**
 * Generic success response
 */
export interface ApiSuccessResponse<T = unknown> {
  readonly success: true;
  readonly data: T;
  readonly metadata: ApiMetadata;
}

/**
 * Generic error response
 */
export interface ApiErrorResponse {
  readonly success: false;
  readonly error: ApiError;
  readonly metadata: ApiMetadata;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  readonly success: true;
  readonly data: T[];
  readonly pagination: PaginationMeta;
  readonly metadata: ApiMetadata;
}

/**
 * Union type for all possible API responses
 */
export type ApiResponse<T = unknown> =
  | ApiSuccessResponse<T>
  | ApiErrorResponse
  | PaginatedResponse<T>;

// ============================================================================
// CUTTING LIST SPECIFIC RESPONSE TYPES
// ============================================================================

import type { CuttingListStatus, ItemPriority } from "./index";

/**
 * Cutting list data structure
 */
export interface CuttingListData {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly status: CuttingListStatus;
  readonly weekNumber: number;
  readonly userId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly sections?: unknown[];
  readonly items?: unknown[];
  readonly statistics?: CuttingListStatisticsData;
}

/**
 * Cutting list item data structure
 */
export interface CuttingListItemData {
  readonly id: string;
  readonly workOrderId: string;
  readonly date?: string;
  readonly color: string;
  readonly version: string;
  readonly size: string;
  readonly profileType: string;
  readonly length: number;
  readonly quantity: number;
  readonly orderQuantity?: number;
  readonly priority: ItemPriority;
  readonly status: CuttingListStatus;
  readonly notes?: string;
  readonly cuttingListId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Cutting list statistics data structure
 */
export interface CuttingListStatisticsData {
  readonly totalItems: number;
  readonly totalProfiles: number;
  readonly totalQuantity: number;
  readonly averageWastePercent: number;
  readonly optimizationCount: number;
  readonly completionRate: number;
  readonly efficiencyScore: number;
}

/**
 * Product section data structure
 */
export interface ProductSectionData {
  readonly id: string;
  readonly productName: string;
  readonly items: unknown[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

// ============================================================================
// SPECIFIC API RESPONSE TYPES
// ============================================================================

/**
 * Response for listing cutting lists
 */
export type ListCuttingListsResponse = PaginatedResponse<CuttingListData>;

/**
 * Response for getting a single cutting list
 */
export type GetCuttingListResponse = ApiSuccessResponse<CuttingListData>;

/**
 * Response for creating a cutting list
 */
export type CreateCuttingListResponse = ApiSuccessResponse<CuttingListData>;

/**
 * Response for updating a cutting list
 */
export type UpdateCuttingListResponse = ApiSuccessResponse<CuttingListData>;

/**
 * Response for deleting a cutting list
 */
export interface DeleteCuttingListResponse
  extends ApiSuccessResponse<{ message: string }> {
  readonly data: {
    readonly message: string;
    readonly deletedId: string;
  };
}

/**
 * Response for adding a product section
 */
export type AddProductSectionResponse = ApiSuccessResponse<ProductSectionData>;

/**
 * Response for adding an item to a section
 */
export type AddItemResponse = ApiSuccessResponse<CuttingListItemData>;

/**
 * Response for updating an item
 */
export type UpdateItemResponse = ApiSuccessResponse<CuttingListItemData>;

/**
 * Response for deleting an item
 */
export interface DeleteItemResponse
  extends ApiSuccessResponse<{ message: string }> {
  readonly data: {
    readonly message: string;
    readonly deletedId: string;
  };
}

// ============================================================================
// ERROR CODES
// ============================================================================

/**
 * Cutting List specific error codes
 */
export enum CuttingListErrorCode {
  // Validation errors (400)
  VALIDATION_ERROR = "CUTTING_LIST_VALIDATION_ERROR",
  INVALID_INPUT = "CUTTING_LIST_INVALID_INPUT",
  INVALID_WEEK_NUMBER = "CUTTING_LIST_INVALID_WEEK_NUMBER",
  INVALID_STATUS = "CUTTING_LIST_INVALID_STATUS",
  INVALID_PRIORITY = "CUTTING_LIST_INVALID_PRIORITY",

  // Not found errors (404)
  NOT_FOUND = "CUTTING_LIST_NOT_FOUND",
  SECTION_NOT_FOUND = "CUTTING_LIST_SECTION_NOT_FOUND",
  ITEM_NOT_FOUND = "CUTTING_LIST_ITEM_NOT_FOUND",

  // Conflict errors (409)
  DUPLICATE_WEEK_NUMBER = "CUTTING_LIST_DUPLICATE_WEEK_NUMBER",
  CONFLICT = "CUTTING_LIST_CONFLICT",

  // Authorization errors (403)
  FORBIDDEN = "CUTTING_LIST_FORBIDDEN",
  INSUFFICIENT_PERMISSIONS = "CUTTING_LIST_INSUFFICIENT_PERMISSIONS",

  // Server errors (500)
  INTERNAL_ERROR = "CUTTING_LIST_INTERNAL_ERROR",
  DATABASE_ERROR = "CUTTING_LIST_DATABASE_ERROR",
  EXPORT_ERROR = "CUTTING_LIST_EXPORT_ERROR",
  OPTIMIZATION_ERROR = "CUTTING_LIST_OPTIMIZATION_ERROR",
}

/**
 * HTTP status code mapping for errors
 */
export const ERROR_STATUS_MAP: Record<string, number> = {
  [CuttingListErrorCode.VALIDATION_ERROR]: 400,
  [CuttingListErrorCode.INVALID_INPUT]: 400,
  [CuttingListErrorCode.INVALID_WEEK_NUMBER]: 400,
  [CuttingListErrorCode.INVALID_STATUS]: 400,
  [CuttingListErrorCode.INVALID_PRIORITY]: 400,

  [CuttingListErrorCode.NOT_FOUND]: 404,
  [CuttingListErrorCode.SECTION_NOT_FOUND]: 404,
  [CuttingListErrorCode.ITEM_NOT_FOUND]: 404,

  [CuttingListErrorCode.DUPLICATE_WEEK_NUMBER]: 409,
  [CuttingListErrorCode.CONFLICT]: 409,

  [CuttingListErrorCode.FORBIDDEN]: 403,
  [CuttingListErrorCode.INSUFFICIENT_PERMISSIONS]: 403,

  [CuttingListErrorCode.INTERNAL_ERROR]: 500,
  [CuttingListErrorCode.DATABASE_ERROR]: 500,
  [CuttingListErrorCode.EXPORT_ERROR]: 500,
  [CuttingListErrorCode.OPTIMIZATION_ERROR]: 500,
};

// ============================================================================
// RESPONSE BUILDER UTILITIES
// ============================================================================

/**
 * Generate unique request ID
 */
export function generateRequestId(): string {
  return `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create standard metadata
 */
export function createMetadata(
  requestId?: string,
  startTime?: number,
): ApiMetadata {
  const timestamp = new Date().toISOString();
  const processingTime = startTime ? Date.now() - startTime : undefined;

  return {
    timestamp,
    requestId: requestId || generateRequestId(),
    version: "v1",
    ...(processingTime !== undefined && { processingTime }),
  };
}

/**
 * Create success response
 */
export function createSuccessResponse<T>(
  data: T,
  requestId?: string,
  startTime?: number,
): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    metadata: createMetadata(requestId, startTime),
  };
}

/**
 * Create paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  pagination: PaginationMeta,
  requestId?: string,
  startTime?: number,
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    pagination,
    metadata: createMetadata(requestId, startTime),
  };
}

/**
 * Create error response
 */
export function createErrorResponse(
  code: string,
  message: string,
  details?: Record<string, unknown>,
  requestId?: string,
  startTime?: number,
): ApiErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
    metadata: createMetadata(requestId, startTime),
  };
}

/**
 * Create validation error response
 */
export function createValidationErrorResponse(
  errors: string[],
  requestId?: string,
  startTime?: number,
): ApiErrorResponse {
  return createErrorResponse(
    CuttingListErrorCode.VALIDATION_ERROR,
    "Validation failed",
    { errors },
    requestId,
    startTime,
  );
}

/**
 * Create not found error response
 */
export function createNotFoundErrorResponse(
  resource: string,
  id: string,
  requestId?: string,
  startTime?: number,
): ApiErrorResponse {
  return createErrorResponse(
    CuttingListErrorCode.NOT_FOUND,
    `${resource} not found`,
    { resource, id },
    requestId,
    startTime,
  );
}

/**
 * Create pagination metadata
 */
export function createPaginationMeta(
  page: number,
  pageSize: number,
  total: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / pageSize);

  return {
    page,
    pageSize,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
  };
}

// ============================================================================
// EXPRESS MIDDLEWARE HELPERS
// ============================================================================

/**
 * Attach request ID to Express request
 */
export function attachRequestId(req: any): string {
  if (!req.requestId) {
    req.requestId = generateRequestId();
  }
  return req.requestId;
}

/**
 * Attach start time to Express request
 */
export function attachStartTime(req: any): number {
  if (!req.startTime) {
    req.startTime = Date.now();
  }
  return req.startTime;
}

/**
 * Send standardized success response
 */
export function sendSuccess<T>(
  res: any,
  data: T,
  statusCode: number = 200,
): void {
  const requestId = res.req?.requestId || generateRequestId();
  const startTime = res.req?.startTime;

  res
    .status(statusCode)
    .json(createSuccessResponse(data, requestId, startTime));
}

/**
 * Send standardized error response
 */
export function sendError(
  res: any,
  code: string,
  message: string,
  details?: Record<string, unknown>,
  statusCode?: number,
): void {
  const requestId = res.req?.requestId || generateRequestId();
  const startTime = res.req?.startTime;
  const status = statusCode || ERROR_STATUS_MAP[code] || 500;

  res
    .status(status)
    .json(createErrorResponse(code, message, details, requestId, startTime));
}

/**
 * Send paginated response
 */
export function sendPaginated<T>(
  res: any,
  data: T[],
  pagination: PaginationMeta,
  statusCode: number = 200,
): void {
  const requestId = res.req?.requestId || generateRequestId();
  const startTime = res.req?.startTime;

  res
    .status(statusCode)
    .json(createPaginatedResponse(data, pagination, requestId, startTime));
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  createValidationErrorResponse,
  createNotFoundErrorResponse,
  createMetadata,
  createPaginationMeta,
  generateRequestId,
  attachRequestId,
  attachStartTime,
  sendSuccess,
  sendError,
  sendPaginated,
  CuttingListErrorCode,
  ERROR_STATUS_MAP,
};
