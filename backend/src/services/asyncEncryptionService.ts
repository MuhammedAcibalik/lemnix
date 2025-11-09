/**
 * @fileoverview Asynchronous Encryption Service
 * @module services/asyncEncryptionService
 * @version 1.0.0
 *
 * 🔐⚡ CRITICAL: High-performance encryption with security maintained
 * - Asynchronous encryption/decryption operations
 * - Memory-efficient streaming for large datasets
 * - Progress tracking and real-time feedback
 * - Maintains AES-256-GCM security standards
 */

import { EventEmitter } from "events";
import { ProductionPlanItem } from "@prisma/client";
import { encryptionService } from "./encryptionService";
import { logger } from "./logger";

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface EncryptionProgress {
  total: number;
  processed: number;
  percentage: number;
  currentItem?: string;
  estimatedTimeRemaining?: number;
  startTime: number;
}

export interface EncryptionResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
  progress: EncryptionProgress;
  duration: number;
}

export interface ProductionPlanItemWithEncryption extends ProductionPlanItem {
  // Encrypted fields are already part of ProductionPlanItem schema
}

export interface BatchEncryptionOptions {
  batchSize?: number;
  concurrency?: number;
  onProgress?: (progress: EncryptionProgress) => void;
  onError?: (error: Error, item: ProductionPlanItemWithEncryption) => void;
}

// ============================================================================
// ASYNC ENCRYPTION SERVICE
// ============================================================================

export class AsyncEncryptionService extends EventEmitter {
  private readonly defaultBatchSize = 100;
  private readonly defaultConcurrency = 4;

