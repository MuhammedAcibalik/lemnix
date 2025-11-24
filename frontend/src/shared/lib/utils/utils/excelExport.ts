/**
 * @fileoverview Excel Export Utility - Professional Excel file generation
 * @module ExcelExport
 * @version 1.0.0
 */

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { StatisticsData, ExcelSheetData, ExportResult } from "./exportTypes";

// Türkçe sütun başlıkları
const COLUMN_HEADERS = {
  tr: {
    overview: ["Kategori", "Değer", "Birim"],
    profiles: ["Profil Tipi", "Adet", "Yüzde (%)"],
    categories: ["Kategori Adı", "Ürün Sayısı", "Toplam Miktar"],
    colors: ["Renk", "Kullanım Sayısı", "Yüzde (%)"],
    sizes: ["Ebat", "Kullanım Sayısı", "Yüzde (%)"],
    combinations: ["Kombinasyon", "Kullanım Sayısı", "Yüzde (%)"],
    workOrders: ["Durum", "Adet", "Açıklama"],
  },
};

// Kurumsal Excel stil tanımlamaları
const EXCEL_STYLES = {
  title: {
    font: { bold: true, size: 18, color: { rgb: "1F2937" }, name: "Calibri" },
    alignment: { horizontal: "center", vertical: "center" },
    fill: { fgColor: { rgb: "F8FAFC" } },
    border: {
      bottom: { style: "thick", color: { rgb: "10B981" } },
    },
  },
  subtitle: {
    font: { bold: true, size: 14, color: { rgb: "374151" }, name: "Calibri" },
    alignment: { horizontal: "center", vertical: "center" },
    fill: { fgColor: { rgb: "F1F5F9" } },
  },
  header: {
    font: { bold: true, size: 12, color: { rgb: "FFFFFF" }, name: "Calibri" },
    fill: { fgColor: { rgb: "10B981" } },
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
    border: {
      top: { style: "medium", color: { rgb: "059669" } },
      bottom: { style: "medium", color: { rgb: "059669" } },
      left: { style: "thin", color: { rgb: "FFFFFF" } },
      right: { style: "thin", color: { rgb: "FFFFFF" } },
    },
  },
  data: {
    font: { size: 11, name: "Calibri" },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "E5E7EB" } },
      bottom: { style: "thin", color: { rgb: "E5E7EB" } },
      left: { style: "thin", color: { rgb: "E5E7EB" } },
      right: { style: "thin", color: { rgb: "E5E7EB" } },
    },
  },
  highlight: {
    font: { bold: true, size: 11, color: { rgb: "059669" }, name: "Calibri" },
    fill: { fgColor: { rgb: "ECFDF5" } },
    alignment: { horizontal: "center", vertical: "center" },
  },
  summary: {
    font: { bold: true, size: 12, color: { rgb: "1F2937" }, name: "Calibri" },
    fill: { fgColor: { rgb: "FEF3C7" } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thick", color: { rgb: "F59E0B" } },
      bottom: { style: "thick", color: { rgb: "F59E0B" } },
      left: { style: "thin", color: { rgb: "F59E0B" } },
      right: { style: "thin", color: { rgb: "F59E0B" } },
    },
  },
};

/**
 * Excel dosyası oluşturur ve indirir
 */
export const exportToExcel = async (
  data: StatisticsData,
  filename?: string,
): Promise<ExportResult> => {
  try {
    // Workbook oluştur
    const workbook = XLSX.utils.book_new();

    // Sayfa verilerini hazırla
    const sheets: ExcelSheetData[] = [
      createOverviewSheet(data),
      createProfilesSheet(data),
      createCategoriesSheet(data),
      createColorsSheet(data),
      createSizesSheet(data),
      createCombinationsSheet(data),
      createWorkOrdersSheet(data),
    ];

    // Her sayfayı workbook'a ekle
    sheets.forEach((sheet) => {
      const worksheet = createProfessionalWorksheet(sheet);

      // Sayfayı workbook'a ekle
      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.sheetName);
    });

    // Dosya adını oluştur
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const timeStr =
      now.toTimeString()?.split(" ")[0]?.replace(/:/g, "-") ?? "00-00-00";
    const finalFilename =
      filename || `Lemnix-İstatistikleri-${dateStr}-${timeStr}.xlsx`;

    // Excel dosyasını oluştur
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
      cellStyles: true,
    });

    // Dosyayı indir
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, finalFilename);

    return {
      success: true,
      filename: finalFilename,
      message: "Excel dosyası başarıyla oluşturuldu ve indirildi!",
    };
  } catch (error) {
    return {
      success: false,
      filename: "",
      message: "Excel dosyası oluşturulurken hata oluştu!",
      error: error instanceof Error ? error.message : "Bilinmeyen hata",
    };
  }
};

/**
 * Profesyonel worksheet oluşturur
 */
