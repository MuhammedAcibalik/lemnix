/**
 * @fileoverview PDF Export Utility - Professional PDF report generation
 * @module PDFExport
 * @version 1.0.0
 */

import jsPDF from 'jspdf';
import { StatisticsData, PDFSection, ExportResult } from './exportTypes';

// Türkçe PDF içeriği
const PDF_CONTENT = {
  tr: {
    title: 'Lemnix İstatistik Raporu',
    subtitle: 'Kesim Listesi Analizi ve Performans Raporu',
    sections: {
      overview: 'Genel Bakış',
      profiles: 'Profil Analizi',
      categories: 'Ürün Kategorileri',
      colors: 'Renk Analizi',
      sizes: 'Ebat Analizi',
      combinations: 'Kombinasyonlar',
      workOrders: 'İş Emirleri Durumu'
    },
    labels: {
      totalItems: 'Toplam Ürün Sayısı',
      totalCategories: 'Toplam Kategori',
      averageQuantity: 'Ortalama Miktar',
      totalWeight: 'Toplam Ağırlık',
      completedOrders: 'Tamamlanan İş Emirleri',
      pendingOrders: 'Bekleyen İş Emirleri',
      totalOrders: 'Toplam İş Emri',
      averageProcessingTime: 'Ortalama İşlem Süresi',
      count: 'Adet',
      percentage: 'Yüzde',
      combination: 'Kombinasyon',
      color: 'Renk',
      size: 'Ebat',
      profile: 'Profil Tipi',
      category: 'Kategori'
    }
  }
};

/**
 * Basit ve etkili PDF raporu oluşturur
 */
