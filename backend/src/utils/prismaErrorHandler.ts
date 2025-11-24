/**
 * Prisma Error Handler Utility
 *
 * Provides centralized error handling for Prisma database errors
 * with user-friendly error messages and proper error classification
 *
 * @module utils/prismaErrorHandler
 * @version 1.0.0
 */

import { Prisma } from "@prisma/client";
import { logger } from "../services/logger";

/**
 * Prisma error codes and their meanings
 */
export enum PrismaErrorCode {
  UNIQUE_CONSTRAINT_VIOLATION = "P2002",
  FOREIGN_KEY_CONSTRAINT_FAILED = "P2003",
  RECORD_NOT_FOUND = "P2025",
  CONNECTION_ERROR = "P1001",
  CONNECTION_TIMEOUT = "P1002",
  DATABASE_ERROR = "P1003",
  QUERY_INTERPRETATION_ERROR = "P1008",
  QUERY_VALIDATION_ERROR = "P1009",
  RAW_QUERY_ERROR = "P1010",
  TRANSACTION_FAILED = "P2034",
}

/**
 * User-friendly error messages for Prisma errors
 */
const ERROR_MESSAGES: Record<string, string> = {
  [PrismaErrorCode.UNIQUE_CONSTRAINT_VIOLATION]:
    "Bu kayıt zaten mevcut. Lütfen farklı bir değer deneyin.",
  [PrismaErrorCode.FOREIGN_KEY_CONSTRAINT_FAILED]:
    "İlişkili bir kayıt bulunamadı. Lütfen geçerli bir referans kullanın.",
  [PrismaErrorCode.RECORD_NOT_FOUND]:
    "Kayıt bulunamadı. Lütfen geçerli bir ID kullanın.",
  [PrismaErrorCode.CONNECTION_ERROR]:
    "Veritabanı bağlantı hatası. Lütfen daha sonra tekrar deneyin.",
  [PrismaErrorCode.CONNECTION_TIMEOUT]:
    "Veritabanı bağlantı zaman aşımı. Lütfen daha sonra tekrar deneyin.",
  [PrismaErrorCode.DATABASE_ERROR]:
    "Veritabanı hatası oluştu. Lütfen sistem yöneticisine başvurun.",
  [PrismaErrorCode.QUERY_INTERPRETATION_ERROR]:
    "Sorgu yorumlama hatası. Lütfen geçerli parametreler kullanın.",
  [PrismaErrorCode.QUERY_VALIDATION_ERROR]:
    "Sorgu doğrulama hatası. Lütfen geçerli parametreler kullanın.",
  [PrismaErrorCode.RAW_QUERY_ERROR]:
    "Ham sorgu hatası. Lütfen sistem yöneticisine başvurun.",
  [PrismaErrorCode.TRANSACTION_FAILED]:
    "İşlem başarısız oldu. Lütfen tekrar deneyin.",
};

/**
 * Specific error messages for unique constraint violations
 */
const UNIQUE_CONSTRAINT_MESSAGES: Record<string, string> = {
  cutting_lists_userId_weekNumber_key:
    "Bu kullanıcı için bu hafta numarası zaten kullanılıyor.",
  cutting_lists_user_week_unique:
    "Bu kullanıcı için bu hafta numarası zaten kullanılıyor.",
  stock_lengths_length_key: "Bu stok uzunluğu zaten mevcut.",
  profile_stock_lengths_profileId_stockLength_key:
    "Bu profil için bu stok uzunluğu zaten tanımlı.",
  product_categories_name_key: "Bu kategori adı zaten kullanılıyor.",
  product_mappings_productName_key: "Bu ürün adı zaten kullanılıyor.",
  profile_definitions_profileCode_key: "Bu profil kodu zaten kullanılıyor.",
  profile_types_name_key: "Bu profil tipi adı zaten kullanılıyor.",
  users_email_key: "Bu e-posta adresi zaten kayıtlı.",
  work_order_profile_mappings_workOrderId_profileType_weekNumber_year_key:
    "Bu iş emri için bu profil tipi, hafta ve yıl kombinasyonu zaten mevcut.",
  suggestion_patterns_patternKey_key:
    "Bu öneri deseni anahtarı zaten kullanılıyor.",
  suggestion_caches_cacheKey_key: "Bu önbellek anahtarı zaten mevcut.",
};

/**
 * Specific error messages for foreign key violations
 */
const FOREIGN_KEY_MESSAGES: Record<string, string> = {
  cutting_list_items_cuttingListId_fkey: "Geçersiz kesim listesi referansı.",
  cutting_list_items_productionPlanItemId_fkey:
    "Geçersiz üretim planı öğesi referansı.",
  production_plan_items_planId_fkey: "Geçersiz üretim planı referansı.",
  production_plan_items_linkedCuttingListId_fkey:
    "Geçersiz kesim listesi referansı.",
  profile_stock_lengths_profileId_fkey: "Geçersiz profil referansı.",
  work_order_profile_mappings_profileId_fkey:
    "Geçersiz profil referansı. Profil silinemez çünkü kullanılıyor.",
};

