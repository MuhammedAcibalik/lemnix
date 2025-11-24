/**
 * Cutting List Repository Interface
 *
 * Port for CuttingList data access operations
 *
 * @module domain/repositories/ICuttingListRepository
 * @version 1.0.0
 */

import { CuttingList } from "../entities/CuttingList";
import { CuttingListItem } from "../entities/CuttingListItem";
import { WeekNumber } from "../valueObjects/WeekNumber";
import { CuttingListStatus } from "@prisma/client";

export interface CuttingListFilters {
  readonly userId?: string;
  readonly status?: CuttingListStatus;
  readonly weekNumber?: number | null;
  readonly search?: string;
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
 * Cutting List Repository Interface (Port)
 */
export interface ICuttingListRepository {
  /**
   * Find cutting list by ID
   */
  findById(id: string): Promise<CuttingList | null>;

  /**
   * Find cutting list by ID with relations
   */
  findByIdWithRelations(id: string): Promise<CuttingList | null>;

  /**
   * Find all cutting lists with filters
   */
  findAll(filters?: CuttingListFilters): Promise<readonly CuttingList[]>;

  /**
   * Find cutting lists with pagination
   */
  findPaginated(
    filters?: CuttingListFilters,
    pagination?: PaginationOptions,
  ): Promise<PaginatedResult<CuttingList>>;

  /**
   * Find cutting list by week number and user
   */
  findByWeekNumber(
    userId: string,
    weekNumber: WeekNumber | null,
  ): Promise<CuttingList | null>;

  /**
   * Find all cutting lists by week number
   */
  findAllByWeekNumber(weekNumber: number): Promise<readonly CuttingList[]>;

  /**
   * Create cutting list
   */
  create(cuttingList: CuttingList): Promise<CuttingList>;

  /**
   * Update cutting list
   */
  update(id: string, cuttingList: Partial<CuttingList>): Promise<CuttingList>;

  /**
   * Delete cutting list
   */
  delete(id: string): Promise<void>;

  /**
   * Add item to cutting list
   */
  addItem(
    cuttingListId: string,
    item: CuttingListItem,
  ): Promise<CuttingListItem>;

  /**
   * Update item in cutting list
   */
  updateItem(
    cuttingListId: string,
    itemId: string,
    item: Partial<CuttingListItem>,
  ): Promise<CuttingListItem>;

  /**
   * Remove item from cutting list
   */
  removeItem(cuttingListId: string, itemId: string): Promise<void>;

  /**
   * Find items by cutting list ID
   */
  findItemsByCuttingListId(
    cuttingListId: string,
  ): Promise<readonly CuttingListItem[]>;

  /**
   * Count cutting lists by status
   */
  countByStatus(userId: string): Promise<Record<string, number>>;

  /**
   * Check if week number exists for user
   */
  existsWeekNumberForUser(
    userId: string,
    weekNumber: WeekNumber | null,
  ): Promise<boolean>;
}
