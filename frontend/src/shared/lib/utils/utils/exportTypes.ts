/**
 * @fileoverview Export Types - TypeScript interfaces for export functionality
 * @module ExportTypes
 * @version 1.0.0
 */

export interface StatisticsData {
  kesimListesi: {
    toplamUrun: number;
    toplamKategori: number;
    ortalamaMiktar: number;
    toplamAgirlik: number;
  };
  isEmirleri: {
    tamamlanan: number;
    bekleyen: number;
    toplam: number;
    ortalamaIslemSuresi: number;
  };
  profilAnalizi: Array<{
    name: string;
    count: number;
    percentage: string;
  }>;
  urunKategorileri: Array<{
    name: string;
    itemCount: number;
    totalQuantity: number;
  }>;
  renkEbat: {
    renkler: Array<{
      color: string;
      count: number;
      percentage: string;
    }>;
    ebatlar: Array<{
      size: string;
      count: number;
      percentage: string;
    }>;
    kombinasyonlar: Array<{
      combination: string;
      count: number;
      percentage: string;
    }>;
  };
}

export interface ExportOptions {
  format: 'excel' | 'pdf';
  includeCharts: boolean;
  includeRawData: boolean;
  language: 'tr' | 'en';
  filename?: string;
}

export interface ExcelSheetData {
  sheetName: string;
  headers: string[];
  data: (string | number)[][];
  chartData?: {
    type: 'pie' | 'bar' | 'line';
    title: string;
    data: Record<string, unknown>[];
    labels: string[];
  };
}

export interface PDFSection {
  title: string;
  content: string | Array<{
    label: string;
    value: string | number;
  }>;
  chart?: {
    type: 'pie' | 'bar' | 'line';
    title: string;
    data: Record<string, unknown>[];
    labels: string[];
  };
}

export interface ExportResult {
  success: boolean;
  filename: string;
  message: string;
  error?: string;
}
