/**
 * Paginated Repository Helper
 *
 * Provides pagination utilities for repositories
 *
 * @module infrastructure/repositories/PaginatedRepository
 * @version 1.0.0
 */

export interface PaginationOptions {
  readonly page: number;
  readonly pageSize: number;
}

export interface PaginatedResult<T> {
  readonly data: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
}

/**
 * Paginated Repository Helper
 */
export class PaginatedRepository {
  /**
   * Validate pagination options
   */
  public static validatePagination(
    options: PaginationOptions,
  ): PaginationOptions {
    const page = Math.max(1, options.page);
    const pageSize = Math.min(Math.max(1, options.pageSize), 100); // Max 100 items per page

    return { page, pageSize };
  }

  /**
   * Calculate skip value
   */
  public static calculateSkip(page: number, pageSize: number): number {
    return (page - 1) * pageSize;
  }

  /**
   * Create paginated result
   */
  public static createPaginatedResult<T>(
    data: readonly T[],
    total: number,
    page: number,
    pageSize: number,
  ): PaginatedResult<T> {
    const totalPages = Math.ceil(total / pageSize);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  /**
   * Get default pagination options
   */
  public static getDefaultPagination(): PaginationOptions {
    return {
      page: 1,
      pageSize: 20,
    };
  }
}
