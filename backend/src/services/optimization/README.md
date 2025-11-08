# 🎯 LEMNİX Optimization Service v5.0.0

**Enterprise-grade cutting stock optimization with GPU acceleration**

---

## 📖 Overview

The LEMNİX Optimization Service provides advanced algorithms for solving the 1D cutting stock problem (bin packing). Built with SOLID principles and modular architecture for maximum maintainability and extensibility.

### **Key Features**

- ✅ **4 Production Algorithms** (FFD, BFD, Genetic, Pooling)
- ✅ **GPU Acceleration** (NVIDIA > AMD > Intel auto-detection)
- ✅ **SOLID Architecture** (100% compliance)
- ✅ **Type-Safe** (Strict TypeScript)
- ✅ **Testable** (Pure functions, DI)
- ✅ **Extensible** (Factory pattern, OCP)

---

## 🏗️ Architecture

```
optimization/
├── core/                        # Core infrastructure
│   ├── IOptimizationAlgorithm.ts    # Algorithm interface (DIP, LSP)
│   ├── BaseAlgorithm.ts             # Abstract base (Template Method)
│   ├── OptimizationContext.ts       # Immutable context (Value Object)
│   ├── AlgorithmFactory.ts          # Factory + Registry (OCP)
│   └── types.ts                     # Shared types
│
├── helpers/                     # Utility classes
│   ├── StockCalculator.ts           # Stock/kerf calculations
│   ├── WasteAnalyzer.ts             # Waste categorization
│   ├── CostCalculator.ts            # Cost breakdown & Pareto
│   ├── MetricsCalculator.ts         # Performance metrics
│   ├── GPUDetector.ts               # GPU vendor detection
│   └── GPUAccelerator.ts            # GPU orchestration
│
├── algorithms/                  # Algorithm implementations
│   ├── FFDAlgorithm.ts              # First Fit Decreasing
│   ├── BFDAlgorithm.ts              # Best Fit Decreasing
│   ├── GeneticAlgorithm.ts          # GPU-accelerated genetic
│   └── PoolingAlgorithm.ts          # Profile pooling
│
└── AdvancedOptimizationService.ts   # Thin orchestrator
```

---

## 🚀 Quick Start

### **Basic Usage**

```typescript
import { AdvancedOptimizationService } from './services/optimization/AdvancedOptimizationService';
import { logger } from './services/logger';

// Initialize service
const service = new AdvancedOptimizationService(logger);

// Define items to cut
const items: OptimizationItem[] = [
  { profileType: 'U-Profile', length: 2500, quantity: 10, workOrderId: 'WO-001' },
  { profileType: 'U-Profile', length: 1800, quantity: 15, workOrderId: 'WO-001' },
  { profileType: 'L-Profile', length: 3200, quantity: 8, workOrderId: 'WO-002' }
];

// Configure optimization
const params: AdvancedOptimizationParams = {
  algorithm: 'ffd', // 'ffd' | 'bfd' | 'genetic' | 'pooling'
  objectives: [
    { type: 'maximize-efficiency', weight: 0.5, priority: 'high' },
    { type: 'minimize-waste', weight: 0.3, priority: 'medium' },
    { type: 'minimize-cost', weight: 0.2, priority: 'medium' }
  ],
  performance: {
    maxIterations: 1000,
    convergenceThreshold: 0.001,
    parallelProcessing: true,
    cacheResults: true
  }
};

// Run optimization
const result = await service.optimize(items, params);

console.log(`Efficiency: ${result.efficiency.toFixed(2)}%`);
console.log(`Cuts: ${result.cuts.length}`);
console.log(`Total Cost: $${result.totalCost.toFixed(2)}`);
```

### **GPU-Accelerated Genetic**

```typescript
const params: AdvancedOptimizationParams = {
  algorithm: 'genetic',
  objectives: [{ type: 'maximize-efficiency', weight: 1.0, priority: 'high' }],
  performance: {
    populationSize: 50,      // Auto-adjusted based on GPU
    generations: 100,        // Auto-adjusted based on GPU
    maxIterations: 10000,
    convergenceThreshold: 0.001,
    parallelProcessing: true,
    cacheResults: true
  }
};

const result = await service.optimize(items, params);
// ✅ Auto-detects GPU: NVIDIA RTX 4090 (2.5x population, 2x generations)
// ✅ Fallback to CPU if no GPU available
```

