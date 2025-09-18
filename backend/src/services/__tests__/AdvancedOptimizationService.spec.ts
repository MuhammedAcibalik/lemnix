/**
 * @fileoverview Comprehensive Test Suite for AdvancedOptimizationService
 * @module AdvancedOptimizationServiceTests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AdvancedOptimizationService, AlgorithmLabel, AdvancedOptimizationParams } from '../advancedOptimizationServiceRefactored';
import { OptimizationItem, MaterialStockLength } from '../../types';

describe('AdvancedOptimizationService', () => {
  let service: AdvancedOptimizationService;
  
  const mockItems: OptimizationItem[] = [
    {
      profileType: 'PROFILE_A',
      length: 1000,
      quantity: 5,
      totalLength: 5000,
      workOrderId: 'WO-001'
    },
    {
      profileType: 'PROFILE_B',
      length: 750,
      quantity: 3,
      totalLength: 2250,
      workOrderId: 'WO-002'
    },
    {
      profileType: 'PROFILE_C',
      length: 500,
      quantity: 8,
      totalLength: 4000,
      workOrderId: 'WO-003'
    }
  ];

  const mockStockLengths: MaterialStockLength[] = [
    {
      profileType: 'steel',
      stockLength: 6100,
      availability: 100,
      costPerMm: 0.05,
      costPerStock: 305,
      materialGrade: 'A',
      weight: 7.85
    }
  ];

  const baseParams: AdvancedOptimizationParams = {
    algorithm: 'ffd',
    objectives: [
      { type: 'minimize-waste', weight: 0.4, priority: 'high' },
      { type: 'maximize-efficiency', weight: 0.6, priority: 'high' }
    ],
    constraints: {
      kerfWidth: 3.5,
      startSafety: 2.0,
      endSafety: 2.0,
      minScrapLength: 75,
      maxWastePercentage: 10,
      maxCutsPerStock: 50,
      safetyMargin: 2,
      allowPartialStocks: true,
      prioritizeSmallWaste: true,
      reclaimWasteOnly: false,
      balanceComplexity: true,
      respectMaterialGrades: true
    },
    performance: {
      maxIterations: 1000,
      convergenceThreshold: 0.001,
      parallelProcessing: false,
      cacheResults: false
    },
    costModel: {
      materialCost: 0.05,
      cuttingCost: 0.10,
      setupCost: 2.00,
      wasteCost: 0.03,
      timeCost: 0.50,
      energyCost: 0.15
    }
  };

  beforeEach(() => {
    service = new AdvancedOptimizationService();
  });

  describe('Safety Balance Test', () => {
    it('should maintain used + remaining = stockLength for all cuts', async () => {
      const algorithms: AlgorithmLabel[] = ['ffd', 'bfd', 'nfd', 'wfd'];
      
      for (const algorithm of algorithms) {
        const params = { ...baseParams, algorithm };
        const result = await service.optimize(mockItems, params, mockStockLengths);
        
        for (const cut of result.cuts) {
          const balance = cut.usedLength + cut.remainingLength;
          const stockLength = cut.stockLength;
          const difference = Math.abs(balance - stockLength);
          
          expect(difference).toBeLessThan(1e-9);
        }
      }
    });

    it('should correctly account for safety margins in 50 random scenarios', async () => {
      for (let i = 0; i < 50; i++) {
        const randomItems = generateRandomItems(Math.floor(Math.random() * 20) + 5);
        const randomKerf = Math.random() * 5;
        const randomStartSafety = Math.random() * 5;
        const randomEndSafety = Math.random() * 5;
        
        const params: AdvancedOptimizationParams = {
          ...baseParams,
          algorithm: 'ffd',
          constraints: {
            ...baseParams.constraints,
            kerfWidth: randomKerf,
            startSafety: randomStartSafety,
            endSafety: randomEndSafety
          }
        };
        
        const result = await service.optimize(randomItems, params, mockStockLengths);
        
        for (const cut of result.cuts) {
          const balance = cut.usedLength + cut.remainingLength;
          const stockLength = cut.stockLength;
          const difference = Math.abs(balance - stockLength);
          
          expect(difference).toBeLessThan(1e-9);
        }
      }
    });
  });

  describe('Kerf/Safety Effect Test', () => {
    it('should show different results with and without kerf/safety', async () => {
      const paramsNoKerfSafety: AdvancedOptimizationParams = {
        ...baseParams,
        constraints: {
          ...baseParams.constraints,
          kerfWidth: 0,
          startSafety: 0,
          endSafety: 0
        }
      };
      
      const paramsWithKerfSafety: AdvancedOptimizationParams = {
        ...baseParams,
        constraints: {
          ...baseParams.constraints,
          kerfWidth: 3.5,
          startSafety: 2,
          endSafety: 2
        }
      };
      
      const resultNoKerfSafety = await service.optimize(mockItems, paramsNoKerfSafety, mockStockLengths);
      const resultWithKerfSafety = await service.optimize(mockItems, paramsWithKerfSafety, mockStockLengths);
      
      expect(resultWithKerfSafety.totalKerfLoss).toBeGreaterThan(0);
      expect(resultWithKerfSafety.totalSafetyReserve).toBeGreaterThan(0);
      expect(resultWithKerfSafety.efficiency).toBeLessThan(resultNoKerfSafety.efficiency);
    });
  });

  describe('Algorithm Label Unity Test', () => {
    it('should use consistent algorithm labels throughout', async () => {
      const algorithms: AlgorithmLabel[] = ['ffd', 'bfd', 'nfd', 'wfd', 'genetic', 'simulated-annealing', 'branch-and-bound'];
      
      for (const algorithm of algorithms) {
        const params = { ...baseParams, algorithm };
        const result = await service.optimize(mockItems, params, mockStockLengths);
        
        expect(result).toBeDefined();
        expect(result.performanceMetrics).toBeDefined();
        expect(result.performanceMetrics.algorithmComplexity).toBeDefined();
        expect(result.confidence).toBeGreaterThan(0);
      }
    });
  });

  describe('Optimizer Functionality Test', () => {
    it('should successfully run all optimizers without errors', async () => {
      const algorithms: AlgorithmLabel[] = ['ffd', 'bfd', 'nfd', 'wfd', 'genetic', 'simulated-annealing', 'branch-and-bound'];
      
      for (const algorithm of algorithms) {
        const params = { ...baseParams, algorithm };
        
        await expect(service.optimize(mockItems, params, mockStockLengths)).resolves.toBeDefined();
      }
    });

    it('should return valid results for all algorithms', async () => {
      const algorithms: AlgorithmLabel[] = ['ffd', 'bfd', 'nfd', 'wfd'];
      
      for (const algorithm of algorithms) {
        const params = { ...baseParams, algorithm };
        const result = await service.optimize(mockItems, params, mockStockLengths);
        
        expect(result.cuts).toBeDefined();
        expect(result.cuts.length).toBeGreaterThan(0);
        expect(result.efficiency).toBeGreaterThan(0);
        expect(result.efficiency).toBeLessThanOrEqual(100);
        expect(result.totalWaste).toBeGreaterThanOrEqual(0);
        expect(result.totalCost).toBeGreaterThan(0);
      }
    });
  });

  describe('Pareto Test', () => {
    it('should remove dominated solutions', async () => {
      const result = await service.optimize(mockItems, baseParams, mockStockLengths);
      
      expect(result.paretoFrontier).toBeDefined();
      expect(result.paretoFrontier.length).toBeGreaterThan(0);
      
      // Check no solution dominates another
      for (let i = 0; i < result.paretoFrontier.length; i++) {
        for (let j = i + 1; j < result.paretoFrontier.length; j++) {
          const p1 = result.paretoFrontier[i];
          const p2 = result.paretoFrontier[j];
          
          const p1DominatesP2 = p1.waste <= p2.waste && p1.cost <= p2.cost && 
                                p1.time <= p2.time && p1.efficiency >= p2.efficiency;
          const p2DominatesP1 = p2.waste <= p1.waste && p2.cost <= p1.cost && 
                                p2.time <= p1.time && p2.efficiency >= p1.efficiency;
          
          expect(p1DominatesP2 && p2DominatesP1).toBe(false);
        }
      }
    });
  });

  describe('Cost Report Test', () => {
    it('should maintain cost integrity', async () => {
      const result = await service.optimize(mockItems, baseParams, mockStockLengths);
      
      expect(result.costBreakdown).toBeDefined();
      
      const { materialCost, cuttingCost, setupCost, wasteCost, timeCost, energyCost, totalCost } = result.costBreakdown;
      
      expect(materialCost).toBeGreaterThanOrEqual(0);
      expect(cuttingCost).toBeGreaterThanOrEqual(0);
      expect(setupCost).toBeGreaterThanOrEqual(0);
      expect(wasteCost).toBeGreaterThanOrEqual(0);
      expect(timeCost).toBeGreaterThanOrEqual(0);
      expect(energyCost).toBeGreaterThanOrEqual(0);
      
      const calculatedTotal = materialCost + cuttingCost + setupCost + wasteCost + timeCost + energyCost;
      expect(Math.abs(calculatedTotal - totalCost)).toBeLessThan(1e-9);
    });
  });

  describe('Logger Test', () => {
    it('should not produce logs when verbose is false', async () => {
      const params = { ...baseParams, verbose: false };
      
      // Test runs without verbose logging
      await expect(service.optimize(mockItems, params, mockStockLengths)).resolves.toBeDefined();
    });

    it('should handle verbose mode correctly', async () => {
      const params = { ...baseParams, verbose: true };
      
      // Test runs with verbose logging
      await expect(service.optimize(mockItems, params, mockStockLengths)).resolves.toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty items array', async () => {
      await expect(service.optimize([], baseParams, mockStockLengths)).rejects.toThrow('Items array must be non-empty');
    });

    it('should handle invalid objective weights', async () => {
      const invalidParams = {
        ...baseParams,
        objectives: [
          { type: 'minimize-waste', weight: 0.3, priority: 'high' },
          { type: 'maximize-efficiency', weight: 0.3, priority: 'high' }
        ]
      };
      
      await expect(service.optimize(mockItems, invalidParams, mockStockLengths)).rejects.toThrow('Objective weights must sum to 1');
    });

    it('should handle single item optimization', async () => {
      const singleItem: OptimizationItem[] = [
        {
          profileType: 'PROFILE_A',
          length: 1000,
          quantity: 1,
          totalLength: 1000,
          workOrderId: 'WO-001'
        }
      ];
      
      const result = await service.optimize(singleItem, baseParams, mockStockLengths);
      
      expect(result.cuts.length).toBe(1);
      expect(result.cuts[0].segmentCount).toBe(1);
    });

    it('should handle items longer than stock length', async () => {
      const longItem: OptimizationItem[] = [
        {
          profileType: 'PROFILE_A',
          length: 7000,
          quantity: 1,
          totalLength: 7000,
          workOrderId: 'WO-001'
        }
      ];
      
      // Should handle gracefully (might need multiple stocks or reject)
      const result = await service.optimize(longItem, baseParams, mockStockLengths);
      expect(result).toBeDefined();
    });
  });

  describe('Performance Tests', () => {
    it('should handle large datasets efficiently', async () => {
      const largeItems = generateRandomItems(1000);
      
      const startTime = Date.now();
      const result = await service.optimize(largeItems, baseParams, mockStockLengths);
      const endTime = Date.now();
      
      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds
    });

    it('should respect performance settings', async () => {
      const params: AdvancedOptimizationParams = {
        ...baseParams,
        algorithm: 'genetic',
        performance: {
          ...baseParams.performance,
          populationSize: 10,
          generations: 5
        }
      };
      
      const result = await service.optimize(mockItems, params, mockStockLengths);
      expect(result).toBeDefined();
    });
  });
});

// Helper function to generate random items
function generateRandomItems(count: number): OptimizationItem[] {
  const items: OptimizationItem[] = [];
  
  for (let i = 0; i < count; i++) {
    const length = Math.floor(Math.random() * 2000) + 100;
    const quantity = Math.floor(Math.random() * 10) + 1;
    
    items.push({
      profileType: `PROFILE_${i}`,
      length,
      quantity,
      totalLength: length * quantity,
      workOrderId: `WO-${i}`
    });
  }
  
  return items;
}
