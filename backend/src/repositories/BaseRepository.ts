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
   * Execute a transaction using the shared client.
   */
  public async transaction<T>(
    handler: (tx: Prisma.TransactionClient) => Promise<T>,
    options?: Parameters<PrismaClient["$transaction"]>[1],
  ): Promise<T> {
    return this.client.$transaction(handler, options);
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
