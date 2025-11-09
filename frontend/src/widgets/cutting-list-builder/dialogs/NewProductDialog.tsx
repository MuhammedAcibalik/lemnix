/**
 * @fileoverview New Product Dialog - Revolutionary UX Design
 * @module NewProductDialog
 * @version 8.0.0 - Complete Redesign
 *
 * REVOLUTIONARY UX:
 * ✅ Minimal, focused interface
 * ✅ Clear form validation
 * ✅ Modern visual design
 * ✅ Smart user guidance
 * ✅ Consistent with other dialogs
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
  Card,
  CardContent,
  CircularProgress,
  InputAdornment,
  alpha,
} from "@mui/material";
import {
  Category as CategoryIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
  Inventory as InventoryIcon,
} from "@mui/icons-material";

import { useDesignSystem } from "@/shared/hooks";

interface NewProductDialogProps {
  open: boolean;
  onClose: () => void;
  onAddProduct: (productName: string) => void;
  isLoading?: boolean;
}

export const NewProductDialog: React.FC<NewProductDialogProps> = ({
  open,
  onClose,
  onAddProduct,
  isLoading = false,
}) => {
  const ds = useDesignSystem();
  const [productName, setProductName] = useState("");
  const [errors, setErrors] = useState<{ productName?: string }>({});

  // Validation logic
  const validateProductName = useCallback(
    (value: string): string | undefined => {
      const trimmed = value.trim();
      if (!trimmed) return "Ürün adı gereklidir";
      if (trimmed.length < 2) return "Ürün adı en az 2 karakter olmalı";
      if (trimmed.length > 50) return "Ürün adı en fazla 50 karakter olabilir";
      return undefined;
    },
    [],
  );

  // Real-time validation with auto-uppercase
  const handleProductNameChange = useCallback(
    (value: string) => {
      // Auto-convert to uppercase
      const upperValue = value.toUpperCase();
      setProductName(upperValue);
      const error = validateProductName(upperValue);
      setErrors((prev) => ({ ...prev, productName: error }));
    },
    [validateProductName],
  );

  const isFormValid = useMemo(() => {
    return !errors.productName && productName.trim().length > 0;
  }, [errors, productName]);

  const handleClose = useCallback(() => {
    setProductName("");
    setErrors({});
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(() => {
    // Final validation
    const nameError = validateProductName(productName);

    if (nameError) {
      setErrors({ productName: nameError });
      return;
    }

    if (productName.trim()) {
      onAddProduct(productName.trim());
      handleClose();
    }
  }, [productName, validateProductName, onAddProduct, handleClose]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && e.ctrlKey && isFormValid && !isLoading) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [isFormValid, isLoading, handleSubmit],
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
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
            <Typography
              sx={{
                fontSize: "1.25rem",
                fontWeight: 700,
                background: ds.gradients.accent,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: ds.typography.letterSpacing.tight,
                mb: ds.spacing["1"],
              }}
            >
              Yeni Ürün Ekle
            </Typography>
            <Typography
              sx={{
                fontSize: "0.875rem",
                color: ds.colors.text.secondary,
              }}
            >
              Yeni bir ürün kategorisi oluşturun
            </Typography>
          </Box>
          <IconButton
            onClick={handleClose}
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
        <Stack spacing={ds.spacing["4"]}>
          {/* Info Card */}
          <Card
            variant="outlined"
            sx={{
              p: ds.spacing["2"],
              background: alpha(ds.colors.warning.main, 0.05),
              border: `1px solid ${alpha(ds.colors.warning.main, 0.2)}`,
              borderRadius: `${ds.borderRadius.md}px`,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={ds.spacing["2"]}
            >
              <InventoryIcon
                sx={{
                  color: ds.colors.warning.main,
                  fontSize: ds.componentSizes.icon.medium,
                }}
              />
              <Box>
                <Typography sx={{ fontSize: "0.875rem", fontWeight: 500 }}>
                  Yeni Ürün Kategorisi
                </Typography>
                <Typography
                  sx={{ fontSize: "0.75rem", color: ds.colors.text.secondary }}
                >
                  Bu ürün tüm kesim listelerinde kullanılabilir olacak
                </Typography>
              </Box>
            </Stack>
          </Card>

          {/* Form */}
          <Stack spacing={ds.spacing["3"]}>
            <TextField
              label="Ürün Adı"
              value={productName}
              onChange={(e) => handleProductNameChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="örn: Pencere Çerçevesi"
              required
              fullWidth
              autoFocus
              disabled={isLoading}
              error={!!errors.productName}
              helperText={
                errors.productName || `${productName.length}/50 karakter`
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CategoryIcon
                      sx={{
                        color: errors.productName
                          ? ds.colors.error.main
                          : ds.colors.primary.main,
                        fontSize: ds.componentSizes.icon.medium,
                      }}
                    />
                  </InputAdornment>
                ),
                endAdornment:
                  productName.trim() && !errors.productName ? (
                    <InputAdornment position="end">
                      <CheckCircleIcon
                        sx={{
                          color: ds.colors.success.main,
                          fontSize: ds.componentSizes.icon.small,
                        }}
                      />
                    </InputAdornment>
                  ) : null,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: `${ds.borderRadius.md}px`,
                },
              }}
            />
          </Stack>

          {/* Live Preview */}
          {isFormValid && (
            <Card
              variant="outlined"
              sx={{
                p: ds.spacing["2"],
                background: alpha(ds.colors.success.main, 0.05),
                border: `1px solid ${alpha(ds.colors.success.main, 0.2)}`,
                borderRadius: `${ds.borderRadius.md}px`,
                transition: ds.transitions.fast,
              }}
            >
              <Stack
                direction="row"
                alignItems="flex-start"
                spacing={ds.spacing["2"]}
              >
                <CheckCircleIcon
                  sx={{
                    color: ds.colors.success.main,
                    fontSize: ds.componentSizes.icon.medium,
                    mt: 0.5,
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: ds.colors.success.main,
                      mb: ds.spacing["1"],
                    }}
                  >
                    Önizleme
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: ds.colors.text.primary,
                    }}
                  >
                    {productName.trim()}
                  </Typography>
                </Box>
              </Stack>
            </Card>
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
          onClick={handleClose}
          variant="outlined"
          disabled={isLoading}
          sx={{
            textTransform: "none",
            borderRadius: `${ds.borderRadius.md}px`,
          }}
        >
          İptal
        </Button>

        <Button
          onClick={handleSubmit}
          startIcon={
            isLoading ? (
              <CircularProgress size={16} sx={{ color: "inherit" }} />
            ) : (
              <AddIcon />
            )
          }
          variant="contained"
          disabled={!isFormValid || isLoading}
          sx={{
            textTransform: "none",
            borderRadius: `${ds.borderRadius.md}px`,
            background: ds.gradients.accent,
            minWidth: 140,
            "&:hover": {
              background: ds.gradients.accent,
              opacity: 0.9,
              transform: "translateY(-1px)",
              boxShadow: ds.shadows.soft.md,
            },
            "&:disabled": {
              background: ds.colors.neutral[200],
              color: ds.colors.neutral[500],
            },
          }}
        >
          {isLoading ? "Ekleniyor..." : "Ürünü Ekle"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
