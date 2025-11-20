/**
 * @fileoverview App Types
 * @module App/Types
 * @version 2.0.0 - Enterprise Grade Modular Design
 */

import {
  OptimizationItem,
  OptimizationResult,
} from "@/entities/optimization/model/types";

/**
 * Snackbar state interface
 */
export interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

/**
 * App state interface
 */
export interface AppState {
  activePage: string;
  isLoading: boolean;
  snackbar: SnackbarState;
  excelItems: OptimizationItem[];
  optimizationResult: OptimizationResult | null;
}

/**
 * App router props
 */
export interface AppRouterProps {
  // No specific props needed
}

/**
 * Main app props
 */
export interface AppProps {
  // No specific props needed
}

/**
 * Page change handler type
 */
export type PageChangeHandler = (page: string) => void;

/**
 * Optimization handler type
 */
export type OptimizationHandler = (items: OptimizationItem[]) => Promise<void>;

/**
 * Work orders selected handler type
 */
export type WorkOrdersSelectedHandler = (items: OptimizationItem[]) => void;

/**
 * Snackbar close handler type
 */
export type SnackbarCloseHandler = () => void;
