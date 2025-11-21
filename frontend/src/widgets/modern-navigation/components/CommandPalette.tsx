/**
 * Command Palette - Design System v2.0
 * Modern Industrial Command Interface
 *
 * Features:
 * - Clean, minimal design
 * - Fast keyboard navigation
 * - Semantic categorization
 * - Responsive layout
 * - Accessibility first
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Dialog, DialogProps, Box, Fade, alpha } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useDesignSystem, useResponsive } from "@/shared/hooks";
import { CommandSearch } from "./CommandSearch";
import { CommandResults } from "./CommandResults";
import { CommandFooter } from "./CommandFooter";
import { buildCommandPaletteItems } from "../constants";
import type { CommandItem as CommandItemType } from "../types";

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onCommandSelect?: (command: CommandItemType) => void;
  onPageChange?: (page: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onClose,
  onCommandSelect,
  onPageChange,
}) => {
  const ds = useDesignSystem();
  // Use project's responsive hook system
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Build items with navigation handler - Enterprise pattern
  const commandPaletteItems = useMemo(
    () => buildCommandPaletteItems(onPageChange || (() => {})),
    [onPageChange],
  );

  const [filteredItems, setFilteredItems] =
    useState<CommandItemType[]>(commandPaletteItems);

  const handleCommandSelect = useCallback(
    (command: CommandItemType) => {
      if (onCommandSelect) {
        onCommandSelect(command);
      }
      onClose();
    },
    [onCommandSelect, onClose],
  );

  // Filter items based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredItems(commandPaletteItems);
    } else {
      const filtered = commandPaletteItems.filter(
        (item: CommandItemType) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredItems(filtered);
    }
    setSelectedIndex(0);
  }, [searchQuery, commandPaletteItems]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!open) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredItems.length - 1 ? prev + 1 : 0,
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredItems.length - 1,
          );
          break;
        case "Enter":
          event.preventDefault();
          if (filteredItems[selectedIndex]) {
            handleCommandSelect(filteredItems[selectedIndex]);
          }
          break;
        case "Escape":
          event.preventDefault();
          onClose();
          break;
      }
    },
    [open, selectedIndex, filteredItems, onClose, handleCommandSelect],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  // Responsive dimensions - Fluid scaling for all resolutions
  const getDimensions = () => {
    if (isMobile) {
      return {
        width: "clamp(320px, 95vw, 95vw)",
        height: "clamp(400px, 85vh, 85vh)",
        maxWidth: "95vw",
        maxHeight: "85vh",
      };
    }

    // Desktop: Fluid scaling from tablet to 4K
    return {
      width: "clamp(600px, min(720px, 90vw), 900px)",
      height: "clamp(500px, min(580px, 80vh), 700px)",
      maxWidth: { sm: "600px", md: "720px", lg: "800px", xl: "900px" },
      maxHeight: { sm: "500px", md: "580px", lg: "650px", xl: "700px" },
    };
  };

  const dimensions = getDimensions();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullScreen={false}
      PaperProps={{
        sx: {
          width: dimensions.width,
          height: dimensions.height,
          maxWidth: dimensions.maxWidth,
          maxHeight: dimensions.maxHeight,
          margin: 0,
          borderRadius: `${ds.borderRadius.modal}px`,
          boxShadow: ds.shadows.crisp.xl,
          overflow: "hidden",
          background: ds.colors.background.paper,
          border: `1px solid ${alpha(ds.colors.neutral[300], 0.2)}`,
        },
      }}
      sx={{
        "& .MuiBackdrop-root": {
          backgroundColor: alpha(ds.colors.neutral[900], 0.4),
          backdropFilter: "blur(12px) saturate(180%)", // Enhanced glassmorphism
        },
      }}
    >
      <Fade in={open} timeout={200}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            background: ds.colors.background.paper,
          }}
        >
          {/* Search Input */}
          <CommandSearch
            value={searchQuery}
            onChange={handleSearchChange}
            onClose={onClose}
          />

          {/* Results */}
          <CommandResults
            items={filteredItems}
            selectedIndex={selectedIndex}
            onItemSelect={handleCommandSelect}
          />

          {/* Footer */}
          <CommandFooter
            totalItems={filteredItems.length}
            selectedIndex={selectedIndex}
          />
        </Box>
      </Fade>
    </Dialog>
  );
};
