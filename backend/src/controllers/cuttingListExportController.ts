/**
 * @fileoverview Cutting List Export Controller
 * Extracted from cuttingListController to follow Single Responsibility Principle
 * @module controllers/cuttingListExportController
 * @version 1.0.0
 */

import { Request, Response } from "express";
import { PDFExportService } from "../services/export/pdfExportService";
import { ExcelExportService } from "../services/export/excelExportService";
import { logger } from "../services/logger";

/**
 * Cutting List Export Controller
 * Handles PDF and Excel export operations
 */
export class CuttingListExportController {
  private readonly pdfExportService: PDFExportService;
  private readonly excelExportService: ExcelExportService;

  constructor() {
    this.pdfExportService = PDFExportService.getInstance();
    this.excelExportService = new ExcelExportService();

    // Graceful shutdown için cleanup handler
    process.on("SIGINT", async () => {
      logger.info("PDF Export Service cleanup...");
      await this.pdfExportService.cleanup();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      logger.info("PDF Export Service cleanup...");
      await this.pdfExportService.cleanup();
      process.exit(0);
    });
  }

  /**
   * Generate request ID for logging
   */
  private generateRequestId(): string {
    return `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create standardized response
   */
  private createResponse<T>(
    success: boolean,
    data?: T,
    error?: string,
  ): { success: boolean; data?: T; error?: string } {
    return { success, ...(data && { data }), ...(error && { error }) };
  }

  /**
   * Export cutting list to PDF
   */
  exportToPDF = async (req: Request, res: Response): Promise<void> => {
    const requestId = this.generateRequestId();

    try {
      logger.info(`[${requestId}] PDF export starting...`);

      const { cuttingList } = req.body;

      if (!cuttingList) {
        logger.error(`[${requestId}] Cutting list data is required`);
        res
          .status(400)
          .json(
            this.createResponse(
              false,
              undefined,
              "Cutting list data is required",
            ),
          );
        return;
      }

      logger.info(`[${requestId}] Cutting list received:`, {
        id: cuttingList.id,
        title: cuttingList.title,
        sectionsCount: cuttingList.sections?.length || 0,
      });

      // PDF export service ile PDF oluştur
      logger.info(`[${requestId}] Creating PDF...`);
      const pdfResult = await this.pdfExportService.exportToPDF(cuttingList);
      logger.info(`[${requestId}] PDF created, size: ${pdfResult.size} bytes`);

      // Sanitize filename for HTTP headers
      const sanitizedTitle = cuttingList.title
        .replace(/[ğ]/g, "g")
        .replace(/[Ğ]/g, "G")
        .replace(/[ü]/g, "u")
        .replace(/[Ü]/g, "U")
        .replace(/[ş]/g, "s")
        .replace(/[Ş]/g, "S")
        .replace(/[ı]/g, "i")
        .replace(/[İ]/g, "I")
        .replace(/[ö]/g, "o")
        .replace(/[Ö]/g, "O")
        .replace(/[ç]/g, "c")
        .replace(/[Ç]/g, "C")
        .replace(/[^a-zA-Z0-9\s_-]/g, "")
        .replace(/\s+/g, "_");

      // Set proper headers for PDF response
      res.setHeader("Content-Type", "application/pdf; charset=binary");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${sanitizedTitle}_${cuttingList.weekNumber}_hafta.pdf"`,
      );
      res.setHeader("Content-Length", pdfResult.size.toString());
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("X-Content-Type-Options", "nosniff");

      logger.info(`[${requestId}] PDF export completed successfully`);
      res.send(pdfResult.buffer);
    } catch (error) {
      logger.error(`[${requestId}] PDF export error:`, error);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // JSON response olarak döndür
      res.status(500).json({
        success: false,
        error: `PDF export failed: ${errorMessage}`,
        details: {
          name: error instanceof Error ? error.name : "Unknown",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      });
    }
  };

  /**
   * Test PDF export service
   */
  testPDFExport = async (_req: Request, res: Response): Promise<void> => {
    const requestId = this.generateRequestId();

    try {
      logger.info(`[${requestId}] Testing PDF export service...`);

      // Create a minimal cutting list for PDF export testing
      const testCuttingList = {
        id: "pdf-test",
        title: "PDF Export Test",
        weekNumber: 1,
        sections: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      logger.info(
        `[${requestId}] Test cutting list created, testing PDF export...`,
      );
      const pdfResult =
        await this.pdfExportService.exportToPDF(testCuttingList);
      logger.info(
        `[${requestId}] Test PDF export successful, buffer size: ${pdfResult.size}`,
      );

      res.json({
        success: true,
        message: "PDF export service is working",
        bufferSize: pdfResult.size,
      });
    } catch (error) {
      logger.error(`[${requestId}] Test PDF export failed:`, error);
      res.status(500).json({
        success: false,
        message: "PDF export service test failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  /**
   * Export cutting list to Excel
   */
  exportToExcel = async (req: Request, res: Response): Promise<void> => {
    const requestId = this.generateRequestId();

    try {
      logger.info(`[${requestId}] Excel export starting...`);

      const { cuttingList } = req.body;

      if (!cuttingList) {
        res
          .status(400)
          .json(
            this.createResponse(
              false,
              undefined,
              "Cutting list data is required",
            ),
          );
        return;
      }

      const excelBuffer = this.excelExportService.exportToExcel(cuttingList);

      // Sanitize filename
      const sanitizedTitle = cuttingList.title
        .replace(/[ğ]/g, "g")
        .replace(/[Ğ]/g, "G")
        .replace(/[ü]/g, "u")
        .replace(/[Ü]/g, "U")
        .replace(/[ş]/g, "s")
        .replace(/[Ş]/g, "S")
        .replace(/[ı]/g, "i")
        .replace(/[İ]/g, "I")
        .replace(/[ö]/g, "o")
        .replace(/[Ö]/g, "O")
        .replace(/[ç]/g, "c")
        .replace(/[Ç]/g, "C")
        .replace(/[^a-zA-Z0-9\s_-]/g, "")
        .replace(/\s+/g, "_");

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${sanitizedTitle}_${cuttingList.weekNumber}_hafta.xlsx"`,
      );
      res.setHeader("Content-Length", excelBuffer.length.toString());
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

      logger.info(`[${requestId}] Excel export completed successfully`);
      res.send(excelBuffer);
    } catch (error) {
      logger.error(`[${requestId}] Excel export error:`, error);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({
        success: false,
        error: `Excel export failed: ${errorMessage}`,
      });
    }
  };
}

// Export singleton instance
export const cuttingListExportController = new CuttingListExportController();
