/**
 * Generic Repository Interface
 *
 * Base interface for all repositories
 *
 * @module domain/repositories/IRepository
 * @version 1.0.0
 */

/**
 * Generic repository interface for CRUD operations
 */
export interface IRepository<T, TId = string> {
  /**
   * Find entity by ID
   */
  findById(id: TId): Promise<T | null>;

  /**
   * Find all entities
   */
  findAll(): Promise<readonly T[]>;

  /**
   * Create entity
   */
  create(entity: T): Promise<T>;

  /**
   * Update entity
   */
  update(id: TId, entity: Partial<T>): Promise<T>;

  /**
   * Delete entity
   */
  delete(id: TId): Promise<void>;

  /**
   * Check if entity exists
   */
  exists(id: TId): Promise<boolean>;

  /**
   * Count entities
   */
  count(): Promise<number>;
}
