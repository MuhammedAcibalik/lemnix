/**
 * Encryption Processor
 * Sandboxed processor for encryption jobs to prevent event loop blocking
 *
 * @module workers/processors/encryptionProcessor
 * @version 1.0.0
 */

import { Job } from "bullmq";
import { logger } from "../../services/logger";
import { encryptionService } from "../../services/encryptionService";
import { PrismaClient } from "@prisma/client";

// Initialize Prisma client for worker process
const prisma = new PrismaClient();

/**
 * Encryption job data
 */
export interface EncryptionJobData {
  items: Array<{
    id?: string;
    ad: string;
    siparisVeren: string;
    musteriNo: string;
    musteriKalemi: string;
    siparis: string;
    malzemeNo: string;
    malzemeKisaMetni: string;
    [key: string]: unknown;
  }>;
  planId: string;
  requestId: string;
  userId?: string;
}

/**
 * Encryption job result
 */
export interface EncryptionJobResult {
  encryptedItems: Array<{
    ad: string;
    siparisVeren: string;
    musteriNo: string;
    musteriKalemi: string;
    siparis: string;
    malzemeNo: string;
    malzemeKisaMetni: string;
    encryptedAd: string;
    encryptedSiparisVeren: string;
    encryptedMusteriNo: string;
    encryptedMusteriKalemi: string;
    encryptedSiparis: string;
    encryptedMalzemeNo: string;
    encryptedMalzemeKisaMetni: string;
    adHash?: string;
    musteriNoHash?: string;
    [key: string]: unknown;
  }>;
  requestId: string;
}

/**
 * Process encryption job
 * This function runs in a sandboxed process to prevent event loop blocking
 *
 * @param job - BullMQ job instance
 * @returns Encryption result
 */
export default async function processEncryptionJob(
  job: Job<EncryptionJobData>,
): Promise<EncryptionJobResult> {
  const { items, planId, requestId, userId } = job.data;

  logger.info("Processing encryption job", {
    jobId: job.id,
    requestId,
    userId,
    itemsCount: items.length,
    planId,
  });

  try {
    const encryptedItems = items.map((item) => {
      // Encrypt sensitive fields
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
      const encryptedMalzemeNo = encryptionService.encryptString(item.malzemeNo);
      const encryptedMalzemeKisaMetni = encryptionService.encryptString(
        item.malzemeKisaMetni,
      );

      // Generate blind index hashes for search
      const adHash = encryptionService.hashForSearch(item.ad);
      const musteriNoHash = encryptionService.hashForSearch(item.musteriNo);

      return {
        ...item,
        planId,
        // Encrypted fields (replace plaintext)
        ad: encryptedAd,
        siparisVeren: encryptedSiparisVeren,
        musteriNo: encryptedMusteriNo,
        musteriKalemi: encryptedMusteriKalemi,
        siparis: encryptedSiparis,
        malzemeNo: encryptedMalzemeNo,
        malzemeKisaMetni: encryptedMalzemeKisaMetni,
        // Explicit encrypted fields
        encryptedAd,
        encryptedSiparisVeren,
        encryptedMusteriNo,
        encryptedMusteriKalemi,
        encryptedSiparis,
        encryptedMalzemeNo,
        encryptedMalzemeKisaMetni,
        // Blind index hashes for search
        adHash,
        musteriNoHash,
      };
    });

    // Save encrypted items to database in batches
    const BATCH_SIZE = 100;
    const totalBatches = Math.ceil(encryptedItems.length / BATCH_SIZE);
    
    logger.info("Saving encrypted items to database", {
      jobId: job.id,
      requestId,
      totalItems: encryptedItems.length,
      totalBatches,
    });

    for (let i = 0; i < encryptedItems.length; i += BATCH_SIZE) {
      const batch = encryptedItems.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      
      await prisma.productionPlanItem.createMany({
        data: batch.map((item) => {
          // Map oncelik string to enum
          const oncelikMap: Record<string, "LOW" | "MEDIUM" | "HIGH" | "URGENT"> = {
            "1": "HIGH",
            "2": "MEDIUM",
            yuksek: "HIGH",
            orta: "MEDIUM",
            dusuk: "LOW",
          };
          const oncelikValue = item.oncelik as string;
          const oncelikEnum =
            (oncelikMap[oncelikValue] as "LOW" | "MEDIUM" | "HIGH" | "URGENT") ||
            "MEDIUM";

          return {
            planId: item.planId as string,
            ad: item.ad as string,
            siparisVeren: item.siparisVeren as string,
            musteriNo: item.musteriNo as string,
            musteriKalemi: item.musteriKalemi as string,
            siparis: item.siparis as string,
            malzemeNo: item.malzemeNo as string,
            malzemeKisaMetni: item.malzemeKisaMetni as string,
            miktar: typeof item.miktar === "number" 
              ? item.miktar 
              : typeof item.miktar === "string"
                ? parseFloat(item.miktar) || 0
                : parseFloat(String(item.miktar || 0)),
            planlananBitisTarihi: item.planlananBitisTarihi instanceof Date
              ? item.planlananBitisTarihi
              : new Date(item.planlananBitisTarihi as string),
            bolum: item.bolum as string,
            oncelik: oncelikEnum,
            encryptedAd: item.encryptedAd,
            encryptedSiparisVeren: item.encryptedSiparisVeren,
            encryptedMusteriNo: item.encryptedMusteriNo,
            encryptedMusteriKalemi: item.encryptedMusteriKalemi,
            encryptedSiparis: item.encryptedSiparis,
            encryptedMalzemeNo: item.encryptedMalzemeNo,
            encryptedMalzemeKisaMetni: item.encryptedMalzemeKisaMetni,
            // ✅ SEARCH: Blind index hashes for searching encrypted fields
            adHash: item.adHash,
            musteriNoHash: item.musteriNoHash,
          };
        }),
      });

      logger.debug("Batch saved", {
        batchNumber,
        totalBatches,
        itemsInBatch: batch.length,
      });
    }

    logger.info("Encryption job completed", {
      jobId: job.id,
      requestId,
      userId,
      itemsProcessed: encryptedItems.length,
    });

    return {
      encryptedItems,
      requestId,
    };
  } catch (error) {
    logger.error("Encryption job failed", {
      jobId: job.id,
      requestId,
      userId,
      error: (error as Error).message,
    });
    throw error;
  }
}

