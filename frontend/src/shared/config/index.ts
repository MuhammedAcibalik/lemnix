/**
 * LEMNİX Shared Config Barrel Export
 *
 * @module shared/config
 * @version 1.0.0 - FSD Compliant
 */

export {
  API_CONFIG,
  API_BASE_URL,
  STORAGE_KEYS,
  PAGINATION,
  DEBOUNCE,
  HTTP_STATUS,
  DATE_FORMATS,
  REGEX,
} from "./constants";

// Export responsive breakpoints
export {
  breakpoints,
  mediaQuery,
  getCurrentBreakpoint,
  type Breakpoint,
} from "./breakpoints";
