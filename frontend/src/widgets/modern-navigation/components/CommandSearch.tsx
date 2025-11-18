/**
 * Command Search - Design System v2.0
 * Clean search input with keyboard shortcuts
 */

import React, { useRef, useEffect } from "react";
import { Box, InputBase, IconButton, alpha } from "@mui/material";
import { Search as SearchIcon, Close as CloseIcon } from "@mui/icons-material";
import { useDesignSystem } from "@/shared/hooks";

export interface CommandSearchProps {
  value: string;
  onChange: (value: string) => void;
  onClose?: () => void;
}

export const CommandSearch: React.FC<CommandSearchProps> = ({
  value,
  onChange,
  onClose,
}) => {
  const ds = useDesignSystem();
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, []);

  return (
    <Box
      sx={{
        position: "relative",
        p: ds.spacing["3"], // 16px → 12px KOMPAKT
        minHeight: 72, // 12 + 40 + 12 + 8 (border)
        borderBottom: `1px solid ${alpha(ds.colors.neutral[200], 0.5)}`,
        background: alpha(ds.colors.surface.elevated1, 0.8),
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Close Button - Kompakt */}
      {onClose && (
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: ds.spacing["2"], // 8px
            right: ds.spacing["2"], // 8px
            width: 24, // 28px → 24px
            height: 24,
            borderRadius: `${ds.borderRadius.sm}px`,
            color: ds.colors.text.secondary,
            transition: ds.transitions.fast,
            "&:hover": {
              backgroundColor: alpha(ds.colors.neutral[500], 0.1),
              color: ds.colors.text.primary,
            },
            "&:focus-visible": {
              outline: `2px solid ${ds.colors.primary.main}`,
              outlineOffset: "2px",
            },
          }}
          aria-label="Close command palette"
        >
          <CloseIcon sx={{ fontSize: 14 }} />
        </IconButton>
      )}

      {/* Search Input - Kompakt, Clean */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          height: 40, // 42px → 40px
          px: ds.spacing["3"], // 16px → 12px
          backgroundColor: ds.colors.background.paper,
          borderRadius: `${ds.borderRadius.lg}px`,
          border: `1px solid ${alpha(ds.colors.neutral[300], 0.3)}`,
          boxShadow: ds.shadows.soft.md,
          transition: ds.transitions.fast,
          "&:focus-within": {
            borderColor: ds.colors.primary.main,
            boxShadow: `0 0 0 2px ${alpha(ds.colors.primary.main, 0.15)}`,
          },
        }}
      >
        <SearchIcon
          sx={{
            color: ds.colors.text.secondary,
            fontSize: 18,
            mr: ds.spacing["2"],
          }}
        />
        <InputBase
          ref={inputRef}
          placeholder="Komut ara..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          sx={{
            flex: 1,
            fontSize: "clamp(0.875rem, 1vw + 0.5rem, 1rem)",
            fontWeight: ds.typography.fontWeight.medium,
            "& input": {
              "&::placeholder": {
                color: ds.colors.text.secondary,
                opacity: 0.7,
              },
            },
          }}
        />
      </Box>
    </Box>
  );
};
