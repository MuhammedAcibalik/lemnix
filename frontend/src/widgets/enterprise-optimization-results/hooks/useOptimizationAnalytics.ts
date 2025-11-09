/**
 * @fileoverview Custom hook for optimization analytics
 * @module useOptimizationAnalytics
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from "react";

export const useOptimizationAnalytics = () => {
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(
    null,
  );
  const [systemHealth, setSystemHealth] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [isLoadingSystemHealth, setIsLoadingSystemHealth] = useState(false);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  // Data validation helper functions
  const validateAnalyticsData = (
    data: unknown,
  ): data is Record<string, unknown> => {
    try {
      if (!data || typeof data !== "object") return false;
      const obj = data as Record<string, unknown>;

      // ✅ FIX: More flexible validation - only check essential fields
      if (typeof obj.timeRange !== "string") return false;
      if (typeof obj.metrics !== "object" || !obj.metrics) return false;
      if (typeof obj.generatedAt !== "string") return false;

      // ✅ FIX: Check metrics structure more flexibly - don't require all 4 metrics
      const metrics = obj.metrics as Record<string, unknown>;
      const metricKeys = Object.keys(metrics);
      if (metricKeys.length === 0) return false;

      // Check at least one metric has the expected structure
      for (const key of metricKeys) {
        const metric = metrics[key];
        if (typeof metric === "object" && metric !== null) {
          const metricObj = metric as Record<string, unknown>;
          // Only require current, average, trend if they exist
          if (
            metricObj.current !== undefined &&
            typeof metricObj.current !== "number"
          )
            return false;
          if (
            metricObj.average !== undefined &&
            typeof metricObj.average !== "number"
          )
            return false;
          if (
            metricObj.trend !== undefined &&
            !["up", "down", "stable"].includes(metricObj.trend as string)
          )
            return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Analytics data validation error:", error);
      return false;
    }
  };

  const validateSystemHealthData = (
    data: unknown,
  ): data is Record<string, unknown> => {
    try {
      if (!data || typeof data !== "object") return false;
      const obj = data as Record<string, unknown>;

      // ✅ FIX: More flexible validation - only check essential fields
      if (typeof obj.status !== "string") return false;
      if (typeof obj.version !== "string") return false;
      if (typeof obj.uptime !== "number") return false;

      // ✅ FIX: Services and metrics are optional - don't require all specific services
      if (obj.services && typeof obj.services === "object") {
        const services = obj.services as Record<string, unknown>;
        const serviceKeys = Object.keys(services);
        for (const key of serviceKeys) {
          const service = services[key];
          if (typeof service === "object" && service !== null) {
            const serviceObj = service as Record<string, unknown>;
            // Only validate if status exists
            if (
              serviceObj.status !== undefined &&
              typeof serviceObj.status !== "string"
            )
              return false;
            if (
              serviceObj.responseTime !== undefined &&
              typeof serviceObj.responseTime !== "number"
            )
              return false;
          }
        }
      }

      // ✅ FIX: Metrics are optional - don't require all specific metrics
      if (obj.metrics && typeof obj.metrics === "object") {
        const metrics = obj.metrics as Record<string, unknown>;
        const metricKeys = Object.keys(metrics);
        for (const key of metricKeys) {
          const metric = metrics[key];
          if (typeof metric !== "number" && typeof metric !== "object")
            return false;
        }
      }

      return true;
    } catch (error) {
      console.error("System health data validation error:", error);
      return false;
    }
  };

  // Fetch analytics data
  // ✅ CRITICAL FIX: useCallback to prevent infinite loop
  const fetchAnalytics = useCallback(async () => {
    // Skip if already unauthorized
    if (isUnauthorized) {
      return;
    }

    setIsLoadingAnalytics(true);
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 1000;

    while (retryCount < maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        // Get auth token from localStorage
        const authToken = localStorage.getItem("auth_token");

        const response = await fetch(
          "/api/enterprise/analytics?timeRange=day",
          {
            signal: controller.signal,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache",
              ...(authToken && { Authorization: `Bearer ${authToken}` }), // ✅ FIX: Add auth token
            },
          },
        );

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            if (validateAnalyticsData(data.data)) {
              setAnalytics(data.data);
              return;
            } else {
              console.warn("Invalid analytics data structure:", data.data);
            }
          } else {
            console.warn("API returned unsuccessful response:", data);
          }
        } else if (response.status === 401) {
          // ✅ FIX: Stop retrying on 401 Unauthorized and mark as unauthorized
          setIsUnauthorized(true);
          setAnalytics({
            timeRange: "day",
            metrics: {
              efficiency: { current: 0, average: 0, trend: "stable" },
              cost: { current: 0, average: 0, trend: "stable" },
              waste: { current: 0, average: 0, trend: "stable" },
              performance: { current: 0, average: 0, trend: "stable" },
            },
            algorithm: "N/A",
            generatedAt: new Date().toISOString(),
          });
          return; // Exit early on 401
        } else {
          console.warn(
            `Analytics API returned ${response.status}: ${response.statusText}`,
          );
        }
      } catch (error) {
        retryCount++;
        console.error(`Analytics fetch attempt ${retryCount} failed:`, {
          error: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
          url: "/api/enterprise/analytics",
          timestamp: new Date().toISOString(),
          retryCount,
          maxRetries,
        });

        if (retryCount < maxRetries) {
          console.log(`Retrying analytics fetch in ${retryDelay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          continue;
        }
      }
    }

    // All retries failed, use fallback
    console.error("All analytics fetch attempts failed, using fallback data");
    setAnalytics({
      timeRange: "day",
      metrics: {
        efficiency: { current: 0, average: 0, trend: "stable" },
        cost: { current: 0, average: 0, trend: "stable" },
        waste: { current: 0, average: 0, trend: "stable" },
        performance: { current: 0, average: 0, trend: "stable" },
      },
      algorithm: "N/A",
      generatedAt: new Date().toISOString(),
    });
  }, [isUnauthorized]); // ✅ CRITICAL FIX: Add dependency array

  // Fetch system health data
  // ✅ CRITICAL FIX: useCallback to prevent infinite loop
  const fetchSystemHealth = useCallback(async () => {
    // Skip if already unauthorized
    if (isUnauthorized) {
      return;
    }

    setIsLoadingSystemHealth(true);
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 1000;

    while (retryCount < maxRetries) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        // Get auth token from localStorage
        const authToken = localStorage.getItem("auth_token");

        const response = await fetch("/api/enterprise/system-health", {
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            ...(authToken && { Authorization: `Bearer ${authToken}` }), // ✅ FIX: Add auth token
          },
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            if (validateSystemHealthData(data.data)) {
              setSystemHealth(data.data);
              return;
            } else {
              console.warn("Invalid system health data structure:", data.data);
            }
          } else {
            console.warn("API returned unsuccessful response:", data);
          }
        } else if (response.status === 401) {
          // ✅ FIX: Stop retrying on 401 Unauthorized and mark as unauthorized
          setIsUnauthorized(true);
          setSystemHealth({
            status: "unknown",
            uptime: 0,
            memory: { used: 0, total: 0, percentage: 0 },
            cpu: { usage: 0, cores: 0 },
            disk: { used: 0, total: 0, percentage: 0 },
            network: { latency: 0, throughput: 0 },
            services: [],
            lastChecked: new Date().toISOString(),
          });
          return; // Exit early on 401
        } else {
          console.warn(
            `System health API returned ${response.status}: ${response.statusText}`,
          );
        }
      } catch (error) {
        retryCount++;
        console.error(`System health fetch attempt ${retryCount} failed:`, {
          error: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
          url: "/api/enterprise/system-health",
          timestamp: new Date().toISOString(),
          retryCount,
          maxRetries,
        });

        if (retryCount < maxRetries) {
          console.log(`Retrying system health fetch in ${retryDelay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          continue;
        }
      }
    }

    // All retries failed, use fallback
    console.error(
      "All system health fetch attempts failed, using fallback data",
    );
    setSystemHealth({
      status: "unknown",
      services: {
        "Optimization Engine": { status: "unknown", responseTime: 0 },
        Database: { status: "unknown", responseTime: 0 },
        Cache: { status: "unknown", responseTime: 0 },
        "API Gateway": { status: "unknown", responseTime: 0 },
      },
      metrics: {
        cpuUsage: 0,
        memoryUsage: 0,
        diskUsage: 0,
        networkLatency: 0,
      },
      uptime: 0,
      version: "1.0.0",
    });
  }, [isUnauthorized]); // ✅ CRITICAL FIX: Add dependency array

  // Initial data fetch and real-time updates
  useEffect(() => {
    // Don't fetch if already unauthorized
    if (isUnauthorized) {
      return;
    }

    // Fetch initial data
    void fetchAnalytics();
    void fetchSystemHealth();

    // Set up real-time updates every 30 seconds (only if not unauthorized)
    const analyticsInterval = setInterval(() => {
      if (!isUnauthorized) {
        void fetchAnalytics();
      }
    }, 30000);

    const healthInterval = setInterval(() => {
      if (!isUnauthorized) {
        void fetchSystemHealth();
      }
    }, 30000);

    return () => {
      clearInterval(analyticsInterval);
      clearInterval(healthInterval);
    };
  }, [isUnauthorized, fetchAnalytics, fetchSystemHealth]); // ✅ CRITICAL FIX: Add all dependencies

  return {
    analytics,
    systemHealth,
    isLoadingAnalytics,
    isLoadingSystemHealth,
  };
};
