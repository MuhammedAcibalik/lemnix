/**
 * @fileoverview Excel Parser Service for Production Plans
 * @module services/excelParserService
 * @version 1.0.0
 */

import * as XLSX from "xlsx";
import { ProductionPlanItem, Prisma } from "@prisma/client";

export interface ExcelParseResult {
  success: boolean;
  data?: ProductionPlanItem[];
  errors?: string[];
  summary?: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    weekNumber: number;
    year: number;
  };
}

export interface ExcelValidationError {
  row: number;
  column: string;
  value: unknown;
  message: string;
}

export class ExcelParserService {
  private readonly REQUIRED_COLUMNS = [
    "Hafta",
    "Ad",
    "Sprş.veren",
    "Mştr.no.",
    "Mştr.klm.",
    "Sipariş",
    "Malzeme no.",
    "Malzeme kısa metni",
    "Miktar",
    "Sprş.ÖB",
    "Plnl.bitiş",
    "Bölüm",
    "Öncelik",
  ];

  private readonly COLUMN_MAPPING = {
    Hafta: "weekNumber",
    Ad: "ad",
    "Sprş.veren": "siparisVeren",
    "Mştr.no.": "musteriNo",
    "Mştr.klm.": "musteriKalemi",
    Sipariş: "siparis",
    "Malzeme no.": "malzemeNo",
    "Malzeme kısa metni": "malzemeKisaMetni",
    Miktar: "miktar",
    "Sprş.ÖB": "planlananBitisTarihi",
    "Plnl.bitiş": "planlananBitisTarihi",
    Bölüm: "bolum",
    Öncelik: "oncelik",
  } as const;

  /**
   * Parse Excel file and convert to ProductionPlanItem array
   */
  public async parseProductionPlanExcel(
    fileBuffer: Buffer,
    planId: string,
  ): Promise<ExcelParseResult> {
    try {
      // Read Excel file
      const workbook = XLSX.read(fileBuffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];

      if (!sheetName) {
        return {
          success: false,
          errors: ["Excel dosyasında sayfa bulunamadı"],
        };
      }

      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: "",
        raw: false,
      });

      if (jsonData.length < 2) {
        return {
          success: false,
          errors: ["Excel dosyası boş veya geçersiz"],
        };
      }

      // Get headers (first row)
      const headers = jsonData[0] as string[];
      const validationResult = this.validateHeaders(headers);

      if (!validationResult.isValid) {
        return {
          success: false,
          errors: validationResult.errors,
        };
      }

      // Parse data rows
      const dataRows = jsonData.slice(1) as unknown[][];
      const parseResult = this.parseDataRows(dataRows, planId, headers);

