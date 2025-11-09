/**
 * @fileoverview Search Controls Component v2.0 - Modern Design
 * @module SearchControls
 * @version 2.0.0 - Design System v2 Compliant
 */

import React from "react";
import {
  TextField,
  InputAdornment,
  Box,
  Chip,
  alpha,
  Stack,
} from "@mui/material";
import {
  Search as SearchIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";
import { SearchControlsProps } from "../types";
import { textContent, accessibilityConstants } from "../constants";

// Design System v2.0
import { useDesignSystem } from "@/shared/hooks";
import { CardV2 } from "@/shared";

/**
 * Search Controls Component
 */
export const SearchControls: React.FC<SearchControlsProps> = ({
  searchTerm,
  onSearchChange,
  totalItems,
  selectedItems,
}) => {
  const ds = useDesignSystem();
  const selectionPercentage =
    totalItems > 0 ? Math.round((selectedItems / totalItems) * 100) : 0;

  return (
    <CardV2 variant="glass" sx={{ p: ds.spacing["4"] }}>
      <Stack spacing={ds.spacing["3"]}>
        {/* Modern Search Input */}
        <TextField
          fullWidth
          placeholder={textContent.search.placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon
                  sx={{ color: ds.colors.primary.main, fontSize: 20 }}
                />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: `${ds.borderRadius.md}px`,
              transition: ds.transitions.fast,
              "& fieldset": {
                borderColor: alpha(ds.colors.primary.main, 0.2),
              },
              "&:hover fieldset": {
                borderColor: alpha(ds.colors.primary.main, 0.4),
              },
              "&.Mui-focused fieldset": {
                borderColor: ds.colors.primary.main,
                borderWidth: 2,
              },
            },
            "& .MuiOutlinedInput-input": {
              fontSize: "0.875rem",
              fontWeight: 500,
            },
          }}
          aria-label={accessibilityConstants.ariaLabels.searchInput}
        />

        {/* Modern Stats Badges */}
        <Stack direction="row" spacing={ds.spacing["2"]} flexWrap="wrap">
          <Chip
            label={`${selectedItems}/${totalItems} ${textContent.selection.selectedItems}`}
            icon={<CheckIcon sx={{ fontSize: 16 }} />}
            sx={{
              height: 28,
              fontWeight: 600,
              fontSize: "0.8125rem",
              background: alpha(ds.colors.primary.main, 0.1),
              color: ds.colors.primary.main,
              border: `1px solid ${alpha(ds.colors.primary.main, 0.2)}`,
              borderRadius: `${ds.borderRadius.md}px`,
            }}
          />
          {selectedItems > 0 && (
            <Chip
              label={`%${selectionPercentage} Tamamlandı`}
              color={selectionPercentage === 100 ? "success" : "default"}
              sx={{
                height: 28,
                fontWeight: 600,
                fontSize: "0.8125rem",
                borderRadius: `${ds.borderRadius.md}px`,
              }}
            />
          )}
        </Stack>
      </Stack>
    </CardV2>
  );
};
