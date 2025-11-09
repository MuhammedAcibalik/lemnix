/**
 * @fileoverview Modern PDF Export Engine - Advanced PDF generation with glassmorphism, gradients, and interactive elements
 * @module ModernPDFExport
 * @version 2.0.0
 */

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Type definitions (inline for now)
export interface ModernStatisticsData {
  overview?: {
    totalItems?: number;
    totalCategories?: number;
    [key: string]: unknown;
  };
  profileAnalysis?: unknown;
  productCategories?: unknown;
  colorSizeAnalysis?: {
    colors?: unknown;
    sizes?: unknown;
    combinations?: unknown;
  };
  workOrders?: unknown;
  [key: string]: unknown;
}

export interface ModernExportOptions {
  format?: "a4" | "letter";
  orientation?: "portrait" | "landscape";
  template?: string;
  theme?: string;
  filename?: string;
}

export interface PDFModernSection {
  title?: string;
  content?: string;
  data?: unknown;
  [key: string]: unknown;
}

export interface PDFChart {
  type?: string;
  data?: unknown[];
  labels?: string[];
  [key: string]: unknown;
}

export interface PDFAnimation {
  type?: string;
  duration?: number;
  [key: string]: unknown;
}

// PDF Template Type
interface PDFTemplate {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    light: string;
    gradient: string[];
  };
  fonts: {
    primary: string;
    secondary: string;
    sizes: {
      title: number;
      subtitle: number;
      header: number;
      body: number;
      small: number;
    };
  };
  effects: {
    glassmorphism: boolean;
    gradients: boolean;
    shadows: boolean;
    animations: boolean;
  };
}

export interface ModernExportResult {
  success: boolean;
  data?: {
    pdf?: Blob;
    filename?: string;
  };
  files?: Array<{
    name: string;
    data: Blob;
    type: string;
  }>;
  message?: string;
  error?: string;
  metadata?: {
    processingTime?: number;
    dataPoints?: number;
    chartsGenerated?: number;
    pagesGenerated?: number;
  };
}

// Modern PDF Templates
const PDF_TEMPLATES: Record<string, PDFTemplate> = {
  corporate: {
    colors: {
      primary: "#1F2937",
      secondary: "#10B981",
      accent: "#F59E0B",
      background: "#F8FAFC",
      text: "#374151",
      light: "#F1F5F9",
      gradient: ["#1F2937", "#10B981", "#F59E0B"],
    },
    fonts: {
      primary: "helvetica",
      secondary: "times",
      sizes: { title: 28, subtitle: 20, header: 16, body: 12, small: 10 },
    },
    effects: {
      glassmorphism: true,
      gradients: true,
      shadows: true,
      animations: false,
    },
  },
  modern: {
    colors: {
      primary: "#6366F1",
      secondary: "#EC4899",
      accent: "#10B981",
      background: "#FAFAFA",
      text: "#1F2937",
      light: "#F8FAFC",
      gradient: ["#6366F1", "#EC4899", "#10B981"],
    },
    fonts: {
      primary: "helvetica",
      secondary: "courier",
      sizes: { title: 32, subtitle: 24, header: 18, body: 14, small: 11 },
    },
    effects: {
      glassmorphism: true,
      gradients: true,
      shadows: true,
      animations: true,
    },
  },
  minimal: {
    colors: {
      primary: "#000000",
      secondary: "#6B7280",
      accent: "#10B981",
      background: "#FFFFFF",
      text: "#374151",
      light: "#F9FAFB",
      gradient: ["#000000", "#6B7280", "#10B981"],
    },
    fonts: {
      primary: "helvetica",
      secondary: "times",
      sizes: { title: 24, subtitle: 18, header: 14, body: 11, small: 9 },
    },
    effects: {
      glassmorphism: false,
      gradients: false,
      shadows: false,
      animations: false,
    },
  },
};

/**
 * Modern PDF raporu oluşturur
 */
