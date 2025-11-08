/**
 * @fileoverview Excel Export Service for cutting lists
 * @module ExcelExportService
 * @version 1.0.0
 */

import * as XLSX from 'xlsx';

type ExcelRow = readonly (string | number | boolean | null)[];

/**
 * Profile item interface
 */
interface ProfileItem {
  readonly id: string;
  readonly profile?: string;
  readonly measurement: string;
  readonly quantity: number;
}

/**
 * Cutting list item interface
 */
interface CuttingListItem {
  readonly id: string;
  readonly workOrderId: string;
  readonly date: string;
  readonly version: string;
  readonly color: string;
  readonly note?: string;
  readonly orderQuantity: number;
  readonly size: string;
  readonly profiles: ReadonlyArray<ProfileItem>;
}

/**
 * Product section interface
 */
interface ProductSection {
  readonly id: string;
  readonly productName: string;
  readonly items: ReadonlyArray<CuttingListItem>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Cutting list interface
 */
interface CuttingList {
  readonly id: string;
  readonly title: string;
  readonly weekNumber: number;
  readonly sections: ReadonlyArray<ProductSection>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// ============================================================================
// EXCEL EXPORT SERVICE CLASS
// ============================================================================

/**
 * Excel Export Service
 */
export class ExcelExportService {
  /**
   * Export cutting list to Excel
   */
  public exportToExcel(cuttingList: CuttingList): Buffer {
    // Generate Excel workbook
    const workbook = this.generateExcelWorkbook(cuttingList);
    
    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    return excelBuffer;
  }

  /**
   * Generate Excel workbook with PDF-like table structure
   */
  private generateExcelWorkbook(cuttingList: CuttingList): XLSX.WorkBook {
    const workbook = XLSX.utils.book_new();
    
    // Calculate totals
    const totalItems = cuttingList.sections.reduce((total, section) => 
      total + section.items.length, 0
    );
    const totalProfiles = cuttingList.sections.reduce((total, section) => 
      total + section.items.reduce((sum, item) => 
        sum + item.profiles.length, 0
      ), 0
    );
    
    // ===== CREATE MAIN DATA SHEET WITH PDF-LIKE STRUCTURE =====
    const mainData: ExcelRow[] = [];
    
    // ===== HEADER SECTION =====
    mainData.push([]); // Top margin
    mainData.push([cuttingList.title]); // Main title
    mainData.push([]); // Spacing
    mainData.push([`${cuttingList.weekNumber}. HAFTA KESİM LİSTESİ`]); // Subtitle
    mainData.push([`Oluşturulma Tarihi: ${new Date(cuttingList.createdAt).toLocaleDateString('tr-TR')}`]);
    mainData.push([]); // Spacing
    
    // ===== SUMMARY SECTION =====
    mainData.push(['ÖZET BİLGİLER']);
    mainData.push(['', 'Ürün Bölümü Sayısı', 'Toplam İş Emri', 'Toplam Profil']);
    mainData.push(['', cuttingList.sections.length, totalItems, totalProfiles]);
    mainData.push([]); // Spacing
    mainData.push([]); // Spacing
    
    // ===== MAIN DATA SECTION =====
    cuttingList.sections.forEach((section, sectionIndex) => {
      // Section header with styling
      mainData.push([`BÖLÜM ${sectionIndex + 1}: ${section.productName}`]);
      mainData.push([]); // Spacing
      
      // Section data header
      mainData.push(['İş Emri', 'Tarih', 'Versiyon', 'Renk', 'Not', 'Sipariş Adedi', 'Ebat', 'Profil', 'Ölçü', 'Adet']);
      
      // Section data rows
      section.items.forEach(item => {
        item.profiles.forEach((profile, profileIndex) => {
          if (profileIndex === 0) {
            // First profile - include all item data
            mainData.push([
              item.workOrderId,
              item.date,
              item.version,
              item.color,
              item.note || '-',
              item.orderQuantity,
              item.size,
              profile.profile || '-',
              profile.measurement,
              profile.quantity
            ]);
          } else {
            // Additional profiles - only profile data
            mainData.push([
              '', // Empty for rowspan effect
              '',
              '',
              '',
              '',
              '',
              '',
              profile.profile || '-',
              profile.measurement,
              profile.quantity
            ]);
          }
        });
      });
      
      // Section summary
      const sectionTotalProfiles = section.items.reduce((sum, item) => sum + item.profiles.length, 0);
      mainData.push([]); // Spacing
      mainData.push([`Bölüm ${sectionIndex + 1} Toplamı: ${section.items.length} iş emri, ${sectionTotalProfiles} profil`]);
      mainData.push([]); // Spacing
      mainData.push([]); // Spacing
    });
    
    // ===== FINAL SUMMARY SECTION =====
    mainData.push(['GENEL TOPLAM']);
    mainData.push(['', 'Ürün Bölümü', 'İş Emri', 'Profil']);
    mainData.push(['', cuttingList.sections.length, totalItems, totalProfiles]);
    mainData.push([]); // Spacing
    mainData.push([]); // Spacing
    
    // ===== FOOTER SECTION =====
    mainData.push([`Bu belge ${new Date().toLocaleDateString('tr-TR')} tarihinde LEMNİX sisteminden oluşturulmuştur.`]);
    mainData.push(['LEMNİX - Alüminyum Profil Kesim Yönetim Sistemi']);
    
    const mainWorksheet = XLSX.utils.aoa_to_sheet(mainData as (string | number | boolean | null)[][]);
    mainWorksheet['!cols'] = [
      { wch: 20 }, // İş Emri
      { wch: 15 }, // Tarih
      { wch: 12 }, // Versiyon
      { wch: 15 }, // Renk
      { wch: 30 }, // Not
      { wch: 18 }, // Sipariş Adedi
      { wch: 15 }, // Ebat
      { wch: 30 }, // Profil
      { wch: 15 }, // Ölçü
      { wch: 12 }  // Adet
    ];
    
    // Style main worksheet with PDF-like formatting
    this.styleMainWorksheetPDF(mainWorksheet, cuttingList);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, mainWorksheet, cuttingList.title.substring(0, 31));
    
