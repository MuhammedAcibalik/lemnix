/**
 * Dependency Injection Container
 *
 * Simple DI container for managing dependencies
 *
 * @module infrastructure/di/DIContainer
 * @version 1.0.0
 */

import { PrismaClient } from "@prisma/client";
import { prisma } from "../../config/database";
import { ICuttingListRepository } from "../../domain/repositories/ICuttingListRepository";
import { IProductionPlanRepository } from "../../domain/repositories/IProductionPlanRepository";
import { IProductCategoryRepository } from "../../domain/repositories/IProductCategoryRepository";
import { IUnitOfWork } from "../../domain/repositories/IUnitOfWork";
import { PrismaCuttingListRepository } from "../repositories/PrismaCuttingListRepository";
import { PrismaProductionPlanRepository } from "../repositories/PrismaProductionPlanRepository";
import { UnitOfWork } from "../persistence/UnitOfWork";
import { RepositoryFactory } from "../persistence/RepositoryFactory";

type ServiceIdentifier = string | symbol | Function;

interface ServiceRegistration<T> {
  readonly factory: () => T;
  readonly singleton: boolean;
  instance?: T;
}

/**
 * Dependency Injection Container
 */
export class DIContainer {
  private services = new Map<ServiceIdentifier, ServiceRegistration<unknown>>();
  private readonly prismaClient: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prismaClient = prismaClient || prisma;
    this.registerDefaults();
  }

  /**
   * Register a service
   */
  public register<T>(
    identifier: ServiceIdentifier,
    factory: () => T,
    singleton = true,
  ): void {
    this.services.set(identifier, {
      factory: factory as () => unknown,
      singleton,
    });
  }

  /**
   * Resolve a service
   */
  public resolve<T>(identifier: ServiceIdentifier): T {
    const registration = this.services.get(identifier);

    if (!registration) {
      throw new Error(`Service not registered: ${String(identifier)}`);
    }

    if (registration.singleton && registration.instance) {
      return registration.instance as T;
    }

    const instance = registration.factory() as T;

    if (registration.singleton) {
      registration.instance = instance as unknown;
    }

    return instance;
  }

  /**
   * Check if service is registered
   */
  public isRegistered(identifier: ServiceIdentifier): boolean {
    return this.services.has(identifier);
  }

  /**
   * Register default services
   */
  private registerDefaults(): void {
    const factory = new RepositoryFactory();

    // Register repositories
    this.register<ICuttingListRepository>(
      "ICuttingListRepository",
      () => factory.getCuttingListRepository(this.prismaClient),
      true,
    );

    this.register<IProductionPlanRepository>(
      "IProductionPlanRepository",
      () => factory.getProductionPlanRepository(this.prismaClient),
      true,
    );

    // Register Unit of Work
    this.register<IUnitOfWork>(
      "IUnitOfWork",
      () => factory.getUnitOfWork(),
      true,
    );

    // Register Prisma client
    this.register<PrismaClient>("PrismaClient", () => this.prismaClient, true);
  }

  /**
   * Clear all registrations (for testing)
   */
  public clear(): void {
    this.services.clear();
    this.registerDefaults();
  }
}

/**
 * Global DI container instance
 */
export const diContainer = new DIContainer();