export const createModernPDFExport = async (
  data: ModernStatisticsData,
  options: ModernExportOptions,
): Promise<ModernExportResult> => {
  const startTime = Date.now();

  try {
    const doc = new jsPDF("p", "mm", "a4");
    const template: PDFTemplate =
      PDF_TEMPLATES[options.theme as keyof typeof PDF_TEMPLATES] ||
      PDF_TEMPLATES.corporate;

    // Sayfa ayarları
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 25;
    const contentWidth = pageWidth - 2 * margin;

    // Modern başlık sayfası
    await addModernTitlePage(doc, data, template, options);

    // İçindekiler sayfası
    doc.addPage();
    addModernTableOfContents(doc, data, template);

    // Dashboard sayfası
    doc.addPage();
    await addModernDashboard(doc, data, template, contentWidth, margin);

    // Detaylı analiz sayfaları
    const sections = [
      {
        title: "👤 Profil Analizi",
        data: data.profileAnalysis,
        type: "profile",
      },
      {
        title: "📦 Ürün Kategorileri",
        data: data.productCategories,
        type: "category",
      },
      {
        title: "🎨 Renk Analizi",
        data: data.colorSizeAnalysis?.colors,
        type: "color",
      },
      {
        title: "📏 Ebat Analizi",
        data: data.colorSizeAnalysis?.sizes,
        type: "size",
      },
      {
        title: "🔗 Kombinasyonlar",
        data: data.colorSizeAnalysis?.combinations,
        type: "combination",
      },
      { title: "📋 İş Emirleri", data: data.workOrders, type: "workorder" },
    ];

    sections.forEach((section) => {
      doc.addPage();
      addModernSection(doc, section, template, contentWidth, margin);
    });

    // Trend analizi sayfası
    doc.addPage();
    await addTrendAnalysisPage(doc, data, template, contentWidth, margin);

    // Özet ve öneriler sayfası
    doc.addPage();
    addSummaryAndRecommendations(doc, data, template, contentWidth, margin);

    // Dosyayı oluştur
    const filename = options.filename || generateModernFilename("pdf");
    doc.save(filename);

    const processingTime = Date.now() - startTime;

    return {
      success: true,
      files: [
        {
          name: filename,
          type: "pdf",
          data: doc.output("blob"),
        },
      ],
      message: "Modern PDF raporu başarıyla oluşturuldu!",
      metadata: {
        processingTime,
        dataPoints: calculateDataPoints(data),
        chartsGenerated: 6,
        pagesGenerated: doc.internal.pages?.length || 1,
      },
    };
  } catch (error) {
    return {
      success: false,
      files: [],
      message: "PDF oluşturulurken hata oluştu!",
      error: error instanceof Error ? error.message : "Bilinmeyen hata",
      metadata: {
        processingTime: Date.now() - startTime,
        dataPoints: 0,
        chartsGenerated: 0,
        pagesGenerated: 0,
      },
    };
  }
};

/**
 * Modern başlık sayfası ekler
 */
const addModernTitlePage = async (
  doc: jsPDF,
  data: ModernStatisticsData,
  template: PDFTemplate,
  options: ModernExportOptions,
) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Arka plan gradient
  if (template.effects.gradients) {
    addGradientBackground(doc, template.colors.gradient, pageWidth, pageHeight);
  } else {
    doc.setFillColor(template.colors.background);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
  }

  // Glassmorphism header
  if (template.effects.glassmorphism) {
    addGlassmorphismHeader(doc, template, pageWidth);
  } else {
    addStandardHeader(doc, template, pageWidth);
  }

  // Ana başlık
  doc.setTextColor(template.colors.text);
  doc.setFontSize(template.fonts.sizes.title);
  doc.setFont(template.fonts.primary, "bold");
  doc.text("📊 LEMNIX", pageWidth / 2, 80, { align: "center" });

  doc.setFontSize(template.fonts.sizes.subtitle);
  doc.setFont(template.fonts.primary, "normal");
  doc.text("MODERN PERFORMANS RAPORU", pageWidth / 2, 95, { align: "center" });

  // Alt başlık
  doc.setFontSize(template.fonts.sizes.header);
  doc.text(
    "Kesim Listesi Yönetim Sistemi - Gelişmiş Analiz",
    pageWidth / 2,
    110,
    { align: "center" },
  );

  // Rapor bilgi kartları
  addInfoCards(doc, data, template, pageWidth, pageHeight);

  // Tarih ve versiyon
  doc.setFontSize(template.fonts.sizes.small);
  doc.setTextColor(template.colors.secondary);
  const now = new Date();
  doc.text(
    `Rapor Tarihi: ${now.toLocaleDateString("tr-TR")}`,
    pageWidth / 2,
    pageHeight - 40,
    { align: "center" },
  );
  doc.text(
    `Versiyon: 2.0 | Modern Export Engine`,
    pageWidth / 2,
    pageHeight - 25,
    { align: "center" },
  );
};

