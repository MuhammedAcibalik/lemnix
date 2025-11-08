/**
 * LEMNİX Cutting List Entity React Query Hooks
 * Type-safe React Query hooks for cutting list operations
 * 
 * @module entities/cutting-list/api
 * @version 1.0.0 - Stable Data Fetching
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import {
  getCuttingLists,
  getCuttingListById,
  createCuttingList,
  updateCuttingList,
  deleteCuttingList,
  addProductSection,
  deleteProductSection,
  addItemToSection,
  updateItemInSection,
  deleteItemFromSection,
} from './cuttingListApi';
import type {
  CuttingList,
  ProductSection,
  CuttingListItem,
  CreateCuttingListRequest,
  AddProductSectionRequest,
  AddItemRequest,
  UpdateItemRequest,
} from '../model/types';

/**
 * Query keys for React Query
 * ✅ STABLE: Keys won't change unless actual data changes
 */
export const cuttingListKeys = {
  all: ['cuttingList'] as const,
  lists: () => [...cuttingListKeys.all, 'list'] as const,
  list: (id: string) => [...cuttingListKeys.all, 'list', id] as const,
} as const;

/**
 * Hook: Get all cutting lists
 * ✅ CRITICAL FIX: Stable hook that won't cause re-renders
 */
export function useCuttingLists(
  options?: UseQueryOptions<ReadonlyArray<CuttingList>, Error>
) {
  return useQuery({
    queryKey: cuttingListKeys.lists(),
    queryFn: getCuttingLists,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      const err = error as { response?: { status?: number } };
      if (err?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
    ...options,
  });
}

/**
 * Hook: Get cutting list by ID
 */
export function useCuttingListById(
  id: string,
  options?: UseQueryOptions<CuttingList | null, Error>
) {
  return useQuery({
    queryKey: cuttingListKeys.list(id),
    queryFn: () => getCuttingListById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook: Create cutting list
 */
export function useCreateCuttingList(
  options?: UseMutationOptions<CuttingList, Error, CreateCuttingListRequest>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCuttingList,
    onSuccess: (data) => {
      // Invalidate lists query
      queryClient.invalidateQueries({ queryKey: cuttingListKeys.lists() });
      
      // Set new list in cache
      queryClient.setQueryData(cuttingListKeys.list(data.id), data);
    },
    ...options,
  });
}

/**
 * Hook: Update cutting list
 */
export function useUpdateCuttingList(
  options?: UseMutationOptions<CuttingList, Error, { id: string; updates: Partial<CuttingList> }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }) => updateCuttingList(id, updates),
    onSuccess: (data, variables) => {
      // Invalidate lists query
      queryClient.invalidateQueries({ queryKey: cuttingListKeys.lists() });
      
      // Update specific list in cache
      queryClient.setQueryData(cuttingListKeys.list(variables.id), data);
    },
    ...options,
  });
}

/**
 * Hook: Delete cutting list
 * ✅ ENABLED: Permanently deletes cutting list from database
 */
export function useDeleteCuttingList(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('[CuttingListAPI] 🗑️ Deleting cutting list:', id);
      await deleteCuttingList(id);
    },
    onSuccess: (_, id) => {
      console.log('[CuttingListAPI] ✅ Cutting list deleted successfully:', id);
      
      // Remove from cache
      queryClient.removeQueries({ queryKey: cuttingListKeys.list(id) });
      
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: cuttingListKeys.lists() });
    },
    onError: (error, id) => {
      console.error('[CuttingListAPI] ❌ Failed to delete cutting list:', id, error);
    },
    ...options,
  });
}

/**
 * Hook: Add product section
 */
export function useAddProductSection(
  options?: UseMutationOptions<ProductSection, Error, { cuttingListId: string; request: AddProductSectionRequest }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cuttingListId, request }) => addProductSection(cuttingListId, request),
    onSuccess: (_, variables) => {
      // Invalidate the specific cutting list
      queryClient.invalidateQueries({ queryKey: cuttingListKeys.list(variables.cuttingListId) });
    },
    ...options,
  });
}

/**
 * Hook: Add item to section
 */
export function useAddItemToSection(
  options?: UseMutationOptions<CuttingListItem, Error, { cuttingListId: string; sectionId: string; request: AddItemRequest }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cuttingListId, sectionId, request }) => 
      addItemToSection(cuttingListId, sectionId, request),
    onSuccess: (_, variables) => {
      // Invalidate the specific cutting list
      queryClient.invalidateQueries({ queryKey: cuttingListKeys.list(variables.cuttingListId) });
    },
    ...options,
  });
}

/**
 * Hook: Update item in section
 */
export function useUpdateItemInSection(
  options?: UseMutationOptions<
    CuttingListItem,
    Error,
    { cuttingListId: string; sectionId: string; itemId: string; request: UpdateItemRequest }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cuttingListId, sectionId, itemId, request }) =>
      updateItemInSection(cuttingListId, sectionId, itemId, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: cuttingListKeys.list(variables.cuttingListId) });
    },
    ...options,
  });
}

/**
 * Hook: Delete item from section
 */
export function useDeleteItemFromSection(
  options?: UseMutationOptions<void, Error, { cuttingListId: string; sectionId: string; itemId: string }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cuttingListId, sectionId, itemId }) =>
      deleteItemFromSection(cuttingListId, sectionId, itemId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: cuttingListKeys.list(variables.cuttingListId) });
    },
    ...options,
  });
}

