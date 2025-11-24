/**
 * Activity Timeline Panel Component
 * Shows chronological activity feed
 *
 * @module widgets/dashboard-v2/activity-timeline
 * @version 1.0.0 - Design System v2.0 Compliant
 */

import React, { useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Chip,
  alpha,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  PlayArrow as OptimizationIcon,
  ListAlt as ListIcon,
  FileDownload as ExportIcon,
  Person as UserIcon,
  FilterList as FilterIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { CardV2 } from "@/shared";
import { useDesignSystem } from "@/shared/hooks";
import {
  useActivityTimeline,
  type ActivityEventType,
  type ActivityFilter,
} from "@/entities/dashboard";

/**
 * Props
 */
export interface ActivityTimelinePanelProps {
  readonly maxItems?: number;
}

/**
 * Activity Timeline Panel
 * Chronological activity feed
 */
export const ActivityTimelinePanel: React.FC<ActivityTimelinePanelProps> = ({
  maxItems = 20,
}) => {
  const ds = useDesignSystem();
  const [filter, setFilter] = useState<ActivityFilter>({ limit: maxItems });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { data, isLoading } = useActivityTimeline(filter);

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleFilterChange = (type?: ActivityEventType) => {
    setFilter({ ...filter, ...(type !== undefined && { type }) });
    handleFilterClose();
  };

  const events = data?.events || [];

  return (
    <CardV2 variant="glass" sx={{ p: ds.spacing["1"], height: "100%" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: ds.spacing["2"],
        }}
      >
        <Typography
          sx={{
            fontSize: "0.9375rem",
            fontWeight: ds.typography.fontWeight.semibold,
            color: ds.colors.text.primary,
          }}
        >
          Aktivite Akışı
        </Typography>

        {/* Filter Button */}
        <IconButton
          size="small"
          onClick={handleFilterClick}
          sx={{
            color: ds.colors.text.secondary,
            "&:hover": {
              color: ds.colors.primary.main,
              backgroundColor: alpha(ds.colors.primary.main, 0.08),
            },
          }}
        >
          <FilterIcon fontSize="small" />
        </IconButton>

        {/* Filter Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleFilterClose}
        >
          <MenuItem onClick={() => handleFilterChange(undefined)}>
            Tümü
          </MenuItem>
          <MenuItem onClick={() => handleFilterChange("optimization_started")}>
            Optimizasyonlar
          </MenuItem>
          <MenuItem onClick={() => handleFilterChange("cutting_list_created")}>
            Kesim Listeleri
          </MenuItem>
          <MenuItem onClick={() => handleFilterChange("export_generated")}>
            Dışa Aktarımlar
          </MenuItem>
        </Menu>
      </Box>

      {/* Timeline */}
      {isLoading ? (
        <Box sx={{ textAlign: "center", py: ds.spacing["4"] }}>
          <Typography color="text.secondary">Yükleniyor...</Typography>
        </Box>
      ) : events.length === 0 ? (
        <Box sx={{ textAlign: "center", py: ds.spacing["6"] }}>
          <UserIcon
            sx={{
              fontSize: 48,
              color: ds.colors.neutral[400],
              mb: ds.spacing["2"],
            }}
          />
          <Typography
            sx={{
              fontSize: "0.9375rem",
              fontWeight: 600,
              color: ds.colors.text.primary,
            }}
          >
            Henüz aktivite yok
          </Typography>
        </Box>
      ) : (
        <Stack
          spacing={ds.spacing["2"]}
          sx={{ maxHeight: 400, overflowY: "auto", pr: ds.spacing["1"] }}
        >
          {events.map((event, index) => {
            const Icon = getEventIcon(event.type);
            const eventColor = getEventColor(event.type, ds);
            const isFirst = index === 0;

            return (
              <Box
                key={event.id}
                sx={{
                  display: "flex",
                  gap: ds.spacing["2"],
                  position: "relative",
                }}
              >
                {/* Timeline Line */}
                {!isFirst && (
                  <Box
                    sx={{
                      position: "absolute",
                      left: 15,
                      top: -8,
                      width: 2,
                      height: "calc(100% + 16px)",
                      backgroundColor: ds.colors.neutral[200],
                      zIndex: 0,
                    }}
                  />
                )}

                {/* Icon */}
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: alpha(eventColor, 0.1),
                    flexShrink: 0,
                    zIndex: 1,
                  }}
                >
                  <Box
                    sx={{
                      fontSize: 16,
                      color: eventColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon />
                  </Box>
                </Box>

                {/* Content */}
                <Box sx={{ flex: 1, pt: 0.5 }}>
                  <Typography
                    sx={{
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: ds.colors.text.primary,
                      mb: 0.25,
                    }}
                  >
                    {event.action}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: ds.spacing["1"],
                    }}
                  >
                    {event.userName && (
                      <Typography
                        sx={{
                          fontSize: "0.6875rem",
                          color: ds.colors.text.secondary,
                        }}
                      >
                        {event.userName}
                      </Typography>
                    )}
                    <Typography
                      sx={{
                        fontSize: "0.6875rem",
                        color: ds.colors.text.secondary,
                      }}
                    >
                      •
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.6875rem",
                        color: ds.colors.text.secondary,
                      }}
                    >
                      {formatTimeAgo(event.timestamp)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Stack>
      )}
    </CardV2>
  );
};

/**
 * Get event icon
 */
function getEventIcon(type: ActivityEventType) {
  const icons: Record<ActivityEventType, React.ComponentType> = {
    optimization_started: OptimizationIcon,
    optimization_completed: SuccessIcon,
    optimization_failed: ErrorIcon,
    cutting_list_created: ListIcon,
    cutting_list_updated: ListIcon,
    export_generated: ExportIcon,
    user_login: UserIcon,
    system_event: UserIcon,
  };
  return icons[type] || UserIcon;
}

/**
 * Get event color
 */
function getEventColor(
  type: ActivityEventType,
  ds: ReturnType<typeof useDesignSystem>,
): string {
  const colors: Record<ActivityEventType, string> = {
    optimization_started: ds.colors.primary.main,
    optimization_completed: ds.colors.success.main,
    optimization_failed: ds.colors.error.main,
    cutting_list_created: ds.colors.primary.main,
    cutting_list_updated: ds.colors.warning.main,
    export_generated: ds.colors.success.main,
    user_login: ds.colors.neutral[600],
    system_event: ds.colors.neutral[600],
  };
  return colors[type] || ds.colors.neutral[600];
}

/**
 * Format timestamp as relative time
 */
function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Şimdi";
  if (diffMins < 60) return `${diffMins} dakika önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays < 7) return `${diffDays} gün önce`;

  return then.toLocaleDateString("tr-TR");
}
