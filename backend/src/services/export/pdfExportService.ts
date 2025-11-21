/**
 * @fileoverview Enterprise-Grade Professional PDF Export Service
 * @module PDFExportService
 * @version 5.0.0 - Complete Professional Redesign
 *
 * Bu servis, kesim listelerini profesyonel iş emri belgelerine dönüştürür.
 * Modern tasarım, mükemmel sayfa sığma ve enterprise-grade hata yönetimi sağlar.
 */

import puppeteer, { Browser, Page } from "puppeteer";

// ============================================================================
// ENTERPRISE TYPE DEFINITIONS
// ============================================================================

/**
 * Profil öğesi - Kesim listesindeki her bir profil parçası
 */
interface ProfileItem {
  readonly id: string;
  readonly profile?: string;
  readonly measurement: string;
  readonly quantity: number;
}

/**
 * Kesim listesi öğesi - İş emri bazında gruplandırılmış profil öğeleri
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
 * Ürün bölümü - Aynı ürün kategorisindeki kesim listesi öğeleri
 */
interface ProductSection {
  readonly id: string;
  readonly name?: string;
  readonly productName?: string;
  readonly items: ReadonlyArray<CuttingListItem>;
}

/**
 * Kesim listesi - Ana veri yapısı
 */
interface CuttingList {
  readonly id: string;
  readonly title: string;
  readonly weekNumber: number;
  readonly sections: ReadonlyArray<ProductSection>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * PDF oluşturma seçenekleri
 */
interface PDFGenerationOptions {
  readonly format: "A4" | "A3" | "Letter";
  readonly margin: {
    readonly top: string;
    readonly right: string;
    readonly bottom: string;
    readonly left: string;
  };
  readonly printBackground: boolean;
  readonly scale: number;
  readonly landscape: boolean;
  readonly timeout: number;
}

/**
 * HTML oluşturma seçenekleri
 */
interface HTMLGenerationOptions {
  readonly includeHeader: boolean;
  readonly includeFooter: boolean;
  readonly showMeasurements: boolean;
  readonly showColors: boolean;
  readonly showWaste: boolean;
  readonly colorScheme: "material" | "monochrome" | "corporate";
}

/**
 * PDF export sonucu
 */
interface PDFExportResult {
  readonly buffer: Buffer;
  readonly size: number;
  readonly generationTime: number;
  readonly pageCount: number;
  readonly isValid: boolean;
}

/**
 * Hata türleri
 */
enum PDFExportErrorType {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  BROWSER_ERROR = "BROWSER_ERROR",
  HTML_GENERATION_ERROR = "HTML_GENERATION_ERROR",
  PDF_GENERATION_ERROR = "PDF_GENERATION_ERROR",
  RESOURCE_ERROR = "RESOURCE_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
}

/**
 * Özelleştirilmiş hata sınıfı
 */
class PDFExportError extends Error {
  public readonly type: PDFExportErrorType;
  public readonly context: Record<string, unknown>;
  public readonly timestamp: string;

  constructor(
    type: PDFExportErrorType,
    message: string,
    context: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "PDFExportError";
    this.type = type;
    this.context = context;
    this.timestamp = new Date().toISOString();
  }
}

// ============================================================================
// ENTERPRISE PDF EXPORT SERVICE
// ============================================================================

/**
 * Enterprise-Grade Professional PDF Export Service
 *
 * Bu servis, kesim listelerini profesyonel iş emri belgelerine dönüştürür.
 * Modern tasarım, mükemmel sayfa sığma ve enterprise-grade hata yönetimi sağlar.
 */
export class PDFExportService {
  private static instance: PDFExportService | null = null;
  private browser: Browser | null = null;
  private isInitialized = false;
  private readonly defaultTimeout = 30000;

  // Profesyonel PDF oluşturma seçenekleri
  private readonly defaultPDFOptions: PDFGenerationOptions = {
    format: "A4",
    margin: {
      top: "5mm",
      right: "5mm",
      bottom: "5mm",
      left: "5mm",
    },
    printBackground: true,
    scale: 1.0,
    landscape: true,
    timeout: 45000,
  };

  // Modern HTML oluşturma seçenekleri
  private readonly defaultHTMLOptions: HTMLGenerationOptions = {
    includeHeader: true,
    includeFooter: true,
    showMeasurements: true,
    showColors: true,
    showWaste: true,
    colorScheme: "corporate",
  };

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Singleton instance getter
   */
  public static getInstance(): PDFExportService {
    if (!PDFExportService.instance) {
      PDFExportService.instance = new PDFExportService();
    }
    return PDFExportService.instance;
  }

