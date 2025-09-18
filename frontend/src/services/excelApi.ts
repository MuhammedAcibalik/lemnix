/**
 * @fileoverview Enterprise-grade Excel API Service
 * @module ExcelApiService
 * @version 2.0.0
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Base API response structure
 */
export interface ApiResponse<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly details?: unknown;
  readonly warnings?: ReadonlyArray<ValidationError>;
  readonly timestamp: string;
  readonly requestId?: string;
}

/**
 * Validation error structure
 */
export interface ValidationError {
  readonly code: string;
  readonly message: string;
  readonly rowIndex?: number;
  readonly columnIndex?: number;
  readonly severity: 'critical' | 'error' | 'warning' | 'info';
  readonly value?: unknown;
  readonly context?: Record<string, unknown>;
}

/**
 * Work order metadata
 */
export interface WorkOrderMetadata {
  readonly date?: string;
  readonly version?: string;
  readonly color?: string;
  readonly note?: string;
  readonly sipQuantity?: number;
  readonly size?: string;
}

/**
 * Profile item from backend
 */
export interface ProfileItem {
  readonly profileType: string;
  readonly measurement: string;
  readonly quantity: number;
  readonly rowIndex: number;
  readonly confidence: number;
}

/**
 * Work order item from backend
 */
export interface WorkOrderItem {
  readonly workOrderId: string;
  readonly profiles: ReadonlyArray<ProfileItem>;
  readonly totalQuantity: number;
  readonly metadata: WorkOrderMetadata;
  readonly confidence: number;
  readonly rowIndex: number;
}

/**
 * File upload response
 */
export interface UploadResponse {
  readonly filename: string;
  readonly filepath: string;
  readonly filesize: number;
  readonly mimetype: string;
  readonly uploadTime: string;
  readonly summary?: ParseMetrics;
}

/**
 * Parse metrics
 */
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

/**
 * Product list response
 */
export interface ProductListResponse {
  readonly products: ReadonlyArray<string>;
  readonly summary: ParseMetrics;
  readonly totalProducts: number;
}

/**
 * Work orders response
 */
export interface WorkOrdersResponse {
  readonly productName: string;
  readonly workOrders: ReadonlyArray<WorkOrderItem>;
  readonly summary: {
    readonly totalWorkOrders: number;
    readonly totalProfiles: number;
    readonly totalQuantity: number;
    readonly profileTypes: ReadonlyArray<string>;
  };
}

/**
 * Summary response
 */
export interface SummaryResponse {
  readonly totalProducts: number;
  readonly totalWorkOrders: number;
  readonly totalProfiles: number;
  readonly totalQuantity: number;
  readonly parseTimeMs: number;
  readonly memoryUsedMb: number;
  readonly confidence: number;
  readonly skippedRows: number;
  readonly processedRows: number;
  readonly profileTypes: ReadonlyArray<string>;
}

/**
 * Profile types response
 */
export interface ProfileTypesResponse {
  readonly profileTypes: ReadonlyArray<{
    readonly profileType: string;
    readonly count: number;
    readonly totalQuantity: number;
  }>;
  readonly totalTypes: number;
  readonly totalProfiles: number;
  readonly totalQuantity: number;
}

/**
 * Product profiles response
 */
export interface ProductProfilesResponse {
  readonly productName: string;
  readonly profilesByType: Record<string, ReadonlyArray<ProfileItem>>;
  readonly summary: {
    readonly totalProfiles: number;
    readonly totalQuantity: number;
    readonly profileTypes: ReadonlyArray<string>;
  };
}

/**
 * Product group
 */
export interface ProductGroup {
  readonly productName: string;
  readonly workOrders: ReadonlyArray<WorkOrderItem>;
  readonly confidence: number;
  readonly metadata: {
    readonly startRow: number;
    readonly endRow: number;
    readonly totalQuantity: number;
    readonly uniqueWorkOrders: number;
    readonly averageConfidence: number;
  };
}

/**
 * All products response
 */
export interface AllProductsResponse {
  readonly productGroups: ReadonlyArray<ProductGroup>;
  readonly summary: ParseMetrics;
}

/**
 * Excel status response
 */
