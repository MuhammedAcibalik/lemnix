/**
 * @fileoverview Query Performance Monitoring Service
 * @module QueryPerformanceMonitor
 * @version 1.0.0
 */

import { logger } from '../logger';

interface QueryMetrics {
  query: string;
  duration: number;
  params: string;
  timestamp: number;
}

interface PerformanceStats {
  totalQueries: number;
  slowQueries: number;
  p50: number;
  p95: number;
  p99: number;
  avgDuration: number;
  maxDuration: number;
}

/**
 * Query Performance Monitor
 * Tracks and analyzes database query performance
 */
export class QueryPerformanceMonitor {
  private static instance: QueryPerformanceMonitor;
  private queryMetrics: QueryMetrics[] = [];
  private slowQueryThreshold = 100; // ms
  private maxStoredQueries = 10000; // Keep last 10k queries
  private slowQueries: QueryMetrics[] = [];

  private constructor() {
    // Clean up old metrics every hour
    setInterval(() => this.cleanup(), 60 * 60 * 1000);
  }

  public static getInstance(): QueryPerformanceMonitor {
    if (!QueryPerformanceMonitor.instance) {
      QueryPerformanceMonitor.instance = new QueryPerformanceMonitor();
    }
    return QueryPerformanceMonitor.instance;
  }

  /**
   * Record a query execution
   */
  recordQuery(metrics: Omit<QueryMetrics, 'timestamp'>): void {
    const fullMetrics: QueryMetrics = {
      ...metrics,
      timestamp: Date.now(),
    };

    // Store in general metrics
    this.queryMetrics.push(fullMetrics);

    // Track slow queries separately
    if (metrics.duration > this.slowQueryThreshold) {
      this.slowQueries.push(fullMetrics);
      
      logger.warn('[QueryMonitor] Slow query detected', {
        duration: `${metrics.duration}ms`,
        query: metrics.query.substring(0, 200),
      });
    }

    // Prevent memory overflow
    if (this.queryMetrics.length > this.maxStoredQueries) {
      this.queryMetrics = this.queryMetrics.slice(-this.maxStoredQueries);
    }

    if (this.slowQueries.length > 1000) {
      this.slowQueries = this.slowQueries.slice(-1000);
    }
  }

  /**
   * Get performance statistics
   */
  getStats(timeRangeMs?: number): PerformanceStats {
    const now = Date.now();
    const cutoff = timeRangeMs ? now - timeRangeMs : 0;
    
    const recentQueries = this.queryMetrics.filter(m => m.timestamp > cutoff);
    
    if (recentQueries.length === 0) {
      return {
        totalQueries: 0,
        slowQueries: 0,
        p50: 0,
        p95: 0,
        p99: 0,
        avgDuration: 0,
        maxDuration: 0,
      };
    }

    const durations = recentQueries.map(m => m.duration).sort((a, b) => a - b);
    const total = recentQueries.length;

    return {
      totalQueries: total,
      slowQueries: recentQueries.filter(m => m.duration > this.slowQueryThreshold).length,
      p50: this.percentile(durations, 0.5),
      p95: this.percentile(durations, 0.95),
      p99: this.percentile(durations, 0.99),
      avgDuration: Number((durations.reduce((a, b) => a + b, 0) / total).toFixed(2)),
      maxDuration: durations[durations.length - 1] ?? 0,
    };
  }

  /**
   * Get slow queries
   */
  getSlowQueries(limit: number = 100): QueryMetrics[] {
    return this.slowQueries
      .slice(-limit)
      .sort((a, b) => b.duration - a.duration);
  }

  /**
   * Get query patterns (aggregated by query signature)
   */
  getQueryPatterns(): Map<string, { count: number; avgDuration: number; maxDuration: number }> {
    const patterns = new Map<string, { durations: number[]; count: number }>();

    for (const metric of this.queryMetrics) {
      // Extract query signature (remove parameter values)
      const signature = this.extractQuerySignature(metric.query);
      
      const existing = patterns.get(signature);
      if (existing) {
        existing.durations.push(metric.duration);
        existing.count++;
      } else {
        patterns.set(signature, {
          durations: [metric.duration],
          count: 1,
        });
      }
    }

    // Convert to final format
    const result = new Map<string, { count: number; avgDuration: number; maxDuration: number }>();
    
    for (const [signature, data] of patterns.entries()) {
      const avg = data.durations.reduce((a, b) => a + b, 0) / data.durations.length;
      const max = Math.max(...data.durations);
      
      result.set(signature, {
        count: data.count,
        avgDuration: Number(avg.toFixed(2)),
        maxDuration: max,
      });
    }

    return result;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.queryMetrics = [];
    this.slowQueries = [];
    logger.info('[QueryMonitor] Metrics cleared');
  }

  /**
   * Set slow query threshold
   */
  setSlowQueryThreshold(ms: number): void {
    this.slowQueryThreshold = ms;
    logger.info('[QueryMonitor] Slow query threshold updated', { threshold: ms });
  }

  /**
   * Calculate percentile
   */
  private percentile(sorted: number[], p: number): number {
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[index] ?? 0;
  }

  /**
   * Extract query signature (normalize query for pattern matching)
   */
  private extractQuerySignature(query: string): string {
    // Remove WHERE clause parameter values
    let signature = query
      .replace(/\$\d+/g, '$?')  // $1, $2 -> $?
      .replace(/= '[^']*'/g, "= '?'")  // = 'value' -> = '?'
      .replace(/= \d+/g, '= ?')  // = 123 -> = ?
      .replace(/IN \([^)]+\)/g, 'IN (?)');  // IN (...) -> IN (?)

    // Normalize whitespace
    signature = signature.replace(/\s+/g, ' ').trim();

    return signature;
  }

  /**
   * Cleanup old metrics
   */
  private cleanup(): void {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    const beforeCount = this.queryMetrics.length;
    this.queryMetrics = this.queryMetrics.filter(m => m.timestamp > oneHourAgo);
    this.slowQueries = this.slowQueries.filter(m => m.timestamp > oneHourAgo);
    
    const removed = beforeCount - this.queryMetrics.length;
    if (removed > 0) {
      logger.debug('[QueryMonitor] Cleaned up old metrics', { removed });
    }
  }
}

/**
 * Export singleton instance
 */
export const queryPerformanceMonitor = QueryPerformanceMonitor.getInstance();