    return workbook;
  }
  
  /**
   * Style main worksheet with PDF-like formatting
   */
  private styleMainWorksheetPDF(worksheet: XLSX.WorkSheet, cuttingList: CuttingList): void {
    // ===== STYLE HEADER SECTION =====
    
    // Style main title (row 2)
    if (worksheet['A2']) {
      worksheet['A2'].s = {
        font: { bold: true, size: 18, color: { rgb: '1976D2' } },
        alignment: { horizontal: 'center', vertical: 'center' },
        fill: { fgColor: { rgb: 'E3F2FD' } }
      };
      if (!worksheet['!merges']) worksheet['!merges'] = [];
      worksheet['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 9 } });
    }
    
    // Style subtitle (row 4)
    if (worksheet['A4']) {
      worksheet['A4'].s = {
        font: { bold: true, size: 14, color: { rgb: '1976D2' } },
        alignment: { horizontal: 'center' }
      };
      if (!worksheet['!merges']) worksheet['!merges'] = [];
      worksheet['!merges'].push({ s: { r: 3, c: 0 }, e: { r: 3, c: 9 } });
    }
    
    // Style date (row 5)
    if (worksheet['A5']) {
      worksheet['A5'].s = {
        font: { size: 12, color: { rgb: '666666' } },
        alignment: { horizontal: 'center' }
      };
      if (!worksheet['!merges']) worksheet['!merges'] = [];
      worksheet['!merges'].push({ s: { r: 4, c: 0 }, e: { r: 4, c: 9 } });
    }
    
    // ===== STYLE SUMMARY SECTION =====
    
    // Style summary section header (row 7)
    if (worksheet['A7']) {
      worksheet['A7'].s = {
        font: { bold: true, size: 14, color: { rgb: '1976D2' } },
        fill: { fgColor: { rgb: 'F5F5F5' } }
      };
      if (!worksheet['!merges']) worksheet['!merges'] = [];
      worksheet['!merges'].push({ s: { r: 6, c: 0 }, e: { r: 6, c: 9 } });
    }
    
    // Style summary table headers (row 8)
    for (let col = 1; col < 4; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 7, c: col });
      const cell = worksheet[cellAddress];
      if (cell) {
        cell.s = {
          font: { bold: true, size: 11, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '1976D2' } },
          alignment: { horizontal: 'center' },
          border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
        };
      }
    }
    