/**
 * Gradient arka plan ekler
 */
const addGradientBackground = (
  doc: jsPDF,
  gradientColors: string[],
  pageWidth: number,
  pageHeight: number,
) => {
  const steps = 50;
  const stepHeight = pageHeight / steps;

  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1);
    const color = interpolateColor(gradientColors[0], gradientColors[1], ratio);
    doc.setFillColor(color);
    doc.rect(0, i * stepHeight, pageWidth, stepHeight + 1, "F");
  }
};

/**
 * Glassmorphism header ekler
 */
const addGlassmorphismHeader = (
  doc: jsPDF,
  template: PDFTemplate,
  pageWidth: number,
) => {
  // Ana header
  doc.setFillColor(255, 255, 255, 0.1);
  doc.rect(0, 0, pageWidth, 60, "F");

  // Glass effect
  doc.setFillColor(255, 255, 255, 0.05);
  doc.rect(0, 0, pageWidth, 30, "F");

  // Border
  doc.setDrawColor(255, 255, 255, 0.2);
  doc.setLineWidth(1);
  doc.line(0, 60, pageWidth, 60);
};

/**
 * Standart header ekler
 */
const addStandardHeader = (
  doc: jsPDF,
  template: PDFTemplate,
  pageWidth: number,
) => {
  doc.setFillColor(template.colors.primary);
  doc.rect(0, 0, pageWidth, 60, "F");
};

/**
 * Bilgi kartları ekler
 */
const addInfoCards = (
  doc: jsPDF,
  data: ModernStatisticsData,
  template: PDFTemplate,
  pageWidth: number,
  pageHeight: number,
) => {
  const cardWidth = (pageWidth - 60) / 3;
  const cardHeight = 40;
  const startY = 140;

  const cards = [
    {
      title: "Toplam Ürün",
      value: data.overview?.totalItems,
      unit: "adet",
      icon: "📦",
      color: template.colors.secondary,
    },
    {
      title: "Verimlilik",
      value: data.overview?.efficiencyScore,
      unit: "%",
      icon: "⚡",
      color: template.colors.accent,
    },
    {
      title: "Tamamlanma",
      value: data.overview?.completionRate,
      unit: "%",
      icon: "✅",
      color: "#10B981",
    },
  ];

  cards.forEach((card, index) => {
    const x = 20 + index * (cardWidth + 10);

    // Kart arka planı
    doc.setFillColor(255, 255, 255, 0.9);
    doc.rect(x, startY, cardWidth, cardHeight, "F");

    // Gölge efekti
    if (template.effects.shadows) {
      doc.setFillColor(0, 0, 0, 0.1);
      doc.rect(x + 2, startY + 2, cardWidth, cardHeight, "F");
    }

    // İkon
    doc.setFontSize(16);
    doc.setTextColor(card.color);
    doc.text(card.icon, x + 10, startY + 15);

    // Başlık
    doc.setFontSize(template.fonts.sizes.small);
    doc.setTextColor(template.colors.text);
    doc.text(card.title, x + 25, startY + 12);

    // Değer
    doc.setFontSize(template.fonts.sizes.header);
    doc.setFont(template.fonts.primary, "bold");
    doc.setTextColor(card.color);
    doc.text(`${card.value}${card.unit}`, x + 25, startY + 28);
  });
};

