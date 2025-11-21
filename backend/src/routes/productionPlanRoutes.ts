/**
 * @fileoverview Production Plan Routes
 * @module routes/productionPlanRoutes
 * @version 1.0.0
 */

import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { productionPlanController } from "../controllers/productionPlanController";
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
const logRequestDetails = (req: Request, res: Response, next: NextFunction) => {
  logger.info("Upload request received (before multer)", {
    contentType: req.headers["content-type"],
    contentLength: req.headers["content-length"],
    hasBody: !!req.body,
    bodyKeys: Object.keys(req.body || {}),
  });
  next();
};

// Logging middleware AFTER multer
const logAfterMulter = (req: Request, res: Response, next: NextFunction) => {
  logger.info("After multer processing", {
    hasFile: !!req.file,
    fileName: req.file?.originalname,
    fileSize: req.file?.size,
    fieldname: req.file?.fieldname,
  });
  next();
};

// Error handling middleware for multer
const handleMulterError = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  logger.error("Multer error handler", {
    error: error.message,
    errorType: error.constructor.name,
    hasFile: !!req.file,
  });

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({
        success: false,
        error: "Dosya boyutu 10MB'dan büyük olamaz",
      });
      return;
    }
    // Add other MulterError cases
    logger.error("MulterError details", {
      code: error.code,
      field: error.field,
    });
  }

  if (error.message.includes("Sadece Excel dosyaları")) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
    return;
  }

  next(error);
};

/**
 * @route POST /api/production-plan/upload
 * @desc Upload Excel file and create production plan
 * @access Private (requires authentication)
 */
router.post(
  "/upload",
  authenticateToken,
  validateSession,
  logRequestDetails, // ADD THIS
  upload.single("file"),
  logAfterMulter, // ADD THIS
  handleMulterError,
  (req: Request, res: Response) =>
    productionPlanController.uploadProductionPlan(req, res),
);

/**
 * @route GET /api/production-plan
 * @desc Get production plans with filters
 * @access Private (requires authentication)
 */
router.get(
  "/",
  authenticateToken,
  validateSession,
  (req: Request, res: Response) =>
    productionPlanController.getProductionPlans(req, res),
);

/**
 * @route GET /api/production-plan/metrics
 * @desc Get production plan metrics
 * @access Private (requires authentication)
 */
router.get(
  "/metrics",
  authenticateToken,
  validateSession,
  (req: Request, res: Response) =>
    productionPlanController.getProductionPlanMetrics(req, res),
);

/**
 * @route GET /api/production-plan/backorder
 * @desc Get backorder items (overdue and not completed)
 * @access Private (requires authentication)
 */
router.get(
  "/backorder",
  authenticateToken,
  validateSession,
  (req: Request, res: Response) =>
    productionPlanController.getBackorderItems(req, res),
);

/**
 * @route GET /api/production-plan/statistics
 * @desc Get production plan statistics
 * @access Private (requires authentication)
 */
router.get(
  "/statistics",
  authenticateToken,
  validateSession,
  (req: Request, res: Response) =>
    productionPlanController.getStatistics(req, res),
);

/**
 * @route GET /api/production-plan/week/:weekNumber/:year
 * @desc Get production plan by week and year
 * @access Private (requires authentication)
 */
router.get(
  "/week/:weekNumber/:year",
  authenticateToken,
  validateSession,
  (req: Request, res: Response) =>
    productionPlanController.getProductionPlanByWeek(req, res),
);

/**
 * @route GET /api/production-plan/items/work-order/:workOrderId
 * @desc Get production plan items by work order ID
 * @access Private (requires authentication)
 */
router.get(
  "/items/work-order/:workOrderId",
  authenticateToken,
  validateSession,
  (req: Request, res: Response) =>
    productionPlanController.getProductionPlanItemsByWorkOrder(req, res),
);

/**
 * @route GET /api/production-plan/:id
 * @desc Get single production plan by ID
 * @access Private (requires authentication)
 */
router.get(
  "/:id",
  authenticateToken,
  validateSession,
  (req: Request, res: Response) =>
    productionPlanController.getProductionPlanById(req, res),
);

/**
 * @route DELETE /api/production-plan
 * @desc Delete all production plans
 * @access Private (requires authentication)
 */
router.delete(
  "/",
  authenticateToken,
  validateSession,
  (req: Request, res: Response) =>
    productionPlanController.deleteAllProductionPlans(req, res),
);

/**
 * @route DELETE /api/production-plan/:id
 * @desc Delete production plan (soft delete)
 * @access Private (requires authentication)
 */
router.delete(
  "/:id",
  authenticateToken,
  validateSession,
  (req: Request, res: Response) =>
    productionPlanController.deleteProductionPlan(req, res),
);

/**
 * @route POST /api/production-plan/create-cutting-list
 * @desc Create cutting list from production plan items
 * @access Private (requires authentication)
 */
router.post(
  "/create-cutting-list",
  authenticateToken,
  validateSession,
  (req: Request, res: Response) =>
    productionPlanController.createCuttingListFromPlan(req, res),
);

/**
 * @route GET /api/production-plan/cutting-list/:cuttingListId/plan-items
 * @desc Get plan items linked to a cutting list
 * @access Private (requires authentication)
 */
router.get(
  "/cutting-list/:cuttingListId/plan-items",
  authenticateToken,
  validateSession,
  (req: Request, res: Response) =>
    productionPlanController.getLinkedPlanItems(req, res),
);

/**
 * @route DELETE /api/production-plan/plan-item/:planItemId/unlink
 * @desc Unlink plan item from cutting list
 * @access Private (requires authentication)
 */
router.delete(
  "/plan-item/:planItemId/unlink",
  authenticateToken,
  validateSession,
  (req: Request, res: Response) =>
    productionPlanController.unlinkPlanItemFromCuttingList(req, res),
);

// Error handling middleware
router.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  // In degraded mode (e.g. database offline), some routes like metrics should
  // not surface 500 errors to the frontend. For those, return safe fallback
  // data instead of an error response.
  if (req.path.startsWith("/metrics")) {
    logger.warn(
      "Production plan metrics route error, returning fallback data",
      {
        error: error.message,
        url: req.url,
        method: req.method,
      },
    );

    res.json({
      success: true,
      data: {
        totalPlans: 0,
        totalItems: 0,
        departments: [],
        priorityDistribution: {},
        upcomingDeadlines: 0,
      },
    });
    return;
  }

  logger.error("Production plan route error", {
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
