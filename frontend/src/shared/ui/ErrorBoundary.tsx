/**
 * @fileoverview Error Boundary Component
 * @module ErrorBoundary
 * @version 1.0.0
 */

import React, { Component, ErrorInfo, ReactNode } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Alert,
  AlertTitle,
  Divider,
} from "@mui/material";
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  BugReport as BugReportIcon,
} from "@mui/icons-material";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external service in production
    if (process.env.NODE_ENV === "production") {
      this.logErrorToService(error, errorInfo);
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // TODO: Implement external error logging service
    // Example: Sentry, LogRocket, etc.
    console.error("Production error logged:", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 3,
            bgcolor: "background.default",
          }}
        >
          <Card
            sx={{
              maxWidth: 600,
              width: "100%",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3} alignItems="center" textAlign="center">
                {/* Error Icon */}
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    bgcolor: "error.light",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2,
                  }}
                >
                  <ErrorIcon sx={{ fontSize: 40, color: "error.main" }} />
                </Box>

                {/* Error Title */}
                <Typography variant="h4" fontWeight="bold" color="error.main">
                  Oops! Bir Hata Oluştu
                </Typography>

                <Typography variant="body1" color="text.secondary">
                  Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin veya ana
                  sayfaya dönün.
                </Typography>

                {/* Error Details (Development Only) */}
                {process.env.NODE_ENV === "development" && this.state.error && (
                  <Alert severity="error" sx={{ width: "100%" }}>
                    <AlertTitle>Geliştirme Modu - Hata Detayları</AlertTitle>
                    <Typography
                      variant="caption"
                      component="pre"
                      sx={{
                        fontFamily: "monospace",
                        fontSize: "0.75rem",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {this.state.error.message}
                      {this.state.error.stack &&
                        `\n\nStack Trace:\n${this.state.error.stack}`}
                    </Typography>
                  </Alert>
                )}

                <Divider sx={{ width: "100%" }} />

                {/* Action Buttons */}
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  sx={{ width: "100%" }}
                >
                  <Button
                    variant="contained"
                    startIcon={<RefreshIcon />}
                    onClick={this.handleReset}
                    sx={{ flex: 1 }}
                  >
                    Tekrar Dene
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<HomeIcon />}
                    onClick={this.handleGoHome}
                    sx={{ flex: 1 }}
                  >
                    Ana Sayfa
                  </Button>

                  <Button
                    variant="text"
                    startIcon={<BugReportIcon />}
                    onClick={this.handleReload}
                    sx={{ flex: 1 }}
                  >
                    Sayfayı Yenile
                  </Button>
                </Stack>

                {/* Error ID */}
                {this.state.errorId && (
                  <Typography variant="caption" color="text.secondary">
                    Hata ID: {this.state.errorId}
                  </Typography>
                )}

                {/* Help Text */}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  Sorun devam ederse, lütfen teknik destek ile iletişime geçin.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, "children">,
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Hook for error handling in functional components
export const useErrorHandler = () => {
  const handleError = React.useCallback(
    (error: Error, errorInfo?: Record<string, unknown>) => {
      console.error("Error caught by useErrorHandler:", error, errorInfo);

      // Log to external service
      if (process.env.NODE_ENV === "production") {
        // TODO: Implement external error logging
        console.error("Production error logged:", error);
      }
    },
    [],
  );

  return handleError;
};
