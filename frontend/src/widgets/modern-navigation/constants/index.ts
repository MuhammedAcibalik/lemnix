/**
 * @fileoverview Constants for Modern Navigation
 * @module ModernNavigationConstants
 * @version 1.0.0
 */

import {
  Home as HomeIcon,
  ListAlt as ListIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  Analytics as AnalyticsIcon,
  CheckCircle as CheckCircleIcon,
  Language as LanguageIcon,
  Help as HelpIcon,
  ContactSupport as SupportIcon,
  Feedback as FeedbackIcon,
  Timeline as TimelineIcon,
  AutoAwesome as SparkleIcon,
  Settings as SettingsIcon2,
  Psychology as PsychologyIcon,
  Science as ScienceIcon,
  Speed as SpeedIcon,
  Tune as TuneIcon,
  Build as BuildIcon,
  Inventory as InventoryIcon,
  SmartToy as SmartToyIcon,
  CalendarToday as CalendarTodayIcon,
  AccountTree as AccountTreeIcon,
} from "@mui/icons-material";

// Import PNG optimization icon
import { OptimizationPNGIcon } from "@/shared/ui/icons/OptimizationPNGIcon";
import { alpha } from "@mui/material";
import { colors } from "@/App/theme/designSystem.v2";
import { appConfig } from "@/shared/config/legacy/appConfig";
import type {
  NavigationItem,
  CommandPaletteItem,
  CategoryThemes,
} from "../types/index";

// ============================================================================
// NAVIGATION ITEMS
// ============================================================================

export const navigationItems: NavigationItem[] = [
  {
    id: "home",
    label: "Ana Sayfa",
    path: "/",
    icon: HomeIcon,
    description: "Genel bakış ve sistem durumu",
    category: "main",
    shortcut: "Ctrl+H",
    keywords: ["ana", "home", "genel"],
  },
  {
    id: "cutting-list",
    label: "Kesim Listesi",
    path: "/cutting-list",
    icon: ListIcon,
    description: "Akıllı kesim listesi yönetimi",
    category: "main",
    shortcut: "Ctrl+L",
    keywords: ["kesim", "liste", "cutting", "list"],
  },
  {
    id: "enterprise-optimization",
    label: "Enterprise Optimizasyon",
    path: "/enterprise-optimization",
    icon: PsychologyIcon,
    description: "AI destekli akıllı optimizasyon algoritmaları",
    category: "tools",
    shortcut: "Ctrl+E",
    keywords: [
      "optimizasyon",
      "enterprise",
      "algoritma",
      "optimization",
      "ai",
      "akıllı",
    ],
  },
  {
    id: "statistics",
    label: "İstatistikler",
    path: "/statistics",
    icon: AnalyticsIcon,
    description: "Detaylı analiz ve performans raporları",
    category: "tools",
    shortcut: "Ctrl+S",
    keywords: ["istatistik", "analiz", "rapor", "statistics"],
  },
  {
    id: "production-plan",
    label: "Üretim Planı",
    path: "/production-plan",
    icon: CalendarTodayIcon,
    description: "Haftalık üretim planlarını yönetin ve takip edin",
    category: "main",
    shortcut: "Ctrl+P",
    keywords: ["üretim", "plan", "haftalık", "production", "planning"],
  },
  {
    id: "profile-management",
    label: "Profil Yönetimi",
    path: "/profile-management",
    icon: AccountTreeIcon,
    description: "Profil tanımları ve iş emri eşleştirmelerini yönetin",
    category: "main",
    shortcut: "Ctrl+M",
    keywords: [
      "profil",
      "yönetim",
      "tanım",
      "eşleştirme",
      "profile",
      "management",
      "mapping",
    ],
  },
  {
    id: "settings",
    label: "Ayarlar",
    path: "/settings",
    icon: TuneIcon,
    description: "Sistem ayarları ve konfigürasyon",
    category: "settings",
    shortcut: "Ctrl+,",
    keywords: ["ayarlar", "settings", "konfigürasyon", "config"],
  },
];

