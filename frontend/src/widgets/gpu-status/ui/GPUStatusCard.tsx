/**
 * @fileoverview GPU Status Card Widget
 * @module widgets/gpu-status
 * @version 1.0.0
 *
 * FSD: Widget layer - GPU status detection and display
 * Design System v2.0: Uses tokens and glassmorphism
 */

// WebGPU type declarations (since they're not in TS lib yet)
declare global {
  interface GPU {
    requestAdapter(options?: GPURequestAdapterOptions): Promise<GPUAdapter | null>;
  }

  interface GPUAdapter {
    features: Set<GPUFeatureName>;
    limits: GPUSupportedLimits;
    requestDevice(descriptor?: GPUDeviceDescriptor): Promise<GPUDevice>;
    requestAdapterInfo(): Promise<GPUAdapterInfo>;
  }

  interface GPUDevice {
    features: Set<GPUFeatureName>;
    limits: GPUSupportedLimits;
  }

  interface GPURequestAdapterOptions {
    powerPreference?: "low-power" | "high-performance";
  }

  interface GPUAdapterInfo {
    vendor?: string;
    architecture?: string;
    description?: string;
  }

  interface GPUSupportedLimits {
    maxStorageBufferBindingSize?: number;
    maxComputeWorkgroupSizeX?: number;
  }

  interface GPUDeviceDescriptor {
    requiredFeatures?: GPUFeatureName[];
  }

  type GPUFeatureName = string;

  interface Navigator {
    gpu?: GPU;
  }
}

import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  alpha,
  CircularProgress,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  Memory as GPUIcon,
  Refresh as RefreshIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { useDesignSystem } from "@/shared/hooks";
import { apiClient } from "@/shared/api/client";

export interface GPUInfo {
  readonly vendor: string;
  readonly architecture: string;
  readonly description: string;
  readonly features: string[];
  readonly limits: {
    readonly maxStorageBufferBindingSize: number;
    readonly maxBufferSize: number;
  };
}

export interface GPUStatus {
  readonly available: boolean;
  readonly webGPUSupported?: boolean;
  readonly environment?: "browser" | "nodejs";
  readonly gpu?: GPUInfo | null;
  readonly lastChecked: Date;
  readonly error?: string;
  readonly recommendation?: string;
}

export interface GPUStatusCardProps {
  readonly onStatusChange?: (status: GPUStatus) => void;
  readonly showDetails?: boolean;
  readonly autoRefresh?: boolean;
  readonly refreshInterval?: number;
}

/**
 * GPU Status Card Component
 *
 * Features:
 * - Real-time GPU detection via WebGPU API
 * - Vendor, memory, and capability information
 * - Auto-refresh with configurable interval
 * - Visual status indicators (active/passive)
 * - Tooltip with detailed GPU information
 */