  /**
   * Ana PDF export metodu
   */
  public async exportToPDF(
    cuttingList: CuttingList,
    options?: Partial<PDFGenerationOptions>,
  ): Promise<PDFExportResult> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    console.log(
      `[PDFExport:${requestId}] Starting professional PDF export for: ${cuttingList.title}`,
    );

    try {
      // 1. Input validation
      this.validateCuttingList(cuttingList);
      console.log(`[PDFExport:${requestId}] Input validation passed`);

      // 2. Browser initialization
      await this.initializeBrowser();
      console.log(`[PDFExport:${requestId}] Browser initialized`);

      // 3. Professional HTML content generation
      const htmlContent = this.generateProfessionalHTMLContent(cuttingList);
      console.log(
        `[PDFExport:${requestId}] Professional HTML content generated, length: ${htmlContent.length}`,
      );

      // 4. PDF generation with optimized settings
      const pdfOptions = {
        ...this.defaultPDFOptions,
        ...options,
      };
      console.log(`[PDFExport:${requestId}] Using professional PDF options`);
      const pdfBuffer = await this.generatePDF(
        htmlContent,
        pdfOptions,
        requestId,
      );
      console.log(
        `[PDFExport:${requestId}] Professional PDF generated, size: ${pdfBuffer.length} bytes`,
      );

      // 5. Validation
      this.validatePDFBuffer(pdfBuffer);

      const generationTime = Date.now() - startTime;
      console.log(
        `[PDFExport:${requestId}] Professional PDF export completed successfully in ${generationTime}ms`,
      );

      return {
        buffer: pdfBuffer,
        size: pdfBuffer.length,
        generationTime,
        pageCount: 1,
        isValid: true,
      };
    } catch (error) {
      const generationTime = Date.now() - startTime;
      console.error(
        `[PDFExport:${requestId}] Professional PDF export failed after ${generationTime}ms:`,
        error,
      );

      if (error instanceof PDFExportError) {
        throw error;
      }

      throw new PDFExportError(
        PDFExportErrorType.PDF_GENERATION_ERROR,
        `Professional PDF export failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        { requestId, generationTime, cuttingListId: cuttingList.id },
      );
    }
  }

  /**
   * Browser instance'ını başlatır
   */
  private async initializeBrowser(): Promise<void> {
    if (this.isInitialized && this.browser) {
      console.log("[PDFExport] Browser already initialized, reusing instance");
      return;
    }

    try {
      console.log("[PDFExport] Initializing professional browser...");

      const launchOptions = {
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-web-security",
          "--hide-scrollbars",
          "--disable-background-networking",
          "--disable-default-apps",
          "--disable-extensions",
          "--disable-sync",
          "--disable-translate",
          "--no-first-run",
        ],
        timeout: this.defaultTimeout,
        protocolTimeout: this.defaultTimeout,
        defaultViewport: {
          width: 1200,
          height: 900,
          deviceScaleFactor: 1,
        },
      };

      this.browser = await puppeteer.launch(launchOptions);
      this.isInitialized = true;

      console.log("[PDFExport] Professional browser initialized successfully");

      const version = await this.browser.version();
      console.log(`[PDFExport] Browser version: ${version}`);
    } catch (error) {
      console.error("[PDFExport] Browser initialization failed:", error);
      throw new PDFExportError(
        PDFExportErrorType.BROWSER_ERROR,
        `Browser initialization failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        { originalError: error },
      );
    }
  }

