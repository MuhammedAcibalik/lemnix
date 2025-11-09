/**
 * @fileoverview Work Order Item - Enterprise UX Final
 * @module WorkOrderItem
 * @version 8.0.0 - Clean, Minimal, Professional
 */

import React, { memo } from "react";
import {
  Stack,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Chip,
  Grid,
  alpha,
} from "@mui/material";

import { useDesignSystem } from "@/shared/hooks";
import { CardV2 } from "@/shared";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Assignment as AssignmentIcon,
  CalendarToday as CalendarIcon,
  Palette as PaletteIcon,
  Straighten as StraightenIcon,
  Inventory as InventoryIcon,
} from "@mui/icons-material";
import { WorkOrderItem as WorkOrderItemType } from "../types";

interface WorkOrderItemProps {
  item: WorkOrderItemType;
  sectionId: string;
  onEdit: (sectionId: string, item: WorkOrderItemType) => void;
  onDelete: (sectionId: string, itemId: string) => void;
  onCopy: (item: WorkOrderItemType) => void;
  isNested?: boolean;
  index?: number;
}

const DetailItem = memo(
  ({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
  }) => {
    const ds = useDesignSystem();

    return (
      <Box
        sx={{
          p: ds.spacing["2"],
          borderRadius: `${ds.borderRadius.sm}px`,
          background: alpha(ds.colors.neutral[100], 0.5),
          border: `1px solid ${ds.colors.neutral[200]}`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={ds.spacing["1"]}>
          {icon}
          <Box>
            <Typography
              sx={{
                fontSize: "0.625rem",
                color: ds.colors.text.secondary,
                lineHeight: 1,
              }}
            >
              {label}
            </Typography>
            <Typography
              sx={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: ds.colors.text.primary,
                lineHeight: 1.2,
              }}
            >
              {value}
            </Typography>
          </Box>
        </Stack>
      </Box>
    );
  },
);

DetailItem.displayName = "DetailItem";

export const WorkOrderItem: React.FC<WorkOrderItemProps> = memo(
  ({
    item,
    sectionId,
    onEdit,
    onDelete,
    onCopy,
    isNested = false,
    index = 0,
  }) => {
    const ds = useDesignSystem();

    return (
      <CardV2
        variant="glass"
        sx={{
          p: ds.spacing["3"],
          transition: ds.transitions.base,
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: ds.shadows.soft.md,
          },
        }}
      >
        <Stack spacing={ds.spacing["2"]}>
          {/* HEADER */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={ds.spacing["2"]}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: `${ds.borderRadius.md}px`,
                  background: ds.colors.primary.main,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: ds.colors.text.inverse,
                  fontWeight: 700,
                  fontSize: "0.75rem",
                }}
              >
                {index + 1}
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: ds.colors.text.primary,
                    lineHeight: 1,
                    mb: 0.5,
                  }}
                >
                  {item.workOrderId}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.6875rem",
                    color: ds.colors.text.secondary,
                  }}
                >
                  İş Emri
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Düzenle" arrow>
                <IconButton
                  size="small"
                  onClick={() => onEdit(sectionId, item)}
                  sx={{
                    color: ds.colors.primary.main,
                    padding: "6px",
                    "&:hover": {
                      background: alpha(ds.colors.primary.main, 0.1),
                    },
                  }}
                >
                  <EditIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Kopyala" arrow>
                <IconButton
                  size="small"
                  onClick={() => onCopy(item)}
                  sx={{
                    color: ds.colors.accent.main,
                    padding: "6px",
                    "&:hover": {
                      background: alpha(ds.colors.accent.main, 0.1),
                    },
                  }}
                >
                  <CopyIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Sil" arrow>
                <IconButton
                  size="small"
                  onClick={() => onDelete(sectionId, item.id)}
                  sx={{
                    color: ds.colors.error.main,
                    padding: "6px",
                    "&:hover": {
                      background: alpha(ds.colors.error.main, 0.1),
                    },
                  }}
                >
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          {/* DETAILS GRID - Compact */}
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <DetailItem
                icon={
                  <CalendarIcon
                    sx={{
                      fontSize: ds.componentSizes.icon.small,
                      color: ds.colors.primary.main,
                    }}
                  />
                }
                label="Tarih"
                value={item.date || "N/A"}
              />
            </Grid>

            <Grid item xs={6}>
              <DetailItem
                icon={
                  <PaletteIcon
                    sx={{
                      fontSize: ds.componentSizes.icon.small,
                      color: ds.colors.error.main,
                    }}
                  />
                }
                label="Renk"
                value={item.color}
              />
            </Grid>

            <Grid item xs={6}>
              <DetailItem
                icon={
                  <StraightenIcon
                    sx={{
                      fontSize: ds.componentSizes.icon.small,
                      color: ds.colors.accent.main,
                    }}
                  />
                }
                label="Ebat"
                value={item.size}
              />
            </Grid>

            <Grid item xs={6}>
              <DetailItem
                icon={
                  <AssignmentIcon
                    sx={{
                      fontSize: ds.componentSizes.icon.small,
                      color: ds.colors.success.main,
                    }}
                  />
                }
                label="Versiyon"
                value={item.version}
              />
            </Grid>
          </Grid>

          {/* PROFILES - Compact List */}
          {item.profiles && item.profiles.length > 0 && (
            <Box>
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  mb: ds.spacing["1"],
                  color: ds.colors.text.primary,
                }}
              >
                Profiller ({item.profiles.length})
              </Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {item.profiles.map((profile, pIndex) => (
                  <Chip
                    key={pIndex}
                    label={`${profile.profile} ${profile.measurement?.includes("mm") ? profile.measurement : `${profile.measurement}mm`} (${profile.quantity})`}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: "0.6875rem",
                      fontWeight: 500,
                      background: alpha(ds.colors.primary.main, 0.1),
                      color: ds.colors.primary.main,
                      border: `1px solid ${alpha(ds.colors.primary.main, 0.2)}`,
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </CardV2>
    );
  },
);

WorkOrderItem.displayName = "WorkOrderItem";
