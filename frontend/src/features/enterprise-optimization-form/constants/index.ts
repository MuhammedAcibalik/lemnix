/**
 * @fileoverview Enterprise Optimization Form Constants
 * @module EnterpriseOptimizationForm/Constants
 * @version 1.0.0
 */

import React from 'react';
import { 
  RecyclingOutlined as WasteIcon,
  Speed as SpeedIcon,
  AttachMoney as CostIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { AlgorithmInfo, ObjectiveInfo, OptimizationParams } from '../types';

// Algorithm configurations (DEPRECATED - Use ALGORITHM_CATALOG from @/entities/optimization)
// Kept for backward compatibility
export const ALGORITHMS: AlgorithmInfo[] = [
  { 
    value: 'ffd',
    label: 'First Fit Decreasing (FFD)',
    description: 'Hızlı ve etkili, büyük parçalardan başlar',
    speed: 5,
    accuracy: 4
  },
  { 
    value: 'bfd',
    label: 'Best Fit Decreasing (BFD)',
    description: 'En iyi uyumu bulur, düşük atık',
    speed: 4,
    accuracy: 5
  },
  { 
    value: 'genetic',
    label: 'Genetic Algorithm v1.7.1',
    description: 'En iyi kalite, çoklu hedef optimizasyonu (100/100 Score)',
    speed: 2,
    accuracy: 5
  },
  { 
    value: 'pooling', // Changed from 'branch-and-bound' to match backend
    label: 'Profile Pooling',
    description: 'Profil bazlı gruplama ve optimizasyon',
    speed: 3,
    accuracy: 4
  }
];

// Optimization objectives
export const OBJECTIVES: ObjectiveInfo[] = [
  { type: 'minimize-waste', label: 'Atık Minimizasyonu', icon: React.createElement(WasteIcon) },
  { type: 'maximize-efficiency', label: 'Verimlilik Maksimizasyonu', icon: React.createElement(SpeedIcon) },
  { type: 'minimize-cost', label: 'Maliyet Minimizasyonu', icon: React.createElement(CostIcon) },
  { type: 'minimize-time', label: 'Zaman Minimizasyonu', icon: React.createElement(TimelineIcon) }
];

// Default form parameters
export const DEFAULT_PARAMS: OptimizationParams = {
  algorithm: 'genetic',
  objectives: [
    { type: 'minimize-waste', weight: 0.4, priority: 'high' },
    { type: 'maximize-efficiency', weight: 0.3, priority: 'high' },
    { type: 'minimize-cost', weight: 0.2, priority: 'medium' },
    { type: 'minimize-time', weight: 0.1, priority: 'low' }
  ],
  constraints: {
    kerfWidth: 0, // ✅ FIX: Kesim listelerindeki ölçüler zaten kerf payı eklenmiş
    startSafety: 2.0,
    endSafety: 2.0,
    minScrapLength: 75,
    maxWastePercentage: 10,
    maxCutsPerStock: 50
  },
  stockLengths: [6100, 6500, 7000],
  unit: 'mm',
  // ✅ P1-7: GA Advanced Settings (Adaptive defaults)
  performanceSettings: {
    populationSize: undefined, // Backend auto-tune
    generations: undefined, // Backend auto-tune
    mutationRate: 0.15,
    crossoverRate: 0.8,
  },
  // ✅ P1-6: Cost Model (Industry standard defaults)
  costModel: {
    materialCostPerMeter: 50.0,
    cuttingCostPerCut: 2.5,
    setupCostPerStock: 15.0,
    laborCostPerHour: 100.0,
    wasteCostPerMeter: 10.0,
  },
};

// Validation limits
export const VALIDATION_LIMITS = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 10000,
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 1000,
  MIN_TOTAL_LENGTH: 1,
  MAX_TOTAL_LENGTH: 10000000,
  MIN_STOCK_LENGTH: 100,
  MAX_STOCK_LENGTH: 20000,
  MAX_INPUT_LENGTH: 100,
  MIN_WASTE_PERCENTAGE: 0,
  MAX_WASTE_PERCENTAGE: 100
} as const;

// No sample items - use real data only
export const SAMPLE_ITEMS: Array<{ 
  length: number; 
  quantity: number; 
  profileType: string;
  workOrderId?: string;
  color?: string;
  version?: string;
  size?: string;
  cuttingPattern?: string;
}> = [];
