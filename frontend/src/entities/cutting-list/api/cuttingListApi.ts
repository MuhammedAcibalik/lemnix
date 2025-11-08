/**
 * LEMNİX Cutting List Entity API
 * Backend API calls for cutting list operations
 * 
 * @module entities/cutting-list/api
 * @version 1.0.0 - Professional FSD Implementation
 */

import { apiClient } from '@/shared/api/client';
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
 * API endpoints
 */
const ENDPOINTS = {
  CUTTING_LISTS: '/cutting-list',
  CUTTING_LIST_BY_ID: (id: string) => `/cutting-list/${id}`,
  SECTIONS: (cuttingListId: string) => `/cutting-list/${cuttingListId}/sections`,
  SECTION_BY_ID: (cuttingListId: string, sectionId: string) => 
    `/cutting-list/${cuttingListId}/sections/${sectionId}`,
  ITEMS: (cuttingListId: string, sectionId: string) => 
    `/cutting-list/${cuttingListId}/sections/${sectionId}/items`,
  ITEM_BY_ID: (cuttingListId: string, sectionId: string, itemId: string) => 
    `/cutting-list/${cuttingListId}/sections/${sectionId}/items/${itemId}`,
} as const;

/**
 * Get all cutting lists
 * ✅ CRITICAL FIX: Proper error handling and array guarantee
 */
export async function getCuttingLists(): Promise<ReadonlyArray<CuttingList>> {
  try {
    console.log('[CuttingListAPI] 🚀 Starting API call at:', new Date().toISOString());
    
    const response = await apiClient.get<{
      success: boolean;
      data?: CuttingList[];
    }>(ENDPOINTS.CUTTING_LISTS);

    console.log('[CuttingListAPI] 📡 API Response received at:', new Date().toISOString());
    console.log('[CuttingListAPI] Response.data.data length:', response.data.data?.length);

    if (response.data.success && response.data.data) {
      // ✅ Ensure array
      const lists = Array.isArray(response.data.data) ? response.data.data : [];
      console.log('[CuttingListAPI] ✅ Returning lists:', lists.length);
      console.log('[CuttingListAPI] List titles:', lists.map(l => l.title));
      return lists;
    }

    console.warn('[CuttingListAPI] ❌ No data or unsuccessful response');
    return [];
  } catch (error) {
    console.error('[CuttingListAPI] Failed to fetch cutting lists:', error);
    return [];
  }
}

/**
 * Get cutting list by ID
 */
export async function getCuttingListById(id: string): Promise<CuttingList | null> {
  try {
    const response = await apiClient.get<{
      success: boolean;
      data?: CuttingList;
    }>(ENDPOINTS.CUTTING_LIST_BY_ID(id));

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    return null;
  } catch (error) {
    console.error(`[CuttingListAPI] Failed to fetch cutting list ${id}:`, error);
    return null;
  }
}

/**
 * Create new cutting list
 */
export async function createCuttingList(
  request: CreateCuttingListRequest
): Promise<CuttingList> {
  const response = await apiClient.post<{
    success: boolean;
    data: CuttingList;
  }>(ENDPOINTS.CUTTING_LISTS, request);

  if (!response.data.success || !response.data.data) {
    throw new Error('Failed to create cutting list');
  }

  return response.data.data;
}

/**
 * Update cutting list
 */
export async function updateCuttingList(
  id: string,
  updates: Partial<CuttingList>
): Promise<CuttingList> {
  const response = await apiClient.put<{
    success: boolean;
    data: CuttingList;
  }>(ENDPOINTS.CUTTING_LIST_BY_ID(id), updates);

  if (!response.data.success || !response.data.data) {
    throw new Error('Failed to update cutting list');
  }

  return response.data.data;
}

/**
 * Delete cutting list
 */
export async function deleteCuttingList(id: string): Promise<void> {
  await apiClient.delete(ENDPOINTS.CUTTING_LIST_BY_ID(id));
}

/**
 * Add product section to cutting list
 */
export async function addProductSection(
  cuttingListId: string,
  request: AddProductSectionRequest
): Promise<ProductSection> {
  const response = await apiClient.post<{
    success: boolean;
    data: ProductSection;
  }>(ENDPOINTS.SECTIONS(cuttingListId), request);

  if (!response.data.success || !response.data.data) {
    throw new Error('Failed to add product section');
  }

  return response.data.data;
}

/**
 * Delete product section
 */
export async function deleteProductSection(
  cuttingListId: string,
  sectionId: string
): Promise<void> {
  await apiClient.delete(ENDPOINTS.SECTION_BY_ID(cuttingListId, sectionId));
}

/**
 * Add item to section
 */
export async function addItemToSection(
  cuttingListId: string,
  sectionId: string,
  request: AddItemRequest
): Promise<CuttingListItem> {
  const response = await apiClient.post<{
    success: boolean;
    data: CuttingListItem;
  }>(ENDPOINTS.ITEMS(cuttingListId, sectionId), request);

  if (!response.data.success || !response.data.data) {
    throw new Error('Failed to add item');
  }

  return response.data.data;
}

/**
 * Update item in section
 */
export async function updateItemInSection(
  cuttingListId: string,
  sectionId: string,
  itemId: string,
  request: UpdateItemRequest
): Promise<CuttingListItem> {
  const response = await apiClient.put<{
    success: boolean;
    data: CuttingListItem;
  }>(ENDPOINTS.ITEM_BY_ID(cuttingListId, sectionId, itemId), request);

  if (!response.data.success || !response.data.data) {
    throw new Error('Failed to update item');
  }

  return response.data.data;
}

/**
 * Delete item from section
 */
export async function deleteItemFromSection(
  cuttingListId: string,
  sectionId: string,
  itemId: string
): Promise<void> {
  await apiClient.delete(ENDPOINTS.ITEM_BY_ID(cuttingListId, sectionId, itemId));
}

