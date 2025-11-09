/**
 * ConfirmationDialog Component
 * Reusable confirmation dialog with customizable actions
 */

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  IconButton,
} from "@mui/material";
import {
  Close as CloseIcon,
  WarningAmber as WarningAmberIcon,
  Info as InfoIcon,
  ErrorOutline as ErrorOutlineIcon,
} from "@mui/icons-material";
import { useDesignSystem } from "@/shared/hooks";
import { alpha } from "@mui/material/styles";

interface ConfirmationDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
  readonly title: string;
  readonly description: string;
  readonly confirmButtonText?: string;
  readonly cancelButtonText?: string;
  readonly confirmButtonColor?: "primary" | "error" | "warning";
  readonly variant?: "warning" | "info" | "error";
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmButtonText = "Onayla",
  cancelButtonText = "İptal",
  confirmButtonColor = "primary",
  variant = "warning",
}) => {
  const ds = useDesignSystem();

  const getIcon = () => {
    switch (variant) {
      case "warning":
        return (
          <WarningAmberIcon
            sx={{
              fontSize: ds.componentSizes.icon.large,
              color: ds.colors.warning.main,
            }}
          />
        );
      case "error":
        return (
          <ErrorOutlineIcon
            sx={{
              fontSize: ds.componentSizes.icon.large,
              color: ds.colors.error.main,
            }}
          />
        );
      case "info":
      default:
        return (
          <InfoIcon
            sx={{
              fontSize: ds.componentSizes.icon.large,
              color: ds.colors.info.main,
            }}
          />
        );
    }
  };

  const getConfirmButtonStyles = () => {
    const baseStyle = {
      height: ds.componentSizes.button.medium.height,
      borderRadius: `${ds.borderRadius.button}px`,
    };

    switch (confirmButtonColor) {
      case "error":
        return {
          ...baseStyle,
          backgroundColor: ds.colors.error.main,
          color: "#ffffff",
          "&:hover": {
            backgroundColor: ds.colors.error[700],
          },
        };
      case "warning":
        return {
          ...baseStyle,
          backgroundColor: ds.colors.warning.main,
          color: "#ffffff",
          "&:hover": {
            backgroundColor: ds.colors.warning[700],
          },
        };
      case "primary":
      default:
        return {
          ...baseStyle,
          background: ds.gradients.primary,
          color: "#ffffff",
          "&:hover": {
            background: ds.gradients.primary,
            opacity: 0.9,
          },
        };
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: `${ds.borderRadius.xl}px`,
          boxShadow: ds.shadows.soft.xl,
        },
      }}
    >
      <Box
        sx={{
          background: ds.glass.background,
          backdropFilter: ds.glass.backdropFilter,
          borderBottom: ds.glass.border,
          p: ds.spacing["4"],
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", gap: ds.spacing["2"] }}
        >
          {getIcon()}
          <DialogTitle
            sx={{
              p: 0,
              fontSize: "1.25rem",
              fontWeight: ds.typography.fontWeight.bold,
              color: ds.colors.text.primary,
            }}
          >
            {title}
          </DialogTitle>
        </Box>
        <IconButton
          onClick={onClose}
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
      </Box>
      <DialogContent sx={{ p: ds.spacing["4"] }}>
        <Typography
          variant="body2"
          sx={{
            color: ds.colors.text.secondary,
            lineHeight: 1.6,
          }}
        >
          {description}
        </Typography>
      </DialogContent>
      <DialogActions
        sx={{
          p: ds.spacing["4"],
          borderTop: `1px solid ${ds.colors.neutral[100]}`,
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            height: ds.componentSizes.button.medium.height,
            borderRadius: `${ds.borderRadius.button}px`,
            borderColor: ds.colors.neutral[300],
            color: ds.colors.text.primary,
            "&:hover": {
              borderColor: ds.colors.primary.main,
              backgroundColor: alpha(ds.colors.primary.main, 0.04),
            },
          }}
        >
          {cancelButtonText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          sx={getConfirmButtonStyles()}
        >
          {confirmButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
