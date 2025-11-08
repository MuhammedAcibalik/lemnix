/**
 * Validation Types
 * 
 * @module shared/lib/validation
 * @version 1.0.0
 */

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationError {
  readonly field: string;
  readonly message: string;
  readonly severity: ValidationSeverity;
  readonly code?: string;
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: ReadonlyArray<ValidationError>;
  readonly warnings: ReadonlyArray<ValidationError>;
}

