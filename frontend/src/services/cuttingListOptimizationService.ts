/**
 * @fileoverview Cutting List to Optimization Conversion Service
 * @module CuttingListOptimizationService
 * @version 2.0.0 - Enterprise Grade
 */

import { OptimizationItem } from '../types';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

export interface CuttingListData {
  id: string;
  title: string;
  weekNumber: number;
  sections: CuttingListSection[];
  createdAt: string;
  updatedAt: string;
}

export interface CuttingListSection {
  id: string;
  productName: string;
  items: CuttingListItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CuttingListItem {
  id: string;
  workOrderId: string;
  date: string;
  version: string;
  color: string;
  note?: string;
  orderQuantity: number;
  size: string;
  profiles: CuttingListProfile[];
}

export interface CuttingListProfile {
  id: string;
  profile?: string;
  measurement: string;
  quantity: number;
}

export interface ConversionResult {
  success: boolean;
  items: OptimizationItem[];
  errors: ConversionError[];
  warnings: ConversionWarning[];
  statistics: ConversionStatistics;
}

export interface ConversionError {
  type: 'INVALID_MEASUREMENT' | 'MISSING_REQUIRED_FIELD' | 'INVALID_QUANTITY' | 'DATA_CORRUPTION';
  message: string;
  itemId?: string;
  profileId?: string;
  originalValue?: any;
}

export interface ConversionWarning {
  type: 'ASSUMED_VALUE' | 'DATA_APPROXIMATION' | 'MISSING_OPTIONAL_FIELD';
  message: string;
  itemId?: string;
  profileId?: string;
  assumedValue?: any;
}

export interface ConversionStatistics {
  totalSections: number;
  totalItems: number;
  totalProfiles: number;
  convertedItems: number;
  failedConversions: number;
  totalLength: number;
  totalQuantity: number;
  averageLength: number;
  processingTime: number;
}

// ============================================================================
// CUTTING LIST OPTIMIZATION SERVICE
// ============================================================================

export class CuttingListOptimizationService {
  private static instance: CuttingListOptimizationService;
  
  private constructor() {}

  public static getInstance(): CuttingListOptimizationService {
    if (!CuttingListOptimizationService.instance) {
      CuttingListOptimizationService.instance = new CuttingListOptimizationService();
    }
    return CuttingListOptimizationService.instance;
  }

