/**
 * LEMNİX Error Metrics Service
 * Collects and aggregates error metrics by class for monitoring dashboard
 */

import { ErrorClass, ErrorSeverity, ErrorMetrics } from '../../types/errorTypes';
import { ILogger } from '../logger';

interface ErrorEvent {
  class: ErrorClass;
  severity: ErrorSeverity;
  endpoint: string;
  userId?: string;
  timestamp: number;
  correlationId: string;
}

interface ErrorRateWindow {
  startTime: number;
  endTime: number;
  errorCounts: Map<string, number>;
  uniqueUsers: Set<string>;
  endpoints: Set<string>;
}

export class ErrorMetricsService {
  private logger: ILogger;
  private errorWindows: ErrorRateWindow[] = [];
  private readonly windowSizeMs = 60000; // 1 minute windows
  private readonly maxWindows = 60; // Keep 60 minutes of history
  private readonly cleanupIntervalMs = 60000; // Cleanup every minute

  constructor(logger: ILogger) {
    this.logger = logger;
    this.startCleanupTimer();
  }

  /**
   * Record an error event
   */
  public recordError(event: ErrorEvent): void {
    const now = Date.now();
    const windowKey = this.getWindowKey(event.class, event.severity);
    
    // Get or create current window
    let currentWindow = this.getCurrentWindow(now);
    if (!currentWindow) {
      currentWindow = this.createWindow(now);
    }

    // Update metrics
    const currentCount = currentWindow.errorCounts.get(windowKey) || 0;
    currentWindow.errorCounts.set(windowKey, currentCount + 1);

    // Track unique users and endpoints
    if (event.userId) {
      currentWindow.uniqueUsers.add(event.userId);
    }
    currentWindow.endpoints.add(event.endpoint);

    this.logger.debug('Error recorded', {
      class: event.class,
      severity: event.severity,
      endpoint: event.endpoint,
      correlationId: event.correlationId
    });
  }

  /**
   * Get error metrics for monitoring dashboard
   */
  public getErrorMetrics(): Map<string, ErrorMetrics> {
    const metrics = new Map<string, ErrorMetrics>();
    const now = Date.now();
    
    // Aggregate metrics across all windows
    const aggregatedCounts = new Map<string, number>();
    const aggregatedUsers = new Map<string, Set<string>>();
    const aggregatedEndpoints = new Map<string, Set<string>>();
    const lastOccurrences = new Map<string, string>();

    for (const window of this.errorWindows) {
      // Skip old windows (older than 1 hour)
      if (now - window.endTime > 3600000) {
        continue;
      }

      for (const [key, count] of window.errorCounts) {
        const currentCount = aggregatedCounts.get(key) || 0;
        aggregatedCounts.set(key, currentCount + count);

        // Track unique users
        if (!aggregatedUsers.has(key)) {
          aggregatedUsers.set(key, new Set());
        }
        window.uniqueUsers.forEach(user => aggregatedUsers.get(key)!.add(user));

        // Track endpoints
        if (!aggregatedEndpoints.has(key)) {
          aggregatedEndpoints.set(key, new Set());
        }
        window.endpoints.forEach(endpoint => aggregatedEndpoints.get(key)!.add(endpoint));

        // Update last occurrence
        lastOccurrences.set(key, new Date(window.startTime).toISOString());
      }
    }

    // Create ErrorMetrics objects
    for (const [key, count] of aggregatedCounts) {
      const [classStr, severityStr] = key.split(':');
      const errorClass = classStr as ErrorClass;
      const severity = severityStr as ErrorSeverity;
      
      const rate = count / this.getActiveWindowCount(); // errors per minute
      
      metrics.set(key, {
        class: errorClass,
        severity,
        count,
        rate,
        lastOccurrence: lastOccurrences.get(key) || new Date().toISOString(),
        affectedEndpoints: Array.from(aggregatedEndpoints.get(key) || []),
        uniqueUsers: (aggregatedUsers.get(key) || new Set()).size
      });
    }

    return metrics;
  }

  /**
   * Get error rate by class for SLO monitoring
   */
  public getErrorRateByClass(): Map<ErrorClass, number> {
    const rates = new Map<ErrorClass, number>();
    const metrics = this.getErrorMetrics();

    for (const [key, metric] of metrics) {
      const currentRate = rates.get(metric.class) || 0;
      rates.set(metric.class, currentRate + metric.rate);
    }

    return rates;
  }

