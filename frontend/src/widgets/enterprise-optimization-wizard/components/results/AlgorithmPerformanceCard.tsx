/**
 * Algorithm Performance Card Component
 * Display algorithm metadata and telemetry
 *
 * @module enterprise-optimization-wizard/components/results
 * @version 1.0.0
 */

import React from "react";
import { Box, Typography, Chip, Stack, Divider, alpha } from "@mui/material";
import {
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Timeline as TimelineIcon,
  Code as CodeIcon,
} from "@mui/icons-material";
import { CardV2 } from "@/shared";
import { useDesignSystem } from "@/shared/hooks";
// AlgorithmMetadata type
export interface AlgorithmMetadata {
  readonly effectiveComplexity?: string;
  readonly actualGenerations?: number;
  readonly convergenceReason?: string;
  readonly bestFitness?: number;
  readonly executionTimeMs?: number;
  readonly deterministicSeed?: number;
  readonly populationSize?: number;
  readonly finalGeneration?: number;
}

export interface AlgorithmPerformanceCardProps {
  readonly algorithm: string;
  readonly executionTime: number;
  readonly metadata?: AlgorithmMetadata;
}

/**
 * Algorithm Performance Card
 * Shows algorithm details and GA telemetry
 */
export const AlgorithmPerformanceCard: React.FC<
  AlgorithmPerformanceCardProps
> = ({ algorithm, executionTime, metadata }) => {
  const ds = useDesignSystem();

  console.log("[AlgorithmPerformanceCard] 🔍 Props received:", {
    algorithm,
    type: typeof algorithm,
    executionTime,
    metadata,
  });

  const algorithmLabels: Record<string, string> = {
    ffd: "First Fit Decreasing (FFD)",
    bfd: "Best Fit Decreasing (BFD)",
    genetic: "Genetic Algorithm",
    pooling: "Profile Pooling",
    "nsga-ii": "NSGA-II",
  };

  const algorithmLabel = algorithmLabels[algorithm] || algorithm;

  console.log("[AlgorithmPerformanceCard] 🔍 Display label:", algorithmLabel);
  const isGeneticAlgorithm = algorithm === "genetic";

  return (
    <CardV2 variant="glass" sx={{ p: ds.spacing["4"], height: "100%" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: ds.spacing["2"],
          mb: ds.spacing["3"],
        }}
      >
        <SpeedIcon sx={{ fontSize: 22, color: ds.colors.primary.main }} />
        <Typography
          sx={{
            fontSize: "1.125rem",
            fontWeight: ds.typography.fontWeight.semibold,
            color: ds.colors.text.primary,
          }}
        >
          Algoritma Performansı
        </Typography>
      </Box>

      {/* Algorithm Badge */}
      <Chip
        label={algorithmLabel}
        sx={{
          mb: ds.spacing["2"],
          height: 28,
          fontSize: "0.8125rem",
          fontWeight: 700,
          backgroundColor: alpha(ds.colors.primary.main, 0.15),
          color: ds.colors.primary.main,
          border: `1px solid ${alpha(ds.colors.primary.main, 0.3)}`,
        }}
      />

      {/* Execution Time */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: ds.spacing["2"],
          mb: ds.spacing["2"],
        }}
      >
        <TimelineIcon sx={{ fontSize: 16, color: ds.colors.text.secondary }} />
        <Typography
          sx={{
            fontSize: "0.875rem",
            color: ds.colors.text.primary,
          }}
        >
          <strong>{executionTime.toFixed(0)}ms</strong> çalışma süresi
        </Typography>
      </Box>

      {/* GA Telemetry (if available) */}
      {isGeneticAlgorithm && metadata && (
        <>
          <Divider sx={{ my: ds.spacing["2"] }} />

          <Typography
            sx={{
              fontSize: "0.8125rem",
              fontWeight: ds.typography.fontWeight.semibold,
              color: ds.colors.text.secondary,
              mb: ds.spacing["2"],
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Genetic Algorithm Detayları
          </Typography>

          <Stack spacing={ds.spacing["1"]}>
            {/* Generations */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                sx={{ fontSize: "0.8125rem", color: ds.colors.text.secondary }}
              >
                Jenerasyon
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: ds.colors.text.primary,
                }}
              >
                {metadata.actualGenerations || "N/A"}
              </Typography>
            </Box>

            {/* Population Size */}
            {metadata.populationSize && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.8125rem",
                    color: ds.colors.text.secondary,
                  }}
                >
                  Popülasyon
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: ds.colors.text.primary,
                  }}
                >
                  {metadata.populationSize}
                </Typography>
              </Box>
            )}

            {/* Convergence Reason */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                sx={{ fontSize: "0.8125rem", color: ds.colors.text.secondary }}
              >
                Yakınsama
              </Typography>
              <Chip
                label={metadata.convergenceReason?.replace("_", " ") || "N/A"}
                size="small"
                sx={{
                  height: 20,
                  fontSize: "0.625rem",
                  fontWeight: 600,
                  backgroundColor: alpha(ds.colors.success.main, 0.1),
                  color: ds.colors.success.main,
                }}
              />
            </Box>

            {/* Best Fitness */}
            {metadata.bestFitness !== undefined && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.8125rem",
                    color: ds.colors.text.secondary,
                  }}
                >
                  En İyi Uygunluk
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: ds.colors.success.main,
                  }}
                >
                  {(metadata.bestFitness * 100).toFixed(2)}%
                </Typography>
              </Box>
            )}

            {/* Algorithm Complexity */}
            {metadata.effectiveComplexity && (
              <Box sx={{ mt: ds.spacing["1"] }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: ds.spacing["1"],
                    mb: ds.spacing["1"],
                  }}
                >
                  <CodeIcon
                    sx={{ fontSize: 14, color: ds.colors.text.secondary }}
                  />
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      color: ds.colors.text.secondary,
                    }}
                  >
                    Karmaşıklık
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    fontFamily: "monospace",
                    color: ds.colors.text.primary,
                    backgroundColor: alpha(ds.colors.neutral[900], 0.05),
                    p: ds.spacing["1"],
                    borderRadius: `${ds.borderRadius.sm}px`,
                  }}
                >
                  {metadata.effectiveComplexity}
                </Typography>
              </Box>
            )}
          </Stack>
        </>
      )}
    </CardV2>
  );
};