      return {
        success: true,
        data: parseResult.validItems,
        errors: parseResult.errors,
        summary: {
          totalRows: dataRows.length,
          validRows: parseResult.validItems.length,
          invalidRows: parseResult.errors.length,
          weekNumber: parseResult.weekNumber,
          year: parseResult.year,
        },
      };
    } catch (error) {
      return {
        success: false,
        errors: [
          `Excel dosyası işlenirken hata oluştu: ${error instanceof Error ? error.message : "Bilinmeyen hata"}`,
        ],
      };
    }
  }

  /**
   * Validate Excel headers
   */
  private validateHeaders(headers: string[]): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const missingColumns: string[] = [];

    // Normalize headers (trim whitespace, remove special characters)
    const normalizedHeaders = headers.map((h) =>
      h.trim().replace(/[\r\n\t]/g, ""),
    );

    for (const requiredColumn of this.REQUIRED_COLUMNS) {
      const found = normalizedHeaders.some(
        (header) =>
          header.toLowerCase() === requiredColumn.toLowerCase() ||
          header.replace(/\s+/g, "") === requiredColumn.replace(/\s+/g, ""),
      );

      if (!found) {
        missingColumns.push(requiredColumn);
      }
    }

    if (missingColumns.length > 0) {
      errors.push(`Eksik sütunlar: ${missingColumns.join(", ")}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Parse data rows and convert to ProductionPlanItem
   */
  private parseDataRows(
    dataRows: unknown[][],
    planId: string,
    headers: string[],
  ): {
    validItems: ProductionPlanItem[];
    errors: string[];
    weekNumber: number;
    year: number;
  } {
    const validItems: ProductionPlanItem[] = [];
    const errors: string[] = [];
    let weekNumber = 0;
    const year = new Date().getFullYear();

    // Headers and data rows loaded successfully

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowNumber = i + 2; // +2 because we skip header row and arrays are 0-indexed

      try {
        // Skip empty rows
        if (this.isEmptyRow(row)) {
          continue;
        }

        // Create row data object with normalized headers
        const rowData: Record<string, unknown> = {};
        headers.forEach((header, index) => {
          const normalizedHeader = header.trim().replace(/[\r\n\t]/g, "");
          rowData[normalizedHeader] = row[index] || "";
        });

        // Row data processed successfully

        // Extract week number from first valid row
        const weekValue = this.findColumnValue(rowData, [
          "Hafta",
          "HAFTA",
          "hafta",
        ]);
        if (weekNumber === 0 && weekValue) {
          const week = this.parseNumber(weekValue);
          if (week > 0 && week <= 53) {
            weekNumber = week;
          }
        }

        // Parse and validate row
        const parsedItem = this.parseRow(rowData, planId, rowNumber);

        if (parsedItem.success) {
          validItems.push(parsedItem.data!);
        } else {
          errors.push(
            ...parsedItem.errors!.map((err) => `Satır ${rowNumber}: ${err}`),
          );
        }
      } catch (error) {
        errors.push(
          `Satır ${rowNumber}: ${error instanceof Error ? error.message : "Bilinmeyen hata"}`,
        );
      }
    }

    return {
      validItems,
      errors,
      weekNumber,
      year,
    };
  }

  /**
   * Parse single row data
   */
  private parseRow(
    rowData: Record<string, unknown>,
    planId: string,
    rowNumber: number,
  ): { success: boolean; data?: ProductionPlanItem; errors?: string[] } {
    const errors: string[] = [];

    // Validate required fields with flexible matching
    const requiredFields = [
      { names: ["Ad", "AD", "ad"], label: "Ad" },
      { names: ["Sipariş", "SİPARİŞ", "sipariş"], label: "Sipariş" },
      {
        names: [
          "Malzeme kısa metni",
          "MALZEME KISA METNİ",
          "malzeme kısa metni",
        ],
        label: "Malzeme kısa metni",
      },
      { names: ["Miktar", "MİKTAR", "miktar"], label: "Miktar" },
      { names: ["Bölüm", "BÖLÜM", "bölüm"], label: "Bölüm" },
      { names: ["Öncelik", "ÖNCELİK", "öncelik"], label: "Öncelik" },
    ];

    for (const field of requiredFields) {
      const value = this.findColumnValue(rowData, field.names);
      if (!value || String(value).trim() === "") {
        errors.push(`${field.label} alanı boş olamaz`);
      }
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    try {
      // Parse date - try multiple date columns (PRIORITIZE Plnl.bitiş)
      const dateStr1 = String(
        this.findColumnValue(rowData, [
          "Plnl.bitiş",
          "PLNL.BİTİŞ",
          "plnl.bitiş",
        ]) || "",
      ).trim();
      const dateStr2 = String(
        this.findColumnValue(rowData, ["Sprş.ÖB", "SPRŞ.ÖB", "sprş.öb"]) || "",
      ).trim();
      const dateStr = dateStr1 || dateStr2;

      const planlananBitisTarihi = this.parseDate(dateStr);

      if (!planlananBitisTarihi) {
        errors.push(`Geçersiz tarih formatı: "${dateStr}"`);
        return { success: false, errors };
      }

      // Parse priority
      const oncelik = this.parsePriority(
        String(
          this.findColumnValue(rowData, ["Öncelik", "ÖNCELİK", "öncelik"]) ||
            "",
        ).trim(),
      );

      // Parse quantity
      const miktar = this.parseNumber(
        this.findColumnValue(rowData, ["Miktar", "MİKTAR", "miktar"]),
      );
      if (miktar <= 0) {
        errors.push("Miktar 0'dan büyük olmalıdır");
        return { success: false, errors };
      }

      const item: ProductionPlanItem = {
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate temporary ID
        planId,
        ad: String(
          this.findColumnValue(rowData, ["Ad", "AD", "ad"]) || "",
        ).trim(),
        siparisVeren: String(
          this.findColumnValue(rowData, [
            "Sprş.veren",
            "SPRŞ.VEREN",
            "sprş.veren",
          ]) || "",
        ).trim(),
        musteriNo: String(
          this.findColumnValue(rowData, ["Mştr.no.", "MŞTR.NO.", "mştr.no."]) ||
            "",
        ).trim(),
        musteriKalemi: String(
          this.findColumnValue(rowData, [
            "Mştr.klm.",
            "MŞTR.KLM.",
            "mştr.klm.",
          ]) || "",
        ).trim(),
        siparis: String(
          this.findColumnValue(rowData, ["Sipariş", "SİPARİŞ", "sipariş"]) ||
            "",
        ).trim(),
        malzemeNo: String(
          this.findColumnValue(rowData, [
            "Malzeme no.",
            "MALZEME NO.",
            "malzeme no.",
          ]) || "",
        ).trim(),
        malzemeKisaMetni: String(
          this.findColumnValue(rowData, [
            "Malzeme kısa metni",
            "MALZEME KISA METNİ",
            "malzeme kısa metni",
          ]) || "",
        ).trim(),
        miktar: new Prisma.Decimal(miktar),
        planlananBitisTarihi,
        bolum: String(
          this.findColumnValue(rowData, ["Bölüm", "BÖLÜM", "bölüm"]) || "",
        ).trim(),
        oncelik: String(
          this.findColumnValue(rowData, ["Öncelik", "ÖNCELİK", "öncelik"]) ||
            "",
        ).trim(),
        linkedCuttingListId: null,
        encryptedAd: null,
        encryptedMalzemeKisaMetni: null,
        encryptedMalzemeNo: null,
        encryptedMusteriKalemi: null,
        encryptedMusteriNo: null,
        encryptedSiparis: null,
        encryptedSiparisVeren: null,
      } as ProductionPlanItem;

      return { success: true, data: item };
    } catch (error) {
      errors.push(
        `Veri işleme hatası: ${error instanceof Error ? error.message : "Bilinmeyen hata"}`,
      );
      return { success: false, errors };
    }
  }

  /**
   * Parse date string to Date object
   */
  private parseDate(dateStr: string): Date | null {
    if (!dateStr || dateStr.trim() === "") {
      return null;
    }

    // Clean the date string
    const cleanDateStr = dateStr.trim().replace(/\s+/g, "");

    // Try different date formats - prioritize DD.MM.YYYY (Turkish format)
    const formats = [
      /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/, // DD.MM.YYYY (Turkish format - PRIORITY)
      /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/, // DD/MM/YYYY, DD-MM-YYYY
      /^(\d{1,2})[/-](\d{1,2})[/-](\d{2})$/, // DD/MM/YY, DD-MM-YY (MM/DD/YY Excel format)
      /^(\d{4})[/.-](\d{1,2})[/.-](\d{1,2})$/, // YYYY/MM/DD, YYYY-MM-DD, YYYY.MM.DD
    ];

    for (const format of formats) {
      const match = cleanDateStr.match(format);
      if (match) {
        let day: number, month: number, year: number;

        if (format === formats[0]) {
          // DD.MM.YYYY format (Turkish - PRIORITY)
          [, day, month, year] = match.map(Number);
        } else if (format === formats[1]) {
          // DD/MM/YYYY or DD-MM-YYYY format
          [, day, month, year] = match.map(Number);
        } else if (format === formats[2]) {
          // DD/MM/YY or MM/DD/YY format (Excel format)
          [, day, month, year] = match.map(Number);
          year += year < 50 ? 2000 : 1900; // Assume 20xx for years < 50
        } else {
          // YYYY/MM/DD format
          [, year, month, day] = match.map(Number);
        }

        // Validate date
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          const date = new Date(year, month - 1, day);
          if (
            date.getFullYear() === year &&
            date.getMonth() === month - 1 &&
            date.getDate() === day
          ) {
            return date;
          }
        }
      }
    }

    // Try direct Date parsing as fallback
    const directDate = new Date(cleanDateStr);
    if (!isNaN(directDate.getTime())) {
      return directDate;
    }

    return null;
  }

  /**
   * Parse priority string to standardized format
   */
  private parsePriority(priority: string): string {
    const normalized = priority.toLowerCase().trim();

    if (
      normalized.includes("yüksek") ||
      normalized.includes("high") ||
      normalized.includes("urgent")
    ) {
      return "yuksek";
    }
    if (
      normalized.includes("orta") ||
      normalized.includes("medium") ||
      normalized.includes("normal")
    ) {
      return "orta";
    }
    if (
      normalized.includes("düşük") ||
      normalized.includes("dusuk") ||
      normalized.includes("low")
    ) {
      return "dusuk";
    }

    // Default to medium if unknown
    return "orta";
  }

  /**
   * Parse number from various formats
   */
  private parseNumber(value: unknown): number {
    if (typeof value === "number") {
      return value;
    }

    if (typeof value === "string") {
      // Remove common separators and convert to number
      const cleaned = value.replace(/[,\s]/g, "").replace(",", ".");
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }

    return 0;
  }

  /**
   * Find column value by trying multiple possible names
   */
  private findColumnValue(
    rowData: Record<string, unknown>,
    possibleNames: string[],
  ): unknown {
    for (const name of possibleNames) {
      if (rowData[name] !== undefined) {
        return rowData[name];
      }
    }
    return undefined;
  }

  /**
   * Check if row is empty
   */
  private isEmptyRow(row: unknown[]): boolean {
    return row.every(
      (cell) =>
        cell === null ||
        cell === undefined ||
        (typeof cell === "string" && cell.trim() === "") ||
        cell === "",
    );
  }
}

export const excelParserService = new ExcelParserService();
