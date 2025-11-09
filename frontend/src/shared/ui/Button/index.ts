/**
 * @fileoverview Button Component - Barrel Export
 * @module shared/ui/Button
 */

// Export v3 as primary
export { ButtonV3 as Button, ButtonV3 } from "./Button.v3";
export type { ButtonV3Props as ButtonProps } from "./Button.v3";

// Legacy exports for backward compatibility
export {
  Button as ButtonLegacy,
  PrimaryButton,
  SecondaryButton,
  TextButton,
  DangerButton,
  SuccessButton,
} from "./Button";

