/**
 * Sentry Error Tracking Integration (Frontend)
 * @fileoverview Sentry integration for error tracking and performance monitoring
 * @module shared/lib/monitoring/sentry
 */

import { env, isProduction } from "@/shared/config/env";

/**
 * Sentry configuration
 * To enable Sentry:
 * 1. Install: npm install @sentry/react
 * 2. Set VITE_SENTRY_DSN environment variable
 * 3. Uncomment and configure the initialization code below
 */

const sentryInitialized = false;

/**
 * Initialize Sentry error tracking
 */
export function initializeSentry(): void {
  const sentryDsn = env.VITE_SENTRY_DSN;

  if (!sentryDsn) {
    console.info("Sentry DSN not configured, error tracking disabled");
    return;
  }

  try {
    // Uncomment when @sentry/react is installed
    /*
    import * as Sentry from "@sentry/react";

    Sentry.init({
      dsn: sentryDsn,
      environment: env.MODE,
      integrations: [
        new Sentry.BrowserTracing({
          // Set tracing origins
          tracePropagationTargets: ["localhost", /^https:\/\/.*\.lemnix\.com/],
        }),
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      tracesSampleRate: isProduction ? 0.1 : 1.0,
      replaysSessionSampleRate: isProduction ? 0.1 : 1.0,
      replaysOnErrorSampleRate: 1.0,
      beforeSend(event, hint) {
        // Filter out sensitive data
        if (event.request) {
          delete event.request.cookies;
          delete event.request.headers?.authorization;
        }
        return event;
      },
    });

    sentryInitialized = true;
    console.info("Sentry initialized successfully");
    */
    console.warn(
      "Sentry DSN configured but @sentry/react not installed. Install it to enable error tracking.",
    );
  } catch (error) {
    console.error("Failed to initialize Sentry", error);
  }
}

/**
 * Capture exception to Sentry
 */
export function captureException(
  error: Error,
  context?: Record<string, unknown>,
): void {
  if (!sentryInitialized) {
    console.error(
      "Exception captured (Sentry not initialized)",
      error,
      context,
    );
    return;
  }

  // Uncomment when @sentry/react is installed
  /*
  import * as Sentry from "@sentry/react";
  Sentry.captureException(error, {
    extra: context,
  });
  */
  console.error("Exception captured", error, context);
}

/**
 * Capture message to Sentry
 */
export function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
  context?: Record<string, unknown>,
): void {
  const logMessage = (msg: string, ctx?: Record<string, unknown>) => {
    if (level === "error") {
      console.error(msg, ctx);
    } else if (level === "warning") {
      console.warn(msg, ctx);
    } else {
      console.info(msg, ctx);
    }
  };

  if (!sentryInitialized) {
    logMessage("Message captured (Sentry not initialized)", {
      message,
      ...context,
    });
    return;
  }

  // Uncomment when @sentry/react is installed
  /*
  import * as Sentry from "@sentry/react";
  Sentry.captureMessage(message, {
    level: level === "info" ? "info" : level === "warning" ? "warning" : "error",
    extra: context,
  });
  */
  logMessage("Message captured", { message, ...context });
}

/**
 * Add breadcrumb to Sentry
 */
export function addBreadcrumb(
  message: string,
  category: string,
  level: "info" | "warning" | "error" = "info",
  data?: Record<string, unknown>,
): void {
  if (!sentryInitialized) {
    return;
  }

  // Uncomment when @sentry/react is installed
  /*
  import * as Sentry from "@sentry/react";
  Sentry.addBreadcrumb({
    message,
    category,
    level: level === "info" ? "info" : level === "warning" ? "warning" : "error",
    data,
  });
  */
}

/**
 * Set user context for Sentry
 */
export function setUserContext(
  userId: string,
  email?: string,
  role?: string,
): void {
  if (!sentryInitialized) {
    return;
  }

  // Uncomment when @sentry/react is installed
  /*
  import * as Sentry from "@sentry/react";
  Sentry.setUser({
    id: userId,
    email,
    role,
  });
  */
}

/**
 * Check if Sentry is initialized
 */
export function isSentryInitialized(): boolean {
  return sentryInitialized;
}
