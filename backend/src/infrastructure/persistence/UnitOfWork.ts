/**
 * Unit of Work Implementation
 *
 * Manages transactions and coordinates repository operations
 *
 * @module infrastructure/persistence/UnitOfWork
 * @version 1.0.0
 */

import { Prisma, PrismaClient } from "@prisma/client";
import { IUnitOfWork } from "../../domain/repositories/IUnitOfWork";
import { prisma } from "../../config/database";
import { logger } from "../../services/logger";

/**
 * Unit of Work Implementation
 */
export class UnitOfWork implements IUnitOfWork {
  private transactionClient: Prisma.TransactionClient | null = null;
  private isActive = false;

  /**
   * Begin a transaction
   */
  public async begin(): Promise<void> {
    if (this.isActive) {
      throw new Error("Transaction already active");
    }

    // Note: Prisma doesn't support explicit begin, transactions are started when $transaction is called
    // This method is kept for interface compatibility but actual transaction starts in execute()
    this.isActive = true;
  }

  /**
   * Commit the transaction
   */
  public async commit(): Promise<void> {
    if (!this.isActive) {
      throw new Error("No active transaction");
    }

    // Prisma transactions auto-commit when the handler completes
    // This method is kept for interface compatibility
    this.isActive = false;
    this.transactionClient = null;
  }

  /**
   * Rollback the transaction
   */
  public async rollback(): Promise<void> {
    if (!this.isActive) {
      throw new Error("No active transaction");
    }

    // Prisma transactions auto-rollback on error
    // This method is kept for interface compatibility
    this.isActive = false;
    this.transactionClient = null;
    throw new Error("Transaction rolled back");
  }

  /**
   * Execute a function within a transaction
   */
  public async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.isActive && this.transactionClient) {
      // Already in a transaction, execute directly
      return await fn();
    }

    try {
      this.isActive = true;
      const result = await prisma.$transaction(
        async (tx) => {
          this.transactionClient = tx;
          return await fn();
        },
        {
          maxWait: 5000,
          timeout: 10000,
        },
      );
      this.isActive = false;
      this.transactionClient = null;
      return result;
    } catch (error) {
      this.isActive = false;
      this.transactionClient = null;
      logger.error("UnitOfWork transaction failed", { error });
      throw error;
    }
  }

  /**
   * Check if currently in a transaction
   */
  public isInTransaction(): boolean {
    return this.isActive;
  }

  /**
   * Get the transaction client (for repository use)
   */
  public getTransactionClient(): Prisma.TransactionClient | PrismaClient {
    return this.transactionClient || prisma;
  }
}