    // Style summary table data (row 9)
    for (let col = 1; col < 4; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 8, c: col });
      const cell = worksheet[cellAddress];
      if (cell) {
        cell.s = {
          font: { bold: true, size: 12 },
          fill: { fgColor: { rgb: 'E3F2FD' } },
          alignment: { horizontal: 'center' },
          border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
        };
      }
    }
    
    // ===== STYLE MAIN DATA SECTION =====
    
    let currentRow = 12; // Start after summary section
    
    cuttingList.sections.forEach((section) => {
      // Style section header
      const sectionHeaderCell = worksheet[`A${currentRow}`];
      if (sectionHeaderCell) {
        sectionHeaderCell.s = {
          font: { bold: true, size: 14, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '1976D2' } },
          alignment: { horizontal: 'center' }
        };
        if (!worksheet['!merges']) worksheet['!merges'] = [];
        worksheet['!merges'].push({ s: { r: currentRow - 1, c: 0 }, e: { r: currentRow - 1, c: 9 } });
      }
      currentRow += 2; // Skip spacing
      
      // Style data header
      for (let col = 0; col < 10; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: currentRow - 1, c: col });
        const cell = worksheet[cellAddress];
        if (cell) {
          cell.s = {
            font: { bold: true, size: 11, color: { rgb: 'FFFFFF' } },
            fill: { fgColor: { rgb: '424242' } },
            alignment: { horizontal: 'center', vertical: 'center' },
            border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
          };
        }
      }
      currentRow++;
      
      // Style data rows for this section
      section.items.forEach(item => {
        item.profiles.forEach((_profile, profileIndex) => {
          for (let col = 0; col < 10; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: currentRow - 1, c: col });
            const cell = worksheet[cellAddress];
            if (cell) {
              cell.s = {
                font: { size: 10 },
                alignment: { horizontal: 'center', vertical: 'center' },
                border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } },
                fill: { fgColor: { rgb: profileIndex === 0 ? 'FFFFFF' : 'F8F9FA' } }
              };
            }
          }
          currentRow++;
        });
      });
      
      // Style section summary
      const summaryCell = worksheet[`A${currentRow}`];
      if (summaryCell) {
        summaryCell.s = {
          font: { bold: true, size: 11, color: { rgb: '1976D2' } },
          fill: { fgColor: { rgb: 'E3F2FD' } }
        };
        if (!worksheet['!merges']) worksheet['!merges'] = [];
        worksheet['!merges'].push({ s: { r: currentRow - 1, c: 0 }, e: { r: currentRow - 1, c: 9 } });
      }
      currentRow += 3; // Skip spacing
    });
    
    // ===== STYLE FINAL SUMMARY SECTION =====
    
    const finalSummaryStart = currentRow;
    if (worksheet[`A${finalSummaryStart}`]) {
      worksheet[`A${finalSummaryStart}`].s = {
        font: { bold: true, size: 14, color: { rgb: '1976D2' } },
        fill: { fgColor: { rgb: 'F5F5F5' } }
      };
      if (!worksheet['!merges']) worksheet['!merges'] = [];
      worksheet['!merges'].push({ s: { r: finalSummaryStart - 1, c: 0 }, e: { r: finalSummaryStart - 1, c: 9 } });
    }
    
    // Style final summary table
    for (let col = 1; col < 4; col++) {
      const headerCell = XLSX.utils.encode_cell({ r: finalSummaryStart, c: col });
      const dataCell = XLSX.utils.encode_cell({ r: finalSummaryStart + 1, c: col });
      
      if (worksheet[headerCell]) {
        worksheet[headerCell].s = {
          font: { bold: true, size: 11, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '1976D2' } },
          alignment: { horizontal: 'center' },
          border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
        };
      }
      
      if (worksheet[dataCell]) {
        worksheet[dataCell].s = {
          font: { bold: true, size: 12 },
          fill: { fgColor: { rgb: 'E3F2FD' } },
          alignment: { horizontal: 'center' },
          border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
        };
      }
    }
    
    // ===== STYLE FOOTER SECTION =====
    
    const footerRow = finalSummaryStart + 5;
    if (worksheet[`A${footerRow}`]) {
      worksheet[`A${footerRow}`].s = {
        font: { italic: true, size: 10, color: { rgb: '666666' } },
        alignment: { horizontal: 'center' }
      };
      if (!worksheet['!merges']) worksheet['!merges'] = [];
      worksheet['!merges'].push({ s: { r: footerRow - 1, c: 0 }, e: { r: footerRow - 1, c: 9 } });
    }
    
    if (worksheet[`A${footerRow + 1}`]) {
      worksheet[`A${footerRow + 1}`].s = {
        font: { bold: true, size: 10, color: { rgb: '1976D2' } },
        alignment: { horizontal: 'center' }
      };
      if (!worksheet['!merges']) worksheet['!merges'] = [];
      worksheet['!merges'].push({ s: { r: footerRow, c: 0 }, e: { r: footerRow, c: 9 } });
    }
  }
}
