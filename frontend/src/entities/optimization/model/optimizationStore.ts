/**
 * LEMNİX Optimization Entity Store
 * UI state management for optimization (NOT server state)
 *
 * @module entities/optimization/model
 * @version 1.0.0 - FSD Compliant
 * @description
 * This store only manages UI state. Server state is managed by React Query.
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { AlgorithmType } from "./types";

/**
 * Optimization UI state
 */
interface OptimizationUIState {
  // UI preferences
  readonly compareMode: boolean;
  readonly selectedAlgorithms: ReadonlyArray<AlgorithmType>;
  readonly viewMode: "table" | "visualization" | "both";
  readonly showRecommendations: boolean;
  readonly expandedCuts: ReadonlySet<string>;
}

/**
 * Optimization UI actions
 */
interface OptimizationUIActions {
  // Compare mode
  setCompareMode: (enabled: boolean) => void;
  setSelectedAlgorithms: (algorithms: ReadonlyArray<AlgorithmType>) => void;
  toggleAlgorithm: (algorithm: AlgorithmType) => void;

  // View mode
  setViewMode: (mode: OptimizationUIState["viewMode"]) => void;

  // UI preferences
  setShowRecommendations: (show: boolean) => void;
  toggleCutExpanded: (cutId: string) => void;
  expandAllCuts: (cutIds: ReadonlyArray<string>) => void;
  collapseAllCuts: () => void;

  // Reset
  reset: () => void;
}

/**
 * Initial state
 */
const initialState: OptimizationUIState = {
  compareMode: false,
  selectedAlgorithms: ["genetic"],
  viewMode: "both",
  showRecommendations: true,
  expandedCuts: new Set(),
};

/**
 * Optimization UI store
 *
 * @example
 * ```tsx
 * const { compareMode, setCompareMode } = useOptimizationUI();
 *
 * <Switch checked={compareMode} onChange={(e) => setCompareMode(e.target.checked)} />
 * ```
 */
export const useOptimizationUI = create<
  OptimizationUIState & OptimizationUIActions
>()(
  devtools(
    (set) => ({
      ...initialState,

      // Compare mode
      setCompareMode: (enabled) => set({ compareMode: enabled }),

      setSelectedAlgorithms: (algorithms) =>
        set({ selectedAlgorithms: algorithms }),

      toggleAlgorithm: (algorithm) =>
        set((state) => {
          const current = [...state.selectedAlgorithms];
          const index = current.indexOf(algorithm);

          if (index === -1) {
            current.push(algorithm);
          } else if (current.length > 1) {
            // Keep at least one algorithm selected
            current.splice(index, 1);
          }

          return { selectedAlgorithms: current };
        }),

      // View mode
      setViewMode: (mode) => set({ viewMode: mode }),

      // UI preferences
      setShowRecommendations: (show) => set({ showRecommendations: show }),

      toggleCutExpanded: (cutId) =>
        set((state) => {
          const expanded = new Set(state.expandedCuts);
          if (expanded.has(cutId)) {
            expanded.delete(cutId);
          } else {
            expanded.add(cutId);
          }
          return { expandedCuts: expanded };
        }),

      expandAllCuts: (cutIds) =>
        set({
          expandedCuts: new Set(cutIds),
        }),

      collapseAllCuts: () =>
        set({
          expandedCuts: new Set(),
        }),

      // Reset
      reset: () => set(initialState),
    }),
    {
      name: "optimization-ui-store",
    },
  ),
);
