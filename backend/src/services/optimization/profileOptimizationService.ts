/**
 * @fileoverview Profil Tipi Bazlı Optimizasyon Servisi
 * @module ProfileOptimizationService
 * @version 1.0.0
 * 
 * Aynı profil tiplerindeki parçaları gruplandırıp optimize eder.
 * Örnek: "Kapalı Alt" profilinde 992mm ve 687mm parçaları aynı stoktan keser.
 */

import { OptimizationItem, OptimizationAlgorithm, WasteCategory, Cut, OptimizationResult, CuttingSegment } from '../../types';
import { AdvancedOptimizationService } from './AdvancedOptimizationService';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface PoolingCut {
  readonly id?: string;
  readonly stockLength?: number;
  readonly segments?: readonly CuttingSegment[];
  readonly usedLength?: number;
  readonly remainingLength?: number;
  readonly planLabel?: string;
  readonly segmentCount?: number;
  readonly workOrderBreakdown?: readonly WorkOrderBreakdown[];
}

interface WorkOrderBreakdown {
  readonly workOrderId: string;
}

// Local OptimizationResult interface removed - using global one from types

/**
 * Profil grubu - aynı profil tipindeki parçalar
 */
interface ProfileGroup {
  profileType: string;
  stockLength: number;
  segments: ProfileSegment[];
  totalQuantity: number;
  estimatedWaste: number;
  workOrders: string[];
}

/**
 * Profil segmenti - belirli uzunluktaki parçalar
 */
interface ProfileSegment {
  length: number;
  quantity: number;
  workOrderId: string;
  workOrderItemId?: string | undefined;
}

/**
 * Profil optimizasyon sonucu
 */
export interface ProfileOptimizationResult {
  profileType: string;
  stockLength: number;
  cuts: ProfileCut[];
  totalWaste: number;
  efficiency: number;
  totalCost: number;
  workOrders: string[];
}

/**
 * Profil kesimi
 */
interface ProfileCut {
  id: string;
  stockLength: number;
  segments: ProfileSegment[];
  usedLength: number;
  remainingLength: number;
  planLabel: string;
  segmentCount: number;
  workOrders: string[];
}

// ============================================================================
// PROFILE OPTIMIZATION SERVICE
// ============================================================================

export class ProfileOptimizationService {
  private readonly advancedOptimizationService: AdvancedOptimizationService;
  
  constructor() {
    this.advancedOptimizationService = new AdvancedOptimizationService();
  }
  
  /**
   * Ana optimizasyon metodu - profil tiplerine göre gruplandırır
   */
  public async optimizeByProfileType(items: OptimizationItem[]): Promise<ProfileOptimizationResult[]> {
    console.log(`[ProfileOpt] Starting pooling optimization for ${items.length} items`);
    
    try {
      // Use the new pooling algorithm from AdvancedOptimizationService
      const poolingResult = await this.advancedOptimizationService.optimize(items, {
        algorithm: 'pooling',
        objectives: [
          { type: 'maximize-efficiency', weight: 0.5, priority: 'high' },
          { type: 'minimize-waste', weight: 0.3, priority: 'medium' },
          { type: 'minimize-cost', weight: 0.2, priority: 'medium' }
        ],
        constraints: {
          kerfWidth: 3.5,
          startSafety: 2.0,
          endSafety: 2.0,
          minScrapLength: 75,
          energyPerStock: 0.5,
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
          parallelProcessing: true,
          cacheResults: true
        },
        costModel: this.advancedOptimizationService.getDefaultCostModelValue()
      });
      
      // Convert to ProfileOptimizationResult format
      const result: ProfileOptimizationResult = {
        profileType: 'Pooled Optimization',
        stockLength: 6100,
        cuts: (poolingResult.cuts as Cut[]).map((cut: Cut, index: number) => ({
          id: cut.id || `cut_${index}`,
          stockLength: cut.stockLength || 6100,
          segments: cut.segments || [],
          usedLength: cut.usedLength || 0,
          remainingLength: cut.remainingLength || 0,
          planLabel: cut.planLabel || 'No plan',
          segmentCount: cut.segmentCount || 0,
          workOrders: (cut.workOrderBreakdown as { workOrderId: string | number }[] | undefined)?.map((b: { workOrderId: string | number }) => String(b.workOrderId)) || []
        })),
        totalWaste: poolingResult.totalWaste,
        efficiency: poolingResult.efficiency,
        totalCost: poolingResult.totalCost,
        workOrders: Array.from(new Set((poolingResult.cuts as Cut[]).flatMap((cut: Cut) => 
          (cut.workOrderBreakdown as { workOrderId: string | number }[] | undefined)?.map((b: { workOrderId: string | number }) => String(b.workOrderId)) || []
        )))
      };
      
      console.log(`[ProfileOpt] Pooling optimization completed: ${poolingResult.cuts.length} cuts, ${poolingResult.efficiency.toFixed(2)}% efficiency`);
      
      // Extract profile groups for analysis
      const profileGroups = this.extractProfileGroups(poolingResult as unknown as OptimizationResult);
      console.log(`[ProfileOpt] Extracted ${profileGroups.length} profile groups`);
      
      return [result];
    } catch (error) {
      console.error(`[ProfileOpt] Pooling optimization failed, falling back to legacy method:`, error);
      
      // Fallback to legacy method
      const profileGroups = this.groupByProfileType(items);
      console.log(`[ProfileOpt] Created ${profileGroups.length} profile groups`);
      
      const results: ProfileOptimizationResult[] = [];
      
      profileGroups.forEach((group, index) => {
        console.log(`[ProfileOpt] Optimizing group ${index + 1}: ${group.profileType} (${group.segments.length} segments)`);
        
        const optimization = this.optimizeProfileGroup(group);
        results.push(optimization);
        
        console.log(`[ProfileOpt] Group ${group.profileType}: ${optimization.cuts.length} cuts, ${optimization.efficiency.toFixed(2)}% efficiency`);
      });
      
      return results;
    }
  }

