/**
 * LEMNİX Optimization Entity Zod Schemas
 * Client-side validation schemas for optimization operations
 * 
 * @module entities/optimization/model
 * @version 1.0.0 - FSD Compliant
 * @description Zod schemas aligned with backend validation
 */

import { z } from 'zod';

/**
 * Algorithm type schema
 */
export const algorithmTypeSchema = z.enum(['ffd', 'bfd', 'genetic', 'pooling']);

/**
 * Objective type schema
 */
export const objectiveTypeSchema = z.enum([
  'minimize-waste',
  'maximize-efficiency',
  'minimize-cost',
  'minimize-time',
  'maximize-quality',
]);

/**
 * Objective priority schema
 */
export const objectivePrioritySchema = z.enum(['low', 'medium', 'high']);

/**
 * Optimization objective schema
 */
export const optimizationObjectiveSchema = z.object({
  type: objectiveTypeSchema,
  weight: z.number().positive('Weight must be positive'),
  priority: objectivePrioritySchema,
});

/**
 * Optimization constraints schema
 */
export const optimizationConstraintsSchema = z.object({
  kerfWidth: z.number().min(0, 'Kerf width must be non-negative'),
  startSafety: z.number().min(0, 'Start safety must be non-negative'),
  endSafety: z.number().min(0, 'End safety must be non-negative'),
  minScrapLength: z.number().min(0, 'Min scrap length must be non-negative'),
  maxWastePercentage: z.number().min(0).max(100, 'Max waste percentage must be 0-100'),
  maxCutsPerStock: z.number().int().positive('Max cuts per stock must be positive integer'),
  allowPartialStocks: z.boolean().optional(),
  prioritizeSmallWaste: z.boolean().optional(),
});

/**
 * Performance settings schema - Enhanced for GA v1.7.1
 */
export const performanceSettingsSchema = z.object({
  maxExecutionTime: z.number().int().min(10).max(300).optional(),
  parallelProcessing: z.boolean().optional(),
  cacheResults: z.boolean().optional(),
  
  // GA-specific parameters
  populationSize: z.number().int().min(10).max(100).optional(),
  generations: z.number().int().min(10).max(200).optional(),
  mutationRate: z.number().min(0.01).max(0.5).optional(),
  crossoverRate: z.number().min(0.5).max(1.0).optional(),
  convergenceThreshold: z.number().positive().optional(),
  stagnationThreshold: z.number().int().positive().optional(),
}).refine(
  (data) => {
    // If GA parameters are provided, algorithm must be 'genetic'
    if (data.populationSize || data.generations || data.mutationRate || data.crossoverRate) {
      // This check will be done at the params level
      return true;
    }
    return true;
  },
  {
    message: 'GA-specific parameters can only be used with genetic algorithm',
  }
);

/**
 * Cost model schema
 */
export const costModelSchema = z.object({
  materialCostPerMeter: z.number().min(0, 'Material cost must be non-negative'),
  cuttingCostPerCut: z.number().min(0, 'Cutting cost must be non-negative'),
  setupCostPerStock: z.number().min(0, 'Setup cost must be non-negative'),
  laborCostPerHour: z.number().min(0, 'Labor cost must be non-negative'),
  wasteCostPerMeter: z.number().min(0, 'Waste cost must be non-negative'),
});

/**
 * Optimization item schema
 */
export const optimizationItemSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  workOrderId: z.string().min(1, 'Work order ID is required'),
  profileType: z.string().min(1, 'Profile type is required'),
  length: z.number().positive('Length must be positive'),
  quantity: z.number().int().positive('Quantity must be positive integer'),
  color: z.string().optional(),
  version: z.string().optional(),
  size: z.string().optional(),
  note: z.string().optional(),
});

/**
 * Material stock length schema
 */
export const materialStockLengthSchema = z.object({
  profileType: z.string().min(1, 'Profile type is required'),
  stockLength: z.number().positive('Stock length must be positive'),
});

/**
 * Optimization parameters schema
 */
