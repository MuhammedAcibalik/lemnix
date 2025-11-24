/**
 * Repository Factory
 *
 * Creates repository instances with proper dependencies
 *
 * @module infrastructure/persistence/RepositoryFactory
 * @version 1.0.0
 */

import { PrismaClient } from "@prisma/client";
import { prisma } from "../../config/database";
import { PrismaCuttingListRepository } from "../repositories/PrismaCuttingListRepository";
import { PrismaProductionPlanRepository } from "../repositories/PrismaProductionPlanRepository";
import { ICuttingListRepository } from "../../domain/repositories/ICuttingListRepository";
import { IProductionPlanRepository } from "../../domain/repositories/IProductionPlanRepository";
import { UnitOfWork } from "./UnitOfWork";
import { IUnitOfWork } from "../../domain/repositories/IUnitOfWork";

/**
 * Repository Factory
 */
export class RepositoryFactory {
  private cuttingListRepository: ICuttingListRepository | null = null;
  private productionPlanRepository: IProductionPlanRepository | null = null;
  private unitOfWork: IUnitOfWork | null = null;

  /**
   * Create or get CuttingList repository
   */
  public getCuttingListRepository(
    client?: PrismaClient,
  ): ICuttingListRepository {
    if (!this.cuttingListRepository) {
      this.cuttingListRepository = new PrismaCuttingListRepository();
    }
    return this.cuttingListRepository;
  }

  /**
   * Create or get ProductionPlan repository
   */
  public getProductionPlanRepository(
    client?: PrismaClient,
  ): IProductionPlanRepository {
    if (!this.productionPlanRepository) {
      this.productionPlanRepository = new PrismaProductionPlanRepository();
    }
    return this.productionPlanRepository;
  }

  /**
   * Create or get Unit of Work
   */
  public getUnitOfWork(): IUnitOfWork {
    if (!this.unitOfWork) {
      this.unitOfWork = new UnitOfWork();
    }
    return this.unitOfWork;
  }

  /**
   * Reset all repositories (for testing)
   */
  public reset(): void {
    this.cuttingListRepository = null;
    this.productionPlanRepository = null;
    this.unitOfWork = null;
  }
}

/**
 * Singleton instance
 */
export const repositoryFactory = new RepositoryFactory();
