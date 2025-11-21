/**
 * @fileoverview Custom hook for managing navigation state
 * @module useNavigationState
 * @version 1.0.0
 */

import { useState, useCallback } from "react";
import { NavigationState, NavigationHandlers } from "../types/index";

/**
 * Props interface for useNavigationState hook
 * Only includes props that the hook actually uses
 */
interface UseNavigationStateProps {
  readonly onPageChange: (page: string) => void;
  readonly onToggleSidebar?: () => void;
}

/**
 * Custom hook for managing navigation state
 */
export const useNavigationState = ({
  onPageChange,
  onToggleSidebar,
}: UseNavigationStateProps) => {
  // State
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<HTMLElement | null>(
    null,
  );

  // Handlers
  const handleCommandPaletteToggle = useCallback((open: boolean) => {
    setCommandPaletteOpen(open);
  }, []);

  const handleUserMenuToggle = useCallback((anchor: HTMLElement | null) => {
    setUserMenuAnchor(anchor);
  }, []);

  // Navigation state
  const state: NavigationState = {
    commandPaletteOpen,
    userMenuAnchor,
  };

  // Navigation handlers
  const handlers: NavigationHandlers = {
    onPageChange,
    onToggleSidebar,
    onCommandPaletteToggle: handleCommandPaletteToggle,
    onUserMenuToggle: handleUserMenuToggle,
  };

  return {
    // State
    ...state,

    // Setters
    setCommandPaletteOpen,
    setUserMenuAnchor,

    // Handlers
    ...handlers,

    // Convenience methods
    openCommandPalette: () => handleCommandPaletteToggle(true),
    closeCommandPalette: () => handleCommandPaletteToggle(false),
    openUserMenu: (event: React.MouseEvent<HTMLElement>) =>
      handleUserMenuToggle(event.currentTarget),
    closeUserMenu: () => handleUserMenuToggle(null),
  };
};