export const exportToPDF = async (
  data: StatisticsData,
  filename?: string
): Promise<ExportResult> => {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    
    let yPosition = margin;

    // Başlık
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text('LEMNIX İSTATİSTİK RAPORU', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Tarih
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 30;

    // Genel Bakış
    yPosition = addSection(doc, 'GENEL BAKIŞ', yPosition, pageWidth, margin);
    
    const overviewData = [
      ['Toplam Ürün Sayısı', data?.kesimListesi?.toplamUrun || 0],
      ['Toplam Kategori', data?.kesimListesi?.toplamKategori || 0],
      ['Ortalama Miktar', data?.kesimListesi?.ortalamaMiktar || 0],
      ['Toplam Ağırlık', data?.kesimListesi?.toplamAgirlik || 0]
    ];
    
    yPosition = addTable(doc, overviewData, yPosition, pageWidth, margin);

    // İş Emirleri
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = margin;
    }
    
    yPosition = addSection(doc, 'İŞ EMİRLERİ DURUMU', yPosition, pageWidth, margin);
    
    const workOrderData = [
      ['Tamamlanan', data?.isEmirleri?.tamamlanan || 0],
      ['Bekleyen', data?.isEmirleri?.bekleyen || 0],
      ['Toplam', data?.isEmirleri?.toplam || 0],
      ['Ortalama İşlem Süresi', `${data?.isEmirleri?.ortalamaIslemSuresi || 0} gün`]
    ];
    
    yPosition = addTable(doc, workOrderData, yPosition, pageWidth, margin);

    // Profil Analizi
    if (data?.profilAnalizi?.length > 0) {
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = margin;
      }
      
      yPosition = addSection(doc, 'PROFİL ANALİZİ', yPosition, pageWidth, margin);
      
      const profileData = data.profilAnalizi.map((profile: Record<string, unknown>) => [
        profile.name,
        profile.count,
        profile.percentage
      ]) as (string | number)[][];
      
      profileData.unshift(['Profil Tipi', 'Adet', 'Yüzde']);
      yPosition = addTable(doc, profileData, yPosition, pageWidth, margin);
    }

    // Ürün Kategorileri
    if (data?.urunKategorileri?.length > 0) {
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = margin;
      }
      
      yPosition = addSection(doc, 'ÜRÜN KATEGORİLERİ', yPosition, pageWidth, margin);
      
      const categoryData = data.urunKategorileri.map((category: Record<string, unknown>) => [
        category.name,
        category.itemCount,
        category.totalQuantity
      ]) as (string | number)[][];
      
      categoryData.unshift(['Kategori', 'Ürün Sayısı', 'Toplam Miktar']);
      yPosition = addTable(doc, categoryData, yPosition, pageWidth, margin);
    }

    // Renk Analizi
    if (data?.renkEbat?.renkler?.length > 0) {
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = margin;
      }
      
      yPosition = addSection(doc, 'RENK ANALİZİ', yPosition, pageWidth, margin);
      
      const colorData = data.renkEbat.renkler.map((color: Record<string, unknown>) => [
        color.color,
        color.count,
        color.percentage
      ]) as (string | number)[][];
      
      colorData.unshift(['Renk', 'Adet', 'Yüzde']);
      yPosition = addTable(doc, colorData, yPosition, pageWidth, margin);
    }

    // Ebat Analizi
    if (data?.renkEbat?.ebatlar?.length > 0) {
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = margin;
      }
      
      yPosition = addSection(doc, 'EBAT ANALİZİ', yPosition, pageWidth, margin);
      
      const sizeData = data.renkEbat.ebatlar.map((size: Record<string, unknown>) => [
        size.size,
        size.count,
        size.percentage
      ]) as (string | number)[][];
      
      sizeData.unshift(['Ebat', 'Adet', 'Yüzde']);
      yPosition = addTable(doc, sizeData, yPosition, pageWidth, margin);
    }

    // Footer
    const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.text(`Sayfa ${i} / ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
      doc.text('Lemnix İstatistik Raporu', margin, pageHeight - 10);
    }

    // Dosya adı
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    const finalFilename = filename || `Lemnix-Raporu-${dateStr}-${timeStr}.pdf`;

    doc.save(finalFilename);

    return {
      success: true,
      filename: finalFilename,
      message: 'PDF raporu başarıyla oluşturuldu!'
    };

  } catch (error) {
    return {
      success: false,
      filename: '',
      message: 'PDF oluşturulurken hata oluştu!',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    };
  }
};

/**
 * Bölüm başlığı ekler
 */
const addSection = (doc: jsPDF, title: string, yPosition: number, pageWidth: number, margin: number): number => {
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text(title, margin, yPosition);
  
  // Alt çizgi
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(1);
  doc.line(margin, yPosition + 3, pageWidth - margin, yPosition + 3);
  
  return yPosition + 15;
};

/**
 * Basit tablo ekler
 */
const addTable = (doc: jsPDF, data: (string | number)[][], yPosition: number, pageWidth: number, margin: number): number => {
  const colWidth = (pageWidth - 2 * margin) / data[0].length;
  const rowHeight = 8;
  
  data.forEach((row, rowIndex) => {
    const isHeader = rowIndex === 0;
    const currentY = yPosition + (rowIndex * rowHeight);
    
    // Satır arka planı
    if (isHeader) {
      doc.setFillColor(16, 185, 129);
      doc.rect(margin, currentY - 2, pageWidth - 2 * margin, rowHeight, 'F');
    } else if (rowIndex % 2 === 0) {
      doc.setFillColor(249, 250, 251);
      doc.rect(margin, currentY - 2, pageWidth - 2 * margin, rowHeight, 'F');
    }
    
    // Tablo çerçevesi
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.rect(margin, currentY - 2, pageWidth - 2 * margin, rowHeight);
    
    // Hücre içeriği
    row.forEach((cell, colIndex) => {
      const x = margin + (colIndex * colWidth);
      doc.setFontSize(10);
      doc.setFont('helvetica', isHeader ? 'bold' : 'normal');
      doc.setTextColor(isHeader ? 255 : 31, isHeader ? 255 : 41, isHeader ? 255 : 55);
      doc.text(cell.toString(), x + 2, currentY + 4);
    });
  });
  
  return yPosition + (data.length * rowHeight) + 10;
};

/**
 * Profesyonel başlık sayfası ekler (eski - kullanılmıyor)
 */
const addProfessionalTitlePage = (doc: jsPDF, data: StatisticsData) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Arka plan rengi
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Logo alanı (üst kısım)
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, pageWidth, 80, 'F');
  
  // Ana başlık
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(PDF_CONTENT.tr.title, pageWidth / 2, 35, { align: 'center' });
  
  // Alt başlık
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text(PDF_CONTENT.tr.subtitle, pageWidth / 2, 50, { align: 'center' });
  
  // Tarih ve bilgiler
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Rapor Detayları', pageWidth / 2, 100, { align: 'center' });
  
  // Rapor bilgileri
  const now = new Date();
  const reportInfo = [
    `Rapor Tarihi: ${now.toLocaleDateString('tr-TR')}`,
    `Toplam Ürün Sayısı: ${data.kesimListesi.toplamUrun}`,
    `Toplam Kategori: ${data.kesimListesi.toplamKategori}`,
    `İş Emirleri: ${data.isEmirleri.toplam} (${data.isEmirleri.tamamlanan} tamamlanan)`
  ];
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  reportInfo.forEach((info, index) => {
    doc.text(info, pageWidth / 2, 120 + (index * 15), { align: 'center' });
  });
  
  // Alt bilgi
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text('Bu rapor Lemnix Kesim Listesi Yönetim Sistemi tarafından otomatik olarak oluşturulmuştur.', 
           pageWidth / 2, pageHeight - 30, { align: 'center' });
};

/**
 * Profesyonel bölüm ekler
 */
const addProfessionalSection = (doc: jsPDF, section: PDFSection, contentWidth: number, margin: number) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = margin;
  
  // Bölüm başlığı
  doc.setTextColor(16, 185, 129);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(section.title, margin, yPosition);
  yPosition += 15;
  
  // Alt çizgi
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 20;
  
  // İçerik
  if (typeof section.content === 'string') {
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    const lines = doc.splitTextToSize(section.content, contentWidth);
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += 7;
    });
  } else {
    // Tablo formatında veri
    addProfessionalTable(doc, section.content, margin, yPosition, contentWidth);
  }
};

/**
 * Profesyonel tablo ekler
 */
const addProfessionalTable = (doc: jsPDF, data: Array<{label: string; value: string | number}>, x: number, y: number, width: number) => {
  const rowHeight = 12;
  const headerHeight = 15;
  
  // Tablo başlığı
  doc.setFillColor(16, 185, 129);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.rect(x, y, width, headerHeight, 'F');
  doc.text('Özellik', x + 5, y + 10);
  doc.text('Değer', x + width/2, y + 10);
  y += headerHeight;
  
  // Veri satırları
  data.forEach((item, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(x, y, width, rowHeight, 'F');
    }
    
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(item.label, x + 5, y + 8);
    
    doc.setFont('helvetica', 'bold');
    doc.text(item.value.toString(), x + width/2, y + 8);
    
    y += rowHeight;
  });
  
  // Tablo çerçevesi
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.rect(x, y - (data.length * rowHeight) - headerHeight, width, (data.length * rowHeight) + headerHeight);
};


/**
 * Profesyonel içindekiler tablosu ekler
 */
const addTableOfContents = (doc: jsPDF, data: StatisticsData) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = margin;
  
  // Başlık
  doc.setTextColor(16, 185, 129);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('İçindekiler', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 30;
  
  // Alt çizgi
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(1);
  doc.line(pageWidth / 2 - 50, yPosition, pageWidth / 2 + 50, yPosition);
  yPosition += 30;
  
  // Bölüm listesi
  const sections = [
    { title: 'Genel Bakış', page: 3 },
    { title: 'Profil Analizi', page: 4 },
    { title: 'Ürün Kategorileri', page: 5 },
    { title: 'Renk Analizi', page: 6 },
    { title: 'Ebat Analizi', page: 7 },
    { title: 'Kombinasyonlar', page: 8 },
    { title: 'İş Emirleri Durumu', page: 9 }
  ];
  
  sections.forEach((section, index) => {
    // Bölüm numarası
    doc.setTextColor(16, 185, 129);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}.`, margin, yPosition);
    
    // Bölüm başlığı
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(section.title, margin + 20, yPosition);
    
    // Sayfa numarası
    doc.setTextColor(107, 114, 128);
    doc.setFont('helvetica', 'normal');
    doc.text(section.page.toString(), pageWidth - margin - 20, yPosition, { align: 'right' });
    
    yPosition += 20;
  });
  
  // Özet bilgiler
  yPosition += 30;
  doc.setTextColor(16, 185, 129);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Rapor Özeti', margin, yPosition);
  yPosition += 20;
  
  const summaryItems = [
    `Toplam Ürün Sayısı: ${data.kesimListesi.toplamUrun}`,
    `Toplam Kategori: ${data.kesimListesi.toplamKategori}`,
    `Toplam İş Emri: ${data.isEmirleri.toplam}`,
    `Tamamlanan İş Emri: ${data.isEmirleri.tamamlanan}`
  ];
  
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  summaryItems.forEach(item => {
    doc.text(`• ${item}`, margin + 10, yPosition);
    yPosition += 15;
  });
};



