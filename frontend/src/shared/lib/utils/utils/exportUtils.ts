/**
 * @fileoverview Main Export Utility - Centralized export functionality
 * @module ExportUtils
 * @version 1.0.0
 */

import { StatisticsData, ExportOptions, ExportResult } from './exportTypes';
import { exportToExcel } from './excelExport';
import { exportToPDF } from './pdfExport';

/**
 * Ana export fonksiyonu - format seçimine göre uygun export fonksiyonunu çağırır
 */
export const exportStatistics = async (
  data: StatisticsData,
  options: ExportOptions
): Promise<ExportResult> => {
  try {
    let result: ExportResult;

    switch (options.format) {
      case 'excel':
        result = await exportToExcel(data, options.filename);
        break;
      case 'pdf':
        result = await exportToPDF(data, options.filename);
        break;
      default:
        throw new Error('Desteklenmeyen export formatı');
    }

    return result;
  } catch (error) {
    return {
      success: false,
      filename: '',
      message: 'Export işlemi sırasında hata oluştu!',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    };
  }
};

/**
 * Veri formatını StatisticsData'ya dönüştürür
 */
export const formatStatisticsData = (rawData: Record<string, unknown>): StatisticsData => {
  return {
    kesimListesi: {
      toplamUrun: rawData?.overview?.totalItems || 0,
      toplamKategori: rawData?.overview?.totalCategories || 0,
      ortalamaMiktar: rawData?.overview?.averageQuantity || 0,
      toplamAgirlik: rawData?.overview?.totalWeight || 0
    },
    isEmirleri: {
      tamamlanan: rawData?.workOrderAnalysis?.completed || 0,
      bekleyen: rawData?.workOrderAnalysis?.pending || 0,
      toplam: rawData?.workOrderAnalysis?.total || 0,
      ortalamaIslemSuresi: rawData?.workOrderAnalysis?.averageProcessingTime || 0
    },
    profilAnalizi: rawData?.profileAnalysis?.profileTypes || [],
    urunKategorileri: rawData?.productCategories?.categories || [],
    renkEbat: {
      renkler: rawData?.colorSize?.colorAnalysis || [],
      ebatlar: rawData?.colorSize?.sizeAnalysis || [],
      kombinasyonlar: rawData?.colorSize?.colorSizeCombinations || []
    }
  };
};

/**
 * Export seçenekleri oluşturur
 */
export const createExportOptions = (
  format: 'excel' | 'pdf',
  customOptions?: Partial<ExportOptions>
): ExportOptions => {
  return {
    format,
    includeCharts: true,
    includeRawData: true,
    language: 'tr',
    filename: undefined,
    ...customOptions
  };
};

/**
 * Dosya adı oluşturur
 */
export const generateFilename = (format: 'excel' | 'pdf', prefix?: string): string => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
  const filePrefix = prefix || 'Lemnix-İstatistikleri';
  const extension = format === 'excel' ? 'xlsx' : 'pdf';
  
  return `${filePrefix}-${dateStr}-${timeStr}.${extension}`;
};

/**
 * Export işlemi için yardımcı fonksiyonlar
 */
export const exportHelpers = {
  /**
   * Hızlı Excel export
   */
  quickExcelExport: async (data: StatisticsData, filename?: string): Promise<ExportResult> => {
    const options = createExportOptions('excel', { filename });
    return exportStatistics(data, options);
  },

  /**
   * Hızlı PDF export
   */
  quickPDFExport: async (data: StatisticsData, filename?: string): Promise<ExportResult> => {
    const options = createExportOptions('pdf', { filename });
    return exportStatistics(data, options);
  },

  /**
   * Raw data'dan direkt export
   */
  exportFromRawData: async (
    rawData: Record<string, unknown>,
    format: 'excel' | 'pdf',
    filename?: string
  ): Promise<ExportResult> => {
    const formattedData = formatStatisticsData(rawData);
    const options = createExportOptions(format, { filename });
    return exportStatistics(formattedData, options);
  }
};
