/**
 * Error Boundary Component
 *
 * Catches React errors and displays fallback UI.
 * Prevents entire app from crashing due to component errors.
 *
 * @module shared/ui/ErrorBoundary
 */

import React, { Component, type ReactNode, type ErrorInfo } from "react";
import { Box, Button, Typography, Paper, Container } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import HomeIcon from "@mui/icons-material/Home";

/**
 * Error Boundary Props
 */
interface ErrorBoundaryProps {
  readonly children: ReactNode;
  readonly fallback?: ReactNode;
  readonly onError?: (error: Error, errorInfo: ErrorInfo) => void;
  readonly level?: "app" | "route" | "widget";
}

/**
 * Error Boundary State
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary level="route">
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error("💥 Error Boundary caught an error:", error);
      console.error("Error Info:", errorInfo);
    }

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Send to error tracking service (Sentry, etc.)
    if (import.meta.env.VITE_SENTRY_DSN) {
      // Integration with Sentry or similar
      this.reportToErrorService(error, errorInfo);
    }

    this.setState({ errorInfo });
  }

  private reportToErrorService(error: Error, errorInfo: ErrorInfo): void {
    // Send to error tracking service
    // Example: Sentry.captureException(error, { extra: errorInfo });

    // Or custom endpoint
    if (import.meta.env.VITE_ERROR_ENDPOINT) {
      fetch(import.meta.env.VITE_ERROR_ENDPOINT, {
        method: "POST",
        body: JSON.stringify({
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name,
          },
          errorInfo: {
            componentStack: errorInfo.componentStack,
          },
          level: this.props.level,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      }).catch(() => {
        // Silently fail
      });
    }
  }

  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleGoHome = (): void => {
    window.location.href = "/";
  };

  private handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      const { level = "widget" } = this.props;
      const isAppLevel = level === "app";

      return (
        <Container maxWidth="md">
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: isAppLevel ? "100vh" : "400px",
              padding: 3,
            }}
          >
            <Paper
              elevation={3}
              sx={{
                padding: 4,
                textAlign: "center",
                maxWidth: 600,
                width: "100%",
              }}
            >
              <ErrorOutlineIcon
                sx={{
                  fontSize: 80,
                  color: "error.main",
                  marginBottom: 2,
                }}
              />

              <Typography variant="h4" gutterBottom fontWeight="bold">
                Bir Hata Oluştu
              </Typography>

              <Typography variant="body1" color="text.secondary" paragraph>
                {isAppLevel
                  ? "Üzgünüz, bir şeyler ters gitti. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin."
                  : "Bu bölümü yüklerken bir sorun oluştu. Lütfen tekrar deneyin."}
              </Typography>

              {import.meta.env.DEV && this.state.error && (
                <Box
                  sx={{
                    marginTop: 3,
                    padding: 2,
                    backgroundColor: "grey.100",
                    borderRadius: 1,
                    textAlign: "left",
                    maxHeight: 200,
                    overflow: "auto",
                  }}
                >
                  <Typography
                    variant="caption"
                    component="pre"
                    sx={{ margin: 0 }}
                  >
                    {this.state.error.toString()}
                    {"\n\n"}
                    {this.state.errorInfo?.componentStack}
                  </Typography>
                </Box>
              )}

              <Box
                sx={{
                  marginTop: 3,
                  display: "flex",
                  gap: 2,
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                {!isAppLevel && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<RefreshIcon />}
                    onClick={this.handleReset}
                  >
                    Tekrar Dene
                  </Button>
                )}

                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<HomeIcon />}
                  onClick={this.handleGoHome}
                >
                  Ana Sayfa
                </Button>

                {isAppLevel && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<RefreshIcon />}
                    onClick={this.handleReload}
                  >
                    Sayfayı Yenile
                  </Button>
                )}
              </Box>
            </Paper>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}