export const GPUStatusCard: React.FC<GPUStatusCardProps> = ({
  onStatusChange,
  showDetails = true,
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds
}) => {
  const ds = useDesignSystem();
  const [gpuStatus, setGpuStatus] = useState<GPUStatus>({
    available: false,
    lastChecked: new Date(),
  });
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Detect GPU capabilities using WebGPU API
   */
  const detectGPU = async (): Promise<GPUStatus> => {
    try {
      // Check WebGPU support
      if (!(navigator as { gpu?: unknown }).gpu) {
        return {
          available: false,
          webGPUSupported: false,
          environment: "browser",
          lastChecked: new Date(),
          recommendation:
            'WebGPU not enabled. Open chrome://flags and enable "Unsafe WebGPU" flag, then restart browser.',
        };
      }

      // Request adapter
      const adapter = await (navigator as Navigator & { gpu?: GPU }).gpu?.requestAdapter({
        powerPreference: "high-performance",
      });

      if (!adapter) {
        return {
          available: false,
          webGPUSupported: true,
          lastChecked: new Date(),
          recommendation:
            "WebGPU supported but no GPU adapter found. Check GPU drivers.",
        };
      }

      // Get adapter info
      const info = await adapter.requestAdapterInfo();

      // Request device to test actual GPU access
      const device = await adapter.requestDevice();

      const gpuInfo: GPUInfo = {
        vendor: info.vendor || "Unknown",
        architecture: info.architecture || "Unknown",
        description: info.description || "Unknown",
        features: Array.from(adapter.features),
        limits: {
          maxStorageBufferBindingSize: adapter.limits.maxStorageBufferBindingSize || 0,
          maxBufferSize: adapter.limits.maxComputeWorkgroupSizeX || 0,
        },
      };

      return {
        available: true,
        webGPUSupported: true,
        environment: "browser",
        gpu: gpuInfo,
        lastChecked: new Date(),
        recommendation:
          "GPU acceleration available for optimization algorithms",
      };
    } catch (error) {
      console.warn("[GPUStatusCard] GPU detection failed:", error);
      return {
        available: false,
        webGPUSupported: false,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : "GPU detection failed",
        recommendation:
          "Failed to detect GPU. Ensure WebGPU is enabled in your browser.",
      };
    }
  };

  /**
   * Fetch GPU status from backend
   */
  const fetchGpuStatusFromBackend = async () => {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: GPUStatus;
        error?: { message: string };
      }>("/health/gpu");
      if (response.data.success && response.data.data) {
        setGpuStatus({
          ...response.data.data,
          lastChecked: new Date(response.data.data.lastChecked), // Ensure Date object
        });
        onStatusChange?.({
          ...response.data.data,
          lastChecked: new Date(response.data.data.lastChecked),
        });
      } else {
        setError(
          response.data.error?.message ||
            "Failed to fetch GPU status from backend",
        );
        setGpuStatus({
          available: false,
          lastChecked: new Date(),
          error:
            response.data.error?.message || "Backend GPU status unavailable",
        });
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Network error fetching GPU status",
      );
      setGpuStatus({
        available: false,
        lastChecked: new Date(),
        error: err instanceof Error ? err.message : "Network error",
      });
    }
  };

  /**
   * Refresh GPU status
   */
  const refreshStatus = async () => {
    setIsChecking(true);
    setError(null);

    try {
      // Try browser WebGPU detection first
      const browserStatus = await detectGPU();
      if (browserStatus.available) {
        setGpuStatus(browserStatus);
        onStatusChange?.(browserStatus);
      } else {
        // Fallback to backend
        await fetchGpuStatusFromBackend();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "GPU detection failed");
      setGpuStatus({
        available: false,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : "GPU detection failed",
      });
    } finally {
      setIsChecking(false);
    }
  };

  // Initial detection
  useEffect(() => {
    refreshStatus();
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(refreshStatus, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const getStatusColor = () => {
    if (gpuStatus.available) return ds.colors.success.main;
    return ds.colors.error.main;
  };

  const getStatusIcon = () => {
    if (isChecking) return <CircularProgress size={16} />;
    if (gpuStatus.available)
      return <ActiveIcon sx={{ color: ds.colors.success.main }} />;
    return <InactiveIcon sx={{ color: ds.colors.error.main }} />;
  };

  const getStatusText = () => {
    if (isChecking) return "Kontrol Ediliyor...";
    if (gpuStatus.available) return "GPU Aktif";
    return "GPU Pasif";
  };

  return (
    <Card
      variant="outlined"
      sx={{
        border: `1px solid ${alpha(ds.colors.neutral[300], 0.5)}`,
        borderRadius: `${ds.borderRadius.lg}px`,
        background: gpuStatus.available
          ? alpha(ds.colors.success[50], 0.1)
          : alpha(ds.colors.error[50], 0.1),
        transition: ds.transitions.base,
        "&:hover": {
          borderColor: getStatusColor(),
          boxShadow: ds.shadows.soft.md,
        },
      }}
    >
      <CardContent sx={{ p: ds.spacing["3"] }}>
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={ds.spacing["2"]}
          sx={{ mb: ds.spacing["2"] }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: `${ds.borderRadius.md}px`,
              background: gpuStatus.available
                ? `linear-gradient(135deg, ${ds.colors.success[500]} 0%, ${ds.colors.success[700]} 100%)`
                : `linear-gradient(135deg, ${ds.colors.error[500]} 0%, ${ds.colors.error[700]} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: ds.shadows.soft.sm,
            }}
          >
            <GPUIcon sx={{ fontSize: 18, color: ds.colors.text.inverse }} />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontSize: "0.875rem",
                fontWeight: ds.typography.fontWeight.semibold,
                color: ds.colors.text.primary,
                mb: 0.25,
              }}
            >
              GPU Durumu
            </Typography>
            <Stack
              direction="row"
              alignItems="center"
              spacing={ds.spacing["1"]}
            >
              {getStatusIcon()}
              <Typography
                variant="body2"
                sx={{
                  color: getStatusColor(),
                  fontWeight: ds.typography.fontWeight.medium,
                }}
              >
                {getStatusText()}
              </Typography>
            </Stack>
          </Box>

          <Stack direction="row" spacing={ds.spacing["1"]}>
            <Tooltip title="GPU durumunu yenile">
              <IconButton
                size="small"
                onClick={refreshStatus}
                disabled={isChecking}
                sx={{
                  color: ds.colors.text.secondary,
                  "&:hover": { color: ds.colors.primary.main },
                }}
              >
                <RefreshIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>

            {showDetails && (
              <Tooltip title="GPU detayları">
                <IconButton
                  size="small"
                  sx={{
                    color: ds.colors.text.secondary,
                    "&:hover": { color: ds.colors.primary.main },
                  }}
                >
                  <InfoIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>

        {/* Error State */}
        {error && (
          <Box
            sx={{
              p: ds.spacing["2"],
              backgroundColor: alpha(ds.colors.error[50], 0.1),
              borderRadius: `${ds.borderRadius.md}px`,
              border: `1px solid ${alpha(ds.colors.error[500], 0.2)}`,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: ds.colors.error.main,
                fontSize: "0.75rem",
              }}
            >
              {error}
            </Typography>
          </Box>
        )}

        {/* Details */}
        {showDetails && gpuStatus.available && (
          <Box
            sx={{
              mt: ds.spacing["2"],
              p: ds.spacing["2"],
              backgroundColor: alpha(ds.colors.neutral[100], 0.5),
              borderRadius: `${ds.borderRadius.md}px`,
            }}
          >
            <Stack spacing={ds.spacing["1"]}>
              {gpuStatus.gpu?.vendor && (
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: ds.colors.text.secondary,
                      fontSize: "0.75rem",
                    }}
                  >
                    Üretici:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: ds.colors.text.primary, fontSize: "0.75rem" }}
                  >
                    {gpuStatus.gpu.vendor}
                  </Typography>
                </Stack>
              )}

              {gpuStatus.gpu?.architecture && (
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: ds.colors.text.secondary,
                      fontSize: "0.75rem",
                    }}
                  >
                    Mimari:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: ds.colors.text.primary, fontSize: "0.75rem" }}
                  >
                    {gpuStatus.gpu.architecture}
                  </Typography>
                </Stack>
              )}

              {gpuStatus.gpu?.description && (
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: ds.colors.text.secondary,
                      fontSize: "0.75rem",
                    }}
                  >
                    Açıklama:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: ds.colors.text.primary, fontSize: "0.75rem" }}
                  >
                    {gpuStatus.gpu.description}
                  </Typography>
                </Stack>
              )}

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography
                  variant="body2"
                  sx={{ color: ds.colors.text.secondary, fontSize: "0.75rem" }}
                >
                  Son kontrol:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: ds.colors.text.primary, fontSize: "0.75rem" }}
                >
                  {gpuStatus.lastChecked.toLocaleTimeString("tr-TR")}
                </Typography>
              </Stack>
            </Stack>
          </Box>
        )}

        {/* Performance Indicator */}
        {gpuStatus.available && (
          <Box sx={{ mt: ds.spacing["2"] }}>
            <Chip
              label="GPU Hızlandırması Aktif"
              size="small"
              sx={{
                backgroundColor: ds.colors.success[50],
                color: ds.colors.success[700],
                fontWeight: ds.typography.fontWeight.semibold,
                fontSize: "0.75rem",
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