  /**
   * Work Order kartı oluşturur
   */
  private generateWorkOrderCard(
    item: CuttingListItem,
    escapeHtml: (text: string) => string,
  ): string {
    let cardHtml = `
        <div class="work-order-card">
            <div class="work-order-header">
                İŞ EMRİ: ${escapeHtml(item.workOrderId)}
            </div>
            <div class="work-order-content">
                <div class="order-details-grid">
                    <div class="detail-row">
                        <span class="detail-label">Versiyon</span>
                        <span class="detail-value">${escapeHtml(item.version || "-")}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Renk</span>
                        <span class="detail-value">${escapeHtml(item.color)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Ebat</span>
                        <span class="detail-value">${escapeHtml(item.size)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Sipariş Adedi</span>
                        <span class="detail-value">${item.orderQuantity}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Tarih</span>
                        <span class="detail-value">${escapeHtml(item.date)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Not</span>
                        <span class="detail-value">${escapeHtml(item.note || "-")}</span>
                    </div>
                </div>`;

    // Profiles Section
    if (item.profiles && item.profiles.length > 0) {
      cardHtml += `
                <div class="profiles-section">
                    <div class="profiles-header">Profil Detayları</div>
                    <table class="profiles-table">
                        <thead>
                            <tr>
                                <th>Profil Tipi</th>
                                <th>Ölçü</th>
                                <th>Adet</th>
                            </tr>
                        </thead>
                        <tbody>`;

      item.profiles.forEach((profile) => {
        cardHtml += `
                            <tr>
                                <td>${escapeHtml(profile.profile || "Belirtilmemiş")}</td>
                                <td>${escapeHtml(profile.measurement || "-")}</td>
                                <td class="quantity-cell">${profile.quantity || 0}</td>
                            </tr>`;
      });

      cardHtml += `
                        </tbody>
                    </table>
                </div>`;
    }

    cardHtml += `
            </div>
        </div>`;

    return cardHtml;
  }

  /**
   * Profesyonel HTML içeriği oluşturur
   */
  private generateProfessionalHTMLContent(
    cuttingList: CuttingList,
    options?: Partial<HTMLGenerationOptions>,
  ): string {
    const htmlOptions = { ...this.defaultHTMLOptions, ...options };
    const currentDate = new Date().toLocaleDateString("tr-TR");

    const escapeHtml = (text: string): string => {
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    };

    // Tüm iş emirlerini topla
    const allWorkOrders: CuttingListItem[] = [];
    cuttingList.sections.forEach((section) => {
      if (section.items && section.items.length > 0) {
        allWorkOrders.push(...section.items);
      }
    });

    let html = `
<!DOCTYPE html>
<html lang="tr" xml:lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(cuttingList.title)}</title>
    <style>
        @page {
            size: A4 landscape;
            margin: 5mm;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 11px;
            line-height: 1.4;
            color: #2c3e50;
            background: white;
            padding: 8px;
        }
        
        .document-header {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            padding: 12px 20px;
            margin-bottom: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .document-header h1 {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 6px;
            letter-spacing: 0.5px;
        }
        
        .document-info {
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            opacity: 0.9;
        }
        
        .work-orders-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 10px;
            align-items: start;
        }
        
        .work-order-card {
            background: white;
            border: 1px solid #dce7f0;
            border-radius: 6px;
            overflow: hidden;
            box-shadow: 0 2px 6px rgba(0,0,0,0.05);
            break-inside: avoid;
            page-break-inside: avoid;
            margin-bottom: 0;
        }
        
        .work-order-header {
            background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
            color: white;
            padding: 8px 12px;
            font-weight: 700;
            font-size: 11px;
            letter-spacing: 0.2px;
        }
        
        .work-order-content {
            padding: 10px 12px;
        }
        
        .order-details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4px 8px;
            margin-bottom: 8px;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 2px 0;
            border-bottom: 1px solid #f0f3f6;
            font-size: 9px;
        }
        
        .detail-label {
            font-weight: 600;
            color: #7f8c8d;
            font-size: 8px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        
        .detail-value {
            font-weight: 700;
            color: #2c3e50;
            font-size: 9px;
        }
        
        .profiles-section {
            margin-top: 8px;
        }
        
        .profiles-header {
            background: #f8f9fa;
            padding: 6px 10px;
            border-left: 3px solid #3498db;
            margin-bottom: 6px;
            font-weight: 700;
            color: #2c3e50;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.2px;
        }
        
        .profiles-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8px;
            table-layout: fixed;
        }
        
        .profiles-table th:nth-child(1) { width: 40%; }
        .profiles-table th:nth-child(2) { width: 35%; }
        .profiles-table th:nth-child(3) { width: 25%; }
        
        .profiles-table thead {
            background: #34495e;
            color: white;
        }
        
        .profiles-table th {
            padding: 6px 8px;
            text-align: left;
            font-weight: 700;
            font-size: 8px;
            text-transform: uppercase;
            letter-spacing: 0.2px;
        }
        
        .profiles-table th:last-child {
            text-align: center;
        }
        
        .profiles-table td {
            padding: 4px 8px;
            border-bottom: 1px solid #f0f3f6;
            font-weight: 500;
            font-size: 8px;
            vertical-align: middle;
        }
        
        .profiles-table tbody tr:hover {
            background: #f8f9fa;
        }
        
        .profiles-table tbody tr:nth-child(even) {
            background: #fafbfc;
        }
        
        .quantity-cell {
            text-align: center !important;
            font-weight: 700;
            color: #e74c3c;
            padding: 4px 8px !important;
        }
        
        .document-footer {
            margin-top: 10px;
            padding: 8px 15px;
            background: #f8f9fa;
            border-radius: 6px;
            text-align: center;
            font-size: 8px;
            color: #7f8c8d;
        }
        
        @media print {
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            .work-order-card {
                break-inside: avoid;
                page-break-inside: avoid;
            }
            
            .work-orders-container {
                break-inside: auto;
            }
        }
    </style>
</head>
<body>
`;

    // Document Header
    if (htmlOptions.includeHeader) {
      html += `
    <div class="document-header">
        <h1>${escapeHtml(cuttingList.title)}</h1>
        <div class="document-info">
            <div>
            <strong>Hafta:</strong> ${cuttingList.weekNumber} | 
                <strong>Tarih:</strong> ${currentDate}
            </div>
            <div>
                <strong>Belge ID:</strong> ${escapeHtml(cuttingList.id)}
            </div>
        </div>
    </div>
`;
    }

    // Work Orders Container - CSS Grid Layout
    html += `<div class="work-orders-container">`;

    // Tüm kartları doğrudan ekle - CSS Grid otomatik olarak 2 sütuna yerleştirecek
    allWorkOrders.forEach((item) => {
      html += this.generateWorkOrderCard(item, escapeHtml);
    });

    html += `</div>`;

    // Document Footer
    if (htmlOptions.includeFooter) {
      html += `
    <div class="document-footer">
        <p>Bu belge ${currentDate} tarihinde LEMNİX Kesim Planlama Sistemi tarafından oluşturulmuştur.</p>
    </div>
`;
    }

    html += `
</body>
</html>`;

    return html;
  }

