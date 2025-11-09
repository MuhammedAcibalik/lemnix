/**
 * @fileoverview Custom hook for managing keyboard shortcuts
 * @module useKeyboardShortcuts
 * @version 1.0.0
 */

import { useEffect, useCallback } from "react";
import {
  NavigationHandlers,
  CommandPaletteItem,
  KeyboardShortcutMap,
} from "../types";
import { keyboardShortcuts } from "../constants";

/**
 * Custom hook for managing keyboard shortcuts
 */
export const useKeyboardShortcuts = (
  handlers: NavigationHandlers,
  commandPaletteOpen: boolean,
  filteredItems: CommandPaletteItem[],
  selectedIndex: number,
  onCommandPaletteToggle: (open: boolean) => void,
  onSelectedIndexChange: (index: number) => void,
  onItemExecute: (item: CommandPaletteItem) => void,
) => {
  // Keyboard event handler
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Global shortcuts (Ctrl/Cmd + key)
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case "k":
            event.preventDefault();
            onCommandPaletteToggle(!commandPaletteOpen);
            break;
          case "h":
            event.preventDefault();
            handlers.onPageChange("home");
            break;
          case "d":
            event.preventDefault();
            handlers.onPageChange("dashboard");
            break;
          case "l":
            event.preventDefault();
            handlers.onPageChange("cutting-list");
            break;
          case "e":
            event.preventDefault();
            handlers.onPageChange("enterprise-optimization");
            break;
          case "s":
            event.preventDefault();
            handlers.onPageChange("statistics");
            break;
          case "p":
            event.preventDefault();
            handlers.onPageChange("production-plan");
            break;
          case "m":
            event.preventDefault();
            handlers.onPageChange("profile-management");
            break;
          case ",":
            event.preventDefault();
            handlers.onPageChange("settings");
            break;
        }
      }

      // Command palette shortcuts
      if (commandPaletteOpen) {
        switch (event.key) {
          case "ArrowDown":
            event.preventDefault();
            onSelectedIndexChange(
              selectedIndex < filteredItems.length - 1 ? selectedIndex + 1 : 0,
            );
            break;
          case "ArrowUp":
            event.preventDefault();
            onSelectedIndexChange(
              selectedIndex > 0 ? selectedIndex - 1 : filteredItems.length - 1,
            );
            break;
          case "Enter":
            event.preventDefault();
            if (filteredItems[selectedIndex]) {
              onItemExecute(filteredItems[selectedIndex]);
            }
            break;
          case "Escape":
            event.preventDefault();
            onCommandPaletteToggle(false);
            break;
        }
      }
    },
    [
      handlers,
      commandPaletteOpen,
      filteredItems,
      selectedIndex,
      onCommandPaletteToggle,
      onSelectedIndexChange,
      onItemExecute,
    ],
  );

  // Register keyboard event listener
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Get shortcut description for a given key combination
  const getShortcutDescription = useCallback((key: string): string => {
    return keyboardShortcuts[key]?.description || "";
  }, []);

  // Check if a shortcut is available
  const isShortcutAvailable = useCallback((key: string): boolean => {
    return key in keyboardShortcuts;
  }, []);

  return {
    getShortcutDescription,
    isShortcutAvailable,
    keyboardShortcuts,
  };
};
