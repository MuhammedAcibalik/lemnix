/**
 * @fileoverview Cutting List State Management Store
 * @module CuttingListStore
 * @version 1.0.0
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface CuttingListItem {
  id: string;
  workOrderId: string;
  color: string;
  version: string;
  size: string;
  profileType: string;
  length: number;
  quantity: number;
  cuttingPattern: string;
  notes?: string;
  priority?: "low" | "medium" | "high";
  createdAt?: string;
  updatedAt?: string;
}

export interface CuttingList {
  id: string;
  name: string;
  description?: string;
  items: CuttingListItem[];
  createdAt: string;
  updatedAt: string;
  status: "draft" | "active" | "completed" | "archived";
  metadata?: {
    totalItems: number;
    totalLength: number;
    estimatedCost?: number;
  };
}

interface CuttingListState {
  // Current working list
  currentList: CuttingList | null;

  // All lists
  lists: CuttingList[];

  // Selected items
  selectedItems: string[];

  // UI state
  loading: boolean;
  error: string | null;

  // Filters and search
  searchQuery: string;
  filters: {
    profileType: string[];
    status: string[];
    priority: string[];
  };

  // Sort options
  sortBy: "name" | "createdAt" | "updatedAt" | "totalItems";
  sortOrder: "asc" | "desc";
}

interface CuttingListActions {
  // List management
  setCurrentList: (list: CuttingList | null) => void;
  createList: (name: string, description?: string) => string;
  updateList: (id: string, updates: Partial<CuttingList>) => void;
  deleteList: (id: string) => void;
  duplicateList: (id: string) => string;

  // Items management
  addItem: (item: CuttingListItem) => void;
  updateItem: (id: string, updates: Partial<CuttingListItem>) => void;
  removeItem: (id: string) => void;
  duplicateItem: (id: string) => void;
  moveItem: (fromIndex: number, toIndex: number) => void;

  // Selection management
  selectItem: (id: string) => void;
  selectMultipleItems: (ids: string[]) => void;
  deselectItem: (id: string) => void;
  clearSelection: () => void;
  selectAll: () => void;

  // Bulk operations
  bulkUpdateItems: (ids: string[], updates: Partial<CuttingListItem>) => void;
  bulkDeleteItems: (ids: string[]) => void;
  bulkMoveItems: (ids: string[], targetListId: string) => void;

  // UI state
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Filters and search
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<CuttingListState["filters"]>) => void;
  clearFilters: () => void;

  // Sort
  setSortBy: (sortBy: CuttingListState["sortBy"]) => void;
  setSortOrder: (sortOrder: CuttingListState["sortOrder"]) => void;
  toggleSort: (sortBy: CuttingListState["sortBy"]) => void;

  // Utility actions
  reset: () => void;
  exportList: (format: "json" | "csv" | "excel") => void;
  importList: (data: unknown, format: "json" | "csv" | "excel") => void;
}

const initialState: CuttingListState = {
  currentList: null,
  lists: [],
  selectedItems: [],
  loading: false,
  error: null,
  searchQuery: "",
  filters: {
    profileType: [],
    status: [],
    priority: [],
  },
  sortBy: "updatedAt",
  sortOrder: "desc",
};

export const useCuttingListStore = create<
  CuttingListState & CuttingListActions
>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // List management
        setCurrentList: (list: CuttingList | null) =>
          set({ currentList: list }),

        createList: (name: string, description?: string) => {
          const id = `list_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const newList: CuttingList = {
            id,
            name,
            ...(description ? { description } : {}),
            items: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: "draft",
            metadata: {
              totalItems: 0,
              totalLength: 0,
              estimatedCost: 0,
            },
          };

          set((state) => ({
            lists: [newList, ...state.lists],
            currentList: newList,
          }));

          return id;
        },

        updateList: (id: string, updates: Partial<CuttingList>) =>
          set((state) => ({
            lists: state.lists.map((list) =>
              list.id === id
                ? { ...list, ...updates, updatedAt: new Date().toISOString() }
                : list,
            ),
            currentList:
              state.currentList?.id === id
                ? {
                    ...state.currentList,
                    ...updates,
                    updatedAt: new Date().toISOString(),
                  }
                : state.currentList,
          })),

        deleteList: (id: string) =>
          set((state) => ({
            lists: state.lists.filter((list) => list.id !== id),
            currentList:
              state.currentList?.id === id ? null : state.currentList,
          })),

        duplicateList: (id: string) => {
          const originalList = get().lists.find((list) => list.id === id);
          if (!originalList) return "";

          const newId = `list_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const duplicatedList: CuttingList = {
            ...originalList,
            id: newId,
            name: `${originalList.name} (Kopya)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: "draft",
            items: originalList.items.map((item) => ({
              ...item,
              id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })),
          };

          set((state) => ({
            lists: [duplicatedList, ...state.lists],
            currentList: duplicatedList,
          }));

          return newId;
        },

        // Items management
        addItem: (item: CuttingListItem) =>
          set((state) => {
            if (!state.currentList) return state;

            const updatedList = {
              ...state.currentList,
              items: [...state.currentList.items, item],
              updatedAt: new Date().toISOString(),
              metadata: {
                ...state.currentList.metadata,
                totalItems: state.currentList.items.length + 1,
                totalLength:
                  (state.currentList.metadata?.totalLength || 0) +
                  item.length * item.quantity,
              },
            };

            return {
              currentList: updatedList,
              lists: state.lists.map((list) =>
                list.id === state.currentList!.id ? updatedList : list,
              ),
            };
          }),

        updateItem: (id: string, updates: Partial<CuttingListItem>) =>
          set((state) => {
            if (!state.currentList) return state;

            const updatedList = {
              ...state.currentList,
              items: state.currentList.items.map((item) =>
                item.id === id
                  ? { ...item, ...updates, updatedAt: new Date().toISOString() }
                  : item,
              ),
              updatedAt: new Date().toISOString(),
            };

            return {
              currentList: updatedList,
              lists: state.lists.map((list) =>
                list.id === state.currentList!.id ? updatedList : list,
              ),
            };
          }),

        removeItem: (id: string) =>
          set((state) => {
            if (!state.currentList) return state;

            const itemToRemove = state.currentList.items.find(
              (item) => item.id === id,
            );
            const updatedList = {
              ...state.currentList,
              items: state.currentList.items.filter((item) => item.id !== id),
              updatedAt: new Date().toISOString(),
              metadata: {
                ...state.currentList.metadata,
                totalItems: state.currentList.items.length - 1,
                totalLength: itemToRemove
                  ? (state.currentList.metadata?.totalLength || 0) -
                    itemToRemove.length * itemToRemove.quantity
                  : state.currentList.metadata?.totalLength || 0,
              },
            };

            return {
              currentList: updatedList,
              lists: state.lists.map((list) =>
                list.id === state.currentList!.id ? updatedList : list,
              ),
              selectedItems: state.selectedItems.filter(
                (itemId) => itemId !== id,
              ),
            };
          }),

        // Selection management
        selectItem: (id: string) =>
          set((state) => ({
            selectedItems: state.selectedItems.includes(id)
              ? state.selectedItems.filter((itemId) => itemId !== id)
              : [...state.selectedItems, id],
          })),

        selectMultipleItems: (ids: string[]) =>
          set((state) => ({
            selectedItems: [...new Set([...state.selectedItems, ...ids])],
          })),

        deselectItem: (id: string) =>
          set((state) => ({
            selectedItems: state.selectedItems.filter(
              (itemId) => itemId !== id,
            ),
          })),

        clearSelection: () => set({ selectedItems: [] }),

        selectAll: () =>
          set((state) => ({
            selectedItems:
              state.currentList?.items.map((item) => item.id) || [],
          })),

        // UI state
        setLoading: (loading: boolean) => set({ loading }),
        setError: (error: string | null) => set({ error }),

        // Filters and search
        setSearchQuery: (query: string) => set({ searchQuery: query }),
        setFilters: (filters: Partial<CuttingListState["filters"]>) =>
          set((state) => ({
            filters: { ...state.filters, ...filters },
          })),
        clearFilters: () =>
          set({
            searchQuery: "",
            filters: {
              profileType: [],
              status: [],
              priority: [],
            },
          }),

        // Sort
        setSortBy: (sortBy: CuttingListState["sortBy"]) => set({ sortBy }),
        setSortOrder: (sortOrder: CuttingListState["sortOrder"]) =>
          set({ sortOrder }),
        toggleSort: (sortBy: CuttingListState["sortBy"]) =>
          set((state) => ({
            sortBy,
            sortOrder:
              state.sortBy === sortBy && state.sortOrder === "asc"
                ? "desc"
                : "asc",
          })),

        // Utility actions
        reset: () => set(initialState),
        exportList: (format: "json" | "csv" | "excel") => {
          // TODO: Implement export functionality
          console.log("Exporting list in format:", format);
        },
        importList: (data: unknown, format: "json" | "csv" | "excel") => {
          // TODO: Implement import functionality
          console.log("Importing list in format:", format, data);
        },

        // Missing bulk operations
        duplicateItem: (id: string) => {
          const { currentList } = get();
          if (!currentList) return;

          const item = currentList.items.find((item) => item.id === id);
          if (item) {
            const duplicatedItem = {
              ...item,
              id: `${item.id}_copy_${Date.now()}`,
            };
            set({
              currentList: {
                ...currentList,
                items: [...currentList.items, duplicatedItem],
                updatedAt: new Date().toISOString(),
              },
            });
          }
        },

        moveItem: (fromIndex: number, toIndex: number) => {
          const { currentList } = get();
          if (!currentList) return;

          const items = [...currentList.items];
          if (fromIndex >= 0 && fromIndex < items.length) {
            const [item] = items.splice(fromIndex, 1);
            if (item) {
              items.splice(toIndex, 0, item);
            }

            set({
              currentList: {
                ...currentList,
                items,
                updatedAt: new Date().toISOString(),
              },
            });
          }
        },

        bulkUpdateItems: (ids: string[], updates: Partial<CuttingListItem>) => {
          const { currentList } = get();
          if (!currentList) return;

          const items = currentList.items.map((item) =>
            ids.includes(item.id) ? { ...item, ...updates } : item,
          );

          set({
            currentList: {
              ...currentList,
              items,
              updatedAt: new Date().toISOString(),
            },
          });
        },

        bulkDeleteItems: (ids: string[]) => {
          const { currentList } = get();
          if (!currentList) return;

          const items = currentList.items.filter(
            (item) => !ids.includes(item.id),
          );

          set({
            currentList: {
              ...currentList,
              items,
              updatedAt: new Date().toISOString(),
            },
          });
        },

        bulkMoveItems: (ids: string[], targetListId: string) => {
          const { currentList, lists } = get();
          if (!currentList) return;

          // Find items to move
          const itemsToMove = currentList.items.filter((item) =>
            ids.includes(item.id),
          );

          // Remove items from current list
          const updatedCurrentList = {
            ...currentList,
            items: currentList.items.filter((item) => !ids.includes(item.id)),
            updatedAt: new Date().toISOString(),
          };

          // Find target list and add items
          const updatedLists = lists.map((list) => {
            if (list.id === targetListId) {
              return {
                ...list,
                items: [...list.items, ...itemsToMove],
                updatedAt: new Date().toISOString(),
              };
            }
            if (list.id === currentList.id) {
              return updatedCurrentList;
            }
            return list;
          });

          set({
            currentList: updatedCurrentList,
            lists: updatedLists,
          });
        },
      }),
      {
        name: "lemnix-cutting-list-store",
        partialize: (state) => ({
          lists: state.lists,
          currentList: state.currentList,
          sortBy: state.sortBy,
          sortOrder: state.sortOrder,
        }),
      },
    ),
    {
      name: "lemnix-cutting-list-store",
    },
  ),
);