  /**
   * PDF oluşturur
   */
  private async generatePDF(
    htmlContent: string,
    options: PDFGenerationOptions,
    requestId: string,
  ): Promise<Buffer> {
    if (!this.browser) {
      throw new PDFExportError(
        PDFExportErrorType.BROWSER_ERROR,
        "Browser not initialized",
        { requestId },
      );
    }

    let page: Page | null = null;

    try {
      console.log(`[PDFExport:${requestId}] Creating professional page...`);
      page = await this.browser.newPage();

      // Professional page configuration
      await page.setViewport({
        width: 1200,
        height: 900,
        deviceScaleFactor: 1,
      });
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      );
      await page.emulateMediaType("print");
      console.log(`[PDFExport:${requestId}] Professional page configured`);

      // Set content
      console.log(`[PDFExport:${requestId}] Setting professional content...`);
      await page.setContent(htmlContent, {
        waitUntil: "networkidle0",
        timeout: 20000,
      });

      // Wait for rendering
      await page.waitForFunction('document.readyState === "complete"', {
        timeout: 15000,
      });
      await page.waitForSelector(".work-orders-container", { timeout: 10000 });
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log(
        `[PDFExport:${requestId}] Professional content rendering completed`,
      );

      // Generate professional PDF
      console.log(`[PDFExport:${requestId}] Generating professional PDF...`);
      const pdfBuffer = await page.pdf({
        format: options.format,
        margin: options.margin,
        printBackground: options.printBackground,
        landscape: options.landscape,
        scale: options.scale,
        timeout: options.timeout,
        displayHeaderFooter: false,
        preferCSSPageSize: false,
      });

      console.log(
        `[PDFExport:${requestId}] Professional PDF generated successfully`,
      );
      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error(
        `[PDFExport:${requestId}] Professional PDF generation failed:`,
        error,
      );
      throw new PDFExportError(
        PDFExportErrorType.PDF_GENERATION_ERROR,
        `Professional PDF generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        { requestId, error },
      );
    } finally {
      if (page) {
        try {
          await page.close();
          console.log(
            `[PDFExport:${requestId}] Professional page closed successfully`,
          );
        } catch (closeError) {
          console.warn(
            `[PDFExport:${requestId}] Failed to close page gracefully:`,
            closeError,
          );
        }
      }
    }
  }

  /**
   * Kesim listesi verilerini doğrular
   */
  private validateCuttingList(cuttingList: CuttingList): void {
    if (!cuttingList) {
      throw new PDFExportError(
        PDFExportErrorType.VALIDATION_ERROR,
        "Cutting list is required",
      );
    }

    if (!cuttingList.title || cuttingList.title.trim() === "") {
      throw new PDFExportError(
        PDFExportErrorType.VALIDATION_ERROR,
        "Cutting list title is required",
      );
    }

    if (!cuttingList.sections || cuttingList.sections.length === 0) {
      throw new PDFExportError(
        PDFExportErrorType.VALIDATION_ERROR,
        "Cutting list must have at least one section",
      );
    }

    // Validate each section
    cuttingList.sections.forEach((section, index) => {
      if (!section.id) {
        throw new PDFExportError(
          PDFExportErrorType.VALIDATION_ERROR,
          `Section ${index + 1} is missing ID`,
        );
      }

      const sectionName = section.name || section.productName;
      if (!sectionName || sectionName.trim() === "") {
        throw new PDFExportError(
          PDFExportErrorType.VALIDATION_ERROR,
          `Section ${index + 1} is missing name or productName`,
        );
      }

      if (section.items && section.items.length > 0) {
        section.items.forEach((item, itemIndex) => {
          if (!item.id) {
            throw new PDFExportError(
              PDFExportErrorType.VALIDATION_ERROR,
              `Item ${itemIndex + 1} in section ${sectionName} is missing ID`,
            );
          }

          if (!item.workOrderId) {
            throw new PDFExportError(
              PDFExportErrorType.VALIDATION_ERROR,
              `Item ${itemIndex + 1} in section ${sectionName} is missing workOrderId`,
            );
          }

          if (item.profiles && item.profiles.length > 0) {
            item.profiles.forEach((profile, profileIndex) => {
              if (!profile.id) {
                throw new PDFExportError(
                  PDFExportErrorType.VALIDATION_ERROR,
                  `Profile ${profileIndex + 1} in item ${item.workOrderId} is missing ID`,
                );
              }

              if (!profile.measurement || profile.measurement.trim() === "") {
                throw new PDFExportError(
                  PDFExportErrorType.VALIDATION_ERROR,
                  `Profile ${profileIndex + 1} in item ${item.workOrderId} is missing measurement`,
                );
              }

              if (
                typeof profile.quantity !== "number" ||
                profile.quantity < 0
              ) {
                throw new PDFExportError(
                  PDFExportErrorType.VALIDATION_ERROR,
                  `Profile ${profileIndex + 1} in item ${item.workOrderId} has invalid quantity`,
                );
              }
            });
          }
        });
      }
    });
  }

  /**
   * PDF buffer'ını doğrular
   */
  private validatePDFBuffer(pdfBuffer: Buffer): void {
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new PDFExportError(
        PDFExportErrorType.PDF_GENERATION_ERROR,
        "PDF buffer is empty or null",
      );
    }

    const pdfHeader = pdfBuffer.slice(0, 4).toString();
    if (pdfHeader !== "%PDF") {
      throw new PDFExportError(
        PDFExportErrorType.PDF_GENERATION_ERROR,
        `Generated file is not a valid PDF. Header: ${pdfHeader}`,
        { pdfHeader, bufferSize: pdfBuffer.length },
      );
    }

    console.log(
      `[PDFExport] Professional PDF validation passed - Size: ${pdfBuffer.length} bytes, Header: ${pdfHeader}`,
    );
  }

  /**
   * Unique request ID oluşturur
   */
  private generateRequestId(): string {
    return `PDF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Browser instance'ını kapatır
   */
  public async closeBrowser(): Promise<void> {
    if (this.browser) {
      try {
        await this.browser.close();
        this.browser = null;
        this.isInitialized = false;
        console.log("[PDFExport] Professional browser closed successfully");
      } catch (error) {
        console.warn("[PDFExport] Failed to close browser gracefully:", error);
      }
    }
  }

  /**
   * Tüm kaynakları temizler
   */
  public async cleanup(): Promise<void> {
    console.log("[PDFExport] Starting professional cleanup...");
    await this.closeBrowser();
    console.log("[PDFExport] Professional cleanup completed");
  }

  /**
   * Service health check
   */
  public async healthCheck(): Promise<{
    healthy: boolean;
    browserReady: boolean;
  }> {
    return {
      healthy: true,
      browserReady: this.isInitialized && this.browser !== null,
    };
  }
}
