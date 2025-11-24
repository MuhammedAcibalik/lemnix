/**
 * Product Category Repository (Legacy Adapter)
 *
 * Wraps the new PrismaProductCategoryRepository to maintain backward compatibility
 * Returns Prisma models instead of domain entities
 *
 * @module repositories/ProductCategoryRepository
 * @version 2.0.0 - Adapter pattern for backward compatibility
 * @deprecated Use PrismaProductCategoryRepository directly for new code
 */

import { prisma } from "../config/database";
import { ProductCategory, ProductMapping, Prisma } from "@prisma/client";
import { logger } from "../services/logger";
import { PrismaProductCategoryRepository } from "../infrastructure/repositories/PrismaProductCategoryRepository";
import { handlePrismaError } from "../utils/prismaErrorHandler";

// ============================================================================
// TYPE DEFINITIONS (for backward compatibility)
// ============================================================================

export interface CreateCategoryInput {
  readonly name: string;
  readonly description?: string;
}

export interface UpdateCategoryInput {
  readonly name?: string;
  readonly description?: string;
}

export interface ProductCategoryWithProducts extends ProductCategory {
  readonly products: ProductMapping[];
}

// ============================================================================
// REPOSITORY
// ============================================================================

export class ProductCategoryRepository {
  private static instance: ProductCategoryRepository;
  private readonly prismaRepository: PrismaProductCategoryRepository;

  private constructor() {
    this.prismaRepository = new PrismaProductCategoryRepository();
  }

  public static getInstance(): ProductCategoryRepository {
    if (!ProductCategoryRepository.instance) {
      ProductCategoryRepository.instance = new ProductCategoryRepository();
    }
    return ProductCategoryRepository.instance;
  }

  // ==========================================================================
  // CRUD OPERATIONS
  // ==========================================================================

  /**
   * Get all categories
   */
  public async findAll(): Promise<ProductCategory[]> {
    const domainCategories = await this.prismaRepository.findAll();
    // Convert domain entities back to Prisma models
    return await prisma.productCategory.findMany({
      orderBy: { name: "asc" },
    });
  }

  /**
   * Get category by ID
   */
  public async findById(id: string): Promise<ProductCategory | null> {
    const domainCategory = await this.prismaRepository.findById(id);
    if (!domainCategory) {
      return null;
    }
    return await prisma.productCategory.findUnique({
      where: { id },
    });
  }

  /**
   * Get category by name
   */
  public async findByName(name: string): Promise<ProductCategory | null> {
    const domainCategory = await this.prismaRepository.findByName(name);
    if (!domainCategory) {
      return null;
    }
    return await prisma.productCategory.findUnique({
      where: { name },
    });
  }

  /**
   * Create a new category
   */
  public async create(data: CreateCategoryInput): Promise<ProductCategory> {
    const domainCategory = await this.prismaRepository.create(data);
    return await prisma.productCategory.findUniqueOrThrow({
      where: { id: domainCategory.id },
    });
  }

  /**
   * Update category
   */
  public async update(
    id: string,
    data: UpdateCategoryInput,
  ): Promise<ProductCategory> {
    const domainCategory = await this.prismaRepository.update(id, data);
    return await prisma.productCategory.findUniqueOrThrow({
      where: { id: domainCategory.id },
    });
  }

  /**
   * Delete category
   */
  public async delete(id: string): Promise<void> {
    await this.prismaRepository.delete(id);
  }

  /**
   * Get category by product name
   */
  public async getCategoryByProductName(
    productName: string,
  ): Promise<ProductCategory | null> {
    const domainCategory =
      await this.prismaRepository.getCategoryByProductName(productName);
    if (!domainCategory) {
      return null;
    }
    return await prisma.productCategory.findUnique({
      where: { id: domainCategory.id },
    });
  }

  /**
   * Map product to category
   */
  public async mapProductToCategory(
    productName: string,
    categoryId: string,
  ): Promise<ProductMapping> {
    const domainMapping = await this.prismaRepository.mapProductToCategory(
      productName,
      categoryId,
    );
    return await prisma.productMapping.findUniqueOrThrow({
      where: { id: domainMapping.id },
    });
  }

  /**
   * Get products by category
   */
  public async getProductsByCategory(
    categoryId: string,
  ): Promise<ProductMapping[]> {
    const domainMappings =
      await this.prismaRepository.getProductsByCategory(categoryId);
    const ids = domainMappings.map((m) => m.id);
    return await prisma.productMapping.findMany({
      where: { id: { in: ids } },
      orderBy: { productName: "asc" },
    });
  }
}

export const productCategoryRepository =
  ProductCategoryRepository.getInstance();
