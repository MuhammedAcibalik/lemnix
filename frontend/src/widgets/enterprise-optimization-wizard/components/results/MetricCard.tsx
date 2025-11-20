/**
 * Metric Card Component
 * Mini metric card for dashboard-style layouts
 *
 * @module enterprise-optimization-wizard/components/results
 * @version 1.0.0
 */

import React, { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { TrendingUp, TrendingDown, ExpandMore } from "@mui/icons-material";
import { CardV2 } from "@/shared/ui/Card/Card.v2";
import { useDesignSystem } from "@/shared/hooks";

export interface MetricCardProps {
  readonly label: string;
  readonly value: string | number;
  readonly change?: number;
  readonly unit?: string;
  readonly color?: "primary" | "success" | "warning" | "error" | "info";
  readonly icon?: React.ReactNode;
  readonly subtitle?: string;
  readonly detail?: string;
  readonly showUnitConverter?: boolean;
}

// Unit conversion helper
const convertLength = (
  value: number,
  fromUnit: string,
  toUnit: string,
): number => {
  const conversions: Record<string, number> = {
    mm: 1,
    cm: 10,
    m: 1000,
  };

  const fromFactor = conversions[fromUnit] || 1;
  const toFactor = conversions[toUnit] || 1;

  return (value * fromFactor) / toFactor;
};

const formatLength = (value: number, unit: string): string => {
  if (unit === "mm") return `${value.toFixed(0)} mm`;
  if (unit === "cm") return `${value.toFixed(2)} cm`;
  if (unit === "m") return `${value.toFixed(3)} m`;
  return `${value} ${unit}`;
};

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  change,
  unit,
  color = "primary",
  icon,
  subtitle,
  detail,
  showUnitConverter = false,
}) => {
  const ds = useDesignSystem();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUnit, setSelectedUnit] = useState(unit || "mm");

  const colorMap = {
    primary: ds.colors.primary.main,
    success: ds.colors.success.main,
    warning: ds.colors.warning.main,
    error: ds.colors.error.main,
    info: ds.colors.info.main,
  };

  const selectedColor = colorMap[color];

  const handleUnitClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUnitClose = () => {
    setAnchorEl(null);
  };

  const handleUnitSelect = (newUnit: string) => {
    setSelectedUnit(newUnit);
    handleUnitClose();
  };

  // Convert value if unit converter is enabled
  const displayValue =
    showUnitConverter && typeof value === "number" && unit === "mm"
      ? convertLength(value, "mm", selectedUnit)
      : value;

  const displayUnit = showUnitConverter && unit === "mm" ? selectedUnit : unit;

  // Debug: Log unit values
  console.log("MetricCard Debug:", {
    unit,
    displayUnit,
    showUnitConverter,
    selectedUnit,
    value,
    label,
  });

  return (
    <CardV2
      variant="glass"
      sx={{
        p: ds.spacing["3"], // ✅ Arttırılmış padding (12px)
        height: "100%", // ✅ Esnek yükseklik
        minHeight: 140, // ✅ Minimum yükseklik arttırıldı
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "hidden",
        width: "100%",
        transition: ds.transitions.base,
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: ds.shadows.soft.lg,
        },
      }}
    >
      {/* Label with Subtitle */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: ds.spacing["2"],
          mb: ds.spacing["2"],
        }}
      >
        {icon && (
          <Box
            sx={{
              color: selectedColor,
              display: "flex",
              alignItems: "center",
              p: ds.spacing["1.5"],
              borderRadius: "50%",
              backgroundColor: `${selectedColor}15`, // Light background for icon
            }}
          >
            {icon}
          </Box>
        )}
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Typography
            variant="caption"
            sx={{
              color: ds.colors.text.secondary,
              fontSize: "0.75rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {subtitle || "METRİK"}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: ds.colors.text.primary,
              fontSize: "0.875rem",
              fontWeight: 600,
              lineHeight: 1.2,
            }}
          >
            {label}
          </Typography>
        </Box>
      </Box>

      {/* Value */}
      <Box
        sx={{
          display: "flex",
          alignItems: "baseline",
          gap: ds.spacing["1"],
          flex: 1,
          minHeight: 0,
          my: ds.spacing["1"],
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: selectedColor,
            fontSize: "2rem",
            lineHeight: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {displayValue}
        </Typography>
        {displayUnit && displayUnit.trim() !== "" && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: ds.spacing["0.5"],
              flexShrink: 0,
            }}
          >
            <Typography
              component="span"
              sx={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: ds.colors.text.secondary,
                lineHeight: 1,
              }}
            >
              {displayUnit}
            </Typography>
            {showUnitConverter && (
              <IconButton
                size="small"
                onClick={handleUnitClick}
                sx={{
                  p: 0.5,
                  color: ds.colors.text.secondary,
                  "&:hover": {
                    color: selectedColor,
                  },
                }}
              >
                <ExpandMore sx={{ fontSize: 16 }} />
              </IconButton>
            )}
          </Box>
        )}
      </Box>

      {/* Detail & Change */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mt: "auto",
        }}
      >
        {detail && (
          <Typography
            variant="caption"
            sx={{
              color: ds.colors.text.secondary,
              fontSize: "0.75rem",
              fontWeight: 500,
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {detail}
          </Typography>
        )}

        {change !== undefined && (
          <Chip
            size="small"
            icon={
              change >= 0 ? (
                <TrendingUp sx={{ fontSize: 14 }} />
              ) : (
                <TrendingDown sx={{ fontSize: 14 }} />
              )
            }
            label={`${change >= 0 ? "+" : ""}${change.toFixed(1)}%`}
            sx={{
              height: 24,
              fontSize: "0.75rem",
              fontWeight: 600,
              ml: ds.spacing["1"],
              backgroundColor:
                change >= 0
                  ? `${ds.colors.success.main}15`
                  : `${ds.colors.error.main}15`,
              color:
                change >= 0 ? ds.colors.success.main : ds.colors.error.main,
              "& .MuiChip-icon": {
                color: "inherit",
              },
            }}
          />
        )}
      </Box>

      {/* Unit Converter Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleUnitClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <MenuItem
          onClick={() => handleUnitSelect("mm")}
          selected={selectedUnit === "mm"}
        >
          mm (Milimetre)
        </MenuItem>
        <MenuItem
          onClick={() => handleUnitSelect("cm")}
          selected={selectedUnit === "cm"}
        >
          cm (Santimetre)
        </MenuItem>
        <MenuItem
          onClick={() => handleUnitSelect("m")}
          selected={selectedUnit === "m"}
        >
          m (Metre)
        </MenuItem>
      </Menu>
    </CardV2>
  );
};
