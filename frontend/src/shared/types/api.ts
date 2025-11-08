/**
 * LEMNİX Shared API Types
 * Common types for API requests and responses
 * 
 * @module shared/types
 * @version 1.0.0 - FSD Compliant
 */

/**
 * Standard API error structure
 */
export interface ApiError {
  readonly message: string;
  readonly code: string;
  readonly details?: Record<string, unknown>;
  readonly timestamp?: string;
}

/**
 * Success response wrapper
 */
export interface ApiSuccessResponse<T> {
  readonly success: true;
  readonly data: T;
  readonly metadata?: {
    readonly requestId?: string;
    readonly timestamp?: string;
    readonly version?: string;
  };
}

/**
 * Error response wrapper
 */
export interface ApiErrorResponse {
  readonly success: false;
  readonly error: ApiError;
  readonly metadata?: {
    readonly requestId?: string;
    readonly timestamp?: string;
  };
}

/**
 * Generic API response (success or error)
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
  readonly totalPages: number;
  readonly hasNext: boolean;
  readonly hasPrev: boolean;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  readonly items: ReadonlyArray<T>;
  readonly pagination: PaginationMeta;
}

/**
 * Sort order
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Sort criteria
 */
export interface SortCriteria {
  readonly field: string;
  readonly order: SortOrder;
}

/**
 * Filter operator
 */
export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'nin';

/**
 * Filter criteria
 */
export interface FilterCriteria {
  readonly field: string;
  readonly operator: FilterOperator;
  readonly value: unknown;
}

/**
 * Query parameters for list endpoints
 */
export interface ListQueryParams {
  readonly page?: number;
  readonly pageSize?: number;
  readonly sort?: SortCriteria;
  readonly filters?: ReadonlyArray<FilterCriteria>;
  readonly search?: string;
}

