/**
 * @fileoverview API Service - Modernized
 * @module ApiService
 * @version 2.0.0 - Enterprise Grade Modular Design
 */

import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import type {
  OptimizationItem,
  MaterialStockLength,
} from "@/entities/optimization/model/types";
import type { ApiResponse } from "@/shared/types/api";

import type { ApiError } from "@/shared/types/api";

/**
 * Modern API Service with improved error handling
 */
class ApiService {
  private readonly api: AxiosInstance;

  constructor() {
    this.api = this.createAxiosInstance();
    this.setupInterceptors();
  }

  /**
   * Create axios instance with configuration
   */
  private createAxiosInstance(): AxiosInstance {
    return axios.create({
      baseURL: "/api",
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    this.setupRequestInterceptor();
    this.setupResponseInterceptor();
  }

  /**
   * Setup request interceptor
   */
  private setupRequestInterceptor(): void {
    this.api.interceptors.request.use(
      (config) => {
        console.log(
          `API Request: ${config.method?.toUpperCase()} ${config.url}`,
        );
        return config;
      },
      (error) => {
        console.error("API Request Error:", error);
        return Promise.reject(error);
      },
    );
  }

  /**
   * Setup response interceptor
   */
  private setupResponseInterceptor(): void {
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error("API Response Error:", error);
        return Promise.reject(error);
      },
    );
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<ApiResponse<Record<string, unknown>>> {
    try {
      const response = await this.api.get("/health");
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Modern error handling with type safety
   */
  private handleError<T>(error: unknown): ApiResponse<T> {
    const errorHandlers: Array<
      (error: unknown) => ApiResponse<unknown> | null
    > = [
      this.handleAxiosError.bind(this),
      this.handleGenericError.bind(this),
      this.handleUnknownError.bind(this),
    ];

    const result = errorHandlers.find((handler) => handler(error));
    return (result || this.createDefaultErrorResponse()) as ApiResponse<T>;
  }

  /**
   * Handle axios errors
   */
  private handleAxiosError(error: unknown): ApiResponse<unknown> | null {
    if (!axios.isAxiosError(error)) return null;

    const axiosError = error as AxiosError<{ error?: ApiError }>;

    const errorResponse = axiosError.response;
    const errorRequest = axiosError.request;

    return {
      success: false,
      error: errorResponse
        ? this.createServerErrorResponse(errorResponse.data?.error)
        : errorRequest
          ? this.createNetworkErrorResponse()
          : this.createRequestErrorResponse(axiosError.message),
    };
  }

  /**
   * Handle generic errors
   */
  private handleGenericError(error: unknown): ApiResponse<unknown> | null {
    if (!(error instanceof Error)) return null;

    return {
      success: false,
      error: {
        message: error.message,
        code: "GENERIC_ERROR",
        details: {},
      },
    };
  }

  /**
   * Handle unknown errors
   */
  private handleUnknownError(error: unknown): ApiResponse<unknown> | null {
    return {
      success: false,
      error: {
        message: "Beklenmeyen hata türü",
        code: "UNKNOWN_ERROR_TYPE",
        details: {},
      },
    };
  }

  /**
   * Create server error response
   */
  private createServerErrorResponse(error?: ApiError | { message?: string; code?: string; details?: unknown }): ApiError {
    const details = error?.details && typeof error.details === "object" && !Array.isArray(error.details)
      ? (error.details as Record<string, unknown>)
      : {};
    
    return {
      message: error?.message || "Sunucu hatası",
      code: error?.code || "SERVER_ERROR",
      ...(Object.keys(details).length > 0 ? { details } : {}),
    };
  }

  /**
   * Create network error response
   */
  private createNetworkErrorResponse(): ApiError {
    return {
      message: "Ağ bağlantısı hatası",
      code: "NETWORK_ERROR",
    };
  }

  /**
   * Create request error response
   */
  private createRequestErrorResponse(message?: string): ApiError {
    return {
      message: message || "İstek hatası",
      code: "REQUEST_ERROR",
      details: {},
    };
  }

  /**
   * Create default error response
   */
  private createDefaultErrorResponse(): ApiResponse<unknown> {
    return {
      success: false,
      error: {
        message: "Bilinmeyen hata oluştu",
        code: "DEFAULT_ERROR",
      },
    };
  }
}

// Create singleton instance
export const apiService = new ApiService();
export default apiService;