// ============================================================================
// ADVANCED QUICK ACTIONS
// ============================================================================

export const advancedQuickActions: CommandPaletteItem[] = [
  // Navigasyon kategorisi
  {
    id: "new-optimization",
    label: "Yeni Optimizasyon",
    icon: OptimizationPNGIcon,
    description: "Yeni bir optimizasyon projesi başlat",
    action: () => console.log("New optimization"),
    category: "Hızlı Eylemler",
    shortcut: "Ctrl+N",
    isFavorite: true,
  },
  {
    id: "export-results",
    label: "Sonuçları Dışa Aktar",
    icon: TrendingUpIcon,
    description: "Optimizasyon sonuçlarını PDF/Excel olarak dışa aktar",
    action: () => console.log("Export results"),
    category: "Hızlı Eylemler",
    shortcut: "Ctrl+Shift+E",
  },
  {
    id: "view-analytics",
    label: "Analitikleri Görüntüle",
    icon: AnalyticsIcon,
    description: "Detaylı performans analizlerini görüntüle",
    action: () => console.log("View analytics"),
    category: "Hızlı Eylemler",
    shortcut: "Ctrl+A",
  },

  // Sistem kategorisi
  {
    id: "system-status",
    label: "Sistem Durumu",
    icon: CheckCircleIcon,
    description: "Sistem sağlık durumu ve performans metrikleri",
    action: () => console.log("System status"),
    category: "Sistem",
    shortcut: "Ctrl+Shift+S",
  },
  {
    id: "theme-toggle",
    label: "Tema Değiştir",
    icon: AnalyticsIcon,
    description: "Açık/koyu tema arasında geçiş yap",
    action: () => console.log("Toggle theme"),
    category: "Sistem",
    shortcut: "Ctrl+Shift+T",
  },
  {
    id: "language-change",
    label: "Dil Değiştir",
    icon: LanguageIcon,
    description: "Uygulama dilini değiştir",
    action: () => console.log("Change language"),
    category: "Sistem",
    shortcut: "Ctrl+Shift+L",
  },

  // Yardım kategorisi
  {
    id: "help-center",
    label: "Yardım Merkezi",
    icon: HelpIcon,
    description: "Kapsamlı yardım dokümantasyonu",
    action: () => console.log("Help center"),
    category: "Yardım",
    shortcut: "F1",
  },
  {
    id: "support-contact",
    label: "Destek İletişim",
    icon: SupportIcon,
    description: "Teknik destek ile iletişime geç",
    action: () => console.log("Contact support"),
    category: "Yardım",
    shortcut: "Ctrl+Shift+H",
  },
  {
    id: "feedback",
    label: "Geri Bildirim",
    icon: FeedbackIcon,
    description: "Uygulama hakkında geri bildirim gönder",
    action: () => console.log("Send feedback"),
    category: "Yardım",
    shortcut: "Ctrl+Shift+F",
  },
];

// ============================================================================
// CATEGORY THEMES
// ============================================================================

export const categoryThemes: CategoryThemes = {
  Navigasyon: {
    color: colors.primary[500],
    backgroundColor: alpha(colors.primary[500], 0.08),
    icon: TimelineIcon,
  },
  "Hızlı Eylemler": {
    color: colors.success[500],
    backgroundColor: alpha(colors.success[500], 0.08),
    icon: SparkleIcon,
  },
  Sistem: {
    color: colors.warning[500],
    backgroundColor: alpha(colors.warning[500], 0.08),
    icon: SettingsIcon2,
  },
  Yardım: {
    color: colors.info[500],
    backgroundColor: alpha(colors.info[500], 0.08),
    icon: HelpIcon,
  },
};

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

