/**
 * LEMNİX Design System - Main Export
 * Tüm tasarım sistemi bileşenlerini tek yerden export eder
 */

// Design System Core
export * from './designSystem';
export * from './responsiveUtils';

// Re-exports for convenience
export {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
  gradients,
  componentSizes,
  responsiveSpacing,
} from './designSystem';

export {
  responsive,
  gridSpacing,
  gridSizes,
  layouts,
  componentVariants,
  animations,
} from './responsiveUtils';

// Type definitions for theme extensions
declare module '@mui/material/styles' {
  interface Palette {
    neutral: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
  }

  interface PaletteOptions {
    neutral?: {
      50?: string;
      100?: string;
      200?: string;
      300?: string;
      400?: string;
      500?: string;
      600?: string;
      700?: string;
      800?: string;
      900?: string;
    };
  }
}
