/**
 * @fileoverview App Theme Configuration
 * @module App/Theme
 * @version 2.0.0 - Enterprise Grade Modular Design
 */

import { createTheme } from "@mui/material";
import * as DS from "./designSystem.v2";
import {
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

const getColorScale = (scale: {
  main: string;
  light: string;
  dark: string;
  contrast: string;
}) => ({
  main: scale.main,
  light: scale.light,
  dark: scale.dark,
  contrastText: scale.contrast,
});

const getColorWithFallback = (
  colorObject: Record<string, string>,
  key: string,
  fallback: string,
): string => {
  return colorObject[key] || fallback;
};

const getPropertyWithFallback = (
  obj: Record<string, unknown>,
  key: string,
  fallback: string | number,
): string | number => {
  return (obj[key] as string | number) || fallback;
};

const spacing = (factor: number) => factor * DS.spacing["1"];

const baseShadows: string[] = [
  DS.shadows.none,
  DS.shadows.soft.sm,
  DS.shadows.soft.md,
  DS.shadows.soft.lg,
  DS.shadows.soft.xl,
  DS.shadows.soft["2xl"],
  DS.shadows.crisp.sm,
  DS.shadows.crisp.md,
  DS.shadows.crisp.lg,
  DS.shadows.glow.primary,
  DS.shadows.glow.success,
  DS.shadows.glow.warning,
  DS.shadows.glow.error,
  DS.shadows.glow.accent,
  DS.shadows.inner.sm,
  DS.shadows.inner.md,
  DS.shadows.button,
  DS.shadows.card,
  DS.shadows.cardHover,
];

// MUI requires exactly 25 shadow values
const muiShadows = [
  ...baseShadows,
  ...Array(25 - baseShadows.length).fill(DS.shadows.soft["2xl"]),
] as unknown as [
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
];

export const globalStyles = `
  @keyframes lemnixRotate {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  button { cursor: pointer !important; }
`;

export const theme = createTheme({
  palette: {
    primary: {
      ...getColorScale(DS.colors.primary),
    },
    secondary: {
      ...getColorScale(DS.colors.secondary),
    },
    success: {
      ...getColorScale(DS.colors.secondary),
      main: DS.colors.success.main,
      light: DS.colors.success[300],
      dark: DS.colors.success[700],
    },
    warning: {
      ...getColorScale(DS.colors.support),
      main: DS.colors.warning.main,
      light: DS.colors.warning[300],
      dark: DS.colors.warning[700],
    },
    error: {
      main: DS.colors.error.main,
      light: DS.colors.error[300],
      dark: DS.colors.error[700],
      contrastText: "#ffffff",
    },
    info: {
      ...getColorScale(DS.colors.primary),
      main: DS.colors.info.main,
      light: DS.colors.info[300],
      dark: DS.colors.info[700],
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
    grey: {
      50: DS.colors.neutral[50],
      100: DS.colors.neutral[100],
      200: DS.colors.neutral[200],
      300: DS.colors.neutral[300],
      400: DS.colors.neutral[400],
      500: DS.colors.neutral[500],
      600: DS.colors.neutral[600],
      700: DS.colors.neutral[700],
      800: DS.colors.neutral[800],
      900: DS.colors.neutral[900],
    },
  },
  typography: {
    fontFamily: DS.typography.fontFamily.primary,
    h1: {
      ...DS.typography.heading.h1,
    },
    h2: {
      ...DS.typography.heading.h2,
    },
    h3: {
      ...DS.typography.heading.h3,
    },
    h4: {
      ...DS.typography.heading.h4,
    },
    h5: {
      ...DS.typography.heading.h5,
    },
    h6: {
      ...DS.typography.heading.h6,
    },
    body1: {
      ...DS.typography.body.base,
    },
    body2: {
      ...DS.typography.body.small,
    },
    button: {
      fontSize: DS.typography.label.prominent.fontSize,
      fontWeight: DS.typography.label.prominent.fontWeight,
      textTransform: "none",
      letterSpacing: DS.typography.label.prominent.letterSpacing,
    },
    caption: {
      fontSize: DS.typography.label.default.fontSize,
      fontWeight: DS.typography.label.default.fontWeight,
      letterSpacing: DS.typography.label.default.letterSpacing,
    },
    overline: {
      fontSize: DS.typography.label.default.fontSize,
      fontWeight: DS.typography.label.default.fontWeight,
      letterSpacing: DS.typography.label.default.letterSpacing,
      textTransform: DS.typography.label.default.textTransform,
    },
  },
  spacing,
  shape: {
    borderRadius: DS.borderRadius.md,
  },
  shadows: muiShadows as unknown as typeof muiShadows,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: `${DS.borderRadius.button}px`,
          fontWeight: DS.typography.fontWeight.semibold,
          textTransform: "none",
          transition: DS.transitions.base,
          boxShadow: DS.shadows.none,
          "&:hover": {
            boxShadow: DS.shadows.soft.md,
          },
          "&:disabled": {
            opacity: 0.5,
            boxShadow: DS.shadows.none,
          },
        },
        contained: {
          background: DS.gradients.primary,
          color: DS.colors.primary.contrast,
          "&:hover": {
            background: DS.gradients.primaryHover,
            opacity: 0.95,
          },
        },
        outlined: {
          borderWidth: 2,
          borderColor: DS.colors.primary.main,
          "&:hover": {
            borderColor: DS.colors.primary.dark,
            backgroundColor: DS.colors.surface.elevated1,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: `${DS.borderRadius.card}px`,
          background: DS.gradients.card,
          border: `1px solid ${DS.colors.neutral[200]}`,
          boxShadow: DS.shadows.soft.md,
          transition: DS.transitions.base,
          "&:hover": {
            boxShadow: DS.shadows.soft.lg,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: `${DS.borderRadius.md}px`,
          background: DS.colors.background.paper,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: `${DS.borderRadius.input}px`,
            transition: DS.transitions.base,
            "& fieldset": {
              borderColor: DS.colors.neutral[200],
            },
            "&:hover fieldset": {
              borderColor: DS.colors.primary.main,
            },
            "&.Mui-focused fieldset": {
              borderColor: DS.colors.primary.main,
              boxShadow: DS.focus.ring,
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: DS.shadows.none,
          borderBottom: DS.glass.border,
          backdropFilter: DS.glass.backdropFilter,
          backgroundColor: DS.glass.background,
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          "& .MuiSelect-select": {
            borderRadius: `${DS.borderRadius.input}px`,
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: `${DS.borderRadius.md}px`,
          boxShadow: DS.shadows.soft.lg,
        },
      },
    },
  },
});

export {
  colors,
  spacing,
  typography,
  componentSizes,
  shadows,
  borderRadius,
  gradients,
  zIndex,
  transitions,
  glass,
  focus,
  breakpoints,
} from "./designSystem.v2";
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
};
