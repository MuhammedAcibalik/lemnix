/**
 * @fileoverview Progressive Loading Service
 * @module services/progressiveLoadingService
 * @version 1.0.0
 *
 * ⚡🔐 CRITICAL: Progressive data loading with security maintained
 * - Stream data to frontend as it becomes available
 * - Maintain encryption security throughout the process
 * - Real-time progress updates
 * - Memory-efficient processing
 */

import { EventEmitter } from "events";
import type { PrismaClient } from "@prisma/client";
import { Prisma } from "@prisma/client";
import {
  asyncEncryptionService,
  EncryptionProgress,
} from "./asyncEncryptionService";
import { logger } from "./logger";
import { prisma } from "../config/database";

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface LoadingProgress {
  stage: "parsing" | "encrypting" | "saving" | "complete";
  percentage: number;
  message: string;
  itemsProcessed: number;
  totalItems: number;
  estimatedTimeRemaining?: number;
  startTime: number;
}

export interface ProgressiveLoadResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
  progress: LoadingProgress;
  duration: number;
}

export interface StageResult {
  success: boolean;
  data?: unknown;
  errors?: string[];
}

export interface ProgressiveLoadOptions {
  batchSize?: number;
  concurrency?: number;
  onProgress?: (progress: LoadingProgress) => void;
  onStageComplete?: (stage: string, result: StageResult) => void;
}

// ============================================================================
// PROGRESSIVE LOADING SERVICE
// ============================================================================

export type ProgressiveLoadingPrismaClient = Pick<
  PrismaClient,
  "productionPlan" | "productionPlanItem"
>;

export class ProgressiveLoadingService extends EventEmitter {
  private readonly prisma: ProgressiveLoadingPrismaClient;
  private readonly defaultBatchSize = 50;
  private readonly defaultConcurrency = 2;

  constructor(prismaClient: ProgressiveLoadingPrismaClient) {
    super();
    this.prisma = prismaClient;
  }

