/**
 * Smart Insights Panel Component
 * AI-driven insights and recommendations
 *
 * @module widgets/dashboard-v2/smart-insights
 * @version 1.0.0 - Design System v2.0 Compliant
 */

import React from "react";
import {
  Box,
  Typography,
  Stack,
  Chip,
  alpha,
  LinearProgress,
} from "@mui/material";
import {
  Inventory as ProfileIcon,
  Star as StarIcon,
  AccessTime as TimeIcon,
  Lightbulb as InsightIcon,
} from "@mui/icons-material";
import { CardV2 } from "@/shared";
import { useDesignSystem } from "@/shared/hooks";
import { useSmartInsights } from "@/entities/dashboard";

/**
 * Props
 */
export interface SmartInsightsPanelProps {
  readonly timeRange?: "24h" | "7d" | "30d";
}

/**
 * Smart Insights Panel
 * Shows intelligent recommendations
 */
export const SmartInsightsPanel: React.FC<SmartInsightsPanelProps> = ({
  timeRange = "7d",
}) => {
  const ds = useDesignSystem();
  const { data, isLoading } = useSmartInsights({ timeRange });

  return (
    <CardV2 variant="glass" sx={{ p: ds.spacing["1"], height: "100%" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: ds.spacing["1"],
          mb: ds.spacing["2"],
        }}
      >
        <InsightIcon sx={{ color: ds.colors.primary.main, fontSize: 20 }} />
        <Typography
          sx={{
            fontSize: "0.9375rem",
            fontWeight: ds.typography.fontWeight.semibold,
            color: ds.colors.text.primary,
          }}
        >
          Akıllı İçgörüler
        </Typography>
      </Box>

      {isLoading ? (
        <Box sx={{ textAlign: "center", py: ds.spacing["4"] }}>
          <Typography color="text.secondary">Yükleniyor...</Typography>
        </Box>
      ) : (
        <Stack spacing={ds.spacing["3"]}>
          {/* Top Profiles */}
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: ds.spacing["1"],
                mb: ds.spacing["2"],
              }}
            >
              <ProfileIcon
                sx={{ fontSize: 16, color: ds.colors.text.secondary }}
              />
              <Typography
                sx={{
                  fontSize: "0.875rem",
                  fontWeight: ds.typography.fontWeight.medium,
                  color: ds.colors.text.secondary,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                En Çok Kullanılan Profiller
              </Typography>
            </Box>

            <Stack spacing={ds.spacing["1"]}>
              {data?.topProfiles.map((profile, index) => (
                <Box
                  key={profile.profileType}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: ds.spacing["1"],
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                          color: ds.colors.text.primary,
                        }}
                      >
                        {index + 1}. {profile.profileType}
                      </Typography>
                      <Chip
                        label={
                          profile.trend === "up"
                            ? "↑"
                            : profile.trend === "down"
                              ? "↓"
                              : "→"
                        }
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: "0.625rem",
                          fontWeight: 600,
                          minWidth: 24,
                          background:
                            profile.trend === "up"
                              ? alpha(ds.colors.success.main, 0.1)
                              : profile.trend === "down"
                                ? alpha(ds.colors.error.main, 0.1)
                                : alpha(ds.colors.neutral[500], 0.1),
                          color:
                            profile.trend === "up"
                              ? ds.colors.success.main
                              : profile.trend === "down"
                                ? ds.colors.error.main
                                : ds.colors.neutral[600],
                          "& .MuiChip-label": { px: 0.5 },
                        }}
                      />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={profile.percentage}
                      sx={{
                        height: 4,
                        borderRadius: `${ds.borderRadius.sm}px`,
                        backgroundColor: alpha(ds.colors.primary.main, 0.1),
                        "& .MuiLinearProgress-bar": {
                          borderRadius: `${ds.borderRadius.sm}px`,
                          backgroundColor: ds.colors.primary.main,
                        },
                      }}
                    />
                  </Box>
                  <Typography
                    sx={{
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: ds.colors.text.secondary,
                      ml: ds.spacing["2"],
                      minWidth: 50,
                      textAlign: "right",
                    }}
                  >
                    {profile.count} adet
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Best Algorithm */}
          {data?.bestAlgorithm && (
            <Box
              sx={{
                p: ds.spacing["3"],
                borderRadius: `${ds.borderRadius.md}px`,
                background: alpha(ds.colors.success.main, 0.05),
                border: `1px solid ${alpha(ds.colors.success.main, 0.2)}`,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: ds.spacing["1"],
                  mb: ds.spacing["1"],
                }}
              >
                <StarIcon
                  sx={{ fontSize: 16, color: ds.colors.success.main }}
                />
                <Typography
                  sx={{
                    fontSize: "0.875rem",
                    fontWeight: ds.typography.fontWeight.medium,
                    color: ds.colors.text.secondary,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  En İyi Performans
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontSize: "1rem",
                  fontWeight: ds.typography.fontWeight.semibold,
                  color: ds.colors.text.primary,
                  mb: 0.5,
                }}
              >
                {getAlgorithmName(data.bestAlgorithm.algorithm)}
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  color: ds.colors.text.secondary,
                }}
              >
                %{data.bestAlgorithm.efficiency.toFixed(1)} verimlilik •{" "}
                {data.bestAlgorithm.runCount} çalıştırma
              </Typography>
            </Box>
          )}

          {/* Peak Hours */}
          {data?.peakHours && data.peakHours.length > 0 && (
            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: ds.spacing["1"],
                  mb: ds.spacing["2"],
                }}
              >
                <TimeIcon
                  sx={{ fontSize: 16, color: ds.colors.text.secondary }}
                />
                <Typography
                  sx={{
                    fontSize: "0.875rem",
                    fontWeight: ds.typography.fontWeight.medium,
                    color: ds.colors.text.secondary,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Yoğun Saatler
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: ds.spacing["1"] }}>
                {data.peakHours.map((hour) => (
                  <Chip
                    key={hour.hour}
                    label={`${hour.hour.toString().padStart(2, "0")}:00`}
                    size="small"
                    sx={{
                      height: 24,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      background: alpha(ds.colors.primary.main, 0.1),
                      color: ds.colors.primary.main,
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Stack>
      )}
    </CardV2>
  );
};

/**
 * Get algorithm display name
 */
function getAlgorithmName(algorithm: string): string {
  const names: Record<string, string> = {
    ffd: "First-Fit Decreasing",
    bfd: "Best-Fit Decreasing",
    genetic: "Genetic Algorithm",
    pooling: "Profile Pooling",
  };
  return names[algorithm] || algorithm;
}