  /**
   * Extract profile groups from pooling result
   */
  private extractProfileGroups(result: OptimizationResult): ProfileGroup[] {
    const poolMap = new Map<string, ProfileGroup>();
    
    result.cuts.forEach((cut: Cut) => {
      const poolKey = cut.poolKey || 'default';
      const profileType = cut.profileType || 'Unknown';
      
      if (!poolMap.has(poolKey)) {
        poolMap.set(poolKey, {
          profileType,
          stockLength: 6100,
          segments: [],
          totalQuantity: 0,
          estimatedWaste: 0,
          workOrders: []
        });
      }
      
      const group = poolMap.get(poolKey)!;
      group.totalQuantity += cut.segmentCount || 0;
      group.estimatedWaste += cut.remainingLength || 0;
      
      // Extract work orders from breakdown
      if (cut.workOrderBreakdown) {
        cut.workOrderBreakdown.forEach((breakdown: { workOrderId: string | number }) => {
          if (!group.workOrders.includes(String(breakdown.workOrderId))) {
            group.workOrders.push(String(breakdown.workOrderId));
          }
        });
      } else if ((cut as { workOrderId?: string }).workOrderId && (cut as { workOrderId?: string }).workOrderId !== 'MIXED') {
        const workOrderId = (cut as { workOrderId?: string }).workOrderId;
        if (workOrderId && !group.workOrders.includes(workOrderId)) {
          group.workOrders.push(workOrderId);
        }
      }
    });
    
    // Calculate efficiency for each group
    poolMap.forEach((group) => {
      const totalStockLength = result.cuts
        .filter((cut: Cut) => (cut.poolKey || 'default') === group.profileType)
        .reduce((sum: number, cut: Cut) => sum + (cut.stockLength || 0), 0);
      
      // Update estimated waste based on actual calculations
      group.estimatedWaste = totalStockLength > 0 ? 
        ((totalStockLength - (totalStockLength - group.estimatedWaste)) / totalStockLength) * 100 : 0;
    });
    
    return Array.from(poolMap.values());
  }
  
