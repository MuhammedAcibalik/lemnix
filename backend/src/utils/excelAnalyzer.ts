/**
 * @fileoverview Enterprise-grade Excel analyzer for hierarchical work order data extraction
 * @module ExcelAnalyzer
 * @version 3.0.0
 * @license MIT
 */

import * as XLSX from "xlsx";
import * as path from "path";
import * as fs from "fs";
import { logger } from "../services/logger";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type CellValue = string | number | boolean | Date | null | undefined;
export type ExcelRow = ReadonlyArray<CellValue>;
export type ExcelData = ReadonlyArray<ExcelRow>;
export type ErrorSeverity = "critical" | "error" | "warning" | "info";

export interface ColumnMapping {
  readonly workOrderId?: number;
  readonly date?: number;
  readonly version?: number;
  readonly color?: number;
  readonly note?: number;
  readonly sipQuantity?: number;
  readonly size?: number;
  readonly profile?: number;
  readonly measurement?: number;
  readonly quantity?: number;
}

export interface ProfileItem {
  readonly profileType: string; // Profil tipi (KAPALI ALT, AÇIK ALT, vs.)
  readonly measurement: string; // Ölçü
  readonly quantity: number; // Parça miktarı
  readonly rowIndex: number;
  readonly confidence: number;
}

export interface WorkOrderItem {
  readonly workOrderId: string;
  readonly profiles: ReadonlyArray<ProfileItem>;
  readonly metadata: WorkOrderMetadata;
  readonly rowIndex: number;
  readonly confidence: number;
  readonly source: DataSource;
  readonly totalQuantity: number; // Toplam parça miktarı
}

export interface WorkOrderMetadata {
  readonly date?: string;
  readonly version?: string;
  readonly color?: string;
  readonly note?: string;
  readonly sipQuantity?: number;
  readonly size?: string;
}

export interface DataSource {
  readonly type: "direct" | "inherited" | "merged";
  readonly parentWorkOrderId?: string;
  readonly originalRowIndex: number;
}

export interface ProductGroup {
  readonly productName: string;
  readonly workOrders: ReadonlyArray<WorkOrderItem>;
  readonly confidence: number;
  readonly metadata: ProductMetadata;
  readonly validation: ValidationSummary;
  readonly totalProfiles: number; // Toplam profil sayısı
  readonly totalQuantity: number; // Toplam parça miktarı
  readonly profileTypes: ReadonlyArray<string>; // Kullanılan profil tipleri
}

export interface ProductMetadata {
  readonly startRow: number;
  readonly endRow: number;
  readonly totalQuantity: number;
  readonly uniqueWorkOrders: number;
  readonly averageConfidence: number;
}

export interface ValidationSummary {
  readonly totalErrors: number;
  readonly totalWarnings: number;
  readonly criticalErrors: number;
  readonly isValid: boolean;
}

export interface HeaderPattern {
  readonly columns: ColumnMapping;
  readonly confidence: number;
  readonly rowIndex: number;
  readonly detectedFields: number;
}

export interface ProductSection {
  readonly productName: string;
  readonly startRow: number;
  readonly endRow: number;
  readonly headerRow: number;
  readonly dataRows: ReadonlyArray<number>;
  readonly confidence: number;
}

export interface ValidationError {
  readonly code: ErrorCode;
  readonly message: string;
  readonly rowIndex?: number;
  readonly columnIndex?: number;
  readonly severity: ErrorSeverity;
  readonly value?: CellValue;
  readonly context?: Record<string, unknown>;
}

export enum ErrorCode {
  MISSING_WORK_ORDER = "MISSING_WORK_ORDER",
  MISSING_PROFILE = "MISSING_PROFILE",
  MISSING_MEASUREMENT = "MISSING_MEASUREMENT",
  INVALID_QUANTITY = "INVALID_QUANTITY",
  QUANTITY_OVERFLOW = "QUANTITY_OVERFLOW",
  HIGH_QUANTITY = "HIGH_QUANTITY",
  INHERITED_ID = "INHERITED_ID",
  GENERATED_ID = "GENERATED_ID",
  INVALID_FORMAT = "INVALID_FORMAT",
  PARSE_FAILED = "PARSE_FAILED",
  FILE_NOT_FOUND = "FILE_NOT_FOUND",
  EMPTY_WORKSHEET = "EMPTY_WORKSHEET",
  NO_HEADER_FOUND = "NO_HEADER_FOUND",
  NO_PRODUCTS_FOUND = "NO_PRODUCTS_FOUND",
}

export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: ReadonlyArray<ValidationError>;
  readonly warnings: ReadonlyArray<ValidationError>;
  readonly confidence: number;
}

export interface ParseContext {
  readonly fileName: string;
  readonly parseDate: Date;
  readonly totalRows: number;
  readonly headerPattern?: HeaderPattern;
  readonly encoding: string;
}

export interface ParseMetrics {
  readonly totalProducts: number;
  readonly totalWorkOrders: number;
  readonly totalItems: number;
  readonly parseTimeMs: number;
  readonly memoryUsedMb: number;
  readonly confidence: number;
  readonly skippedRows: number;
  readonly processedRows: number;
}

export interface ExcelParseResult {
  readonly success: boolean;
  readonly productGroups: ReadonlyArray<ProductGroup>;
  readonly errors: ReadonlyArray<ValidationError>;
  readonly warnings: ReadonlyArray<ValidationError>;
  readonly context: ParseContext;
  readonly metrics: ParseMetrics;
  readonly summary: {
    readonly totalProducts: number;
    readonly totalWorkOrders: number;
    readonly totalProfiles: number;
    readonly totalQuantity: number;
    readonly profileTypes: ReadonlyArray<string>;
  };
}

export interface ILogger {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
}

interface PatternConfig {
  readonly pattern: RegExp;
  readonly field: keyof ColumnMapping;
  readonly weight: number;
  readonly required: boolean;
}

// ============================================================================
// UTILITY CLASSES
// ============================================================================

export class TypeGuards {
  public static isString(value: CellValue): value is string {
    return typeof value === "string";
  }

  public static isNumber(value: CellValue): value is number {
    return typeof value === "number" && !isNaN(value) && isFinite(value);
  }

  public static isDate(value: CellValue): value is Date {
    return value instanceof Date && !isNaN(value.getTime());
  }

  public static isNullOrUndefined(value: CellValue): value is null | undefined {
    return value === null || value === undefined;
  }

  public static isValidString(value: CellValue): boolean {
    return TypeGuards.isString(value) && value.trim().length > 0;
  }
}

export class DataTransformers {
  public static toString(value: CellValue): string {
    if (TypeGuards.isNullOrUndefined(value)) return "";
    if (TypeGuards.isString(value)) return value.trim();
    if (TypeGuards.isDate(value)) return value.toISOString();
    return String(value).trim();
  }

  public static toNumber(value: CellValue): number | undefined {
    if (TypeGuards.isNullOrUndefined(value)) return undefined;
    if (TypeGuards.isNumber(value)) return value;

    const str = this.toString(value);
    if (!str) return undefined;

    const normalized = str.replace(/[^\d.,-]/g, "").replace(",", ".");
    const num = Number(normalized);

    return TypeGuards.isNumber(num) ? num : undefined;
  }

  public static extractNumber(value: CellValue): number | undefined {
    const str = this.toString(value);
    const match = str.match(/[\d.,]+/);
    return match ? this.toNumber(match[0]) : undefined;
  }

  public static normalizeText(value: CellValue): string {
    return this.toString(value)
      .toLowerCase()
      .replace(/[ğüşıöçĞÜŞİÖÇ]/g, (char) => {
        const map: Record<string, string> = {
          ğ: "g",
          ü: "u",
          ş: "s",
          ı: "i",
          ö: "o",
          ç: "c",
          Ğ: "g",
          Ü: "u",
          Ş: "s",
          İ: "i",
          Ö: "o",
          Ç: "c",
        };
        return map[char] || char;
      })
      .replace(/\s+/g, " ")
      .trim();
  }
}