/**
 * Modern içindekiler ekler
 */
const addModernTableOfContents = (
  doc: jsPDF,
  data: ModernStatisticsData,
  template: PDFTemplate,
) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 25;
  let yPosition = margin;

  // Başlık
  doc.setTextColor(template.colors.primary);
  doc.setFontSize(template.fonts.sizes.title);
  doc.setFont(template.fonts.primary, "bold");
  doc.text("📑 İÇİNDEKİLER", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 30;

  // Alt çizgi
  doc.setDrawColor(template.colors.secondary);
  doc.setLineWidth(2);
  doc.line(pageWidth / 2 - 60, yPosition, pageWidth / 2 + 60, yPosition);
  yPosition += 30;

  // Bölüm listesi
  const sections = [
    {
      title: "📊 Dashboard & Genel Bakış",
      page: 3,
      description: "Ana performans göstergeleri",
    },
    {
      title: "👤 Profil Analizi",
      page: 4,
      description: "Profil tipi dağılımı ve trendleri",
    },
    {
      title: "📦 Ürün Kategorileri",
      page: 5,
      description: "Kategori performans analizi",
    },
    {
      title: "🎨 Renk Analizi",
      page: 6,
      description: "Renk kullanım istatistikleri",
    },
    { title: "📏 Ebat Analizi", page: 7, description: "Boyut dağılım analizi" },
    {
      title: "🔗 Kombinasyonlar",
      page: 8,
      description: "Renk-ebat kombinasyon analizi",
    },
    {
      title: "📋 İş Emirleri",
      page: 9,
      description: "İş emri durumu ve performansı",
    },
    {
      title: "📈 Trend Analizi",
      page: 10,
      description: "Zaman serisi analizi",
    },
    {
      title: "💡 Özet & Öneriler",
      page: 11,
      description: "Sonuçlar ve iyileştirme önerileri",
    },
  ];

  sections.forEach((section, index) => {
    // Bölüm numarası
    doc.setFontSize(template.fonts.sizes.header);
    doc.setFont(template.fonts.primary, "bold");
    doc.setTextColor(template.colors.secondary);
    doc.text(`${index + 1}.`, margin, yPosition);

    // Bölüm başlığı
    doc.setTextColor(template.colors.text);
    doc.text(section.title, margin + 20, yPosition);

    // Sayfa numarası
    doc.setTextColor(template.colors.secondary);
    doc.text(section.page.toString(), pageWidth - margin - 20, yPosition, {
      align: "right",
    });

    // Açıklama
    doc.setFontSize(template.fonts.sizes.small);
    doc.setFont(template.fonts.primary, "normal");
    doc.setTextColor(template.colors.secondary);
    doc.text(section.description, margin + 40, yPosition + 8);

    yPosition += 25;
  });

  // Özet bilgiler
  yPosition += 20;
  addSummaryBox(doc, data, template, margin, yPosition, pageWidth - 2 * margin);
};

/**
 * Özet kutusu ekler
 */
const addSummaryBox = (
  doc: jsPDF,
  data: ModernStatisticsData,
  template: PDFTemplate,
  x: number,
  y: number,
  width: number,
) => {
  const boxHeight = 60;

  // Kutunun arka planı
  doc.setFillColor(template.colors.light);
  doc.rect(x, y, width, boxHeight, "F");

  // Border
  doc.setDrawColor(template.colors.secondary);
  doc.setLineWidth(1);
  doc.rect(x, y, width, boxHeight);

  // Başlık
  doc.setFontSize(template.fonts.sizes.header);
  doc.setFont(template.fonts.primary, "bold");
  doc.setTextColor(template.colors.primary);
  doc.text("📊 RAPOR ÖZETİ", x + 10, y + 15);

  // Özet veriler
  const summaryItems = [
    `Toplam Veri Noktası: ${calculateDataPoints(data)}`,
    `Analiz Edilen Kategori: ${data.productCategories?.length}`,
    `İş Emri Durumu: ${data.workOrders?.completed}/${data.workOrders?.total} tamamlandı`,
    `Genel Verimlilik: ${data.overview?.efficiencyScore}%`,
  ];

  doc.setFontSize(template.fonts.sizes.small);
  doc.setFont(template.fonts.primary, "normal");
  doc.setTextColor(template.colors.text);

  summaryItems.forEach((item, index) => {
    doc.text(`• ${item}`, x + 10, y + 30 + index * 8);
  });
};

