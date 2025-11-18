/**
 * @fileoverview Profile Management Routes
 * @module routes/profileManagementRoutes
 * @version 1.0.0
 */

import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { profileManagementController } from "../controllers/profileManagementController";
import {
  authenticateToken,
  validateSession,
} from "../middleware/authentication";
import { logger } from "../services/logger";

const router: Router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow Excel files
    const allowedMimes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "application/vnd.ms-excel.sheet.macroEnabled.12", // .xlsm
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Sadece Excel dosyaları (.xlsx, .xls) yüklenebilir"));
    }
  },
});

// Logging middleware BEFORE multer
const logRequestDetails = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  logger.info("[ProfileMgmt] Upload request received (before multer)", {
    contentType: req.headers["content-type"],
    contentLength: req.headers["content-length"],
    hasBody: !!req.body,
    bodyKeys: Object.keys(req.body || {}),
  });
  next();
};

// Logging middleware AFTER multer
const logAfterMulter = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  logger.info("[ProfileMgmt] After multer", {
    hasFile: !!req.file,
    fileSize: req.file?.size,
    fileName: req.file?.originalname,
  });
  next();
};

// ============================================================================
// ROUTES
// ============================================================================

/**
 * Upload Excel file and create profile definitions and mappings
 * POST /api/profile-management/upload
 */
router.post(
  "/upload",
  authenticateToken,
  logRequestDetails,
  upload.single("profileFile"),
  logAfterMulter,
  (req: Request, res: Response) =>
    profileManagementController.uploadProfileManagement(req, res),
);

/**
 * Get all profile definitions
 * GET /api/profile-management/definitions
 * Query params: ?activeOnly=true&includeStockLengths=true
 */
router.get("/definitions", authenticateToken, (req: Request, res: Response) =>
  profileManagementController.getProfileDefinitions(req, res),
);

/**
 * Get profile definition by code
 * GET /api/profile-management/profile/:code
 */
router.get("/profile/:code", authenticateToken, (req: Request, res: Response) =>
  profileManagementController.getProfileByCode(req, res),
);

/**
 * Get stock lengths for a profile
 * GET /api/profile-management/profile/:code/stock-lengths
 */
router.get(
  "/profile/:code/stock-lengths",
  authenticateToken,
  (req: Request, res: Response) =>
    profileManagementController.getStockLengthsByProfileCode(req, res),
);

/**
 * Get work order profile mappings by week/year
 * GET /api/profile-management/mappings?week={n}&year={y}
 */
router.get("/mappings", authenticateToken, (req: Request, res: Response) =>
  profileManagementController.getMappingsByWeek(req, res),
);

/**
 * Get mappings for specific work order
 * GET /api/profile-management/mappings/work-order/:workOrderId?week={n}&year={y}
 */
router.get(
  "/mappings/work-order/:workOrderId",
  authenticateToken,
  (req: Request, res: Response) =>
    profileManagementController.getMappingsForWorkOrder(req, res),
);

/**
 * Update work order profile mapping
 * PUT /api/profile-management/mappings/:id
 * Body: { profileCode: string }
 */
router.put("/mappings/:id", authenticateToken, (req: Request, res: Response) =>
  profileManagementController.updateMapping(req, res),
);

/**
 * Delete profile definition
 * DELETE /api/profile-management/definitions/:id
 */
router.delete(
  "/definitions/:id",
  authenticateToken,
  (req: Request, res: Response) =>
    profileManagementController.deleteProfile(req, res),
);

/**
 * Get statistics
 * GET /api/profile-management/statistics
 */
router.get("/statistics", authenticateToken, (req: Request, res: Response) =>
  profileManagementController.getStatistics(req, res),
);

// Error handling middleware - prevent degraded mode from surfacing 500s
router.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  // For profile list and statistics, return safe fallbacks instead of 500
  if (req.path.startsWith("/definitions")) {
    logger.warn(
      "[ProfileMgmt] Definitions route error, returning empty list instead of 500",
      {
        error: error.message,
        url: req.url,
        method: req.method,
      },
    );

    res.status(200).json({
      success: true,
      data: [],
    });
    return;
  }

  if (req.path.startsWith("/statistics")) {
    logger.warn(
      "[ProfileMgmt] Statistics route error, returning fallback stats instead of 500",
      {
        error: error.message,
        url: req.url,
        method: req.method,
      },
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

  logger.error("Profile management route error", {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
  });

  res.status(500).json({
    success: false,
    error: "Sunucu hatası",
  });
});

export default router;
