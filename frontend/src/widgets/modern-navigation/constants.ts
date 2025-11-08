/**
 * Command Palette Constants - Design System v2.0
 * Clean, minimal, enterprise-grade command interface
 */

import {
  Home as HomeIcon,
  ListAlt as ListAltIcon,
  AutoAwesome as SparklesIcon,
  Analytics as AnalyticsIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  CalendarToday as CalendarTodayIcon,
  AccountTree as AccountTreeIcon,
} from '@mui/icons-material';
import type { CommandItem } from './types';

/**
 * Build command palette items with navigation handler
 * Enterprise pattern: Factory function for dynamic actions
 * 
 * Only real pages - clean, minimal, purposeful
 */
export const buildCommandPaletteItems = (onPageChange: (page: string) => void): CommandItem[] => [
  {
    id: 'home',
    title: 'Ana Sayfa',
    description: 'Genel bakış ve sistem durumu',
    category: 'Navigasyon',
    icon: HomeIcon,
    shortcut: 'Ctrl+H',
    action: () => onPageChange('home'),
  },
  {
    id: 'cutting-list',
    title: 'Kesim Listesi',
    description: 'Kesim planları ve iş emri yönetimi',
    category: 'Navigasyon',
    icon: ListAltIcon,
    shortcut: 'Ctrl+L',
    action: () => onPageChange('cutting-list'),
  },
  {
    id: 'enterprise-optimization',
    title: 'Enterprise Optimizasyon',
    description: 'AI destekli akıllı optimizasyon algoritmaları',
    category: 'Navigasyon',
    icon: SparklesIcon,
    shortcut: 'Ctrl+E',
    action: () => onPageChange('enterprise-optimization'),
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Optimizasyon performans özeti ve gerçek zamanlı izleme',
    category: 'Navigasyon',
    icon: DashboardIcon,
    shortcut: 'Ctrl+D',
    action: () => onPageChange('dashboard'),
  },
  {
    id: 'statistics',
    title: 'İstatistikler',
    description: 'Detaylı analiz ve performans raporları',
    category: 'Navigasyon',
    icon: AnalyticsIcon,
    shortcut: 'Ctrl+S',
    action: () => onPageChange('statistics'),
  },
  {
    id: 'production-plan',
    title: 'Üretim Planı',
    description: 'Haftalık üretim planlarını yönetin ve takip edin',
    category: 'Navigasyon',
    icon: CalendarTodayIcon,
    shortcut: 'Ctrl+P',
    action: () => onPageChange('production-plan'),
  },
  {
    id: 'profile-management',
    title: 'Profil Yönetimi',
    description: 'Profil tanımları ve iş emri eşleştirmelerini yönetin',
    category: 'Navigasyon',
    icon: AccountTreeIcon,
    shortcut: 'Ctrl+M',
    action: () => onPageChange('profile-management'),
  },
  {
    id: 'settings',
    title: 'Ayarlar',
    description: 'Sistem ayarları ve konfigürasyon',
    category: 'Navigasyon',
    icon: SettingsIcon,
    shortcut: 'Ctrl+,',
    action: () => onPageChange('settings'),
  },
];

/**
 * Static command palette items (backward compatibility)
 * Uses no-op actions
 */
export const commandPaletteItems: CommandItem[] = buildCommandPaletteItems(() => {});

export const commandPaletteMessages = {
  title: 'Komut Paleti',
  subtitle: 'Hızlı arama ve navigasyon için gelişmiş komut arayüzü',
  searchPlaceholder: 'Komut ara... (örn: optimizasyon, kesim, rapor)',
  noResults: 'Komut bulunamadı',
  noResultsSubtitle: 'Farklı anahtar kelimeler deneyin',
  resultsFound: 'komut bulundu',
  searchResults: 'arama sonucu',
  navigation: {
    brandTooltip: 'LEMNİX - Alüminyum Kesim Optimizasyonu',
    menuTooltip: 'Menü',
    closeDrawer: 'Menüyü kapat',
    openDrawer: 'Menüyü aç',
    commandPaletteTooltip: 'Komut paletini aç',
    notificationsTooltip: 'Bildirimler',
    userMenuTooltip: 'Kullanıcı menüsü',
  },
  userMenu: {
    profile: 'Profil',
    settings: 'Ayarlar',
    logout: 'Çıkış Yap',
  },
} as const;

// Backward compatibility aliases
export const messages = commandPaletteMessages;

/**
 * Styling constants for modern navigation
 */
export const stylingConstants = {
  appBarHeight: 64,
  drawerWidth: 280,
  commandPaletteMaxWidth: 600,
  zIndex: {
    drawer: 1200,
    appBar: 1201,
    commandPalette: 1300,
    userMenu: 1250,
  },
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
  },
} as const;

/**
 * Keyboard shortcuts configuration
 */
export const keyboardShortcuts = {
  commandPalette: 'Ctrl+K',
  home: 'Ctrl+H',
  dashboard: 'Ctrl+D',
  cuttingList: 'Ctrl+L',
  enterpriseOptimization: 'Ctrl+E',
  statistics: 'Ctrl+S',
  productionPlan: 'Ctrl+P',
  profileManagement: 'Ctrl+M',
  settings: 'Ctrl+,',
} as const;
