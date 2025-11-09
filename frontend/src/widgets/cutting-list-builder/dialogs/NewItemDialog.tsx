/**
 * @fileoverview New Item Dialog - Single Screen Form
 * @module NewItemDialog
 * @version 9.0.0 - Single Screen Redesign
 *
 * SINGLE SCREEN UX:
 * ✅ All fields visible at once
 * ✅ Faster data entry
 * ✅ Real-time validation
 * ✅ Collapsible profile cards
 * ✅ Smart suggestions
 */

import React, { useState, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Stack,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  alpha,
  Divider,
} from "@mui/material";
import {
  Assignment as AssignmentIcon,
  Inventory as InventoryIcon,
  Straighten as StraightenIcon,
  Flag as FlagIcon,
  Palette as PaletteIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  Lightbulb as LightbulbIcon,
  Info as InfoIcon,
  CalendarToday as CalendarIcon,
  Numbers as NumbersIcon,
  AspectRatio as AspectRatioIcon,
} from "@mui/icons-material";

import { useDesignSystem } from "@/shared/hooks";
import { useApplySmartSuggestion } from "@/entities/suggestions";
import { WorkOrderForm, ProfileFormItem, ProfileCombination } from "../types";

interface LoadingStateType {
  isLoading: boolean;
  error: string | null;
}

interface NewItemDialogProps {
  open: boolean;
  onClose: () => void;
  newItemForm: WorkOrderForm;
  setNewItemForm: (form: WorkOrderForm) => void;
  isFormValid: boolean;
  loadingState: LoadingStateType;
  availableSizes: string[];
  isLoadingSuggestions: boolean;
  profileCombinations: ProfileCombination[];
  onAddItem: () => void;
  onAddProfile: () => void;
  onRemoveProfile: (profileId: string) => void;
  onProfileChange: (
    profileId: string,
    field: keyof ProfileFormItem,
    value: string,
  ) => void;
  onFormChange: (
    field: keyof Omit<WorkOrderForm, "profiles">,
    value: string,
  ) => void;
  onGetAvailableSizes: () => void;
  onShowCombinationDialog: () => void;
  onResetForm: () => void;
  onApplySmartSuggestion: () => void;
}

const COLOR_OPTIONS = [
  { value: "ELS", label: "ELS", color: "#f5f5f5" },
  { value: "PRES", label: "PRES", color: "#ffffff" },
  { value: "R9005", label: "R9005", color: "#212121" },
  { value: "R3020", label: "R3020", color: "#ff9800" },
  { value: "R7016", label: "R7016", color: "#757575" },
];

const PRIORITY_OPTIONS = [
  { value: "1", label: "1.", color: "#f44336" },
  { value: "2", label: "2.", color: "#ff9800" },
];