const createProfessionalWorksheet = (sheet: ExcelSheetData) => {
  // Başlık satırı ekle
  const titleRow = [sheet.sheetName];
  const subtitleRow = [
    "Rapor Tarihi: " + new Date().toLocaleDateString("tr-TR"),
  ];

  // Veri satırları
  const dataRows = [
    titleRow,
    subtitleRow,
    [], // Boş satır
    sheet.headers,
    ...sheet.data,
    [], // Boş satır
    ["Toplam Kayıt Sayısı", sheet.data.length, "adet"],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(dataRows);

  // Sütun genişliklerini ayarla
  const columnWidths = sheet.headers.map((_, index) => {
    if (index === 0) return { wch: 30 }; // İlk sütun geniş
    if (index === 1) return { wch: 18 }; // İkinci sütun orta
    return { wch: 15 }; // Diğer sütunlar normal
  });
  worksheet["!cols"] = columnWidths;

  // Satır yüksekliklerini ayarla
  worksheet["!rows"] = [
    { hpt: 25 }, // Başlık satırı
    { hpt: 20 }, // Alt başlık satırı
    { hpt: 10 }, // Boş satır
    { hpt: 30 }, // Header satırı
    ...sheet.data.map(() => ({ hpt: 25 })), // Veri satırları
    { hpt: 10 }, // Boş satır
    { hpt: 25 }, // Özet satırı
  ];

  // Stil uygula
  applyWorksheetStyles(worksheet, dataRows.length);

  // AutoFilter ekle
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
  worksheet["!autofilter"] = {
    ref: `A4:${XLSX.utils.encode_col(range.e.c)}${4 + sheet.data.length}`,
  };

  return worksheet;
};

/**
 * Worksheet stillerini uygular
 */
const applyWorksheetStyles = (worksheet: XLSX.WorkSheet, rowCount: number) => {
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");

  // Başlık satırı stili
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!worksheet[cellAddress]) continue;
    worksheet[cellAddress].s = EXCEL_STYLES.title;
  }

  // Alt başlık satırı stili
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 1, c: col });
    if (!worksheet[cellAddress]) continue;
    worksheet[cellAddress].s = EXCEL_STYLES.subtitle;
  }

  // Header satırı stili (4. satır)
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 3, c: col });
    if (!worksheet[cellAddress]) continue;
    worksheet[cellAddress].s = EXCEL_STYLES.header;
  }

  // Veri satırları stili
  for (let row = 4; row < rowCount - 2; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (!worksheet[cellAddress]) continue;

      // Özet satırı için özel stil
      if (row === rowCount - 2) {
        worksheet[cellAddress].s = EXCEL_STYLES.summary;
      } else {
        worksheet[cellAddress].s = EXCEL_STYLES.data;
      }
    }
  }
};

/**
 * Genel Bakış sayfası oluşturur
 */
const createOverviewSheet = (data: StatisticsData): ExcelSheetData => {
  return {
    sheetName: "Genel Bakış",
    headers: COLUMN_HEADERS.tr.overview,
    data: [
      ["Toplam Ürün Sayısı", data.kesimListesi.toplamUrun, "adet"],
      ["Toplam Kategori", data.kesimListesi.toplamKategori, "adet"],
      ["Ortalama Miktar", data.kesimListesi.ortalamaMiktar, "birim"],
      ["Toplam Ağırlık", data.kesimListesi.toplamAgirlik, "kg"],
      ["", "", ""], // Boş satır
      ["Tamamlanan İş Emirleri", data.isEmirleri.tamamlanan, "adet"],
      ["Bekleyen İş Emirleri", data.isEmirleri.bekleyen, "adet"],
      ["Toplam İş Emri", data.isEmirleri.toplam, "adet"],
      ["Ortalama İşlem Süresi", data.isEmirleri.ortalamaIslemSuresi, "gün"],
    ],
  };
};

/**
 * Profil Analizi sayfası oluşturur
 */
const createProfilesSheet = (data: StatisticsData): ExcelSheetData => {
  return {
    sheetName: "Profil Analizi",
    headers: COLUMN_HEADERS.tr.profiles,
    data: data.profilAnalizi.map((profile) => [
      profile.name,
      profile.count,
      profile.percentage,
    ]),
  };
};

/**
 * Ürün Kategorileri sayfası oluşturur
 */
const createCategoriesSheet = (data: StatisticsData): ExcelSheetData => {
  return {
    sheetName: "Ürün Kategorileri",
    headers: COLUMN_HEADERS.tr.categories,
    data: data.urunKategorileri.map((category) => [
      category.name,
      category.itemCount,
      category.totalQuantity,
    ]),
  };
};

/**
 * Renk Analizi sayfası oluşturur
 */
const createColorsSheet = (data: StatisticsData): ExcelSheetData => {
  return {
    sheetName: "Renk Analizi",
    headers: COLUMN_HEADERS.tr.colors,
    data: data.renkEbat.renkler.map((color) => [
      color.color,
      color.count,
      color.percentage,
    ]),
  };
};

/**
 * Ebat Analizi sayfası oluşturur
 */
const createSizesSheet = (data: StatisticsData): ExcelSheetData => {
  return {
    sheetName: "Ebat Analizi",
    headers: COLUMN_HEADERS.tr.sizes,
    data: data.renkEbat.ebatlar.map((size) => [
      size.size,
      size.count,
      size.percentage,
    ]),
  };
};

/**
 * Kombinasyonlar sayfası oluşturur
 */
const createCombinationsSheet = (data: StatisticsData): ExcelSheetData => {
  return {
    sheetName: "Kombinasyonlar",
    headers: COLUMN_HEADERS.tr.combinations,
    data: data.renkEbat.kombinasyonlar.map((combo) => [
      combo.combination,
      combo.count,
      combo.percentage,
    ]),
  };
};

/**
 * İş Emirleri sayfası oluşturur
 */
const createWorkOrdersSheet = (data: StatisticsData): ExcelSheetData => {
  return {
    sheetName: "İş Emirleri",
    headers: COLUMN_HEADERS.tr.workOrders,
    data: [
      [
        "Tamamlanan",
        data.isEmirleri.tamamlanan,
        "Başarıyla tamamlanan iş emirleri",
      ],
      ["Bekleyen", data.isEmirleri.bekleyen, "Henüz başlanmamış iş emirleri"],
      ["Toplam", data.isEmirleri.toplam, "Tüm iş emirleri"],
      [
        "Ortalama Süre",
        data.isEmirleri.ortalamaIslemSuresi,
        "Gün cinsinden ortalama işlem süresi",
      ],
    ],
  };
};