export const optimizationParamsSchema = z.object({
  algorithm: algorithmTypeSchema,
  objectives: z.array(optimizationObjectiveSchema).min(1, 'At least one objective is required'),
  constraints: optimizationConstraintsSchema,
  performance: performanceSettingsSchema.optional(),
  costModel: costModelSchema.optional(),
}).refine(
  (data) => {
    // Validate that objectives are provided for genetic algorithm
    if (data.algorithm === 'genetic' && data.objectives.length === 0) {
      return false;
    }
    return true;
  },
  {
    message: 'Genetic algorithm requires at least one optimization objective',
    path: ['objectives'],
  }
).refine(
  (data) => {
    // Validate that total weight is positive
    const totalWeight = data.objectives.reduce((sum, obj) => sum + obj.weight, 0);
    return totalWeight > 0;
  },
  {
    message: 'Total objective weights must be greater than 0',
    path: ['objectives'],
  }
);

/**
 * Optimization request schema (complete validation)
 */
export const optimizationRequestSchema = z.object({
  items: z.array(optimizationItemSchema).min(1, 'At least one item is required'),
  params: optimizationParamsSchema,
  materialStockLengths: z.array(materialStockLengthSchema).optional(),
}).refine(
  (data) => {
    // Validate that items and stock lengths have matching profile types
    if (data.materialStockLengths && data.materialStockLengths.length > 0) {
      const itemProfiles = new Set(data.items.map(item => item.profileType));
      const stockProfiles = new Set(data.materialStockLengths.map(stock => stock.profileType));
      
      // Every item profile should have at least one stock length
      for (const profile of itemProfiles) {
        if (!stockProfiles.has(profile)) {
          return false;
        }
      }
    }
    return true;
  },
  {
    message: 'All item profile types must have corresponding stock lengths',
    path: ['materialStockLengths'],
  }
).refine(
  (data) => {
    // Validate item count against algorithm recommendations
    const itemCount = data.items.reduce((sum, item) => sum + item.quantity, 0);
    
    if (data.params.algorithm === 'ffd' && itemCount > 50) {
      return false; // Warning: FFD not recommended for > 50 items
    }
    if (data.params.algorithm === 'genetic' && itemCount < 10) {
      return false; // Warning: Genetic overkill for < 10 items
    }
    
    return true;
  },
  {
    message: 'Item count may not be optimal for selected algorithm',
    path: ['params', 'algorithm'],
  }
);

/**
 * Type inference helpers
 */
export type OptimizationRequestInput = z.infer<typeof optimizationRequestSchema>;
export type OptimizationParamsInput = z.infer<typeof optimizationParamsSchema>;
export type PerformanceSettingsInput = z.infer<typeof performanceSettingsSchema>;
export type OptimizationObjectiveInput = z.infer<typeof optimizationObjectiveSchema>;
export type OptimizationItemInput = z.infer<typeof optimizationItemSchema>;

/**
 * Validation helpers
 */
export function validateOptimizationRequest(data: unknown) {
  return optimizationRequestSchema.safeParse(data);
}

export function validatePerformanceSettings(data: unknown) {
  return performanceSettingsSchema.safeParse(data);
}

export function validateOptimizationObjectives(data: unknown) {
  return z.array(optimizationObjectiveSchema).safeParse(data);
}

/**
 * Default values for forms
 */
export const DEFAULT_CONSTRAINTS = {
  kerfWidth: 3,
  startSafety: 5,
  endSafety: 5,
  minScrapLength: 50,
  maxWastePercentage: 20,
  maxCutsPerStock: 20,
  allowPartialStocks: false,
  prioritizeSmallWaste: true,
} as const;

export const DEFAULT_OBJECTIVES = [
  { type: 'maximize-efficiency' as const, weight: 0.5, priority: 'high' as const },
  { type: 'minimize-waste' as const, weight: 0.3, priority: 'medium' as const },
  { type: 'minimize-cost' as const, weight: 0.2, priority: 'medium' as const },
] as const;

export const DEFAULT_PERFORMANCE_SETTINGS = {
  maxExecutionTime: 60,
  parallelProcessing: false,
  cacheResults: true,
} as const;

