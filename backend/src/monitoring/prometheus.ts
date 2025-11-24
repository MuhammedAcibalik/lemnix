/**
 * Prometheus Metrics Integration
 * @fileoverview Prometheus metrics collection and export
 * @module monitoring/prometheus
 */

import { Request, Response } from "express";
import { logger } from "../services/logger";

/**
 * Simple Prometheus metrics store
 * In production, use prom-client library for full Prometheus support
 */
interface MetricValue {
  value: number;
  labels?: Record<string, string>;
  timestamp: number;
}

class PrometheusMetrics {
  private static instance: PrometheusMetrics;
  private metrics: Map<string, MetricValue[]> = new Map();
  private counters: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();

  private constructor() {
    // Cleanup old metrics every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  public static getInstance(): PrometheusMetrics {
    if (!PrometheusMetrics.instance) {
      PrometheusMetrics.instance = new PrometheusMetrics();
    }
    return PrometheusMetrics.instance;
  }

  /**
   * Increment a counter metric
   */
  public incrementCounter(name: string, labels?: Record<string, string>): void {
    const key = this.buildKey(name, labels);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + 1);
  }

  /**
   * Record a histogram value
   */
  public recordHistogram(
    name: string,
    value: number,
    labels?: Record<string, string>,
  ): void {
    const key = this.buildKey(name, labels);
    const values = this.histograms.get(key) || [];
    values.push(value);
    // Keep only last 1000 values
    if (values.length > 1000) {
      values.shift();
    }
    this.histograms.set(key, values);
  }

  /**
   * Record a gauge value
   */
  public setGauge(
    name: string,
    value: number,
    labels?: Record<string, string>,
  ): void {
    const key = this.buildKey(name, labels);
    const metrics = this.metrics.get(key) || [];
    metrics.push({
      value,
      labels,
      timestamp: Date.now(),
    });
    // Keep only last 100 values
    if (metrics.length > 100) {
      metrics.shift();
    }
    this.metrics.set(key, metrics);
  }

  /**
   * Get metrics in Prometheus format
   */
  public getMetrics(): string {
    const lines: string[] = [];

    // Counters
    for (const [key, value] of this.counters.entries()) {
      const { name, labels } = this.parseKey(key);
      const labelStr = this.formatLabels(labels);
      lines.push(`# TYPE ${name} counter`);
      lines.push(`${name}${labelStr} ${value}`);
    }

    // Histograms
    for (const [key, values] of this.histograms.entries()) {
      const { name, labels } = this.parseKey(key);
      const labelStr = this.formatLabels(labels);
      if (values.length > 0) {
        const sum = values.reduce((a, b) => a + b, 0);
        const count = values.length;
        const avg = sum / count;
        const sorted = [...values].sort((a, b) => a - b);
        const p50 = sorted[Math.floor(sorted.length * 0.5)] || 0;
        const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
        const p99 = sorted[Math.floor(sorted.length * 0.99)] || 0;

        lines.push(`# TYPE ${name} histogram`);
        lines.push(`${name}_sum${labelStr} ${sum}`);
        lines.push(`${name}_count${labelStr} ${count}`);
        lines.push(`${name}_avg${labelStr} ${avg}`);
        lines.push(`${name}_p50${labelStr} ${p50}`);
        lines.push(`${name}_p95${labelStr} ${p95}`);
        lines.push(`${name}_p99${labelStr} ${p99}`);
      }
    }

    // Gauges
    for (const [key, metrics] of this.metrics.entries()) {
      const { name, labels } = this.parseKey(key);
      const labelStr = this.formatLabels(labels);
      if (metrics.length > 0) {
        const latest = metrics[metrics.length - 1];
        lines.push(`# TYPE ${name} gauge`);
        lines.push(`${name}${labelStr} ${latest.value}`);
      }
    }

    return lines.join("\n") + "\n";
  }

  private buildKey(name: string, labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return name;
    }
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(",");
    return `${name}{${labelStr}}`;
  }

  private parseKey(key: string): {
    name: string;
    labels?: Record<string, string>;
  } {
    const match = key.match(/^([^{]+)(?:\{(.+)\})?$/);
    if (!match) {
      return { name: key };
    }

    const name = match[1];
    const labelStr = match[2];
    if (!labelStr) {
      return { name };
    }

    const labels: Record<string, string> = {};
    const labelMatches = labelStr.matchAll(/(\w+)="([^"]+)"/g);
    for (const match of labelMatches) {
      labels[match[1]] = match[2];
    }

    return { name, labels };
  }

  private formatLabels(labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return "";
    }
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(",");
    return `{${labelStr}}`;
  }

  private cleanup(): void {
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutes

    // Cleanup old gauge metrics
    for (const [key, metrics] of this.metrics.entries()) {
      const filtered = metrics.filter((m) => now - m.timestamp < maxAge);
      if (filtered.length === 0) {
        this.metrics.delete(key);
      } else {
        this.metrics.set(key, filtered);
      }
    }
  }
}

export const prometheusMetrics = PrometheusMetrics.getInstance();

/**
 * Middleware to record HTTP request metrics
 */
export function prometheusMiddleware(
  req: Request,
  res: Response,
  next: () => void,
): void {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const route = req.route?.path || req.path;
    const method = req.method;

    // Record request duration
    prometheusMetrics.recordHistogram("http_request_duration_ms", duration, {
      method,
      route,
      status: res.statusCode.toString(),
    });

    // Increment request counter
    prometheusMetrics.incrementCounter("http_requests_total", {
      method,
      route,
      status: res.statusCode.toString(),
    });
  });

  next();
}

/**
 * Prometheus metrics endpoint handler
 */
export function prometheusMetricsHandler(_req: Request, res: Response): void {
  try {
    res.set("Content-Type", "text/plain; version=0.0.4");
    res.send(prometheusMetrics.getMetrics());
  } catch (error) {
    logger.error("Failed to generate Prometheus metrics", error as Error);
    res.status(500).send("# Error generating metrics\n");
  }
}