/**
 * Genel Bakış bölümü oluşturur
 */
const createOverviewSection = (data: StatisticsData): PDFSection => {
  return {
    title: PDF_CONTENT.tr.sections.overview,
    content: [
      { label: PDF_CONTENT.tr.labels.totalItems, value: `${data.kesimListesi.toplamUrun} ${PDF_CONTENT.tr.labels.count}` },
      { label: PDF_CONTENT.tr.labels.totalCategories, value: `${data.kesimListesi.toplamKategori} ${PDF_CONTENT.tr.labels.count}` },
      { label: PDF_CONTENT.tr.labels.averageQuantity, value: data.kesimListesi.ortalamaMiktar },
      { label: PDF_CONTENT.tr.labels.totalWeight, value: `${data.kesimListesi.toplamAgirlik} kg` },
      { label: PDF_CONTENT.tr.labels.completedOrders, value: `${data.isEmirleri.tamamlanan} ${PDF_CONTENT.tr.labels.count}` },
      { label: PDF_CONTENT.tr.labels.pendingOrders, value: `${data.isEmirleri.bekleyen} ${PDF_CONTENT.tr.labels.count}` },
      { label: PDF_CONTENT.tr.labels.totalOrders, value: `${data.isEmirleri.toplam} ${PDF_CONTENT.tr.labels.count}` },
      { label: PDF_CONTENT.tr.labels.averageProcessingTime, value: `${data.isEmirleri.ortalamaIslemSuresi} gün` }
    ]
  };
};

