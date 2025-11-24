/**
 * Prisma Product Category Repository Implementation
 *
 * Adapter for ProductCategory data access using Prisma
 *
 * @module infrastructure/repositories/PrismaProductCategoryRepository
 * @version 1.0.0
 */

import { PrismaClient } from "@prisma/client";
import { PrismaRepository } from "./PrismaRepository";
import {
  IProductCategoryRepository,
  ProductCategory,
  ProductMapping,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../../domain/repositories/IProductCategoryRepository";
import { logger } from "../../services/logger";

/**
 * Prisma Product Category Repository
 */
export class PrismaProductCategoryRepository
  extends PrismaRepository<ProductCategory, string>
  implements IProductCategoryRepository
{
  constructor(client?: PrismaClient) {
    super(client);
  }

  /**
   * Override base create method to match IProductCategoryRepository interface
   */
  public override async create(
    data: CreateCategoryInput | ProductCategory,
  ): Promise<ProductCategory> {
    // Handle both CreateCategoryInput and ProductCategory for compatibility
    const input =
      "id" in data ? { name: data.name, description: data.description } : data;
    return this.createCategory(input as CreateCategoryInput);
  }

  public async findById(id: string): Promise<ProductCategory | null> {
    try {
      const prisma = await this.prisma.productCategory.findUnique({
        where: { id },
      });
      return prisma
        ? {
            id: prisma.id,
            name: prisma.name,
            description: prisma.description || null,
            createdAt: prisma.createdAt,
            updatedAt: prisma.updatedAt,
          }
        : null;
    } catch (error) {
      const errorInfo = this.handlePrismaError(error, {
        operation: "findById",
        model: "ProductCategory",
        value: id,
      });
      throw new Error(errorInfo.userMessage);
    }
  }

  public async findByName(name: string): Promise<ProductCategory | null> {
    try {
      const prisma = await this.prisma.productCategory.findUnique({
        where: { name },
      });
      return prisma
        ? {
            id: prisma.id,
            name: prisma.name,
            description: prisma.description || null,
            createdAt: prisma.createdAt,
            updatedAt: prisma.updatedAt,
          }
        : null;
    } catch (error) {
      const errorInfo = this.handlePrismaError(error, {
        operation: "findByName",
        model: "ProductCategory",
        value: name,
      });
      throw new Error(errorInfo.userMessage);
    }
  }

  public async findAll(): Promise<readonly ProductCategory[]> {
    try {
      const prismaResults = await this.prisma.productCategory.findMany({
        orderBy: { name: "asc" },
      });
      return prismaResults.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description || null,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));
    } catch (error) {
      const errorInfo = this.handlePrismaError(error, {
        operation: "findAll",
        model: "ProductCategory",
      });
      throw new Error(errorInfo.userMessage);
    }
  }

  /**
   * Create category (internal implementation)
   */
  private async createCategory(
    data: CreateCategoryInput,
  ): Promise<ProductCategory> {
    try {
      const result = await this.prisma.productCategory.create({
        data: {
          name: data.name,
          description: data.description,
        },
      });

      logger.info("Product category created", {
        id: result.id,
        name: result.name,
      });

      return {
        id: result.id,
        name: result.name,
        description: result.description || null,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };
    } catch (error) {
      const errorInfo = this.handlePrismaError(error, {
        operation: "create",
        model: "ProductCategory",
        field: "name",
        value: data.name,
      });

      logger.error("Failed to create product category", {
        error,
        errorCode: errorInfo.code,
        data,
      });

      throw new Error(errorInfo.userMessage);
    }
  }

  public async update(
    id: string,
    data: UpdateCategoryInput,
  ): Promise<ProductCategory> {
    try {
      const result = await this.prisma.productCategory.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          updatedAt: new Date(),
        },
      });

      return {
        id: result.id,
        name: result.name,
        description: result.description || null,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };
    } catch (error) {
      const errorInfo = this.handlePrismaError(error, {
        operation: "update",
        model: "ProductCategory",
        value: id,
      });
      throw new Error(errorInfo.userMessage);
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      await this.prisma.productCategory.delete({
        where: { id },
      });
    } catch (error) {
      const errorInfo = this.handlePrismaError(error, {
        operation: "delete",
        model: "ProductCategory",
        value: id,
      });
      throw new Error(errorInfo.userMessage);
    }
  }

  public async getCategoryByProductName(
    productName: string,
  ): Promise<ProductCategory | null> {
    try {
      const normalizedProductName = productName.toUpperCase().trim();
      const mapping = await this.prisma.productMapping.findUnique({
        where: { productName: normalizedProductName },
        include: { category: true },
      });

      if (!mapping) {
        return null;
      }

      return {
        id: mapping.category.id,
        name: mapping.category.name,
        description: mapping.category.description || null,
        createdAt: mapping.category.createdAt,
        updatedAt: mapping.category.updatedAt,
      };
    } catch (error) {
      const errorInfo = this.handlePrismaError(error, {
        operation: "getCategoryByProductName",
        model: "ProductMapping",
        value: productName,
      });
      throw new Error(errorInfo.userMessage);
    }
  }

  public async mapProductToCategory(
    productName: string,
    categoryId: string,
  ): Promise<ProductMapping> {
    try {
      const normalizedProductName = productName.toUpperCase().trim();

      // Verify category exists
      const category = await this.prisma.productCategory.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        throw new Error(`Category with ID ${categoryId} not found`);
      }

      const result = await this.prisma.productMapping.upsert({
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

      return {
        id: result.id,
        productName: result.productName,
        categoryId: result.categoryId,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      };
    } catch (error) {
      const errorInfo = this.handlePrismaError(error, {
        operation: "mapProductToCategory",
        model: "ProductMapping",
        field: "productName",
        value: productName,
      });

      logger.error("Failed to map product to category", {
        error,
        errorCode: errorInfo.code,
        productName,
        categoryId,
      });

      throw new Error(errorInfo.userMessage);
    }
  }

  public async getProductsByCategory(
    categoryId: string,
  ): Promise<readonly ProductMapping[]> {
    try {
      const prismaResults = await this.prisma.productMapping.findMany({
        where: { categoryId },
        orderBy: { productName: "asc" },
      });
      return prismaResults.map((p) => ({
        id: p.id,
        productName: p.productName,
        categoryId: p.categoryId,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));
    } catch (error) {
      const errorInfo = this.handlePrismaError(error, {
        operation: "getProductsByCategory",
        model: "ProductMapping",
        value: categoryId,
      });
      throw new Error(errorInfo.userMessage);
    }
  }

  public async count(): Promise<number> {
    try {
      return await this.prisma.productCategory.count();
    } catch (error) {
      const errorInfo = this.handlePrismaError(error, {
        operation: "count",
        model: "ProductCategory",
      });
      throw new Error(errorInfo.userMessage);
    }
  }
}
