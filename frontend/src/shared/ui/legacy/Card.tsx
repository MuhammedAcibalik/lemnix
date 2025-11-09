/**
 * @fileoverview Shared Card Component
 * @module SharedCard
 * @version 1.0.0
 * @deprecated This component is deprecated. Use `@/shared/ui/Card` instead.
 *
 * ⚠️ DEPRECATION WARNING ⚠️
 * This file will be removed in v2.0.0
 *
 * Migration:
 * ```tsx
 * // ❌ OLD
 * import { SharedCard } from '@components/shared/Card';
 *
 * // ✅ NEW
 * import { Card } from '@/shared';
 * ```
 *
 * Reusable card component with consistent styling and behavior
 */

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  Box,
  useTheme,
  alpha,
} from "@mui/material";

interface SharedCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  elevation?: number;
  variant?: "elevation" | "outlined";
  sx?: object;
  headerAction?: React.ReactNode;
}

export const SharedCard: React.FC<SharedCardProps> = ({
  title,
  subtitle,
  children,
  actions,
  elevation = 1,
  variant = "elevation",
  sx = {},
  headerAction,
}) => {
  const theme = useTheme();

  const cardStyles = {
    borderRadius: theme.shape.borderRadius * 2,
    border:
      variant === "outlined"
        ? `1px solid ${alpha(theme.palette.divider, 0.1)}`
        : "none",
    background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.default, 0.95)} 100%)`,
    backdropFilter: "blur(10px)",
    transition: theme.transitions.create(["box-shadow", "transform"], {
      duration: theme.transitions.duration.short,
    }),
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: theme.shadows[8],
    },
    ...sx,
  };

  return (
    <Card
      elevation={variant === "elevation" ? elevation : 0}
      variant={variant}
      sx={cardStyles}
    >
      {(title || subtitle || headerAction) && (
        <CardHeader
          title={
            title && (
              <Typography variant="h6" component="h3" fontWeight={600}>
                {title}
              </Typography>
            )
          }
          subheader={
            subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )
          }
          action={headerAction}
          sx={{
            pb: 1,
            "& .MuiCardHeader-content": {
              minWidth: 0,
            },
          }}
        />
      )}

      <CardContent sx={{ pt: title || subtitle ? 0 : 2 }}>
        {children}
      </CardContent>

      {actions && <CardActions sx={{ pt: 0 }}>{actions}</CardActions>}
    </Card>
  );
};