const ProfileCard: React.FC<{
  profile: ProfileFormItem;
  index: number;
  onRemove: () => void;
  onChange: (field: keyof ProfileFormItem, value: string) => void;
  isOnlyProfile: boolean;
}> = ({ profile, index, onRemove, onChange, isOnlyProfile }) => {
  const ds = useDesignSystem();
  const [isExpanded, setIsExpanded] = useState(true);

  // Validation state
  const quantity =
    typeof profile.quantity === "string"
      ? parseInt(profile.quantity)
      : profile.quantity;
  const isComplete = profile.profile && profile.measurement && quantity > 0;
  const measurementDisplay = profile.measurement?.includes("mm")
    ? profile.measurement
    : `${profile.measurement}mm`;
  const summary = isComplete
    ? `${profile.profile} ${measurementDisplay} × ${quantity}`
    : "Profil bilgilerini doldurun";

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: `${ds.borderRadius.md}px`,
        border: isComplete
          ? `1px solid ${alpha(ds.colors.success.main, 0.3)}`
          : `1px solid ${alpha(ds.colors.primary.main, 0.2)}`,
        background: isComplete
          ? alpha(ds.colors.success.main, 0.02)
          : alpha(ds.colors.primary.main, 0.02),
        transition: ds.transitions.base,
      }}
    >
      {/* Collapsible Header */}
      <Box
        onClick={() => setIsExpanded(!isExpanded)}
        sx={{
          p: ds.spacing["2"],
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: isExpanded
            ? `1px solid ${alpha(ds.colors.neutral[300], 0.5)}`
            : "none",
          transition: ds.transitions.fast,
          "&:hover": {
            background: alpha(ds.colors.primary.main, 0.04),
          },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={ds.spacing["2"]}
          sx={{ flex: 1 }}
        >
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: `${ds.borderRadius.sm}px`,
              background: isComplete
                ? ds.colors.success.main
                : ds.colors.primary.main,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: ds.colors.text.inverse,
              fontWeight: 700,
              fontSize: "0.875rem",
              transition: ds.transitions.fast,
            }}
          >
            {isComplete ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : index + 1}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: "0.9375rem",
                color: ds.colors.text.primary,
              }}
            >
              Profil {index + 1}
            </Typography>
            <Typography
              sx={{ fontSize: "0.75rem", color: ds.colors.text.secondary }}
            >
              {summary}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={ds.spacing["1"]} alignItems="center">
          {isComplete && (
            <Chip
              label="Tamamlandı"
              size="small"
              sx={{
                height: 20,
                fontSize: "0.625rem",
                fontWeight: 600,
                background: alpha(ds.colors.success.main, 0.1),
                color: ds.colors.success.main,
              }}
            />
          )}
          {!isOnlyProfile && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              sx={{
                color: ds.colors.error.main,
                "&:hover": {
                  background: alpha(ds.colors.error.main, 0.1),
                },
              }}
            >
              <DeleteIcon sx={{ fontSize: ds.componentSizes.icon.small }} />
            </IconButton>
          )}
          <IconButton
            size="small"
            sx={{
              color: ds.colors.text.secondary,
              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: ds.transitions.base,
            }}
          >
            <ExpandMoreIcon sx={{ fontSize: ds.componentSizes.icon.small }} />
          </IconButton>
        </Stack>
      </Box>

      {/* Expandable Content */}
      {isExpanded && (
        <CardContent sx={{ p: ds.spacing["2"], pt: ds.spacing["1"] }}>
          <Stack spacing={ds.spacing["2"]}>
            <TextField
              label="Profil Tipi"
              value={profile.profile}
              onChange={(e) => onChange("profile", e.target.value)}
              placeholder="örn: KAPALI ALT"
              required
              fullWidth
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <InventoryIcon
                      sx={{
                        color: ds.colors.primary.main,
                        fontSize: ds.componentSizes.icon.small,
                      }}
                    />
                  </InputAdornment>
                ),
              }}
            />

            <Stack direction="row" spacing={ds.spacing["2"]}>
              <TextField
                label="Ölçü"
                value={profile.measurement}
                onChange={(e) => onChange("measurement", e.target.value)}
                placeholder="992"
                type="text"
                required
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <StraightenIcon
                        sx={{
                          color: ds.colors.accent.main,
                          fontSize: ds.componentSizes.icon.small,
                        }}
                      />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">mm</InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Adet"
                value={profile.quantity}
                onChange={(e) => onChange("quantity", e.target.value)}
                placeholder="5"
                type="number"
                required
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FlagIcon
                        sx={{
                          color: ds.colors.success.main,
                          fontSize: ds.componentSizes.icon.small,
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </Stack>
        </CardContent>
      )}
    </Card>
  );
};

