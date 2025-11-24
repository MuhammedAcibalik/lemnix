/**
 * @fileoverview Cutting Lists Grid - Modern Edition
 * @module CuttingListsGrid
 * @version 2.0.0 - Design System v2 Compliant
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Stack,
  Grid,
  Chip,
  Button,
  alpha,
  IconButton,
  Snackbar,
  Alert,
  LinearProgress,
} from "@mui/material";
import {
  Assessment as AssessmentIcon,
  CalendarToday as CalendarIcon,
  Inventory as InventoryIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowIcon,
  Delete as DeleteIcon,
  Undo as UndoIcon,
} from "@mui/icons-material";

// Design System v2.0
import { useDesignSystem } from "@/shared/hooks";
import { CardV2, FadeIn, ScaleIn, PrimaryButton } from "@/shared";
import { useDeleteCuttingList } from "@/entities/cutting-list";
import { CuttingList } from "../types";

interface CuttingListsGridProps {
  cuttingLists: CuttingList[];
  currentWeekNumber: number;
  onSelectList: (list: CuttingList) => void;
  onDeleteList?: (id: string) => void; // Optional callback for parent to update state
}

export const CuttingListsGrid: React.FC<CuttingListsGridProps> = ({
  cuttingLists,
  currentWeekNumber,
  onSelectList,
  onDeleteList,
}) => {
  const ds = useDesignSystem();

  // Delete mutation with optimistic update
  const deleteMutation = useDeleteCuttingList();

  // Undo state
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [countdown, setCountdown] = useState(5);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const deleteTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle delete button click
  const handleDeleteClick = (event: React.MouseEvent, list: CuttingList) => {
    event.stopPropagation(); // Prevent card selection

    // Start undo countdown
    setPendingDelete({ id: list.id, title: list.title || "Kesim Listesi" });
    setCountdown(5);

    // Start countdown timer (updates every second)
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Schedule actual deletion after 5 seconds
    deleteTimerRef.current = setTimeout(() => {
      executeDelete(list.id);
    }, 5000);
  };

  // Execute actual deletion
  const executeDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        console.log("✅ Cutting list permanently deleted:", id);
        // Notify parent to update local state
        if (onDeleteList) {
          onDeleteList(id);
        }
      },
      onError: (error) => {
        console.error("❌ Failed to delete cutting list:", error);
      },
      onSettled: () => {
        setPendingDelete(null);
        setCountdown(5);
      },
    });
  };

  // Handle undo
  const handleUndo = () => {
    // Clear timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
      deleteTimerRef.current = null;
    }

    // Reset state
    setPendingDelete(null);
    setCountdown(5);

    console.log("↩️ Deletion cancelled");
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
    };
  }, []);

  return (
    <FadeIn>
      <CardV2
        variant="glass"
        sx={{
          mb: ds.spacing["4"],
          border: `1px solid ${ds.colors.neutral[300]}`,
        }}
      >
        <Box sx={{ p: ds.spacing["2"] }}>
          {/* Header */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={ds.spacing["2"]}
            sx={{ mb: ds.spacing["4"] }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: `${ds.borderRadius.md}px`,
                background: ds.gradients.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: ds.shadows.soft.sm,
              }}
            >
              <AssessmentIcon
                sx={{
                  fontSize: ds.componentSizes.icon.medium,
                  color: ds.colors.text.inverse,
                }}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  color: ds.colors.text.primary,
                  mb: 0.5,
                }}
              >
                Mevcut Kesim Listeleri
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.8125rem",
                  color: ds.colors.text.secondary,
                }}
              >
                {cuttingLists.length} adet kesim listesi bulundu
              </Typography>
            </Box>
          </Stack>

          {/* Empty State */}
          {cuttingLists.length === 0 ? (
            <Box
              sx={{
                py: ds.spacing["8"],
                px: ds.spacing["4"],
                textAlign: "center",
                background: alpha(ds.colors.neutral[100], 0.5),
                borderRadius: `${ds.borderRadius.lg}px`,
                border: `2px dashed ${ds.colors.neutral[300]}`,
              }}
            >
              <AssessmentIcon
                sx={{
                  fontSize: 48,
                  color: ds.colors.neutral[400],
                  mb: ds.spacing["3"],
                }}
              />
              <Typography
                sx={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: ds.colors.text.primary,
                  mb: ds.spacing["1"],
                }}
              >
                Henüz Kesim Listesi Yok
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.875rem",
                  color: ds.colors.text.secondary,
                }}
              >
                Yeni bir kesim listesi oluşturarak başlayın.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={ds.spacing["3"]}>
              {cuttingLists.map((list, index) => {
                const isCurrentWeek = list.weekNumber === currentWeekNumber;
                const totalSections = list.sections.length;
                const totalItems = list.sections.reduce(
                  (sum, section) => sum + section.items.length,
                  0,
                );

                return (
                  <Grid item xs={12} sm={6} md={4} key={list.id}>
                    <ScaleIn delay={0}>
                      <CardV2
                        variant={isCurrentWeek ? "elevated" : "glass"}
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          position: "relative", // For delete button positioning
                          ...(isCurrentWeek
                            ? { border: `2px solid ${ds.colors.primary.main}` }
                            : {}),
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: ds.shadows.soft.lg,
                            borderColor: ds.colors.primary.main,
                          },
                          transition: ds.transitions.base,
                        }}
                      >
                        <Box
                          sx={{
                            p: ds.spacing["3"],
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <Stack spacing={ds.spacing["2"]} sx={{ flex: 1 }}>
                            {/* Header */}
                            <Stack
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                            >
                              <Typography
                                sx={{
                                  fontSize: "1rem",
                                  fontWeight: 600,
                                  color: ds.colors.text.primary,
                                }}
                              >
                                {list.title}
                              </Typography>
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={ds.spacing["1"]}
                              >
                                {isCurrentWeek && (
                                  <Chip
                                    icon={
                                      <CheckCircleIcon
                                        sx={{
                                          fontSize:
                                            ds.componentSizes.icon.small,
                                        }}
                                      />
                                    }
                                    label="Aktif"
                                    size="small"
                                    sx={{
                                      height: 22,
                                      fontSize: "0.6875rem",
                                      fontWeight: 600,
                                      background: alpha(
                                        ds.colors.success.main,
                                        0.1,
                                      ),
                                      color: ds.colors.success.main,
                                      border: `1px solid ${alpha(ds.colors.success.main, 0.3)}`,
                                    }}
                                  />
                                )}

                                {/* Delete Button */}
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleDeleteClick(e, list)}
                                  disabled={pendingDelete?.id === list.id}
                                  sx={{
                                    width: 28,
                                    height: 28,
                                    backgroundColor: alpha(
                                      ds.colors.error.main,
                                      0.1,
                                    ),
                                    border: `1px solid ${alpha(ds.colors.error.main, 0.2)}`,
                                    color: ds.colors.error.main,
                                    transition: ds.transitions.fast,
                                    opacity:
                                      pendingDelete?.id === list.id ? 0.5 : 1,
                                    "&:hover": {
                                      backgroundColor: alpha(
                                        ds.colors.error.main,
                                        0.15,
                                      ),
                                      borderColor: alpha(
                                        ds.colors.error.main,
                                        0.3,
                                      ),
                                      transform: "scale(1.05)",
                                    },
                                    "&:disabled": {
                                      backgroundColor: alpha(
                                        ds.colors.neutral[400],
                                        0.1,
                                      ),
                                      color: ds.colors.neutral[400],
                                    },
                                  }}
                                >
                                  <DeleteIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Stack>
                            </Stack>

                            {/* Stats Grid */}
                            <Grid container spacing={1}>
                              <Grid item xs={4}>
                                <Box
                                  sx={{
                                    p: 1,
                                    borderRadius: `${ds.borderRadius.sm}px`,
                                    background: alpha(
                                      ds.colors.primary.main,
                                      0.05,
                                    ),
                                    border: `1px solid ${alpha(ds.colors.primary.main, 0.1)}`,
                                    textAlign: "center",
                                  }}
                                >
                                  <CalendarIcon
                                    sx={{
                                      fontSize: ds.componentSizes.icon.medium,
                                      color: ds.colors.primary.main,
                                      mb: 0.5,
                                    }}
                                  />
                                  <Typography
                                    sx={{
                                      fontSize: "0.875rem",
                                      fontWeight: 600,
                                      color: ds.colors.text.primary,
                                      lineHeight: 1,
                                    }}
                                  >
                                    {list.weekNumber}
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontSize: "0.625rem",
                                      color: ds.colors.text.secondary,
                                      lineHeight: 1,
                                      mt: 0.5,
                                    }}
                                  >
                                    Hafta
                                  </Typography>
                                </Box>
                              </Grid>

                              <Grid item xs={4}>
                                <Box
                                  sx={{
                                    p: 1,
                                    borderRadius: `${ds.borderRadius.sm}px`,
                                    background: alpha(
                                      ds.colors.accent.main,
                                      0.05,
                                    ),
                                    border: `1px solid ${alpha(ds.colors.accent.main, 0.1)}`,
                                    textAlign: "center",
                                  }}
                                >
                                  <InventoryIcon
                                    sx={{
                                      fontSize: ds.componentSizes.icon.medium,
                                      color: ds.colors.accent.main,
                                      mb: 0.5,
                                    }}
                                  />
                                  <Typography
                                    sx={{
                                      fontSize: "0.875rem",
                                      fontWeight: 600,
                                      color: ds.colors.text.primary,
                                      lineHeight: 1,
                                    }}
                                  >
                                    {totalSections}
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontSize: "0.625rem",
                                      color: ds.colors.text.secondary,
                                      lineHeight: 1,
                                      mt: 0.5,
                                    }}
                                  >
                                    Ürün
                                  </Typography>
                                </Box>
                              </Grid>

                              <Grid item xs={4}>
                                <Box
                                  sx={{
                                    p: 1,
                                    borderRadius: `${ds.borderRadius.sm}px`,
                                    background: alpha(
                                      ds.colors.success.main,
                                      0.05,
                                    ),
                                    border: `1px solid ${alpha(ds.colors.success.main, 0.1)}`,
                                    textAlign: "center",
                                  }}
                                >
                                  <AssignmentIcon
                                    sx={{
                                      fontSize: ds.componentSizes.icon.medium,
                                      color: ds.colors.success.main,
                                      mb: 0.5,
                                    }}
                                  />
                                  <Typography
                                    sx={{
                                      fontSize: "0.875rem",
                                      fontWeight: 600,
                                      color: ds.colors.text.primary,
                                      lineHeight: 1,
                                    }}
                                  >
                                    {totalItems}
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontSize: "0.625rem",
                                      color: ds.colors.text.secondary,
                                      lineHeight: 1,
                                      mt: 0.5,
                                    }}
                                  >
                                    İş Emri
                                  </Typography>
                                </Box>
                              </Grid>
                            </Grid>

                            {/* Meta Info */}
                            <Typography
                              sx={{
                                fontSize: "0.75rem",
                                color: ds.colors.text.secondary,
                                mt: "auto",
                                pt: ds.spacing["2"],
                                borderTop: `1px solid ${ds.colors.neutral[200]}`,
                              }}
                            >
                              Oluşturulma:{" "}
                              {new Date(list.createdAt).toLocaleDateString(
                                "tr-TR",
                              )}
                            </Typography>

                            {/* Action Button */}
                            <PrimaryButton
                              onClick={() => onSelectList(list)}
                              fullWidth
                              endIcon={<ArrowIcon />}
                            >
                              Listeyi Aç
                            </PrimaryButton>
                          </Stack>
                        </Box>
                      </CardV2>
                    </ScaleIn>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      </CardV2>

      {/* Undo Snackbar with Countdown */}
      <Snackbar
        open={!!pendingDelete}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{
          "& .MuiPaper-root": {
            minWidth: { xs: "90%", sm: 400 },
          },
        }}
      >
        <Alert
          severity="warning"
          icon={<DeleteIcon />}
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<UndoIcon />}
              onClick={handleUndo}
              sx={{
                fontWeight: ds.typography.fontWeight.semibold,
                "&:hover": {
                  backgroundColor: alpha("#fff", 0.2),
                },
              }}
            >
              Geri Al
            </Button>
          }
          sx={{
            width: "100%",
            alignItems: "center",
            backgroundColor: ds.colors.warning.main,
            color: "#fff",
            "& .MuiAlert-icon": {
              color: "#fff",
            },
            "& .MuiAlert-action": {
              paddingTop: 0,
            },
          }}
        >
          <Box>
            <Typography
              sx={{
                fontWeight: ds.typography.fontWeight.semibold,
                fontSize: "0.9375rem",
                mb: ds.spacing["1"],
              }}
            >
              "{pendingDelete?.title}" siliniyor...
            </Typography>
            <Typography
              sx={{
                fontSize: "0.8125rem",
                opacity: 0.9,
                mb: ds.spacing["1"],
              }}
            >
              {countdown} saniye içinde kalıcı olarak silinecek
            </Typography>
            <LinearProgress
              variant="determinate"
              value={((5 - countdown) / 5) * 100}
              sx={{
                height: 4,
                borderRadius: `${ds.borderRadius.sm}px`,
                backgroundColor: alpha("#fff", 0.3),
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "#fff",
                },
              }}
            />
          </Box>
        </Alert>
      </Snackbar>
    </FadeIn>
  );
};
