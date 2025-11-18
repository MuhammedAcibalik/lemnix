/**
 * Command Results - Design System v2.0
 * Clean command list with semantic grouping
 */

import React from "react";
import { Box, Typography, alpha } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { useDesignSystem } from "@/shared/hooks";
import { CommandItem } from "./CommandItem";
import type { CommandItem as CommandItemType } from "../types";

export interface CommandResultsProps {
  items: CommandItemType[];
  selectedIndex: number;
  onItemSelect: (item: CommandItemType) => void;
}

export const CommandResults: React.FC<CommandResultsProps> = ({
  items,
  selectedIndex,
  onItemSelect,
}) => {
  const ds = useDesignSystem();

  // Group items by category
  const groupedItems = items.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, CommandItemType[]>,
  );

  // Empty state
  if (items.length === 0) {
    return (
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: ds.spacing["8"],
          textAlign: "center",
        }}
      >
        <SearchIcon
          sx={{
            color: ds.colors.neutral[400],
            fontSize: ds.componentSizes.icon["2xl"],
            mb: ds.spacing["3"],
          }}
        />
        <Typography
          variant="h6"
          sx={{
            color: ds.colors.text.secondary,
            fontWeight: ds.typography.fontWeight.medium,
            mb: ds.spacing["1"],
            fontSize: "clamp(0.9375rem, 1.5vw + 0.5rem, 1.125rem)",
          }}
        >
          Komut bulunamadı
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: ds.colors.text.secondary,
            fontSize: "clamp(0.8125rem, 1vw + 0.5rem, 0.9375rem)",
            opacity: 0.8,
          }}
        >
          Farklı anahtar kelimeler deneyin
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        "&::-webkit-scrollbar": {
          width: "6px",
        },
        "&::-webkit-scrollbar-track": {
          background: alpha(ds.colors.neutral[300], 0.2),
          borderRadius: `${ds.borderRadius.sm}px`,
        },
        "&::-webkit-scrollbar-thumb": {
          background: alpha(ds.colors.neutral[500], 0.5),
          borderRadius: `${ds.borderRadius.sm}px`,
          "&:hover": {
            background: alpha(ds.colors.neutral[500], 0.7),
          },
        },
      }}
    >
      <Box sx={{ p: ds.spacing["1"] }}>
        {" "}
        {/* 8px → 4px DAHA GENİŞ */}
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <Box key={category} sx={{ mb: ds.spacing["4"] }}>
            {/* Category Header - Kompakt */}
            <Box
              sx={{
                px: ds.spacing["2"], // 12px → 8px
                py: "4px", // 6px → 4px
                height: 28, // 32px → 28px
                display: "flex",
                alignItems: "center",
                mb: "2px", // 4px → 2px
              }}
            >
              <Typography
                variant="overline"
                sx={{
                  fontSize: "0.6875rem", // 11px
                  fontWeight: 600,
                  color: ds.colors.text.secondary,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  lineHeight: 1,
                }}
              >
                {category}
              </Typography>
            </Box>

            {/* Category Items - Tight Spacing */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: ds.spacing["1"], // 4px tight spacing
              }}
            >
              {categoryItems.map((item, itemIndex) => {
                const globalIndex = items.findIndex((i) => i === item);
                return (
                  <CommandItem
                    key={item.id}
                    item={item}
                    isSelected={globalIndex === selectedIndex}
                    onClick={() => onItemSelect(item)}
                  />
                );
              })}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
