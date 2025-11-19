/**
 * Product Category Repository
 * Data access layer for ProductCategory and ProductMapping operations
 *
 * @module repositories/ProductCategoryRepository
 * @version 1.0.0
 */

import { prisma } from "../config/database";
import {
  ProductCategory,
  ProductMapping,
  Prisma,
} from "@prisma/client";
import { logger } from "../services/logger";

// ============================================================================
// TYPE DEFINITIONS
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

  private constructor() {}

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
    try {
      return await prisma.productCategory.findMany({
        orderBy: { name: "asc" },
      });
    } catch (error) {
      logger.error("Failed to get all product categories", { error });
      throw error;
    }
  }

  /**
   * Get category by ID
   */
  public async findById(id: string): Promise<ProductCategory | null> {
    try {
      return await prisma.productCategory.findUnique({
        where: { id },
      });
    } catch (error) {
      logger.error("Failed to get product category by ID", { error, id });
      throw error;
    }
  }

  /**
   * Get category by name
   */
  public async findByName(name: string): Promise<ProductCategory | null> {
    try {
      return await prisma.productCategory.findUnique({
        where: { name },
      });
    } catch (error) {
      logger.error("Failed to get product category by name", { error, name });
      throw error;
    }
  }

  /**
   * Create a new category
   */
  public async create(
    data: CreateCategoryInput,
  ): Promise<ProductCategory> {
    try {
      const result = await prisma.productCategory.create({
        data: {
          name: data.name,
          description: data.description,
        },
      });

      logger.info("Product category created", {
        id: result.id,
        name: result.name,
      });

      return result;
    } catch (error) {
      logger.error("Failed to create product category", { error, data });
      throw error;
    }
  }

  /**
   * Update category
   */
  public async update(
    id: string,
    data: UpdateCategoryInput,
  ): Promise<ProductCategory> {
    try {
      const result = await prisma.productCategory.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.description !== undefined && { description: data.description }),
        },
      });

      logger.info("Product category updated", {
        id: result.id,
        name: result.name,
      });

      return result;
    } catch (error) {
      logger.error("Failed to update product category", { error, id, data });
      throw error;
    }
  }

  /**
   * Delete category
   */
  public async delete(id: string): Promise<void> {
    try {
      await prisma.productCategory.delete({
        where: { id },
      });

      logger.info("Product category deleted", { id });
    } catch (error) {
      logger.error("Failed to delete product category", { error, id });
      throw error;
    }
  }

  // ==========================================================================
  // PRODUCT MAPPING OPERATIONS
  // ==========================================================================

  /**
   * Get category by product name
   */
  public async getCategoryByProductName(
    productName: string,
  ): Promise<ProductCategory | null> {
    try {
      const normalizedProductName = productName.toUpperCase().trim();

      logger.debug("Looking up category for product", {
        original: productName,
        normalized: normalizedProductName,
      });

      const mapping = await prisma.productMapping.findUnique({
        where: { productName: normalizedProductName },
        include: { category: true },
      });

      if (!mapping) {
        logger.debug("No category mapping found for product", {
          normalizedProductName,
        });
        return null;
      }

      logger.debug("Category mapping found", {
        normalizedProductName,
        categoryName: mapping.category.name,
      });

      return mapping.category;
    } catch (error) {
      logger.error("Failed to get category by product name", {
        error,
        productName,
      });
      throw error;
    }
  }

  /**
   * Map product to category
   */
  public async mapProductToCategory(
    productName: string,
    categoryId: string,
  ): Promise<ProductMapping> {
    try {
      const normalizedProductName = productName.toUpperCase().trim();

      // Verify category exists
      const category = await prisma.productCategory.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        throw new Error(`Category with ID ${categoryId} not found`);
      }

      // Upsert mapping (create or update)
      const result = await prisma.productMapping.upsert({
        where: { productName: normalizedProductName },
        create: {
          productName: normalizedProductName,
          categoryId,
        },
        update: {
          categoryId,
          updatedAt: new Date(),
        },
        include: { category: true },
      });

      logger.info("Product mapped to category", {
        productName: normalizedProductName,
        categoryId,
        categoryName: result.category.name,
      });

      return result;
    } catch (error) {
      logger.error("Failed to map product to category", {
        error,
        productName,
        categoryId,
      });
      throw error;
    }
  }

  /**
   * Get products by category
   */
  public async getProductsByCategory(
    categoryId: string,
  ): Promise<ProductMapping[]> {
    try {
      return await prisma.productMapping.findMany({
        where: { categoryId },
        include: { category: true },
        orderBy: { productName: "asc" },
      });
    } catch (error) {
      logger.error("Failed to get products by category", {
        error,
        categoryId,
      });
      throw error;
    }
  }

  /**
   * Get category with products
   */
  public async getCategoryWithProducts(
    id: string,
  ): Promise<ProductCategoryWithProducts | null> {
    try {
      return await prisma.productCategory.findUnique({
        where: { id },
        include: {
          products: {
            orderBy: { productName: "asc" },
          },
        },
      });
    } catch (error) {
      logger.error("Failed to get category with products", { error, id });
      throw error;
    }
  }

  /**
   * Delete product mapping
   */
  public async deleteProductMapping(productName: string): Promise<void> {
    try {
      const normalizedProductName = productName.toUpperCase().trim();

      await prisma.productMapping.delete({
        where: { productName: normalizedProductName },
      });

      logger.info("Product mapping deleted", {
        productName: normalizedProductName,
      });
    } catch (error) {
      logger.error("Failed to delete product mapping", {
        error,
        productName,
      });
      throw error;
    }
  }

  /**
   * Get all product mappings
   */
  public async getAllMappings(): Promise<ProductMapping[]> {
    try {
      return await prisma.productMapping.findMany({
        include: { category: true },
        orderBy: { productName: "asc" },
      });
    } catch (error) {
      logger.error("Failed to get all product mappings", { error });
      throw error;
    }
  }
}

// Export singleton instance
export const productCategoryRepository =
  ProductCategoryRepository.getInstance();

