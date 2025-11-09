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
import { useDesignSystem } from "@/shared/hooks";
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

  if (!plan) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: `${ds.borderRadius.xl}px`,
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: ds.glass.background,
          backdropFilter: ds.glass.backdropFilter,
        }}
      >
        <Typography
          sx={{
            fontSize: "1.25rem",
            fontWeight: 700,
            background: ds.gradients.primary,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Kesim Detayları - {plan.workOrderId}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: ds.spacing["4"] }}>
        {/* Plan Özeti */}
        <Box sx={{ mb: ds.spacing["3"] }}>
          <Typography
            sx={{
              fontSize: "1rem",
              fontWeight: 600,
              mb: ds.spacing["2"],
              color: ds.colors.text.primary,
            }}
          >
            {plan.stockLength}mm Stok Profili
          </Typography>

          <Stack direction="row" spacing={ds.spacing["3"]}>
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

        <Divider sx={{ my: ds.spacing["3"] }} />

        {/* ✅ FIX: Work Order Breakdown for Pooled Results */}
        {plan.workOrderCount && plan.workOrderCount > 1 && (
          <Box
            sx={{
              mb: ds.spacing["3"],
              p: ds.spacing["3"],
              backgroundColor: alpha(ds.colors.primary.main, 0.05),
              borderRadius: `${ds.borderRadius.lg}px`,
              border: `1px solid ${alpha(ds.colors.primary.main, 0.2)}`,
            }}
          >
            <Typography
              sx={{
                fontSize: "1rem",
                fontWeight: 600,
                mb: ds.spacing["2"],
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
            mb: ds.spacing["3"],
            p: ds.spacing["3"],
            backgroundColor: alpha(ds.colors.info.main, 0.05),
            borderRadius: `${ds.borderRadius.lg}px`,
            border: `1px solid ${alpha(ds.colors.info.main, 0.2)}`,
          }}
        >
          <Typography
            sx={{
              fontSize: "0.9375rem",
              fontWeight: 700,
              color: ds.colors.text.primary,
              mb: ds.spacing["2"],
              display: "flex",
              alignItems: "center",
              gap: ds.spacing["1"],
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
              <Stack spacing={ds.spacing["1"]}>
                {segmentTotals.map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: ds.spacing["1"],
                      backgroundColor: alpha(ds.colors.neutral[900], 0.02),
                      borderRadius: `${ds.borderRadius.sm}px`,
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

        <Divider sx={{ my: ds.spacing["3"] }} />

        {/* Kesim Detayları */}
        <Typography
          sx={{
            fontSize: "0.875rem",
            fontWeight: 600,
            mb: ds.spacing["2"],
            color: ds.colors.text.secondary,
          }}
        >
          Kesim Planları ({plan.cuts.length} Adet)
        </Typography>

        <Stack spacing={ds.spacing["2"]}>
          {plan.cuts.map((cutDetail, idx) => {
            // Group segments by length
            const groupedSegments = cutDetail.segments.reduce(
              (acc, segment) => {
                const existing = acc.find(
                  (item) => item.length === segment.length,
                );
                if (existing) {
                  existing.count += segment.quantity;
                } else {
                  acc.push({ length: segment.length, count: segment.quantity });
                }
                return acc;
              },
              [] as Array<{ length: number; count: number }>,
            );

            // Sort by length descending (longest first)
            groupedSegments.sort((a, b) => b.length - a.length);

            // Format: "7 × 992 mm + 2 × 687 mm"
            const patternLabel = groupedSegments
              .map((item) => `${item.count} × ${item.length} mm`)
              .join(" + ");

            return (
              <Box
                key={idx}
                sx={{
                  p: ds.spacing["2"],
                  backgroundColor: alpha(ds.colors.primary.main, 0.03),
                  borderRadius: `${ds.borderRadius.md}px`,
                  border: `1px solid ${alpha(ds.colors.primary.main, 0.1)}`,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    mb: ds.spacing["1"],
                    color: ds.colors.text.primary,
                  }}
                >
                  Kesim #{idx + 1}
                </Typography>

                <Typography
                  sx={{
                    fontSize: "0.875rem",
                    color: ds.colors.text.primary,
                    mb: ds.spacing["1"],
                    fontWeight: 600,
                    fontFamily: "monospace",
                  }}
                >
                  {patternLabel}
                </Typography>

                <Stack
                  direction="row"
                  spacing={ds.spacing["2"]}
                  alignItems="center"
                >
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      color: ds.colors.text.secondary,
                    }}
                  >
                    Atık: {cutDetail.waste}mm
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      color: ds.colors.success.main,
                      fontWeight: 600,
                    }}
                  >
                    Verimlilik: {cutDetail.efficiency}%
                  </Typography>
                </Stack>
              </Box>
            );
          })}
        </Stack>

        {/* Toplam Özet */}
        <Box
          sx={{
            mt: ds.spacing["3"],
            p: ds.spacing["2"],
            backgroundColor: alpha(ds.colors.warning.main, 0.1),
            borderRadius: `${ds.borderRadius.md}px`,
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
