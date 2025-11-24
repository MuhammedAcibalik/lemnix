/**
 * @fileoverview Profile Management Controller
 * @module controllers/profileManagementController
 * @version 1.0.0
 */

import { Request, Response } from "express";
import { profileManagementService } from "../services/profileManagementService";
import { logger } from "../services/logger";
import { databaseManager } from "../config/database";

export class ProfileManagementController {
  /**
   * Upload Excel file and create profile definitions and mappings
   * POST /api/profile-management/upload
   */
  async uploadProfileManagement(req: Request, res: Response): Promise<void> {
    try {
      logger.info("[ProfileMgmt] Upload request received", {
        hasFile: !!req.file,
        fileSize: req.file?.size,
        fileMimetype: req.file?.mimetype,
      });

      if (!req.file) {
        logger.error("[ProfileMgmt] No file in request");
        res.status(400).json({
          success: false,
          error: "Excel dosyası yüklenmedi",
        });
        return;
      }

      const uploadedBy = (req as { user?: { id: string } }).user?.id;
      const result = await profileManagementService.uploadProfileManagement(
        req.file.buffer,
        uploadedBy,
      );

      if (result.success) {
        logger.info("[ProfileMgmt] Upload successful", result.data);

        res.status(201).json({
          success: true,
          data: result.data,
          warnings: result.errors,
          message: "Profil yönetimi başarıyla yüklendi",
        });
      } else {
        logger.error("[ProfileMgmt] Upload failed", { errors: result.errors });

        const errors = result.errors || ["Profil yönetimi yüklenemedi"];
        res.status(400).json({
          success: false,
          error: {
            message:
              errors.length > 0 ? errors[0] : "Profil yönetimi yüklenemedi",
            details: errors,
          },
        });
      }
    } catch (error) {
      logger.error("[ProfileMgmt] Upload error", { error });
      res.status(500).json({
        success: false,
        error: "Sunucu hatası",
      });
    }
  }

  /**
   * Get all profile definitions
   * GET /api/profile-management/definitions
   */
  async getProfileDefinitions(req: Request, res: Response): Promise<void> {
    try {
      // In degraded mode we still want UI to render with an empty list instead
      // of a 500 error. Service already checks DB status but we keep this guard
      // for extra safety.
      if (!databaseManager.getConnectionStatus()) {
        logger.warn(
          "[ProfileMgmt] getProfileDefinitions: database not connected, returning empty list",
        );
        res.status(200).json({
          success: true,
          data: [],
        });
        return;
      }

      // Support both activeOnly and isActive parameters
      const activeOnly =
        req.query.activeOnly === "true" || req.query.isActive === "true";
      const includeStockLengths = req.query.includeStockLengths !== "false";

      const profiles = await profileManagementService.getProfileDefinitions({
        activeOnly,
        includeStockLengths,
      });

      res.status(200).json({
        success: true,
        data: profiles,
      });
    } catch (error) {
      // In degraded mode or when DB is not available, do not surface 500 to UI.
      // Log the error and return an empty list instead so the page can render.
      logger.error("[ProfileMgmt] Get definitions error", { error });
      res.status(200).json({
        success: true,
        data: [],
      });
    }
  }

