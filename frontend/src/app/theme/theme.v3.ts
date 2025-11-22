/**
 * @fileoverview Material-UI Theme Configuration v3.0
 * @description Enhanced theme with v3 design system
 * @version 3.0.0 - Complete UI/UX Modernization
 */

import { createTheme, alpha } from "@mui/material/styles";
import * as DS from "./designSystem.v3";

// Extend MUI Breakpoint type to include xxl and xxxl
declare module "@mui/material/styles" {
  interface BreakpointOverrides {
    xs: true;
    sm: true;
    md: true;
    lg: true;
    xl: true;
    xxl: true; // Custom breakpoint
    xxxl: true; // Custom breakpoint
  }
}

// ============================================================================
// SPACING FUNCTION
// ============================================================================
const spacing = (factor: number) => factor * DS.spacing["1"];

// ============================================================================
// SHADOW MAPPING FOR MUI
// ============================================================================
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
  string,
] => {
  return [
    DS.shadows.none,
    DS.shadows.soft.xs,
    DS.shadows.soft.sm,
    DS.shadows.soft.base,
    DS.shadows.soft.md,
    DS.shadows.soft.lg,
    DS.shadows.soft.xl,
    DS.shadows.soft["2xl"],
    DS.shadows.crisp.xs,
    DS.shadows.crisp.sm,
    DS.shadows.crisp.base,
    DS.shadows.crisp.md,
    DS.shadows.crisp.lg,
    DS.shadows.crisp.xl,
    DS.shadows.crisp["2xl"],
    DS.shadows.glow.primary,
    DS.shadows.glow.secondary,
    DS.shadows.glow.accent,
    DS.shadows.glow.success,
    DS.shadows.glow.warning,
    DS.shadows.glow.error,
    DS.shadows.button.default,
    DS.shadows.button.hover,
    DS.shadows.card.default,
    DS.shadows.card.hover,
  ];
};

