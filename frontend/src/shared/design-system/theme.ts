/**
 * @fileoverview Material-UI Theme Configuration
 * @module shared/design-system
 * @version 3.0.0
 *
 * @description
 * Material-UI theme configuration using Design System v3.0 tokens.
 * Provides light/dark mode support, typography configuration, and component overrides.
 *
 * @example
 * ```tsx
 * import { theme } from '@/shared/design-system';
 * import { ThemeProvider } from '@mui/material/styles';
 *
 * <ThemeProvider theme={theme}>
 *   <App />
 * </ThemeProvider>
 * ```
 */

import { createTheme, alpha } from "@mui/material/styles";
import * as tokens from "./tokens";

// ============================================================================
// SPACING FUNCTION
// ============================================================================

/**
 * Spacing function for Material-UI
 * Converts factor to pixels based on base spacing unit (4px)
 */
const spacing = (factor: number) => factor * tokens.spacing["1"];

// ============================================================================
// SHADOW MAPPING FOR MUI
// ============================================================================

/**
 * Maps design system shadows to Material-UI's 25-level shadow system
 */
const createMuiShadows = (): [
  "none",
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string
] => {
  return [
    tokens.shadows.none,
    tokens.shadows.soft.xs,
    tokens.shadows.soft.sm,
    tokens.shadows.soft.base,
    tokens.shadows.soft.md,
    tokens.shadows.soft.lg,
    tokens.shadows.soft.xl,
    tokens.shadows.soft["2xl"],
    tokens.shadows.crisp.xs,
    tokens.shadows.crisp.sm,
    tokens.shadows.crisp.base,
    tokens.shadows.crisp.md,
    tokens.shadows.crisp.lg,
    tokens.shadows.crisp.xl,
    tokens.shadows.crisp["2xl"],
    tokens.shadows.glow.primary,
    tokens.shadows.glow.secondary,
    tokens.shadows.glow.accent,
    tokens.shadows.glow.success,
    tokens.shadows.glow.warning,
    tokens.shadows.glow.error,
    tokens.shadows.button.default,
    tokens.shadows.button.hover,
    tokens.shadows.card.default,
    tokens.shadows.card.hover,
  ];
};

// ============================================================================
// GLOBAL STYLES
// ============================================================================

/**
 * Global CSS styles applied to the application
 * Includes resets, animations, and accessibility improvements
 */
export const globalStyles = `
  /* CSS Reset Enhancements */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  /* Smooth scrolling */
  html {
    scroll-behavior: smooth;
  }

  /* Body defaults */
  body {
    font-family: ${tokens.fontFamily.sans};
    color: ${tokens.colors.text.primary};
    background-color: ${tokens.colors.background.default};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Focus visible for accessibility */
  *:focus-visible {
    outline: 2px solid ${tokens.colors.primary.main};
    outline-offset: 2px;
  }

  /* Button cursor */
  button {
    cursor: pointer !important;
  }

  /* Link styles */
  a {
    color: ${tokens.colors.text.link};
    text-decoration: none;
    transition: ${tokens.transitions.color};
  }

  a:hover {
    color: ${tokens.colors.text.linkHover};
  }

  /* Selection */
  ::selection {
    background-color: ${alpha(tokens.colors.primary.main, 0.2)};
    color: ${tokens.colors.text.primary};
  }

  /* Scrollbar styling */
  ::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }

  ::-webkit-scrollbar-track {
    background: ${tokens.colors.neutral[100]};
  }

  ::-webkit-scrollbar-thumb {
    background: ${tokens.colors.neutral[300]};
    border-radius: ${tokens.borderRadius.full}px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${tokens.colors.neutral[400]};
  }

  /* Keyframe Animations */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideDown {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes scaleIn {
    from {
      transform: scale(0.95);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes meshFlow {
    0%, 100% {
      transform: scale(1) rotate(0deg);
      opacity: 0.6;
    }
    50% {
      transform: scale(1.05) rotate(2deg);
      opacity: 0.8;
    }
  }
`;

