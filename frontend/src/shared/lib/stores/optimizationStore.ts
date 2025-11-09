/**
 * @fileoverview Optimization State Management Store
 * @module OptimizationStore
 * @version 1.0.0
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface OptimizationItem {
  id: string;
  workOrderId: string;
  color: string;
  version: string;
  size: string;
  profileType: string;
  length: number;
  quantity: number;
  cuttingPattern: string;
}

export interface OptimizationResult {
  id?: string;
  cuts: Array<{
    id: string;
    stockLength: number;
    segments: Array<{
      id: string;
      length: number;
      quantity: number;
      workOrderId?: string;
      workOrderItemId?: string;
      profileType: string;
    }>;
    usedLength: number;
    remainingLength: number;
    isReclaimable?: boolean;
    workOrderId?: string;
    profileType?: string;
    quantity?: number;
  }>;
  totalStocks: number;
  totalWaste: number;
  totalEfficiency: number;
  totalCost: number;
  algorithm: string;
  executionTime: number;
  timestamp: string;
  metadata?: {
    version: string;
    parameters: Record<string, unknown>;
    environment: string;
  };
}

export interface OptimizationParams {
  algorithm: string;
  objectives: Array<{
    type: string;
    weight: number;
    priority: "low" | "medium" | "high";
  }>;
  constraints: {
    kerfWidth: number;
    startSafety: number;
    endSafety: number;
    minScrapLength: number;
    maxWastePercentage: number;
    maxCutsPerStock: number;
  };
  stockLengths: number[];
  unit: string;
}

interface OptimizationState {
  // Items to optimize
  items: OptimizationItem[];

  // Optimization parameters
  params: OptimizationParams;

  // Results
  results: OptimizationResult[];
  currentResult: OptimizationResult | null;

  // UI state
  loading: boolean;
  error: string | null;

  // Comparison mode
  compareMode: boolean;
  selectedAlgorithms: string[];

  // History
  history: OptimizationResult[];
}

interface OptimizationActions {
  // Items management
  setItems: (items: OptimizationItem[]) => void;
  addItem: (item: OptimizationItem) => void;
  updateItem: (id: string, updates: Partial<OptimizationItem>) => void;
  removeItem: (id: string) => void;
  clearItems: () => void;

  // Parameters management
  setParams: (params: Partial<OptimizationParams>) => void;
  resetParams: () => void;

  // Results management
  setResults: (results: OptimizationResult[]) => void;
  addResult: (result: OptimizationResult) => void;
  setCurrentResult: (result: OptimizationResult | null) => void;
  clearResults: () => void;

  // UI state
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Comparison mode
  setCompareMode: (compare: boolean) => void;
  setSelectedAlgorithms: (algorithms: string[]) => void;

  // History
  addToHistory: (result: OptimizationResult) => void;
  clearHistory: () => void;

  // Utility actions
  reset: () => void;
}

const defaultParams: OptimizationParams = {
  algorithm: "genetic",
  objectives: [
    { type: "minimize-waste", weight: 0.4, priority: "high" },
    { type: "maximize-efficiency", weight: 0.3, priority: "high" },
    { type: "minimize-cost", weight: 0.2, priority: "medium" },
    { type: "minimize-time", weight: 0.1, priority: "low" },
  ],
  constraints: {
    kerfWidth: 3.5,
    startSafety: 2.0,
    endSafety: 2.0,
    minScrapLength: 75,
    maxWastePercentage: 10,
    maxCutsPerStock: 50,
  },
  stockLengths: [6100, 6500, 7000],
  unit: "mm",
};

const initialState: OptimizationState = {
  items: [],
  params: defaultParams,
  results: [],
  currentResult: null,
  loading: false,
  error: null,
  compareMode: false,
  selectedAlgorithms: ["genetic"],
  history: [],
};

export const useOptimizationStore = create<
  OptimizationState & OptimizationActions
>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Items management
      setItems: (items: OptimizationItem[]) => set({ items }),
      addItem: (item: OptimizationItem) =>
        set((state) => ({
          items: [...state.items, item],
        })),
      updateItem: (id: string, updates: Partial<OptimizationItem>) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...updates } : item,
          ),
        })),
      removeItem: (id: string) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      clearItems: () => set({ items: [] }),

      // Parameters management
      setParams: (params: Partial<OptimizationParams>) =>
        set((state) => ({
          params: { ...state.params, ...params },
        })),
      resetParams: () => set({ params: defaultParams }),

      // Results management
      setResults: (results: OptimizationResult[]) => set({ results }),
      addResult: (result: OptimizationResult) =>
        set((state) => ({
          results: [...state.results, result],
          currentResult: result,
        })),
      setCurrentResult: (result: OptimizationResult | null) =>
        set({ currentResult: result }),
      clearResults: () => set({ results: [], currentResult: null }),

      // UI state
      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: string | null) => set({ error }),

      // Comparison mode
      setCompareMode: (compare: boolean) => set({ compareMode: compare }),
      setSelectedAlgorithms: (algorithms: string[]) =>
        set({ selectedAlgorithms: algorithms }),

      // History
      addToHistory: (result: OptimizationResult) =>
        set((state) => ({
          history: [result, ...state.history.slice(0, 9)], // Keep last 10 results
        })),
      clearHistory: () => set({ history: [] }),

      // Utility actions
      reset: () => set(initialState),
    }),
    {
      name: "lemnix-optimization-store",
    },
  ),
);
