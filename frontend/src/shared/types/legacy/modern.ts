/**
 * Modern TypeScript Type Definitions
 * @fileoverview Modern type definitions following current TypeScript best practices
 * @version 2.0.0
 */

// Generic API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
}

// Generic Error Types
export interface ApiError {
  response?: {
    data?: {
      error?: string;
      code?: string;
      details?: Record<string, unknown>;
    };
    status?: number;
    statusText?: string;
  };
  message?: string;
  code?: string;
}

// Generic Cache Types
export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

// Generic Form Types
export interface FormField<T = unknown> {
  value: T;
  error?: string;
  touched?: boolean;
  required?: boolean;
}

// Generic State Types
export interface AsyncState<T = unknown> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated?: number;
}

// Generic Event Types
export interface ChangeEvent<T = unknown> {
  target: {
    value: T;
    name?: string;
    type?: string;
  };
}

// Generic Component Props
export interface ComponentProps {
  className?: string;
  id?: string;
  'data-testid'?: string;
  children?: React.ReactNode;
}

// Generic Hook Return Types
export interface HookReturn<T = unknown> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  reset: () => void;
}

// Generic Utility Types
export type NonNullable<T> = T extends null | undefined ? never : T;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Generic Array Types
export type NonEmptyArray<T> = [T, ...T[]];
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

// Generic Object Types
export type RecordKeys<T> = keyof T;
export type RecordValues<T> = T[RecordKeys<T>];
export type DeepRecord<K extends string | number | symbol, V> = {
  [P in K]: V extends object ? DeepRecord<string, V> : V;
};

// Generic Function Types
export type AsyncFunction<T extends unknown[], R> = (...args: T) => Promise<R>;
export type EventHandler<T = unknown> = (event: T) => void;
export type StateSetter<T> = (value: T | ((prev: T) => T)) => void;

// Generic Validation Types
export interface ValidationRule<T = unknown> {
  validate: (value: T) => boolean;
  message: string;
  required?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

// Generic Theme Types
export interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface ThemeBreakpoints {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

// Generic Animation Types
export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
  iterations?: number;
}

// Generic Layout Types
export interface LayoutConfig {
  columns: number;
  gap: number;
  padding: number;
  margin: number;
}

// Generic Performance Types
export interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
  loadTime: number;
}

// Generic Security Types
export interface SecurityConfig {
  sanitize: boolean;
  validate: boolean;
  encrypt: boolean;
  audit: boolean;
}

// Generic Accessibility Types
export interface A11yConfig {
  ariaLabel?: string;
  ariaDescribedBy?: string;
  role?: string;
  tabIndex?: number;
}

// Generic Testing Types
export interface TestConfig {
  timeout: number;
  retries: number;
  parallel: boolean;
  coverage: number;
}

// Generic Build Types
export interface BuildConfig {
  target: string;
  mode: 'development' | 'production' | 'test';
  sourceMap: boolean;
  minify: boolean;
}

// Generic Environment Types
export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  API_URL: string;
  VERSION: string;
  DEBUG: boolean;
}

// Generic Logging Types
export interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

export interface LogEntry {
  level: keyof LogLevel;
  message: string;
  timestamp: number;
  context?: Record<string, unknown>;
  stack?: string;
}

// Generic Monitoring Types
export interface MonitoringConfig {
  enabled: boolean;
  endpoint: string;
  interval: number;
  metrics: string[];
}

// Generic Feature Flags
export interface FeatureFlags {
  [key: string]: boolean | string | number;
}

// Generic Configuration Types
export interface AppConfig {
  api: {
    baseURL: string;
    timeout: number;
    retries: number;
  };
  ui: {
    theme: 'light' | 'dark';
    language: string;
    animations: boolean;
  };
  features: FeatureFlags;
  monitoring: MonitoringConfig;
  security: SecurityConfig;
}