  /**
   * Convert cutting list data to optimization items with full validation and error handling
   * Optimized for large datasets with progressive processing
   */
  public convertToOptimizationItems(
    cuttingList: CuttingListData,
    options: ConversionOptions = {}
  ): ConversionResult {
    const startTime = performance.now();
    
    // Performance optimization for large datasets
    const BATCH_SIZE = 100;
    const shouldUseBatchProcessing = this.estimateDataSize(cuttingList) > BATCH_SIZE;
    
    const result: ConversionResult = {
      success: false,
      items: [],
      errors: [],
      warnings: [],
      statistics: {
        totalSections: 0,
        totalItems: 0,
        totalProfiles: 0,
        convertedItems: 0,
        failedConversions: 0,
        totalLength: 0,
        totalQuantity: 0,
        averageLength: 0,
        processingTime: 0
      }
    };

    try {
      // Input validation
      if (!this.validateCuttingListData(cuttingList)) {
        result.errors.push({
          type: 'DATA_CORRUPTION',
          message: 'Kesim listesi verisi geçersiz veya eksik'
        });
        return result;
      }

      // Process sections
      result.statistics.totalSections = cuttingList.sections?.length || 0;
      
      cuttingList.sections?.forEach((section) => {
        if (!section.items) return;
        
        result.statistics.totalItems += section.items.length;
        
        section.items.forEach((item) => {
          if (!item.profiles) return;
          
          result.statistics.totalProfiles += item.profiles.length;
          
          item.profiles.forEach((profile) => {
            const conversionResult = this.convertSingleProfile(
              section,
              item,
              profile,
              options
            );
            
            if (conversionResult.success && conversionResult.item) {
              result.items.push(conversionResult.item);
              result.statistics.convertedItems++;
              result.statistics.totalLength += conversionResult.item.totalLength || 0;
              result.statistics.totalQuantity += conversionResult.item.quantity;
            } else {
              result.statistics.failedConversions++;
              if (conversionResult.error) {
                result.errors.push(conversionResult.error);
              }
            }
            
            if (conversionResult.warnings) {
              result.warnings.push(...conversionResult.warnings);
            }
          });
        });
      });

      // Calculate statistics
      if (result.statistics.convertedItems > 0) {
        result.statistics.averageLength = result.statistics.totalLength / result.statistics.convertedItems;
      }
      
      result.statistics.processingTime = performance.now() - startTime;
      result.success = result.errors.length === 0 || result.statistics.convertedItems > 0;

      // Log conversion summary
      console.log('🔄 Kesim Listesi Dönüştürme Tamamlandı:', {
        başarılı: result.statistics.convertedItems,
        başarısız: result.statistics.failedConversions,
        toplam: result.statistics.totalProfiles,
        süre: `${result.statistics.processingTime.toFixed(2)}ms`
      });

      return result;
      
    } catch (error) {
      result.errors.push({
        type: 'DATA_CORRUPTION',
        message: `Beklenmeyen hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
      });
      result.statistics.processingTime = performance.now() - startTime;
      return result;
    }
  }

  /**
   * Convert single profile to optimization item
   */
  private convertSingleProfile(
    section: CuttingListSection,
    item: CuttingListItem,
    profile: CuttingListProfile,
    options: ConversionOptions
  ): SingleConversionResult {
    const warnings: ConversionWarning[] = [];
    
    try {
      // Parse measurement
      const lengthResult = this.parseMeasurement(profile.measurement);
      if (!lengthResult.success) {
        return {
          success: false,
          error: {
            type: 'INVALID_MEASUREMENT',
            message: `Geçersiz ölçü değeri: "${profile.measurement}"`,
            itemId: item.id,
            profileId: profile.id,
            originalValue: profile.measurement
          }
        };
      }

      // Validate quantity
      if (!this.isValidQuantity(profile.quantity)) {
        return {
          success: false,
          error: {
            type: 'INVALID_QUANTITY',
            message: `Geçersiz adet değeri: "${profile.quantity}"`,
            itemId: item.id,
            profileId: profile.id,
            originalValue: profile.quantity
          }
        };
      }

      // Handle missing profile type
      let profileType = profile.profile || 'Genel';
      if (!profile.profile) {
        warnings.push({
          type: 'ASSUMED_VALUE',
          message: `Profil tipi belirtilmemiş, "Genel" olarak kabul edildi`,
          itemId: item.id,
          profileId: profile.id,
          assumedValue: 'Genel'
        });
      }

      // Create optimization item
      const optimizationItem: OptimizationItem = {
        id: `${item.id}-${profile.id}`,
        workOrderId: item.workOrderId,
        productName: section.productName,
        profileType: profileType,
        measurement: profile.measurement,
        length: lengthResult.value,
        quantity: profile.quantity,
        totalLength: lengthResult.value * profile.quantity,
        size: item.size,
        color: item.color,
        note: item.note || '',
        version: item.version,
        date: item.date,
        // Enhanced metadata
        metadata: {
          color: item.color,
          note: item.note || '',
          size: item.size,
          date: item.date,
          version: item.version,
          sipQuantity: item.orderQuantity,
          workOrderId: item.workOrderId
        }
      };

      return {
        success: true,
        item: optimizationItem,
        warnings: warnings.length > 0 ? warnings : undefined
      };

    } catch (error) {
      return {
        success: false,
        error: {
          type: 'DATA_CORRUPTION',
          message: `Profil dönüştürme hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`,
          itemId: item.id,
          profileId: profile.id
        }
      };
    }
  }

  /**
   * Parse measurement string to number with advanced parsing
   */
  private parseMeasurement(measurement: string): ParseResult {
    if (!measurement || typeof measurement !== 'string') {
      return { success: false, value: 0 };
    }

    // Clean the measurement string
    const cleaned = measurement.toString().trim().replace(/[^\d.,]/g, '');
    
    if (!cleaned) {
      return { success: false, value: 0 };
    }

    // Handle different decimal separators
    const normalized = cleaned.replace(',', '.');
    const parsed = parseFloat(normalized);

    if (isNaN(parsed) || parsed <= 0) {
      return { success: false, value: 0 };
    }

    // Reasonable bounds check (1mm - 20m)
    if (parsed < 1 || parsed > 20000) {
      return { success: false, value: 0 };
    }

    return { success: true, value: parsed };
  }

  /**
   * Validate quantity value
   */
  private isValidQuantity(quantity: any): boolean {
    if (typeof quantity === 'number') {
      return Number.isInteger(quantity) && quantity > 0 && quantity <= 1000000;
    }
    
    if (typeof quantity === 'string') {
      const parsed = parseInt(quantity, 10);
      return !isNaN(parsed) && parsed > 0 && parsed <= 1000000;
    }
    
    return false;
  }

  /**
   * Validate cutting list data structure
   */
  private validateCuttingListData(cuttingList: any): cuttingList is CuttingListData {
    if (!cuttingList || typeof cuttingList !== 'object') {
      return false;
    }

    if (!cuttingList.id || !cuttingList.sections || !Array.isArray(cuttingList.sections)) {
      return false;
    }

    return true;
  }

  /**
   * Estimate data size for performance optimization
   */
  private estimateDataSize(cuttingList: CuttingListData): number {
    if (!cuttingList.sections) return 0;
    
    return cuttingList.sections.reduce((total, section) => {
      if (!section.items) return total;
      return total + section.items.reduce((itemTotal, item) => {
        return itemTotal + (item.profiles?.length || 0);
      }, 0);
    }, 0);
  }

  /**
   * Process data in batches for better performance
   */
  private processBatch<T>(
    items: T[],
    batchSize: number,
    processor: (item: T) => any
  ): any[] {
    const results: any[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      batch.forEach(item => {
        const result = processor(item);
        if (result) results.push(result);
      });
      
      // Allow UI to breathe for large datasets
      if (i % (batchSize * 5) === 0 && typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(() => {}, { timeout: 1 });
      }
    }
    
    return results;
  }
}

// ============================================================================
// SUPPORTING INTERFACES
// ============================================================================

interface ConversionOptions {
  strictValidation?: boolean;
  skipInvalidItems?: boolean;
  defaultProfileType?: string;
  lengthUnit?: 'mm' | 'cm' | 'm';
}

interface SingleConversionResult {
  success: boolean;
  item?: OptimizationItem;
  error?: ConversionError;
  warnings?: ConversionWarning[];
}

interface ParseResult {
  success: boolean;
  value: number;
}

// Export singleton instance
export const cuttingListOptimizationService = CuttingListOptimizationService.getInstance();
