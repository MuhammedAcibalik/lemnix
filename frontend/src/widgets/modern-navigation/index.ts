/**
 * @fileoverview Modern Navigation - Public API
 * @module widgets/modern-navigation
 * @version 2.0.0 - Design System v2.0
 */

// Main Components
export { ModernNavigation } from "./index.tsx";
export { ModernNavigation as default } from "./index.tsx";

// Command Palette Components
export { CommandPalette } from "./components/CommandPalette";
export { CommandSearch } from "./components/CommandSearch";
export { CommandResults } from "./components/CommandResults";
export { CommandItem } from "./components/CommandItem";
export { CommandFooter } from "./components/CommandFooter";

// Types
export type {
  CommandPaletteState,
  AppBarProps,
  CategoryHeaderProps,
  UserMenuProps,
  NavigationHandlers,
  CommandPaletteItem,
  KeyboardShortcutMap,
  NavigationState,
  ModernNavigationProps,
} from "./types";

// Constants
export { commandPaletteItems, commandPaletteMessages } from "./constants";
