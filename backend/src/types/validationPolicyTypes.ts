/**
 * LEMNİX Validation Policy v1 Types
 * Comprehensive validation rules and edge case handling
 */

export enum ValidationSeverity {
  CRITICAL = 'CRITICAL',     // Reject immediately
  HIGH = 'HIGH',            // Quarantine for review
  MEDIUM = 'MEDIUM',        // Auto-fix with warning
  LOW = 'LOW'              // Auto-fix silently
}

export enum ValidationAction {
  REJECT = 'REJECT',         // Reject the record
  QUARANTINE = 'QUARANTINE', // Move to quarantine for review
  AUTO_FIX = 'AUTO_FIX',     // Automatically fix the issue
  WARN = 'WARN'             // Log warning but allow
}

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  severity: ValidationSeverity;
  action: ValidationAction;
  condition: (data: Record<string, unknown>) => boolean;
  fixer?: (data: Record<string, unknown>) => Record<string, unknown>;
  threshold?: number;
  category: ValidationCategory;
}

export enum ValidationCategory {
  DATA_QUALITY = 'DATA_QUALITY',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC',
  UNIT_CONSISTENCY = 'UNIT_CONSISTENCY',
  MATHEMATICAL = 'MATHEMATICAL',
  FORMAT = 'FORMAT',
  SECURITY = 'SECURITY'
}

export interface ValidationResult {
  ruleId: string;
  ruleName: string;
  severity: ValidationSeverity;
  action: ValidationAction;
  passed: boolean;
  message: string;
  originalValue?: unknown;
  fixedValue?: unknown;
  confidence: number; // 0-1, how confident we are in the fix
}

export interface ValidationReport {
  recordId: string;
  correlationId: string;
  timestamp: string;
  overallStatus: 'PASSED' | 'QUARANTINED' | 'REJECTED' | 'AUTO_FIXED';
  results: ValidationResult[];
  processingTime: number;
  dataFreshness: number; // seconds since data creation
}

export interface QuarantineRecord {
  id: string;
  correlationId: string;
  originalData: Record<string, unknown>;
  validationResults: ValidationResult[];
  quarantineReason: string;
  quarantinedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewDecision?: 'APPROVE' | 'REJECT' | 'MODIFY';
  reviewNotes?: string;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED';
}

export interface ValidationMetrics {
  totalRecords: number;
  passedRecords: number;
  quarantinedRecords: number;
  rejectedRecords: number;
  autoFixedRecords: number;
  
  // By severity
  criticalViolations: number;
  highViolations: number;
  mediumViolations: number;
  lowViolations: number;
  
  // By category
  dataQualityIssues: number;
  businessLogicIssues: number;
  unitConsistencyIssues: number;
  mathematicalIssues: number;
  formatIssues: number;
  
  // Performance
  averageProcessingTime: number;
  p95ProcessingTime: number;
  averageDataFreshness: number;
  p95DataFreshness: number;
  
  // Trends
  rejectionRate: number;
  quarantineRate: number;
  autoFixRate: number;
  dataFreshnessCompliance: number; // % of records with freshness < 60s
}

export interface EdgeCaseRule {
  name: string;
  description: string;
  severity: ValidationSeverity;
  condition: (data: Record<string, unknown>) => boolean;
  fix: (data: Record<string, unknown>) => Record<string, unknown>;
  examples: string[];
}

