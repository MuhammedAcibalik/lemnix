/**
 * @fileoverview Shared Utils - Barrel Export
 * @module shared/utils
 * @version 3.0.0
 */

export {
  announceToScreenReader,
  getContrastRatio,
  meetsWCAG_AA,
  meetsWCAG_AAA,
  getAccessibleTextColor,
  checkColorContrast,
  getAriaDateLabel,
  getAriaTimeLabel,
  prefersReducedMotion,
  prefersHighContrast,
  getKeyboardShortcutLabel,
  generateAccessibleId,
} from "./accessibility";
export type { AriaLivePriority } from "./accessibility";
