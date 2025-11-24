/**
 * @fileoverview Input Validation Utilities - Modernized
 * @module ValidationUtils
 * @version 2.0.0 - Enterprise Grade Modular Design
 */

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * File validation result interface
 */
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Optimization parameters validation interface
 */
export interface OptimizationParamsValidation {
  algorithm: string;
  objectives: Array<{
    type: string;
    weight: number;
    priority: string;
  }>;
  constraints: {
    kerfWidth: number;
    startSafety: number;
    endSafety: number;
    minScrapLength: number;
    maxWastePercentage: number;
    maxCutsPerStock: number;
  };
  stockLengths: number[];
  unit: string;
}

/**
 * Validation rule interface
 */
interface ValidationRule<T> {
  validator: (value: T) => boolean;
  errorMessage: string;
  sanitizer?: (value: T) => T;
}

/**
 * Validation configuration
 */
const VALIDATION_CONFIG = {
  maxLength: {
    default: 255,
    version: 20,
    size: 20,
    profileType: 50,
    cuttingPattern: 100,
  },
  numericRanges: {
    length: { min: 1, max: 20000 },
    quantity: { min: 1, max: 1000 },
    kerfWidth: { min: 0.1, max: 5 },
    startSafety: { min: 0, max: 100 },
    endSafety: { min: 0, max: 100 },
    minScrapLength: { min: 0, max: 1000 },
    maxWastePercentage: { min: 0, max: 100 },
    maxCutsPerStock: { min: 1, max: 100 },
    stockLength: { min: 1000, max: 20000 },
  },
  allowedValues: {
    // ALIGNED WITH BACKEND: Only 4 algorithms available
    algorithms: ["ffd", "bfd", "genetic", "pooling"],
    units: ["mm", "cm", "m"],
    fileTypes: [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
      "application/json",
    ],
  },
  regexPatterns: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^(\+90|0)?[5][0-9]{9}$/,
  },
} as const;

/**
 * Input sanitization with modern approach
 */
export const sanitizeInput = (
  input: string,
  maxLength: number = VALIDATION_CONFIG.maxLength.default,
): string => {
  const sanitizers = [
    (str: string) => str.trim(),
    (str: string) => str.replace(/[<>]/g, ""),
    (str: string) => str.replace(/javascript:/gi, ""),
    (str: string) => str.replace(/on\w+\s*=/gi, ""),
    (str: string) => str.replace(/data:/gi, ""),
    (str: string) => str.replace(/vbscript:/gi, ""),
    (str: string) => str.substring(0, maxLength),
  ];

  return typeof input !== "string"
    ? ""
    : sanitizers.reduce((result, sanitizer) => sanitizer(result), input);
};

/**
 * Number validation with range checking
 */
export const validateNumber = (
  value: unknown,
  min: number = 0,
  max: number = Number.MAX_SAFE_INTEGER,
): number => {
  const num = Number(value);
  return isNaN(num) || !isFinite(num) ? min : Math.max(min, Math.min(max, num));
};

/**
 * Required field validation
 */
export const validateRequired = (value: unknown): boolean => {
  return value !== null && value !== undefined && value !== "";
};

/**
 * Email validation using regex
 */
export const validateEmail = (email: string): boolean => {
  return VALIDATION_CONFIG.regexPatterns.email.test(email);
};

/**
 * URL validation with try-catch pattern
 */
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Phone number validation (Turkish format)
 */
export const validatePhoneNumber = (phone: string): boolean => {
  return VALIDATION_CONFIG.regexPatterns.phone.test(phone);
};

/**
 * Validation rule builder
 */
class ValidationRuleBuilder<T> {
  private rules: ValidationRule<T>[] = [];

  addRule(
    validator: (value: T) => boolean,
    errorMessage: string,
    sanitizer?: (value: T) => T,
  ): this {
    const rule: ValidationRule<T> = { validator, errorMessage };
    if (sanitizer) {
      rule.sanitizer = sanitizer;
    }
    this.rules.push(rule);
    return this;
  }

  validate(value: T, fieldName: string, errors: Record<string, string>): void {
    this.rules.forEach((rule) => {
      const sanitizedValue = rule.sanitizer ? rule.sanitizer(value) : value;
      if (!rule.validator(sanitizedValue)) {
        errors[fieldName] = rule.errorMessage;
      }
    });
  }
}

