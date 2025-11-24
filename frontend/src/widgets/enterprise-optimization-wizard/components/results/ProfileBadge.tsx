/**
 * Profile Badge Component
 * Displays profile information used in optimization
 */

import React from "react";
import { Box, Typography, Chip, Tooltip, alpha } from "@mui/material";
import {
  AccountTree as ProfileIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import { useDesignSystem } from "@/shared/hooks";
import { CardV2 } from "@/shared";

interface ProfileBadgeProps {
  readonly profileCode: string;
  readonly profileName: string;
  readonly stockLengths: readonly number[];
  readonly source: "mapping" | "fallback";
}

export const ProfileBadge: React.FC<ProfileBadgeProps> = ({
  profileCode,
  profileName,
  stockLengths,
  source,
}) => {
  const ds = useDesignSystem();

  return (
    <CardV2
      variant="glass"
      sx={{
        p: ds.spacing["3"],
        border: `1px solid ${alpha(ds.colors.primary.main, 0.2)}`,
      }}
    >
      <Box
        sx={{ display: "flex", alignItems: "flex-start", gap: ds.spacing["2"] }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: `${ds.borderRadius.sm}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: alpha(ds.colors.primary.main, 0.1),
            flexShrink: 0,
          }}
        >
          <ProfileIcon sx={{ color: ds.colors.primary.main, fontSize: 20 }} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: ds.spacing["1"],
              mb: 0.5,
            }}
          >
            <Typography
              sx={{
                fontWeight: ds.typography.fontWeight.bold,
                fontSize: "0.9375rem",
                color: ds.colors.text.primary,
              }}
            >
              {profileCode}
            </Typography>
            <Tooltip
              title={
                source === "mapping"
                  ? "Sipariş eşleştirmesinden"
                  : "Varsayılan profil"
              }
            >
              <Chip
                {...(source === "mapping"
                  ? {
                      icon: <CheckIcon sx={{ fontSize: 10 }} />,
                    }
                  : {})}
                label={source === "mapping" ? "Eşleşti" : "Varsayılan"}
                size="small"
                sx={{
                  height: 18,
                  fontSize: "0.625rem",
                  fontWeight: 600,
                  background:
                    source === "mapping"
                      ? alpha(ds.colors.success.main, 0.1)
                      : alpha(ds.colors.neutral[500], 0.1),
                  color:
                    source === "mapping"
                      ? ds.colors.success[700]
                      : ds.colors.neutral[700],
                  "& .MuiChip-icon": {
                    ml: 0.5,
                    mr: -0.5,
                  },
                }}
              />
            </Tooltip>
          </Box>

          <Typography
            variant="caption"
            sx={{
              color: ds.colors.text.secondary,
              display: "block",
              mb: 1,
            }}
          >
            {profileName}
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {stockLengths.map((length, idx) => (
              <Chip
                key={idx}
                label={`${length}mm`}
                size="small"
                variant={idx === 0 ? "filled" : "outlined"}
                sx={{
                  height: 20,
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  ...(idx === 0 && {
                    background: alpha(ds.colors.primary.main, 0.1),
                    color: ds.colors.primary.main,
                    borderColor: "transparent",
                  }),
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </CardV2>
  );
};