/**
 * Profil Analizi bölümü oluşturur
 */
const createProfilesSection = (data: StatisticsData): PDFSection => {
  return {
    title: PDF_CONTENT.tr.sections.profiles,
    content: data.profilAnalizi.map(profile => ({
      label: `${PDF_CONTENT.tr.labels.profile}: ${profile.name}`,
      value: `${profile.count} ${PDF_CONTENT.tr.labels.count} (${profile.percentage}%)`
    }))
  };
};

/**
 * Ürün Kategorileri bölümü oluşturur
 */
const createCategoriesSection = (data: StatisticsData): PDFSection => {
  return {
    title: PDF_CONTENT.tr.sections.categories,
    content: data.urunKategorileri.map(category => ({
      label: `${PDF_CONTENT.tr.labels.category}: ${category.name}`,
      value: `${category.itemCount} ${PDF_CONTENT.tr.labels.count} (${category.totalQuantity} toplam)`
    }))
  };
};

/**
 * Renk Analizi bölümü oluşturur
 */
const createColorsSection = (data: StatisticsData): PDFSection => {
  return {
    title: PDF_CONTENT.tr.sections.colors,
    content: data.renkEbat.renkler.map(color => ({
      label: `${PDF_CONTENT.tr.labels.color}: ${color.color}`,
      value: `${color.count} ${PDF_CONTENT.tr.labels.count} (${color.percentage}%)`
    }))
  };
};

/**
 * Ebat Analizi bölümü oluşturur
 */
const createSizesSection = (data: StatisticsData): PDFSection => {
  return {
    title: PDF_CONTENT.tr.sections.sizes,
    content: data.renkEbat.ebatlar.map(size => ({
      label: `${PDF_CONTENT.tr.labels.size}: ${size.size}`,
      value: `${size.count} ${PDF_CONTENT.tr.labels.count} (${size.percentage}%)`
    }))
  };
};

/**
 * Kombinasyonlar bölümü oluşturur
 */
const createCombinationsSection = (data: StatisticsData): PDFSection => {
  return {
    title: PDF_CONTENT.tr.sections.combinations,
    content: data.renkEbat.kombinasyonlar.map(combo => ({
      label: `${PDF_CONTENT.tr.labels.combination}: ${combo.combination}`,
      value: `${combo.count} ${PDF_CONTENT.tr.labels.count} (${combo.percentage}%)`
    }))
  };
};

/**
 * İş Emirleri bölümü oluşturur
 */
const createWorkOrdersSection = (data: StatisticsData): PDFSection => {
  return {
    title: PDF_CONTENT.tr.sections.workOrders,
    content: [
      { label: PDF_CONTENT.tr.labels.completedOrders, value: `${data.isEmirleri.tamamlanan} ${PDF_CONTENT.tr.labels.count}` },
      { label: PDF_CONTENT.tr.labels.pendingOrders, value: `${data.isEmirleri.bekleyen} ${PDF_CONTENT.tr.labels.count}` },
      { label: PDF_CONTENT.tr.labels.totalOrders, value: `${data.isEmirleri.toplam} ${PDF_CONTENT.tr.labels.count}` },
      { label: PDF_CONTENT.tr.labels.averageProcessingTime, value: `${data.isEmirleri.ortalamaIslemSuresi} gün` }
    ]
  };
};
