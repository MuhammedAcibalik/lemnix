/**
 * Active Operations Panel Component
 * Shows real-time optimization operations
 *
 * @module widgets/dashboard-v2/active-operations
 * @version 1.0.0 - Design System v2.0 Compliant
 */

import React from "react";
import { Box, Typography, Stack, Chip, alpha } from "@mui/material";
import {
  HourglassEmpty as QueueIcon,
  HourglassEmpty as HourglassIcon,
  PlayArrow as ProcessingIcon,
  CheckCircle as CompletedIcon,
} from "@mui/icons-material";
import { CardV2 } from "@/shared";
import { useDesignSystem } from "@/shared/hooks";
import { useActiveOperations } from "@/entities/dashboard";
import { OperationCard } from "./OperationCard";

/**
 * Props
 */
export interface ActiveOperationsPanelProps {
  readonly onOperationClick?: (id: string) => void;
  readonly maxItems?: number;
}

/**
 * Active Operations Panel
 * Real-time operations dashboard
 */
export const ActiveOperationsPanel: React.FC<ActiveOperationsPanelProps> = ({
  onOperationClick,
  maxItems = 5,
}) => {
  const ds = useDesignSystem();
  const { data, isLoading, error } = useActiveOperations();

  const activeOps = data?.activeOperations.slice(0, maxItems) || [];
  const recentCompletions = data?.recentCompletions.slice(0, 3) || [];

  return (
    <CardV2 variant="glass" sx={{ p: ds.spacing["1"], height: "100%" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: ds.spacing["2"],
        }}
      >
        <Typography
          sx={{
            fontSize: "0.9375rem",
            fontWeight: ds.typography.fontWeight.semibold,
            color: ds.colors.text.primary,
          }}
        >
          Aktif İşlemler
        </Typography>

        {/* Status Badges */}
        <Box sx={{ display: "flex", gap: ds.spacing["1"] }}>
          <Chip
            icon={<QueueIcon sx={{ fontSize: 12 }} />}
            label={data?.queuedCount || 0}
            size="small"
            sx={{
              height: 22,
              fontSize: "0.6875rem",
              fontWeight: 600,
              background: alpha(ds.colors.neutral[600], 0.1),
              color: ds.colors.neutral[600],
            }}
          />
          <Chip
            icon={<ProcessingIcon sx={{ fontSize: 12 }} />}
            label={data?.processingCount || 0}
            size="small"
            sx={{
              height: 22,
              fontSize: "0.6875rem",
              fontWeight: 600,
              background: alpha(ds.colors.primary.main, 0.1),
              color: ds.colors.primary.main,
            }}
          />
        </Box>
      </Box>

      {/* Active Operations List */}
      {isLoading ? (
        <Box sx={{ textAlign: "center", py: ds.spacing["4"] }}>
          <Typography color="text.secondary">Yükleniyor...</Typography>
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: "center", py: ds.spacing["4"] }}>
          <Typography color="error">Veriler yüklenemedi</Typography>
        </Box>
      ) : activeOps.length === 0 ? (
        <Box sx={{ textAlign: "center", py: ds.spacing["6"] }}>
          <HourglassIcon
            sx={{
              fontSize: 48,
              color: ds.colors.neutral[400],
              mb: ds.spacing["2"],
            }}
          />
          <Typography
            sx={{
              fontSize: "0.9375rem",
              fontWeight: 600,
              color: ds.colors.text.primary,
              mb: ds.spacing["1"],
            }}
          >
            Aktif işlem yok
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tüm optimizasyonlar tamamlandı
          </Typography>
        </Box>
      ) : (
        <Stack spacing={ds.spacing["2"]}>
          {activeOps.map((op) => (
            <OperationCard
              key={op.id}
              operation={op}
              {...(onOperationClick && { onClick: onOperationClick })}
            />
          ))}
        </Stack>
      )}

      {/* Recent Completions */}
      {recentCompletions.length > 0 && (
        <Box
          sx={{
            mt: ds.spacing["4"],
            pt: ds.spacing["3"],
            borderTop: `1px solid ${ds.colors.neutral[200]}`,
          }}
        >
          <Typography
            sx={{
              fontSize: "0.875rem",
              fontWeight: ds.typography.fontWeight.medium,
              color: ds.colors.text.secondary,
              mb: ds.spacing["2"],
            }}
          >
            Son Tamamlananlar
          </Typography>

          <Stack spacing={ds.spacing["1"]}>
            {recentCompletions.map((completion) => (
              <Box
                key={completion.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: ds.spacing["2"],
                  p: ds.spacing["2"],
                  borderRadius: `${ds.borderRadius.sm}px`,
                  backgroundColor: alpha(ds.colors.success.main, 0.05),
                }}
              >
                <CompletedIcon
                  sx={{ fontSize: 16, color: ds.colors.success.main }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: ds.colors.text.primary,
                    }}
                  >
                    {getAlgorithmName(completion.algorithm)}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.6875rem",
                      color: ds.colors.text.secondary,
                    }}
                  >
                    {completion.itemCount} parça •{" "}
                    {completion.efficiency.toFixed(1)}% verimlilik
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </CardV2>
  );
};

/**
 * Get algorithm display name
 */
function getAlgorithmName(algorithm: string): string {
  const names: Record<string, string> = {
    ffd: "FFD",
    bfd: "BFD",
    genetic: "GA",
    pooling: "Pooling",
  };
  return names[algorithm] || algorithm;
}
