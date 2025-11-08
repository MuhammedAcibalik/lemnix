/**
 * Command Palette Types - Design System v2.0
 */

import { SvgIconComponent } from '@mui/icons-material';

export interface CommandItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly category: string;
  readonly icon: SvgIconComponent;
  readonly shortcut?: string;
  readonly action: () => void;
}

export interface CommandPaletteState {
  readonly isOpen: boolean;
  readonly searchQuery: string;
  readonly selectedIndex: number;
  readonly filteredItems: CommandItem[];
}

export interface AppBarProps {
  readonly onMenuToggle: () => void;
  readonly onCommandPaletteToggle: () => void;
  readonly onUserMenuToggle: (event: React.MouseEvent<HTMLElement>) => void;
  readonly onNotificationsToggle: () => void;
  readonly isDrawerOpen: boolean;
  readonly isCommandPaletteOpen: boolean;
  readonly isUserMenuOpen: boolean;
  readonly isNotificationsOpen: boolean;
  readonly userMenuAnchor: HTMLElement | null;
  readonly notificationsAnchor: HTMLElement | null;
  // Additional fields for compatibility
  readonly isMobile?: boolean;
  readonly currentPageItem?: NavigationItem;
  readonly onToggleSidebar?: () => void;
  readonly onCommandPaletteOpen?: () => void;
  readonly onUserMenuOpen?: (event: React.MouseEvent<HTMLElement>) => void;
}

export interface NavigationItem {
  readonly id: string;
  readonly title: string;
  readonly path: string;
  readonly icon: React.ReactElement;
  readonly label?: string;
}

export interface CategoryHeaderProps {
  readonly title: string;
  readonly icon: React.ReactElement;
  readonly count?: number;
  readonly description?: string;
  // Additional fields for compatibility
  readonly category?: string;
  readonly theme?: 'light' | 'dark';
  readonly itemCount?: number;
}

export interface UserMenuProps {
  readonly anchor: HTMLElement | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onProfileClick: () => void;
  readonly onSettingsClick: () => void;
  readonly onLogout: () => void;
  // Additional fields for compatibility
  readonly anchorEl?: HTMLElement | null;
}

export interface NavigationHandlers {
  readonly onMenuToggle: () => void;
  readonly onCommandPaletteToggle: (open: boolean) => void;
  readonly onUserMenuToggle: (anchor: HTMLElement | null) => void;
  readonly onNotificationsToggle: (anchor: HTMLElement | null) => void;
  readonly onCloseAll: () => void;
  // Additional fields for compatibility
  readonly onPageChange?: (page: string) => void;
}

export interface CommandPaletteItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly category: string;
  readonly icon: React.ReactElement;
  readonly shortcut?: string;
  readonly action: () => void;
}

export interface KeyboardShortcutMap {
  readonly [key: string]: {
    readonly key: string;
    readonly description: string;
    readonly action: () => void;
  };
}

export interface NavigationState {
  readonly isDrawerOpen: boolean;
  readonly isCommandPaletteOpen: boolean;
  readonly isUserMenuOpen: boolean;
  readonly isNotificationsOpen: boolean;
  readonly userMenuAnchor: HTMLElement | null;
  readonly notificationsAnchor: HTMLElement | null;
  readonly searchQuery: string;
  readonly selectedIndex: number;
  readonly filteredItems: CommandItem[];
  // Additional fields for compatibility
  readonly commandPaletteOpen?: boolean;
}

export interface ModernNavigationProps {
  readonly onMenuToggle: () => void;
  readonly onCommandPaletteToggle: () => void;
  readonly onUserMenuToggle: (event: React.MouseEvent<HTMLElement>) => void;
  readonly onNotificationsToggle: () => void;
  readonly isDrawerOpen: boolean;
  readonly isCommandPaletteOpen: boolean;
  readonly isUserMenuOpen: boolean;
  readonly isNotificationsOpen: boolean;
  readonly userMenuAnchor: HTMLElement | null;
  readonly notificationsAnchor: HTMLElement | null;
  // Additional fields for compatibility
  readonly activePage?: string;
  readonly onPageChange?: (page: string) => void;
  readonly onToggleSidebar?: () => void;
}