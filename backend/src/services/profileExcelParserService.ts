/**
 * @fileoverview Profile Management Excel Parser Service
 * @module services/profileExcelParserService
 * @version 1.0.0
 * @description Parses Excel files for profile management (profile definitions and work order mappings)
 */

import * as XLSX from 'xlsx';
import {
  ProfileManagementParseResult,
  ProfileManagementData,
  ProfileDefinitionInput,
  ProfileStockLengthInput,
  WorkOrderProfileMappingInput,
  ProfileManagementExcelRow
} from '../types';
import { logger } from '../utils/logger';

export class ProfileExcelParserService {
  private readonly REQUIRED_COLUMNS = [
    'Profil Kodu',
    'Profil Adı',
    'Sipariş No',
    'Profil Tipi',
    'Stok Uzunluğu 1'
  ] as const;

  private readonly OPTIONAL_COLUMNS = [
    'Stok Uzunluğu 2',
    'Stok Uzunluğu 3',
    'Varsayılan Stok'
  ] as const;

  private readonly MAX_PROFILE_CODE_LENGTH = 50;
  private readonly MAX_PROFILE_NAME_LENGTH = 200;
  private readonly MAX_STOCK_LENGTH_MM = 20000;
  private readonly MIN_STOCK_LENGTH_MM = 100;