  /**
   * Get error distribution for dashboard
   */
  public getErrorDistribution(): {
    byClass: Map<ErrorClass, number>;
    bySeverity: Map<ErrorSeverity, number>;
    byEndpoint: Map<string, number>;
  } {
    const byClass = new Map<ErrorClass, number>();
    const bySeverity = new Map<ErrorSeverity, number>();
    const byEndpoint = new Map<string, number>();

    const metrics = this.getErrorMetrics();

    for (const [key, metric] of metrics) {
      // By class
      const classCount = byClass.get(metric.class) || 0;
      byClass.set(metric.class, classCount + metric.count);

      // By severity
      const severityCount = bySeverity.get(metric.severity) || 0;
      bySeverity.set(metric.severity, severityCount + metric.count);

      // By endpoint
      for (const endpoint of metric.affectedEndpoints) {
        const endpointCount = byEndpoint.get(endpoint) || 0;
        byEndpoint.set(endpoint, endpointCount + 1);
      }
    }

    return { byClass, bySeverity, byEndpoint };
  }

  /**
   * Get current error rate (last minute)
   */
  public getCurrentErrorRate(): number {
    const currentWindow = this.getCurrentWindow(Date.now());
    if (!currentWindow) {
      return 0;
    }

    let totalErrors = 0;
    for (const count of currentWindow.errorCounts.values()) {
      totalErrors += count;
    }

    return totalErrors; // errors per minute
  }

  /**
   * Check if error rate exceeds threshold
   */
  public isErrorRateHigh(threshold: number = 10): boolean {
    return this.getCurrentErrorRate() > threshold;
  }

  /**
   * Get error trends (last 5 minutes)
   */
  public getErrorTrends(): {
    trend: 'increasing' | 'decreasing' | 'stable';
    rate: number;
    changePercent: number;
  } {
    const recentWindows = this.errorWindows
      .filter(w => Date.now() - w.endTime <= 300000) // Last 5 minutes
      .sort((a, b) => b.startTime - a.startTime);

    if (recentWindows.length < 2) {
      return { trend: 'stable', rate: 0, changePercent: 0 };
    }

    const latest = recentWindows[0];
    const previous = recentWindows[1];

    const latestRate = Array.from(latest.errorCounts.values()).reduce((sum, count) => sum + count, 0);
    const previousRate = Array.from(previous.errorCounts.values()).reduce((sum, count) => sum + count, 0);

    const changePercent = previousRate === 0 ? 0 : ((latestRate - previousRate) / previousRate) * 100;

    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (changePercent > 10) trend = 'increasing';
    else if (changePercent < -10) trend = 'decreasing';

    return {
      trend,
      rate: latestRate,
      changePercent
    };
  }

  /**
   * Reset all metrics (for testing)
   */
  public resetMetrics(): void {
    this.errorWindows = [];
    this.logger.info('Error metrics reset');
  }

  /**
   * Get current window or create new one
   */
  private getCurrentWindow(now: number): ErrorRateWindow | null {
    const windowStart = Math.floor(now / this.windowSizeMs) * this.windowSizeMs;
    return this.errorWindows.find(w => w.startTime === windowStart) || null;
  }

  /**
   * Create new window
   */
  private createWindow(now: number): ErrorRateWindow {
    const windowStart = Math.floor(now / this.windowSizeMs) * this.windowSizeMs;
    const newWindow: ErrorRateWindow = {
      startTime: windowStart,
      endTime: windowStart + this.windowSizeMs,
      errorCounts: new Map(),
      uniqueUsers: new Set(),
      endpoints: new Set()
    };

    this.errorWindows.push(newWindow);
    return newWindow;
  }

  /**
   * Get window key for error classification
   */
  private getWindowKey(errorClass: ErrorClass, severity: ErrorSeverity): string {
    return `${errorClass}:${severity}`;
  }

  /**
   * Get count of active windows
   */
  private getActiveWindowCount(): number {
    const now = Date.now();
    return this.errorWindows.filter(w => now - w.endTime <= 3600000).length || 1; // Last hour
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanupOldWindows();
    }, this.cleanupIntervalMs);
  }

  /**
   * Clean up old windows
   */
  private cleanupOldWindows(): void {
    const now = Date.now();
    const initialCount = this.errorWindows.length;
    
    this.errorWindows = this.errorWindows.filter(w => 
      now - w.endTime <= (this.maxWindows * this.windowSizeMs)
    );

    const removedCount = initialCount - this.errorWindows.length;
    if (removedCount > 0) {
      this.logger.debug(`Cleaned up ${removedCount} old error windows`);
    }
  }
}

// Singleton instance
let errorMetricsService: ErrorMetricsService | null = null;

export function getErrorMetricsService(logger: ILogger): ErrorMetricsService {
  if (!errorMetricsService) {
    errorMetricsService = new ErrorMetricsService(logger);
  }
  return errorMetricsService;
}