---

## 🎯 Algorithms

### **1. First Fit Decreasing (FFD)** ⚡

**Best for:** General-purpose optimization, balanced quality/speed

```typescript
params.algorithm = 'ffd';
```

- **Complexity:** O(n²)
- **Scalability:** 8/10
- **Use Cases:** Medium-large datasets, balanced optimization
- **Pros:** Fast, reliable, industry-standard
- **Cons:** Not optimal for very large datasets

---

### **2. Best Fit Decreasing (BFD)** 🎯

**Best for:** Waste minimization, quality-focused

```typescript
params.algorithm = 'bfd';
```

- **Complexity:** O(n²)
- **Scalability:** 8/10
- **Use Cases:** High-value materials, quality over speed
- **Pros:** Minimizes waste per placement
- **Cons:** Slightly slower than FFD

---

### **3. Genetic Algorithm (GPU)** 🚀

**Best for:** Complex problems, GPU available, multi-objective

```typescript
params.algorithm = 'genetic';
```

- **Complexity:** O(n² × g) where g = generations
- **Scalability:** 7/10
- **Use Cases:** Large optimization problems, advanced users
- **Pros:** GPU-accelerated, multi-objective, high quality
- **Cons:** Requires 20+ items for GPU, slower without GPU

**GPU Support:**
- ✅ **NVIDIA** (Discrete): 2.5x population, 2x generations
- ✅ **AMD** (Discrete): 2x population, 1.5x generations
- ✅ **Intel** (Integrated): 1x population, 1x generations
- ✅ **CPU Fallback**: Automatic for small problems or no GPU

---

### **4. Profile Pooling** 🔄

**Best for:** Multi-work-order scenarios, same-profile consolidation

```typescript
params.algorithm = 'pooling';
```

- **Complexity:** O(n² × p) where p = number of pools
- **Scalability:** 8/10
- **Use Cases:** Batch optimization, multiple work orders
- **Pros:** Consolidates same profiles, minimizes mixed bars
- **Cons:** Only beneficial for multi-work-order scenarios

---

## 🔧 Advanced Features

### **Algorithm Metadata API**

```typescript
// Get algorithm info
const info = service.getAlgorithmInfo('genetic');
console.log(info.displayName); // "Genetic Algorithm (GPU-Accelerated)"
console.log(info.complexity);   // "O(n²)"
console.log(info.recommendedFor); // ['Complex problems', 'GPU available', ...]

// Get all algorithms
const all = service.getAvailableAlgorithms();

// Get recommendation based on item count
const recommended = service.getRecommendedAlgorithm(itemCount);
```

### **Custom Constraints**

```typescript
const params: AdvancedOptimizationParams = {
  algorithm: 'ffd',
  constraints: {
    kerfWidth: 3.5,              // mm
    startSafety: 2.0,            // mm
    endSafety: 2.0,              // mm
    minScrapLength: 75,          // mm
    energyPerStock: 0.5,         // kWh
    maxWastePercentage: 10,      // %
    maxCutsPerStock: 50,
    allowPartialStocks: true,
    prioritizeSmallWaste: true
  },
  objectives: [...]
};
```

### **Custom Cost Model**

```typescript
const params: AdvancedOptimizationParams = {
  algorithm: 'bfd',
  costModel: {
    materialCost: 0.05,    // $ per mm
    cuttingCost: 0.10,     // $ per cut
    setupCost: 2.00,       // $ per stock
    wasteCost: 0.03,       // $ per mm waste
    timeCost: 0.50,        // $ per minute
    energyCost: 0.15       // $ per kWh
  },
  objectives: [...]
};
```

---

## 📊 Result Structure

```typescript
interface AdvancedOptimizationResult {
  algorithm: OptimizationAlgorithm;
  cuts: Cut[];
  efficiency: number;                    // 0-100%
  totalWaste: number;                    // mm
  totalCost: number;                     // $
  stockCount: number;
  totalLength: number;                   // mm
  executionTimeMs: number;               // ms
  totalSegments: number;
  averageCutsPerStock: number;
  
  // Cost breakdown
  costBreakdown: {
    materialCost: number;
    cuttingCost: number;
    setupCost: number;
    wasteCost: number;
    timeCost: number;
    energyCost: number;
    totalCost: number;
  };
  
  // Performance metrics
  performanceMetrics: {
    algorithmComplexity: 'O(n)' | 'O(n²)' | 'O(n³)' | 'O(2^n)';
    convergenceRate: number;
    cpuUsage: number;
    memoryUsage: number;
    scalability: number;
  };
  
  // Quality metrics
  qualityScore: number;                  // 0-100
  confidence: number;                    // 0-100
  optimizationScore: number;             // 0-100
  
  // Waste analysis
  wasteDistribution: WasteDistribution;
  detailedWasteAnalysis: DetailedWasteAnalysis;
  reclaimableWastePercentage: number;
  
  // Additional
  paretoFrontier: ParetoPoint[];
  recommendations: AdvancedOptimizationRecommendation[];
  constraints: EnhancedConstraints;
}
```

