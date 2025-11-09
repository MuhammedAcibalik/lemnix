/**
 * @fileoverview Shared Loading Components
 * @module SharedLoading
 * @version 1.0.0
 *
 * Reusable loading components with consistent styling
 */

import React from "react";
import {
  Box,
  CircularProgress,
  LinearProgress,
  Typography,
  Skeleton,
  useTheme,
  alpha,
} from "@mui/material";

interface LoadingSpinnerProps {
  size?: number;
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  message = "Yükleniyor...",
  fullScreen = false,
}) => {
  const theme = useTheme();

  const containerStyles = fullScreen
    ? {
        position: "fixed" as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: theme.zIndex.modal + 1,
        background: alpha(theme.palette.background.default, 0.8),
        backdropFilter: "blur(4px)",
      }
    : {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "200px",
        gap: 2,
      };

  return (
    <Box sx={containerStyles}>
      <CircularProgress
        size={size}
        sx={{
          color: theme.palette.primary.main,
          "& .MuiCircularProgress-circle": {
            strokeLinecap: "round",
          },
        }}
      />
      {message && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            textAlign: "center",
            maxWidth: 200,
            wordBreak: "break-word",
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

interface LoadingBarProps {
  progress?: number;
  message?: string;
  variant?: "determinate" | "indeterminate";
}

export const LoadingBar: React.FC<LoadingBarProps> = ({
  progress,
  message = "İşlem devam ediyor...",
  variant = "indeterminate",
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {message}
      </Typography>
      <LinearProgress
        variant={variant}
        value={progress}
        sx={{
          height: 6,
          borderRadius: 3,
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
          "& .MuiLinearProgress-bar": {
            borderRadius: 3,
            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          },
        }}
      />
      {variant === "determinate" && progress !== undefined && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 0.5, display: "block" }}
        >
          %{Math.round(progress)} tamamlandı
        </Typography>
      )}
    </Box>
  );
};

interface SkeletonCardProps {
  lines?: number;
  height?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  lines = 3,
  height = 200,
}) => {
  return (
    <Box sx={{ p: 2, height }}>
      <Skeleton
        variant="rectangular"
        height={40}
        sx={{ mb: 2, borderRadius: 1 }}
      />
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          height={20}
          sx={{ mb: 1, borderRadius: 1 }}
          width={index === lines - 1 ? "60%" : "100%"}
        />
      ))}
    </Box>
  );
};
