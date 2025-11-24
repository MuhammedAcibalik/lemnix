/**
 * @fileoverview Parameters Panel Component - Design System v2.0
 * @module ParametersPanel
 * @version 2.0.0
 *
 * Tab 2: Optimization Parameters Configuration
 */

import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Alert,
  alpha,
  type SelectChangeEvent,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Psychology as PsychologyIcon,
  ExpandMore as ExpandMoreIcon,
  Straighten as RulerIcon,
  Check as CheckIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import {
  useDesignSystem,
  useAdaptiveUIContext,
  useAdaptiveVariant,
} from "@/shared/hooks";
import { AlgorithmModeSelector } from "@/widgets/algorithm-selector";
import type { ParametersStepProps, AlgorithmType } from "../types";

/**
 * ParametersPanel Component (formerly ParametersStep)
 * Modern tab-based panel with Design System v2.0
 */
export const ParametersStep: React.FC<ParametersStepProps> = ({
  params,
  onParamsChange,
  algorithmMode = "standard",
  onAlgorithmModeChange,
  itemCount,
  onStartOptimization,
  canStartOptimization = false,
  isOptimizing = false,
}) => {
  const ds = useDesignSystem();
  const { device, tokens } = useAdaptiveUIContext();

  const handleAlgorithmChange = (algorithm: AlgorithmType) => {
    onParamsChange({ ...params, algorithm });
  };

  const handleObjectiveToggle = (objectiveKey: string) => {
    const currentObjectives = params.objectives || [];
    const isSelected = currentObjectives.some(
      (obj) => obj.type === objectiveKey,
    );

    let newObjectives;
    if (isSelected) {
      // Remove objective
      newObjectives = currentObjectives.filter(
        (obj) => obj.type !== objectiveKey,
      );
    } else {
      // Add objective with default values
      newObjectives = [
        ...currentObjectives,
        {
          type: objectiveKey as
            | "minimize-waste"
            | "minimize-cost"
            | "minimize-time"
            | "maximize-efficiency",
          weight: 1,
          priority: "medium" as const,
        },
      ];
    }

    onParamsChange({ ...params, objectives: newObjectives });
  };

  const objectives = [
    {
      key: "maximize-efficiency",
      label: "Verimlilik Maksimizasyonu",
      description: "Malzeme kullanım oranını maksimize eder",
      color: ds.colors.primary.main,
      icon: "📈",
    },
    {
      key: "minimize-waste",
      label: "Atık Minimizasyonu",
      description: "Kesim artıklarını ve fire miktarını azaltır",
      color: ds.colors.success.main,
      icon: "♻️",
    },
    {
      key: "minimize-cost",
      label: "Maliyet Minimizasyonu",
      description: "Toplam malzeme ve işçilik maliyetini düşürür",
      color: ds.colors.warning.main,
      icon: "💰",
    },
    {
      key: "minimize-time",
      label: "Zaman Minimizasyonu",
      description: "Kurulum ve kesim süresini optimize eder",
      color: ds.colors.secondary.main,
      icon: "⚡",
    },
  ];

  const isObjectiveSelected = (key: string) => {
    return params.objectives?.some((obj) => obj.type === key) || false;
  };

  return (
    <Box
      sx={{
        p: 0,
        height: "100%",
      }}
    >
      {/* Enterprise Algorithm Configuration */}
      <Grid container spacing={tokens.layout.sectionSpacing}>
        {/* Algorithm Engine Selection */}
        <Grid item xs={12}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${alpha(ds.colors.primary.main, 0.03)} 0%, ${alpha(ds.colors.secondary.main, 0.02)} 100%)`,
              border: `2px solid ${alpha(ds.colors.primary.main, 0.08)}`,
              borderRadius: `${tokens.borderRadius.xl}px`,
              boxShadow: ds.shadows.soft.lg,
              position: "relative",
              overflow: "hidden",
              transition: ds.transitions.base,
              "&:hover": !device.isTouch
                ? {
                    borderColor: alpha(ds.colors.primary.main, 0.15),
                    boxShadow: ds.shadows.soft.xl,
                  }
                : {},
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "3px",
                background: ds.gradients.primary,
              },
            }}
          >
            <CardContent
              sx={{
                p: useAdaptiveVariant({
                  mobile: tokens.components.card.padding,
                  compact: tokens.spacing.md,
                  standard: tokens.spacing.lg,
                  dense: tokens.spacing.xl,
                  kiosk: tokens.spacing.xxl,
                }),
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: {
                    xs: tokens.spacing.md,
                    md: tokens.spacing.lg,
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: tokens.spacing.md,
                  }}
                >
                  <Box
                    sx={{
                      p: tokens.spacing.md,
                      borderRadius: `${tokens.borderRadius.xl}px`,
                      background: alpha(ds.colors.primary.main, 0.08),
                      border: `1px solid ${alpha(ds.colors.primary.main, 0.15)}`,
                    }}
                  >
                    <PsychologyIcon
                      sx={{
                        fontSize: {
                          xs: tokens.components.icon.md,
                          md: tokens.components.icon.lg,
                        },
                        color: ds.colors.primary.main,
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: {
                          xs: `${tokens.typography.lg}px`,
                          md: `${tokens.typography.xl}px`,
                        },
                        fontWeight: ds.typography.fontWeight.bold,
                        color: ds.colors.text.primary,
                        mb: tokens.spacing.xs,
                        letterSpacing: ds.typography.letterSpacing.tight,
                      }}
                    >
                      Algoritma Motoru
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: {
                          xs: `${tokens.typography.sm}px`,
                          md: `${tokens.typography.base}px`,
                        },
                        color: ds.colors.text.secondary,
                        fontWeight: ds.typography.fontWeight.medium,
                      }}
                    >
                      Optimizasyon algoritmasını seçin ve yapılandırın
                    </Typography>
                  </Box>
                </Box>

                <Chip
                  label="Enterprise"
                  size="small"
                  sx={{
                    height: tokens.components.button.sm,
                    fontSize: `${tokens.typography.xs}px`,
                    fontWeight: 700,
                    backgroundColor: alpha(ds.colors.primary.main, 0.08),
                    color: ds.colors.primary.main,
                    border: `1px solid ${alpha(ds.colors.primary.main, 0.2)}`,
                    borderRadius: `${tokens.borderRadius.md}px`,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                />
              </Box>

              {/* Algorithm Selection */}
              <Box sx={{ mb: tokens.spacing.sm }}>
                <Typography
                  sx={{
                    fontSize: `${tokens.typography.base}px`,
                    fontWeight: 600,
                    color: ds.colors.text.primary,
                    mb: tokens.spacing.xs,
                  }}
                >
                  Algoritma Seçimi
                </Typography>
                <Typography
                  sx={{
                    fontSize: `${tokens.typography.xs}px`,
                    color: ds.colors.text.secondary,
                  }}
                >
                  Optimizasyon algoritmasını seçin
                </Typography>
              </Box>

              {/* Algorithm Cards Grid - SQUARE CARDS */}
              <Grid container spacing={tokens.layout.gridGap}>
                {[
                  {
                    id: "bfd",
                    name: "BFD",
                    shortName: "Best Fit",
                    description: "Akıllı • Verimli",
                    icon: "🎯",
                    color: ds.colors.primary.main,
                  },
                  {
                    id: "genetic",
                    name: "GA",
                    shortName: "Genetic",
                    description: "AI • Çok Hedefli",
                    icon: "🧬",
                    color: ds.colors.secondary.main,
                  },
                ].map((algorithm) => {
                  const isSelected = params.algorithm === algorithm.id;
                  const isDisabled = false;

                  return (
                    <Grid
                      item
                      xs={6} // Mobile: 2 columns
                      sm={4} // Tablet: 3 columns
                      md={2.4} // Desktop: 5 columns
                      key={algorithm.id}
                    >
                      <Card
                        sx={{
                          cursor: isDisabled ? "not-allowed" : "pointer",
                          border: `2px solid ${isSelected ? algorithm.color : alpha(ds.colors.neutral[300], 0.2)}`,
                          borderRadius: `${tokens.borderRadius.xl}px`,
                          background: isSelected
                            ? `linear-gradient(135deg, ${alpha(algorithm.color, 0.08)} 0%, ${alpha(algorithm.color, 0.03)} 100%)`
                            : `linear-gradient(135deg, ${alpha(ds.colors.neutral[100], 0.3)} 0%, ${alpha(ds.colors.neutral[50], 0.5)} 100%)`,
                          transition: ds.transitions.base,
                          aspectRatio: "1",
                          position: "relative",
                          opacity: isDisabled ? 0.5 : 1,
                          pointerEvents: isDisabled ? "none" : "auto",
                          "&:hover":
                            !isDisabled && !device.isTouch
                              ? {
                                  borderColor: algorithm.color,
                                  background: `linear-gradient(135deg, ${alpha(algorithm.color, 0.05)} 0%, ${alpha(algorithm.color, 0.02)} 100%)`,
                                  transform: "translateY(-4px)",
                                  boxShadow: ds.shadows.soft.lg,
                                }
                              : {},
                        }}
                        onClick={() =>
                          !isDisabled &&
                          handleAlgorithmChange(algorithm.id as AlgorithmType)
                        }
                      >
                        {/* Selection Badge */}
                        {isSelected && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: tokens.spacing.sm,
                              right: tokens.spacing.sm,
                              width: tokens.components.icon.sm,
                              height: tokens.components.icon.sm,
                              borderRadius: "50%",
                              background: algorithm.color,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border: `2px solid ${ds.colors.background.paper}`,
                              boxShadow: ds.shadows.soft.md,
                              zIndex: 1,
                            }}
                          >
                            <CheckIcon
                              sx={{
                                fontSize: tokens.components.icon.xs,
                                color: "white",
                              }}
                            />
                          </Box>
                        )}

                        <CardContent
                          sx={{
                            p: useAdaptiveVariant({
                              mobile: tokens.components.card.padding,
                              compact: tokens.spacing.md,
                              standard: tokens.spacing.md,
                              dense: tokens.spacing.md,
                              kiosk: tokens.spacing.lg,
                            }),
                            textAlign: "center",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {/* Icon - Bigger for square */}
                          <Box
                            sx={{
                              width: {
                                xs: 64,
                                md: 80,
                                lg: 96,
                              },
                              height: {
                                xs: 64,
                                md: 80,
                                lg: 96,
                              },
                              borderRadius: "50%",
                              background: isSelected
                                ? `linear-gradient(135deg, ${alpha(algorithm.color, 0.15)} 0%, ${alpha(algorithm.color, 0.08)} 100%)`
                                : `linear-gradient(135deg, ${alpha(ds.colors.neutral[300], 0.1)} 0%, ${alpha(ds.colors.neutral[200], 0.05)} 100%)`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              mb: tokens.spacing.sm,
                              border: `2px solid ${isSelected ? alpha(algorithm.color, 0.2) : alpha(ds.colors.neutral[300], 0.1)}`,
                              transition: ds.transitions.base,
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: {
                                  xs: `${tokens.typography.xl}px`,
                                  md: `${tokens.typography.xxl}px`,
                                },
                              }}
                            >
                              {algorithm.icon}
                            </Typography>
                          </Box>

                          {/* Title - Compact */}
                          <Typography
                            sx={{
                              fontSize: `${tokens.typography.base}px`,
                              fontWeight: ds.typography.fontWeight.bold,
                              color: isSelected
                                ? algorithm.color
                                : ds.colors.text.primary,
                              mb: tokens.spacing.xs,
                              letterSpacing: ds.typography.letterSpacing.tight,
                            }}
                          >
                            {algorithm.name}
                          </Typography>

                          {/* Short Name */}
                          <Typography
                            sx={{
                              fontSize: `${tokens.typography.xs}px`,
                              fontWeight: 600,
                              color: ds.colors.text.secondary,
                              mb: tokens.spacing.sm,
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            {algorithm.shortName}
                          </Typography>

                          {/* Description - Compact */}
                          <Typography
                            sx={{
                              fontSize: `${tokens.typography.xs}px`,
                              color: ds.colors.text.secondary,
                              fontWeight: ds.typography.fontWeight.medium,
                              lineHeight: 1.3,
                              textAlign: "center",
                            }}
                          >
                            {algorithm.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Algorithm Mode Section (Hybrid Approach) */}
        {onAlgorithmModeChange && (
          <Grid item xs={12}>
            <Card
              sx={{
                border: `2px solid ${alpha(ds.colors.secondary.main, 0.08)}`,
                borderRadius: `${tokens.borderRadius.xl}px`,
                boxShadow: ds.shadows.soft.lg,
                background: `linear-gradient(135deg, ${alpha(ds.colors.secondary.main, 0.02)} 0%, ${alpha(ds.colors.primary.main, 0.02)} 100%)`,
                transition: ds.transitions.base,
                "&:hover": !device.isTouch
                  ? {
                      borderColor: alpha(ds.colors.secondary.main, 0.15),
                      boxShadow: ds.shadows.soft.xl,
                    }
                  : {},
              }}
            >
              <CardContent
                sx={{
                  p: useAdaptiveVariant({
                    mobile: tokens.components.card.padding,
                    compact: tokens.spacing.md,
                    standard: tokens.spacing.lg,
                    dense: tokens.spacing.xl,
                    kiosk: tokens.spacing.xxl,
                  }),
                }}
              >
                <AlgorithmModeSelector
                  value={algorithmMode}
                  onChange={onAlgorithmModeChange}
                  {...(itemCount !== undefined ? { itemCount } : {})}
                />
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Optimization Objectives */}
        <Grid item xs={12}>
          <Card
            sx={{
              border: `2px solid ${alpha(ds.colors.secondary.main, 0.08)}`,
              borderRadius: `${tokens.borderRadius.xl}px`,
              boxShadow: ds.shadows.soft.lg,
              background: `linear-gradient(135deg, ${alpha(ds.colors.secondary.main, 0.03)} 0%, ${alpha(ds.colors.success.main, 0.02)} 100%)`,
              transition: ds.transitions.base,
              "&:hover": !device.isTouch
                ? {
                    borderColor: alpha(ds.colors.secondary.main, 0.15),
                    boxShadow: ds.shadows.soft.xl,
                  }
                : {},
            }}
          >
            <CardContent
              sx={{
                p: useAdaptiveVariant({
                  mobile: tokens.components.card.padding,
                  compact: tokens.spacing.md,
                  standard: tokens.spacing.lg,
                  dense: tokens.spacing.xl,
                  kiosk: tokens.spacing.xxl,
                }),
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: tokens.spacing.md,
                  mb: {
                    xs: tokens.spacing.md,
                    md: tokens.spacing.lg,
                  },
                }}
              >
                <Box
                  sx={{
                    p: tokens.spacing.md,
                    borderRadius: `${tokens.borderRadius.xl}px`,
                    background: alpha(ds.colors.secondary.main, 0.08),
                    border: `1px solid ${alpha(ds.colors.secondary.main, 0.15)}`,
                  }}
                >
                  <SettingsIcon
                    sx={{
                      fontSize: {
                        xs: tokens.components.icon.md,
                        md: tokens.components.icon.lg,
                      },
                      color: ds.colors.secondary.main,
                    }}
                  />
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontSize: {
                        xs: `${tokens.typography.lg}px`,
                        md: `${tokens.typography.xl}px`,
                      },
                      fontWeight: ds.typography.fontWeight.bold,
                      color: ds.colors.text.primary,
                      mb: tokens.spacing.xs,
                      letterSpacing: ds.typography.letterSpacing.tight,
                    }}
                  >
                    Optimizasyon Hedefleri
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: {
                        xs: `${tokens.typography.sm}px`,
                        md: `${tokens.typography.base}px`,
                      },
                      color: ds.colors.text.secondary,
                      fontWeight: ds.typography.fontWeight.medium,
                    }}
                  >
                    Algoritmanın optimize edeceği hedefleri seçin
                  </Typography>
                </Box>
              </Box>

              {/* Objectives Grid */}
              <Grid
                container
                spacing={tokens.layout.sectionSpacing}
                justifyContent="center"
              >
                {objectives.map((objective) => {
                  const isSelected = isObjectiveSelected(objective.key);
                  return (
                    <Grid
                      item
                      xs={12} // Mobile: 1 column
                      sm={6} // Tablet: 2 columns
                      md={3} // Desktop: 4 columns
                      key={objective.key}
                    >
                      <Card
                        sx={{
                          cursor: "pointer",
                          border: `2px solid ${isSelected ? objective.color : alpha(ds.colors.neutral[300], 0.2)}`,
                          borderRadius: `${tokens.borderRadius.xl}px`,
                          background: isSelected
                            ? `linear-gradient(135deg, ${alpha(objective.color, 0.08)} 0%, ${alpha(objective.color, 0.03)} 100%)`
                            : `linear-gradient(135deg, ${alpha(ds.colors.neutral[100], 0.3)} 0%, ${alpha(ds.colors.neutral[50], 0.5)} 100%)`,
                          transition: ds.transitions.base,
                          aspectRatio: "1/1",
                          height: "auto",
                          display: "flex",
                          flexDirection: "column",
                          "&:hover": !device.isTouch
                            ? {
                                borderColor: objective.color,
                                background: `linear-gradient(135deg, ${alpha(objective.color, 0.05)} 0%, ${alpha(objective.color, 0.02)} 100%)`,
                                transform: "translateY(-4px)",
                                boxShadow: ds.shadows.soft.lg,
                              }
                            : {},
                        }}
                        onClick={() => handleObjectiveToggle(objective.key)}
                      >
                        <CardContent
                          sx={{
                            p: useAdaptiveVariant({
                              mobile: tokens.components.card.padding,
                              compact: tokens.spacing.md,
                              standard: tokens.spacing.lg,
                              dense: tokens.spacing.lg,
                              kiosk: tokens.spacing.xl,
                            }),
                            textAlign: "center",
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Box
                            sx={{
                              position: "relative",
                              width: "100%",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              flex: 1,
                              justifyContent: "center",
                            }}
                          >
                            <Box
                              sx={{
                                width: {
                                  xs: 64,
                                  md: 80,
                                  lg: 96,
                                },
                                height: {
                                  xs: 64,
                                  md: 80,
                                  lg: 96,
                                },
                                borderRadius: "50%",
                                background: isSelected
                                  ? `linear-gradient(135deg, ${alpha(objective.color, 0.15)} 0%, ${alpha(objective.color, 0.08)} 100%)`
                                  : `linear-gradient(135deg, ${alpha(ds.colors.neutral[300], 0.1)} 0%, ${alpha(ds.colors.neutral[200], 0.05)} 100%)`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mb: tokens.spacing.md,
                                border: `2px solid ${isSelected ? alpha(objective.color, 0.2) : alpha(ds.colors.neutral[300], 0.1)}`,
                                transition: ds.transitions.base,
                                position: "relative",
                              }}
                            >
                              {isSelected && (
                                <Box
                                  sx={{
                                    position: "absolute",
                                    top: -4,
                                    right: -4,
                                    width: tokens.components.icon.sm,
                                    height: tokens.components.icon.sm,
                                    borderRadius: "50%",
                                    background: objective.color,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    border: `2px solid ${ds.colors.background.paper}`,
                                    boxShadow: ds.shadows.soft.md,
                                  }}
                                >
                                  <CheckIcon
                                    sx={{
                                      fontSize: tokens.components.icon.xs,
                                      color: "white",
                                    }}
                                  />
                                </Box>
                              )}
                              <Typography
                                sx={{
                                  fontSize: {
                                    xs: `${tokens.typography.xl}px`,
                                    md: `${tokens.typography.xxl}px`,
                                  },
                                  lineHeight: 1,
                                }}
                              >
                                {objective.icon}
                              </Typography>
                            </Box>
                            <Typography
                              sx={{
                                fontSize: `${tokens.typography.lg}px`,
                                fontWeight: ds.typography.fontWeight.bold,
                                color: isSelected
                                  ? objective.color
                                  : ds.colors.text.primary,
                                mb: tokens.spacing.sm,
                                letterSpacing:
                                  ds.typography.letterSpacing.tight,
                              }}
                            >
                              {objective.label}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: `${tokens.typography.sm}px`,
                                color: ds.colors.text.secondary,
                                fontWeight: ds.typography.fontWeight.normal,
                                lineHeight: 1.4,
                                mt: tokens.spacing.xs,
                                width: "100%",
                                display: "block",
                                opacity: 0.9,
                              }}
                            >
                              {objective.description}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Stock Lengths Configuration */}
        <Grid item xs={12}>
          <Card
            sx={{
              border: `2px solid ${alpha(ds.colors.info.main, 0.08)}`,
              borderRadius: `${tokens.borderRadius.xl}px`,
              boxShadow: ds.shadows.soft.lg,
              background: `linear-gradient(135deg, ${alpha(ds.colors.info.main, 0.02)} 0%, ${alpha(ds.colors.neutral[50], 0.5)} 100%)`,
              transition: ds.transitions.base,
              "&:hover": !device.isTouch
                ? {
                    borderColor: alpha(ds.colors.info.main, 0.15),
                    boxShadow: ds.shadows.soft.xl,
                  }
                : {},
            }}
          >
            <CardContent
              sx={{
                p: useAdaptiveVariant({
                  mobile: tokens.components.card.padding,
                  compact: tokens.spacing.md,
                  standard: tokens.spacing.lg,
                  dense: tokens.spacing.xl,
                  kiosk: tokens.spacing.xxl,
                }),
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: tokens.spacing.md,
                  mb: {
                    xs: tokens.spacing.md,
                    md: tokens.spacing.lg,
                  },
                }}
              >
                <Box
                  sx={{
                    p: {
                      xs: tokens.spacing.sm,
                      md: tokens.spacing.md,
                      lg: tokens.spacing.lg,
                    },
                    borderRadius: `${tokens.borderRadius.xl}px`,
                    background: alpha(ds.colors.info.main, 0.08),
                    border: `1px solid ${alpha(ds.colors.info.main, 0.15)}`,
                  }}
                >
                  <RulerIcon
                    sx={{
                      fontSize: {
                        xs: tokens.components.icon.md,
                        md: tokens.components.icon.lg,
                      },
                      color: ds.colors.info.main,
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontSize: {
                        xs: `${tokens.typography.lg}px`,
                        md: `${tokens.typography.xl}px`,
                      },
                      fontWeight: ds.typography.fontWeight.bold,
                      color: ds.colors.text.primary,
                      mb: tokens.spacing.xs,
                      letterSpacing: ds.typography.letterSpacing.tight,
                    }}
                  >
                    Stok Boy Uzunlukları
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: {
                        xs: `${tokens.typography.sm}px`,
                        md: `${tokens.typography.base}px`,
                      },
                      color: ds.colors.text.secondary,
                      fontWeight: ds.typography.fontWeight.medium,
                    }}
                  >
                    Optimizasyonda kullanılacak alüminyum profil stok boyları
                  </Typography>
                </Box>
              </Box>

              {/* Stock Lengths Display */}
              <Stack
                direction="row"
                spacing={tokens.spacing.sm}
                flexWrap="wrap"
                useFlexGap
                sx={{
                  p: {
                    xs: tokens.spacing.sm,
                    md: tokens.spacing.md,
                    lg: tokens.spacing.lg,
                  },
                  backgroundColor: alpha(ds.colors.info.main, 0.03),
                  borderRadius: `${tokens.borderRadius.lg}px`,
                  border: `1px dashed ${alpha(ds.colors.info.main, 0.2)}`,
                  minHeight: {
                    xs: tokens.components.input.sm,
                    md: tokens.components.input.md,
                    lg: tokens.components.input.lg,
                  },
                  alignItems: "center",
                }}
              >
                {params.stockLengths.map((length) => (
                  <Chip
                    key={length}
                    label={`${length} mm`}
                    icon={
                      <RulerIcon sx={{ fontSize: tokens.components.icon.xs }} />
                    }
                    sx={{
                      height: {
                        xs: tokens.components.button.sm,
                        md: tokens.components.button.md,
                      },
                      fontSize: `${tokens.typography.sm}px`,
                      fontWeight: 600,
                      backgroundColor: ds.colors.info.main,
                      color: "white",
                      px: {
                        xs: tokens.spacing.sm,
                        md: tokens.spacing.md,
                      },
                      "& .MuiChip-icon": {
                        color: "rgba(255, 255, 255, 0.8)",
                      },
                    }}
                  />
                ))}
              </Stack>

              {/* Info */}
              <Alert
                severity="info"
                icon={<InfoIcon />}
                sx={{
                  mt: tokens.spacing.md,
                  borderRadius: `${tokens.borderRadius.md}px`,
                  fontSize: `${tokens.typography.xs}px`,
                  backgroundColor: alpha(ds.colors.info.main, 0.05),
                  border: `1px solid ${alpha(ds.colors.info.main, 0.15)}`,
                }}
              >
                Stok boy uzunluklarını değiştirmek için iş emri seçim adımına
                geri dönün ve yeniden seçim yapın.
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Advanced Parameters */}
        <Grid item xs={12}>
          <Accordion
            sx={{
              border: `2px solid ${alpha(ds.colors.warning.main, 0.08)}`,
              borderRadius: `${tokens.borderRadius.xl}px !important`,
              boxShadow: ds.shadows.soft.sm,
              background: `linear-gradient(135deg, ${alpha(ds.colors.warning.main, 0.02)} 0%, ${alpha(ds.colors.neutral[50], 0.5)} 100%)`,
              "&:before": {
                display: "none",
              },
              "&.Mui-expanded": {
                margin: 0,
                boxShadow: ds.shadows.soft.lg,
                borderColor: alpha(ds.colors.warning.main, 0.15),
              },
            }}
          >
            <AccordionSummary
              expandIcon={
                <ExpandMoreIcon
                  sx={{
                    fontSize: tokens.components.icon.md,
                    color: ds.colors.warning.main,
                  }}
                />
              }
              sx={{
                px: useAdaptiveVariant({
                  mobile: tokens.components.card.padding,
                  compact: tokens.spacing.md,
                  standard: tokens.spacing.lg,
                  dense: tokens.spacing.xl,
                  kiosk: tokens.spacing.xxl,
                }),
                py: {
                  xs: tokens.spacing.sm,
                  md: tokens.spacing.md,
                },
                minHeight: tokens.components.minTouchTarget,
                "& .MuiAccordionSummary-content": {
                  display: "flex",
                  alignItems: "center",
                  gap: tokens.spacing.md,
                },
              }}
            >
              <Box
                sx={{
                  p: {
                    xs: tokens.spacing.sm,
                    md: tokens.spacing.md,
                    lg: tokens.spacing.lg,
                  },
                  borderRadius: `${tokens.borderRadius.xl}px`,
                  background: alpha(ds.colors.warning.main, 0.08),
                  border: `1px solid ${alpha(ds.colors.warning.main, 0.15)}`,
                }}
              >
                <RulerIcon
                  sx={{
                    fontSize: {
                      xs: tokens.components.icon.md,
                      md: tokens.components.icon.lg,
                    },
                    color: ds.colors.warning.main,
                  }}
                />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: {
                      xs: `${tokens.typography.lg}px`,
                      md: `${tokens.typography.xl}px`,
                    },
                    fontWeight: ds.typography.fontWeight.bold,
                    color: ds.colors.text.primary,
                    letterSpacing: ds.typography.letterSpacing.tight,
                  }}
                >
                  Gelişmiş Parametreler
                </Typography>
                <Typography
                  sx={{
                    fontSize: {
                      xs: `${tokens.typography.sm}px`,
                      md: `${tokens.typography.base}px`,
                    },
                    color: ds.colors.text.secondary,
                    fontWeight: ds.typography.fontWeight.medium,
                  }}
                >
                  Kesim toleransları ve güvenlik ayarları
                </Typography>
              </Box>
              <Chip
                label="Opsiyonel"
                size="small"
                sx={{
                  height: tokens.components.button.sm,
                  fontSize: `${tokens.typography.xs}px`,
                  fontWeight: 700,
                  backgroundColor: alpha(ds.colors.warning.main, 0.08),
                  color: ds.colors.warning.main,
                  border: `1px solid ${alpha(ds.colors.warning.main, 0.2)}`,
                  borderRadius: `${tokens.borderRadius.md}px`,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  ml: "auto",
                }}
              />
            </AccordionSummary>
            <AccordionDetails
              sx={{
                px: useAdaptiveVariant({
                  mobile: tokens.components.card.padding,
                  compact: tokens.spacing.md,
                  standard: tokens.spacing.lg,
                  dense: tokens.spacing.xl,
                  kiosk: tokens.spacing.xxl,
                }),
                pb: {
                  xs: tokens.spacing.md,
                  md: tokens.spacing.lg,
                },
              }}
            >
              <Grid container spacing={tokens.layout.sectionSpacing}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: tokens.spacing.md }}>
                    <TextField
                      fullWidth
                      label="Kesim Genişliği (Kerf)"
                      type="number"
                      value={params.constraints?.kerfWidth || 0}
                      onChange={(e) =>
                        onParamsChange({
                          ...params,
                          constraints: {
                            ...params.constraints,
                            kerfWidth: Number(e.target.value),
                          },
                        })
                      }
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">mm</InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: `${tokens.borderRadius.xl}px`,
                          fontSize: `${tokens.typography.sm}px`,
                          height: tokens.components.input.md,
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderWidth: "2px",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          fontSize: `${tokens.typography.base}px`,
                          fontWeight: 600,
                        },
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: tokens.spacing.md }}>
                    <TextField
                      fullWidth
                      label="Güvenlik Mesafesi (Başlangıç)"
                      type="number"
                      value={params.constraints?.startSafety || 0}
                      onChange={(e) =>
                        onParamsChange({
                          ...params,
                          constraints: {
                            ...params.constraints,
                            startSafety: Number(e.target.value),
                          },
                        })
                      }
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">mm</InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: `${tokens.borderRadius.xl}px`,
                          fontSize: `${tokens.typography.sm}px`,
                          height: tokens.components.input.md,
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderWidth: "2px",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          fontSize: `${tokens.typography.base}px`,
                          fontWeight: 600,
                        },
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: tokens.spacing.md }}>
                    <TextField
                      fullWidth
                      label="Güvenlik Mesafesi (Bitiş)"
                      type="number"
                      value={params.constraints?.endSafety || 0}
                      onChange={(e) =>
                        onParamsChange({
                          ...params,
                          constraints: {
                            ...params.constraints,
                            endSafety: Number(e.target.value),
                          },
                        })
                      }
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">mm</InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: `${tokens.borderRadius.xl}px`,
                          fontSize: `${tokens.typography.sm}px`,
                          height: tokens.components.input.md,
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderWidth: "2px",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          fontSize: `${tokens.typography.base}px`,
                          fontWeight: 600,
                        },
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: tokens.spacing.md }}>
                    <TextField
                      fullWidth
                      label="Minimum Artık Uzunluk"
                      type="number"
                      value={params.constraints?.minScrapLength || 0}
                      onChange={(e) =>
                        onParamsChange({
                          ...params,
                          constraints: {
                            ...params.constraints,
                            minScrapLength: Number(e.target.value),
                          },
                        })
                      }
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">mm</InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: `${tokens.borderRadius.xl}px`,
                          fontSize: `${tokens.typography.sm}px`,
                          height: tokens.components.input.md,
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderWidth: "2px",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          fontSize: `${tokens.typography.base}px`,
                          fontWeight: 600,
                        },
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ParametersStep;
