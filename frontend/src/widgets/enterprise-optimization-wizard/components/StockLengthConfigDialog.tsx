/**
 * Stock Length Configuration Dialog
 * Allows users to configure stock lengths for optimization
 *
 * @module enterprise-optimization-wizard/components
 * @version 1.0.0
 */

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  TextField,
  Chip,
  Stack,
  IconButton,
  InputAdornment,
  Alert,
  Grid,
  alpha,
} from "@mui/material";
import {
  Close as CloseIcon,
  Add as AddIcon,
  Straighten as StraightenIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useDesignSystem, useAdaptiveUIContext } from "@/shared/hooks";

// Preset stock lengths (most commonly used)
const PRESET_STOCK_LENGTHS = [6100, 4100, 3500] as const;

interface StockLengthConfigDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly initialStockLengths: readonly number[];
  readonly onConfirm: (stockLengths: readonly number[]) => void;
}

export const StockLengthConfigDialog: React.FC<
  StockLengthConfigDialogProps
> = ({ open, onClose, initialStockLengths, onConfirm }) => {
  const ds = useDesignSystem();
  const { device, tokens } = useAdaptiveUIContext();

  // State
  const [stockLengths, setStockLengths] = useState<number[]>([
    ...initialStockLengths,
  ]);
  const [manualInput, setManualInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Reset state when dialog opens
  React.useEffect(() => {
    if (open) {
      setStockLengths([...initialStockLengths]);
      setManualInput("");
      setError(null);
    }
  }, [open, initialStockLengths]);

  // Validation
  const validateLength = (length: number): string | null => {
    if (length <= 0) return "Stok boyu pozitif bir sayı olmalıdır";
    if (length > 10000) return "Stok boyu 10000mm'den küçük olmalıdır";
    if (stockLengths.includes(length)) return "Bu stok boyu zaten ekli";
    return null;
  };

  // Handlers
  const handleAddPreset = (length: number) => {
    setError(null);

    const validationError = validateLength(length);
    if (validationError) {
      setError(validationError);
      return;
    }

    setStockLengths((prev) => [...prev, length].sort((a, b) => a - b));
  };

  const handleAddManual = () => {
    setError(null);

    const length = parseInt(manualInput);

    if (isNaN(length)) {
      setError("Geçerli bir sayı girin");
      return;
    }

    const validationError = validateLength(length);
    if (validationError) {
      setError(validationError);
      return;
    }

    setStockLengths((prev) => [...prev, length].sort((a, b) => a - b));
    setManualInput("");
  };

  const handleRemove = (length: number) => {
    if (stockLengths.length <= 1) {
      setError("En az 1 stok boyu tanımlı olmalıdır");
      return;
    }

    setError(null);
    setStockLengths((prev) => prev.filter((l) => l !== length));
  };

  const handleConfirm = () => {
    if (stockLengths.length === 0) {
      setError("En az 1 stok boyu tanımlı olmalıdır");
      return;
    }

    onConfirm(stockLengths);
    onClose();
  };

  // Check if preset is already added
  const isPresetAdded = useMemo(() => {
    return PRESET_STOCK_LENGTHS.map((length) => stockLengths.includes(length));
  }, [stockLengths]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={device.uiMode === "kiosk" ? "lg" : device.uiMode === "dense" ? "md" : "md"}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: `${tokens.borderRadius.xl}px`,
          overflow: "hidden",
        },
      }}
    >
      {/* Glassmorphism Header */}
      <Box
        sx={{
          background: ds.glass.background,
          backdropFilter: ds.glass.backdropFilter,
          borderBottom: ds.glass.border,
          px: {
            xs: tokens.spacing.md,
            md: tokens.spacing.lg,
          },
          py: tokens.spacing.sm,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", gap: tokens.spacing.md }}
        >
          <StraightenIcon
            sx={{
              color: ds.colors.primary.main,
              fontSize: {
                xs: tokens.components.icon.md,
                md: tokens.components.icon.lg,
              },
            }}
          />
          <Typography
            sx={{
              fontSize: {
                xs: `${tokens.typography.lg}px`,
                md: `${tokens.typography.xl}px`,
              },
              fontWeight: ds.typography.fontWeight.bold,
              background: ds.gradients.primary,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: ds.typography.letterSpacing.tight,
              lineHeight: 1,
            }}
          >
            Stok Boy Uzunlukları
          </Typography>
        </Box>

        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: ds.colors.text.secondary,
            transition: ds.transitions.fast,
            minWidth: device.isTouch ? tokens.components.minTouchTarget : undefined,
            minHeight: device.isTouch ? tokens.components.minTouchTarget : undefined,
            "&:hover": !device.isTouch ? {
              color: ds.colors.text.primary,
              backgroundColor: `rgba(0, 0, 0, 0.04)`,
            } : {},
          }}
        >
          <CloseIcon sx={{ fontSize: tokens.components.icon.sm }} />
        </IconButton>
      </Box>

      {/* Content */}
      <DialogContent sx={{
        px: {
          xs: tokens.spacing.md,
          md: tokens.spacing.lg,
        },
        py: tokens.spacing.sm,
      }}>
        <Stack spacing={tokens.spacing.md}>
          {/* Description */}
          <Typography
            sx={{
              fontSize: {
                xs: `${tokens.typography.xs}px`,
                md: `${tokens.typography.sm}px`,
              },
              color: ds.colors.text.secondary,
            }}
          >
            Optimizasyonda kullanılacak alüminyum profil stok boy uzunluklarını
            seçin veya manuel olarak ekleyin.
          </Typography>

          {/* Error Alert */}
          {error && (
            <Alert
              severity="error"
              sx={{ borderRadius: `${tokens.borderRadius.md}px` }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {/* Preset Buttons */}
          <Box>
            <Typography
              sx={{
                fontSize: {
                  xs: `${tokens.typography.xs}px`,
                  md: `${tokens.typography.sm}px`,
                },
                fontWeight: ds.typography.fontWeight.semibold,
                color: ds.colors.text.primary,
                mb: tokens.spacing.sm,
              }}
            >
              Sık Kullanılan Boylar
            </Typography>
            <Grid container spacing={tokens.spacing.sm}>
              {PRESET_STOCK_LENGTHS.map((length, index) => (
                <Grid item xs={4} key={length}>
                  <Button
                    variant={isPresetAdded[index] ? "outlined" : "contained"}
                    onClick={() => handleAddPreset(length)}
                    disabled={isPresetAdded[index]}
                    fullWidth
                    sx={{
                      py: tokens.spacing.sm,
                      borderRadius: `${tokens.borderRadius.md}px`,
                      fontWeight: ds.typography.fontWeight.semibold,
                      fontSize: {
                        xs: `${tokens.typography.xs}px`,
                        md: `${tokens.typography.sm}px`,
                      },
                      minHeight: device.isTouch ? tokens.components.minTouchTarget : undefined,
                      ...(isPresetAdded[index]
                        ? {
                            borderColor: ds.colors.success.main,
                            color: ds.colors.success.main,
                            "&:hover": !device.isTouch ? {
                              borderColor: ds.colors.success.main,
                              backgroundColor: alpha(ds.colors.success.main, 0.04),
                            } : {},
                          }
                        : {
                            background: ds.gradients.primary,
                            "&:hover": !device.isTouch ? {
                              background: ds.gradients.primary,
                              opacity: 0.9,
                            } : {},
                          }),
                    }}
                  >
                    {isPresetAdded[index] && (
                      <CheckCircleIcon sx={{
                        fontSize: tokens.components.icon.xs,
                        mr: tokens.spacing.xs,
                      }} />
                    )}
                    {length} mm
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Manual Input */}
          <Box>
            <Typography
              sx={{
                fontSize: {
                  xs: `${tokens.typography.xs}px`,
                  md: `${tokens.typography.sm}px`,
                },
                fontWeight: ds.typography.fontWeight.semibold,
                color: ds.colors.text.primary,
                mb: tokens.spacing.sm,
              }}
            >
              Manuel Girdi
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={tokens.spacing.sm}>
              <TextField
                label="Stok Boyu"
                placeholder="Örn: 5000"
                value={manualInput}
                onChange={(e) => {
                  const value = e.target.value;
                  // Only allow numbers
                  if (value === "" || /^\d+$/.test(value)) {
                    setManualInput(value);
                    setError(null);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddManual();
                  }
                }}
                type="number"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <StraightenIcon
                        sx={{
                          fontSize: tokens.components.icon.sm,
                          color: ds.colors.primary.main,
                        }}
                      />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography
                        sx={{
                          fontSize: `${tokens.typography.xs}px`,
                          color: ds.colors.text.secondary,
                          fontWeight: ds.typography.fontWeight.semibold,
                        }}
                      >
                        mm
                      </Typography>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: `${tokens.borderRadius.md}px`,
                    fontSize: {
                      xs: `${tokens.typography.sm}px`,
                      md: `${tokens.typography.base}px`,
                    },
                    height: device.isTouch ? tokens.components.minTouchTarget : tokens.components.input.md,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderWidth: "2px",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: {
                      xs: `${tokens.typography.sm}px`,
                      md: `${tokens.typography.base}px`,
                    },
                    fontWeight: ds.typography.fontWeight.semibold,
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleAddManual}
                disabled={!manualInput}
                sx={{
                  minWidth: {
                    xs: "100%",
                    sm: 100,
                  },
                  borderRadius: `${tokens.borderRadius.md}px`,
                  minHeight: device.isTouch ? tokens.components.minTouchTarget : undefined,
                  fontSize: {
                    xs: `${tokens.typography.sm}px`,
                    md: `${tokens.typography.base}px`,
                  },
                }}
                startIcon={<AddIcon sx={{ fontSize: tokens.components.icon.sm }} />}
              >
                Ekle
              </Button>
            </Stack>
          </Box>

          {/* Stock Lengths List */}
          <Box>
            <Typography
              sx={{
                fontSize: {
                  xs: `${tokens.typography.xs}px`,
                  md: `${tokens.typography.sm}px`,
                },
                fontWeight: ds.typography.fontWeight.semibold,
                color: ds.colors.text.primary,
                mb: tokens.spacing.sm,
              }}
            >
              Seçili Stok Boyları ({stockLengths.length})
            </Typography>

            {stockLengths.length === 0 ? (
              <Alert
                severity="warning"
                sx={{
                  borderRadius: `${tokens.borderRadius.md}px`,
                  fontSize: {
                    xs: `${tokens.typography.xs}px`,
                    md: `${tokens.typography.sm}px`,
                  },
                }}
              >
                Hiç stok boyu seçilmedi. Lütfen en az 1 stok boyu ekleyin.
              </Alert>
            ) : (
              <Stack
                direction="row"
                spacing={tokens.spacing.xs}
                flexWrap="wrap"
                useFlexGap
                sx={{
                  p: tokens.spacing.md,
                  backgroundColor: ds.colors.neutral[50],
                  borderRadius: `${tokens.borderRadius.md}px`,
                  border: `1px solid ${ds.colors.neutral[200]}`,
                  minHeight: {
                    xs: tokens.components.minTouchTarget * 1.5,
                    md: tokens.components.button.lg * 1.5,
                  },
                }}
              >
                {stockLengths.map((length) => (
                  <Chip
                    key={length}
                    label={`${length} mm`}
                    onDelete={() => handleRemove(length)}
                    deleteIcon={<CloseIcon sx={{
                      fontSize: tokens.components.icon.xs,
                      minWidth: device.isTouch ? tokens.components.minTouchTarget : undefined,
                      minHeight: device.isTouch ? tokens.components.minTouchTarget : undefined,
                    }} />}
                    sx={{
                      height: {
                        xs: tokens.components.button.sm,
                        md: tokens.components.button.md,
                      },
                      fontSize: {
                        xs: `${tokens.typography.xs}px`,
                        md: `${tokens.typography.sm}px`,
                      },
                      fontWeight: ds.typography.fontWeight.semibold,
                      backgroundColor: ds.colors.primary.main,
                      color: "white",
                      "& .MuiChip-deleteIcon": {
                        color: "rgba(255, 255, 255, 0.7)",
                        "&:hover": !device.isTouch ? {
                          color: "white",
                        } : {},
                      },
                      "&:hover": !device.isTouch ? {
                        backgroundColor: ds.colors.primary[600],
                      } : {},
                    }}
                  />
                ))}
              </Stack>
            )}
          </Box>

          {/* Info Box */}
          <Alert
            severity="info"
            sx={{
              borderRadius: `${tokens.borderRadius.md}px`,
              fontSize: {
                xs: `${tokens.typography.xs}px`,
                md: `${tokens.typography.sm}px`,
              },
            }}
          >
            💡 <strong>İpucu:</strong> Optimizasyon algoritması, eklediğiniz
            stok boyları arasından en verimli olanı otomatik seçecektir.
          </Alert>
        </Stack>
      </DialogContent>

      {/* Footer */}
      <DialogActions
        sx={{
          px: {
            xs: tokens.spacing.md,
            md: tokens.spacing.lg,
          },
          py: tokens.spacing.sm,
          borderTop: `1px solid ${ds.colors.neutral[200]}`,
          gap: tokens.spacing.md,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            textTransform: "none",
            minHeight: device.isTouch ? tokens.components.minTouchTarget : undefined,
            fontSize: {
              xs: `${tokens.typography.sm}px`,
              md: `${tokens.typography.base}px`,
            },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          İptal
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={stockLengths.length === 0}
          startIcon={<CheckCircleIcon sx={{ fontSize: tokens.components.icon.sm }} />}
          sx={{
            background: ds.gradients.primary,
            textTransform: "none",
            minHeight: device.isTouch ? tokens.components.minTouchTarget : undefined,
            fontSize: {
              xs: `${tokens.typography.sm}px`,
              md: `${tokens.typography.base}px`,
            },
            width: { xs: "100%", sm: "auto" },
            "&:hover": !device.isTouch ? {
              background: ds.gradients.primary,
              opacity: 0.9,
            } : {},
          }}
        >
          Devam Et
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StockLengthConfigDialog;
