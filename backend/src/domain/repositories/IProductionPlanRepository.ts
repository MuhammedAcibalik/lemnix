/**
 * Production Plan Repository Interface
 *
 * Port for ProductionPlan data access operations
 *
 * @module domain/repositories/IProductionPlanRepository
 * @version 1.0.0
 */

import { ProductionPlan } from "../entities/ProductionPlan";
import { ProductionPlanItem } from "../entities/ProductionPlanItem";

export interface ProductionPlanFilters {
  readonly weekNumber?: number;
  readonly year?: number;
  readonly status?: string;
}

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
}

/**
 * Production Plan Repository Interface (Port)
 */
export interface IProductionPlanRepository {
  /**
   * Find production plan by ID
   */
  findById(id: string): Promise<ProductionPlan | null>;

  /**
   * Find production plan by ID with items
   */
  findByIdWithItems(id: string): Promise<ProductionPlan | null>;

  /**
   * Find production plan by week and year
   */
  findByWeekAndYear(
    weekNumber: number,
    year: number,
  ): Promise<ProductionPlan | null>;

  /**
   * Find all production plans with filters
   */
  findAll(filters?: ProductionPlanFilters): Promise<readonly ProductionPlan[]>;

  /**
   * Find production plans with pagination
   */
  findPaginated(
    filters?: ProductionPlanFilters,
    pagination?: PaginationOptions,
  ): Promise<PaginatedResult<ProductionPlan>>;

  /**
   * Create production plan
   */
  create(plan: ProductionPlan): Promise<ProductionPlan>;

  /**
   * Create production plan with items atomically
   */
  createWithItems(
    plan: ProductionPlan,
    items: readonly ProductionPlanItem[],
  ): Promise<ProductionPlan>;

  /**
   * Update production plan
   */
  update(id: string, plan: Partial<ProductionPlan>): Promise<ProductionPlan>;

  /**
   * Delete production plan
   */
  delete(id: string): Promise<void>;

  /**
   * Find plan items by plan ID
   */
  findItemsByPlanId(planId: string): Promise<readonly ProductionPlanItem[]>;

  /**
   * Find plan items by IDs
   */
  findItemsByIds(
    ids: readonly string[],
  ): Promise<readonly ProductionPlanItem[]>;

  /**
   * Link plan items to cutting list
   */
  linkItemsToCuttingList(
    itemIds: readonly string[],
    cuttingListId: string,
  ): Promise<void>;

  /**
   * Link single plan item to cutting list
   */
  linkItemToCuttingList(itemId: string, cuttingListId: string): Promise<void>;

  /**
   * Create cutting list from plan items
   */
  createCuttingList(data: {
    name: string;
    userId: string;
    weekNumber?: number | null;
  }): Promise<{ id: string }>;

  /**
   * Create cutting list items
   */
  createCuttingListItems(
    cuttingListId: string,
    items: Array<{
      workOrderId: string;
      profileType: string;
      length: number;
      quantity: number;
      [key: string]: unknown;
    }>,
  ): Promise<number>;
}
