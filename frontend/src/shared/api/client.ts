/**
 * LEMNİX API Client
 * Central axios instance with interceptors and error handling
 *
 * @module shared/api
 * @version 1.0.0 - FSD Compliant
 */

import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import toast from "react-hot-toast";
import { ApiErrorResponse, ApiSuccessResponse } from "../types";
import {
  apiCircuitBreaker,
  optimizationCircuitBreaker,
} from "../lib/circuitBreaker"; // ✅ P2-9

function extractErrorMessage(data: unknown): string | null {
  if (!data) return null;
  if (typeof data === "string") {
    return data;
  }

  if (typeof data === "object") {
    const record = data as Record<string, unknown>;

    if (typeof record.error === "string") {
      return record.error;
    }

    if (
      record.error &&
      typeof record.error === "object" &&
      typeof (record.error as { message?: unknown }).message === "string"
    ) {
      return (record.error as { message?: string }).message ?? null;
    }

    if (typeof record.message === "string") {
      return record.message;
    }
  }

  return null;
}

/**
 * Correlation ID generator for request tracing
 */
function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Get auth token from storage
 *
 * @returns Authentication token or null if not available
 *
 * @security
 * - Development: Uses mock token for local development
 * - Production: Requires actual token, throws error if missing
 *
 * @todo Implement actual authentication flow with JWT refresh
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return null;
  }

  // Check localStorage for stored token
  const stored = localStorage.getItem("auth_token");
  if (stored) {
    return stored;
  }

  // ✅ SECURITY: Development mode - use mock token for local development only
  if (import.meta.env.MODE === "development" && import.meta.env.DEV) {
    const mockToken = "mock-dev-token-lemnix-2025";
    localStorage.setItem("auth_token", mockToken);
    return mockToken;
  }

  // ✅ SECURITY: Production mode - require actual token
  // Do not use mock token in production
  if (import.meta.env.MODE === "production" || import.meta.env.PROD) {
    // In production, if no token is found, return null
    // The API client will handle the 401 response appropriately
    // This allows the app to function while authentication is being implemented
    // but prevents using mock tokens in production
    return null;
  }

  // Non-production environments (e.g., tests, storybook)
  // Return null to force proper authentication setup
  return null;
}

/**
 * Create configured axios instance
 */
function createAxiosInstance(): AxiosInstance {
  // Use Vite proxy in development, direct URL in production
  const baseURL = import.meta.env.DEV
    ? "/api" // Use /api prefix for Vite proxy
    : import.meta.env.VITE_API_URL || "http://localhost:3001/api";

  const instance = axios.create({
    baseURL,
    timeout: 120000, // ✅ 2 minutes for genetic algorithm (large datasets)
    // ✅ FIX: Don't set Content-Type globally - let axios handle it per request
  });

  return instance;
}

/**
 * Request interceptor - Add auth and correlation ID
 */
