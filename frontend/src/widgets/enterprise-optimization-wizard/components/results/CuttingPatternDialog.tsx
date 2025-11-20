/**
 * Cutting Pattern Dialog Component
 * Displays detailed cutting patterns for a work order
 *
 * @module enterprise-optimization-wizard/components/results
 * @version 2.0.0
 */

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Divider,
  Stack,
  alpha,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useDesignSystem, useAdaptiveUIContext } from "@/shared/hooks";
import type { StockPlan } from "./utils";

interface CuttingPatternDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly plan: StockPlan | null;
}

export const CuttingPatternDialog: React.FC<CuttingPatternDialogProps> = ({
  open,
  onClose,
  plan,
}) => {
  const ds = useDesignSystem();
  const { tokens } = useAdaptiveUIContext();

  if (!plan) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          width: "95%",
          maxWidth: "1800px",
          borderRadius: `${tokens.borderRadius.xl}px`,
          minHeight: "550px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: tokens.spacing.xl * 2,
          py: tokens.spacing.sm,
          background: ds.glass.background,
          backdropFilter: ds.glass.backdropFilter,
        }}
      >
        <Typography
          sx={{
            fontSize: `${tokens.typography.lg}px`,
            fontWeight: ds.typography.fontWeight.bold,
            background: ds.gradients.primary,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Enterprise Optimizasyon
        </Typography>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            minWidth: tokens.components.button.sm,
            minHeight: tokens.components.button.sm,
          }}
        >
          <CloseIcon
            sx={{
              fontSize: tokens.components.icon.md,
            }}
          />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent
        sx={{
          px: tokens.spacing.xl * 2,
          py: tokens.spacing.md,
          flex: 1,
          overflowY: "auto",
        }}
      >
        {/* Plan Özeti */}
        <Box sx={{ mb: tokens.spacing.lg }}>
          <Typography
            sx={{
              fontSize: `${tokens.typography.base}px`,
              fontWeight: ds.typography.fontWeight.semibold,
              mb: tokens.spacing.sm,
              color: ds.colors.text.primary,
            }}
          >
            {plan.stockLength}mm Stok Profili
          </Typography>

          <Stack direction="row" spacing={tokens.spacing.lg}>
            <Box>
              <Typography
                sx={{ fontSize: "0.75rem", color: ds.colors.text.secondary }}
              >
                Kullanılan Stok
              </Typography>
              <Typography
                sx={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: ds.colors.primary.main,
                }}
              >
                {plan.stockCount} Adet
              </Typography>
            </Box>
            <Box>
              <Typography
                sx={{ fontSize: "0.75rem", color: ds.colors.text.secondary }}
              >
                Toplam Parça
              </Typography>
              <Typography
                sx={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: ds.colors.info.main,
                }}
              >
                {plan.totalPieces} Parça
              </Typography>
            </Box>
            <Box>
              <Typography
                sx={{ fontSize: "0.75rem", color: ds.colors.text.secondary }}
              >
                Verimlilik
              </Typography>
              <Typography
                sx={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: ds.colors.success.main,
                }}
              >
                {plan.efficiency}%
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Divider sx={{ my: tokens.spacing.md }} />

        {/* ✅ FIX: Work Order Breakdown for Pooled Results */}
        {plan.workOrderCount && plan.workOrderCount > 1 && (
          <Box
            sx={{
              mb: tokens.spacing.md,
              p: tokens.spacing.md,
              backgroundColor: alpha(ds.colors.primary.main, 0.05),
              borderRadius: `${tokens.borderRadius.lg}px`,
              border: `1px solid ${alpha(ds.colors.primary.main, 0.2)}`,
            }}
          >
            <Typography
              sx={{
                fontSize: "1rem",
                fontWeight: 600,
                mb: tokens.spacing.sm,
                color: ds.colors.primary.main,
              }}
            >
              📋 Dahil Edilen İş Emirleri ({plan.workOrderCount} adet)
            </Typography>
            <Typography
              sx={{
                fontSize: "0.875rem",
                color: ds.colors.text.secondary,
                fontFamily: "monospace",
              }}
            >
              Bu optimizasyon {plan.workOrderCount} farklı iş emrini
              birleştirerek gerçekleştirildi. Her kesim planında hangi iş
              emrinden kaç parça kesildiği detaylı olarak gösterilmektedir.
            </Typography>
          </Box>
        )}

        {/* 📊 Toplam Kesim Özeti - PER SEGMENT */}
        <Box
          sx={{
            mb: tokens.spacing.md,
            p: tokens.spacing.md,
            backgroundColor: alpha(ds.colors.info.main, 0.05),
            borderRadius: `${tokens.borderRadius.lg}px`,
            border: `1px solid ${alpha(ds.colors.info.main, 0.2)}`,
          }}
        >
          <Typography
            sx={{
              fontSize: `${tokens.typography.sm}px`,
              fontWeight: ds.typography.fontWeight.bold,
              color: ds.colors.text.primary,
              mb: tokens.spacing.sm,
              display: "flex",
              alignItems: "center",
              gap: tokens.spacing.xs,
            }}
          >
            📊 Toplam Kesim Özeti
          </Typography>

          {(() => {
            // Aggregate all segments across all cuts
            const segmentTotals = plan.cuts.reduce(
              (acc, cutDetail) => {
                cutDetail.segments.forEach((segment) => {
                  const existing = acc.find(
                    (item) => item.length === segment.length,
                  );
                  if (existing) {
                    existing.totalCount += segment.quantity;
                  } else {
                    acc.push({
                      length: segment.length,
                      totalCount: segment.quantity,
                    });
                  }
                });
                return acc;
              },
              [] as Array<{ length: number; totalCount: number }>,
            );

            // Sort by length descending
            segmentTotals.sort((a, b) => b.length - a.length);

            return (
              <Stack spacing={tokens.spacing.xs}>
                {segmentTotals.map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: tokens.spacing.xs,
                      backgroundColor: alpha(ds.colors.neutral[900], 0.02),
                      borderRadius: `${tokens.borderRadius.sm}px`,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: ds.colors.text.primary,
                        fontFamily: "monospace",
                      }}
                    >
                      • {item.length} mm
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.875rem",
                        fontWeight: 700,
                        color: ds.colors.info.main,
                      }}
                    >
                      {item.totalCount} parça
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        color: ds.colors.text.secondary,
                      }}
                    >
                      ({plan.stockCount} stok boyundan, ort.{" "}
                      {(item.totalCount / plan.stockCount).toFixed(1)}{" "}
                      parça/stok)
                    </Typography>
                  </Box>
                ))}
              </Stack>
            );
          })()}
        </Box>

        <Divider sx={{ my: tokens.spacing.md }} />

        <Stack spacing={tokens.spacing.sm}>
          {(() => {
            // Group identical cutting plans
            const planGroups = plan.cuts.reduce(
              (acc, cutDetail) => {
                // Group segments by length for this cut
                const groupedSegments = cutDetail.segments.reduce(
                  (segAcc, segment) => {
                    const existing = segAcc.find(
                      (item) => item.length === segment.length,
                    );
                    if (existing) {
                      existing.count += segment.quantity;
                    } else {
                      segAcc.push({
                        length: segment.length,
                        count: segment.quantity,
                      });
                    }
                    return segAcc;
                  },
                  [] as Array<{ length: number; count: number }>,
                );

                // Sort by length descending
                groupedSegments.sort((a, b) => b.length - a.length);

                // Create pattern key: "2×992+2×687|waste42|efficiency98.8"
                const patternKey = [
                  groupedSegments
                    .map((item) => `${item.count}×${item.length}`)
                    .join("+"),
                  cutDetail.waste,
                  cutDetail.efficiency,
                ].join("|");

                // Find existing group
                const existingGroup = acc.find(
                  (group) => group.key === patternKey,
                );

                if (existingGroup) {
                  existingGroup.count += 1;
                } else {
                  acc.push({
                    key: patternKey,
                    count: 1,
                    patternLabel: groupedSegments
                      .map((item) => `${item.count} × ${item.length} mm`)
                      .join(" + "),
                    waste: cutDetail.waste,
                    efficiency: cutDetail.efficiency,
                  });
                }

                return acc;
              },
              [] as Array<{
                key: string;
                count: number;
                patternLabel: string;
                waste: number;
                efficiency: number;
              }>,
            );

            return (
              <>
                {/* Kesim Detayları */}
                <Typography
                  sx={{
                    fontSize: `${tokens.typography.sm}px`,
                    fontWeight: ds.typography.fontWeight.semibold,
                    mb: tokens.spacing.sm,
                    color: ds.colors.text.secondary,
                  }}
                >
                  Kesim Planları ({planGroups.length} Farklı Plan,{" "}
                  {plan.cuts.length} Adet)
                </Typography>

                {planGroups.map((group, idx) => (
                  <Box
                    key={group.key}
                    sx={{
                      p: tokens.spacing.sm,
                      backgroundColor: alpha(ds.colors.primary.main, 0.03),
                      borderRadius: `${tokens.borderRadius.md}px`,
                      border: `1px solid ${alpha(ds.colors.primary.main, 0.1)}`,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: tokens.spacing.xs,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: `${tokens.typography.sm}px`,
                          fontWeight: ds.typography.fontWeight.semibold,
                          color: ds.colors.text.primary,
                        }}
                      >
                        Kesim #{idx + 1}
                      </Typography>
                      {group.count > 1 && (
                        <Typography
                          sx={{
                            fontSize: `${tokens.typography.xs}px`,
                            fontWeight: ds.typography.fontWeight.semibold,
                            color: ds.colors.primary.main,
                            px: tokens.spacing.xs,
                            py: tokens.spacing.xxs,
                            backgroundColor: alpha(ds.colors.primary.main, 0.1),
                            borderRadius: `${tokens.borderRadius.sm}px`,
                          }}
                        >
                          {group.count} adet
                        </Typography>
                      )}
                    </Box>

                    <Typography
                      sx={{
                        fontSize: `${tokens.typography.sm}px`,
                        color: ds.colors.text.primary,
                        mb: tokens.spacing.xs,
                        fontWeight: ds.typography.fontWeight.semibold,
                        fontFamily: "monospace",
                      }}
                    >
                      {group.patternLabel}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={tokens.spacing.sm}
                      alignItems="center"
                    >
                      <Typography
                        sx={{
                          fontSize: `${tokens.typography.xs}px`,
                          color: ds.colors.text.secondary,
                        }}
                      >
                        Atık: {group.waste}mm
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: `${tokens.typography.xs}px`,
                          color: ds.colors.success.main,
                          fontWeight: ds.typography.fontWeight.semibold,
                        }}
                      >
                        Verimlilik: {group.efficiency}%
                      </Typography>
                    </Stack>
                  </Box>
                ))}
              </>
            );
          })()}
        </Stack>

        {/* Toplam Özet */}
        <Box
          sx={{
            mt: tokens.spacing.md,
            p: tokens.spacing.sm,
            backgroundColor: alpha(ds.colors.warning.main, 0.1),
            borderRadius: `${tokens.borderRadius.md}px`,
            border: `1px solid ${alpha(ds.colors.warning.main, 0.3)}`,
          }}
        >
          <Typography
            sx={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: ds.colors.warning[700],
            }}
          >
            Toplam Atık: {plan.totalWaste}mm
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
