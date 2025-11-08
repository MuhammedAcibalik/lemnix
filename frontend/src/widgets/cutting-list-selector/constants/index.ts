/**
 * @fileoverview Constants for CuttingListSelector component
 * @module CuttingListSelectorConstants
 * @version 1.0.0
 */

import React from 'react';
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Inventory as ProductIcon,
  Assignment as WorkOrderIcon,
  Architecture as ProfileIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as UncheckedIcon,
  IndeterminateCheckBox as IndeterminateIcon,
  Clear as ClearIcon,
  SelectAll as SelectAllIcon,
  Transform as ConvertIcon
} from '@mui/icons-material';

// ============================================================================
// TEXT CONTENT
// ============================================================================

export const textContent = {
  header: {
    title: 'Kesim Listesi Seçimi',
    subtitle: 'Optimizasyon için parçaları seçin'
  },
  search: {
    placeholder: 'Ürün, iş emri veya profil ara...',
    noResults: 'Arama kriterlerinize uygun sonuç bulunamadı',
    clearSearch: 'Aramayı temizle'
  },
  selection: {
    selectAll: 'Tümünü Seç',
    clearSelection: 'Seçimi Temizle',
    convertSelection: 'Seçimi Dönüştür',
    selectedItems: 'Seçili Parçalar',
    totalItems: 'Toplam Parça',
    estimatedLength: 'Tahmini Uzunluk'
  },
  filters: {
    showSelectedOnly: 'Sadece Seçililer',
    showWorkOrdersOnly: 'Sadece İş Emirleri',
    profileType: 'Profil Tipi',
    allTypes: 'Tüm Tipler'
  },
  products: {
    title: 'Ürün Grupları',
    noProducts: 'Ürün bulunamadı',
    expandAll: 'Tümünü Genişlet',
    collapseAll: 'Tümünü Daralt'
  },
  workOrders: {
    title: 'İş Emirleri',
    noWorkOrders: 'İş emri bulunamadı',
    items: 'parça'
  },
  profiles: {
    title: 'Profil Grupları',
    noProfiles: 'Profil bulunamadı',
    items: 'parça'
  },
  conversion: {
    inProgress: 'Dönüştürülüyor...',
    success: 'Dönüştürme tamamlandı',
    error: 'Dönüştürme hatası'
  },
  validation: {
    minItems: 'En az {count} parça seçmelisiniz',
    maxItems: 'En fazla {count} parça seçebilirsiniz',
    requiredProfiles: 'Bu profil tiplerini seçmelisiniz: {profiles}',
    invalidCombination: 'Bu kombinasyon geçersiz: {reason}'
  }
};

// ============================================================================
// ICON MAPPINGS
// ============================================================================

export const iconMappings = {
  expand: React.createElement(ExpandMoreIcon),
  search: React.createElement(SearchIcon),
  filter: React.createElement(FilterIcon),
  product: React.createElement(ProductIcon),
  workOrder: React.createElement(WorkOrderIcon),
  profile: React.createElement(ProfileIcon),
  info: React.createElement(InfoIcon),
  check: React.createElement(CheckIcon),
  unchecked: React.createElement(UncheckedIcon),
  indeterminate: React.createElement(IndeterminateIcon),
  clear: React.createElement(ClearIcon),
  selectAll: React.createElement(SelectAllIcon),
  convert: React.createElement(ConvertIcon)
};

// ============================================================================
// STYLING CONSTANTS
// ============================================================================

export const stylingConstants = {
  spacing: {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12
  },
  colors: {
    primary: '#1976d2',
    secondary: '#dc004e',
    success: '#2e7d32',
    warning: '#ed6c02',
    error: '#d32f2f',
    info: '#0288d1'
  },
  transitions: {
    fast: 'all 0.2s ease-in-out',
    normal: 'all 0.3s ease-in-out',
    slow: 'all 0.5s ease-in-out'
  },
  shadows: {
    light: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    medium: '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)',
    heavy: '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)'
  }
};

// ============================================================================
// PERFORMANCE CONSTANTS
// ============================================================================

export const performanceConstants = {
  debounce: {
    search: 300,
    selection: 100,
    filter: 200
  },
  thresholds: {
    virtualScrolling: 100,
    lazyLoading: 50,
    batchUpdates: 10
  },
  limits: {
    maxSelections: 1000,
    maxSearchResults: 500,
    maxRenderItems: 100
  }
};

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