// ============================================================================
// MATERIAL-UI THEME
// ============================================================================

/**
 * Material-UI theme instance
 * Light mode theme with Design System v3.0 tokens
 */
export const theme = createTheme({
  // Color Palette
  palette: {
    mode: "light",
    primary: {
      main: tokens.colors.primary.main,
      light: tokens.colors.primary.light,
      dark: tokens.colors.primary.dark,
      contrastText: tokens.colors.primary.contrast,
      50: tokens.colors.primary[50],
      100: tokens.colors.primary[100],
      200: tokens.colors.primary[200],
      300: tokens.colors.primary[300],
      400: tokens.colors.primary[400],
      500: tokens.colors.primary[500],
      600: tokens.colors.primary[600],
      700: tokens.colors.primary[700],
      800: tokens.colors.primary[800],
      900: tokens.colors.primary[900],
    },
    secondary: {
      main: tokens.colors.secondary.main,
      light: tokens.colors.secondary.light,
      dark: tokens.colors.secondary.dark,
      contrastText: tokens.colors.secondary.contrast,
      50: tokens.colors.secondary[50],
      100: tokens.colors.secondary[100],
      200: tokens.colors.secondary[200],
      300: tokens.colors.secondary[300],
      400: tokens.colors.secondary[400],
      500: tokens.colors.secondary[500],
      600: tokens.colors.secondary[600],
      700: tokens.colors.secondary[700],
      800: tokens.colors.secondary[800],
      900: tokens.colors.secondary[900],
    },
    success: {
      main: tokens.colors.success.main,
      light: tokens.colors.success.light,
      dark: tokens.colors.success.dark,
      contrastText: "#ffffff",
    },
    warning: {
      main: tokens.colors.warning.main,
      light: tokens.colors.warning.light,
      dark: tokens.colors.warning.dark,
      contrastText: "#ffffff",
    },
    error: {
      main: tokens.colors.error.main,
      light: tokens.colors.error.light,
      dark: tokens.colors.error.dark,
      contrastText: "#ffffff",
    },
    info: {
      main: tokens.colors.info.main,
      light: tokens.colors.info.light,
      dark: tokens.colors.info.dark,
      contrastText: "#ffffff",
    },
    background: {
      default: tokens.colors.background.default,
      paper: tokens.colors.background.paper,
    },
    text: {
      primary: tokens.colors.text.primary,
      secondary: tokens.colors.text.secondary,
      disabled: tokens.colors.text.disabled,
    },
    grey: tokens.colors.grey,
    divider: tokens.colors.border.default,
  },

  // Typography
  typography: {
    fontFamily: tokens.fontFamily.sans,
    fontSize: 16,
    fontWeightLight: tokens.fontWeight.light,
    fontWeightRegular: tokens.fontWeight.normal,
    fontWeightMedium: tokens.fontWeight.medium,
    fontWeightBold: tokens.fontWeight.bold,

    h1: {
      ...tokens.typography.heading.h1,
      fontFamily: tokens.fontFamily.display,
    },
    h2: {
      ...tokens.typography.heading.h2,
      fontFamily: tokens.fontFamily.display,
    },
    h3: {
      ...tokens.typography.heading.h3,
      fontFamily: tokens.fontFamily.display,
    },
    h4: {
      ...tokens.typography.heading.h4,
      fontFamily: tokens.fontFamily.display,
    },
    h5: {
      ...tokens.typography.heading.h5,
      fontFamily: tokens.fontFamily.display,
    },
    h6: {
      ...tokens.typography.heading.h6,
      fontFamily: tokens.fontFamily.display,
    },
    body1: tokens.typography.body.base,
    body2: tokens.typography.body.sm,
    button: {
      ...tokens.typography.button,
      textTransform: "none",
    },
    caption: tokens.typography.caption,
    overline: tokens.typography.overline,
  },

  // Spacing
  spacing,

  // Shape
  shape: {
    borderRadius: tokens.borderRadius.md,
  },

  // Shadows
  shadows: createMuiShadows(),

  // Breakpoints
  breakpoints: {
    values: {
      xs: tokens.breakpoints.xs,
      sm: tokens.breakpoints.sm,
      md: tokens.breakpoints.md,
      lg: tokens.breakpoints.lg,
      xl: tokens.breakpoints.xl,
    },
  },

  // Z-Index
  zIndex: {
    mobileStepper: tokens.zIndex.docked as number,
    speedDial: tokens.zIndex.docked as number,
    appBar: tokens.zIndex.sticky as number,
    drawer: tokens.zIndex.dropdown as number,
    modal: tokens.zIndex.modal as number,
    snackbar: tokens.zIndex.toast as number,
    tooltip: tokens.zIndex.tooltip as number,
  },

  // Component Overrides
  components: {
    // ========================================================================
    // BUTTON
    // ========================================================================
    MuiButton: {
      defaultProps: {
        disableElevation: false,
        disableRipple: false,
      },
      styleOverrides: {
        root: {
          borderRadius: tokens.borderRadius.button,
          fontWeight: tokens.fontWeight.semibold,
          textTransform: "none",
          transition: tokens.transitions.all,
          letterSpacing: tokens.letterSpacing.wide,

          "&:focus-visible": {
            outline: `2px solid ${tokens.colors.primary.main}`,
            outlineOffset: 2,
          },
        },
        sizeSmall: {
          ...tokens.componentSizes.button.sm,
        },
        sizeMedium: {
          ...tokens.componentSizes.button.md,
        },
        sizeLarge: {
          ...tokens.componentSizes.button.lg,
        },
        contained: {
          boxShadow: tokens.shadows.button.default,
          background: tokens.gradients.primary.default,
          color: tokens.colors.primary.contrast,

          "&:hover": {
            boxShadow: tokens.shadows.button.hover,
            background: tokens.gradients.primary.soft,
            transform: "translateY(-1px)",
          },
          "&:active": {
            boxShadow: tokens.shadows.button.active,
            transform: "translateY(0)",
          },
          "&.Mui-disabled": {
            opacity: 0.5,
            background: tokens.colors.neutral[300],
            color: tokens.colors.neutral[500],
          },
        },
        containedSecondary: {
          background: tokens.gradients.secondary.default,

          "&:hover": {
            background: tokens.gradients.secondary.soft,
          },
        },
        outlined: {
          borderWidth: 2,
          borderColor: tokens.colors.primary.main,
          backgroundColor: "transparent",

          "&:hover": {
            borderWidth: 2,
            borderColor: tokens.colors.primary.dark,
            backgroundColor: alpha(tokens.colors.primary.main, 0.08),
            transform: "translateY(-1px)",
          },
        },
        text: {
          "&:hover": {
            backgroundColor: alpha(tokens.colors.primary.main, 0.08),
          },
        },
      },
    },

    // ========================================================================
    // CARD
    // ========================================================================
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: tokens.borderRadius.card,
          background: tokens.gradients.surface.white,
          border: `1px solid ${tokens.colors.border.default}`,
          boxShadow: tokens.shadows.card.default,
          transition: tokens.transitions.all,
          overflow: "hidden",

          "&:hover": {
            boxShadow: tokens.shadows.card.hover,
            transform: "translateY(-2px)",
            borderColor: tokens.colors.border.strong,
          },
        },
      },
    },

    // ========================================================================
    // PAPER
    // ========================================================================
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: tokens.borderRadius.md,
          backgroundImage: "none",
        },
        outlined: {
          border: `1px solid ${tokens.colors.border.default}`,
        },
        elevation0: {
          boxShadow: tokens.shadows.none,
        },
        elevation1: {
          boxShadow: tokens.shadows.soft.xs,
        },
        elevation2: {
          boxShadow: tokens.shadows.soft.sm,
        },
        elevation3: {
          boxShadow: tokens.shadows.soft.base,
        },
        elevation4: {
          boxShadow: tokens.shadows.soft.md,
        },
      },
    },

    // ========================================================================
    // TEXT FIELD
    // ========================================================================
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: tokens.borderRadius.input,
          backgroundColor: tokens.colors.surface.base,
          transition: tokens.transitions.all,

          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: tokens.colors.border.strong,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderWidth: 2,
            borderColor: tokens.colors.primary.main,
          },
        },
        input: {
          ...tokens.componentSizes.input.md,
        },
        notchedOutline: {
          borderColor: tokens.colors.border.default,
          transition: tokens.transitions.border,
        },
      },
    },

    // ========================================================================
    // CHIP
    // ========================================================================
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: tokens.borderRadius.chip,
          fontWeight: tokens.fontWeight.medium,
          fontSize: tokens.fontSize.sm,
        },
        sizeSmall: {
          height: tokens.componentSizes.button.xs.height,
          fontSize: tokens.fontSize.xs,
        },
        sizeMedium: {
          height: tokens.componentSizes.button.sm.height,
        },
      },
    },

    // ========================================================================
    // DIALOG
    // ========================================================================
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: tokens.borderRadius.modal,
          boxShadow: tokens.shadows.modal,
        },
      },
    },

    // ========================================================================
    // TOOLTIP
    // ========================================================================
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: tokens.colors.slate[900],
          fontSize: tokens.fontSize.sm,
          padding: `${tokens.spacing["2"]}px ${tokens.spacing["3"]}px`,
          borderRadius: tokens.borderRadius.base,
          boxShadow: tokens.shadows.soft.md,
        },
        arrow: {
          color: tokens.colors.slate[900],
        },
      },
    },

    // ========================================================================
    // TABS
    // ========================================================================
    MuiTabs: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${tokens.colors.border.default}`,
        },
        indicator: {
          height: 3,
          borderRadius: `${tokens.borderRadius.full}px ${tokens.borderRadius.full}px 0 0`,
          backgroundColor: tokens.colors.primary.main,
        },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: tokens.fontWeight.medium,
          fontSize: tokens.fontSize.sm,
          minHeight: 48,
          transition: tokens.transitions.all,

          "&:hover": {
            color: tokens.colors.primary.main,
            backgroundColor: alpha(tokens.colors.primary.main, 0.04),
          },
          "&.Mui-selected": {
            color: tokens.colors.primary.main,
            fontWeight: tokens.fontWeight.semibold,
          },
        },
      },
    },

    // ========================================================================
    // ALERT
    // ========================================================================
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: tokens.borderRadius.md,
          padding: `${tokens.spacing["3"]}px ${tokens.spacing["4"]}px`,
        },
        standardSuccess: {
          backgroundColor: alpha(tokens.colors.success.main, 0.1),
          color: tokens.colors.success.dark,
        },
        standardError: {
          backgroundColor: alpha(tokens.colors.error.main, 0.1),
          color: tokens.colors.error.dark,
        },
        standardWarning: {
          backgroundColor: alpha(tokens.colors.warning.main, 0.1),
          color: tokens.colors.warning.dark,
        },
        standardInfo: {
          backgroundColor: alpha(tokens.colors.info.main, 0.1),
          color: tokens.colors.info.dark,
        },
      },
    },
  },
});

/**
 * Design system reference
 * Provides direct access to all design tokens
 */
export const designSystem = {
  colors: tokens.colors,
  spacing: tokens.spacing,
  typography: tokens.typography,
  shadows: tokens.shadows,
  gradients: tokens.gradients,
  borderRadius: tokens.borderRadius,
  transitions: tokens.transitions,
  zIndex: tokens.zIndex,
  breakpoints: tokens.breakpoints,
  componentSizes: tokens.componentSizes,
  glass: tokens.glass,
  focus: tokens.focus,
};

/**
 * Default export
 */
export default theme;
