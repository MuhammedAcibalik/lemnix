/**
 * @fileoverview App Theme Configuration
 * @module App/Theme
 * @version 3.0.0 - Enhanced UI/UX Modernization
 */

// Import v3 theme and design system as primary exports
import { theme, globalStyles, designSystem as DS } from "./theme.v3";

// Export as baseTheme for adaptive theme engine (internal use)
// Also export theme and globalStyles for backward compatibility
export { theme as baseTheme, theme, globalStyles, DS };

// Export design tokens for direct use
export {
  spacing,
  colors,
  typography,
  borderRadius,
  shadows,
  gradients,
  transitions,
  zIndex,
  breakpoints,
  componentSizes,
  glass,
  focus,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
} from "./designSystem.v3";

// Export responsive utilities (maintained from v2)
export {
  responsive,
  gridSpacing,
  gridSizes,
  containerSizes,
  container,
  mediaQuery,
  layouts,
  componentVariants,
  animations,
} from "./responsiveUtils";

// Default export (backward compatibility)
export { theme as default };
