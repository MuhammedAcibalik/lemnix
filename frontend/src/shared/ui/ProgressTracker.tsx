/**
 * @fileoverview Progress Tracker Component
 * @module shared/ui/ProgressTracker
 * @version 1.0.0
 *
 * ⚡🔐 CRITICAL: Real-time progress visualization
 * - Beautiful progress indicators
 * - Real-time updates
 * - Security status indicators
 * - Responsive design
 */

import React from "react";
import {
  Box,
  LinearProgress,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Collapse,
  Alert,
  Stack,
  useTheme,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Timer as TimerIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface ProgressData {
  isActive: boolean;
  stage: string;
  percentage: number;
  message: string;
  itemsProcessed: number;
  totalItems: number;
  estimatedTimeRemaining?: number;
  startTime: number;
  duration?: number;
}

export interface ProgressTrackerProps {
  progress: ProgressData;
  title?: string;
  showDetails?: boolean;
  onToggleDetails?: () => void;
  variant?: "upload" | "retrieve" | "processing";
}

// ============================================================================
// PROGRESS TRACKER COMPONENT
// ============================================================================

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  progress,
  title = "İşlem Durumu",
  showDetails = false,
  onToggleDetails,
  variant = "processing",
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = React.useState(showDetails);

  const handleToggleDetails = () => {
    setExpanded(!expanded);
    onToggleDetails?.();
  };

  const getStageInfo = (stage: string) => {
    const stageMap: Record<
      string,
      { label: string; color: string; icon: React.ReactNode }
    > = {
      idle: { label: "Hazır", color: "default", icon: <CheckCircleIcon /> },
      starting: { label: "Başlıyor", color: "info", icon: <SpeedIcon /> },
      parsing: {
        label: "Parse Ediliyor",
        color: "primary",
        icon: <SpeedIcon />,
      },
      encrypting: {
        label: "Şifreleniyor",
        color: "warning",
        icon: <SecurityIcon />,
      },
      saving: {
        label: "Kaydediliyor",
        color: "secondary",
        icon: <SpeedIcon />,
      },
      complete: {
        label: "Tamamlandı",
        color: "success",
        icon: <CheckCircleIcon />,
      },
      error: { label: "Hata", color: "error", icon: <ErrorIcon /> },
    };

    return (
      stageMap[stage] || { label: stage, color: "default", icon: <SpeedIcon /> }
    );
  };

  const getVariantColor = (): "primary" | "secondary" | "info" => {
    const variantMap: Record<string, "primary" | "secondary" | "info"> = {
      upload: "primary",
      retrieve: "secondary",
      processing: "info",
    };
    return variantMap[variant] || "primary";
  };

  const formatTime = (ms?: number) => {
    if (!ms) return "Bilinmiyor";
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${Math.round(ms / 1000)}s`;
    return `${Math.round(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
  };

  const formatEstimatedTime = (ms?: number) => {
    if (!ms) return "Hesaplanıyor...";
    if (ms < 1000) return `${ms}ms kaldı`;
    if (ms < 60000) return `${Math.round(ms / 1000)}s kaldı`;
    return `${Math.round(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s kaldı`;
  };

  const stageInfo = getStageInfo(progress.stage);
  const isComplete = progress.stage === "complete";
  const hasError = progress.stage === "error";

  return (
    <Card
      sx={{
        width: "100%",
        mb: 2,
        border: `1px solid ${theme.palette[getVariantColor()].main}`,
        borderRadius: 2,
      }}
    >
      <CardContent>
        {/* Header */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Box display="flex" alignItems="center" gap={1}>
            {stageInfo.icon}
            <Typography variant="h6" component="div">
              {title}
            </Typography>
            <Chip
              label={stageInfo.label}
              color={stageInfo.color as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"}
              size="small"
              icon={stageInfo.icon}
            />
          </Box>

          {onToggleDetails && (
            <Tooltip title={expanded ? "Detayları Gizle" : "Detayları Göster"}>
              <IconButton onClick={handleToggleDetails} size="small">
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Progress Bar */}
        <Box mb={2}>
          <LinearProgress
            variant="determinate"
            value={progress.percentage}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.palette.grey[200],
              "& .MuiLinearProgress-bar": {
                backgroundColor: hasError
                  ? theme.palette.error.main
                  : isComplete
                    ? theme.palette.success.main
                    : theme.palette[getVariantColor()].main,
                borderRadius: 4,
              },
            }}
          />
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography variant="body2" color="text.secondary">
              {progress.percentage}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {progress.itemsProcessed} / {progress.totalItems} öğe
            </Typography>
          </Box>
        </Box>

        {/* Message */}
        <Typography variant="body1" color="text.primary" mb={2}>
          {progress.message}
        </Typography>

        {/* Details */}
        <Collapse in={expanded}>
          <Box mt={2}>
            <Stack spacing={2}>
              {/* Security Status */}
              <Box display="flex" alignItems="center" gap={1}>
                <SecurityIcon color="success" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  Güvenlik: AES-256-GCM şifreleme aktif
                </Typography>
              </Box>

              {/* Performance Info */}
              <Box display="flex" alignItems="center" gap={1}>
                <SpeedIcon color="info" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  Performans: Asenkron işleme aktif
                </Typography>
              </Box>

              {/* Time Information */}
              {progress.estimatedTimeRemaining && (
                <Box display="flex" alignItems="center" gap={1}>
                  <TimerIcon color="warning" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    Tahmini süre:{" "}
                    {formatEstimatedTime(progress.estimatedTimeRemaining)}
                  </Typography>
                </Box>
              )}

              {/* Duration */}
              {progress.duration && (
                <Box display="flex" alignItems="center" gap={1}>
                  <TimerIcon color="primary" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    Toplam süre: {formatTime(progress.duration)}
                  </Typography>
                </Box>
              )}

              {/* Error Alert */}
              {hasError && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.
                </Alert>
              )}

              {/* Success Alert */}
              {isComplete && (
                <Alert severity="success" sx={{ mt: 1 }}>
                  İşlem başarıyla tamamlandı!
                </Alert>
              )}
            </Stack>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// COMPACT PROGRESS TRACKER
// ============================================================================

export const CompactProgressTracker: React.FC<{
  progress: ProgressData;
  variant?: "upload" | "retrieve" | "processing";
}> = ({ progress, variant = "processing" }) => {
  const theme = useTheme();
  
  const getStageInfo = (stage: string) => {
    const stageMap: Record<
      string,
      { label: string; color: string; icon: React.ReactNode }
    > = {
      idle: { label: "Hazır", color: "default", icon: <CheckCircleIcon /> },
      starting: { label: "Başlıyor", color: "info", icon: <SpeedIcon /> },
      parsing: { label: "Parse", color: "primary", icon: <SpeedIcon /> },
      encrypting: {
        label: "Şifreleme",
        color: "warning",
        icon: <SecurityIcon />,
      },
      saving: { label: "Kaydetme", color: "secondary", icon: <SpeedIcon /> },
      complete: {
        label: "Tamamlandı",
        color: "success",
        icon: <CheckCircleIcon />,
      },
      error: { label: "Hata", color: "error", icon: <ErrorIcon /> },
    };

    return (
      stageMap[stage] || { label: stage, color: "default", icon: <SpeedIcon /> }
    );
  };
  
  const stageInfo = getStageInfo(progress.stage);
  const isComplete = progress.stage === "complete";
  const hasError = progress.stage === "error";

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={2}
      p={2}
      bgcolor="background.paper"
      borderRadius={1}
    >
      {stageInfo.icon}
      <Box flex={1}>
        <LinearProgress
          variant="determinate"
          value={progress.percentage}
          sx={{ height: 4, borderRadius: 2 }}
        />
      </Box>
      <Typography variant="body2" color="text.secondary">
        {progress.percentage}%
      </Typography>
      <Chip
        label={stageInfo.label}
        color={stageInfo.color as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"}
        size="small"
        icon={stageInfo.icon}
      />
    </Box>
  );
};