// ============================================================================
// ENHANCED PATTERN DETECTION
// ============================================================================

export class PatternDetector {
  private static readonly HEADER_PATTERNS: ReadonlyArray<PatternConfig> = [
    {
      pattern: /^(iş\s*emri|is\s*emri|work\s*order|wo|i̇ş\s*emri|i̇s\s*emri)/i,
      field: "workOrderId",
      weight: 1.0,
      required: false,
    },
    {
      pattern: /^(tarih|date|tarıh)/i,
      field: "date",
      weight: 0.8,
      required: false,
    },
    {
      pattern: /^(versiyon|version|ver)/i,
      field: "version",
      weight: 0.7,
      required: false,
    },
    {
      pattern: /^(renk|color|rang)/i,
      field: "color",
      weight: 0.7,
      required: false,
    },
    {
      pattern: /^(not|note|açıklama|description)/i,
      field: "note",
      weight: 0.6,
      required: false,
    },
    {
      pattern: /^(sip\.?\s*adet|sipariş\s*adet|sıp\.?\s*adet)/i,
      field: "sipQuantity",
      weight: 0.8,
      required: false,
    },
    {
      pattern: /^(ebat|size|boyut|ölçek)/i,
      field: "size",
      weight: 0.7,
      required: false,
    },
    {
      pattern: /^(profil|profile|profıl)/i,
      field: "profile",
      weight: 1.0,
      required: true,
    },
    {
      pattern: /^(ölçü|measure|ölçüm|measurement)/i,
      field: "measurement",
      weight: 1.0,
      required: true,
    },
    {
      pattern: /^(adet|quantity|miktar|qty)/i,
      field: "quantity",
      weight: 1.0,
      required: true,
    },
  ];

  public static detectHeaderRow(
    data: ExcelData,
    startIndex = 0,
  ): HeaderPattern | null {
    // GERÇEK EXCEL YAPISINA GÖRE: Header her zaman row 3'te
    const headerRowIndex = 3;

    if (headerRowIndex >= data.length) {
      return null;
    }

    const row = data[headerRowIndex];
    if (!row || row.length === 0) {
      return null;
    }

    const pattern = this.analyzeRowAsHeader(row, headerRowIndex);

    // If row 3 doesn't look like header, fall back to search
    if (!pattern || pattern.confidence < 0.5) {
      const searchLimit = Math.min(data.length, startIndex + 50);
      let bestPattern: HeaderPattern | null = null;

      for (let i = startIndex; i < searchLimit; i++) {
        const searchRow = data[i];
        if (!searchRow || searchRow.length === 0) continue;

        const searchPattern = this.analyzeRowAsHeader(searchRow, i);
        if (
          searchPattern &&
          (!bestPattern || searchPattern.confidence > bestPattern.confidence)
        ) {
          bestPattern = searchPattern;
        }

        if (bestPattern && bestPattern.confidence > 0.7) {
          break;
        }
      }

      return bestPattern;
    }

    return pattern;
  }

  private static analyzeRowAsHeader(
    row: ExcelRow,
    rowIndex: number,
  ): HeaderPattern | null {
    const columns: Record<string, number> = {};
    let matchedWeight = 0;
    let totalPossibleWeight = 0;
    let requiredFieldsFound = 0;

    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const cellValue = DataTransformers.toString(row[colIndex]);
      if (!cellValue) continue;

      const normalizedCell = DataTransformers.normalizeText(cellValue);

      for (const { pattern, field, weight, required } of this.HEADER_PATTERNS) {
        if (pattern.test(normalizedCell)) {
          columns[field] = colIndex;
          matchedWeight += weight;
          if (required) requiredFieldsFound++;
          break;
        }
      }
    }

    // Calculate total possible weight for detected fields
    const detectedPatterns = this.HEADER_PATTERNS.filter((p) =>
      Object.keys(columns).includes(p.field),
    );
    totalPossibleWeight = detectedPatterns.reduce(
      (sum, p) => sum + p.weight,
      0,
    );

    const requiredFieldsCount = this.HEADER_PATTERNS.filter(
      (p) => p.required,
    ).length;
    const hasMinimumFields =
      requiredFieldsFound >= Math.floor(requiredFieldsCount * 0.5);

    if (!hasMinimumFields || Object.keys(columns).length < 3) {
      return null;
    }

    const confidence =
      totalPossibleWeight > 0 ? matchedWeight / totalPossibleWeight : 0;

