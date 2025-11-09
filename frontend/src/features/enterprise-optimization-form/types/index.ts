/**
 * @fileoverview Enterprise Optimization Form Types
 * @module EnterpriseOptimizationForm/Types
 * @version 1.0.0
 */

import {
  OptimizationItem,
  OptimizationFormData,
  CuttingListItem,
} from "@/shared/types/legacy";
import type { CostModel } from "@/entities/optimization/model/types";

// Form specific types
export interface OptimizationParams {
  algorithm: AlgorithmType;
  objectives: OptimizationObjective[];
  constraints: OptimizationConstraints;
  stockLengths: number[];
  unit: LengthUnit;
  performance?: PerformanceSettings; // NEW: GA v1.7.1 support
  performanceSettings: PerformanceSettings; // ✅ P1-7: GA Advanced Settings
  costModel: CostModel; // ✅ P1-6: Cost Model Configuration
}

// Performance settings for GA
export interface PerformanceSettings {
  maxExecutionTime?: number;
  parallelProcessing?: boolean;
  cacheResults?: boolean;
  populationSize?: number;
  generations?: number;
  mutationRate?: number;
  crossoverRate?: number;
}

export interface OptimizationObjective {
  type: ObjectiveType;
  weight: number;
  priority: PriorityLevel;
}

export interface OptimizationConstraints {
  kerfWidth: number;
  startSafety: number;
  endSafety: number;
  minScrapLength: number;
  maxWastePercentage: number;
  maxCutsPerStock: number;
}

// Union types for better type safety (Use @/entities/optimization/AlgorithmType for new code)
export type AlgorithmType = "ffd" | "bfd" | "genetic" | "pooling"; // Updated to match backend
export type LengthUnit = "mm" | "cm" | "m";
export type ObjectiveType =
  | "minimize-waste"
  | "maximize-efficiency"
  | "minimize-cost"
  | "minimize-time"
  | "maximize-quality";
export type PriorityLevel = "high" | "medium" | "low";
export type SnackbarSeverity = "success" | "error" | "warning" | "info";

// Algorithm metadata
export interface AlgorithmInfo {
  value: AlgorithmType;
  label: string;
  description: string;
  speed: number;
  accuracy: number;
}

// Objective metadata
export interface ObjectiveInfo {
  type: ObjectiveType;
  label: string;
  icon: React.ReactNode;
}

// Form props
export interface EnterpriseOptimizationFormProps {
  onSubmit: (data: OptimizationFormData) => void;
  isLoading?: boolean;
  initialItems?: OptimizationItem[];
  replaceItems?: boolean;
}

// Form state
export interface FormState {
  cuttingList: CuttingListItem[];
  params: OptimizationParams;
  compareMode: boolean;
  selectedAlgorithms: AlgorithmType[];
  errors: Record<string, string>;
  isValid: boolean;
}

// UI state
export interface UIState {
  showSnackbar: boolean;
  snackbarMessage: string;
  snackbarSeverity: SnackbarSeverity;
}

// Validation errors
export interface ValidationErrors {
  cuttingList?: string;
  stockLengths?: string;
  kerfWidth?: string;
  maxWastePercentage?: string;
  [key: string]: string | undefined;
}

// Re-export shared types for convenience
export type { OptimizationItem, OptimizationFormData, CuttingListItem };