---

## 🧪 Testing

### **Unit Tests**

```typescript
import { StockCalculator } from './helpers/StockCalculator';

describe('StockCalculator', () => {
  test('calculates max pieces correctly', () => {
    const max = StockCalculator.calculateMaxPiecesOnBar(
      500,    // itemLength
      6000,   // stockLength
      3.5,    // kerfWidth
      2,      // startSafety
      2       // endSafety
    );
    expect(max).toBe(11);
  });
  
  test('calculates efficiency correctly', () => {
    const efficiency = StockCalculator.calculateEfficiency(
      10000,  // totalStockLength
      500     // totalWaste
    );
    expect(efficiency).toBe(95);
  });
});
```

### **Integration Tests**

```typescript
import { AdvancedOptimizationService } from './AdvancedOptimizationService';

describe('AdvancedOptimizationService', () => {
  let service: AdvancedOptimizationService;
  
  beforeEach(() => {
    service = new AdvancedOptimizationService(logger);
  });
  
  test('optimizes with FFD algorithm', async () => {
    const items = [...]; // Test items
    const params = { algorithm: 'ffd', objectives: [...] };
    
    const result = await service.optimize(items, params);
    
    expect(result.algorithm).toBe('ffd');
    expect(result.efficiency).toBeGreaterThan(90);
    expect(result.cuts.length).toBeGreaterThan(0);
  });
});
```

---

## 🔌 Extension Guide

### **Adding a New Algorithm**

1. **Create algorithm class:**

```typescript
// algorithms/MyNewAlgorithm.ts
import { BaseAlgorithm } from '../core/BaseAlgorithm';

export class MyNewAlgorithm extends BaseAlgorithm {
  public readonly name = OptimizationAlgorithm.MY_NEW_ALGORITHM;
  public readonly complexity = 'O(n)' as const;
  public readonly scalability = 10;

  public async optimize(context: OptimizationContext): Promise<AdvancedOptimizationResult> {
    // Your implementation
    const preprocessed = this.preprocessItems(context.items);
    const expanded = this.expandItemsByQuantity(preprocessed);
    
    // Custom logic...
    
    return this.createResult(cuts, context);
  }
}
```

2. **Register in service:**

```typescript
// AdvancedOptimizationService.ts
private registerAlgorithms(): void {
  this.algorithmFactory.register(MyNewAlgorithm, {
    name: OptimizationAlgorithm.MY_NEW_ALGORITHM,
    displayName: 'My New Algorithm',
    description: 'Fast and efficient',
    complexity: 'O(n)',
    scalability: 10,
    recommendedFor: ['Large datasets'],
    notRecommendedFor: ['Small datasets']
  });
}
```

**Done!** No other files need modification (Open/Closed Principle).

---

## 📚 API Reference

### **AdvancedOptimizationService**

```typescript
class AdvancedOptimizationService {
  constructor(logger?: ILogger);
  
  optimize(
    items: OptimizationItem[],
    params: AdvancedOptimizationParams,
    materialStockLengths?: MaterialStockLength[]
  ): Promise<AdvancedOptimizationResult>;
  
  getAlgorithmInfo(algorithm: AlgorithmLabel): AlgorithmMetadata | undefined;
  getAvailableAlgorithms(): AlgorithmMetadata[];
  getRecommendedAlgorithm(itemCount: number): OptimizationAlgorithm | undefined;
  getDefaultCostModelValue(): CostModel;
}
```

---

## 🐛 Troubleshooting

See [MIGRATION.md](./MIGRATION.md#-troubleshooting) for common issues and solutions.

---

## 📄 License

Proprietary - LEMNİX © 2025

---

**Built with ❤️ using SOLID principles and TypeScript**

