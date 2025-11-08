/**
 * LEMNİX Cutting List Entity - Public API
 * 
 * @module entities/cutting-list
 * @version 1.0.0
 */

// Types
export type {
  ProfileItem,
  CuttingListItem,
  ProductSection,
  CuttingList,
  CreateCuttingListRequest,
  AddProductSectionRequest,
  AddItemRequest,
  UpdateItemRequest,
} from './model/types';

// API functions (raw)
export {
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
} from './api/cuttingListApi';

// React Query hooks (recommended)
export {
  cuttingListKeys,
  useCuttingLists,
  useCuttingListById,
  useCreateCuttingList,
  useUpdateCuttingList,
  useDeleteCuttingList,
  useAddProductSection,
  useAddItemToSection,
  useUpdateItemInSection,
  useDeleteItemFromSection,
} from './api/cuttingListQueries';