  /**
   * Profil tiplerine göre gruplandırma
   */
  private groupByProfileType(items: OptimizationItem[]): ProfileGroup[] {
    const groups = new Map<string, ProfileGroup>();
    
    items.forEach(item => {
      const key = item.profileType;
      
      if (!groups.has(key)) {
        groups.set(key, {
          profileType: item.profileType,
          stockLength: 6100, // Standart stok uzunluğu
          segments: [],
          totalQuantity: 0,
          estimatedWaste: 0,
          workOrders: []
        });
      }
      
      const group = groups.get(key)!;
      
      // Aynı uzunlukta parça var mı kontrol et
      const existingSegment = group.segments.find(s => s.length === item.length);
      
      if (existingSegment) {
        // Mevcut segmenti güncelle
        existingSegment.quantity += item.quantity;
      } else {
        // Yeni segment ekle
        group.segments.push({
          length: item.length,
          quantity: item.quantity,
          workOrderId: item.workOrderId || 'UNKNOWN_WORK_ORDER',
          workOrderItemId: item.productName || undefined
        });
      }
      
      group.totalQuantity += item.quantity;
      
      // Work order'ı ekle (tekrar yoksa)
      const workOrderId = item.workOrderId || 'UNKNOWN_WORK_ORDER';
      if (!group.workOrders.includes(workOrderId)) {
        group.workOrders.push(workOrderId);
      }
    });
    
    // Her grup için tahmini atık hesapla
    groups.forEach(group => {
      group.estimatedWaste = this.calculateEstimatedWaste(group);
    });
    
    return Array.from(groups.values());
  }
  
  /**
   * Tek profil grubu için optimizasyon
   */
  private optimizeProfileGroup(group: ProfileGroup): ProfileOptimizationResult {
    console.log(`[ProfileOpt] Optimizing ${group.profileType} with segments:`, 
      group.segments.map(s => `${s.length}mm x${s.quantity}`));
    
    // Segmentleri uzunluk sırasına göre sırala (büyükten küçüğe)
    const sortedSegments = [...group.segments].sort((a, b) => b.length - a.length);
    
    const cuts: ProfileCut[] = [];
    const remainingSegments = [...sortedSegments];
    
    while (remainingSegments.some(s => s.quantity > 0)) {
      const cut = this.createOptimalCut(group.stockLength, remainingSegments);
      cuts.push(cut);
      
      // Kullanılan segmentlerin miktarını azalt
      cut.segments.forEach(usedSegment => {
        const remainingSegment = remainingSegments.find(s => s.length === usedSegment.length);
        if (remainingSegment) {
          remainingSegment.quantity -= usedSegment.quantity;
        }
      });
    }
    
    // Sonuçları hesapla
    const totalWaste = cuts.reduce((sum, cut) => sum + cut.remainingLength, 0);
    const totalUsed = cuts.reduce((sum, cut) => sum + cut.usedLength, 0);
    const totalStock = cuts.reduce((sum, cut) => sum + cut.stockLength, 0);
    const efficiency = totalStock > 0 ? (totalUsed / totalStock) * 100 : 0;
    const totalCost = this.calculateTotalCost(cuts);
    
    return {
      profileType: group.profileType,
      stockLength: group.stockLength,
      cuts,
      totalWaste,
      efficiency,
      totalCost,
      workOrders: group.workOrders
    };
  }
  