/**
 * String field validation with modern approach
 */
const createStringFieldValidator = (maxLength: number) => {
  return (
    value: unknown,
    fieldName: string,
    errors: Record<string, string>,
  ): void => {
    new ValidationRuleBuilder<unknown>()
      .addRule(validateRequired, `${fieldName} gereklidir`)
      .addRule((val) => {
        const sanitized = sanitizeInput(String(val), maxLength);
        return sanitized === String(val);
      }, `${fieldName} geçersiz karakterler içeriyor`)
      .validate(value, fieldName, errors);
  };
};

/**
 * Numeric field validation with range checking
 */
const createNumericFieldValidator = (
  min: number,
  max: number,
  fieldName: string,
) => {
  return (value: unknown, errors: Record<string, string>): void => {
    new ValidationRuleBuilder<unknown>()
      .addRule(validateRequired, `${fieldName} gereklidir`)
      .addRule((val) => {
        const validated = validateNumber(val, min, max);
        return validated === val;
      }, `${fieldName} ${min}-${max} arasında olmalıdır`)
      .validate(value, fieldName, errors);
  };
};

/**
 * Cutting list item validation with modern approach
 */
export const validateCuttingListItem = (
  item: Record<string, unknown>,
): ValidationResult => {
  const errors: Record<string, string> = {};

  // String field validators
  const stringValidators = {
    product: createStringFieldValidator(VALIDATION_CONFIG.maxLength.default),
    workOrder: createStringFieldValidator(VALIDATION_CONFIG.maxLength.default),
    color: createStringFieldValidator(VALIDATION_CONFIG.maxLength.default),
    version: createStringFieldValidator(VALIDATION_CONFIG.maxLength.version),
    size: createStringFieldValidator(VALIDATION_CONFIG.maxLength.size),
    profileType: createStringFieldValidator(
      VALIDATION_CONFIG.maxLength.profileType,
    ),
  };

  // Numeric field validators
  const numericValidators = {
    length: createNumericFieldValidator(
      VALIDATION_CONFIG.numericRanges.length.min,
      VALIDATION_CONFIG.numericRanges.length.max,
      "Uzunluk",
    ),
    quantity: createNumericFieldValidator(
      VALIDATION_CONFIG.numericRanges.quantity.min,
      VALIDATION_CONFIG.numericRanges.quantity.max,
      "Adet",
    ),
  };

  // Apply string validations
  Object.entries(stringValidators).forEach(([field, validator]) => {
    validator(item[field], field, errors);
  });

  // Apply numeric validations
  Object.entries(numericValidators).forEach(([field, validator]) => {
    validator(item[field], errors);
  });

  // Optional field validation
  const optionalFieldValidation = (field: string, maxLength: number) => {
    const value = item[field];
    if (value && String(value).trim()) {
      const sanitized = sanitizeInput(String(value), maxLength);
      if (sanitized !== String(value)) {
        errors[field] = `${field} geçersiz karakterler içeriyor`;
      }
    }
  };

  optionalFieldValidation(
    "cuttingPattern",
    VALIDATION_CONFIG.maxLength.cuttingPattern,
  );

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Optimization parameters validation with modern approach
 */
export const validateOptimizationParams = (
  params: Partial<OptimizationParamsValidation>,
): ValidationResult => {
  const errors: Record<string, string> = {};

  // Algorithm validation
  const validateAlgorithm = (algorithm: string | undefined): void => {
    new ValidationRuleBuilder<string | undefined>()
      .addRule(validateRequired, "Algoritma seçilmelidir")
      .addRule(
        (algo) =>
          algo
            ? VALIDATION_CONFIG.allowedValues.algorithms.includes(
                algo as "ffd" | "bfd" | "genetic" | "pooling",
              )
            : false,
        "Geçersiz algoritma seçimi",
      )
      .validate(algorithm, "algorithm", errors);
  };

  // Unit validation
  const validateUnit = (unit: string | undefined): void => {
    new ValidationRuleBuilder<string | undefined>()
      .addRule(validateRequired, "Birim seçilmelidir")
      .addRule(
        (u) =>
          u
            ? VALIDATION_CONFIG.allowedValues.units.includes(
                u as "m" | "mm" | "cm",
              )
            : false,
        "Geçersiz birim seçimi",
      )
      .validate(unit, "unit", errors);
  };

  // Constraints validation
  const validateConstraints = (
    constraints: OptimizationParamsValidation["constraints"] | undefined,
  ): void => {
    if (!constraints) {
      errors.constraints = "Kısıtlar belirtilmelidir";
      return;
    }

    const constraintValidators = {
      kerfWidth: createNumericFieldValidator(
        VALIDATION_CONFIG.numericRanges.kerfWidth.min,
        VALIDATION_CONFIG.numericRanges.kerfWidth.max,
        "Testere genişliği",
      ),
      startSafety: createNumericFieldValidator(
        VALIDATION_CONFIG.numericRanges.startSafety.min,
        VALIDATION_CONFIG.numericRanges.startSafety.max,
        "Başlangıç güvenlik mesafesi",
      ),
      endSafety: createNumericFieldValidator(
        VALIDATION_CONFIG.numericRanges.endSafety.min,
        VALIDATION_CONFIG.numericRanges.endSafety.max,
        "Bitiş güvenlik mesafesi",
      ),
      minScrapLength: createNumericFieldValidator(
        VALIDATION_CONFIG.numericRanges.minScrapLength.min,
        VALIDATION_CONFIG.numericRanges.minScrapLength.max,
        "Minimum artık uzunluğu",
      ),
      maxWastePercentage: createNumericFieldValidator(
        VALIDATION_CONFIG.numericRanges.maxWastePercentage.min,
        VALIDATION_CONFIG.numericRanges.maxWastePercentage.max,
        "Maksimum atık yüzdesi",
      ),
      maxCutsPerStock: createNumericFieldValidator(
        VALIDATION_CONFIG.numericRanges.maxCutsPerStock.min,
        VALIDATION_CONFIG.numericRanges.maxCutsPerStock.max,
        "Stok başına maksimum kesim sayısı",
      ),
    };

    Object.entries(constraintValidators).forEach(([field, validator]) => {
      validator(constraints[field as keyof typeof constraints], errors);
    });
  };

  // Stock lengths validation
  const validateStockLengths = (stockLengths: number[] | undefined): void => {
    new ValidationRuleBuilder<number[] | undefined>()
      .addRule(
        (lengths) =>
          Boolean(lengths && Array.isArray(lengths) && lengths.length > 0),
        "En az bir stok uzunluğu belirlenmelidir",
      )
      .validate(stockLengths, "stockLengths", errors);

    if (stockLengths && Array.isArray(stockLengths)) {
      stockLengths.forEach((length, index) => {
        const validatedLength = validateNumber(
          length,
          VALIDATION_CONFIG.numericRanges.stockLength.min,
          VALIDATION_CONFIG.numericRanges.stockLength.max,
        );
        if (validatedLength !== length) {
          errors[`stockLengths[${index}]`] =
            "Stok uzunluğu 1000-20000 mm arasında olmalıdır";
        }
      });
    }
  };

  // Apply all validations
  validateAlgorithm(params.algorithm);
  validateConstraints(params.constraints);
  validateStockLengths(params.stockLengths);
  validateUnit(params.unit);

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * File upload validation with modern approach
 */
export const validateFileUpload = (
  file: File,
  maxSize: number = 10 * 1024 * 1024,
): FileValidationResult => {
  const validationRules = [
    {
      validator: () => file.size <= maxSize,
      error: `Dosya boyutu ${maxSize / (1024 * 1024)}MB'dan büyük olamaz`,
    },
    {
      validator: () =>
        VALIDATION_CONFIG.allowedValues.fileTypes.includes(
          file.type as
            | "application/json"
            | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            | "application/vnd.ms-excel"
            | "text/csv",
        ),
      error:
        "Sadece Excel (.xlsx, .xls), CSV (.csv) ve JSON (.json) dosyaları kabul edilir",
    },
    {
      validator: () => {
        const sanitizedFileName = sanitizeInput(
          file.name,
          VALIDATION_CONFIG.maxLength.default,
        );
        return sanitizedFileName === file.name;
      },
      error: "Dosya adı geçersiz karakterler içeriyor",
    },
  ];

  const failedRule = validationRules.find((rule) => !rule.validator());

  return failedRule
    ? { isValid: false, error: failedRule.error }
    : { isValid: true };
};
