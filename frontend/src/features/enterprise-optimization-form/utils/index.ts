/**
 * @fileoverview Enterprise Optimization Form Utilities
 * @module EnterpriseOptimizationForm/Utils
 * @version 1.0.0
 */

import {
  LengthUnit,
  OptimizationConstraints,
  OptimizationParams,
} from "../types";
import { VALIDATION_LIMITS } from "../constants";

// Unit conversion utilities
export const convertUnit = (
  value: number,
  from: LengthUnit,
  to: LengthUnit,
): number => {
  const conversions: Record<string, Record<string, number>> = {
    mm: { cm: 0.1, m: 0.001 },
    cm: { mm: 10, m: 0.01 },
    m: { mm: 1000, cm: 100 },
  };
  return value * (conversions[from]?.[to] || 1);
};

export const formatWithUnit = (value: number, unit: string): string => {
  return `${value} ${unit}`;
};

// Security utilities
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .trim()
    .substring(0, VALIDATION_LIMITS.MAX_INPUT_LENGTH); // Limit length
};

export const validateNumber = (
  value: unknown,
  min: number = 0,
  max: number = Number.MAX_SAFE_INTEGER,
): number => {
  const num = Number(value);
  if (isNaN(num) || !isFinite(num)) return min;
  return Math.max(min, Math.min(max, num));
};

import type { FormCuttingListItem } from "../types";

// Validation utilities
export const validateCuttingListItem = (
  item: FormCuttingListItem,
  index: number,
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!item.workOrderId?.trim()) {
    errors[`workOrder_${index}`] = "İş emri boş olamaz";
  }
  if (!item.profileType?.trim()) {
    errors[`profileType_${index}`] = "Profil tipi boş olamaz";
  }
  if (item.length <= 0) {
    errors[`length_${index}`] = "Ölçü 0'dan büyük olmalıdır";
  }
  if (item.quantity <= 0) {
    errors[`quantity_${index}`] = "Miktar 0'dan büyük olmalıdır";
  }

  return errors;
};

export const validateConstraints = (
  constraints: OptimizationConstraints,
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (constraints.kerfWidth < 0) {
    errors.kerfWidth = "Testere kalınlığı negatif olamaz";
  }
  if (
    constraints.maxWastePercentage < VALIDATION_LIMITS.MIN_WASTE_PERCENTAGE ||
    constraints.maxWastePercentage > VALIDATION_LIMITS.MAX_WASTE_PERCENTAGE
  ) {
    errors.maxWastePercentage = "Atık yüzdesi 0-100 arasında olmalıdır";
  }

  return errors;
};

// Form data transformation
export const transformToOptimizationItems = (
  cuttingList: FormCuttingListItem[],
  sanitizeInput: (input: string) => string,
  validateNumber: (value: unknown, min?: number, max?: number) => number,
) => {
  return cuttingList.map((item) => ({
    id: item.id as any, // ID branded type conversion
    workOrderId: sanitizeInput(item.workOrderId),
    productName: `${sanitizeInput(item.profileType)} - ${sanitizeInput(item.color)}`,
    profileType: sanitizeInput(item.profileType),
    measurement: item.length.toString(),
    length: validateNumber(
      item.length,
      VALIDATION_LIMITS.MIN_LENGTH,
      VALIDATION_LIMITS.MAX_LENGTH,
    ),
    quantity: validateNumber(
      item.quantity,
      VALIDATION_LIMITS.MIN_QUANTITY,
      VALIDATION_LIMITS.MAX_QUANTITY,
    ),
    totalLength: validateNumber(
      item.length * item.quantity,
      VALIDATION_LIMITS.MIN_TOTAL_LENGTH,
      VALIDATION_LIMITS.MAX_TOTAL_LENGTH,
    ),
    metadata: {
      color: sanitizeInput(item.color),
      version: sanitizeInput(item.version),
      size: sanitizeInput(item.size),
      cuttingPattern: sanitizeInput(item.cuttingPattern),
    },
  }));
};

export const transformToOptimizationFormData = (
  items: ReturnType<typeof transformToOptimizationItems>,
  params: OptimizationParams,
  validateNumber: (value: unknown, min?: number, max?: number) => number,
) => {
  return {
    items,
    algorithm: params.algorithm,
    stockLength: validateNumber(
      params.stockLengths[0] || 6000,
      VALIDATION_LIMITS.MIN_STOCK_LENGTH,
      VALIDATION_LIMITS.MAX_STOCK_LENGTH,
    ),
    materialStockLengths: params.stockLengths.map((length: number) => ({
      profileType: "Aluminum",
      stockLength: validateNumber(
        length,
        VALIDATION_LIMITS.MIN_STOCK_LENGTH,
        VALIDATION_LIMITS.MAX_STOCK_LENGTH,
      ),
      availability: 1000,
      costPerMm: 0.1,
      costPerStock:
        validateNumber(
          length,
          VALIDATION_LIMITS.MIN_STOCK_LENGTH,
          VALIDATION_LIMITS.MAX_STOCK_LENGTH,
        ) * 0.1,
      materialGrade: "6061-T6",
      weight:
        validateNumber(
          length,
          VALIDATION_LIMITS.MIN_STOCK_LENGTH,
          VALIDATION_LIMITS.MAX_STOCK_LENGTH,
        ) * 0.0027,
    })),
    ...(params.performance ? { performance: params.performance } : {}),
    objectives: params.objectives,
  };
};
