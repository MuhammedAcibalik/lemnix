/**
 * Validation Hook
 * 
 * @module shared/lib/validation
 * @version 1.0.0
 */

import { useState, useCallback } from 'react';
import type { ValidationError, ValidationResult } from './types';

export function useValidation() {
  const [errors, setErrors] = useState<ReadonlyArray<ValidationError>>([]);
  const [warnings, setWarnings] = useState<ReadonlyArray<ValidationError>>([]);

  const validate = useCallback((result: ValidationResult) => {
    setErrors(result.errors);
    setWarnings(result.warnings);
    return result.valid;
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const clearWarnings = useCallback(() => {
    setWarnings([]);
  }, []);

  const clearAll = useCallback(() => {
    setErrors([]);
    setWarnings([]);
  }, []);

  const hasErrors = errors.length > 0;
  const hasWarnings = warnings.length > 0;
  const isValid = !hasErrors;

  return {
    errors,
    warnings,
    hasErrors,
    hasWarnings,
    isValid,
    validate,
    clearErrors,
    clearWarnings,
    clearAll,
  } as const;
}

