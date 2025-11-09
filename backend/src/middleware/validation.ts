/**
 * @fileoverview Input Validation Middleware
 * @module ValidationMiddleware
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from "express";
import { body, param, query, validationResult } from "express-validator";
import { logger } from "../services/logger";

export const sanitizeString = (
  value: string,
  maxLength: number = 255,
): string => {
  if (typeof value !== "string") return "";

  return value
    .trim()
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/data:/gi, "")
    .replace(/vbscript:/gi, "")
    .substring(0, maxLength);
};

export const sanitizeNumber = (
  value: unknown,
  min: number = 0,
  max: number = Number.MAX_SAFE_INTEGER,
): number => {
  const num = Number(value);
  if (isNaN(num) || !isFinite(num)) return min;
  return Math.max(min, Math.min(max, num));
};

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => ({
      field: error.type === "field" ? error.path : "unknown",
      message: error.msg,
      value: error.type === "field" ? error.value : undefined,
    }));

    logger.warn("Validation errors:", {
      url: req.url,
      method: req.method,
      errors: errorMessages,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(400).json({
      success: false,
      error: {
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        details: errorMessages,
      },
    });
    return;
  }

  next();
};

export const validateCuttingListItem = [
  body("workOrderId")
    .isString()
    .isLength({ min: 1, max: 50 })
    .customSanitizer((value) => sanitizeString(value, 50))
    .withMessage("İş emri ID 1-50 karakter arasında olmalıdır"),

  body("color")
    .isString()
    .isLength({ min: 1, max: 30 })
    .customSanitizer((value) => sanitizeString(value, 30))
    .withMessage("Renk 1-30 karakter arasında olmalıdır"),

  body("version")
    .isString()
    .isLength({ min: 1, max: 20 })
    .customSanitizer((value) => sanitizeString(value, 20))
    .withMessage("Versiyon 1-20 karakter arasında olmalıdır"),

  body("size")
    .isString()
    .isLength({ min: 1, max: 20 })
    .customSanitizer((value) => sanitizeString(value, 20))
    .withMessage("Ebat 1-20 karakter arasında olmalıdır"),

  body("profileType")
    .isString()
    .isLength({ min: 1, max: 50 })
    .customSanitizer((value) => sanitizeString(value, 50))
    .withMessage("Profil tipi 1-50 karakter arasında olmalıdır"),

  body("length")
    .isFloat({ min: 1, max: 20000 })
    .customSanitizer((value) => sanitizeNumber(value, 1, 20000))
    .withMessage("Uzunluk 1-20000 mm arasında olmalıdır"),

  body("quantity")
    .isInt({ min: 1, max: 1000 })
    .customSanitizer((value) => sanitizeNumber(value, 1, 1000))
    .withMessage("Adet 1-1000 arasında olmalıdır"),

  body("cuttingPattern")
    .optional()
    .isString()
    .isLength({ max: 100 })
    .customSanitizer((value) => (value ? sanitizeString(value, 100) : value))
    .withMessage("Kesim deseni maksimum 100 karakter olmalıdır"),

  body("notes")
    .optional()
    .isString()
    .isLength({ max: 500 })
    .customSanitizer((value) => (value ? sanitizeString(value, 500) : value))
    .withMessage("Notlar maksimum 500 karakter olmalıdır"),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Öncelik low, medium veya high olmalıdır"),
];

export const validateOptimizationParams = [
  body("algorithm")
    .isIn([
      "genetic",
      "dynamic",
      "greedy",
      "simulated-annealing",
      "branch-and-bound",
    ])
    .withMessage("Geçersiz algoritma seçimi"),

  body("objectives")
    .isArray({ min: 1 })
    .withMessage("En az bir hedef belirlenmelidir"),

  body("objectives.*.type")
    .isString()
    .isLength({ min: 1, max: 50 })
    .customSanitizer((value) => sanitizeString(value, 50))
    .withMessage("Hedef tipi 1-50 karakter arasında olmalıdır"),

  body("objectives.*.weight")
    .isFloat({ min: 0, max: 1 })
    .withMessage("Hedef ağırlığı 0-1 arasında olmalıdır"),

  body("objectives.*.priority")
    .isIn(["low", "medium", "high"])
    .withMessage("Hedef önceliği low, medium veya high olmalıdır"),

  body("constraints.kerfWidth")
    .isFloat({ min: 0.1, max: 10 })
    .customSanitizer((value) => sanitizeNumber(value, 0.1, 10))
    .withMessage("Kesim genişliği 0.1-10 mm arasında olmalıdır"),

  body("constraints.startSafety")
    .isFloat({ min: 0, max: 50 })
    .customSanitizer((value) => sanitizeNumber(value, 0, 50))
    .withMessage("Başlangıç güvenlik mesafesi 0-50 mm arasında olmalıdır"),

  body("constraints.endSafety")
    .isFloat({ min: 0, max: 50 })
    .customSanitizer((value) => sanitizeNumber(value, 0, 50))
    .withMessage("Bitiş güvenlik mesafesi 0-50 mm arasında olmalıdır"),

  body("constraints.minScrapLength")
    .isFloat({ min: 10, max: 500 })
    .customSanitizer((value) => sanitizeNumber(value, 10, 500))
    .withMessage("Minimum fire uzunluğu 10-500 mm arasında olmalıdır"),

  body("constraints.maxWastePercentage")
    .isFloat({ min: 1, max: 50 })
    .customSanitizer((value) => sanitizeNumber(value, 1, 50))
    .withMessage("Maksimum fire yüzdesi 1-50% arasında olmalıdır"),

  body("constraints.maxCutsPerStock")
    .isInt({ min: 1, max: 100 })
    .customSanitizer((value) => sanitizeNumber(value, 1, 100))
    .withMessage("Stok başına maksimum kesim sayısı 1-100 arasında olmalıdır"),

  body("stockLengths")
    .isArray({ min: 1 })
    .withMessage("En az bir stok uzunluğu belirlenmelidir"),

  body("stockLengths.*")
    .isFloat({ min: 1000, max: 20000 })
    .customSanitizer((value) => sanitizeNumber(value, 1000, 20000))
    .withMessage("Stok uzunluğu 1000-20000 mm arasında olmalıdır"),

  body("unit").isIn(["mm", "cm", "m"]).withMessage("Geçersiz birim seçimi"),
];

export const validateId = [
  param("id")
    .isString()
    .isLength({ min: 1, max: 50 })
    .customSanitizer((value) => sanitizeString(value, 50))
    .withMessage("ID 1-50 karakter arasında olmalıdır"),
];

export const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1, max: 1000 })
    .customSanitizer((value) => sanitizeNumber(value, 1, 1000))
    .withMessage("Sayfa numarası 1-1000 arasında olmalıdır"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .customSanitizer((value) => sanitizeNumber(value, 1, 100))
    .withMessage("Sayfa limiti 1-100 arasında olmalıdır"),
];

export const validateSearch = [
  query("search")
    .optional()
    .isString()
    .isLength({ max: 100 })
    .customSanitizer((value) => sanitizeString(value, 100))
    .withMessage("Arama terimi maksimum 100 karakter olmalıdır"),
];

export const validateFileUpload = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.file) {
    res.status(400).json({
      success: false,
      error: {
        message: "Dosya yüklenmedi",
        code: "NO_FILE_UPLOADED",
      },
    });
    return;
  }

  const file = req.file;
  const maxSize = 10 * 1024 * 1024;
  const allowedTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "text/csv",
    "application/json",
  ];

  if (file.size > maxSize) {
    res.status(400).json({
      success: false,
      error: {
        message: `Dosya boyutu ${maxSize / (1024 * 1024)}MB'dan büyük olamaz`,
        code: "FILE_TOO_LARGE",
      },
    });
    return;
  }

  if (!allowedTypes.includes(file.mimetype)) {
    res.status(400).json({
      success: false,
      error: {
        message:
          "Sadece Excel (.xlsx, .xls), CSV (.csv) ve JSON (.json) dosyaları kabul edilir",
        code: "INVALID_FILE_TYPE",
      },
    });
    return;
  }

  const sanitizedFileName = sanitizeString(file.originalname, 255);
  if (sanitizedFileName !== file.originalname) {
    res.status(400).json({
      success: false,
      error: {
        message: "Dosya adı geçersiz karakterler içeriyor",
        code: "INVALID_FILE_NAME",
      },
    });
    return;
  }

  next();
};

// TODO: Implement actual rate limiting validation with express-rate-limit middleware
export const validateRateLimit = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  logger.info("Rate limit check:", {
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    url: req.url,
    method: req.method,
  });

  next();
};