  /**
   * Progressive upload with real-time feedback
   */
  async uploadProductionPlanProgressive(
    fileBuffer: Buffer,
    uploadedBy?: string,
    options: ProgressiveLoadOptions = {},
  ): Promise<ProgressiveLoadResult<unknown>> {
    const startTime = Date.now();
    const progress: LoadingProgress = {
      stage: "parsing",
      percentage: 0,
      message: "Excel dosyası işleniyor...",
      itemsProcessed: 0,
      totalItems: 0,
      startTime,
    };

    try {
      // Stage 1: Parse Excel file
      progress.message = "Excel dosyası parse ediliyor...";
      this.emit("progress", { ...progress });
      options.onProgress?.(progress);

      const { excelParserService } = await import("./excelParserService");
      const parseResult = await excelParserService.parseProductionPlanExcel(
        fileBuffer,
        "",
      );

      if (
        !parseResult.success ||
        !parseResult.data ||
        parseResult.data.length === 0
      ) {
        return {
          success: false,
          errors: parseResult.errors || ["Excel dosyası işlenemedi"],
          progress: { ...progress, stage: "complete", percentage: 100 },
          duration: Date.now() - startTime,
        };
      }

      progress.totalItems = parseResult.data.length;
      progress.percentage = 20;
      progress.message = `${progress.totalItems} öğe bulundu, şifreleme başlıyor...`;
      this.emit("progress", { ...progress });
      options.onProgress?.(progress);

      // Stage 2: Create production plan
      const { weekNumber, year } = parseResult.summary!;
      const productionPlan = await this.prisma.productionPlan.create({
        data: {
          weekNumber,
          year,
          uploadedBy,
          metadata: {
            totalItems: parseResult.data.length,
            validRows: parseResult.summary!.validRows,
            invalidRows: parseResult.summary!.invalidRows,
            uploadedAt: new Date().toISOString(),
          },
        },
      });

      progress.percentage = 30;
      progress.message = "Üretim planı oluşturuldu, öğeler şifreleniyor...";
      this.emit("progress", { ...progress });
      options.onProgress?.(progress);

      // Stage 3: Progressive encryption
      progress.stage = "encrypting";
      const encryptionResult =
        await asyncEncryptionService.encryptProductionPlanItems(
          parseResult.data.map((item) => ({
            ...item,
            planId: productionPlan.id,
          })),
          {
            batchSize: options.batchSize || this.defaultBatchSize,
            concurrency: options.concurrency || this.defaultConcurrency,
            onProgress: (encryptionProgress: EncryptionProgress) => {
              progress.percentage = 30 + encryptionProgress.percentage * 0.6; // 30-90%
              progress.itemsProcessed = encryptionProgress.processed;
              progress.message = `${encryptionProgress.processed}/${encryptionProgress.total} öğe şifrelendi...`;
              progress.estimatedTimeRemaining =
                encryptionProgress.estimatedTimeRemaining;

              this.emit("progress", { ...progress });
              options.onProgress?.(progress);
            },
          },
        );

      if (!encryptionResult.success) {
        return {
          success: false,
          errors: encryptionResult.errors,
          progress: { ...progress, stage: "complete", percentage: 100 },
          duration: Date.now() - startTime,
        };
      }

      // Stage 4: Progressive saving
      progress.stage = "saving";
      progress.percentage = 90;
      progress.message = "Veritabanına kaydediliyor...";
      this.emit("progress", { ...progress });
      options.onProgress?.(progress);

      const savedItems = await this.saveItemsProgressive(
        encryptionResult.data!,
        productionPlan.id,
        {
          onProgress: (saveProgress) => {
            progress.percentage = 90 + saveProgress.percentage * 0.1; // 90-100%
            progress.itemsProcessed = saveProgress.processed;
            progress.message = `${saveProgress.processed}/${saveProgress.total} öğe kaydedildi...`;

            this.emit("progress", { ...progress });
            options.onProgress?.(progress);
          },
        },
      );

      // Stage 5: Complete
      progress.stage = "complete";
      progress.percentage = 100;
      progress.message = "Yükleme tamamlandı!";
      progress.itemsProcessed = progress.totalItems;
      this.emit("progress", { ...progress });
      options.onProgress?.(progress);

      // Fetch final result
      const finalPlan = await this.prisma.productionPlan.findUnique({
        where: { id: productionPlan.id },
        include: { items: true },
      });

      const duration = Date.now() - startTime;
      logger.info("Progressive upload completed", {
        planId: productionPlan.id,
        itemCount: progress.totalItems,
        duration: `${duration}ms`,
      });

      return {
        success: true,
        data: finalPlan,
        progress,
        duration,
      };
    } catch (error) {
      logger.error("Progressive upload failed", {
        error: (error as Error).message,
        stage: progress.stage,
        processed: progress.itemsProcessed,
        total: progress.totalItems,
      });

      return {
        success: false,
        errors: [(error as Error).message],
        progress: { ...progress, stage: "complete", percentage: 100 },
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Progressive data retrieval with streaming
   */
  async getProductionPlansProgressive(
    filters: Prisma.ProductionPlanWhereInput = {},
    options: ProgressiveLoadOptions = {},
  ): Promise<ProgressiveLoadResult<unknown[]>> {
    const startTime = Date.now();
    const progress: LoadingProgress = {
      stage: "parsing",
      percentage: 0,
      message: "Veriler yükleniyor...",
      itemsProcessed: 0,
      totalItems: 0,
      startTime,
    };

    try {
      // Stage 1: Query database
      progress.message = "Veritabanından veriler çekiliyor...";
      this.emit("progress", { ...progress });
      options.onProgress?.(progress);

      const plans = await this.prisma.productionPlan.findMany({
        where: filters,
        include: {
          items: {
            orderBy: [{ oncelik: "asc" }, { planlananBitisTarihi: "asc" }],
          },
        },
        orderBy: [{ year: "desc" }, { weekNumber: "desc" }],
      });

      const totalItems = plans.reduce(
        (sum, plan) => sum + (plan.items?.length || 0),
        0,
      );
      progress.totalItems = totalItems;
      progress.percentage = 30;
      progress.message = `${plans.length} plan, ${totalItems} öğe bulundu, şifre çözme başlıyor...`;
      this.emit("progress", { ...progress });
      options.onProgress?.(progress);

      // Stage 2: Progressive decryption
      progress.stage = "encrypting"; // Reuse for decryption
      const allItems = plans.flatMap((plan) => plan.items || []);

      const decryptionResult =
        await asyncEncryptionService.decryptProductionPlanItems(allItems, {
          batchSize: options.batchSize || this.defaultBatchSize,
          concurrency: options.concurrency || this.defaultConcurrency,
          onProgress: (decryptionProgress: EncryptionProgress) => {
            progress.percentage = 30 + decryptionProgress.percentage * 0.7; // 30-100%
            progress.itemsProcessed = decryptionProgress.processed;
            progress.message = `${decryptionProgress.processed}/${decryptionProgress.total} öğe şifresi çözüldü...`;
            progress.estimatedTimeRemaining =
              decryptionProgress.estimatedTimeRemaining;

            this.emit("progress", { ...progress });
            options.onProgress?.(progress);
          },
        });

      if (!decryptionResult.success) {
        return {
          success: false,
          errors: decryptionResult.errors,
          progress: { ...progress, stage: "complete", percentage: 100 },
          duration: Date.now() - startTime,
        };
      }

      // Stage 3: Reconstruct plans with decrypted items
      progress.stage = "saving"; // Reuse for reconstruction
      progress.percentage = 95;
      progress.message = "Veriler hazırlanıyor...";
      this.emit("progress", { ...progress });
      options.onProgress?.(progress);

      const decryptedPlans = plans.map((plan) => ({
        ...plan,
        items: decryptionResult.data!.filter((item) => item.planId === plan.id),
      }));

      // Stage 4: Complete
      progress.stage = "complete";
      progress.percentage = 100;
      progress.message = "Veriler hazır!";
      progress.itemsProcessed = progress.totalItems;
      this.emit("progress", { ...progress });
      options.onProgress?.(progress);

      const duration = Date.now() - startTime;
      logger.info("Progressive retrieval completed", {
        planCount: plans.length,
        itemCount: totalItems,
        duration: `${duration}ms`,
      });

      return {
        success: true,
        data: decryptedPlans,
        progress,
        duration,
      };
    } catch (error) {
      logger.error("Progressive retrieval failed", {
        error: (error as Error).message,
        stage: progress.stage,
        processed: progress.itemsProcessed,
        total: progress.totalItems,
      });

      return {
        success: false,
        errors: [(error as Error).message],
        progress: { ...progress, stage: "complete", percentage: 100 },
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Save items progressively to database
   */
  private async saveItemsProgressive(
    items: Prisma.ProductionPlanItemCreateManyInput[],
    planId: string,
    options: {
      onProgress?: (progress: {
        processed: number;
        total: number;
        percentage: number;
      }) => void;
    } = {},
  ): Promise<Prisma.ProductionPlanItemCreateManyInput[]> {
    const batchSize = 100;
    const savedItems: Prisma.ProductionPlanItemCreateManyInput[] = [];

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);

      await this.prisma.productionPlanItem.createMany({
        data: batch,
      });

      savedItems.push(...batch);

      // Update progress
      const processed = Math.min(i + batchSize, items.length);
      const percentage = Math.round((processed / items.length) * 100);

      options.onProgress?.({
        processed,
        total: items.length,
        percentage,
      });

      // Small delay to prevent blocking
      if (i + batchSize < items.length) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }

    return savedItems;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const progressiveLoadingService = new ProgressiveLoadingService(prisma);