// Edge case definitions
export const EDGE_CASE_RULES: EdgeCaseRule[] = [
  {
    name: 'Negative Waste',
    description: 'Waste percentage cannot be negative',
    severity: ValidationSeverity.CRITICAL,
    condition: (data) => (data.wastePercentage as number) < 0,
    fix: (data) => ({ ...data, wastePercentage: Math.max(0, data.wastePercentage as number) }),
    examples: ['wastePercentage: -5.2', 'wastePercentage: -0.1']
  },
  {
    name: 'Unit Confusion',
    description: 'Mixed units in the same record',
    severity: ValidationSeverity.HIGH,
    condition: (data) => {
      const hasMm = data.length && data.length.toString().includes('mm');
      const hasInches = data.length && data.length.toString().includes('in');
      const hasCm = data.length && data.length.toString().includes('cm');
      return Boolean((hasMm && hasInches) || (hasMm && hasCm) || (hasInches && hasCm));
    },
    fix: (data) => {
      // Convert everything to mm
      let length = data.length;
      if (typeof length === 'string') {
        if (length.includes('in')) {
          length = parseFloat(length) * 25.4; // inches to mm
        } else if (length.includes('cm')) {
          length = parseFloat(length) * 10; // cm to mm
        } else if (length.includes('mm')) {
          length = parseFloat(length);
        }
      }
      return { ...data, length, unit: 'mm' };
    },
    examples: ['length: "100mm" + width: "5in"', 'length: "50cm" + height: "200mm"']
  },
  {
    name: 'Excessive Kerf',
    description: 'Kerf width exceeds reasonable limits',
    severity: ValidationSeverity.MEDIUM,
    condition: (data) => Boolean((data.kerf as number) && (data.kerf as number) > 10), // > 10mm kerf is excessive
    fix: (data) => ({ ...data, kerf: Math.min(data.kerf as number, 5) }), // Cap at 5mm
    examples: ['kerf: 15mm', 'kerf: 25mm']
  },
  {
    name: 'Impossible Dimensions',
    description: 'Dimensions that are physically impossible',
    severity: ValidationSeverity.CRITICAL,
    condition: (data) => {
      return Boolean(((data.length as number) && (data.length as number) <= 0) ||
             ((data.width as number) && (data.width as number) <= 0) ||
             ((data.height as number) && (data.height as number) <= 0) ||
             ((data.length as number) && (data.width as number) && (data.length as number) < (data.width as number)) ||
             ((data.kerf as number) && (data.length as number) && (data.kerf as number) >= (data.length as number)));
    },
    fix: (data) => {
      const fixed = { ...data };
      if ((fixed.length as number) <= 0) fixed.length = 100; // Default 100mm
      if ((fixed.width as number) <= 0) fixed.width = 10; // Default 10mm
      if ((fixed.height as number) <= 0) fixed.height = 5; // Default 5mm
      if (fixed.kerf && fixed.length && (fixed.kerf as number) >= (fixed.length as number)) {
        fixed.kerf = Math.min(fixed.kerf as number, (fixed.length as number) * 0.1); // Max 10% of length
      }
      return fixed;
    },
    examples: ['length: 0', 'kerf: 100, length: 50', 'width: -5']
  },
  {
    name: 'Missing Required Fields',
    description: 'Required fields are missing or empty',
    severity: ValidationSeverity.HIGH,
    condition: (data) => {
      const required = ['profileType', 'stockLength', 'quantity'];
      return required.some(field => !data[field] || data[field] === '');
    },
    fix: (data) => {
      const fixed = { ...data };
      if (!fixed.profileType) fixed.profileType = 'UNKNOWN';
      if (!fixed.stockLength) fixed.stockLength = 6000; // Default 6m
      if (!fixed.quantity) fixed.quantity = 1;
      return fixed;
    },
    examples: ['profileType: ""', 'stockLength: null', 'quantity: undefined']
  },
  {
    name: 'Invalid Quantity',
    description: 'Quantity must be a positive integer',
    severity: ValidationSeverity.MEDIUM,
    condition: (data) => {
      return Boolean((data.quantity as number) && ((data.quantity as number) <= 0 || !Number.isInteger(data.quantity as number)));
    },
    fix: (data) => ({ ...data, quantity: Math.max(1, Math.round(data.quantity as number)) }),
    examples: ['quantity: 0', 'quantity: -5', 'quantity: 2.5']
  },
  {
    name: 'Data Freshness Violation',
    description: 'Data is too old (> 60 seconds)',
    severity: ValidationSeverity.LOW,
    condition: (data) => {
      const now = Date.now();
      const dataTime = data.timestamp ? new Date(data.timestamp as string).getTime() : now;
      return (now - dataTime) > 60000; // > 60 seconds
    },
    fix: (data) => ({ ...data, timestamp: new Date().toISOString() }),
    examples: ['timestamp: "2025-09-24T16:00:00Z" (current: 17:00:00Z)']
  }
];

// Validation thresholds
export const VALIDATION_THRESHOLDS = {
  DATA_FRESHNESS_SECONDS: 60,
  MAX_KERF_MM: 10,
  MAX_PROCESSING_TIME_MS: 5000,
  MIN_CONFIDENCE_SCORE: 0.7,
  QUARANTINE_RETENTION_HOURS: 24,
  AUTO_FIX_CONFIDENCE_THRESHOLD: 0.8
} as const;

// Validation categories and their rules
export const VALIDATION_CATEGORIES = {
  [ValidationCategory.DATA_QUALITY]: [
    'Missing Required Fields',
    'Invalid Quantity',
    'Data Freshness Violation'
  ],
  [ValidationCategory.MATHEMATICAL]: [
    'Negative Waste',
    'Impossible Dimensions'
  ],
  [ValidationCategory.UNIT_CONSISTENCY]: [
    'Unit Confusion'
  ],
  [ValidationCategory.BUSINESS_LOGIC]: [
    'Excessive Kerf'
  ]
} as const;

// Helper functions
export function determineValidationAction(severity: ValidationSeverity, confidence: number): ValidationAction {
  switch (severity) {
    case ValidationSeverity.CRITICAL:
      return ValidationAction.REJECT;
    case ValidationSeverity.HIGH:
      return ValidationAction.QUARANTINE;
    case ValidationSeverity.MEDIUM:
      return confidence >= VALIDATION_THRESHOLDS.AUTO_FIX_CONFIDENCE_THRESHOLD 
        ? ValidationAction.AUTO_FIX 
        : ValidationAction.QUARANTINE;
    case ValidationSeverity.LOW:
      return ValidationAction.AUTO_FIX;
    default:
      return ValidationAction.WARN;
  }
}

export function calculateDataFreshness(timestamp: string): number {
  const now = Date.now();
  const dataTime = new Date(timestamp).getTime();
  return Math.floor((now - dataTime) / 1000); // seconds
}

export function isDataFresh(timestamp: string): boolean {
  return calculateDataFreshness(timestamp) <= VALIDATION_THRESHOLDS.DATA_FRESHNESS_SECONDS;
}
