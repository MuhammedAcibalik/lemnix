/**
 * Widget Error Boundary
 * Granular error boundary for widget-level error isolation
 *
 * @module shared/ui/ErrorBoundary
 * @version 1.0.0 - Granular Error Isolation (P2-6)
 */

import React, { Component, type ErrorInfo, type ReactNode } from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  AlertTitle,
  Stack,
  Collapse,
  IconButton,
} from "@mui/material";
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandIcon,
  BugReport as DebugIcon,
} from "@mui/icons-material";

/**
 * Widget Error Boundary Props
 */
export interface WidgetErrorBoundaryProps {
  readonly children: ReactNode;
  readonly widgetName: string;
  readonly fallback?: ReactNode;
  readonly onError?: (error: Error, errorInfo: ErrorInfo) => void;
  readonly showDetails?: boolean;
  readonly recoveryAction?: () => void;
}

/**
 * Widget Error Boundary State
 */
interface WidgetErrorBoundaryState {
  readonly hasError: boolean;
  readonly error: Error | null;
  readonly errorInfo: ErrorInfo | null;
  readonly errorId: string;
  readonly detailsExpanded: boolean;
}

/**
 * Widget Error Boundary Component
 *
 * Single Responsibility: Isolate errors to widget level
 *
 * Features:
 * - Widget-level error isolation (prevents app-wide crash)
 * - Compact error UI (doesn't take over entire page)
 * - Widget name identification
 * - Expandable error details (development)
 * - Recovery action support
 * - Error telemetry
 *
 * Architecture:
 * - Class component (required for error boundary)
 * - Minimal UI footprint
 * - Graceful degradation
 * - Production-safe (hides technical details)
 */
export class WidgetErrorBoundary extends Component<
  WidgetErrorBoundaryProps,
  WidgetErrorBoundaryState
> {
  constructor(props: WidgetErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
      detailsExpanded: false,
    };
  }

  static getDerivedStateFromError(
    error: Error,
  ): Partial<WidgetErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `widget_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error(`[${this.props.widgetName}] Error:`, error, errorInfo);
    }

    // Update state with error info
    this.setState({ errorInfo });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Log to telemetry in production
    if (process.env.NODE_ENV === "production") {
      this.logWidgetError(error, errorInfo);
    }
  }

  private logWidgetError = (error: Error, errorInfo: ErrorInfo) => {
    // Telemetry payload
    const payload = {
      widgetName: this.props.widgetName,
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    console.error("[Widget Error]", payload);
    // TODO: Send to Sentry/LogRocket
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
      detailsExpanded: false,
    });

    // Call recovery action if provided
    this.props.recoveryAction?.();
  };

  private toggleDetails = () => {
    this.setState((prev) => ({
      ...prev,
      detailsExpanded: !prev.detailsExpanded,
    }));
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default compact widget error UI
      return (
        <Box
          sx={{
            p: 3,
            borderRadius: 2,
            border: "2px solid",
            borderColor: "error.light",
            bgcolor: "error.lighter",
          }}
        >
          <Stack spacing={2}>
            {/* Error Header */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <ErrorIcon sx={{ color: "error.main", fontSize: 28 }} />
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="error.main"
                >
                  {this.props.widgetName} - Hata
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Bu bileşen yüklenemedi
                </Typography>
              </Box>

              {/* Debug Toggle (Development Only) */}
              {process.env.NODE_ENV === "development" && this.state.error && (
                <IconButton
                  size="small"
                  onClick={this.toggleDetails}
                  sx={{ color: "text.secondary" }}
                >
                  <ExpandIcon
                    sx={{
                      transform: this.state.detailsExpanded
                        ? "rotate(180deg)"
                        : "none",
                      transition: "transform 0.2s",
                    }}
                  />
                </IconButton>
              )}
            </Box>

            {/* Error Message */}
            <Alert
              severity="error"
              variant="outlined"
              sx={{
                "& .MuiAlert-message": {
                  width: "100%",
                },
              }}
            >
              <AlertTitle sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
                {this.state.error?.message || "Bilinmeyen hata"}
              </AlertTitle>
              <Typography variant="caption" color="text.secondary">
                Hata ID: {this.state.errorId}
              </Typography>
            </Alert>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <Collapse in={this.state.detailsExpanded}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: "grey.100",
                    border: "1px solid",
                    borderColor: "grey.300",
                  }}
                >
                  <Stack spacing={1}>
                    <Typography
                      variant="caption"
                      fontWeight="bold"
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <DebugIcon sx={{ fontSize: 14 }} />
                      Stack Trace:
                    </Typography>
                    <Typography
                      component="pre"
                      variant="caption"
                      sx={{
                        fontFamily: "monospace",
                        fontSize: "0.6875rem",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        maxHeight: 200,
                        overflow: "auto",
                        m: 0,
                      }}
                    >
                      {this.state.error.stack}
                    </Typography>

                    {this.state.errorInfo?.componentStack && (
                      <>
                        <Typography
                          variant="caption"
                          fontWeight="bold"
                          sx={{ mt: 1 }}
                        >
                          Component Stack:
                        </Typography>
                        <Typography
                          component="pre"
                          variant="caption"
                          sx={{
                            fontFamily: "monospace",
                            fontSize: "0.6875rem",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            maxHeight: 150,
                            overflow: "auto",
                            m: 0,
                          }}
                        >
                          {this.state.errorInfo.componentStack}
                        </Typography>
                      </>
                    )}
                  </Stack>
                </Box>
              </Collapse>
            )}

            {/* Action Buttons */}
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="contained"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={this.handleReset}
                sx={{ flex: 1 }}
              >
                Yeniden Dene
              </Button>

              {this.props.showDetails && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => console.log("Error Details:", this.state)}
                  sx={{ flex: 1 }}
                >
                  Detayları Logla
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC: Wrap component with widget error boundary
 */
export function withWidgetErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  widgetName: string,
  options?: Omit<WidgetErrorBoundaryProps, "children" | "widgetName">,
) {
  const WrappedComponent = (props: P) => (
    <WidgetErrorBoundary widgetName={widgetName} {...options}>
      <Component {...props} />
    </WidgetErrorBoundary>
  );

  WrappedComponent.displayName = `withWidgetErrorBoundary(${widgetName})`;
  return WrappedComponent;
}
