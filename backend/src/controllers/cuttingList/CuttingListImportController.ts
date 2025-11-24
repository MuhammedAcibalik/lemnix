/**
 * @fileoverview Cutting List Import Controller
 * @module controllers/cuttingList/CuttingListImportController
 * @version 1.0.0
 * @description Controller for Excel import operations
 */

import { Request, Response } from "express";
import { cuttingListRepository } from "../../repositories/CuttingListRepository";
import { prisma } from "../../config/database";
import { logger } from "../../services/logger";
import { CuttingListBaseController } from "./shared/CuttingListBaseController";

/**
 * Cutting List Import Controller
 * Handles Excel import operations
 */
export class CuttingListImportController extends CuttingListBaseController {
  /**
   * Import Excel data
   */
  public importExcelData = this.asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const requestId = this.generateRequestId();

      try {
        logger.info("[CuttingList] Excel data import started", { requestId });

        const { filePath, weekNumber, title, forceCreate } = req.body;

        if (!filePath) {
          res
            .status(400)
            .json(
              this.createResponse(
                false,
                undefined,
                "Excel file path is required",
                requestId,
              ),
            );
          return;
        }

        const targetWeek = weekNumber || 27;
        const targetTitle =
          title || `${targetWeek}. HAFTA KESİM LİSTESİ (Excel Import)`;

        // Mevcut listeyi bul veya yeni oluştur (hafta kontrolü yapmadan)
        let cuttingListId: string | null = null;

        if (!forceCreate) {
          // ✅ MIGRATED: Check PostgreSQL instead of in-memory Map
          const existingLists =
            await cuttingListRepository.findAllByWeekNumber(targetWeek);
          if (existingLists.length > 0 && existingLists[0]) {
            cuttingListId = existingLists[0].id;
            logger.info(
              `[${requestId}] Using existing list: ${cuttingListId} (week ${targetWeek})`,
            );
          }
        }

        if (!cuttingListId) {
          // ✅ MIGRATED: Create in PostgreSQL instead of in-memory Map
          // Ensure system user exists
          const systemUser = await prisma.user.upsert({
            where: { id: "system-user" },
            update: {},
            create: {
              id: "system-user",
              email: "system@lemnix.com",
              name: "System User",
              role: "system",
              isActive: true,
            },
          });

          // Create new cutting list in PostgreSQL
          const newCuttingList = await cuttingListRepository.create({
            name: targetTitle,
            weekNumber: targetWeek,
            status: "DRAFT",
            sections: [],
            user: {
              connect: { id: systemUser.id },
            },
          });

          cuttingListId = newCuttingList.id;

          logger.info(
            `[${requestId}] New Excel import list created: ${cuttingListId} (week ${targetWeek})`,
          );
        }

        const result = {
          imported: true,
          cuttingListId: cuttingListId,
          filePath: filePath,
          weekNumber: targetWeek,
          title: targetTitle,
          message: "Excel import için kesim listesi hazır",
        };

        logger.info("[CuttingList] Excel import completed", { requestId });

        // Smart suggestion learning is handled automatically by UnifiedSuggestionService
        // Pattern learning happens when items are added via learnFromPattern()
        setTimeout(() => {
          try {
            logger.debug(
              "[CuttingList] Pattern learning handled by UnifiedSuggestionService",
              { cuttingListId },
            );
          } catch (error) {
            logger.error(
              "[CuttingList] Failed to update database after import",
              error instanceof Error ? error : new Error(String(error)),
              { cuttingListId },
            );
          }
        }, 3000); // 3 second delay for Excel imports

        res.json(
          this.createResponse(true, result, "Excel import ready", requestId),
        );
      } catch (error: unknown) {
        logger.error(
          "[CuttingList] Excel import error",
          error instanceof Error ? error : new Error(String(error)),
          { requestId },
        );
        res
          .status(500)
          .json(
            this.createResponse(
              false,
              undefined,
              `Excel import failed: ${error instanceof Error ? error.message : "Unknown error"}`,
              requestId,
            ),
          );
      }
    },
  );
}
