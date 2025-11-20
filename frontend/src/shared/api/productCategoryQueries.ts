/**
 * Product Category React Query Hooks
 * React Query hooks for product category management
 *
 * @module shared/api/productCategoryQueries
 * @version 1.0.0
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryByProduct,
  mapProductToCategory,
  getProductsByCategory,
  type ProductCategory,
  type CreateCategoryInput,
  type UpdateCategoryInput,
  type MapProductInput,
} from "./productCategoryApi";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const productCategoryKeys = {
  all: ["product-categories"] as const,
  lists: () => [...productCategoryKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...productCategoryKeys.lists(), { filters }] as const,
  details: () => [...productCategoryKeys.all, "detail"] as const,
  detail: (id: string) => [...productCategoryKeys.details(), id] as const,
  byProduct: (productName: string) =>
    [...productCategoryKeys.all, "by-product", productName] as const,
  products: (categoryId: string) =>
    [...productCategoryKeys.all, "products", categoryId] as const,
} as const;

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Get all product categories
 * ✅ FIX: Disabled unnecessary refetch behaviors
 */
export function useProductCategories() {
  return useQuery({
    queryKey: productCategoryKeys.lists(),
    queryFn: getAllCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // ✅ FIX: Categories rarely change
    refetchOnMount: false, // ✅ FIX: Use cached data
  });
}

/**
 * Get category by ID
 */
export function useProductCategory(id: string | undefined) {
  return useQuery({
    queryKey: productCategoryKeys.detail(id || ""),
    queryFn: () => {
      if (!id) {
        throw new Error("Category ID is required");
      }
      return getCategoryById(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Get category by product name
 * ✅ ROOT CAUSE FIX: Added minimum length requirement (3 chars) to reduce false positives
 */
export function useCategoryByProduct(productName: string | undefined) {
  return useQuery({
    queryKey: productCategoryKeys.byProduct(productName || ""),
    queryFn: () => {
      if (!productName) {
        return Promise.resolve(null);
      }
      return getCategoryByProduct(productName);
    },
    enabled: !!productName && productName.trim().length >= 3, // Minimum 3 characters
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false, // Don't retry 404 errors
    refetchOnWindowFocus: false, // ✅ FIX: Don't refetch when window regains focus
    refetchOnMount: false, // ✅ FIX: Don't refetch on component mount
    refetchOnReconnect: false, // ✅ FIX: Don't refetch on network reconnect
  });
}

/**
 * Get products by category
 */
export function useProductsByCategory(categoryId: string | undefined) {
  return useQuery({
    queryKey: productCategoryKeys.products(categoryId || ""),
    queryFn: () => {
      if (!categoryId) {
        throw new Error("Category ID is required");
      }
      return getProductsByCategory(categoryId);
    },
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Create product category mutation
 */
export function useCreateProductCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryInput) => createCategory(data),
    onSuccess: () => {
      // Invalidate categories list
      queryClient.invalidateQueries({
        queryKey: productCategoryKeys.lists(),
      });
    },
  });
}

/**
 * Update product category mutation
 */
export function useUpdateProductCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryInput }) =>
      updateCategory(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific category and list
      queryClient.invalidateQueries({
        queryKey: productCategoryKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: productCategoryKeys.lists(),
      });
    },
  });
}

/**
 * Delete product category mutation
 */
export function useDeleteProductCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      // Invalidate categories list
      queryClient.invalidateQueries({
        queryKey: productCategoryKeys.lists(),
      });
    },
  });
}

/**
 * Map product to category mutation
 */
export function useMapProductToCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MapProductInput) => mapProductToCategory(data),
    onSuccess: (_, variables) => {
      // Invalidate category by product query
      queryClient.invalidateQueries({
        queryKey: productCategoryKeys.byProduct(variables.productName),
      });
      // Invalidate products list for the category
      queryClient.invalidateQueries({
        queryKey: productCategoryKeys.products(variables.categoryId),
      });
    },
  });
}
