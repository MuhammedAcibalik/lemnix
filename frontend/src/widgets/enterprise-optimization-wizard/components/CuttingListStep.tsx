/**
 * @fileoverview Cutting List Panel Component - Design System v2.0
 * @module CuttingListPanel
 * @version 2.0.0
 *
 * Tab 1: Cutting List Selection and Management
 */

import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  alpha,
  Chip,
} from "@mui/material";
import {
  ListAlt as ListIcon,
  Add as AddIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";
import { useDesignSystem, useAdaptiveUIContext } from "@/shared/hooks";
import {
  CuttingListStepProps,
  CuttingListData,
  CuttingListSection,
} from "../types";

/**
 * CuttingListPanel Component (formerly CuttingListStep)
 * Modern tab-based panel with Design System v2.0 + Delete with 5s Undo
 */
export const CuttingListStep: React.FC<CuttingListStepProps> = ({
  cuttingLists = [],
  selectedCuttingList,
  onCuttingListSelect,
}) => {
  const ds = useDesignSystem();
  const { device, tokens } = useAdaptiveUIContext();

  // ❌ REMOVED: Delete functionality disabled - cutting lists should not be deleted

  return (
    <Box
      sx={{
        p: tokens.components.card.padding,
        height: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: tokens.spacing.md,
        }}
      >
        {/* Section Header */}
        <Box
          sx={{ display: "flex", alignItems: "center", gap: tokens.spacing.sm }}
        >
          <ListIcon sx={{ fontSize: tokens.components.icon.sm, color: ds.colors.primary.main }} />
          <Typography
            sx={{
              fontSize: `${tokens.typography.base}px`,
              fontWeight: ds.typography.fontWeight.semibold,
              color: ds.colors.text.primary,
            }}
          >
            Mevcut Kesim Listeleri
          </Typography>
          <Chip
            label={cuttingLists.length}
            size="small"
            sx={{
              height: tokens.components.button.sm,
              fontSize: `${tokens.typography.xs}px`,
              fontWeight: ds.typography.fontWeight.semibold,
              backgroundColor: alpha(ds.colors.primary.main, 0.1),
              color: ds.colors.primary.main,
            }}
          />
        </Box>

        {cuttingLists.length > 0 ? (
          <Grid container spacing={tokens.layout.gridGap}>
            {cuttingLists.map((list: CuttingListData) => {
              const isSelected = selectedCuttingList?.id === list.id;
              const itemCount =
                list.sections?.reduce(
                  (total, section: CuttingListSection) =>
                    total + (section.items?.length || 0),
                  0,
                ) || 0;

              return (
                <Grid 
                  item 
                  xs={12}  // Mobile: 1 column
                  sm={6}   // Tablet: 2 columns
                  md={4}   // Laptop: 3 columns
                  lg={3}   // Desktop: 4 columns
                  xl={2.4} // TV: 5 columns
                  key={list.id}
                >
                  <Card
                    sx={{
                      cursor: "pointer",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      border: `2px solid ${isSelected ? ds.colors.primary.main : alpha(ds.colors.neutral[300], 0.5)}`,
                      borderRadius: `${tokens.borderRadius.lg}px`,
                      boxShadow: isSelected
                        ? ds.shadows.soft.md
                        : ds.shadows.soft.sm,
                      transition: ds.transitions.fast,
                      background: isSelected
                        ? alpha(ds.colors.primary.main, 0.02)
                        : ds.colors.background.paper,
                      minHeight: device.isTouch ? tokens.components.minTouchTarget * 2 : undefined,
                      "&:hover": !device.isTouch ? {
                        transform: "translateY(-4px)",
                        boxShadow: ds.shadows.soft.xl,
                        borderColor: ds.colors.primary.main,
                      } : {},
                    }}
                    onClick={() => onCuttingListSelect(list)}
                  >
                    <CardContent
                      sx={{
                        p: {
                          xs: tokens.components.card.padding,
                          md: tokens.spacing.md,
                        },
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        gap: tokens.components.card.gap,
                      }}
                    >
                      {isSelected && (
                        <CheckIcon
                          sx={{
                            fontSize: tokens.components.icon.md,
                            color: ds.colors.success.main,
                            mb: tokens.spacing.xs,
                          }}
                        />
                      )}
                      <Typography
                        sx={{
                          fontWeight: ds.typography.fontWeight.bold,
                          color: ds.colors.text.primary,
                          fontSize: {
                            xs: `${tokens.typography.base}px`,
                            md: `${tokens.typography.lg}px`,
                          },
                          mb: tokens.spacing.xs,
                        }}
                      >
                        {list.title || list.name}
                      </Typography>
                      <Typography
                        sx={{
                          color: ds.colors.text.secondary,
                          fontSize: `${tokens.typography.sm}px`,
                          fontWeight: ds.typography.fontWeight.normal,
                          mb: tokens.spacing.xs,
                        }}
                      >
                        {itemCount} öğe
                      </Typography>
                      {list.weekNumber && (
                        <Chip
                          label={`Hafta ${list.weekNumber}`}
                          size="small"
                          sx={{
                            height: tokens.components.button.sm,
                            fontSize: `${tokens.typography.xs}px`,
                            fontWeight: 600,
                            backgroundColor: alpha(ds.colors.primary.main, 0.1),
                            color: ds.colors.primary.main,
                          }}
                        />
                      )}

                      {/* ❌ REMOVED: Delete button disabled - cutting lists should not be deleted */}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Card
            sx={{
              border: `1px solid ${alpha(ds.colors.warning.main, 0.2)}`,
              borderRadius: `${tokens.borderRadius.lg}px`,
              background: alpha(ds.colors.warning.main, 0.02),
              boxShadow: ds.shadows.soft.sm,
            }}
          >
            <CardContent sx={{ p: tokens.spacing.lg }}>
              <Box
                sx={{
                  textAlign: "center",
                }}
              >
                <ListIcon
                  sx={{
                    fontSize: tokens.components.icon.xl,
                    color: ds.colors.warning.main,
                    mb: tokens.spacing.md,
                    opacity: 0.8,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: `${tokens.typography.lg}px`,
                    fontWeight: ds.typography.fontWeight.semibold,
                    color: ds.colors.text.primary,
                    mb: tokens.spacing.xs,
                  }}
                >
                  Henüz Kesim Listesi Yok
                </Typography>
                <Typography
                  sx={{
                    fontSize: `${tokens.typography.sm}px`,
                    color: ds.colors.text.secondary,
                    mb: tokens.spacing.lg,
                    maxWidth: 400,
                    mx: "auto",
                  }}
                >
                  Optimizasyon yapabilmek için önce bir kesim listesi
                  oluşturmanız gerekiyor
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => (window.location.href = "/cutting-list")}
                  sx={{
                    height: {
                      xs: tokens.components.button.lg,
                      md: tokens.components.button.md,
                    },
                    minHeight: device.isTouch ? tokens.components.minTouchTarget : undefined,
                    px: tokens.spacing.lg,
                    background: ds.gradients.primary,
                    color: "white",
                    fontWeight: ds.typography.fontWeight.semibold,
                    fontSize: `${tokens.typography.base}px`,
                    borderRadius: `${tokens.borderRadius.md}px`,
                    textTransform: "none",
                    boxShadow: ds.shadows.soft.md,
                    transition: ds.transitions.fast,
                    "&:hover": {
                      background: ds.gradients.primary,
                      opacity: 0.9,
                      transform: "translateY(-2px)",
                      boxShadow: ds.shadows.soft.lg,
                    },
                  }}
                >
                  Kesim Listesi Yönetimine Git
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* ❌ REMOVED: Undo Snackbar removed - cutting lists should not be deleted */}
    </Box>
  );
};

export default CuttingListStep;
