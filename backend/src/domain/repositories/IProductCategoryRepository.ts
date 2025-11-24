/**
 * Product Category Repository Interface
 *
 * Port for ProductCategory data access operations
 *
 * @module domain/repositories/IProductCategoryRepository
 * @version 1.0.0
 */

export interface ProductCategory {
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ProductMapping {
  readonly id: string;
  readonly productName: string;
  readonly categoryId: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CreateCategoryInput {
  readonly name: string;
  readonly description?: string;
}

export interface UpdateCategoryInput {
  readonly name?: string;
  readonly description?: string;
}

/**
 * Product Category Repository Interface (Port)
 */
export interface IProductCategoryRepository {
  /**
   * Find category by ID
   */
  findById(id: string): Promise<ProductCategory | null>;

  /**
   * Find category by name
   */
  findByName(name: string): Promise<ProductCategory | null>;

  /**
   * Find all categories
   */
  findAll(): Promise<readonly ProductCategory[]>;

  /**
   * Create category
   */
  create(data: CreateCategoryInput): Promise<ProductCategory>;

  /**
   * Update category
   */
  update(id: string, data: UpdateCategoryInput): Promise<ProductCategory>;

  /**
   * Delete category
   */
  delete(id: string): Promise<void>;

  /**
   * Get category by product name
   */
  getCategoryByProductName(
    productName: string,
  ): Promise<ProductCategory | null>;

  /**
   * Map product to category
   */
  mapProductToCategory(
    productName: string,
    categoryId: string,
  ): Promise<ProductMapping>;

  /**
   * Get products by category
   */
  getProductsByCategory(categoryId: string): Promise<readonly ProductMapping[]>;
}
