/**
 * @fileoverview App - Main Component
 * @module App
 * @version 2.0.0 - Enterprise Grade Modular Design
 */

import React from "react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { AppRouter } from "./components/AppRouter";
import { ErrorBoundary } from "@/shared/ui/ErrorBoundary";
import { QueryProvider } from "./providers";
import { theme, globalStyles } from "./theme";
import { AppProps } from "./types";

/**
 * Modern App Component
 *
 * A fully modularized app component with:
 * - React Query provider (server state)
 * - Theme configuration
 * - Routing setup
 * - Error boundary
 * - Global styles
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
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <style>{globalStyles}</style>
            <AppRouter />
          </ThemeProvider>
        </BrowserRouter>
      </QueryProvider>
    </ErrorBoundary>
  );
};

export const App = AppComponent;
export default AppComponent;
