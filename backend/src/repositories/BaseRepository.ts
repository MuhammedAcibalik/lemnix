import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../config/database";

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
