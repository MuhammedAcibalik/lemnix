/**
 * @fileoverview Shared Modal Component
 * @module SharedModal
 * @version 1.0.0
 *
 * Reusable modal component with consistent styling and behavior
 */

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  useTheme,
  alpha,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

interface SharedModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  fullScreen?: boolean;
}

export const SharedModal: React.FC<SharedModalProps> = ({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = "md",
  fullWidth = true,
  fullScreen = false,
}) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          borderRadius: theme.shape.borderRadius * 2,
          boxShadow: theme.shadows[24],
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.default, 0.95)} 100%)`,
          backdropFilter: "blur(20px)",
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        },
      }}
    >
      {title && (
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 2,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 100%)`,
          }}
        >
          <Typography variant="h6" component="h2" fontWeight={600}>
            {title}
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: theme.palette.text.secondary,
              "&:hover": {
                color: theme.palette.error.main,
                backgroundColor: alpha(theme.palette.error.main, 0.1),
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
      )}

      <DialogContent
        sx={{
          px: 3,
          py: 3,
          "&.MuiDialogContent-root": {
            paddingTop: title ? 2 : 3,
          },
        }}
      >
        {children}
      </DialogContent>

      {actions && (
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            background: alpha(theme.palette.background.default, 0.5),
            gap: 1,
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};
