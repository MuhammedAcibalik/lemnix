/**
 * @fileoverview Combination Dialog - Revolutionary UX Design
 * @module CombinationDialog
 * @version 8.0.0 - Complete Redesign
 *
 * REVOLUTIONARY UX:
 * ✅ Clean, focused interface
 * ✅ Smart profile combination display
 * ✅ Clear action hierarchy
 * ✅ Modern visual design
 * ✅ Intuitive user flow
 */

import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Stack,
  Box,
  Typography,
  Button,
  IconButton,
  Card,
  CardContent,
  Chip,
  Divider,
  alpha,
  Alert,
} from "@mui/material";
import {
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Inventory as InventoryIcon,
  Straighten as StraightenIcon,
  TrendingUp as TrendingUpIcon,
  Palette as PaletteIcon,
  Flag as FlagIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";

import { useDesignSystem } from "@/shared/hooks";
import { ProfileCombination } from "../types";

interface CombinationDialogProps {
  open: boolean;
  onClose: () => void;
  combinations: ProfileCombination[];
  onSelectCombination: (combination: ProfileCombination) => void;
  isLoading?: boolean;
}

const CombinationCard: React.FC<{
  combination: ProfileCombination;
  index: number;
  onSelect: () => void;
}> = ({ combination, index, onSelect }) => {
  const ds = useDesignSystem();
  const [isHovered, setIsHovered] = useState(false);

  // Calculate total profiles for tooltip
  const profilesSummary = useMemo(() => {
    return combination.profiles
      .map(
        (p) =>
          `${p.profile} ${p.measurement?.includes("mm") ? p.measurement : `${p.measurement}mm`}`,
      )
      .join(", ");
  }, [combination.profiles]);

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: `${ds.borderRadius.md}px`,
        border: `1px solid ${ds.colors.neutral[200]}`,
        background: alpha(ds.colors.success.main, 0.02),
        transition: ds.transitions.fast,
        cursor: "pointer",
        position: "relative",
        overflow: "visible",
        "&:hover": {
          border: `1px solid ${ds.colors.success.main}`,
          background: alpha(ds.colors.success.main, 0.05),
          transform: "translateY(-1px)",
          boxShadow: ds.shadows.soft.md,
        },
      }}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent sx={{ p: ds.spacing["2"] }}>
        {/* Compact Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={ds.spacing["2"]}
            sx={{ flex: 1 }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: `${ds.borderRadius.sm}px`,
                background: ds.colors.success.main,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: ds.colors.text.inverse,
                fontWeight: 700,
                fontSize: "1rem",
                boxShadow: ds.shadows.soft.sm,
              }}
            >
              {index + 1}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: ds.colors.text.primary,
                  mb: 0.5,
                }}
              >
                {combination.profiles.length} Profil Kombinasyonu
              </Typography>
              <Stack
                direction="row"
                alignItems="center"
                spacing={ds.spacing["2"]}
              >
                <Chip
                  label={`${combination.usageCount}x Kullanıldı`}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    background: alpha(ds.colors.success.main, 0.1),
                    color: ds.colors.success.main,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: "0.6875rem",
                    color: ds.colors.text.secondary,
                  }}
                >
                  Sık kullanılan kombinasyon
                </Typography>
              </Stack>
            </Box>
          </Stack>

          <IconButton
            size="small"
            sx={{
              background: alpha(ds.colors.success.main, 0.1),
              color: ds.colors.success.main,
              transition: ds.transitions.fast,
              "&:hover": {
                background: alpha(ds.colors.success.main, 0.2),
                transform: "scale(1.1)",
              },
            }}
          >
            <CheckCircleIcon fontSize="small" />
          </IconButton>
        </Stack>

        {/* Progressive Disclosure: Show details on hover */}
        {isHovered && (
          <Box
            sx={{
              mt: ds.spacing["2"],
              pt: ds.spacing["2"],
              borderTop: `1px solid ${alpha(ds.colors.success.main, 0.2)}`,
            }}
          >
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: ds.colors.text.secondary,
                mb: ds.spacing["1"],
              }}
            >
              Profil Detayları:
            </Typography>
            <Typography
              sx={{
                fontSize: "0.75rem",
                color: ds.colors.text.primary,
                lineHeight: 1.6,
              }}
            >
              {profilesSummary}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export const CombinationDialog: React.FC<CombinationDialogProps> = ({
  open,
  onClose,
  combinations,
  onSelectCombination,
  isLoading = false,
}) => {
  const ds = useDesignSystem();

  const totalStats = useMemo(() => {
    const totalProfiles = combinations.reduce(
      (sum, combo) => sum + combo.profiles.length,
      0,
    );
    const totalUsage = combinations.reduce(
      (sum, combo) => sum + combo.usageCount,
      0,
    );
    const uniqueCombinations = combinations.length;

    return {
      totalProfiles,
      totalUsage,
      uniqueCombinations,
    };
  }, [combinations]);

  const handleSelectCombination = (combination: ProfileCombination) => {
    onSelectCombination(combination);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: `${ds.borderRadius.xl}px`,
          overflow: "hidden",
          maxHeight: "90vh",
        },
      }}
    >
      {/* Glass Header */}
      <Box
        sx={{
          p: ds.spacing["2"],
          background: ds.glass.background,
          backdropFilter: ds.glass.backdropFilter,
          borderBottom: ds.glass.border,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box>
            <Stack
              direction="row"
              alignItems="center"
              spacing={ds.spacing["2"]}
              sx={{ mb: ds.spacing["1"] }}
            >
              <SpeedIcon
                sx={{
                  color: ds.colors.success.main,
                  fontSize: ds.componentSizes.icon.large,
                }}
              />
              <Typography
                sx={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  background: ds.gradients.secondary,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: ds.typography.letterSpacing.tight,
                }}
              >
                Akıllı Kombinasyonlar
              </Typography>
            </Stack>
            <Typography
              sx={{
                fontSize: "0.875rem",
                color: ds.colors.text.secondary,
              }}
            >
              {combinations.length} kombinasyon mevcut • Hızlı seçim için
              tıklayın
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: ds.colors.text.secondary,
              transition: ds.transitions.fast,
              "&:hover": {
                color: ds.colors.text.primary,
                background: alpha(ds.colors.neutral[900], 0.04),
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      {/* Content */}
      <DialogContent sx={{ p: ds.spacing["3"] }}>
        <Stack spacing={ds.spacing["2"]}>
          {/* Loading State */}
          {isLoading ? (
            <Box sx={{ textAlign: "center", py: ds.spacing["6"] }}>
              <SpeedIcon
                sx={{
                  fontSize: 48,
                  color: ds.colors.primary.main,
                  mb: ds.spacing["2"],
                }}
              />
              <Typography
                sx={{ fontSize: "1rem", fontWeight: 500, mb: ds.spacing["1"] }}
              >
                Kombinasyonlar hesaplanıyor...
              </Typography>
              <Typography
                sx={{ fontSize: "0.875rem", color: ds.colors.text.secondary }}
              >
                Lütfen bekleyin
              </Typography>
            </Box>
          ) : combinations.length === 0 ? (
            <Box sx={{ textAlign: "center", py: ds.spacing["8"] }}>
              <SpeedIcon
                sx={{
                  fontSize: 56,
                  color: ds.colors.neutral[400],
                  mb: ds.spacing["3"],
                }}
              />
              <Typography
                sx={{
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  color: ds.colors.text.primary,
                  mb: ds.spacing["1"],
                }}
              >
                Henüz kayıtlı kombinasyon yok
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.875rem",
                  color: ds.colors.text.secondary,
                  mb: ds.spacing["4"],
                  maxWidth: 400,
                  mx: "auto",
                }}
              >
                Profil kombinasyonları, iş emirlerinizi hızlıca oluşturmanıza
                yardımcı olur. İlk kombinasyonunuz otomatik olarak kaydedilecek.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={ds.spacing["2"]}>
              {combinations.map((combination, index) => (
                <CombinationCard
                  key={`${combination.id}-${index}`}
                  combination={combination}
                  index={index}
                  onSelect={() => handleSelectCombination(combination)}
                />
              ))}
            </Stack>
          )}
        </Stack>
      </DialogContent>

      {/* Actions */}
      <DialogActions
        sx={{
          p: ds.spacing["3"],
          gap: ds.spacing["2"],
          borderTop: `1px solid ${ds.colors.neutral[200]}`,
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={isLoading}
          sx={{
            textTransform: "none",
            borderRadius: `${ds.borderRadius.md}px`,
          }}
        >
          Kapat
        </Button>

        {combinations.length > 0 && (
          <Button
            onClick={() => handleSelectCombination(combinations[0])}
            startIcon={<CheckCircleIcon />}
            variant="contained"
            disabled={isLoading}
            sx={{
              textTransform: "none",
              borderRadius: `${ds.borderRadius.md}px`,
              background: ds.gradients.secondary,
              minWidth: 180,
              "&:hover": {
                background: ds.gradients.secondary,
                opacity: 0.9,
                transform: "translateY(-1px)",
                boxShadow: ds.shadows.soft.md,
              },
            }}
          >
            En Çok Kullanılanı Seç
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
