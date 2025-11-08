/**
 * @fileoverview Form validation hook
 * @module EnterpriseOptimizationForm/Hooks/useValidation
 * @version 1.0.0
 */

import { useMemo } from 'react';
import { CuttingListItem, OptimizationParams, ValidationErrors } from '../types';
import { validateCuttingListItem, validateConstraints } from '../utils';

export const useValidation = (cuttingList: CuttingListItem[], params: OptimizationParams) => {
  const validationErrors = useMemo((): ValidationErrors => {
    const newErrors: ValidationErrors = {};
    
    // Check if cutting list is empty
    if (cuttingList.length === 0) {
      newErrors.cuttingList = 'En az bir parça eklenmelidir';
    }
    
    // Check if stock lengths are empty
    if (params.stockLengths.length === 0) {
      newErrors.stockLengths = 'En az bir stok uzunluğu belirtilmelidir';
    }

    // Validate each cutting list item
    cuttingList.forEach((item, index) => {
      const itemErrors = validateCuttingListItem(item, index);
      Object.assign(newErrors, itemErrors);
    });

    // Validate constraints
    const constraintErrors = validateConstraints(params.constraints);
    Object.assign(newErrors, constraintErrors);
    
    return newErrors;
  }, [cuttingList, params.stockLengths, params.constraints]);

  const isFormValid = useMemo(() => {
    return Object.keys(validationErrors).length === 0;
  }, [validationErrors]);

  return {
    errors: validationErrors,
    isValid: isFormValid
  };
};
