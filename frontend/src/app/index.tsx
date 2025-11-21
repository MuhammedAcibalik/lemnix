/**
 * @fileoverview App - Main Component
 * @module App
 * @version 2.0.0 - Enterprise Grade Modular Design
 */

import React, { useMemo } from "react";
import { BrowserRouter } from "react-router-dom";
import {
  ThemeProvider,
  CssBaseline,
  createTheme,
  type Theme,
} from "@mui/material";
import { AppRouter } from "./components/AppRouter";
import { ErrorBoundary } from "@/shared/ui/ErrorBoundary";
import { SkipLink } from "@/shared/ui/SkipLink";
import { QueryProvider } from "./providers";
import {
  AdaptiveUIProvider,
  useAdaptiveUIContext,
} from "@/shared/contexts/AdaptiveUIContext";
import { baseTheme, globalStyles } from "./theme";
import { AppProps } from "./types";

/**
 * Inner Theme Provider - Adaptive Theme Engine
 *
 * Creates MUI theme dynamically based on adaptive tokens.
 * When tokens change (due to screen resolution/mode change),
 * the entire theme is regenerated, causing all MUI components
 * to automatically resize and adapt.
 */
const InnerThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { tokens } = useAdaptiveUIContext();

  // Create adaptive theme that updates when tokens change
  const theme = useMemo<Theme>(
    () =>
      createTheme({
        ...baseTheme,
        // Override typography with adaptive font sizes
        typography: {
          ...baseTheme.typography,
          fontSize: tokens.typography.base,
          body1: {
            ...baseTheme.typography.body1,
            fontSize: tokens.typography.base,
          },
          body2: {
            ...baseTheme.typography.body2,
            fontSize: tokens.typography.sm,
          },
          h6: {
            ...baseTheme.typography.h6,
            fontSize: tokens.typography.lg,
          },
          h5: {
            ...baseTheme.typography.h5,
            fontSize: tokens.typography.xl,
          },
        },
        // Override spacing with adaptive spacing unit
        spacing: tokens.spacing.unit,
        // Override shape with adaptive border radius
        shape: {
          ...baseTheme.shape,
          borderRadius: tokens.borderRadius.md,
        },
        // Override component defaults with adaptive sizes
        components: {
          ...(baseTheme.components || {}),
          MuiButton: {
            ...(baseTheme.components?.MuiButton || {}),
            styleOverrides: {
              ...(baseTheme.components?.MuiButton?.styleOverrides || {}),
              root: {
                ...((baseTheme.components?.MuiButton?.styleOverrides
                  ?.root as Record<string, unknown>) || {}),
                minHeight: tokens.components.minTouchTarget,
                paddingInline: tokens.spacing.fn(2),
                fontSize: tokens.typography.sm,
                borderRadius: tokens.borderRadius.md,
              },
            },
          },
          MuiCard: {
            ...(baseTheme.components?.MuiCard || {}),
            styleOverrides: {
              ...(baseTheme.components?.MuiCard?.styleOverrides || {}),
              root: {
                ...((baseTheme.components?.MuiCard?.styleOverrides
                  ?.root as Record<string, unknown>) || {}),
                padding: tokens.components.card.padding,
                borderRadius: tokens.borderRadius.lg,
              },
            },
          },
          MuiCardContent: {
            ...(baseTheme.components?.MuiCardContent || {}),
            styleOverrides: {
              ...(baseTheme.components?.MuiCardContent?.styleOverrides || {}),
              root: {
                ...((baseTheme.components?.MuiCardContent?.styleOverrides
                  ?.root as Record<string, unknown>) || {}),
                padding: tokens.components.card.padding,
                "&:last-child": {
                  paddingBottom: tokens.components.card.padding,
                },
              },
            },
          },
          MuiSvgIcon: {
            ...(baseTheme.components?.MuiSvgIcon || {}),
            styleOverrides: {
              ...(baseTheme.components?.MuiSvgIcon?.styleOverrides || {}),
              root: {
                ...((baseTheme.components?.MuiSvgIcon?.styleOverrides
                  ?.root as Record<string, unknown>) || {}),
                fontSize: tokens.components.icon.md,
              },
            },
          },
          MuiInputBase: {
            ...(baseTheme.components?.MuiInputBase || {}),
            styleOverrides: {
              ...(baseTheme.components?.MuiInputBase?.styleOverrides || {}),
              root: {
                ...((baseTheme.components?.MuiInputBase?.styleOverrides
                  ?.root as Record<string, unknown>) || {}),
                minHeight: tokens.components.input.md,
                fontSize: tokens.typography.base,
                borderRadius: tokens.borderRadius.md,
              },
            },
          },
        },
      }),
    [tokens],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <style>{globalStyles}</style>
      {children}
    </ThemeProvider>
  );
};

/**
 * Modern App Component with Adaptive Theme Engine
 *
 * A fully modularized app component with:
 * - React Query provider (server state)
 * - Adaptive UI Provider (device detection + tokens)
 * - Dynamic Theme Provider (MUI theme that adapts to tokens)
 * - Routing setup
 * - Error boundary
 * - Global styles
 *
 * Architecture:
 * 1. DeviceInfo changes → tokens regenerate
 * 2. Tokens change → theme regenerates
 * 3. Theme changes → all MUI components automatically resize
 */
const AppComponent: React.FC<AppProps> = () => {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error("App Error:", error, errorInfo);
      }}
    >
      <QueryProvider>
        <BrowserRouter
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <AdaptiveUIProvider>
            <InnerThemeProvider>
              <SkipLink />
              <AppRouter />
            </InnerThemeProvider>
          </AdaptiveUIProvider>
        </BrowserRouter>
      </QueryProvider>
    </ErrorBoundary>
  );
};

export const App = AppComponent;
export default AppComponent;