export const keyboardShortcuts = {
  "Ctrl+K": {
    description: "Komut paletini aç",
    action: "toggle-command-palette",
  },
  "Ctrl+H": {
    description: "Ana sayfaya git",
    action: "navigate-home",
  },
  "Ctrl+L": {
    description: "Kesim listesine git",
    action: "navigate-cutting-list",
  },
  "Ctrl+E": {
    description: "Enterprise optimizasyona git",
    action: "navigate-enterprise-optimization",
  },
  "Ctrl+S": {
    description: "İstatistiklere git",
    action: "navigate-statistics",
  },
  "Ctrl+P": {
    description: "Üretim planına git",
    action: "navigate-production-plan",
  },
  "Ctrl+M": {
    description: "Profil yönetimine git",
    action: "navigate-profile-management",
  },
  "Ctrl+,": {
    description: "Ayarlara git",
    action: "navigate-settings",
  },
  Escape: {
    description: "Komut paletini kapat",
    action: "close-command-palette",
  },
  ArrowDown: {
    description: "Sonraki komutu seç",
    action: "select-next",
  },
  ArrowUp: {
    description: "Önceki komutu seç",
    action: "select-previous",
  },
  Enter: {
    description: "Seçili komutu çalıştır",
    action: "execute-selected",
  },
};

// ============================================================================
// NAVIGATION CONFIGURATION
// ============================================================================

export const navigationConfig = {
  brandName: appConfig.brandName,
  domain: appConfig.domain,
  defaultActivePage: "home",
  enableKeyboardShortcuts: true,
  enableCommandPalette: true,
  enableUserMenu: true,
  maxSearchResults: 50,
  debounceSearchMs: 300,
  commandPaletteWidth: {
    xs: "95vw",
    sm: "700px",
    md: "800px",
  },
  commandPaletteMaxHeight: "85vh",
  toolbarHeight: "72px",
};

// ============================================================================
// STYLING CONSTANTS
// ============================================================================

export const stylingConstants = {
  borderRadius: {
    small: 2,
    medium: 3,
    large: 4,
  },
  spacing: {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
  },
  shadows: {
    light: "0 1px 3px rgba(0, 0, 0, 0.05), 0 4px 6px rgba(0, 0, 0, 0.03)",
    medium: "0 4px 12px rgba(0, 0, 0, 0.04)",
    heavy: "0 32px 64px -12px rgba(0, 0, 0, 0.25)",
  },
  transitions: {
    fast: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    normal: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    slow: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  zIndex: {
    appBar: 1500,
    commandPalette: 1700,
    userMenu: 1600,
    backdrop: 1400,
  },
};

// ============================================================================
// MESSAGES AND LABELS
// ============================================================================

export const messages = {
  commandPalette: {
    title: "🚀 Komut Paleti",
    subtitle: "Hızlı arama ve navigasyon için gelişmiş komut arayüzü",
    searchPlaceholder: "Komut ara... (örn: optimizasyon, kesim, ayarlar)",
    noResults: "Hiçbir komut bulunamadı",
    noResultsSubtitle: "Farklı anahtar kelimeler deneyin",
    resultsFound: "komut bulundu",
    searchResults: "için sonuçlar",
  },
  navigation: {
    brandTooltip: `${appConfig.brandName} - ${appConfig.domain}`,
    commandPaletteTooltip: "Hızlı Komutlar (Ctrl+K)",
    notificationsTooltip: "Bildirimler",
    userMenuTooltip: "Kullanıcı Menüsü",
  },
  userMenu: {
    profile: "Profil",
    settings: "Ayarlar",
    logout: "Çıkış",
  },
  badges: {
    new: "YENİ",
    recent: "Son",
    favorite: "Favori",
  },
};

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

export const validation = {
  maxSearchQueryLength: 100,
  minSearchQueryLength: 1,
  maxCommandPaletteItems: 1000,
  maxUserMenuItems: 20,
};

// ============================================================================
// PERFORMANCE CONSTANTS
// ============================================================================

export const performance = {
  searchDebounceMs: 300,
  renderBatchSize: 50,
  maxRenderedItems: 100,
  virtualScrollThreshold: 200,
};