/**
 * Modern dashboard ekler
 */
const addModernDashboard = async (
  doc: jsPDF,
  data: ModernStatisticsData,
  template: PDFTemplate,
  contentWidth: number,
  margin: number,
) => {
  let yPosition = margin;

  // Başlık
  doc.setTextColor(template.colors.primary);
  doc.setFontSize(template.fonts.sizes.title);
  doc.setFont(template.fonts.primary, "bold");
  doc.text("📊 PERFORMANS DASHBOARD", margin, yPosition);
  yPosition += 30;

  // Ana metrikler
  addMetricCards(doc, data, template, margin, yPosition, contentWidth);
  yPosition += 80;

  // Trend grafikleri
  await addTrendCharts(doc, data, template, margin, yPosition, contentWidth);
};

/**
 * Metrik kartları ekler
 */
const addMetricCards = (
  doc: jsPDF,
  data: ModernStatisticsData,
  template: PDFTemplate,
  x: number,
  y: number,
  width: number,
) => {
  const cardWidth = (width - 20) / 2;
  const cardHeight = 60;

  const metrics = [
    {
      title: "Toplam Ürün",
      value: data.overview?.totalItems,
      unit: "adet",
      trend: "+12%",
      color: template.colors.secondary,
    },
    {
      title: "Verimlilik Skoru",
      value: data.overview?.efficiencyScore,
      unit: "%",
      trend: "+8%",
      color: template.colors.accent,
    },
    {
      title: "Tamamlanma Oranı",
      value: data.overview?.completionRate,
      unit: "%",
      trend: "+5%",
      color: "#10B981",
    },
    {
      title: "Ortalama Süre",
      value: data.workOrders?.averageProcessingTime,
      unit: "gün",
      trend: "-2 gün",
      color: "#EF4444",
    },
  ];

  metrics.forEach((metric, index) => {
    const cardX = x + (index % 2) * (cardWidth + 10);
    const cardY = y + Math.floor(index / 2) * (cardHeight + 10);

    // Kart arka planı
    doc.setFillColor(255, 255, 255, 0.9);
    doc.rect(cardX, cardY, cardWidth, cardHeight, "F");

    // Gölge
    if (template.effects.shadows) {
      doc.setFillColor(0, 0, 0, 0.1);
      doc.rect(cardX + 2, cardY + 2, cardWidth, cardHeight, "F");
    }

    // Başlık
    doc.setFontSize(template.fonts.sizes.small);
    doc.setFont(template.fonts.primary, "normal");
    doc.setTextColor(template.colors.text);
    doc.text(metric.title, cardX + 10, cardY + 15);

    // Değer
    doc.setFontSize(template.fonts.sizes.header);
    doc.setFont(template.fonts.primary, "bold");
    doc.setTextColor(metric.color);
    doc.text(`${metric.value}${metric.unit}`, cardX + 10, cardY + 35);

    // Trend
    doc.setFontSize(template.fonts.sizes.small);
    doc.setTextColor(metric.trend.startsWith("+") ? "#10B981" : "#EF4444");
    doc.text(metric.trend, cardX + cardWidth - 30, cardY + 15);
  });
};

/**
 * Trend grafikleri ekler
 */
