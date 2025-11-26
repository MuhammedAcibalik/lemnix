/**
 * LEMNİX Shared Constants
 * Application-wide constants
 *
 * @module shared/config
 * @version 1.0.0 - FSD Compliant
 */

/**
 * Application Configuration
 */
export interface AppConfig {
  domain: string;
  protocol: string;
  apiUrl: string;
  brandName: string;
  brandTagline: string;
  supportEmail: string;
  companyName: string;
  version: string;
}

// Development vs Production ayarları
const isDevelopment =
  import.meta.env.DEV || import.meta.env.MODE === "development";

export const appConfig: AppConfig = {
  // Domain ayarları
  domain: isDevelopment ? "localhost:3000" : "www.lemnix.com",
  protocol: isDevelopment ? "http" : "https",

  // API ayarları
  apiUrl: isDevelopment ? "http://localhost:5000" : "https://api.lemnix.com",

  // Brand ayarları
  brandName: "LEMNİX",
  brandTagline: "Alüminyum Profil Kesim Optimizasyonu Sistemi",

  // İletişim bilgileri
  supportEmail: "destek@lemnix.com",
  companyName: "Lemnix Teknoloji",

  // Versiyon
  version: "1.0.0",
};

// URL helper fonksiyonları
export const getFullDomain = (): string => {
  return `${appConfig.protocol}://${appConfig.domain}`;
};

export const getApiUrl = (endpoint: string = ""): string => {
  return `${appConfig.apiUrl}${endpoint}`;
};

export const getAssetUrl = (path: string): string => {
  return `${getFullDomain()}/assets${path}`;
};

// Meta tag'ler için
export const getMetaTags = () => ({
  title: `${appConfig.brandName} - ${appConfig.brandTagline}`,
  description: `${appConfig.brandTagline}. Profesyonel alüminyum profil kesim optimizasyonu ve iş emri yönetim sistemi.`,
  keywords: "alüminyum, profil, kesim, optimizasyon, iş emri, yönetim, sistem",
  url: getFullDomain(),
  image: getAssetUrl("/images/lemnix-og-image.jpg"),
  siteName: appConfig.brandName,
});

/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || "/api",
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

/**
 * API Base URL (convenience export)
 */
export const API_BASE_URL = API_CONFIG.BASE_URL;

/**
 * Storage Keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  THEME: "theme",
  LANGUAGE: "language",
  USER_PREFERENCES: "user_preferences",
} as const;

/**
 * Pagination Defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100] as const,
} as const;

/**
 * Debounce Delays (ms)
 */
export const DEBOUNCE = {
  SEARCH: 300,
  INPUT: 500,
  RESIZE: 150,
} as const;

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Date Formats
 */
export const DATE_FORMATS = {
  DISPLAY: "dd.MM.yyyy",
  DISPLAY_WITH_TIME: "dd.MM.yyyy HH:mm",
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  TIME: "HH:mm:ss",
} as const;

/**
 * Regex Patterns
 */
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
} as const;
