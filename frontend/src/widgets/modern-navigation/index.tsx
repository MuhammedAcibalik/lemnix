/**
 * @fileoverview Modern Navigation - Main Component
 * @module ModernNavigation
 * @version 2.0.0 - Enterprise Grade Modular Design
 */

import React from "react";

// Import modular components
import { AppBar } from "./components/AppBar";
import { CommandPalette } from "./components/CommandPalette";
import { UserMenu } from "./components/UserMenu";

// Import hooks
import { useNavigationState } from "./hooks/useNavigationState";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";

// Import responsive hooks from project
import { useResponsive } from "@/shared/hooks";

// Import types
import { ModernNavigationProps } from "./types";
import type { UserMenuProps } from "./types/index";

// Import constants
import { navigationItems } from "./constants/index";

/**
 * Modern Navigation Component
 *
 * Enterprise-grade navigation with modular architecture
 * ✅ Fully responsive using project's responsive hook system
 */
export const ModernNavigation: React.FC<ModernNavigationProps> = ({
  activePage,
  onPageChange,
  onToggleSidebar,
}) => {
  // Use project's responsive hook system instead of MUI
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // Custom hooks for state and functionality
  // Note: onPageChange is required in ModernNavigationProps, so it's always defined
  const {
    commandPaletteOpen,
    userMenuAnchor,
    openCommandPalette,
    closeCommandPalette,
    openUserMenu,
    closeUserMenu,
  } = useNavigationState({
    onPageChange: onPageChange!, // Required prop, always defined
    onToggleSidebar,
  });

  // Keyboard shortcuts hook - provides utility functions only
  // Command palette keyboard navigation is handled inside CommandPalette component
  const { getShortcutDescription, isShortcutAvailable } = useKeyboardShortcuts(
    {
      onMenuToggle: onToggleSidebar || (() => {}), // Mobile menu toggle
      onCommandPaletteToggle: (open) =>
        open ? openCommandPalette() : closeCommandPalette(),
      onUserMenuToggle: (anchor) =>
        anchor
          ? openUserMenu({
              currentTarget: anchor,
            } as React.MouseEvent<HTMLElement>)
          : closeUserMenu(),
      onNotificationsToggle: () => {}, // Notifications not implemented yet
      onCloseAll: () => {
        closeCommandPalette();
        closeUserMenu();
      },
    },
    commandPaletteOpen,
    [], // filteredItems - managed inside CommandPalette
    0, // selectedIndex - managed inside CommandPalette
    (open) => (open ? openCommandPalette() : closeCommandPalette()), // onCommandPaletteToggle
    () => {}, // onSelectedIndexChange - managed inside CommandPalette
    () => {}, // onItemExecute - managed inside CommandPalette
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
        activePage={activePage}
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
