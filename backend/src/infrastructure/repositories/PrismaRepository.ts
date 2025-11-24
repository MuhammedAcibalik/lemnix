/**
 * Base Prisma Repository
 *
 * Base implementation for Prisma-based repositories
 *
 * @module infrastructure/repositories/PrismaRepository
 * @version 1.0.0
 */

import { PrismaClient, Prisma } from "@prisma/client";
import { BaseRepository } from "../../repositories/BaseRepository";
import { IRepository } from "../../domain/repositories/IRepository";

/**
 * Base Prisma Repository
 */
export abstract class PrismaRepository<T, TId = string>
  extends BaseRepository
  implements IRepository<T, TId>
{
  /**
   * Find entity by ID
   */
  public abstract findById(id: TId): Promise<T | null>;

  /**
   * Find all entities
   */
  public abstract findAll(): Promise<readonly T[]>;

  /**
   * Create entity
   */
  public abstract create(entity: T): Promise<T>;

  /**
   * Update entity
   */
  public abstract update(id: TId, entity: Partial<T>): Promise<T>;

  /**
   * Delete entity
   */
  public abstract delete(id: TId): Promise<void>;

  /**
   * Check if entity exists
   */
  public async exists(id: TId): Promise<boolean> {
    const entity = await this.findById(id);
    return entity !== null;
  }

  /**
   * Count entities
   */
  public abstract count(): Promise<number>;
}