export const NewItemDialog: React.FC<NewItemDialogProps> = ({
  open,
  onClose,
  newItemForm,
  isFormValid,
  loadingState,
  profileCombinations,
  onAddItem,
  onAddProfile,
  onRemoveProfile,
  onProfileChange,
  onFormChange,
  onShowCombinationDialog,
  onApplySmartSuggestion,
}) => {
  const ds = useDesignSystem();
  const { applyAsync } = useApplySmartSuggestion();

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
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
          <Typography
            sx={{
              fontSize: "1.25rem",
              fontWeight: 700,
              background: ds.gradients.primary,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: ds.typography.letterSpacing.tight,
            }}
          >
            Yeni İş Emri Ekle
          </Typography>

          <IconButton
            onClick={handleClose}
            size="small"
            sx={{
              color: ds.colors.text.secondary,
              transition: ds.transitions.fast,
              "&:hover": {
                color: ds.colors.text.primary,
                backgroundColor: alpha(ds.colors.neutral[900], 0.04),
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      {/* Content */}
      <DialogContent sx={{ p: ds.spacing["3"] }}>
        <Stack spacing={ds.spacing["3"]}>
          {/* Temel Bilgiler Section */}
          <Box>
            <Typography
              sx={{
                fontSize: "0.9375rem",
                fontWeight: 600,
                color: ds.colors.text.primary,
                mb: ds.spacing["2"],
              }}
            >
              Temel Bilgiler
            </Typography>

            <Stack spacing={ds.spacing["2"]}>
              {/* Row 1: İş Emri ID + Tarih */}
              <Stack direction="row" spacing={ds.spacing["2"]}>
                <TextField
                  label="İş Emri ID"
                  value={newItemForm.workOrderId}
                  onChange={(e) => onFormChange("workOrderId", e.target.value)}
                  placeholder="WO-2024-001"
                  required
                  fullWidth
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AssignmentIcon
                          sx={{
                            color: ds.colors.primary.main,
                            fontSize: ds.componentSizes.icon.small,
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Tarih"
                  type="date"
                  value={
                    newItemForm.date || new Date().toISOString().split("T")[0]
                  }
                  onChange={(e) => onFormChange("date", e.target.value)}
                  required
                  fullWidth
                  size="small"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarIcon
                          sx={{
                            color: ds.colors.accent.main,
                            fontSize: ds.componentSizes.icon.small,
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>

              {/* Row 2: Renk + Öncelik */}
              <Stack direction="row" spacing={ds.spacing["2"]}>
                <TextField
                  label="Renk"
                  value={newItemForm.color || ""}
                  onChange={(e) => onFormChange("color", e.target.value)}
                  placeholder="ELS, PRES, R9005, R3020, R7016"
                  fullWidth
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PaletteIcon
                          sx={{
                            color: ds.colors.success.main,
                            fontSize: ds.componentSizes.icon.small,
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />

                <FormControl fullWidth size="small">
                  <InputLabel>Öncelik</InputLabel>
                  <Select
                    value={newItemForm.priority || "1"}
                    onChange={(e) =>
                      onFormChange("priority", e.target.value as string)
                    }
                    label="Öncelik"
                  >
                    {PRIORITY_OPTIONS.map((priority) => (
                      <MenuItem key={priority.value} value={priority.value}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={ds.spacing["1"]}
                        >
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              backgroundColor: priority.color,
                            }}
                          />
                          {priority.label}
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

              {/* Row 3: Sipariş Adedi + Ebat */}
              <Stack direction="row" spacing={ds.spacing["2"]}>
                <TextField
                  label="Sipariş Adedi"
                  type="number"
                  value={newItemForm.orderQuantity || ""}
                  onChange={(e) =>
                    onFormChange("orderQuantity", e.target.value)
                  }
                  placeholder="1"
                  required
                  fullWidth
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <NumbersIcon
                          sx={{
                            color: ds.colors.primary.main,
                            fontSize: ds.componentSizes.icon.small,
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Ebat"
                  value={newItemForm.size || ""}
                  onChange={(e) => onFormChange("size", e.target.value)}
                  placeholder="60x120"
                  fullWidth
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AspectRatioIcon
                          sx={{
                            color: ds.colors.accent.main,
                            fontSize: ds.componentSizes.icon.small,
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>

              {/* Row 4: Not (full width) */}
              <TextField
                label="Not"
                value={newItemForm.note || ""}
                onChange={(e) => onFormChange("note", e.target.value)}
                placeholder="Ek bilgi veya notlar..."
                fullWidth
                size="small"
                multiline
                rows={2}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <InfoIcon
                        sx={{
                          color: ds.colors.warning.main,
                          fontSize: ds.componentSizes.icon.small,
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </Box>

          <Divider />

          {/* Profil Detayları Section */}
          <Box>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: ds.spacing["2"] }}
            >
              <Typography
                sx={{
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  color: ds.colors.text.primary,
                }}
              >
                Profil Detayları ({newItemForm.profiles.length})
              </Typography>

              <Stack direction="row" spacing={ds.spacing["2"]}>
                {/* ✨ AKILLI ÖNERİ BUTONU */}
                <Button
                  variant="contained"
                  startIcon={<LightbulbIcon />}
                  onClick={onApplySmartSuggestion}
                  disabled={
                    !newItemForm.orderQuantity ||
                    !newItemForm.size ||
                    !newItemForm.productName
                  }
                  size="small"
                  sx={{
                    textTransform: "none",
                    borderRadius: `${ds.borderRadius.sm}px`,
                    background: ds.gradients.accent,
                    minWidth: 120,
                    height: 28,
                    "&:hover": {
                      background: ds.gradients.accent,
                      transform: "translateY(-1px)",
                      boxShadow: ds.shadows.soft.md,
                    },
                    "&:disabled": {
                      background: ds.colors.neutral[200],
                      color: ds.colors.text.disabled,
                    },
                  }}
                >
                  ✨ Akıllı Öneri
                </Button>

                <Button
                  startIcon={<AddIcon />}
                  onClick={onAddProfile}
                  variant="outlined"
                  size="small"
                  sx={{
                    textTransform: "none",
                    borderRadius: `${ds.borderRadius.sm}px`,
                    py: 0.5,
                    px: 1.5,
                    minHeight: 28,
                  }}
                >
                  Profil Ekle
                </Button>
              </Stack>
            </Stack>

            {/* Smart Suggestion Banner */}
            {profileCombinations.length > 0 && newItemForm.size && (
              <Card
                sx={{
                  p: ds.spacing["2"],
                  background: alpha(ds.colors.accent.main, 0.05),
                  border: `1px solid ${alpha(ds.colors.accent.main, 0.2)}`,
                  borderRadius: `${ds.borderRadius.md}px`,
                  mb: ds.spacing["2"],
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={ds.spacing["2"]}
                >
                  <LightbulbIcon
                    sx={{
                      color: ds.colors.accent.main,
                      fontSize: ds.componentSizes.icon.small,
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        color: ds.colors.text.primary,
                      }}
                    >
                      {profileCombinations.length} akıllı kombinasyon önerisi
                      var
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="text"
                    onClick={onShowCombinationDialog}
                    sx={{
                      textTransform: "none",
                      color: ds.colors.accent.main,
                      fontSize: "0.75rem",
                      py: 0.5,
                      px: 1,
                      minHeight: 24,
                    }}
                  >
                    Görüntüle
                  </Button>
                </Stack>
              </Card>
            )}

            {newItemForm.profiles.length === 0 ? (
              <Card
                variant="outlined"
                sx={{
                  p: ds.spacing["4"],
                  textAlign: "center",
                  border: `1px dashed ${ds.colors.neutral[300]}`,
                  background: alpha(ds.colors.neutral[100], 0.5),
                }}
              >
                <InventoryIcon
                  sx={{
                    fontSize: 40,
                    color: ds.colors.neutral[400],
                    mb: ds.spacing["1"],
                  }}
                />
                <Typography
                  sx={{
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: ds.colors.text.secondary,
                  }}
                >
                  Henüz profil eklenmemiş
                </Typography>
              </Card>
            ) : (
              <Stack spacing={ds.spacing["2"]}>
                {newItemForm.profiles.map((profile, index) => (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    index={index}
                    onRemove={() => onRemoveProfile(profile.id)}
                    onChange={(field, value) =>
                      onProfileChange(profile.id, field, value)
                    }
                    isOnlyProfile={newItemForm.profiles.length === 1}
                  />
                ))}
              </Stack>
            )}
          </Box>
        </Stack>
      </DialogContent>

      {/* Actions */}
      <DialogActions
        sx={{
          p: ds.spacing["2"],
          gap: ds.spacing["2"],
          borderTop: `1px solid ${ds.colors.neutral[200]}`,
        }}
      >
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{
            textTransform: "none",
            borderRadius: `${ds.borderRadius.md}px`,
          }}
        >
          İptal
        </Button>

        <Button
          onClick={onAddItem}
          startIcon={loadingState.isLoading ? undefined : <CheckCircleIcon />}
          variant="contained"
          disabled={!isFormValid || loadingState.isLoading}
          sx={{
            textTransform: "none",
            borderRadius: `${ds.borderRadius.md}px`,
            background: ds.gradients.primary,
            "&:hover": {
              background: ds.gradients.primary,
              transform: "translateY(-1px)",
              boxShadow: ds.shadows.soft.md,
            },
          }}
        >
          {loadingState.isLoading ? "Kaydediliyor..." : "İş Emrini Ekle"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
