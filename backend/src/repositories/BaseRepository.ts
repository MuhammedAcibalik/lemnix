import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../config/database";
import {
  handlePrismaError,
  type PrismaErrorInfo,
  isRetryableError,
  getHttpStatusForError,
} from "../utils/prismaErrorHandler";

/**
 * Base repository providing shared Prisma access helpers.
 */
export abstract class BaseRepository {
  protected readonly client: PrismaClient;

  protected constructor(client: PrismaClient = prisma) {
    this.client = client;
  }

  /**
   * Expose the shared Prisma client instance.
   */
  public get prisma(): PrismaClient {
    return this.client;
  }

  /**
   * Execute a transaction using the shared client with timeout.
   */
  public async transaction<T>(
    handler: (tx: Prisma.TransactionClient) => Promise<T>,
    options?: Parameters<PrismaClient["$transaction"]>[1],
  ): Promise<T> {
    // Set default timeout if not provided
    const transactionTimeout = process.env.DATABASE_TRANSACTION_TIMEOUT
      ? parseInt(process.env.DATABASE_TRANSACTION_TIMEOUT, 10)
      : process.env.NODE_ENV === 'production' ? 10000 : 5000;

    const transactionOptions: Parameters<PrismaClient["$transaction"]>[1] = {
      maxWait: options?.maxWait || transactionTimeout,
      timeout: options?.timeout || transactionTimeout * 2,
      isolationLevel: options?.isolationLevel,
    };

    return this.client.$transaction(handler, transactionOptions);
  }

  /**
   * Handle Prisma errors with user-friendly messages
   *
   * @param error - Prisma error or generic error
   * @param context - Additional context for error logging
   * @returns PrismaErrorInfo with user-friendly message and HTTP status
   */
  protected handlePrismaError(
    error: unknown,
    context?: {
      operation?: string;
      model?: string;
      field?: string;
      value?: unknown;
    },
  ): PrismaErrorInfo {
    return handlePrismaError(error, context);
  }

  /**
   * Check if an error is retryable
   */
  protected isRetryableError(error: unknown): boolean {
    return isRetryableError(error);
  }

  /**
   * Get HTTP status code for an error
   */
  protected getHttpStatusForError(error: unknown): number {
    return getHttpStatusForError(error);
  }

  /**
   * Hard delete a record (bypasses soft delete)
   * Use with caution - this permanently deletes data
   */
  protected async hardDelete<T extends { delete: (args: any) => Promise<any> }>(
    model: T,
    args: Parameters<T['delete']>[0],
  ): Promise<ReturnType<T['delete']>> {
    // Use raw Prisma client to bypass middleware
    return (this.client as any)[(model as any).constructor.name.toLowerCase()].delete(args);
  }

  /**
   * Restore a soft-deleted record
   */
  protected async restore<T extends { update: (args: any) => Promise<any> }>(
    model: T,
    args: Parameters<T['update']>[0],
  ): Promise<ReturnType<T['update']>> {
    return model.update({
      ...args,
      data: {
        ...args.data,
        deletedAt: null,
        ...(args.data && 'isActive' in args.data ? { isActive: true } : {}),
      },
    });
  }
}

/**
 * Shared singleton for lightweight repository scenarios.
 */
export const baseRepository: BaseRepository =
  new (class extends BaseRepository {
    // Expose constructor publicly via this concrete subclass
    public constructor() {
      super();
    }
  })();