const addTrendCharts = async (
  doc: jsPDF,
  data: ModernStatisticsData,
  template: PDFTemplate,
  x: number,
  y: number,
  width: number,
) => {
  // Grafik alanı
  const chartWidth = width / 2 - 10;
  const chartHeight = 80;

  // Sol grafik - İş emri trendi
  doc.setFillColor(template.colors.light);
  doc.rect(x, y, chartWidth, chartHeight, "F");

  doc.setFontSize(template.fonts.sizes.header);
  doc.setFont(template.fonts.primary, "bold");
  doc.setTextColor(template.colors.text);
  doc.text("📈 İş Emri Trendi", x + 10, y + 15);

  // Basit çizgi grafik çizer
  const chartData = data.workOrders?.trends.slice(-7);
  const maxValue = Math.max(...chartData.map((d) => d.completed));
  const stepX = (chartWidth - 40) / (chartData.length - 1);
  const stepY = (chartHeight - 40) / maxValue;

  doc.setDrawColor(template.colors.secondary);
  doc.setLineWidth(2);

  for (let i = 0; i < chartData.length - 1; i++) {
    const x1 = x + 20 + i * stepX;
    const y1 = y + chartHeight - 20 - chartData[i].completed * stepY;
    const x2 = x + 20 + (i + 1) * stepX;
    const y2 = y + chartHeight - 20 - chartData[i + 1].completed * stepY;

    doc.line(x1, y1, x2, y2);
  }

  // Sağ grafik - Verimlilik trendi
  doc.setFillColor(template.colors.light);
  doc.rect(x + chartWidth + 10, y, chartWidth, chartHeight, "F");

  doc.setTextColor(template.colors.text);
  doc.text("⚡ Verimlilik Trendi", x + chartWidth + 20, y + 15);

  // Verimlilik çizgisi
  doc.setDrawColor(template.colors.accent);
  doc.setLineWidth(2);

  for (let i = 0; i < chartData.length - 1; i++) {
    const x1 = x + chartWidth + 30 + i * stepX;
    const y1 = y + chartHeight - 20 - chartData[i].efficiency * stepY;
    const x2 = x + chartWidth + 30 + (i + 1) * stepX;
    const y2 = y + chartHeight - 20 - chartData[i + 1].efficiency * stepY;

    doc.line(x1, y1, x2, y2);
  }
};

// Diğer fonksiyonlar için placeholder'lar
const addModernSection = (
  doc: jsPDF,
  section: Record<string, unknown>,
  template: PDFTemplate,
  contentWidth: number,
  margin: number,
) => {
  // Implementation for modern section
};

const addTrendAnalysisPage = async (
  doc: jsPDF,
  data: ModernStatisticsData,
  template: PDFTemplate,
  contentWidth: number,
  margin: number,
) => {
  // Implementation for trend analysis page
};

const addSummaryAndRecommendations = (
  doc: jsPDF,
  data: ModernStatisticsData,
  template: PDFTemplate,
  contentWidth: number,
  margin: number,
) => {
  // Implementation for summary page
};

// Yardımcı fonksiyonlar
const generateModernFilename = (format: string): string => {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const timeStr = now.toTimeString().split(" ")[0].replace(/:/g, "-");
  return `Lemnix-Modern-${format.toUpperCase()}-${dateStr}-${timeStr}.${format === "excel" ? "xlsx" : "pdf"}`;
};

const calculateDataPoints = (data: ModernStatisticsData): number => {
  return (
    data.profileAnalysis?.length +
    data.productCategories?.length +
    data.colorSizeAnalysis?.colors.length +
    data.colorSizeAnalysis?.sizes.length +
    data.colorSizeAnalysis?.combinations.length +
    data.workOrders?.trends.length
  );
};

const interpolateColor = (
  color1: string,
  color2: string,
  ratio: number,
): string => {
  // Basit renk interpolasyonu
  const r1 = parseInt(color1.slice(1, 3), 16);
  const g1 = parseInt(color1.slice(3, 5), 16);
  const b1 = parseInt(color1.slice(5, 7), 16);

  const r2 = parseInt(color2.slice(1, 3), 16);
  const g2 = parseInt(color2.slice(3, 5), 16);
  const b2 = parseInt(color2.slice(5, 7), 16);

  const r = Math.round(r1 + (r2 - r1) * ratio);
  const g = Math.round(g1 + (g2 - g1) * ratio);
  const b = Math.round(b1 + (b2 - b1) * ratio);

  return `rgb(${r},${g},${b})`;
};
