/**
 * Database Validators
 *
 * Provides input validation functions for database operations
 * to ensure data integrity before database-level constraints
 *
 * @module utils/databaseValidators
 * @version 1.0.0
 */

import { logger } from "../services/logger";

/**
 * Validation error
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: unknown,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): void {
  if (!email || typeof email !== "string") {
    throw new ValidationError("E-posta adresi gereklidir", "email", email);
  }

  if (email.length > 255) {
    throw new ValidationError(
      "E-posta adresi 255 karakterden uzun olamaz",
      "email",
      email,
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError(
      "Geçersiz e-posta adresi formatı",
      "email",
      email,
    );
  }
}

/**
 * Validate string length
 */
export function validateLength(
  value: string,
  fieldName: string,
  maxLength: number,
  minLength = 0,
): void {
  if (typeof value !== "string") {
    throw new ValidationError(
      `${fieldName} bir string olmalıdır`,
      fieldName,
      value,
    );
  }

  if (value.length < minLength) {
    throw new ValidationError(
      `${fieldName} en az ${minLength} karakter olmalıdır`,
      fieldName,
      value,
    );
  }

  if (value.length > maxLength) {
    throw new ValidationError(
      `${fieldName} en fazla ${maxLength} karakter olabilir`,
      fieldName,
      value,
    );
  }
}

/**
 * Validate quantity (must be positive integer)
 */
export function validateQuantity(
  quantity: number,
  fieldName = "quantity",
): void {
  if (typeof quantity !== "number" || isNaN(quantity)) {
    throw new ValidationError(
      `${fieldName} bir sayı olmalıdır`,
      fieldName,
      quantity,
    );
  }

  if (!Number.isInteger(quantity)) {
    throw new ValidationError(
      `${fieldName} bir tam sayı olmalıdır`,
      fieldName,
      quantity,
    );
  }

  if (quantity <= 0) {
    throw new ValidationError(
      `${fieldName} 0'dan büyük olmalıdır`,
      fieldName,
      quantity,
    );
  }
}

/**
 * Validate week number (1-53)
 */
export function validateWeekNumber(
  weekNumber: number | null | undefined,
): void {
  if (weekNumber === null || weekNumber === undefined) {
    return; // Null is allowed
  }

  if (typeof weekNumber !== "number" || isNaN(weekNumber)) {
    throw new ValidationError(
      "Hafta numarası bir sayı olmalıdır",
      "weekNumber",
      weekNumber,
    );
  }

  if (!Number.isInteger(weekNumber)) {
    throw new ValidationError(
      "Hafta numarası bir tam sayı olmalıdır",
      "weekNumber",
      weekNumber,
    );
  }

  if (weekNumber < 1 || weekNumber > 53) {
    throw new ValidationError(
      "Hafta numarası 1 ile 53 arasında olmalıdır",
      "weekNumber",
      weekNumber,
    );
  }
}

/**
 * Validate year (2000-2100)
 */
export function validateYear(year: number): void {
  if (typeof year !== "number" || isNaN(year)) {
    throw new ValidationError("Yıl bir sayı olmalıdır", "year", year);
  }

  if (!Number.isInteger(year)) {
    throw new ValidationError("Yıl bir tam sayı olmalıdır", "year", year);
  }

  if (year < 2000 || year > 2100) {
    throw new ValidationError(
      "Yıl 2000 ile 2100 arasında olmalıdır",
      "year",
      year,
    );
  }
}

/**
 * Validate positive number
 */
export function validatePositiveNumber(value: number, fieldName: string): void {
  if (typeof value !== "number" || isNaN(value)) {
    throw new ValidationError(
      `${fieldName} bir sayı olmalıdır`,
      fieldName,
      value,
    );
  }

  if (value <= 0) {
    throw new ValidationError(
      `${fieldName} 0'dan büyük olmalıdır`,
      fieldName,
      value,
    );
  }
}

/**
 * Validate non-negative number
 */
