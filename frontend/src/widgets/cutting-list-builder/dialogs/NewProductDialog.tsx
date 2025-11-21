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

import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import {
  Category as CategoryIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
  Inventory as InventoryIcon,
} from "@mui/icons-material";

import { useDesignSystem } from "@/shared/hooks";
import { useDebounce } from "@/shared/lib/hooks";
import {
  useProductCategories,
  useCategoryByProduct,
  useMapProductToCategory,
} from "@/shared/api/productCategoryQueries";

interface NewProductDialogProps {
  open: boolean;
  onClose: () => void;
  onAddProduct: (productName: string, productCategory: string) => void;
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
  const [productCategory, setProductCategory] = useState<string>("");
  const [errors, setErrors] = useState<{
    productName?: string;
    productCategory?: string;
  }>({});

  // ✅ ROOT CAUSE FIX: Debounce product name to avoid excessive API calls
  // Only query after user stops typing for 500ms
  const debouncedProductName = useDebounce(productName.trim(), 500);

  // ✅ ROOT CAUSE FIX: Minimum character requirement for category lookup
  // Only query if product name has at least 3 characters (reduces false positives)
  const shouldQueryCategory = useMemo(
    () => debouncedProductName.length >= 3,
    [debouncedProductName],
  );

  // Fetch categories and check for existing category
  const { data: categories = [], isLoading: categoriesLoading } =
    useProductCategories();
  const { data: existingCategory, isLoading: checkingCategory } =
    useCategoryByProduct(
      shouldQueryCategory ? debouncedProductName : undefined,
    );
  const mapProductMutation = useMapProductToCategory();

  // ✅ FIX: Track if user manually selected a category
  const [userManuallySelected, setUserManuallySelected] = useState(false);

  // ✅ FIX: Track last auto-selected category to prevent re-selection
  const lastAutoSelectedRef = useRef<string | null>(null);

  // ✅ ROOT CAUSE FIX: Auto-select category if found (using debounced product name)
  // Only auto-select if user hasn't manually chosen a category
  // ✅ FIX: Prevent redundant updates to avoid re-renders
  useEffect(() => {
    if (
      existingCategory &&
      !userManuallySelected &&
      lastAutoSelectedRef.current !== existingCategory.name
    ) {
      lastAutoSelectedRef.current = existingCategory.name;
      setProductCategory(existingCategory.name);
      setErrors((prev) => ({ ...prev, productCategory: undefined }));
    }
  }, [existingCategory, userManuallySelected]);

  // ✅ FIX: Inline validation to avoid unnecessary useCallback dependencies
  const handleProductNameChange = useCallback(
    (value: string) => {
      // Auto-convert to uppercase
      const upperValue = value.toUpperCase();
      setProductName(upperValue);

      // ✅ FIX: Inline validation - no external function dependency
      const trimmed = upperValue.trim();
      let error: string | undefined;
      if (!trimmed) {
        error = "Ürün adı gereklidir";
      } else if (trimmed.length < 2) {
        error = "Ürün adı en az 2 karakter olmalı";
      } else if (trimmed.length > 50) {
        error = "Ürün adı en fazla 50 karakter olabilir";
      }

      setErrors((prev) => ({ ...prev, productName: error }));
    },
    [], // ✅ No dependencies = stable reference
  );

  // Validation logic (for form submission only)
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

  // ✅ FIX: Product category change handler with validation
  const handleProductCategoryChange = useCallback((value: string) => {
    setProductCategory(value);
    setUserManuallySelected(true); // ✅ Mark as manually selected
    // Clear error when category is selected
    if (value.trim()) {
      setErrors((prev) => ({ ...prev, productCategory: undefined }));
    }
  }, []);

  const isFormValid = useMemo(() => {
    return (
      !errors.productName &&
      !errors.productCategory &&
      productName.trim().length > 0 &&
      productCategory.trim().length > 0
    );
  }, [errors, productName, productCategory]);

  // ✅ FIX: Memoize adornments to prevent TextField re-renders
  const productNameStartAdornment = useMemo(
    () => (
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
    [
      errors.productName,
      ds.colors.error.main,
      ds.colors.primary.main,
      ds.componentSizes.icon.medium,
    ],
  );

  const productNameEndAdornment = useMemo(() => {
    if (!productName.trim() || errors.productName) return null;

    return (
      <InputAdornment position="end">
        {checkingCategory ? (
          <CircularProgress size={16} />
        ) : (
          <CheckCircleIcon
            sx={{
              color: ds.colors.success.main,
              fontSize: ds.componentSizes.icon.small,
            }}
          />
        )}
      </InputAdornment>
    );
  }, [
    productName,
    errors.productName,
    checkingCategory,
    ds.colors.success.main,
    ds.componentSizes.icon.small,
  ]);

  const handleClose = useCallback(() => {
    setProductName("");
    setProductCategory("");
    setUserManuallySelected(false); // ✅ Reset manual selection flag
    lastAutoSelectedRef.current = null; // ✅ Reset last auto-selected ref
    setErrors({});
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(async () => {
    // Final validation
    const nameError = validateProductName(productName);
    const categoryError = !productCategory.trim()
      ? "Ürün grubu seçimi zorunludur"
      : undefined;

    if (nameError || categoryError) {
      setErrors({
        productName: nameError,
        productCategory: categoryError,
      });
      return;
    }

    if (productName.trim() && productCategory.trim()) {
      // Map product to category if it's a new product
      if (!existingCategory) {
        try {
          const selectedCategory = categories.find(
            (cat) => cat.name === productCategory,
          );
          if (selectedCategory) {
            await mapProductMutation.mutateAsync({
              productName: productName.trim(),
              categoryId: selectedCategory.id,
            });
          }
        } catch (error) {
          // Log error but continue with product creation
          console.error("Failed to map product to category:", error);
        }
      }

      onAddProduct(productName.trim(), productCategory.trim());
      handleClose();
    }
  }, [
    productName,
    productCategory,
    validateProductName,
    onAddProduct,
    handleClose,
    existingCategory,
    categories,
    mapProductMutation,
  ]);

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
              disabled={isLoading} // ✅ FIX: Removed checkingCategory - don't disable while checking!
              error={!!errors.productName}
              helperText={
                errors.productName || `${productName.length}/50 karakter`
              }
              InputProps={{
                startAdornment: productNameStartAdornment, // ✅ FIX: Use memoized startAdornment
                endAdornment: productNameEndAdornment, // ✅ FIX: Use memoized endAdornment
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: `${ds.borderRadius.md}px`,
                },
              }}
            />

            <FormControl
              fullWidth
              required
              error={!!errors.productCategory}
              disabled={isLoading || categoriesLoading}
            >
              <InputLabel id="product-category-label">Ürün Grubu</InputLabel>
              <Select
                labelId="product-category-label"
                value={productCategory}
                onChange={(e) => {
                  setProductCategory(e.target.value);
                  setErrors((prev) => ({
                    ...prev,
                    productCategory: undefined,
                  }));
                }}
                label="Ürün Grubu"
                sx={{
                  borderRadius: `${ds.borderRadius.md}px`,
                }}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.name}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.productCategory && (
                <FormHelperText>{errors.productCategory}</FormHelperText>
              )}
              {existingCategory && !errors.productCategory && (
                <FormHelperText sx={{ color: ds.colors.success.main }}>
                  Bu ürün için kategori otomatik seçildi
                </FormHelperText>
              )}
            </FormControl>
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
