/**
 * Services - Barrel Export
 */

export {
  OptimizationRequestValidationService,
  type OptimizationValidationResult,
} from "./ValidationService";
// Legacy exports for backward compatibility
import {
  OptimizationRequestValidationService,
  type OptimizationValidationResult,
} from "./ValidationService";
export const EnterpriseValidationService = OptimizationRequestValidationService;
export type ValidationResult<T> = OptimizationValidationResult<T>;