  /**
   * Get profile definition by code
   * GET /api/profile-management/profile/:code
   */
  async getProfileByCode(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.params;

      if (!code) {
        res.status(400).json({
          success: false,
          error: "Profil kodu gerekli",
        });
        return;
      }

      const profile = await profileManagementService.getProfileByCode(code);

      if (!profile) {
        res.status(404).json({
          success: false,
          error: "Profil bulunamadı",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      logger.error("[ProfileMgmt] Get profile by code error", { error });
      res.status(500).json({
        success: false,
        error: "Profil alınamadı",
      });
    }
  }

  /**
   * Get work order profile mappings by week/year
   * GET /api/profile-management/mappings?week={n}&year={y}
   */
  async getMappingsByWeek(req: Request, res: Response): Promise<void> {
    try {
      const weekNumber = parseInt(
        (req.query.weekNumber || req.query.week) as string,
        10,
      );
      const year = parseInt(req.query.year as string, 10);

      if (
        isNaN(weekNumber) ||
        isNaN(year) ||
        weekNumber < 1 ||
        weekNumber > 53 ||
        year < 2020 ||
        year > 2030
      ) {
        res.status(400).json({
          success: false,
          error: "Geçersiz hafta veya yıl parametresi",
        });
        return;
      }

      const mappings = await profileManagementService.getMappingsByWeek(
        weekNumber,
        year,
      );

      res.status(200).json({
        success: true,
        data: mappings,
      });
    } catch (error) {
      logger.error("[ProfileMgmt] Get mappings by week error", { error });
      res.status(500).json({
        success: false,
        error: "Eşleştirmeler alınamadı",
      });
    }
  }

  /**
   * Get mappings for specific work order
   * GET /api/profile-management/mappings/work-order/:workOrderId?week={n}&year={y}
   */
  async getMappingsForWorkOrder(req: Request, res: Response): Promise<void> {
    try {
      const { workOrderId } = req.params;
      const weekNumber = parseInt(req.query.week as string, 10);
      const year = parseInt(req.query.year as string, 10);

      if (!workOrderId) {
        res.status(400).json({
          success: false,
          error: "Sipariş no gerekli",
        });
        return;
      }

      if (
        isNaN(weekNumber) ||
        isNaN(year) ||
        weekNumber < 1 ||
        weekNumber > 53
      ) {
        res.status(400).json({
          success: false,
          error: "Geçersiz hafta veya yıl parametresi",
        });
        return;
      }

      const mappings = await profileManagementService.getMappingsForWorkOrder(
        workOrderId,
        weekNumber,
        year,
      );

      res.status(200).json({
        success: true,
        data: mappings,
      });
    } catch (error) {
      logger.error("[ProfileMgmt] Get mappings for work order error", {
        error,
      });
      res.status(500).json({
        success: false,
        error: "İş emri eşleştirmeleri alınamadı",
      });
    }
  }

  /**
   * Update work order profile mapping
   * PUT /api/profile-management/mappings/:id
   */
  async updateMapping(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { profileCode } = req.body;

      if (!id || !profileCode) {
        res.status(400).json({
          success: false,
          error: "ID ve profil kodu gerekli",
        });
        return;
      }

      const result = await profileManagementService.updateMapping(
        id,
        profileCode,
      );

      if (result.success) {
        res.status(200).json({
          success: true,
          message: "Eşleştirme güncellendi",
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error,
        });
      }
    } catch (error) {
      logger.error("[ProfileMgmt] Update mapping error", { error });
      res.status(500).json({
        success: false,
        error: "Eşleştirme güncellenemedi",
      });
    }
  }

  /**
   * Delete profile definition
   * DELETE /api/profile-management/definitions/:id
   */
  async deleteProfile(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          error: "ID gerekli",
        });
        return;
      }

      const result = await profileManagementService.deleteProfile(id);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: "Profil silindi",
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error,
        });
      }
    } catch (error) {
      logger.error("[ProfileMgmt] Delete profile error", { error });
      res.status(500).json({
        success: false,
        error: "Profil silinemedi",
      });
    }
  }

  /**
   * Get stock lengths for a profile
   * GET /api/profile-management/profile/:code/stock-lengths
   */
  async getStockLengthsByProfileCode(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { code } = req.params;

      if (!code) {
        res.status(400).json({
          success: false,
          error: "Profil kodu gerekli",
        });
        return;
      }

      const stockLengths =
        await profileManagementService.getStockLengthsByProfileCode(code);

      res.status(200).json({
        success: true,
        data: stockLengths,
      });
    } catch (error) {
      logger.error("[ProfileMgmt] Get stock lengths error", { error });
      res.status(500).json({
        success: false,
        error: "Stok uzunlukları alınamadı",
      });
    }
  }

  /**
   * Get statistics
   * GET /api/profile-management/statistics
   */
  async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      if (!databaseManager.getConnectionStatus()) {
        logger.warn(
          "[ProfileMgmt] getStatistics: database not connected, returning fallback stats",
        );
        res.status(200).json({
          success: true,
          data: {
            totalProfiles: 0,
            activeProfiles: 0,
            totalMappings: 0,
            uniqueWeeks: 0,
          },
        });
        return;
      }

      const stats = await profileManagementService.getStatistics();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      // Same degrade-mode behavior as above: never surface 500 for statistics.
      logger.error("[ProfileMgmt] Get statistics error", { error });
      res.status(200).json({
        success: true,
        data: {
          totalProfiles: 0,
          activeProfiles: 0,
          totalMappings: 0,
          uniqueWeeks: 0,
        },
      });
    }
  }
}

// Singleton instance
export const profileManagementController = new ProfileManagementController();