export interface ExcelStatusResponse {
  readonly status: 'OK' | 'ERROR' | 'NO_FILE';
  readonly currentFile: string | null;
  readonly summary: ParseMetrics | null;
  readonly errors: ReadonlyArray<ValidationError>;
  readonly warnings: ReadonlyArray<ValidationError>;
  readonly lastUpdated: string;
}

/**
 * Service configuration
 */
interface ServiceConfig {
  readonly baseURL: string;
  readonly timeout: number;
  readonly retryAttempts: number;
  readonly retryDelay: number;
  readonly headers?: Record<string, string>;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: ServiceConfig = {
  baseURL: 'http://localhost:3001/api',
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
  headers: {
    'Content-Type': 'application/json'
  }
};

// ============================================================================
// EXCEL API SERVICE CLASS
// ============================================================================

/**
 * Enterprise-grade Excel API Service
 */
export class ExcelApiService {
  private readonly axios: AxiosInstance;
  private readonly config: ServiceConfig;
  private requestCounter: number = 0;

  /**
   * Constructor
   * @param {Partial<ServiceConfig>} config - Service configuration
   */
  constructor(config: Partial<ServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Create axios instance
    this.axios = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: this.config.headers
    });

    // Setup interceptors
    this.setupInterceptors();
  }

  /**
   * Setup axios interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.axios.interceptors.request.use(
      (config) => {
        // Add request ID
        const requestId = this.generateRequestId();
        config.headers['X-Request-ID'] = requestId;
        
        // Log request
        console.log(`[${requestId}] ${config.method?.toUpperCase()} ${config.url}`);
        
        return config;
      },
      (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axios.interceptors.response.use(
      (response) => {
        const requestId = response.config.headers['X-Request-ID'];
        console.log(`[${requestId}] Response received: ${response.status}`);
        return response;
      },
      async (error) => {
        const requestId = error.config?.headers?.['X-Request-ID'];
        console.error(`[${requestId}] Response error:`, error.message);
        
        // Implement retry logic for specific errors
        if (this.shouldRetry(error)) {
          return this.retryRequest(error.config);
        }
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `REQ-${Date.now()}-${++this.requestCounter}`;
  }

  /**
   * Check if request should be retried
   */
  private shouldRetry(error: AxiosError): boolean {
    // Don't retry if no config or already retried max times
    if (!error.config || (error.config as any).retryCount >= this.config.retryAttempts) {
      return false;
    }

    // Retry on network errors or 5xx status codes
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
  }

  /**
   * Retry failed request
   */
  private async retryRequest(config: AxiosRequestConfig): Promise<any> {
    const retryCount = (config as any).retryCount || 0;
    (config as any).retryCount = retryCount + 1;

    console.log(`Retrying request (attempt ${retryCount + 1}/${this.config.retryAttempts})`);
    
    // Wait before retry
    await this.delay(this.config.retryDelay * Math.pow(2, retryCount));
    
    return this.axios.request(config);
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Handle API errors
   */
  private handleError<T>(error: unknown): ApiResponse<T> {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiResponse>;
      
      if (axiosError.response?.data) {
        return axiosError.response.data as ApiResponse<T>;
      }
      
      return {
        success: false,
        error: axiosError.message || 'Network error occurred',
        timestamp: new Date().toISOString()
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    };
  }

  // ============================================================================
  // API METHODS
  // ============================================================================

  /**
   * Upload Excel file
   * @param {File} file - Excel file to upload
   * @param {Function} onProgress - Upload progress callback
   */
  async uploadExcelFile(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<UploadResponse>> {
    try {
      const formData = new FormData();
      formData.append('excelFile', file);

      const response = await this.axios.post<ApiResponse<UploadResponse>>(
        '/excel/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              onProgress(progress);
            }
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Upload error:', error);
      return this.handleError<UploadResponse>(error);
    }
  }

  /**
   * Get product list
   */
  async getProductList(): Promise<ApiResponse<ProductListResponse>> {
    try {
      const response = await this.axios.get<ApiResponse<ProductListResponse>>('/excel/products');
      return response.data;
    } catch (error) {
      console.error('Get product list error:', error);
      return this.handleError<ProductListResponse>(error);
    }
  }

  /**
   * Get work orders by product
   * @param {string} productName - Product name
   */
  async getWorkOrdersByProduct(productName: string): Promise<ApiResponse<WorkOrdersResponse>> {
    try {
      const encodedName = encodeURIComponent(productName);
      const response = await this.axios.get<ApiResponse<WorkOrdersResponse>>(
        `/excel/products/${encodedName}/work-orders`
      );
      return response.data;
    } catch (error) {
      console.error('Get work orders error:', error);
      return this.handleError<WorkOrdersResponse>(error);
    }
  }

  /**
   * Get all product groups
   */
  async getAllProductGroups(): Promise<ApiResponse<AllProductsResponse>> {
    try {
      const response = await this.axios.get<ApiResponse<AllProductsResponse>>('/excel/all-products');
      return response.data;
    } catch (error) {
      console.error('Get all products error:', error);
      return this.handleError<AllProductsResponse>(error);
    }
  }

  /**
   * Get Excel status
   */
  async getExcelStatus(): Promise<ApiResponse<ExcelStatusResponse>> {
    try {
      const response = await this.axios.get<ApiResponse<ExcelStatusResponse>>('/excel/status');
      return response.data;
    } catch (error) {
      console.error('Get status error:', error);
      return this.handleError<ExcelStatusResponse>(error);
    }
  }

  /**
   * Reload Excel file
   */
  async reloadExcelFile(): Promise<ApiResponse<ParseMetrics>> {
    try {
      const response = await this.axios.post<ApiResponse<ParseMetrics>>('/excel/reload');
      return response.data;
    } catch (error) {
      console.error('Reload error:', error);
      return this.handleError<ParseMetrics>(error);
    }
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await this.axios.post<ApiResponse<{ message: string }>>('/excel/clear-cache');
      return response.data;
    } catch (error) {
      console.error('Clear cache error:', error);
      return this.handleError<{ message: string }>(error);
    }
  }

  /**
   * Get summary statistics
   */
  async getSummary(): Promise<ApiResponse<SummaryResponse>> {
    try {
      const response = await this.axios.get<ApiResponse<SummaryResponse>>('/excel/summary');
      return response.data;
    } catch (error) {
      console.error('Get summary error:', error);
      return this.handleError<SummaryResponse>(error);
    }
  }

  /**
   * Get all profile types
   */
  async getProfileTypes(): Promise<ApiResponse<ProfileTypesResponse>> {
    try {
      const response = await this.axios.get<ApiResponse<ProfileTypesResponse>>('/excel/profile-types');
      return response.data;
    } catch (error) {
      console.error('Get profile types error:', error);
      return this.handleError<ProfileTypesResponse>(error);
    }
  }

  /**
   * Get profiles by product
   * @param {string} productName - Product name
   */
  async getProfilesByProduct(productName: string): Promise<ApiResponse<ProductProfilesResponse>> {
    try {
      const encodedName = encodeURIComponent(productName);
      const response = await this.axios.get<ApiResponse<ProductProfilesResponse>>(
        `/excel/products/${encodedName}/profiles`
      );
      return response.data;
    } catch (error) {
      console.error('Get profiles by product error:', error);
      return this.handleError<ProductProfilesResponse>(error);
    }
  }

  /**
   * Check service health
   */
  async checkHealth(): Promise<boolean> {
    try {
      const result = await this.getExcelStatus();
      return result.success;
    } catch {
      return false;
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

// Create singleton instance
const excelApiService = new ExcelApiService();

// Export service methods for backward compatibility
export const excelApi = {
  uploadExcelFile: (file: File) => excelApiService.uploadExcelFile(file),
  getProductList: () => excelApiService.getProductList(),
  getWorkOrdersByProduct: (productName: string) => excelApiService.getWorkOrdersByProduct(productName),
  getAllProductGroups: () => excelApiService.getAllProductGroups(),
  getExcelStatus: () => excelApiService.getExcelStatus(),
  reloadExcelFile: () => excelApiService.reloadExcelFile(),
  clearCache: () => excelApiService.clearCache(),
  checkHealth: () => excelApiService.checkHealth(),
  // Yeni API metodları
  getSummary: () => excelApiService.getSummary(),
  getProfileTypes: () => excelApiService.getProfileTypes(),
  getProfilesByProduct: (productName: string) => excelApiService.getProfilesByProduct(productName)
};

// Export service class and instance
export default excelApiService;