  /**
   * Optimal kesim planı oluştur (First Fit Decreasing algoritması)
   */
  private createOptimalCut(stockLength: number, segments: ProfileSegment[]): ProfileCut {
    const cutSegments: ProfileSegment[] = [];
    let usedLength = 0;
    const cutId = `cut_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const workOrders: string[] = [];
    
    // En büyük parçadan başla
    for (const segment of segments) {
      if (segment.quantity <= 0) continue;
      
      // Bu segment'ten kaç tane sığar?
      const maxFit = Math.floor((stockLength - usedLength) / segment.length);
      const quantityToUse = Math.min(segment.quantity, maxFit);
      
      if (quantityToUse > 0) {
        cutSegments.push({
          length: segment.length,
          quantity: quantityToUse,
          workOrderId: segment.workOrderId,
          workOrderItemId: segment.workOrderItemId
        });
        
        usedLength += segment.length * quantityToUse;
        
        if (!workOrders.includes(segment.workOrderId)) {
          workOrders.push(segment.workOrderId);
        }
      }
    }
    
    const remainingLength = stockLength - usedLength;
    const planLabel = this.generatePlanLabel(cutSegments);
    
    return {
      id: cutId,
      stockLength,
      segments: cutSegments,
      usedLength,
      remainingLength,
      planLabel,
      segmentCount: cutSegments.reduce((sum, s) => sum + s.quantity, 0),
      workOrders
    };
  }
  
  /**
   * Plan etiketi oluştur
   */
  private generatePlanLabel(segments: ProfileSegment[]): string {
    if (segments.length === 0) return 'Boş plan';
    
    // Uzunluk sırasına göre sırala
    const sorted = [...segments].sort((a, b) => b.length - a.length);
    
    return sorted.map(s => `${s.quantity} × ${s.length} mm`).join(' + ');
  }
  
  /**
   * Tahmini atık hesapla
   */
  private calculateEstimatedWaste(group: ProfileGroup): number {
    const totalLength = group.segments.reduce((sum, s) => sum + (s.length * s.quantity), 0);
    const estimatedCuts = Math.ceil(totalLength / group.stockLength);
    const totalStockLength = estimatedCuts * group.stockLength;
    
    return Math.max(0, totalStockLength - totalLength);
  }
  
  /**
   * Toplam maliyet hesapla
   */
  private calculateTotalCost(cuts: ProfileCut[]): number {
    // Basit maliyet hesaplama: her kesim için 50 TL + malzeme maliyeti
    const cuttingCost = cuts.length * 50;
    const materialCost = cuts.reduce((sum, cut) => sum + (cut.stockLength * 0.1), 0); // 0.1 TL/mm
    
    return cuttingCost + materialCost;
  }
  
  /**
   * Profil optimizasyon sonuçlarını birleştir
   */
  public mergeProfileResults(results: ProfileOptimizationResult[]): OptimizationResult {
    const allCuts = results.flatMap(r => r.cuts);
    const totalWaste = results.reduce((sum, r) => sum + r.totalWaste, 0);
    const totalCost = results.reduce((sum, r) => sum + r.totalCost, 0);
    const totalUsed = allCuts.reduce((sum, cut) => sum + cut.usedLength, 0);
    const totalStock = allCuts.reduce((sum, cut) => sum + cut.stockLength, 0);
    const efficiency = totalStock > 0 ? (totalUsed / totalStock) * 100 : 0;
    
    const totalSegments = allCuts.reduce((sum, cut) => sum + cut.segmentCount, 0);
    const averageCutsPerStock = allCuts.length > 0 ? totalSegments / allCuts.length : 0;
    const materialUtilization = totalStock > 0 ? (totalUsed / totalStock) * 100 : 0;
    const cuttingComplexity = allCuts.length > 0 ? totalSegments / allCuts.length : 0;
    const cuttingTime = totalSegments * 2; // 2 dakika per segment
    const setupTime = allCuts.length * 5; // 5 dakika setup per cut
    const totalTime = cuttingTime + setupTime;
    const materialCost = totalStock * 0.1; // 0.1 TL/mm
    const wasteCost = totalWaste * 0.1;
    const laborCost = totalTime * 10; // 10 TL/dakika
    const costPerMeter = totalUsed > 0 ? totalCost / (totalUsed / 1000) : 0; // TL/m
    const qualityScore = 95;

    return {
      cuts: allCuts.map((cut, index) => ({
        id: cut.id,
        cuttingPlanId: `profile_plan_${Date.now()}`,
        stockIndex: index,
        stockLength: cut.stockLength,
        materialType: results.find(r => r.cuts.includes(cut))?.profileType as string || 'Unknown',
        segments: cut.segments.map((s, segIndex) => ({
          id: `${s.workOrderId}-${s.length}`,
          cutId: cut.id,
          sequenceNumber: segIndex + 1,
          profileType: results.find(r => r.cuts.includes(cut))?.profileType as string || 'Unknown',
          length: s.length,
          quantity: s.quantity,
          position: segIndex === 0 ? 0 : cut.segments.slice(0, segIndex).reduce((sum, prev) => sum + prev.length * prev.quantity, 0),
          endPosition: cut.segments.slice(0, segIndex + 1).reduce((sum, prev) => sum + prev.length * prev.quantity, 0),
          tolerance: 0.5,
          workOrderItemId: s.workOrderItemId || s.workOrderId,
          originalLength: s.length,
          qualityCheck: true,
          unitCost: s.length * 0.1, // 0.1 TL/mm
          totalCost: s.length * s.quantity * 0.1
        })),
        segmentCount: cut.segmentCount,
        usedLength: cut.usedLength,
        remainingLength: cut.remainingLength,
        wasteCategory: cut.remainingLength > 500 ? WasteCategory.EXCESSIVE : 
                      cut.remainingLength > 300 ? WasteCategory.LARGE :
                      cut.remainingLength > 150 ? WasteCategory.MEDIUM :
                      cut.remainingLength > 50 ? WasteCategory.SMALL : WasteCategory.MINIMAL,
        isReclaimable: cut.remainingLength > 200,
        estimatedCuttingTime: cut.segmentCount * 2, // 2 dakika per segment
        setupTime: 5, // 5 dakika setup
        kerfLoss: cut.segmentCount * 3, // 3mm kerf per cut
        safetyMargin: 10, // 10mm safety margin
        qualityScore: 95,
        tolerance: 0.5,
        toleranceCheck: true,
        sequence: index + 1,
        workOrderId: cut.workOrders[0] || 'UNKNOWN_WORK_ORDER',
        planLabel: cut.planLabel,
        notes: `Profil optimizasyonu - ${results.find(r => r.cuts.includes(cut))?.profileType}`
      })),
      totalWaste,
      efficiency,
      stockCount: allCuts.length,
      totalSegments,
      wastePercentage: totalStock > 0 ? (totalWaste / totalStock) * 100 : 0,
      averageCutsPerStock,
      totalLength: totalStock,
      setupTime: 0,
      materialUtilization: efficiency,
      cuttingComplexity: 0,
      cuttingTime: 0,
      totalTime: 0,
      materialCost: 0,
      wasteCost: 0,
      laborCost: 0,
      totalCost,
      costPerMeter: 0,
      qualityScore: 95,
      reclaimableWastePercentage: totalWaste > 0 ? (allCuts.filter(cut => cut.remainingLength > 200).reduce((sum, cut) => sum + cut.remainingLength, 0) / totalWaste) * 100 : 0,
      algorithm: OptimizationAlgorithm.BEST_FIT_DECREASING,
      executionTimeMs: 0,
      wasteDistribution: {
        minimal: allCuts.filter(cut => cut.remainingLength < 50).length,
        small: allCuts.filter(cut => cut.remainingLength >= 50 && cut.remainingLength < 150).length,
        medium: allCuts.filter(cut => cut.remainingLength >= 150 && cut.remainingLength < 300).length,
        large: allCuts.filter(cut => cut.remainingLength >= 300 && cut.remainingLength < 500).length,
        excessive: allCuts.filter(cut => cut.remainingLength >= 500).length,
        reclaimable: allCuts.filter(cut => cut.remainingLength > 200).length,
        totalPieces: allCuts.length
      },
      constraints: {
        maxCutsPerStock: 20,
        minScrapLength: 50,
        kerfWidth: 3,
        safetyMargin: 10,
        allowPartialStocks: false,
        prioritizeSmallWaste: true,
        maxWastePercentage: 15,
        reclaimWasteOnly: false,
        balanceComplexity: true,
        respectMaterialGrades: true,
        optimizeSetupTime: true
      },
      recommendations: [],
      efficiencyCategory: efficiency >= 90 ? 'excellent' : efficiency >= 80 ? 'good' : efficiency >= 70 ? 'average' : 'poor',
      detailedWasteAnalysis: {
        minimal: allCuts.filter(cut => cut.remainingLength < 50).reduce((sum, cut) => sum + cut.remainingLength, 0),
        small: allCuts.filter(cut => cut.remainingLength >= 50 && cut.remainingLength < 150).reduce((sum, cut) => sum + cut.remainingLength, 0),
        medium: allCuts.filter(cut => cut.remainingLength >= 150 && cut.remainingLength < 300).reduce((sum, cut) => sum + cut.remainingLength, 0),
        large: allCuts.filter(cut => cut.remainingLength >= 300 && cut.remainingLength < 500).reduce((sum, cut) => sum + cut.remainingLength, 0),
        excessive: allCuts.filter(cut => cut.remainingLength >= 500).reduce((sum, cut) => sum + cut.remainingLength, 0),
        totalPieces: allCuts.length,
        averageWaste: allCuts.length > 0 ? totalWaste / allCuts.length : 0
      },
      optimizationScore: Math.round((efficiency + (100 - (totalStock > 0 ? (totalWaste / totalStock) * 100 : 0))) / 2)
    };
  }
}

export default ProfileOptimizationService;
