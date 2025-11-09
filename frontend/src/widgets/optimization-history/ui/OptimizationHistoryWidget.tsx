/**
 * Optimization History Widget Component
 * Compact widget showing recent optimization history
 *
 * @module widgets/optimization-history
 * @version 1.0.0
 */

import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Typography,
  Box,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  History as HistoryIcon,
  CheckCircle as SuccessIcon,
  Refresh as RefreshIcon,
  OpenInNew as OpenIcon,
} from "@mui/icons-material";
import {
  useOptimizationHistory,
  ALGORITHM_CATALOG,
  type AlgorithmType,
} from "@/entities/optimization";

export interface OptimizationHistoryWidgetProps {
  readonly limit?: number;
  readonly onItemClick?: (id: string) => void;
}

const formatTimeAgo = (timestamp: string): string => {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diff = now - then;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Az önce";
  if (minutes < 60) return `${minutes} dakika önce`;
  if (hours < 24) return `${hours} saat önce`;
  return `${days} gün önce`;
};

export const OptimizationHistoryWidget: React.FC<
  OptimizationHistoryWidgetProps
> = ({ limit = 5, onItemClick }) => {
  const {
    data: history,
    isLoading,
    error,
    refetch,
  } = useOptimizationHistory({
    page: 1,
    pageSize: limit,
  });

  return (
    <Card>
      <CardHeader
        avatar={<HistoryIcon />}
        title="Optimizasyon Geçmişi"
        subheader={`Son ${limit} optimizasyon`}
        action={
          <IconButton onClick={() => void refetch()} size="small">
            <RefreshIcon />
          </IconButton>
        }
      />
      <CardContent sx={{ pt: 0 }}>
        {isLoading && (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress size={40} />
          </Box>
        )}

        {error && <Alert severity="error">Geçmiş yüklenemedi</Alert>}

        {!isLoading && !error && history && history.length === 0 && (
          <Alert severity="info">Henüz optimizasyon geçmişi yok</Alert>
        )}

        {!isLoading && !error && history && history.length > 0 && (
          <List disablePadding>
            {history.map((item) => {
              const algorithm = item.result.algorithm;
              const algorithmInfo = ALGORITHM_CATALOG[algorithm];

              return (
                <ListItem
                  key={item.id}
                  disablePadding
                  sx={{
                    py: 1,
                    px: 0,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    "&:last-child": { borderBottom: "none" },
                  }}
                  secondaryAction={
                    onItemClick && (
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => onItemClick(item.id)}
                      >
                        <OpenIcon fontSize="small" />
                      </IconButton>
                    )
                  }
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <SuccessIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" fontWeight="medium">
                          {algorithmInfo.icon} {algorithmInfo.name}
                        </Typography>
                        <Chip
                          label={`${item.result.totalEfficiency.toFixed(1)}%`}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          {item.request.items.length} parça
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          •
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTimeAgo(item.createdAt)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
};