/**
 * Error classification
 */
export interface PrismaErrorInfo {
  code: string;
  message: string;
  userMessage: string;
  isRetryable: boolean;
  httpStatus: number;
  meta?: unknown;
}

/**
 * Handle Prisma errors and return user-friendly information
 *
 * @param error - Prisma error or generic error
 * @param context - Additional context for error logging
 * @returns PrismaErrorInfo with user-friendly message and HTTP status
 */
export function handlePrismaError(
  error: unknown,
  context?: {
    operation?: string;
    model?: string;
    field?: string;
    value?: unknown;
  },
): PrismaErrorInfo {
  // Log the error with context
  logger.error("Prisma error occurred", {
    error,
    context,
    errorType: error instanceof Error ? error.constructor.name : typeof error,
  });

  // Check if it's a Prisma error
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const prismaError = error as Prisma.PrismaClientKnownRequestError;
    const code = prismaError.code;
    const meta = prismaError.meta;

    // Get base message
    let userMessage = ERROR_MESSAGES[code] || "Bir veritabanı hatası oluştu.";

    // Handle specific error types
    switch (code) {
      case PrismaErrorCode.UNIQUE_CONSTRAINT_VIOLATION: {
        // Try to get specific message for this constraint
        const target = (meta as { target?: string[] })?.target;
        const constraintName = Array.isArray(target)
          ? target.join("_")
          : undefined;

        if (constraintName) {
          // Try to find specific message
          const specificMessage =
            UNIQUE_CONSTRAINT_MESSAGES[
              `${context?.model || "unknown"}_${constraintName}_key`
            ];
          if (specificMessage) {
            userMessage = specificMessage;
          } else {
            // Generic unique constraint message
            const fieldName = Array.isArray(target) ? target[0] : "alan";
            userMessage = `Bu ${fieldName} değeri zaten kullanılıyor.`;
          }
        }
        return {
          code,
          message: prismaError.message,
          userMessage,
          isRetryable: false,
          httpStatus: 409, // Conflict
          meta,
        };
      }

      case PrismaErrorCode.FOREIGN_KEY_CONSTRAINT_FAILED: {
        const fieldName = (meta as { field_name?: string })?.field_name;
        if (fieldName) {
          const specificMessage =
            FOREIGN_KEY_MESSAGES[
              `${context?.model || "unknown"}_${fieldName}_fkey`
            ];
          if (specificMessage) {
            userMessage = specificMessage;
          }
        }
        return {
          code,
          message: prismaError.message,
          userMessage,
          isRetryable: false,
          httpStatus: 400, // Bad Request
          meta,
        };
      }

      case PrismaErrorCode.RECORD_NOT_FOUND:
        return {
          code,
          message: prismaError.message,
          userMessage,
          isRetryable: false,
          httpStatus: 404, // Not Found
          meta,
        };

      case PrismaErrorCode.CONNECTION_ERROR:
      case PrismaErrorCode.CONNECTION_TIMEOUT:
        return {
          code,
          message: prismaError.message,
          userMessage,
          isRetryable: true,
          httpStatus: 503, // Service Unavailable
          meta,
        };

      case PrismaErrorCode.TRANSACTION_FAILED:
        return {
          code,
          message: prismaError.message,
          userMessage,
          isRetryable: true,
          httpStatus: 500, // Internal Server Error
          meta,
        };

      default:
        return {
          code,
          message: prismaError.message,
          userMessage,
          isRetryable: false,
          httpStatus: 500,
          meta,
        };
    }
  }

  // Check if it's a Prisma validation error
  if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      code: "P2009", // Validation error
      message: error.message,
      userMessage: "Geçersiz veri formatı. Lütfen tüm alanları kontrol edin.",
      isRetryable: false,
      httpStatus: 400,
    };
  }

  // Check if it's a generic error
  if (error instanceof Error) {
    // Check for connection-related errors
    if (
      error.message.includes("Can't reach database server") ||
      error.message.includes("database server is running")
    ) {
      return {
        code: PrismaErrorCode.CONNECTION_ERROR,
        message: error.message,
        userMessage: ERROR_MESSAGES[PrismaErrorCode.CONNECTION_ERROR],
        isRetryable: true,
        httpStatus: 503,
      };
    }

    return {
      code: "UNKNOWN",
      message: error.message,
      userMessage: "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
      isRetryable: false,
      httpStatus: 500,
    };
  }

  // Unknown error type
  return {
    code: "UNKNOWN",
    message: String(error),
    userMessage: "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
    isRetryable: false,
    httpStatus: 500,
  };
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  const errorInfo = handlePrismaError(error);
  return errorInfo.isRetryable;
}

/**
 * Get HTTP status code for an error
 */
export function getHttpStatusForError(error: unknown): number {
  const errorInfo = handlePrismaError(error);
  return errorInfo.httpStatus;
}