  /**
   * Parse profile management Excel file
   */
  public async parseProfileManagementExcel(
    fileBuffer: Buffer
  ): Promise<ProfileManagementParseResult> {
    try {
      // Read Excel file
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];

      if (!sheetName) {
        return {
          success: false,
          errors: ['Excel dosyasında sayfa bulunamadı']
        };
      }

      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
        raw: false
      });

      if (jsonData.length < 2) {
        return {
          success: false,
          errors: ['Excel dosyası boş veya geçersiz']
        };
      }

      // Get headers (first row)
      const headers = jsonData[0] as string[];
      const validationResult = this.validateHeaders(headers);

      if (!validationResult.isValid) {
        return {
          success: false,
          errors: validationResult.errors
        };
      }

      // Parse data rows
      const dataRows = jsonData.slice(1) as unknown[][];
      const parseResult = this.parseDataRows(dataRows, headers);

      if (!parseResult.success) {
        return parseResult;
      }

      return {
        success: true,
        data: parseResult.data,
        errors: parseResult.warnings,
        summary: {
          totalRows: dataRows.length,
          validRows: parseResult.data!.mappings.length,
          invalidRows: parseResult.warnings?.length || 0,
          weekNumber: parseResult.data!.weekNumber,
          year: parseResult.data!.year,
          uniqueProfiles: parseResult.data!.profiles.size,
          uniqueMappings: parseResult.data!.mappings.length
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      logger.error('Profile Excel parse error:', error as Record<string, unknown>);
      return {
        success: false,
        errors: [`Excel dosyası işlenirken hata oluştu: ${errorMessage}`]
      };
    }
  }

  /**
   * Validate Excel headers
   */
  private validateHeaders(headers: string[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const normalizedHeaders = headers.map((h) => this.normalizeColumnName(h));

    for (const required of this.REQUIRED_COLUMNS) {
      const normalized = this.normalizeColumnName(required);
      if (!normalizedHeaders.includes(normalized)) {
        errors.push(`Gerekli kolon bulunamadı: "${required}"`);
      }
    }

    if (errors.length > 0) {
      errors.push(
        `Bulunan kolonlar: ${headers.join(', ')}`,
        `Beklenen kolonlar: ${this.REQUIRED_COLUMNS.join(', ')}`
      );
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Parse data rows and build profile definitions + mappings
   */
  private parseDataRows(
    rows: unknown[][],
    headers: string[]
  ): {
    success: boolean;
    data?: ProfileManagementData;
    warnings?: string[];
  } {
    const profiles = new Map<string, ProfileDefinitionInput>();
    const mappings: WorkOrderProfileMappingInput[] = [];
    const warnings: string[] = [];
    const stockLengthsMap = new Map<string, Set<number>>(); // profileCode → Set of stock lengths

    // Build column index map
    const columnMap = this.buildColumnMap(headers);

    // Extract week/year from first valid row or use current
    const { weekNumber, year } = this.extractWeekYear();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // Excel row number (1-indexed + header)

      try {
        const parsedRow = this.parseRow(row, columnMap, rowNumber);

        if (!parsedRow) {
          continue; // Skip empty rows
        }

        // Validate row data
        const validation = this.validateRowData(parsedRow, rowNumber);
        if (validation.errors.length > 0) {
          warnings.push(...validation.errors);
          continue;
        }

        // Build profile definition (aggregate stock lengths)
        if (!profiles.has(parsedRow.profileCode)) {
          profiles.set(parsedRow.profileCode, {
            profileCode: parsedRow.profileCode,
            profileName: parsedRow.profileName,
            stockLengths: []
          });
          stockLengthsMap.set(parsedRow.profileCode, new Set());
        }

        // Add stock lengths to profile
        const stockLengths = stockLengthsMap.get(parsedRow.profileCode)!;
        const newStockLengths: number[] = [parsedRow.stockLength1];
        if (parsedRow.stockLength2) newStockLengths.push(parsedRow.stockLength2);
        if (parsedRow.stockLength3) newStockLengths.push(parsedRow.stockLength3);

        newStockLengths.forEach((sl) => stockLengths.add(sl));

        // Build work order mapping
        mappings.push({
          workOrderId: parsedRow.workOrderId,
          profileType: parsedRow.profileType,
          profileCode: parsedRow.profileCode,
          weekNumber,
          year
        });
      } catch (error) {
        warnings.push(
          `Satır ${rowNumber}: ${error instanceof Error ? error.message : 'Parse hatası'}`
        );
      }
    }

    // Convert stock lengths sets to ProfileStockLengthInput arrays
    for (const [profileCode, stockLengthsSet] of stockLengthsMap.entries()) {
      const profile = profiles.get(profileCode)!;
      const sortedLengths = Array.from(stockLengthsSet).sort((a, b) => b - a); // Descending

      const stockLengths: ProfileStockLengthInput[] = sortedLengths.map((length, index) => ({
        stockLength: length,
        isDefault: index === 0, // Longest is default
        priority: index
      }));

      // Update profile with new array
      profiles.set(profileCode, {
        ...profile,
        stockLengths
      });
    }

    if (mappings.length === 0) {
      return {
        success: false,
        warnings: ['Hiç geçerli satır bulunamadı', ...warnings]
      };
    }

    return {
      success: true,
      data: {
        profiles,
        mappings,
        weekNumber,
        year
      },
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  /**
   * Parse individual row
   */
  private parseRow(
    row: unknown[],
    columnMap: Map<string, number>,
    rowNumber: number
  ): ProfileManagementExcelRow | null {
    const getCellValue = (colName: string): string => {
      const index = columnMap.get(this.normalizeColumnName(colName));
      if (index === undefined) return '';
      const value = row[index];
      return value ? String(value).trim() : '';
    };

    const profileCode = getCellValue('Profil Kodu');
    const profileName = getCellValue('Profil Adı');
    const workOrderId = getCellValue('Sipariş No');
    const profileType = getCellValue('Profil Tipi');
    const stockLength1Str = getCellValue('Stok Uzunluğu 1');

    // Skip empty rows
    if (!profileCode && !profileName && !workOrderId) {
      return null;
    }

    const stockLength1 = this.parseStockLength(stockLength1Str);
    const stockLength2 = this.parseStockLength(getCellValue('Stok Uzunluğu 2'));
    const stockLength3 = this.parseStockLength(getCellValue('Stok Uzunluğu 3'));
    const defaultStockStr = getCellValue('Varsayılan Stok');
    const defaultStock = defaultStockStr ? parseInt(defaultStockStr, 10) : undefined;

    // Ensure stockLength1 is defined
    if (stockLength1 === undefined) {
      return null;
    }

    return {
      profileCode,
      profileName,
      workOrderId,
      profileType,
      stockLength1,
      stockLength2,
      stockLength3,
      defaultStock
    };
  }

  /**
   * Validate row data
   */
  private validateRowData(
    row: ProfileManagementExcelRow,
    rowNumber: number
  ): { errors: string[] } {
    const errors: string[] = [];

    // Profile code
    if (!row.profileCode) {
      errors.push(`Satır ${rowNumber}: Profil kodu boş olamaz`);
    } else if (row.profileCode.length > this.MAX_PROFILE_CODE_LENGTH) {
      errors.push(
        `Satır ${rowNumber}: Profil kodu çok uzun (max ${this.MAX_PROFILE_CODE_LENGTH} karakter)`
      );
    }

    // Profile name
    if (!row.profileName) {
      errors.push(`Satır ${rowNumber}: Profil adı boş olamaz`);
    } else if (row.profileName.length > this.MAX_PROFILE_NAME_LENGTH) {
      errors.push(
        `Satır ${rowNumber}: Profil adı çok uzun (max ${this.MAX_PROFILE_NAME_LENGTH} karakter)`
      );
    }

    // Work order ID
    if (!row.workOrderId) {
      errors.push(`Satır ${rowNumber}: Sipariş no boş olamaz`);
    }

    // Profile type
    if (!row.profileType) {
      errors.push(`Satır ${rowNumber}: Profil tipi boş olamaz`);
    }

    // Stock length validation
    if (row.stockLength1 <= 0) {
      errors.push(`Satır ${rowNumber}: Stok Uzunluğu 1 geçersiz`);
    } else if (
      row.stockLength1 < this.MIN_STOCK_LENGTH_MM ||
      row.stockLength1 > this.MAX_STOCK_LENGTH_MM
    ) {
      errors.push(
        `Satır ${rowNumber}: Stok Uzunluğu 1 aralık dışı (${this.MIN_STOCK_LENGTH_MM}-${this.MAX_STOCK_LENGTH_MM}mm)`
      );
    }

    // Validate optional stock lengths
    if (row.stockLength2 !== undefined && row.stockLength2 > 0) {
      if (
        row.stockLength2 < this.MIN_STOCK_LENGTH_MM ||
        row.stockLength2 > this.MAX_STOCK_LENGTH_MM
      ) {
        errors.push(
          `Satır ${rowNumber}: Stok Uzunluğu 2 aralık dışı (${this.MIN_STOCK_LENGTH_MM}-${this.MAX_STOCK_LENGTH_MM}mm)`
        );
      }
    }

    if (row.stockLength3 !== undefined && row.stockLength3 > 0) {
      if (
        row.stockLength3 < this.MIN_STOCK_LENGTH_MM ||
        row.stockLength3 > this.MAX_STOCK_LENGTH_MM
      ) {
        errors.push(
          `Satır ${rowNumber}: Stok Uzunluğu 3 aralık dışı (${this.MIN_STOCK_LENGTH_MM}-${this.MAX_STOCK_LENGTH_MM}mm)`
        );
      }
    }

    // Validate default stock
    if (row.defaultStock !== undefined) {
      if (![1, 2, 3].includes(row.defaultStock)) {
        errors.push(`Satır ${rowNumber}: Varsayılan Stok 1, 2 veya 3 olmalı`);
      }
    }

    return { errors };
  }

  /**
   * Parse stock length from string
   */
  private parseStockLength(value: string): number | undefined {
    if (!value) return undefined;
    const parsed = parseFloat(value);
    return isNaN(parsed) || parsed <= 0 ? undefined : parsed;
  }

  /**
   * Build column index map
   */
  private buildColumnMap(headers: string[]): Map<string, number> {
    const map = new Map<string, number>();
    headers.forEach((header, index) => {
      map.set(this.normalizeColumnName(header), index);
    });
    return map;
  }

  /**
   * Normalize column name for comparison
   */
  private normalizeColumnName(name: string): string {
    return name.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  /**
   * Extract week number and year (currently returns current week)
   */
  private extractWeekYear(): { weekNumber: number; year: number } {
    const now = new Date();
    const year = now.getFullYear();

    // Calculate ISO week number
    const startOfYear = new Date(year, 0, 1);
    const days = Math.floor(
      (now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
    );
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);

    return { weekNumber, year };
  }
}

// Singleton instance
export const profileExcelParserService = new ProfileExcelParserService();

