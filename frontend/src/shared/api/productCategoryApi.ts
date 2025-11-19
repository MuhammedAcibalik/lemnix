/**
 * Product Category API Client
 * API calls for product category management
 *
 * @module shared/api/productCategoryApi
 * @version 1.0.0
 */

import { apiClient } from "./client";
import type { ApiSuccessResponse } from "../types";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ProductCategory {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ProductMapping {
  readonly id: string;
  readonly productName: string;
  readonly categoryId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly category?: ProductCategory;
}

export interface CreateCategoryInput {
  readonly name: string;
  readonly description?: string;
}

export interface UpdateCategoryInput {
  readonly name?: string;
  readonly description?: string;
}

export interface MapProductInput {
  readonly productName: string;
  readonly categoryId: string;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get all product categories
 */
export async function getAllCategories(): Promise<ProductCategory[]> {
  const response = await apiClient.get<ApiSuccessResponse<ProductCategory[]>>(
    "/product-categories",
  );
  return response.data.data || [];
}

/**
 * Get category by ID
 */
export async function getCategoryById(id: string): Promise<ProductCategory> {
  const response = await apiClient.get<ApiSuccessResponse<ProductCategory>>(
    `/product-categories/${id}`,
  );
  if (!response.data.data) {
    throw new Error("Category not found");
  }
  return response.data.data;
}

/**
 * Create a new category
 */
export async function createCategory(
  data: CreateCategoryInput,
): Promise<ProductCategory> {
  const response = await apiClient.post<ApiSuccessResponse<ProductCategory>>(
    "/product-categories",
    data,
  );
  if (!response.data.data) {
    throw new Error("Failed to create category");
  }
  return response.data.data;
}

/**
 * Update category
 */
export async function updateCategory(
  id: string,
  data: UpdateCategoryInput,
): Promise<ProductCategory> {
  const response = await apiClient.put<ApiSuccessResponse<ProductCategory>>(
    `/product-categories/${id}`,
    data,
  );
  if (!response.data.data) {
    throw new Error("Failed to update category");
  }
  return response.data.data;
}

/**
 * Delete category
 */
export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/product-categories/${id}`);
}

/**
 * Get category by product name
 * ✅ ROOT CAUSE FIX: Silently handle 404 errors (expected when product has no category)
 */
export async function getCategoryByProduct(
  productName: string,
): Promise<ProductCategory | null> {
  try {
    const response = await apiClient.get<ApiSuccessResponse<ProductCategory>>(
      `/product-categories/product/${encodeURIComponent(productName)}`,
      {
        // ✅ Suppress error logging for expected 404s
        validateStatus: (status) => status === 200 || status === 404,
      },
    );
    
    // 404 response means no category found, which is acceptable
    if (response.status === 404) {
      return null;
    }
    
    return response.data.data || null;
  } catch (error) {
    // Additional safety check for 404 errors
    if (
      error &&
      typeof error === "object" &&
      "response" in error &&
      error.response &&
      typeof error.response === "object" &&
      "status" in error.response &&
      error.response.status === 404
    ) {
      // Expected 404 - product has no category mapping
      return null;
    }
    // Re-throw unexpected errors
    throw error;
  }
}

/**
 * Map product to category
 */
export async function mapProductToCategory(
  data: MapProductInput,
): Promise<ProductMapping> {
  const response = await apiClient.post<ApiSuccessResponse<ProductMapping>>(
    "/product-categories/map",
    data,
  );
  if (!response.data.data) {
    throw new Error("Failed to map product to category");
  }
  return response.data.data;
}

/**
 * Get products by category
 */
export async function getProductsByCategory(
  categoryId: string,
): Promise<ProductMapping[]> {
  const response = await apiClient.get<ApiSuccessResponse<ProductMapping[]>>(
    `/product-categories/${categoryId}/products`,
  );
  return response.data.data || [];
}