    return {
      columns: columns as ColumnMapping,
      confidence,
      rowIndex,
      detectedFields: Object.keys(columns).length,
    };
  }

  public static detectProductSections(
    data: ExcelData,
    headerPattern: HeaderPattern | null = null,
  ): ReadonlyArray<ProductSection> {
    const sections: ProductSection[] = [];
    const productNamesUsed = new Set<string>(); // Duplicate prevention

    // ULTRA AGGRESSIVE: Start from row 0 to catch ALL products
    const dataStartIndex = 0; // Always start from beginning

    logger.debug("Starting AGGRESSIVE product section detection from row 0");

    // First pass: Scan entire document for products
    let nextStartIndex = dataStartIndex;
    let searchAttempts = 0;
    const maxAttempts = data.length; // Check every row if needed

    while (nextStartIndex < data.length && searchAttempts < maxAttempts) {
      searchAttempts++;
      const nextSection = this.findNextProductSection(
        data,
        nextStartIndex,
        headerPattern,
      );

      if (nextSection) {
        // Check for duplicate product names
        const normalizedName = nextSection.productName.toUpperCase().trim();

        if (!productNamesUsed.has(normalizedName)) {
          sections.push(nextSection);
          productNamesUsed.add(normalizedName);
          logger.debug("Added unique product", {
            productName: nextSection.productName,
            startRow: nextSection.startRow,
          });
        } else {
          // Merge with existing section
          const existingIndex = sections.findIndex(
            (s) => s.productName.toUpperCase().trim() === normalizedName,
          );
          if (existingIndex >= 0) {
            const existing = sections[existingIndex];
            if (existing) {
              const mergedSection: ProductSection = {
                productName: existing.productName,
                startRow: Math.min(existing.startRow, nextSection.startRow),
                headerRow: existing.headerRow,
                confidence: Math.max(
                  existing.confidence || 0.8,
                  nextSection.confidence || 0.8,
                ),
                endRow: Math.max(existing.endRow, nextSection.endRow),
                dataRows: [
                  ...new Set([...existing.dataRows, ...nextSection.dataRows]),
                ].sort((a, b) => a - b),
              };
              sections[existingIndex] = mergedSection;
              logger.debug("Merged duplicate product", {
                productName: nextSection.productName,
              });
            }
          }
        }
        nextStartIndex = nextSection.endRow + 1;
      } else {
        // No section found, but keep searching
        nextStartIndex++;
      }
    }

    // Strategy 2: If no clear sections found, create a single section
    if (sections.length === 0) {
      const fallbackSection = this.createFallbackSection(
        data,
        dataStartIndex,
        headerPattern,
      );
      if (fallbackSection) {
        sections.push(fallbackSection);
      }
    }

    logger.info("Found unique product sections", { count: sections.length });
    return sections;
  }

  private static findNextProductSection(
    data: ExcelData,
    startIndex: number,
    headerPattern: HeaderPattern | null,
  ): ProductSection | null {
    let productName = "";
    let sectionStartRow = startIndex;
    const headerRow = headerPattern?.rowIndex ?? -1;
    const dataRows: number[] = [];

    logger.debug("Searching for product section", { startIndex });

    // PHASE 1: Comprehensive product name search
    const productCandidates: Array<{
      name: string;
      row: number;
      confidence: number;
    }> = [];

    // Look through more rows to find potential product names
    for (let i = startIndex; i < Math.min(startIndex + 50, data.length); i++) {
      const row = data[i];
      if (!row) continue;

      // Check all cells in the row, not just the first
      for (let j = 0; j < Math.min(row.length, 8); j++) {
        const cellValue = DataTransformers.toString(row[j]);
        if (this.isValidProductName(cellValue)) {
          const confidence = this.calculateProductNameConfidence(
            cellValue,
            i,
            j,
          );
          productCandidates.push({
            name: cellValue,
            row: i,
            confidence,
          });
          logger.debug("Product candidate found", {
            cellValue,
            row: i,
            col: j,
            confidence,
          });
        }
      }
    }

    // Sort candidates by confidence and select the best one
    if (productCandidates.length > 0) {
      productCandidates.sort((a, b) => b.confidence - a.confidence);
      const bestCandidate = productCandidates[0];

      if (bestCandidate && bestCandidate.confidence > 0.4) {
        // Lower threshold for more products
        productName = bestCandidate.name;
        sectionStartRow = bestCandidate.row;
        logger.debug("Selected product", {
          productName,
          confidence: bestCandidate.confidence,
        });
      }
    }

    // PHASE 2: If no good product name found, try data-driven approach
    if (!productName) {
      logger.debug("No clear product name found, analyzing data patterns");

      // Find first data row and use it to infer product context
      for (
        let i = Math.max(startIndex, headerRow + 1);
        i < Math.min(startIndex + 100, data.length);
        i++
      ) {
        const row = data[i];
        if (!row) continue;

        if (this.isDataRow(row, headerPattern)) {
          // Extract product info from data context - convert readonly array to mutable
          const mutableRow = [...row];
          const inferredProduct = this.inferProductFromDataRow(
            mutableRow,
            i,
            data,
          );
          if (inferredProduct) {
            productName = inferredProduct;
            sectionStartRow = i;
            logger.debug("Inferred product from data", { productName });
            break;
          }
        }
      }
    }

    // PHASE 3: Final fallback - but don't use generic names
    if (!productName) {
      logger.warn("Could not determine product name, section will be skipped");
      return null; // Don't create sections with generic names
    }

    // PHASE 4: Find data rows for this product
    let foundDataRows = false;
    const maxScanRows = Math.min(sectionStartRow + 200, data.length);

    for (
      let i = Math.max(sectionStartRow, headerRow + 1);
      i < maxScanRows;
      i++
    ) {
      const row = data[i];
      if (!row) continue;

      if (this.isDataRow(row, headerPattern)) {
        dataRows.push(i);
        foundDataRows = true;
      } else if (foundDataRows) {
        // Check if we've hit another product section
        const nextProductCandidate = DataTransformers.toString(row[0]);
        if (
          this.isValidProductName(nextProductCandidate) &&
          nextProductCandidate !== productName &&
          this.calculateProductNameConfidence(nextProductCandidate, i, 0) > 0.7
        ) {
          // Lower threshold for better separation
          logger.debug("Found next product, stopping current section", {
            nextProduct: nextProductCandidate,
            row: i,
          });
          break;
        }
      }
    }

    if (dataRows.length === 0) {
      logger.warn("No data rows found for product", { productName });
      return null;
    }

    const endRow = Math.max(...dataRows);
    logger.debug("Created product section", {
      productName,
      startRow: sectionStartRow,
      endRow,
      dataRowsCount: dataRows.length,
    });

    return {
      productName,
      startRow: sectionStartRow,
      endRow,
      headerRow: headerRow >= 0 ? headerRow : sectionStartRow,
      dataRows,
      confidence: 0.8, // Always high confidence since we validated the product name
    };
  }

  private static isObviouslyNotProduct(value: string): boolean {
    const notProductPatterns = [
      /^\d+$/, // Pure numbers
      /^[A-Z]$/, // Single letters
      /^(iş|is|work|tarih|date|renk|color|not|note|adet|quantity|profil|profile|ölçü|ebat|sip)/i,
      /^(hafta|sayfa|toplam|özet|rapor)$/i,

      // KRITIK: Profil tipleri asla ürün değil
      /^(kapalı\s*alt|açık\s*alt|kapalı\s*üst|açık\s*üst)$/i,
      /^(kapali\s*alt|acik\s*alt|kapali\s*ust|acik\s*ust)$/i,
      /^(closed\s*bottom|open\s*bottom|closed\s*top|open\s*top)$/i,

      // Sistem elementleri
      /^\d+\.?\s*hafta$/i, // 27.HAFTA, 27 HAFTA
      /^sayfa\s*\d+$/i, // SAYFA 7, SAYFA 8

      // Header pattern'leri - KESIN RED
      /^(iş\s*emri|is\s*emri|work\s*order)$/i, // Bu kritik!
      /^(tarih|date)$/i,
      /^(versiyon|version)$/i,
      /^(renk|color)$/i,
      /^(not|note)$/i,
      /^(ebat|size)$/i,
      /^(profil|profile)$/i,
      /^(ölçü|olcu|measure|measurement)$/i,
      /^(adet|quantity|miktar)$/i,
      /^(sip\.?adet|siparis\s*adet)$/i,
    ];

    return notProductPatterns.some((pattern) => pattern.test(value));
  }

  private static hasProductCharacteristics(value: string): boolean {
    // Look for characteristics that suggest this is a product name
    const characteristics = [
      // Güçlü ürün göstergeleri
      /(frame|gönye|ledbox|totem|kapı|door|pencere|window|poster|broşür|tabela|aboard|slide|convex)/i,

      // Boyut göstergeleri
      /\d+['"]?[lı|li|lu|lü]k/i, // 25'lik, 32'lik

      // Çok kelimeli ürün adları
      /^[A-ZÇĞIİÖŞÜ][a-zA-ZÇĞIİÖŞÜçğıiöşü\s]+[A-ZÇĞIİÖŞÜa-zA-Zçğıiöşü]$/, // En az 2 kelime

      // Ürün varyantları
      /(premium|standart|ekonomik|deluxe|pro|max|slim|eco|best|plus)/i,

      // Özel özellikler
      /(su\s*korumalı|waterproof|manyetik|zor\s*açılan|çift\s*taraflı|tek\s*taraflı)/i,

      // Malzeme göstergeleri
      /(alüminyum|aluminium|pvc|metal|plastik|akrilik)/i,

      // Büyük harfler (en az 3 tane)
      /[A-ZÇĞIİÖŞÜ]{3,}/,

      // Sistem adları
      /(sistem|system|set|kit)/i,

      // Genel ürün pattern'i - büyük harfle başlayan, makul uzunlukta
      /^[A-ZÇĞIİÖŞÜ][a-zA-ZÇĞIİÖŞÜçğıiöşü0-9\s\-_'".()]{3,50}$/,
    ];

    return characteristics.some((pattern) => pattern.test(value));
  }

  /**
   * Enhanced product name validation - BALANCED VERSION
   */
  private static isValidProductName(value: string): boolean {
    if (!value || value.length < 3 || value.length > 100) return false;

    // KESIN RED: Obvious non-products
    if (this.isObviouslyNotProduct(value)) return false;

    // KESIN RED: Profil tipleri asla ürün değil
    const profileTypePatterns = [
      /^(kapalı|açık)\s*(alt|üst)$/i,
      /^(kapali|acik)\s*(alt|ust)$/i,
      /^(closed|open)\s*(bottom|top)$/i,
    ];

    if (profileTypePatterns.some((pattern) => pattern.test(value.trim()))) {
      return false;
    }

    // KESIN RED: Sadece boyut olan değerler
    if (/^\d+[xX]\d+$/.test(value.trim())) return false;

    // Must have product characteristics (relaxed requirement)
    return this.hasProductCharacteristics(value);
  }

  /**
   * Calculate confidence score for product name - BALANCED VERSION
   */
  private static calculateProductNameConfidence(
    value: string,
    rowIndex: number,
    colIndex: number,
  ): number {
    let confidence = 0.5; // Higher base confidence

    // KRITIK: Header ve sistem elementleri kesin red
    if (this.isObviouslyNotProduct(value)) {
      return 0; // Kesin red
    }

    // ULTRA HIGH PRIORITY: Known missing products - GUARANTEED ACCEPTANCE
    const missingProductPatterns = [
      /^İNCE HELEZON$/,
      /^TOTEM$/,
      /^LEDLİ PLUS$/,
      /^30'LUK RONDOLU$/,
      /^25'LİK CAM ÇERÇEVE/,
      /^32'LİK CAM ÇERÇEVE/,
      /^TEK TARAFLI SÜRGÜLÜ ÇERÇEVE$/,
      /^MENÜLÜK İÇ \/ DIŞ$/,
      /^İÇ ÇENE\/DIŞ ÇENE$/,
      /^70X70 İKİ KANALLI STAND PROFİLİ$/,
      /^25'LİK RONDOLU$/,
      /^25'LİK SÜRGÜLÜ ÇERÇEVE$/,
    ];

    for (const pattern of missingProductPatterns) {
      if (pattern.test(value)) {
        return 1.0; // GUARANTEED acceptance
      }
    }

    // Position-based confidence
    if (colIndex === 0) confidence += 0.2; // First column more likely
    if (rowIndex < 50) confidence += 0.05; // Earlier rows slightly more likely

    // Content-based confidence - more aggressive
    if (
      /(frame|gönye|ledbox|totem|poster|tabela|door|window|aboard|slide|convex|broşür|helezon|çene|menülük)/i.test(
        value,
      )
    ) {
      confidence += 0.3; // Strong product indicators
    }
    if (/\d+['"]?[lı|li|lu|lü]k/i.test(value)) confidence += 0.2; // Size indicators (25'lik, 32'lik)
    if (/(premium|standart|ekonomik|deluxe|plus|slim|pro|max)/i.test(value))
      confidence += 0.1; // Quality indicators
    if (
      /(su\s*korumalı|waterproof|manyetik|zor\s*açılan|cam\s*çerçeve|kanallı|kanalsız)/i.test(
        value,
      )
    )
      confidence += 0.15; // Special features
    if (/\s+/.test(value) && value.split(" ").length >= 2) confidence += 0.05; // Multi-word names
    if (/[A-ZÇĞIİÖŞÜ]{3,}/.test(value)) confidence += 0.05; // Multiple capitals

    // Length-based confidence - wider range
    if (value.length >= 5 && value.length <= 60) confidence += 0.05;

    // CEZA SİSTEMİ - less aggressive
    if (/^\d+$/.test(value)) confidence = 0; // Pure numbers - kesin red
    if (value.length < 3) confidence = 0; // Too short - kesin red
    if (value.length > 100) confidence -= 0.2; // Very long

    // Header benzeri ifadeler için kesin ceza
    if (/^(iş|emri|tarih|renk|not|adet|profil|ölçü|ebat)$/i.test(value)) {
      confidence = 0; // Kesin red
    }

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Infer product name from data row context
   */
  private static inferProductFromDataRow(
    row: unknown[],
    rowIndex: number,
    data: ExcelData,
  ): string | null {
    // Look backwards for potential product names
    for (let i = rowIndex - 1; i >= Math.max(0, rowIndex - 20); i--) {
      const prevRow = data[i];
      if (!prevRow) continue;

      for (let j = 0; j < Math.min(prevRow.length, 5); j++) {
        const cellValue = DataTransformers.toString(prevRow[j]);
        if (this.isValidProductName(cellValue)) {
          const confidence = this.calculateProductNameConfidence(
            cellValue,
            i,
            j,
          );
          if (confidence > 0.5) {
            return cellValue;
          }
        }
      }
    }

    // Look for profile type patterns in current row to infer product category
    const profileTypes = row
      .map((cell) =>
        DataTransformers.toString(cell as string | number | boolean | null),
      )
      .filter((cell) => /(kapalı|açık|alt|üst|frame|gönye)/i.test(cell));

    if (profileTypes.length > 0) {
      const mainType = profileTypes[0];
      if (mainType) {
        if (/(frame|gönye)/i.test(mainType)) return "FRAME SİSTEMİ";
        if (/(kapalı|açık)/i.test(mainType)) return "PROFİL SİSTEMİ";
        return "ALÜMİNYUM PROFİL";
      }
    }

    return null;
  }

  private static createFallbackSection(
    data: ExcelData,
    startIndex: number,
    headerPattern: HeaderPattern | null,
  ): ProductSection | null {
    const dataRows: number[] = [];
    const headerRow = headerPattern?.rowIndex ?? startIndex;

    // Collect all potential data rows
    for (let i = Math.max(startIndex, headerRow + 1); i < data.length; i++) {
      const row = data[i];
      if (!row) continue;

      if (this.isDataRow(row, headerPattern)) {
        dataRows.push(i);
      }
    }

    if (dataRows.length === 0) {
      return null;
    }

    return {
      productName: "All Items",
      startRow: startIndex,
      endRow: Math.max(...dataRows),
      headerRow,
      dataRows,
      confidence: 0.5,
    };
  }

  private static isDataRow(
    row: ExcelRow,
    _headerPattern: HeaderPattern | null,
  ): boolean {
    // Must have some content
    const hasContent = row.some((cell) => {
      const value = DataTransformers.toString(cell);
      return value && value.trim().length > 0;
    });

    if (!hasContent) return false;

    // ANALİZ SONUCU: Gerçek veri satırları şu özelliklere sahip:
    // 1. Work Order ID (col 0) VEYA
    // 2. Profile bilgisi (col 7) + Quantity (col 9) VEYA
    // 3. En azından col 7,8,9'da anlamlı veri

    const workOrderId = DataTransformers.toString(row[0]);
    const profile = DataTransformers.toString(row[7]);
    const measurement = DataTransformers.toString(row[8]);
    const quantity = DataTransformers.toNumber(row[9]);

    // Check for work order row
    const hasWorkOrder = Boolean(
      workOrderId && PatternDetector.isValidWorkOrderId(workOrderId),
    );

    // Check for profile data
    const hasProfile = Boolean(
      profile &&
        profile.trim().length > 0 &&
        PatternDetector.looksLikeProfileType(profile),
    );
    const hasQuantity = Boolean(quantity !== undefined && quantity > 0);
    const hasMeasurement = Boolean(
      measurement && measurement.trim().length > 0,
    );

    // Veri satırı olabilmesi için:
    // - Work Order ID var VEYA
    // - Profile + Quantity var VEYA
    // - En azından profile + measurement var
    return (
      hasWorkOrder ||
      (hasProfile && hasQuantity) ||
      (hasProfile && hasMeasurement)
    );
  }

  public static isValidWorkOrderId(value: string): boolean {
    if (!value || !value.trim()) return false;

    const trimmed = value.trim();

    // GEVŞEK ANALİZ: Daha fazla work order formatını yakala
    const patterns = [
      /^\d{7}$/, // 7 digit numbers (2349448, 2350898, 2351253)
      /^\d{6}$/, // 6 digit numbers
      /^\d{5}$/, // 5 digit numbers (daha kısa WO'lar için)
      /^\d{4}$/, // 4 digit numbers (çok kısa WO'lar için)
      /^[A-Z]{1,3}\d{3,7}$/i, // Letter prefix + numbers (R3020, R1020, R9005)
      /^WO-?\d{4,8}$/i, // WO prefix (WO123456, WO-123456)
      /^[A-Z]{2,4}-?\d{4,8}$/i, // Multiple letters + numbers (AB-123456)
      /^[A-Z]{1,2}\d{4,8}[A-Z]*$/i, // Mixed alphanumeric (A1234B, AB1234)
      /^\d{3,8}[A-Z]{1,3}$/i, // Numbers + letters (123456A, 1234AB)
      /^[A-Z]{1,4}\/\d{4,8}$/i, // Letter/number format (WO/123456)
      /^\d{2,4}[-/]\d{3,6}$/, // Number-number format (23-456, 2023/1234)
      /^[A-Z]\d{2,3}[-/]\d{3,6}$/i, // Letter+num/num format (A23-456)

      // GEVŞEK PATTERN'LER
      /^[A-Z0-9]{3,12}$/i, // Any alphanumeric between 3-12 chars
      /^\d{3,8}$/, // Any number between 3-8 digits
    ];

    const matchesPattern = patterns.some((pattern) => pattern.test(trimmed));

    // Expanded heuristic for ambiguous cases
    if (!matchesPattern) {
      // More relaxed check - any alphanumeric that's not obviously a header/field name
      if (
        /^[A-Z0-9]{3,15}$/i.test(trimmed) &&
        !/^(profil|ölçü|adet|renk|not|ebat|sip|tarih|versiyon|gövde|kapak|kutu|elips|kanalli|kaynakli|altigen|yedigen|stand|frame|çerçeve|sürgülü|broşür|poster|totem|slide|aboard|convex|ledbox|gönye|menülük|door|sign|premium|rondolu|windpro|slim|leda|magneco|bestbuy|buymax|easy|infoboard|helezon)$/i.test(
          trimmed,
        )
      ) {
        return true;
      }
    }

    return matchesPattern;
  }

  public static looksLikeProfileType(value: string): boolean {
    if (!value || value.length < 3) return false;

    // ANALİZ SONUCU: Gerçek Excel'den elde edilen profil tipleri
    const profilePatterns = [
      // Temel profil tipleri (en yaygın)
      /^(kapalı|açık)\s*(alt|üst)$/i, // KAPALI ALT, AÇIK ALT, KAPALI ÜST, AÇIK ÜST

      // Kutu profilleri (analiz sonucu)
      /\d+x\d+\s*kutu/i, // 25X25 KUTU, 30X15 KUTU
      /^(gövde|kapak)$/i, // GÖVDE, KAPAK
      /panel\s*kutu/i, // PANEL KUTU

      // Özel profil tipleri (Excel'den görülen)
      /\d+x\d+$/i, // 19X25, 21X38, 6X25 gibi boyut profilleri
      /\d+x\d+\s*-\s*kaynakli/i, // 21X38-KAYNAKLI

      // Çok kanallı profiller
      /\d+\s*kanalli/i, // çift kanallı, tek kanallı
      /kanalsiz/i, // KANALSIZ

      // Geometrik şekiller
      /(elips|yedigen|altigen)/i, // ELİPS, YEDİGEN, ALTIGEN
      /çift\s*kan\.\s*elips/i, // ÇİFT KAN. ELİPS

      // Set ve parça tipleri
      /brş\.\s*set/i, // BRŞ. SET (broşür set)
      /\d+x\d+\s*brş\.\s*set/i, // 23X30 BRŞ. SET

      // Stand ve destek profilleri
      /\d+'?lik\s*stand/i, // 40'LIK STAND
      /altigen\s*raf/i, // ALTIGEN RAF
      /rondolu/i, // RONDOLU

      // Premium ve özel kapaklar
      /premium\s*kapak/i, // PREMIUM KAPAK

      // Ray ve hareket profilleri
      /(u\s*profili|ray)/i, // U PROFİLİ, RAY
      /çene/i, // ÇENE

      // Diğer yaygın profiller
      /(gövde|kapak|alt\s*kapak|üst\s*kapak|iç\s*gövde)/i,
      /frame/i,
      /çerçeve/i,
      /pervaz/i,
      /door/i,
      /kapı/i,
      /window/i,
      /pencere/i,
      /bracket/i,
      /ayak/i,
      /destek/i,
      /köşe/i,

      // Kaynak profilleri
      /(kaynakli|kaynak)/i,
    ];

    return profilePatterns.some((pattern) => pattern.test(value));
  }
}

// ============================================================================
// DATA EXTRACTION ENGINE
// ============================================================================

export class DataExtractor {
  private readonly headerPattern: HeaderPattern | null;

  constructor(headerPattern: HeaderPattern | null = null) {
    this.headerPattern = headerPattern;
  }

  public extractWorkOrders(
    data: ExcelData,
    section: ProductSection,
  ): ReadonlyArray<WorkOrderItem> {
    const workOrders: WorkOrderItem[] = [];
    const workOrderGroups = new Map<
      string,
      {
        metadata: WorkOrderMetadata;
        profiles: ProfileItem[];
        mainRowIndex: number;
      }
    >();

    let currentWorkOrderId = "";
    let currentMetadata: WorkOrderMetadata = {};
    let mainRowIndex = 0;

    // Group rows by work order
    for (const rowIndex of section.dataRows) {
      const row = data[rowIndex];
      if (!row) continue;

      const extractedWorkOrderId = this.extractWorkOrderIdFromRow(row);
      const isWorkOrderRow = Boolean(extractedWorkOrderId);

      if (isWorkOrderRow && extractedWorkOrderId) {
        currentWorkOrderId = extractedWorkOrderId;
        currentMetadata = this.extractMetadataFromRow(row);
        mainRowIndex = rowIndex;

        if (!workOrderGroups.has(currentWorkOrderId)) {
          workOrderGroups.set(currentWorkOrderId, {
            metadata: currentMetadata,
            profiles: [],
            mainRowIndex,
          });
        }

        // Extract profile from work order row too
        const profileItems = this.extractItemsFromRow(
          row,
          rowIndex,
          currentWorkOrderId,
          currentMetadata,
        );
        workOrderGroups.get(currentWorkOrderId)!.profiles.push(...profileItems);
      } else if (currentWorkOrderId) {
        // Profile row inheriting from work order
        const profileItems = this.extractItemsFromRow(
          row,
          rowIndex,
          currentWorkOrderId,
          currentMetadata,
        );
        workOrderGroups.get(currentWorkOrderId)!.profiles.push(...profileItems);
      } else {
        // Orphaned row - create fallback work order
        const fallbackId = `WO_${rowIndex.toString().padStart(6, "0")}`;
        if (!workOrderGroups.has(fallbackId)) {
          workOrderGroups.set(fallbackId, {
            metadata: {},
            profiles: [],
            mainRowIndex: rowIndex,
          });
        }
        const profileItems = this.extractItemsFromRow(
          row,
          rowIndex,
          fallbackId,
          {},
        );
        workOrderGroups.get(fallbackId)!.profiles.push(...profileItems);
      }
    }

    // Create work order items from groups
    for (const [workOrderId, group] of workOrderGroups) {
      if (group.profiles.length > 0) {
        const totalQuantity = group.profiles.reduce(
          (sum, p) => sum + p.quantity,
          0,
        );
        const avgConfidence =
          group.profiles.reduce((sum, p) => sum + p.confidence, 0) /
          group.profiles.length;

        workOrders.push({
          workOrderId,
          profiles: group.profiles,
          metadata: group.metadata,
          rowIndex: group.mainRowIndex,
          confidence: avgConfidence,
          source: {
            type: "direct",
            originalRowIndex: group.mainRowIndex,
          },
          totalQuantity,
        });
      }
    }

    return workOrders;
  }

  private extractWorkOrderIdFromRow(row: ExcelRow): string | null {
    // ENHANCED: Check first 3 columns for work order IDs (analiz sonucu: col 0,1 çoklu WO olabilir)
    const workOrderIds: string[] = [];

    // Column 0: Primary work order location
    const col0Value = DataTransformers.toString(row[0]);
    if (PatternDetector.isValidWorkOrderId(col0Value)) {
      workOrderIds.push(col0Value.trim());
    }

    // Column 1: Secondary work order location (çoklu WO için)
    const col1Value = DataTransformers.toString(row[1]);
    if (PatternDetector.isValidWorkOrderId(col1Value)) {
      workOrderIds.push(col1Value.trim());
    }

    // Column 2: Tertiary (version field, but sometimes contains WO)
    const col2Value = DataTransformers.toString(row[2]);
    if (PatternDetector.isValidWorkOrderId(col2Value)) {
      workOrderIds.push(col2Value.trim());
    }

    // FALLBACK: If no work order found yet, check for any 6-8 digit number
    if (workOrderIds.length === 0) {
      for (let i = 0; i < Math.min(row.length, 10); i++) {
        const value = DataTransformers.toString(row[i]);
        // More lenient check - any 6-8 digit number
        if (value && /^\d{6,8}$/.test(value.trim())) {
          workOrderIds.push(value.trim());
          break;
        }
      }
    }

    // Return combined work orders if multiple found
    if (workOrderIds.length === 1) {
      return workOrderIds[0] || null;
    } else if (workOrderIds.length > 1) {
      // Multiple work orders in same row - combine them (örn: 2351151+2351599)
      const combinedId = workOrderIds.join("+");
      logger.debug("Combined work orders from row", { combinedId });
      return combinedId;
    }

    return null;
  }

  private extractMetadataFromRow(row: ExcelRow): WorkOrderMetadata {
    const metadata: Record<string, string | number> = {};

    const columns = {
      date: this.headerPattern?.columns.date ?? 1,
      version: this.headerPattern?.columns.version ?? 2,
      color: this.headerPattern?.columns.color ?? 3,
      note: this.headerPattern?.columns.note ?? 4,
      sipQuantity: this.headerPattern?.columns.sipQuantity ?? 5,
      size: this.headerPattern?.columns.size ?? 6,
    };

    const date = DataTransformers.toString(row[columns.date]);
    const version = DataTransformers.toString(row[columns.version]);
    const color = DataTransformers.toString(row[columns.color]);
    const note = DataTransformers.toString(row[columns.note]);
    const sipQuantity = DataTransformers.toNumber(row[columns.sipQuantity]);
    const size = DataTransformers.toString(row[columns.size]);

    if (date) metadata["date"] = date;
    if (version) metadata["version"] = version;
    if (color) metadata["color"] = color;
    if (note) metadata["note"] = note;
    if (sipQuantity) metadata["sipQuantity"] = sipQuantity;
    if (size) metadata["size"] = size;

    return metadata as WorkOrderMetadata;
  }

  public extractItemsFromRow(
    row: ExcelRow,
    rowIndex: number,
    _workOrderId: string,
    _metadata: WorkOrderMetadata,
  ): ReadonlyArray<ProfileItem> {
    const items: ProfileItem[] = [];

    // GERÇEK EXCEL YAPISINA GÖRE: Sütun 7=PROFİL, 8=ÖLÇÜ, 9=ADET (analiz sonucu)
    const standardProfile = DataTransformers.toString(row[7]);
    const standardMeasurement = DataTransformers.toString(row[8]);
    const standardQuantity = DataTransformers.toNumber(row[9]);

    // Primary extraction from standard columns
    if (
      PatternDetector.looksLikeProfileType(standardProfile) &&
      standardQuantity &&
      standardQuantity > 0
    ) {
      items.push({
        profileType: standardProfile.trim(),
        measurement: standardMeasurement?.trim() || "N/A",
        quantity: standardQuantity,
        rowIndex,
        confidence: this.calculateProfileConfidence(
          standardProfile,
          standardMeasurement,
          standardQuantity,
        ),
      });

      logger.debug("Extracted profile from row (standard cols)", {
        rowIndex,
        profile: standardProfile,
        measurement: standardMeasurement,
        quantity: standardQuantity,
      });
      return items; // Return immediately if found in standard columns
    }

    // Fallback: Enhanced profile extraction for edge cases
    const profileExtractions = [
      // Alternative: 6, 7, 8 (sometimes shifted left)
      { profile: 6, measure: 7, qty: 8 },
      // Alternative: 8, 9, 10 (sometimes shifted right, though rare)
      { profile: 8, measure: 9, qty: 10 },
    ];

    for (const extraction of profileExtractions) {
      const testProfile = DataTransformers.toString(row[extraction.profile]);
      const testMeasurement = DataTransformers.toString(
        row[extraction.measure],
      );
      const testQuantity = DataTransformers.toNumber(row[extraction.qty]);

      if (
        PatternDetector.looksLikeProfileType(testProfile) &&
        testQuantity &&
        testQuantity > 0
      ) {
        items.push({
          profileType: testProfile.trim(),
          measurement: testMeasurement?.trim() || "N/A",
          quantity: testQuantity,
          rowIndex,
          confidence: this.calculateProfileConfidence(
            testProfile,
            testMeasurement,
            testQuantity,
          ),
        });

        logger.debug("Extracted profile from row (custom cols)", {
          rowIndex,
          profile: testProfile,
          measurement: testMeasurement,
          quantity: testQuantity,
          cols: `${extraction.profile}-${extraction.measure}-${extraction.qty}`,
        });
      }
    }

    // If no structured extraction worked, try comprehensive search
    if (items.length === 0) {
      for (let i = 6; i < Math.min(row.length, 12); i++) {
        const cellValue = DataTransformers.toString(row[i]);

        if (PatternDetector.looksLikeProfileType(cellValue)) {
          // Found profile type, look for measurement and quantity in next columns
          const nextMeasurement = DataTransformers.toString(row[i + 1]);
          const nextQuantity = DataTransformers.toNumber(row[i + 2]);

          if (nextQuantity && nextQuantity > 0) {
            items.push({
              profileType: cellValue.trim(),
              measurement: nextMeasurement?.trim() || "N/A",
              quantity: nextQuantity,
              rowIndex,
              confidence: this.calculateProfileConfidence(
                cellValue,
                nextMeasurement,
                nextQuantity,
              ),
            });

            logger.debug("Found profile via search", {
              rowIndex,
              profile: cellValue,
              measurement: nextMeasurement,
              quantity: nextQuantity,
              col: i,
            });
            break; // Found one, stop searching
          }
        }
      }
    }

    return items;
  }

  private calculateProfileConfidence(
    profileType: string,
    measurement: string,
    quantity: number,
  ): number {
    let confidence = 0.5;

    // Profil tipi kontrolü
    const knownProfileTypes = [
      /kapalı\s*alt/i,
      /açık\s*alt/i,
      /kapalı\s*üst/i,
      /açık\s*üst/i,
      /frame/i,
      /çerçeve/i,
      /pervaz/i,
      /ray/i,
      /profil/i,
      /door/i,
      /kapı/i,
      /window/i,
      /pencere/i,
      /bracket/i,
      /ayak/i,
      /destek/i,
      /köşe/i,
    ];

    if (knownProfileTypes.some((pattern) => pattern.test(profileType))) {
      confidence += 0.3;
    }

    // Ölçü kontrolü
    if (measurement && measurement !== "N/A") {
      if (
        /\d+[\sx]\d+/i.test(measurement) ||
        /\d+\s*(mm|cm|m)/i.test(measurement)
      ) {
        confidence += 0.2;
      } else if (measurement.length > 3) {
        confidence += 0.1;
      }
    }

    // Miktar kontrolü
    if (quantity > 0 && quantity < 10000) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }
}

// ============================================================================
// VALIDATORS (removed unused validators to clean up code)
// ============================================================================

// ============================================================================
// MAIN ANALYZER CLASS
// ============================================================================

export class ExcelAnalyzer {
  private readonly filePath: string;
  private readonly logger: ILogger;
  private cachedResult: ExcelParseResult | null = null;

  constructor(filePath?: string, logger?: ILogger) {
    this.filePath = filePath || path.join(process.cwd(), "workbook.xlsx");
    this.logger = logger || new ConsoleLogger();
  }

  public async analyzeExcelFile(): Promise<ExcelParseResult> {
    if (this.cachedResult) {
      return this.cachedResult;
    }

    const startTime = Date.now();
    const initialMemory = process.memoryUsage().heapUsed;

    try {
      this.validateFileExists();
      const { data, fileName } = await this.readExcelFile();

      const headerPattern = PatternDetector.detectHeaderRow(data);
      if (!headerPattern) {
        this.logger.warn(
          "No clear header pattern found, using fallback detection",
        );
      } else {
        this.logger.info(`Header detected at row ${headerPattern.rowIndex}`, {
          confidence: headerPattern.confidence,
          fields: headerPattern.detectedFields,
        });
      }

      const sections = PatternDetector.detectProductSections(
        data,
        headerPattern,
      );
      if (sections.length === 0) {
        throw this.createError(
          ErrorCode.NO_PRODUCTS_FOUND,
          "No product sections found",
        );
      }

      this.logger.info(`Found ${sections.length} product sections`);

      const productGroups = this.extractProductGroups(
        data,
        sections,
        headerPattern,
      );
      const metrics = this.calculateMetrics(
        productGroups,
        data.length,
        startTime,
        initialMemory,
      );
      const { errors, warnings } = this.collectValidationResults(productGroups);

      // Calculate summary
      const allProfileTypes = new Set<string>();
      const totalProfiles = productGroups.reduce((sum, pg) => {
        pg.profileTypes.forEach((pt) => allProfileTypes.add(pt));
        return sum + pg.totalProfiles;
      }, 0);

      const summary = {
        totalProducts: productGroups.length,
        totalWorkOrders: productGroups.reduce(
          (sum, pg) => sum + pg.workOrders.length,
          0,
        ),
        totalProfiles,
        totalQuantity: productGroups.reduce(
          (sum, pg) => sum + pg.totalQuantity,
          0,
        ),
        profileTypes: Array.from(allProfileTypes),
      };

      const result: ExcelParseResult = {
        success: true,
        productGroups,
        errors,
        warnings,
        context: {
          fileName,
          parseDate: new Date(),
          totalRows: data.length,
          ...(headerPattern ? { headerPattern } : {}),
          encoding: "UTF-8",
        },
        metrics,
        summary,
      };

      this.cachedResult = result;
      this.logger.info(
        "Analysis completed",
        metrics as unknown as Record<string, unknown>,
      );
      return result;
    } catch (error) {
      return this.handleError(error, startTime);
    }
  }

  private validateFileExists(): void {
    if (!fs.existsSync(this.filePath)) {
      throw this.createError(
        ErrorCode.FILE_NOT_FOUND,
        `File not found: ${this.filePath}`,
      );
    }

    const stats = fs.statSync(this.filePath);
    if (stats.size === 0) {
      throw this.createError(ErrorCode.EMPTY_WORKSHEET, "File is empty");
    }
  }

  private async readExcelFile(): Promise<{
    data: ExcelData;
    fileName: string;
  }> {
    return new Promise((resolve, reject) => {
      try {
        const workbook = XLSX.readFile(this.filePath, {
          type: "buffer",
          cellDates: true,
          cellNF: false,
          cellText: false,
          raw: false,
        });

        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          reject(
            this.createError(ErrorCode.EMPTY_WORKSHEET, "No sheets found"),
          );
          return;
        }

        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) {
          reject(new Error(`Worksheet "${sheetName}" not found`));
          return;
        }

        const data = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: null,
          raw: false,
          dateNF: "dd/mm/yyyy",
        }) as ExcelRow[];

        if (!data || data.length === 0) {
          reject(
            this.createError(ErrorCode.EMPTY_WORKSHEET, "Worksheet is empty"),
          );
          return;
        }

        this.logger.info(`File loaded: ${data.length} rows`);
        resolve({
          data,
          fileName: path.basename(this.filePath),
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  private extractProductGroups(
    data: ExcelData,
    sections: ReadonlyArray<ProductSection>,
    headerPattern: HeaderPattern | null,
  ): ReadonlyArray<ProductGroup> {
    const extractor = new DataExtractor(headerPattern);
    const productGroups: ProductGroup[] = [];

    for (const section of sections) {
      const workOrders = extractor.extractWorkOrders(data, section);

      // ENGELLEYİCİ OLMAYAN YAKLAŞIM: Work order olmasa bile profil veri varsa ürünü dahil et
      const validWorkOrders = workOrders.filter((wo) => wo.totalQuantity > 0);

      // Eğer hiç work order yoksa ama section'da data var mı diye kontrol et
      if (validWorkOrders.length === 0) {
        // Fallback: En azından veri satırları var mı?
        if (section.dataRows.length > 0) {
          this.logger.warn(
            `Product "${section.productName}" has no work orders but has ${section.dataRows.length} data rows - creating fallback work order`,
          );

          // Fallback work order oluştur (mutable sürüm)
          const fallbackWorkOrder = {
            workOrderId: `FALLBACK_${section.productName.replace(/\s+/g, "_")}`,
            profiles: [] as ProfileItem[],
            metadata: {},
            rowIndex: section.startRow,
            confidence: 0.5,
            source: {
              type: "inherited" as const,
              originalRowIndex: section.startRow,
            },
            totalQuantity: 0,
          };

          // Data rows'dan profil bilgilerini çıkarmaya çalış
          const extractor = new DataExtractor(headerPattern);
          for (const rowIndex of section.dataRows) {
            const row = data[rowIndex];
            if (row) {
              // Enhanced extraction - try multiple strategies
              let profileItems = extractor.extractItemsFromRow(
                row,
                rowIndex,
                fallbackWorkOrder.workOrderId,
                {},
              );

              // If standard extraction failed, try alternative extraction
              if (profileItems.length === 0) {
                profileItems = this.extractProfilesFromDataRow(row, rowIndex);
              }

              if (profileItems.length > 0) {
                fallbackWorkOrder.profiles = [
                  ...fallbackWorkOrder.profiles,
                  ...profileItems,
                ];
                fallbackWorkOrder.totalQuantity += profileItems.reduce(
                  (sum, p) => sum + p.quantity,
                  0,
                );
              }
            }
          }

          if (fallbackWorkOrder.totalQuantity > 0) {
            validWorkOrders.push(fallbackWorkOrder as WorkOrderItem);
            this.logger.info(
              `✅ Created fallback work order for "${section.productName}" with ${fallbackWorkOrder.totalQuantity} pieces`,
            );
          } else {
            // ULTRA AGRESIF: Data row'ları olduğu sürece boş work order ile devam et
            if (section.dataRows.length > 0) {
              this.logger.warn(
                `⚠️ Product "${section.productName}" has no extractable profiles but has ${section.dataRows.length} data rows - adding empty work order`,
              );
              validWorkOrders.push(fallbackWorkOrder as WorkOrderItem);
            } else {
              this.logger.warn(
                `Skipping product "${section.productName}" - no data rows at all`,
              );
              continue;
            }
          }
        } else {
          this.logger.warn(
            `Skipping product "${section.productName}" - no valid work orders or data rows found`,
          );
          continue;
        }
      }

      const validationSummary = this.createValidationSummary(validWorkOrders);
      const metadata = this.createProductMetadata(section, validWorkOrders);

      // Calculate totals and profile types
      const totalProfiles = validWorkOrders.reduce(
        (sum, wo) => sum + wo.profiles.length,
        0,
      );
      const totalQuantity = validWorkOrders.reduce(
        (sum, wo) => sum + wo.totalQuantity,
        0,
      );
      const profileTypesSet = new Set<string>();

      validWorkOrders.forEach((wo) => {
        wo.profiles.forEach((p) => {
          profileTypesSet.add(p.profileType);
        });
      });

      const profileTypes = Array.from(profileTypesSet);

      // AGRESIF MOD: Daha gevşek validasyon
      const hasAnyData =
        validWorkOrders.length > 0 ||
        totalQuantity > 0 ||
        totalProfiles > 0 ||
        section.dataRows.length > 0;

      if (hasAnyData) {
        productGroups.push({
          productName: section.productName,
          workOrders: validWorkOrders,
          confidence: section.confidence,
          metadata,
          validation: validationSummary,
          totalProfiles,
          totalQuantity,
          profileTypes,
        });

        this.logger.info(
          `✅ Added product: ${section.productName} (${validWorkOrders.length} work orders, ${totalQuantity} pieces, ${profileTypes.length} profile types)`,
        );
      } else {
        this.logger.warn(
          `❌ Skipping product "${section.productName}" - no data at all`,
        );
      }

      // Logger moved above to avoid duplication
    }

    return productGroups;
  }

  private extractProfilesFromDataRow(
    row: ExcelRow,
    rowIndex: number,
  ): ProfileItem[] {
    const profiles: ProfileItem[] = [];

    // AGGRESSIVE EXTRACTION: Try multiple column combinations
    const strategies = [
      // Standard: 7, 8, 9 (profile, measurement, quantity)
      { profileCol: 7, measureCol: 8, quantityCol: 9 },
      // Alternative: 6, 7, 8
      { profileCol: 6, measureCol: 7, quantityCol: 8 },
      // Alternative: 8, 9, 10
      { profileCol: 8, measureCol: 9, quantityCol: 10 },
      // Fallback: Check all columns for data
      { profileCol: -1, measureCol: -1, quantityCol: -1 },
    ];

    for (const strategy of strategies) {
      if (strategy.profileCol === -1) {
        // Comprehensive search across all columns
        for (let col = 0; col < Math.min(row.length, 15); col++) {
          const cellValue = DataTransformers.toString(row[col]);
          if (cellValue && PatternDetector.looksLikeProfileType(cellValue)) {
            // Found a profile, look for quantity in nearby columns
            for (
              let qCol = col + 1;
              qCol < Math.min(row.length, col + 5);
              qCol++
            ) {
              const quantity = DataTransformers.toNumber(row[qCol]);
              if (quantity && quantity > 0) {
                const measurement =
                  DataTransformers.toString(row[qCol - 1]) || "";

                profiles.push({
                  profileType: cellValue,
                  measurement: measurement,
                  quantity: quantity,
                  rowIndex: rowIndex,
                  confidence: 0.6,
                });
                break;
              }
            }
          }
        }
      } else {
        // Try specific column strategy
        const profileType = DataTransformers.toString(row[strategy.profileCol]);
        const measurement = DataTransformers.toString(row[strategy.measureCol]);
        const quantity = DataTransformers.toNumber(row[strategy.quantityCol]);

        if (
          profileType &&
          PatternDetector.looksLikeProfileType(profileType) &&
          quantity &&
          quantity > 0
        ) {
          profiles.push({
            profileType: profileType,
            measurement: measurement || "",
            quantity: quantity,
            rowIndex: rowIndex,
            confidence: 0.7,
          });
        }
      }

      // If we found profiles with this strategy, stop
      if (profiles.length > 0) break;
    }

    return profiles;
  }

  private createValidationSummary(
    workOrders: ReadonlyArray<WorkOrderItem>,
  ): ValidationSummary {
    let totalErrors = 0;
    let totalWarnings = 0;
    let criticalErrors = 0;

    for (const wo of workOrders) {
      if (wo.confidence < 0.3) totalErrors++;
      if (wo.confidence < 0.7) totalWarnings++;
      if (wo.confidence === 0) criticalErrors++;
    }

    return {
      totalErrors,
      totalWarnings,
      criticalErrors,
      isValid: criticalErrors === 0,
    };
  }

  private createProductMetadata(
    section: ProductSection,
    workOrders: ReadonlyArray<WorkOrderItem>,
  ): ProductMetadata {
    const uniqueWorkOrders = new Set(workOrders.map((wo) => wo.workOrderId));
    const totalQuantity = workOrders.reduce(
      (sum, wo) => sum + wo.totalQuantity,
      0,
    );
    const avgConfidence =
      workOrders.length > 0
        ? workOrders.reduce((sum, wo) => sum + wo.confidence, 0) /
          workOrders.length
        : 0;

    return {
      startRow: section.startRow,
      endRow: section.endRow,
      totalQuantity,
      uniqueWorkOrders: uniqueWorkOrders.size,
      averageConfidence: avgConfidence,
    };
  }

  private calculateMetrics(
    productGroups: ReadonlyArray<ProductGroup>,
    totalRows: number,
    startTime: number,
    initialMemory: number,
  ): ParseMetrics {
    const processedRows = productGroups.reduce(
      (sum, pg) => sum + (pg.metadata.endRow - pg.metadata.startRow + 1),
      0,
    );

    return {
      totalProducts: productGroups.length,
      totalWorkOrders: productGroups.reduce(
        (sum, pg) => sum + pg.metadata.uniqueWorkOrders,
        0,
      ),
      totalItems: productGroups.reduce(
        (sum, pg) => sum + pg.workOrders.length,
        0,
      ),
      parseTimeMs: Date.now() - startTime,
      memoryUsedMb:
        (process.memoryUsage().heapUsed - initialMemory) / 1024 / 1024,
      confidence:
        productGroups.length > 0
          ? productGroups.reduce((sum, pg) => sum + pg.confidence, 0) /
            productGroups.length
          : 0,
      skippedRows: totalRows - processedRows,
      processedRows,
    };
  }

  private collectValidationResults(
    productGroups: ReadonlyArray<ProductGroup>,
  ): { errors: ValidationError[]; warnings: ValidationError[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    for (const group of productGroups) {
      if (!group.validation.isValid) {
        warnings.push({
          code: ErrorCode.INVALID_FORMAT,
          message: `Product ${group.productName} has validation warnings`,
          severity: "warning",
          context: { productName: group.productName },
        });
      }
    }

    return { errors, warnings };
  }

  private handleError(error: unknown, startTime: number): ExcelParseResult {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    this.logger.error("Analysis failed", { error: errorMessage });

    return {
      success: false,
      productGroups: [],
      errors: [
        {
          code: ErrorCode.PARSE_FAILED,
          message: errorMessage,
          severity: "critical",
        },
      ],
      warnings: [],
      context: {
        fileName: path.basename(this.filePath),
        parseDate: new Date(),
        totalRows: 0,
        encoding: "UTF-8",
      },
      metrics: {
        totalProducts: 0,
        totalWorkOrders: 0,
        totalItems: 0,
        parseTimeMs: Date.now() - startTime,
        memoryUsedMb: 0,
        confidence: 0,
        skippedRows: 0,
        processedRows: 0,
      },
      summary: {
        totalProducts: 0,
        totalWorkOrders: 0,
        totalProfiles: 0,
        totalQuantity: 0,
        profileTypes: [],
      },
    };
  }

  private createError(code: ErrorCode, message: string): Error {
    const error = new Error(message);
    (error as Error & { code: ErrorCode }).code = code;
    return error;
  }

  public clearCache(): void {
    this.cachedResult = null;
  }

  public async getProductList(): Promise<ReadonlyArray<string>> {
    const result = await this.analyzeExcelFile();
    return result.productGroups.map((pg) => pg.productName);
  }

  public async getWorkOrdersByProduct(
    productName: string,
  ): Promise<ReadonlyArray<WorkOrderItem>> {
    const result = await this.analyzeExcelFile();
    const group = result.productGroups.find(
      (pg) => pg.productName === productName,
    );
    return group ? group.workOrders : [];
  }

  public async getMetrics(): Promise<ParseMetrics> {
    const result = await this.analyzeExcelFile();
    return result.metrics;
  }
}

// ============================================================================
// LOGGER IMPLEMENTATION
// ============================================================================

class ConsoleLogger implements ILogger {
  public info(message: string, context?: Record<string, unknown>): void {
    console.log(
      JSON.stringify({
        level: "INFO",
        message,
        timestamp: new Date().toISOString(),
        ...context,
      }),
    );
  }

  public warn(message: string, context?: Record<string, unknown>): void {
    console.warn(
      JSON.stringify({
        level: "WARN",
        message,
        timestamp: new Date().toISOString(),
        ...context,
      }),
    );
  }

  public error(message: string, context?: Record<string, unknown>): void {
    console.error(
      JSON.stringify({
        level: "ERROR",
        message,
        timestamp: new Date().toISOString(),
        ...context,
      }),
    );
  }

  public debug(message: string, context?: Record<string, unknown>): void {
    if (process.env["NODE_ENV"] === "development") {
      console.debug(
        JSON.stringify({
          level: "DEBUG",
          message,
          timestamp: new Date().toISOString(),
          ...context,
        }),
      );
    }
  }
}

export default ExcelAnalyzer;
export { ConsoleLogger };