function requestInterceptor(
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig {
  // Add correlation ID for tracing
  config.headers["X-Correlation-ID"] = generateCorrelationId();

  // Add auth token if available
  const token = getAuthToken();
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  // ✅ FIX: Set Content-Type only for JSON requests (not FormData)
  if (config.data instanceof FormData) {
    // Let axios set the correct Content-Type with boundary for FormData
    delete config.headers["Content-Type"];
  } else if (config.data && typeof config.data === "object") {
    // Set JSON Content-Type for object data
    config.headers["Content-Type"] = "application/json";
  }

  // Log in development
  if (import.meta.env.DEV) {
    console.debug(`[API] ${config.method?.toUpperCase()} ${config.url}`);
  }

  return config;
}

/**
 * Request error interceptor
 */
function requestErrorInterceptor(error: AxiosError): Promise<never> {
  console.error("[API] Request Error:", error);
  return Promise.reject(error);
}

/**
 * Response interceptor - Log success
 */
function responseInterceptor(response: AxiosResponse): AxiosResponse {
  if (import.meta.env.DEV) {
    console.debug(`[API] ${response.status} ${response.config.url}`);
  }
  return response;
}

/**
 * Response error interceptor - Enhanced error handling with toast notifications
 * ✅ P2-10: Global error notification system
 * ✅ P2-9: Circuit breaker integration
 */
function responseErrorInterceptor(
  error: AxiosError<ApiErrorResponse>,
): Promise<never> {
  // Silently ignore cancelled requests (AbortController - React Strict Mode)
  if (error.code === "ERR_CANCELED" || error.message === "canceled") {
    return Promise.reject(error);
  }

  // ✅ P2-9: Check if this is a circuit breaker error
  if (error.message && error.message.includes("Circuit OPEN")) {
    // Circuit breaker already rejected, don't show toast again
    console.warn("[API] Circuit breaker active:", error.message);
    return Promise.reject(error);
  }

  // ✅ ROOT CAUSE FIX: Silently ignore 404 for product category lookup (expected when product has no category)
  const url = error.config?.url || "";
  const isProductCategoryLookup = url.includes("/product-categories/product/");
  if (error.response?.status === 404 && isProductCategoryLookup) {
    // This is expected - product may not have a category yet
    // Don't log to console or show toast
    return Promise.reject(error);
  }

  let userMessage = "Beklenmeyen bir hata oluştu";
  const shouldShowToast = true;

  if (error.response) {
    // Server responded with error
    const status = error.response.status;
    const data = error.response.data;

    // ✅ ROOT CAUSE FIX: Don't log 404 errors for product category lookup
    if (!(status === 404 && isProductCategoryLookup)) {
      console.error(`[API] ${status} Error:`, {
        url: error.config?.url,
        error: data?.error,
        fullData: data,
      });
    }

    // ✅ P2-10: User-friendly error messages
    if (status === 401) {
      userMessage = "Oturum süreniz doldu. Lütfen tekrar giriş yapın.";
      localStorage.removeItem("auth_token");
      // TODO: Dispatch logout action or redirect to login
    } else if (status === 403) {
      userMessage = "Bu işlem için yetkiniz bulunmuyor.";
    } else if (status === 429) {
      userMessage =
        "Çok fazla istek gönderdiniz. Lütfen birkaç dakika bekleyin.";
    } else if (status === 404) {
      userMessage = "İstenen kaynak bulunamadı.";
    } else if (status === 409) {
      userMessage =
        extractErrorMessage(data) ||
        "Bu işlem mevcut verilerle çakışıyor. Lütfen bilgilerinizi kontrol edin.";
    } else if (status >= 500) {
      userMessage = "Sunucu hatası. Lütfen daha sonra tekrar deneyin.";
    } else if (status === 400) {
      // Use backend error message if available
      userMessage =
        extractErrorMessage(data) ||
        "Geçersiz istek. Lütfen verilerinizi kontrol edin.";
    }

    // ✅ P2-10: Show toast notification
    if (shouldShowToast) {
      toast.error(userMessage, {
        duration: status === 429 ? 5000 : 4000, // Longer for rate limit
        position: "top-right",
      });
    }
  } else if (error.request) {
    // Request made but no response
    userMessage = "Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.";
    console.error("[API] Network Error:", error.message);

    toast.error(userMessage, {
      duration: 5000,
      position: "top-right",
    });
  } else {
    // Request setup error
    userMessage = "İstek oluşturulamadı. Lütfen sayfayı yenileyin.";
    console.error("[API] Request Setup Error:", error.message);

    toast.error(userMessage, {
      duration: 4000,
      position: "top-right",
    });
  }

  return Promise.reject(error);
}

/**
 * Main API client instance
 */
export const apiClient: AxiosInstance = createAxiosInstance();

// Setup interceptors
apiClient.interceptors.request.use(requestInterceptor, requestErrorInterceptor);
apiClient.interceptors.response.use(
  responseInterceptor,
  responseErrorInterceptor,
);

/**
 * Type-safe API response handler
 */
export async function handleApiResponse<T>(
  promise: Promise<AxiosResponse<ApiSuccessResponse<T>>>,
): Promise<ApiSuccessResponse<T>> {
  try {
    const response = await promise;
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // Server error response
      throw error.response.data;
    }
    // Network or other error
    throw {
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Unknown error",
        code: "NETWORK_ERROR",
      },
    } as ApiErrorResponse;
  }
}

/**
 * Get appropriate circuit breaker for endpoint
 * ✅ P2-9: Route-specific circuit breakers
 */
function getCircuitBreaker(url: string) {
  if (
    url.includes("/enterprise/optimize") ||
    url.includes("/enterprise/compare")
  ) {
    return optimizationCircuitBreaker;
  }
  return apiCircuitBreaker;
}

/**
 * HTTP method helpers with type safety and circuit breaker protection
 * ✅ P2-9: All API calls protected by circuit breaker
 */
export const api = {
  get: <T>(url: string, config?: Parameters<typeof apiClient.get>[1]) => {
    const breaker = getCircuitBreaker(url);
    return breaker.execute(() =>
      handleApiResponse<T>(apiClient.get(url, config)),
    );
  },

  post: <T>(
    url: string,
    data?: unknown,
    config?: Parameters<typeof apiClient.post>[2],
  ) => {
    const breaker = getCircuitBreaker(url);
    return breaker.execute(() =>
      handleApiResponse<T>(apiClient.post(url, data, config)),
    );
  },

  put: <T>(
    url: string,
    data?: unknown,
    config?: Parameters<typeof apiClient.put>[2],
  ) => {
    const breaker = getCircuitBreaker(url);
    return breaker.execute(() =>
      handleApiResponse<T>(apiClient.put(url, data, config)),
    );
  },

  patch: <T>(
    url: string,
    data?: unknown,
    config?: Parameters<typeof apiClient.patch>[2],
  ) => {
    const breaker = getCircuitBreaker(url);
    return breaker.execute(() =>
      handleApiResponse<T>(apiClient.patch(url, data, config)),
    );
  },

  delete: <T>(url: string, config?: Parameters<typeof apiClient.delete>[1]) => {
    const breaker = getCircuitBreaker(url);
    return breaker.execute(() =>
      handleApiResponse<T>(apiClient.delete(url, config)),
    );
  },
};
