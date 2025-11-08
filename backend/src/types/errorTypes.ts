/**
 * LEMNİX Error Taxonomy and Response Standards
 * Comprehensive error classification and handling system
 */

export enum ErrorClass {
  CLIENT = 'CLIENT',           // 4xx - Client-side errors
  BUSINESS = 'BUSINESS',       // 4xx+ - Business logic violations
  INTEGRATION = 'INTEGRATION', // 5xx - External service failures
  SYSTEM = 'SYSTEM'           // 5xx - Internal system failures
}

export enum ErrorSeverity {
  LOW = 'LOW',         // Info level, user can retry
  MEDIUM = 'MEDIUM',   // Warning level, may need attention
  HIGH = 'HIGH',       // Error level, requires investigation
  CRITICAL = 'CRITICAL' // Fatal level, immediate action required
}

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  requestId: string;
  timestamp: string;
  endpoint: string;
  method: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface StructuredError {
  // Core error information
  errorId: string;
  correlationId: string;
  class: ErrorClass;
  severity: ErrorSeverity;
  code: string;
  message: string;
  userMessage: string;
  
  // Context information
  context: ErrorContext;
  
  // Technical details (sanitized)
  details?: {
    field?: string;
    expected?: string;
    actual?: string;
    constraint?: string;
  };
  
  // Recovery information
  recoverable: boolean;
  retryAfter?: number; // seconds
  retryPolicy?: 'immediate' | 'exponential' | 'linear' | 'none';
  
  // Monitoring information
  timestamp: string;
  service: string;
  version: string;
}

export interface ErrorMetrics {
  class: ErrorClass;
  severity: ErrorSeverity;
  count: number;
  rate: number; // errors per minute
  lastOccurrence: string;
  affectedEndpoints: string[];
  uniqueUsers: number;
}

// Error code definitions
export const ERROR_CODES = {
  // Client errors (4xx)
  CLIENT: {
    VALIDATION_FAILED: 'CLIENT_001',
    AUTHENTICATION_REQUIRED: 'CLIENT_002',
    AUTHORIZATION_FAILED: 'CLIENT_003',
    RATE_LIMIT_EXCEEDED: 'CLIENT_004',
    INVALID_REQUEST_FORMAT: 'CLIENT_005',
    MISSING_REQUIRED_FIELD: 'CLIENT_006',
    INVALID_FIELD_VALUE: 'CLIENT_007',
    FILE_TOO_LARGE: 'CLIENT_008',
    UNSUPPORTED_MEDIA_TYPE: 'CLIENT_009',
    REQUEST_TIMEOUT: 'CLIENT_010'
  },
  
  // Business logic errors (4xx+)
  BUSINESS: {
    OPTIMIZATION_FAILED: 'BUSINESS_001',
    INVALID_CUTTING_PARAMETERS: 'BUSINESS_002',
    INSUFFICIENT_STOCK: 'BUSINESS_003',
    PROFILE_NOT_FOUND: 'BUSINESS_004',
    QUOTA_EXCEEDED: 'BUSINESS_005',
    WORKFLOW_VIOLATION: 'BUSINESS_006',
    DATA_CONSISTENCY_ERROR: 'BUSINESS_007',
    BUSINESS_RULE_VIOLATION: 'BUSINESS_008',
    CONCURRENT_MODIFICATION: 'BUSINESS_009',
    OPERATION_NOT_ALLOWED: 'BUSINESS_010'
  },
  
  // Integration errors (5xx)
  INTEGRATION: {
    DATABASE_CONNECTION_FAILED: 'INTEGRATION_001',
    EXTERNAL_API_TIMEOUT: 'INTEGRATION_002',
    EXTERNAL_API_ERROR: 'INTEGRATION_003',
    MESSAGE_QUEUE_ERROR: 'INTEGRATION_004',
    CACHE_SERVICE_ERROR: 'INTEGRATION_005',
    FILE_STORAGE_ERROR: 'INTEGRATION_006',
    EMAIL_SERVICE_ERROR: 'INTEGRATION_007',
    SMS_SERVICE_ERROR: 'INTEGRATION_008',
    WEBHOOK_DELIVERY_FAILED: 'INTEGRATION_009',
    THIRD_PARTY_AUTH_ERROR: 'INTEGRATION_010'
  },
  
  // System errors (5xx)
  SYSTEM: {
    INTERNAL_SERVER_ERROR: 'SYSTEM_001',
    SERVICE_UNAVAILABLE: 'SYSTEM_002',
    OUT_OF_MEMORY: 'SYSTEM_003',
    DISK_SPACE_EXHAUSTED: 'SYSTEM_004',
    CPU_OVERLOAD: 'SYSTEM_005',
    NETWORK_TIMEOUT: 'SYSTEM_006',
    CONFIGURATION_ERROR: 'SYSTEM_007',
    DEPENDENCY_FAILURE: 'SYSTEM_008',
    CIRCUIT_BREAKER_OPEN: 'SYSTEM_009',
    CRITICAL_SYSTEM_FAILURE: 'SYSTEM_010'
  }
} as const;

// Error severity mapping
export const ERROR_SEVERITY_MAP = {
  [ErrorClass.CLIENT]: ErrorSeverity.LOW,
  [ErrorClass.BUSINESS]: ErrorSeverity.MEDIUM,
  [ErrorClass.INTEGRATION]: ErrorSeverity.HIGH,
  [ErrorClass.SYSTEM]: ErrorSeverity.CRITICAL
} as const;

// HTTP status code mapping
export const HTTP_STATUS_MAP = {
  [ErrorClass.CLIENT]: 400,
  [ErrorClass.BUSINESS]: 422,
  [ErrorClass.INTEGRATION]: 502,
  [ErrorClass.SYSTEM]: 500
} as const;

// Retry policy mapping
export const RETRY_POLICY_MAP = {
  [ErrorClass.CLIENT]: 'none' as const,
  [ErrorClass.BUSINESS]: 'none' as const,
  [ErrorClass.INTEGRATION]: 'exponential' as const,
  [ErrorClass.SYSTEM]: 'linear' as const
} as const;

// User-friendly error messages (masked)
export const USER_MESSAGES = {
  [ErrorClass.CLIENT]: 'Your request could not be processed. Please check your input and try again.',
  [ErrorClass.BUSINESS]: 'The operation could not be completed due to business rules. Please contact support if this persists.',
  [ErrorClass.INTEGRATION]: 'A temporary service issue occurred. Please try again in a few moments.',
  [ErrorClass.SYSTEM]: 'A system error occurred. Our team has been notified and is working to resolve it.'
} as const;
