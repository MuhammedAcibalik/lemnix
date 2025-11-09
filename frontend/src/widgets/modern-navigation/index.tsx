/**
 * @fileoverview Modern Navigation - Main Component
 * @module ModernNavigation
 * @version 2.0.0 - Enterprise Grade Modular Design
 */

import React from "react";
import { useTheme, useMediaQuery } from "@mui/material";

// Import modular components
import { AppBar } from "./components/AppBar";
import { CommandPalette } from "./components/CommandPalette";
import { UserMenu } from "./components/UserMenu";

// Import hooks
import { useNavigationState } from "./hooks/useNavigationState";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";

// Import types
import { ModernNavigationProps } from "./types";

// Import constants
import { navigationItems } from "./constants/index";

/**
 * Modern Navigation Component
 *
 * Enterprise-grade navigation with modular architecture
 */
export const ModernNavigation: React.FC<ModernNavigationProps> = ({
  activePage,
  onPageChange,
  onToggleSidebar,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Custom hooks for state and functionality
  const {
    commandPaletteOpen,
    userMenuAnchor,
    openCommandPalette,
    closeCommandPalette,
    openUserMenu,
    closeUserMenu,
  } = useNavigationState({
    activePage,
    onPageChange,
    onToggleSidebar,
  });

  const { getShortcutDescription, isShortcutAvailable } = useKeyboardShortcuts(
    {
      onPageChange,
      onToggleSidebar,
      onCommandPaletteToggle: (open) =>
        open ? openCommandPalette() : closeCommandPalette(),
      onUserMenuToggle: (anchor) =>
        anchor
          ? openUserMenu({
              currentTarget: anchor,
            } as React.MouseEvent<HTMLElement>)
          : closeUserMenu(),
    },
    commandPaletteOpen,
    openCommandPalette,
  );

  // Get current page item
  const currentPageItem = navigationItems.find(
    (item) => item.id === activePage,
  );

  return (
    <>
      {/* App Bar */}
      <AppBar
        isMobile={isMobile}
        currentPageItem={currentPageItem}
        onToggleSidebar={onToggleSidebar}
        onCommandPaletteOpen={openCommandPalette}
        onUserMenuOpen={openUserMenu}
        userMenuAnchor={userMenuAnchor}
      />

      {/* Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onClose={closeCommandPalette}
        onPageChange={onPageChange}
        onCommandSelect={(command) => {
          command.action(); // Execute command action
          closeCommandPalette();
        }}
      />

      {/* User Menu */}
      <UserMenu anchorEl={userMenuAnchor} onClose={closeUserMenu} />
    </>
  );
};

export default ModernNavigation;