// ============================================================================
// GLOBAL STYLES
// ============================================================================
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
    /* Örnek uygulamadaki gibi line-height ekle */
    line-height: 1.5;
  }

  /* Root container reset - Örnek uygulamadaki gibi height: 100% YOK */
  html, body, #root {
    margin: 0;
    padding: 0;
    /* height: 100% kaldırıldı - overflow sorunlarına yol açıyordu */
    /* Örnek uygulama sadece min-h-screen kullanıyor, fixed height yok */


    
    /* width: 100% ekle - örnek uygulamadaki gibi */
    width: 100%;
    /* overflow-x: hidden - yatay scroll sorunlarını önle */
    overflow-x: hidden;
  }

  /* Body defaults */
  body {
    font-family: ${DS.fontFamily.sans};
    color: ${DS.colors.text.primary};
    background-color: ${DS.colors.background.default};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    /* Örnek uygulamadaki gibi line-height inherit */
    line-height: inherit;
  }

  /* #root için min-height kullan (örnek uygulamadaki min-h-screen gibi) */
  #root {
    min-height: 100vh;
    /* width: 100% - örnek uygulamadaki gibi */
    width: 100%;
  }

  /* Focus visible for accessibility */
  *:focus-visible {
    outline: 2px solid ${DS.colors.primary.main};
    outline-offset: 2px;
  }

  /* Button cursor */
  button {
    cursor: pointer !important;
  }

  /* Link styles */
  a {
    color: ${DS.colors.text.link};
    text-decoration: none;
    transition: ${DS.transitions.color};
  }

  a:hover {
    color: ${DS.colors.text.linkHover};
  }

  /* Selection */
  ::selection {
    background-color: ${alpha(DS.colors.primary.main, 0.2)};
    color: ${DS.colors.text.primary};
  }

  /* Scrollbar styling */
  ::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }

  ::-webkit-scrollbar-track {
    background: ${DS.colors.neutral[100]};
  }

  ::-webkit-scrollbar-thumb {
    background: ${DS.colors.neutral[300]};
    border-radius: ${DS.borderRadius.full}px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${DS.colors.neutral[400]};
  }

  /* Keyframe Animations */
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
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
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
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
export const theme = createTheme({
  // Color Palette
  palette: {
    mode: "light",
    primary: {
      main: DS.colors.primary.main,
      light: DS.colors.primary.light,
      dark: DS.colors.primary.dark,
      contrastText: DS.colors.primary.contrast,
      50: DS.colors.primary[50],
      100: DS.colors.primary[100],
      200: DS.colors.primary[200],
      300: DS.colors.primary[300],
      400: DS.colors.primary[400],
      500: DS.colors.primary[500],
      600: DS.colors.primary[600],
      700: DS.colors.primary[700],
      800: DS.colors.primary[800],
      900: DS.colors.primary[900],
    },
    secondary: {
      main: DS.colors.secondary.main,
      light: DS.colors.secondary.light,
      dark: DS.colors.secondary.dark,
      contrastText: DS.colors.secondary.contrast,
      50: DS.colors.secondary[50],
      100: DS.colors.secondary[100],
      200: DS.colors.secondary[200],
      300: DS.colors.secondary[300],
      400: DS.colors.secondary[400],
      500: DS.colors.secondary[500],
      600: DS.colors.secondary[600],
      700: DS.colors.secondary[700],
      800: DS.colors.secondary[800],
      900: DS.colors.secondary[900],
    },
    success: {
      main: DS.colors.success.main,
      light: DS.colors.success.light,
      dark: DS.colors.success.dark,
      contrastText: "#ffffff",
    },
    warning: {
      main: DS.colors.warning.main,
      light: DS.colors.warning.light,
      dark: DS.colors.warning.dark,
      contrastText: "#ffffff",
    },
    error: {
      main: DS.colors.error.main,
      light: DS.colors.error.light,
      dark: DS.colors.error.dark,
      contrastText: "#ffffff",
    },
    info: {
      main: DS.colors.info.main,
      light: DS.colors.info.light,
      dark: DS.colors.info.dark,
      contrastText: "#ffffff",
    },
    background: {
      default: DS.colors.background.default,
      paper: DS.colors.background.paper,
    },
    text: {
      primary: DS.colors.text.primary,
      secondary: DS.colors.text.secondary,
      disabled: DS.colors.text.disabled,
    },
    grey: DS.colors.grey,
    divider: DS.colors.border.default,
  },

  // Typography
  typography: {
    fontFamily: DS.fontFamily.sans,
    fontSize: 16,
    fontWeightLight: DS.fontWeight.light,
    fontWeightRegular: DS.fontWeight.normal,
    fontWeightMedium: DS.fontWeight.medium,
    fontWeightBold: DS.fontWeight.bold,

    h1: {
      ...DS.typography.heading.h1,
      fontFamily: DS.fontFamily.display,
    },
    h2: {
      ...DS.typography.heading.h2,
      fontFamily: DS.fontFamily.display,
    },
    h3: {
      ...DS.typography.heading.h3,
      fontFamily: DS.fontFamily.display,
    },
    h4: {
      ...DS.typography.heading.h4,
      fontFamily: DS.fontFamily.display,
    },
    h5: {
      ...DS.typography.heading.h5,
      fontFamily: DS.fontFamily.display,
    },
    h6: {
      ...DS.typography.heading.h6,
      fontFamily: DS.fontFamily.display,
    },
    body1: DS.typography.body.base,
    body2: DS.typography.body.sm,
    button: {
      ...DS.typography.button,
      textTransform: "none",
    },
    caption: DS.typography.caption,
    overline: DS.typography.overline,
  },

  // Spacing
  spacing,

  // Shape
  shape: {
    borderRadius: DS.borderRadius.md,
  },

  // Shadows
  shadows: createMuiShadows(),

  // Breakpoints - Design System v3
  breakpoints: {
    values: {
      xs: DS.breakpoints.xs, // 320
      sm: DS.breakpoints.sm, // 480
      md: DS.breakpoints.md, // 768
      lg: DS.breakpoints.lg, // 1024
      xl: DS.breakpoints.xl, // 1366
      xxl: DS.breakpoints.xxl, // 1920
      xxxl: DS.breakpoints.xxxl, // 2560
    },
  },

  // Z-Index
  zIndex: {
    mobileStepper: DS.zIndex.docked as number,
    speedDial: DS.zIndex.docked as number,
    appBar: DS.zIndex.sticky as number,
    drawer: DS.zIndex.dropdown as number,
    modal: DS.zIndex.modal as number,
    snackbar: DS.zIndex.toast as number,
    tooltip: DS.zIndex.tooltip as number,
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
          borderRadius: DS.borderRadius.button,
          fontWeight: DS.fontWeight.semibold,
          textTransform: "none",
          transition: DS.transitions.all,
          letterSpacing: DS.letterSpacing.wide,

          "&:focus-visible": {
            outline: `2px solid ${DS.colors.primary.main}`,
            outlineOffset: 2,
          },
        },
        sizeSmall: {
          ...DS.componentSizes.button.sm,
        },
        sizeMedium: {
          ...DS.componentSizes.button.md,
        },
        sizeLarge: {
          ...DS.componentSizes.button.lg,
        },
        contained: {
          boxShadow: DS.shadows.button.default,
          background: DS.gradients.primary.default,
          color: DS.colors.primary.contrast,

          "&:hover": {
            boxShadow: DS.shadows.button.hover,
            background: DS.gradients.primary.soft,
            transform: "translateY(-1px)",
          },
          "&:active": {
            boxShadow: DS.shadows.button.active,
            transform: "translateY(0)",
          },
          "&.Mui-disabled": {
            opacity: 0.5,
            background: DS.colors.neutral[300],
            color: DS.colors.neutral[500],
          },
        },
        containedSecondary: {
          background: DS.gradients.secondary.default,

          "&:hover": {
            background: DS.gradients.secondary.soft,
          },
        },
        outlined: {
          borderWidth: 2,
          borderColor: DS.colors.primary.main,
          backgroundColor: "transparent",

          "&:hover": {
            borderWidth: 2,
            borderColor: DS.colors.primary.dark,
            backgroundColor: alpha(DS.colors.primary.main, 0.08),
            transform: "translateY(-1px)",
          },
        },
        text: {
          "&:hover": {
            backgroundColor: alpha(DS.colors.primary.main, 0.08),
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
          borderRadius: DS.borderRadius.card,
          background: DS.gradients.surface.white,
          border: `1px solid ${DS.colors.border.default}`,
          boxShadow: DS.shadows.card.default,
          transition: DS.transitions.all,
          overflow: "hidden",

          "&:hover": {
            boxShadow: DS.shadows.card.hover,
            transform: "translateY(-2px)",
            borderColor: DS.colors.border.strong,
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
          borderRadius: DS.borderRadius.md,
          backgroundImage: "none",
        },
        outlined: {
          border: `1px solid ${DS.colors.border.default}`,
        },
        elevation0: {
          boxShadow: DS.shadows.none,
        },
        elevation1: {
          boxShadow: DS.shadows.soft.sm,
        },
        elevation2: {
          boxShadow: DS.shadows.soft.base,
        },
        elevation3: {
          boxShadow: DS.shadows.soft.md,
        },
        elevation4: {
          boxShadow: DS.shadows.soft.lg,
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
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: DS.borderRadius.input,
            transition: DS.transitions.all,
            backgroundColor: DS.colors.background.paper,

            "& fieldset": {
              borderColor: DS.colors.border.default,
              borderWidth: 1,
              transition: DS.transitions.border,
            },
            "&:hover fieldset": {
              borderColor: DS.colors.primary.main,
            },
            "&.Mui-focused fieldset": {
              borderColor: DS.colors.primary.main,
              borderWidth: 2,
            },
            "&.Mui-error fieldset": {
              borderColor: DS.colors.error.main,
            },
          },
          "& .MuiInputLabel-root": {
            color: DS.colors.text.secondary,
            fontWeight: DS.fontWeight.medium,

            "&.Mui-focused": {
              color: DS.colors.primary.main,
            },
            "&.Mui-error": {
              color: DS.colors.error.main,
            },
          },
        },
      },
    },

    // ========================================================================
    // SELECT
    // ========================================================================
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: DS.borderRadius.input,
        },
      },
    },

    // ========================================================================
    // APP BAR
    // ========================================================================
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundColor: DS.glass.light.background,
          backdropFilter: DS.glass.light.backdropFilter,
          borderBottom: `1px solid ${DS.colors.border.muted}`,
          boxShadow: DS.shadows.soft.sm,
        },
        colorPrimary: {
          background: DS.gradients.primary.default,
          color: DS.colors.primary.contrast,
        },
      },
    },

    // ========================================================================
    // DRAWER
    // ========================================================================
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `1px solid ${DS.colors.border.default}`,
          backgroundColor: DS.colors.background.paper,
        },
      },
    },

    // ========================================================================
    // DIALOG
    // ========================================================================
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: DS.borderRadius.modal,
          boxShadow: DS.shadows.modal,
        },
      },
    },

    // ========================================================================
    // MENU
    // ========================================================================
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: DS.borderRadius.lg,
          boxShadow: DS.shadows.dropdown,
          border: `1px solid ${DS.colors.border.muted}`,
          marginTop: DS.spacing["2"],
        },
        list: {
          padding: DS.spacing["2"],
        },
      },
    },

    // ========================================================================
    // MENU ITEM
    // ========================================================================
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: DS.borderRadius.sm,
          margin: `${DS.spacing["1"]}px 0`,
          padding: `${DS.spacing["2"]}px ${DS.spacing["3"]}px`,
          transition: DS.transitions.fast,

          "&:hover": {
            backgroundColor: alpha(DS.colors.primary.main, 0.08),
          },
          "&.Mui-selected": {
            backgroundColor: alpha(DS.colors.primary.main, 0.12),

            "&:hover": {
              backgroundColor: alpha(DS.colors.primary.main, 0.16),
            },
          },
        },
      },
    },

    // ========================================================================
    // CHIP
    // ========================================================================
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: DS.borderRadius.chip,
          fontWeight: DS.fontWeight.medium,
          transition: DS.transitions.fast,
        },
        filled: {
          "&.MuiChip-colorPrimary": {
            background: DS.gradients.primary.subtle,
            color: DS.colors.primary.dark,
          },
          "&.MuiChip-colorSecondary": {
            background: DS.gradients.secondary.subtle,
            color: DS.colors.secondary.dark,
          },
        },
      },
    },

    // ========================================================================
    // TOOLTIP
    // ========================================================================
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: DS.colors.slate[800],
          borderRadius: DS.borderRadius.md,
          fontSize: DS.fontSize.xs,
          fontWeight: DS.fontWeight.medium,
          padding: `${DS.spacing["2"]}px ${DS.spacing["3"]}px`,
          boxShadow: DS.shadows.soft.lg,
        },
        arrow: {
          color: DS.colors.slate[800],
        },
      },
    },

    // ========================================================================
    // ALERT
    // ========================================================================
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: DS.borderRadius.lg,
          padding: `${DS.spacing["3"]}px ${DS.spacing["4"]}px`,
          fontWeight: DS.fontWeight.medium,
        },
        standardSuccess: {
          backgroundColor: alpha(DS.colors.success.main, 0.1),
          color: DS.colors.success.dark,
          border: `1px solid ${alpha(DS.colors.success.main, 0.3)}`,
        },
        standardWarning: {
          backgroundColor: alpha(DS.colors.warning.main, 0.1),
          color: DS.colors.warning.dark,
          border: `1px solid ${alpha(DS.colors.warning.main, 0.3)}`,
        },
        standardError: {
          backgroundColor: alpha(DS.colors.error.main, 0.1),
          color: DS.colors.error.dark,
          border: `1px solid ${alpha(DS.colors.error.main, 0.3)}`,
        },
        standardInfo: {
          backgroundColor: alpha(DS.colors.info.main, 0.1),
          color: DS.colors.info.dark,
          border: `1px solid ${alpha(DS.colors.info.main, 0.3)}`,
        },
      },
    },

    // ========================================================================
    // TABS
    // ========================================================================
    MuiTabs: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${DS.colors.border.default}`,
        },
        indicator: {
          height: 3,
          borderRadius: DS.borderRadius.full,
          background: DS.gradients.primary.default,
        },
      },
    },

    // ========================================================================
    // TAB
    // ========================================================================
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: DS.fontWeight.semibold,
          fontSize: DS.fontSize.sm,
          minHeight: 48,
          transition: DS.transitions.fast,

          "&:hover": {
            color: DS.colors.primary.main,
            backgroundColor: alpha(DS.colors.primary.main, 0.04),
          },
          "&.Mui-selected": {
            color: DS.colors.primary.main,
          },
        },
      },
    },

    // ========================================================================
    // TABLE
    // ========================================================================
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${DS.colors.border.muted}`,
          padding: `${DS.spacing["4"]}px ${DS.spacing["4"]}px`,
        },
        head: {
          fontWeight: DS.fontWeight.semibold,
          color: DS.colors.text.secondary,
          backgroundColor: DS.colors.surface.elevated1,
          fontSize: DS.fontSize.xs,
          textTransform: "uppercase",
          letterSpacing: DS.letterSpacing.wider,
        },
      },
    },

    // ========================================================================
    // SWITCH
    // ========================================================================
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 48,
          height: 28,
          padding: 0,
        },
        switchBase: {
          padding: 2,
          "&.Mui-checked": {
            transform: "translateX(20px)",
            "& + .MuiSwitch-track": {
              backgroundColor: DS.colors.primary.main,
              opacity: 1,
            },
          },
        },
        thumb: {
          width: 24,
          height: 24,
          boxShadow: DS.shadows.soft.sm,
        },
        track: {
          borderRadius: DS.borderRadius.pill,
          backgroundColor: DS.colors.neutral[300],
          opacity: 1,
        },
      },
    },

    // ========================================================================
    // CHECKBOX
    // ========================================================================
    MuiCheckbox: {
      styleOverrides: {
        root: {
          borderRadius: DS.borderRadius.sm,

          "&:hover": {
            backgroundColor: alpha(DS.colors.primary.main, 0.08),
          },
        },
      },
    },

    // ========================================================================
    // RADIO
    // ========================================================================
    MuiRadio: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: alpha(DS.colors.primary.main, 0.08),
          },
        },
      },
    },

    // ========================================================================
    // LINEAR PROGRESS
    // ========================================================================
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 8,
          borderRadius: DS.borderRadius.full,
          backgroundColor: DS.colors.neutral[200],
        },
        bar: {
          borderRadius: DS.borderRadius.full,
          background: DS.gradients.primary.default,
        },
      },
    },

    // ========================================================================
    // CIRCULAR PROGRESS
    // ========================================================================
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: DS.colors.primary.main,
        },
      },
    },
  },
});

// ============================================================================
// EXPORTS
// ============================================================================
export { DS as designSystem };
export default theme;
