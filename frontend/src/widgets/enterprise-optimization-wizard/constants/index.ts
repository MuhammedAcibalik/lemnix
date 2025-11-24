/**
 * @fileoverview Enterprise Optimization Wizard Constants
 * @module EnterpriseOptimizationWizard/Constants
 * @version 1.0.0
 */

import {
  RecyclingOutlined as WasteIcon,
  Speed as SpeedIcon,
  AttachMoney as CostIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";
import { AlgorithmInfo, ObjectiveInfo, OptimizationParams } from "../types";

// Algorithm configurations - ALIGNED WITH BACKEND (2 algorithms available)
export const ALGORITHMS: AlgorithmInfo[] = [
  {
    value: "bfd",
    label: "Best Fit Decreasing (BFD)",
    description: "Atık minimizasyonu odaklı, kalite öncelikli",
    speed: 4,
    accuracy: 5,
  },
  {
    value: "genetic",
    label: "Genetic Algorithm v1.7.1",
    description: "Evrimsel optimizasyon, en iyi kalite",
    speed: 2,
    accuracy: 5,
  },
];

// Optimization objectives
export const OBJECTIVES: ObjectiveInfo[] = [
  { type: "minimize-waste", label: "Atığı Minimize Et", icon: WasteIcon },
  { type: "minimize-cost", label: "Maliyeti Minimize Et", icon: CostIcon },
  { type: "minimize-time", label: "Zamanı Minimize Et", icon: TimelineIcon },
  {
    type: "maximize-efficiency",
    label: "Verimliliği Maksimize Et",
    icon: SpeedIcon,
  },
];

// Default optimization parameters
export const DEFAULT_PARAMS: OptimizationParams = {
  algorithm: "bfd", // Default algorithm
  objectives: [
    { type: "minimize-waste", weight: 0.4, priority: "high" },
    { type: "maximize-efficiency", weight: 0.3, priority: "high" },
    { type: "minimize-cost", weight: 0.2, priority: "medium" },
    { type: "minimize-time", weight: 0.1, priority: "low" },
  ],
  constraints: {
    kerfWidth: 0, // ✅ FIX: Kesim listelerindeki ölçüler zaten kerf payı eklenmiş
    startSafety: 50.0, // ✅ Askı payı: Baştan 50mm garanti fire
    endSafety: 50.0, // ✅ Askı payı: Sondan 50mm garanti fire (toplam 100mm garanti fire)
    minScrapLength: 75,
    maxWastePercentage: 10,
    maxCutsPerStock: 50,
  },
  stockLengths: [6100, 4100, 3500],
  unit: "mm",
};

// Wizard steps configuration
export const WIZARD_STEPS = [
  "Kesim Listesi Seçimi",
  "Algoritma ve Parametreler",
  "Ön İzleme ve Doğrulama",
  "Optimizasyon Sonuçları",
] as const;

// Performance configuration
export const PERFORMANCE_CONFIG = {
  maxIterations: 1000,
  convergenceThreshold: 0.001,
  parallelProcessing: true,
  cacheResults: true,
  populationSize: 50,
  generations: 100,
} as const;

// Cost model configuration
export const COST_MODEL = {
  materialCost: 0.05,
  cuttingCost: 0.1,
  setupCost: 2.0,
  wasteCost: 0.03,
  timeCost: 0.5,
  energyCost: 0.15,
} as const;

// No sample items - use real data only
export const SAMPLE_CUTTING_ITEMS: Array<{
  id: string;
  workOrderId: string;
  profileType: string;
  length: number;
  quantity: number;
  color: string;
  version: string;
  size: string;
  cuttingPattern: string;
}> = [];

// API endpoints
export const API_ENDPOINTS = {
  CUTTING_LISTS: "http://localhost:3001/api/cutting-list",
  OPTIMIZE: "/api/enterprise/optimize",
  COMPARE: "/api/enterprise/compare",
} as const;

// Validation limits
export const VALIDATION_LIMITS = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 20000,
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 1000,
  MIN_STOCK_LENGTH: 100,
  MAX_STOCK_LENGTH: 20000,
  MIN_WASTE_PERCENTAGE: 0,
  MAX_WASTE_PERCENTAGE: 100,
} as const;