export function validateNonNegativeNumber(
  value: number,
  fieldName: string,
): void {
  if (typeof value !== "number" || isNaN(value)) {
    throw new ValidationError(
      `${fieldName} bir sayı olmalıdır`,
      fieldName,
      value,
    );
  }

  if (value < 0) {
    throw new ValidationError(`${fieldName} negatif olamaz`, fieldName, value);
  }
}

/**
 * Validate percentage (0-100)
 */
export function validatePercentage(value: number, fieldName: string): void {
  if (typeof value !== "number" || isNaN(value)) {
    throw new ValidationError(
      `${fieldName} bir sayı olmalıdır`,
      fieldName,
      value,
    );
  }

  if (value < 0 || value > 100) {
    throw new ValidationError(
      `${fieldName} 0 ile 100 arasında olmalıdır`,
      fieldName,
      value,
    );
  }
}

/**
 * Validate cutting list week number uniqueness
 * (Business rule: same user cannot have multiple lists for same week)
 */
export async function validateCuttingListWeekNumber(
  prisma: {
    cuttingList: {
      findFirst: (args: {
        where: { userId: string; weekNumber: number | null };
      }) => Promise<{ id: string } | null>;
    };
  },
  userId: string,
  weekNumber: number | null | undefined,
  excludeId?: string,
): Promise<void> {
  if (weekNumber === null || weekNumber === undefined) {
    return; // Null is allowed (no uniqueness constraint)
  }

  validateWeekNumber(weekNumber);

  const existing = await prisma.cuttingList.findFirst({
    where: {
      userId,
      weekNumber,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });

  if (existing) {
    throw new ValidationError(
      `Bu kullanıcı için ${weekNumber}. hafta zaten kullanılıyor`,
      "weekNumber",
      weekNumber,
    );
  }
}

/**
 * Validate stock length uniqueness
 */
export async function validateStockLength(
  prisma: {
    stockLength: {
      findFirst: (args: { where: { length: number } }) => Promise<{
        id: string;
      } | null>;
    };
  },
  length: number,
  excludeId?: string,
): Promise<void> {
  validatePositiveNumber(length, "length");

  const existing = await prisma.stockLength.findFirst({
    where: {
      length,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });

  if (existing) {
    throw new ValidationError(
      "Bu stok uzunluğu zaten mevcut",
      "length",
      length,
    );
  }
}

/**
 * Validate profile stock length uniqueness
 */
export async function validateProfileStockLength(
  prisma: {
    profileStockLength: {
      findFirst: (args: {
        where: { profileId: string; stockLength: number };
      }) => Promise<{ id: string } | null>;
    };
  },
  profileId: string,
  stockLength: number,
  excludeId?: string,
): Promise<void> {
  validatePositiveNumber(stockLength, "stockLength");

  const existing = await prisma.profileStockLength.findFirst({
    where: {
      profileId,
      stockLength,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });

  if (existing) {
    throw new ValidationError(
      "Bu profil için bu stok uzunluğu zaten tanımlı",
      "stockLength",
      stockLength,
    );
  }
}

/**
 * Validate work order profile mapping uniqueness
 */
export async function validateWorkOrderProfileMapping(
  prisma: {
    workOrderProfileMapping: {
      findFirst: (args: {
        where: {
          workOrderId: string;
          profileType: string;
          weekNumber: number;
          year: number;
        };
      }) => Promise<{ id: string } | null>;
    };
  },
  workOrderId: string,
  profileType: string,
  weekNumber: number,
  year: number,
  excludeId?: string,
): Promise<void> {
  validateWeekNumber(weekNumber);
  validateYear(year);
  validateLength(workOrderId, "workOrderId", 100);
  validateLength(profileType, "profileType", 100);

  const existing = await prisma.workOrderProfileMapping.findFirst({
    where: {
      workOrderId,
      profileType,
      weekNumber,
      year,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });

  if (existing) {
    throw new ValidationError(
      "Bu iş emri için bu profil tipi, hafta ve yıl kombinasyonu zaten mevcut",
      "workOrderProfileMapping",
      { workOrderId, profileType, weekNumber, year },
    );
  }
}