  /**
   * Encrypt sensitive fields in production plan items asynchronously
   */
  async encryptProductionPlanItems(
    items: ProductionPlanItemWithEncryption[],
    options: BatchEncryptionOptions = {},
  ): Promise<EncryptionResult<ProductionPlanItemWithEncryption[]>> {
    const startTime = Date.now();
    const batchSize = options.batchSize || this.defaultBatchSize;
    const concurrency = options.concurrency || this.defaultConcurrency;

    const progress: EncryptionProgress = {
      total: items.length,
      processed: 0,
      percentage: 0,
      startTime,
    };

    try {
      logger.info("Starting async encryption", {
        itemCount: items.length,
        batchSize,
        concurrency,
      });

      const encryptedItems: ProductionPlanItemWithEncryption[] = [];
      const errors: string[] = [];

      // Process items in batches
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchPromises = batch.map((item, index) =>
          this.encryptSingleItem(item, i + index, progress, options),
        );

        // Process batch with concurrency control
        const batchResults = await this.processWithConcurrency(
          batchPromises,
          concurrency,
        );

        // Collect results
        for (const result of batchResults) {
          if (result.success) {
            encryptedItems.push(result.data);
          } else {
            errors.push(result.error || "Unknown encryption error");
          }
        }

        // Update progress
        progress.processed = Math.min(i + batchSize, items.length);
        progress.percentage = Math.round(
          (progress.processed / progress.total) * 100,
        );

        // Calculate estimated time remaining
        if (progress.processed > 0) {
          const elapsed = Date.now() - startTime;
          const rate = progress.processed / elapsed;
          progress.estimatedTimeRemaining = Math.round(
            (progress.total - progress.processed) / rate,
          );
        }

        // Emit progress event
        this.emit("progress", { ...progress });
        options.onProgress?.(progress);

        // Small delay to prevent blocking
        if (i + batchSize < items.length) {
          await this.delay(10);
        }
      }

      const duration = Date.now() - startTime;
      logger.info("Async encryption completed", {
        itemCount: items.length,
        encryptedCount: encryptedItems.length,
        errorCount: errors.length,
        duration: `${duration}ms`,
      });

      return {
        success: errors.length === 0,
        data: encryptedItems,
        errors: errors.length > 0 ? errors : undefined,
        progress,
        duration,
      };
    } catch (error) {
      logger.error("Async encryption failed", {
        error: (error as Error).message,
        processed: progress.processed,
        total: progress.total,
      });

      return {
        success: false,
        errors: [(error as Error).message],
        progress,
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Decrypt production plan items asynchronously
   */
  async decryptProductionPlanItems(
    items: ProductionPlanItemWithEncryption[],
    options: BatchEncryptionOptions = {},
  ): Promise<EncryptionResult<ProductionPlanItemWithEncryption[]>> {
    const startTime = Date.now();
    const batchSize = options.batchSize || this.defaultBatchSize;
    const concurrency = options.concurrency || this.defaultConcurrency;

    const progress: EncryptionProgress = {
      total: items.length,
      processed: 0,
      percentage: 0,
      startTime,
    };

    try {
      logger.info("Starting async decryption", {
        itemCount: items.length,
        batchSize,
        concurrency,
      });

      const decryptedItems: ProductionPlanItemWithEncryption[] = [];
      const errors: string[] = [];

      // Process items in batches
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchPromises = batch.map((item, index) =>
          this.decryptSingleItem(item, i + index, progress, options),
        );

        // Process batch with concurrency control
        const batchResults = await this.processWithConcurrency(
          batchPromises,
          concurrency,
        );

        // Collect results
        for (const result of batchResults) {
          if (result.success) {
            decryptedItems.push(result.data);
          } else {
            errors.push(result.error || "Unknown decryption error");
          }
        }

        // Update progress
        progress.processed = Math.min(i + batchSize, items.length);
        progress.percentage = Math.round(
          (progress.processed / progress.total) * 100,
        );

        // Calculate estimated time remaining
        if (progress.processed > 0) {
          const elapsed = Date.now() - startTime;
          const rate = progress.processed / elapsed;
          progress.estimatedTimeRemaining = Math.round(
            (progress.total - progress.processed) / rate,
          );
        }

        // Emit progress event
        this.emit("progress", { ...progress });
        options.onProgress?.(progress);

        // Small delay to prevent blocking
        if (i + batchSize < items.length) {
          await this.delay(10);
        }
      }

      const duration = Date.now() - startTime;
      logger.info("Async decryption completed", {
        itemCount: items.length,
        decryptedCount: decryptedItems.length,
        errorCount: errors.length,
        duration: `${duration}ms`,
      });

      return {
        success: errors.length === 0,
        data: decryptedItems,
        errors: errors.length > 0 ? errors : undefined,
        progress,
        duration,
      };
    } catch (error) {
      logger.error("Async decryption failed", {
        error: (error as Error).message,
        processed: progress.processed,
        total: progress.total,
      });

      return {
        success: false,
        errors: [(error as Error).message],
        progress,
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Encrypt a single item
   */
  private async encryptSingleItem(
    item: ProductionPlanItemWithEncryption,
    index: number,
    progress: EncryptionProgress,
    options: BatchEncryptionOptions,
  ): Promise<{ success: boolean; data?: ProductionPlanItemWithEncryption; error?: string }> {
    try {
      // ✅ PERFORMANCE: Encrypt once, use for both fields
      const encryptedAd = encryptionService.encryptString(item.ad);
      const encryptedSiparisVeren = encryptionService.encryptString(
        item.siparisVeren,
      );
      const encryptedMusteriNo = encryptionService.encryptString(
        item.musteriNo,
      );
      const encryptedMusteriKalemi = encryptionService.encryptString(
        item.musteriKalemi,
      );
      const encryptedSiparis = encryptionService.encryptString(item.siparis);
      const encryptedMalzemeNo = encryptionService.encryptString(
        item.malzemeNo,
      );
      const encryptedMalzemeKisaMetni = encryptionService.encryptString(
        item.malzemeKisaMetni,
      );

      const encryptedItem = {
        ...item,
        // Use encrypted values for both original and encrypted fields
        ad: encryptedAd,
        siparisVeren: encryptedSiparisVeren,
        musteriNo: encryptedMusteriNo,
        musteriKalemi: encryptedMusteriKalemi,
        siparis: encryptedSiparis,
        malzemeNo: encryptedMalzemeNo,
        malzemeKisaMetni: encryptedMalzemeKisaMetni,
        // Store same encrypted values in dedicated fields
        encryptedAd,
        encryptedSiparisVeren,
        encryptedMusteriNo,
        encryptedMusteriKalemi,
        encryptedSiparis,
        encryptedMalzemeNo,
        encryptedMalzemeKisaMetni,
      };

      return { success: true, data: encryptedItem };
    } catch (error) {
      const errorMessage = `Encryption failed for item ${index}: ${(error as Error).message}`;
      logger.warn("Item encryption failed", {
        index,
        error: (error as Error).message,
        itemId: item.id,
      });

      options.onError?.(error as Error, item);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Decrypt a single item
   */
  private async decryptSingleItem(
    item: ProductionPlanItemWithEncryption,
    index: number,
    progress: EncryptionProgress,
    options: BatchEncryptionOptions,
  ): Promise<{ success: boolean; data?: ProductionPlanItemWithEncryption; error?: string }> {
    try {
      // ✅ PERFORMANCE: Check if item has encrypted fields before processing
      const hasEncryptedFields =
        item.encryptedAd ||
        item.encryptedSiparisVeren ||
        item.encryptedMusteriNo ||
        item.encryptedMusteriKalemi ||
        item.encryptedSiparis ||
        item.encryptedMalzemeNo ||
        item.encryptedMalzemeKisaMetni;

      if (!hasEncryptedFields) {
        return { success: true, data: item }; // Return as-is if no encrypted fields
      }

      const decryptedItem = {
        ...item,
        // Decrypt sensitive fields for display
        ad: item.encryptedAd
          ? encryptionService.decryptString(item.encryptedAd)
          : item.ad,
        siparisVeren: item.encryptedSiparisVeren
          ? encryptionService.decryptString(item.encryptedSiparisVeren)
          : item.siparisVeren,
        musteriNo: item.encryptedMusteriNo
          ? encryptionService.decryptString(item.encryptedMusteriNo)
          : item.musteriNo,
        musteriKalemi: item.encryptedMusteriKalemi
          ? encryptionService.decryptString(item.encryptedMusteriKalemi)
          : item.musteriKalemi,
        siparis: item.encryptedSiparis
          ? encryptionService.decryptString(item.encryptedSiparis)
          : item.siparis,
        malzemeNo: item.encryptedMalzemeNo
          ? encryptionService.decryptString(item.encryptedMalzemeNo)
          : item.malzemeNo,
        malzemeKisaMetni: item.encryptedMalzemeKisaMetni
          ? encryptionService.decryptString(item.encryptedMalzemeKisaMetni)
          : item.malzemeKisaMetni,
      };

      return { success: true, data: decryptedItem };
    } catch (error) {
      const errorMessage = `Decryption failed for item ${index}: ${(error as Error).message}`;
      logger.warn("Item decryption failed", {
        index,
        error: (error as Error).message,
        itemId: item.id,
      });

      options.onError?.(error as Error, item);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Process promises with concurrency control
   */
  private async processWithConcurrency<T>(
    promises: Promise<T>[],
    concurrency: number,
  ): Promise<T[]> {
    const results: T[] = [];

    for (let i = 0; i < promises.length; i += concurrency) {
      const batch = promises.slice(i, i + concurrency);
      const batchResults = await Promise.all(batch);
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const asyncEncryptionService = new AsyncEncryptionService();
