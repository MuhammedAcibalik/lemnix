/**
 * @fileoverview Security utilities hook
 * @module EnterpriseOptimizationForm/Hooks/useSecurity
 * @version 1.0.0
 */

import { useCallback } from 'react';
import { sanitizeInput, validateNumber } from '../utils';

export const useSecurity = () => {
  const sanitizeString = useCallback((input: string): string => {
    return sanitizeInput(input);
  }, []);

  const validateNumericValue = useCallback((
    value: unknown, 
    min: number = 0, 
    max: number = Number.MAX_SAFE_INTEGER
  ): number => {
    return validateNumber(value, min, max);
  }, []);

  const sanitizeFormData = useCallback((data: Record<string, unknown>): Record<string, unknown> => {
    const sanitized: Record<string, unknown> = {};
    
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === 'number') {
        sanitized[key] = validateNumericValue(value);
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => 
          typeof item === 'object' ? sanitizeFormData(item) : item
        );
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeFormData(value as Record<string, unknown>);
      } else {
        sanitized[key] = value;
      }
    });
    
    return sanitized;
  }, [sanitizeString, validateNumericValue]);

  return {
    sanitizeString,
    validateNumericValue,
    sanitizeFormData
  };
};
