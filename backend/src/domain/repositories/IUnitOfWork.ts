/**
 * Unit of Work Interface
 *
 * Manages transactions and coordinates repository operations
 *
 * @module domain/repositories/IUnitOfWork
 * @version 1.0.0
 */

/**
 * Unit of Work interface for transaction management
 */
export interface IUnitOfWork {
  /**
   * Begin a transaction
   */
  begin(): Promise<void>;

  /**
   * Commit the transaction
   */
  commit(): Promise<void>;

  /**
   * Rollback the transaction
   */
  rollback(): Promise<void>;

  /**
   * Execute a function within a transaction
   */
  execute<T>(fn: () => Promise<T>): Promise<T>;

  /**
   * Check if currently in a transaction
   */
  isInTransaction(): boolean;
}
