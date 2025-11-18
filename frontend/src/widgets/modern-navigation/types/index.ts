/**
 * @fileoverview Type definitions for Modern Navigation
 * @module ModernNavigationTypes
 * @version 1.0.0
 */

import React from "react";

// ============================================================================
// MAIN COMPONENT PROPS
// ============================================================================

export interface ModernNavigationProps {
  activePage: string;
  onPageChange: (page: string) => void;
  onToggleSidebar?: () => void;
}

// ============================================================================
// NAVIGATION DATA STRUCTURES
// ============================================================================

export interface NavigationItem {
  id: string;
  label: string;
  /** Route path, e.g. "/cutting-list" */
  path: string;
  icon: React.ComponentType<{
    className?: string;
    sx?: Record<string, unknown>;
  }>;
  description: string;
  category: "main" | "tools" | "settings";
  shortcut?: string;
  badge?: number;
  isNew?: boolean;
  isPro?: boolean;
  keywords?: string[];
}

export interface CommandPaletteItem {
  id: string;
  label: string;
  icon: React.ComponentType<{
    className?: string;
    sx?: Record<string, unknown>;
  }>;
  description: string;
  action: () => void;
  category: string;
  shortcut?: string;
  isRecent?: boolean;
  isFavorite?: boolean;
  keywords?: string[];
}

export interface CommandItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly category: string;
  readonly icon: React.ComponentType<{
    className?: string;
    sx?: Record<string, unknown>;
  }>;
  readonly shortcut?: string;
  readonly action: () => void;
}

// ============================================================================
// CATEGORY AND THEME TYPES
// ============================================================================

export type NavigationCategory = "main" | "tools" | "settings";

export type CommandCategory =
  | "Navigasyon"
  | "Hızlı Eylemler"
  | "Sistem"
  | "Yardım";

export interface CategoryTheme {
  color: string;
  backgroundColor: string;
  icon: React.ComponentType<{
    className?: string;
    sx?: Record<string, unknown>;
  }>;
}

export interface CategoryThemes {
  [key: string]: CategoryTheme;
}

// ============================================================================
// STATE MANAGEMENT TYPES
// ============================================================================

export interface NavigationState {
  commandPaletteOpen: boolean;
  userMenuAnchor: HTMLElement | null;
}

export interface NavigationHandlers {
  onPageChange: (page: string) => void;
  onToggleSidebar?: () => void;
  onCommandPaletteToggle: (open: boolean) => void;
  onUserMenuToggle: (anchor: HTMLElement | null) => void;
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

export interface AppBarProps {
  isMobile: boolean;
  currentPageItem: NavigationItem | undefined;
  /** Active page id (e.g. 'home', 'cutting-list') for fallback resolution */
  activePage?: string;
  onToggleSidebar?: () => void;
  onCommandPaletteOpen: () => void;
  onUserMenuOpen: (event: React.MouseEvent<HTMLElement>) => void;
  userMenuAnchor: HTMLElement | null;
}

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onCommandSelect?: (command: CommandItem) => void;
}

export interface UserMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

export interface SearchHeaderProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  filteredItemsCount: number;
}

export interface CommandListProps {
  filteredItems: CommandPaletteItem[];
  groupedItems: Record<string, CommandPaletteItem[]>;
  categoryThemes: CategoryThemes;
  selectedIndex: number;
  onItemSelect: (item: CommandPaletteItem) => void;
}

export interface CommandItemProps {
  item: CommandPaletteItem;
  categoryTheme: CategoryTheme;
  isSelected: boolean;
  onSelect: () => void;
}

export interface CategoryHeaderProps {
  category: string;
  theme: CategoryTheme;
  itemCount: number;
}

export interface FooterProps {
  filteredItemsCount: number;
  searchQuery: string;
}

// ============================================================================
// KEYBOARD SHORTCUT TYPES
// ============================================================================

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
}

export interface KeyboardShortcutMap {
  [key: string]: KeyboardShortcut;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface FilteredItemsResult {
  filteredItems: CommandPaletteItem[];
  groupedItems: Record<string, CommandPaletteItem[]>;
  totalCount: number;
}

export interface SearchResult {
  query: string;
  results: CommandPaletteItem[];
  hasResults: boolean;
}

// ============================================================================
// THEME AND STYLING TYPES
// ============================================================================

export interface NavigationTheme {
  colors: {
    primary: Record<number, string>;
    secondary: Record<number, string>;
    success: Record<number, string>;
    warning: Record<number, string>;
    error: Record<number, string>;
    info: Record<number, string>;
    neutral: Record<number, string>;
  };
  gradients: {
    primary: string;
    secondary: string;
  };
}

export interface NavigationStyles {
  appBar: Record<string, unknown>;
  toolbar: Record<string, unknown>;
  currentPageIndicator: Record<string, unknown>;
  commandPalette: Record<string, unknown>;
  searchHeader: Record<string, unknown>;
  commandList: Record<string, unknown>;
  userMenu: Record<string, unknown>;
}

// ============================================================================
// EVENT HANDLER TYPES
// ============================================================================

export type PageChangeHandler = (page: string) => void;

export type CommandPaletteToggleHandler = (open: boolean) => void;

export type SearchQueryChangeHandler = (query: string) => void;

export type SelectedIndexChangeHandler = (index: number) => void;

export type UserMenuToggleHandler = (anchor: HTMLElement | null) => void;

export type KeyboardEventHandler = (event: KeyboardEvent) => void;

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface NavigationConfig {
  brandName: string;
  domain: string;
  defaultActivePage: string;
  enableKeyboardShortcuts: boolean;
  enableCommandPalette: boolean;
  enableUserMenu: boolean;
  maxSearchResults: number;
  debounceSearchMs: number;
}

export interface AppConfig {
  brandName: string;
  domain: string;
  version: string;
  environment: "development" | "production" | "test";
}