export const validationConstants = {
  selection: {
    minItems: 1,
    maxItems: 1000,
    requiredFields: ['product', 'workOrder', 'profile', 'quantity']
  },
  search: {
    minLength: 2,
    maxLength: 100,
    allowedCharacters: /^[a-zA-Z0-9\s\-_.]+$/
  },
  filters: {
    maxProfileTypes: 20,
    maxWorkOrders: 100
  }
};

// ============================================================================
// RESPONSIVE CONFIGURATIONS
// ============================================================================

export const responsiveConfig = {
  breakpoints: {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536
  },
  grid: {
    search: {
      xs: 12,
      sm: 8,
      md: 6
    },
    filters: {
      xs: 12,
      sm: 4,
      md: 3
    },
    summary: {
      xs: 12,
      sm: 6,
      md: 4
    }
  },
  spacing: {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4
  }
};

// ============================================================================
// ACCESSIBILITY CONSTANTS
// ============================================================================

export const accessibilityConstants = {
  ariaLabels: {
    searchInput: 'Kesim listesi arama',
    selectAllButton: 'Tüm parçaları seç',
    clearSelectionButton: 'Seçimi temizle',
    convertButton: 'Seçimi dönüştür',
    productAccordion: 'Ürün grubu',
    workOrderAccordion: 'İş emri grubu',
    profileCheckbox: 'Profil seçimi',
    selectionCounter: 'Seçili parça sayısı',
    filterToggle: 'Filtre seçenekleri'
  },
  keyboardShortcuts: {
    selectAll: 'Ctrl+A',
    clearSelection: 'Ctrl+D',
    search: 'Ctrl+F',
    expandAll: 'Ctrl+E',
    collapseAll: 'Ctrl+Shift+E'
  },
  roles: {
    search: 'search',
    list: 'list',
    listItem: 'listitem',
    button: 'button',
    checkbox: 'checkbox'
  }
};

// ============================================================================
// ANIMATION CONSTANTS
// ============================================================================

export const animationConstants = {
  durations: {
    fast: 200,
    normal: 300,
    slow: 500
  },
  delays: {
    stagger: 50,
    fadeIn: 0,
    slideIn: 100
  },
  easings: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)'
  }
};

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

export const defaultConfig = {
  selection: {
    allowPartialSelection: true,
    maxSelections: 500,
    minSelections: 1,
    autoExpandOnSelection: false
  },
  search: {
    debounceMs: 300,
    minSearchLength: 2,
    searchFields: ['name', 'type', 'profile']
  },
  performance: {
    virtualScrolling: false,
    lazyLoading: true,
    batchUpdates: true
  },
  ui: {
    showProgressBars: true,
    showSelectionCounts: true,
    showEstimatedLength: true,
    compactMode: false
  }
};

// ============================================================================
// ANALYTICS EVENTS
// ============================================================================

export const analyticsEvents = {
  selection: {
    itemSelected: 'cutting_list_item_selected',
    itemDeselected: 'cutting_list_item_deselected',
    selectAll: 'cutting_list_select_all',
    clearSelection: 'cutting_list_clear_selection'
  },
  search: {
    searchPerformed: 'cutting_list_search_performed',
    searchCleared: 'cutting_list_search_cleared'
  },
  filters: {
    filterApplied: 'cutting_list_filter_applied',
    filterCleared: 'cutting_list_filter_cleared'
  },
  conversion: {
    conversionStarted: 'cutting_list_conversion_started',
    conversionCompleted: 'cutting_list_conversion_completed',
    conversionFailed: 'cutting_list_conversion_failed'
  },
  navigation: {
    sectionExpanded: 'cutting_list_section_expanded',
    sectionCollapsed: 'cutting_list_section_collapsed'
  }
};

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const errorMessages = {
  network: 'Ağ bağlantısı hatası. Lütfen tekrar deneyin.',
  validation: 'Seçim geçersiz. Lütfen gereksinimleri kontrol edin.',
  conversion: 'Dönüştürme işlemi başarısız. Lütfen tekrar deneyin.',
  search: 'Arama işlemi başarısız. Lütfen farklı terimler deneyin.',
  loading: 'Veriler yüklenirken hata oluştu.',
  unknown: 'Bilinmeyen bir hata oluştu.'
};

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

export const successMessages = {
  conversion: 'Seçim başarıyla dönüştürüldü.',
  selection: 'Seçim güncellendi.',
  search: 'Arama tamamlandı.',
  filter: 'Filtre uygulandı.'
};
