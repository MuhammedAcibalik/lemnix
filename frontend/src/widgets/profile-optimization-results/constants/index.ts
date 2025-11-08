/**
 * @fileoverview Constants for Profile Optimization Results
 * @module ProfileOptimizationResultsConstants
 * @version 1.0.0
 */

import React from 'react';
import {
  Category as CategoryIcon,
  AccountTree as TreeIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  ShowChart as ShowChartIcon,
  Insights as InsightsIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  Recycling as RecyclingIcon,
  Engineering as EngineeringIcon,
  Speed as SpeedIcon,
  Science as ScienceIcon,
  Assessment as AssessmentIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import {
  ProfileOptimizationConfig,
  StylingConstants,
  AnimationConfig,
  TableColumn,
  AccessibilityConfig
} from '../types';

// ============================================================================
// TAB CONFIGURATION
// ============================================================================

export const tabConfig = {
  tabs: [
    {
      label: 'Profil Grupları',
      icon: React.createElement(CategoryIcon),
      index: 0
    },
    {
      label: 'Kesim Planı',
      icon: React.createElement(TreeIcon),
      index: 1
    },
    {
      label: 'Maliyet Analizi',
      icon: React.createElement(PieChartIcon),
      index: 2
    },
    {
      label: 'Atık Analizi',
      icon: React.createElement(BarChartIcon),
      index: 3
    },
    {
      label: 'Performans',
      icon: React.createElement(ShowChartIcon),
      index: 4
    },
    {
      label: 'Öneriler',
      icon: React.createElement(InsightsIcon),
      index: 5
    }
  ]
};

// ============================================================================
// TABLE CONFIGURATIONS
// ============================================================================

export const profileGroupsTableColumns: TableColumn[] = [
  {
    id: 'profileType',
    label: 'Profil Tipi',
    align: 'left'
  },
  {
    id: 'cuts',
    label: 'Kesim Sayısı',
    align: 'center'
  },
  {
    id: 'efficiency',
    label: 'Verimlilik',
    align: 'center'
  },
  {
    id: 'waste',
    label: 'Atık (mm)',
    align: 'center'
  },
  {
    id: 'workOrders',
    label: 'İş Emirleri',
    align: 'center'
  },
  {
    id: 'details',
    label: 'Detaylar',
    align: 'center'
  }
];

export const wasteAnalysisTableColumns: TableColumn[] = [
  {
    id: 'profileType',
    label: 'Profil Tipi',
    align: 'left'
  },
  {
    id: 'waste',
    label: 'Atık (mm)',
    align: 'center'
  },
  {
    id: 'efficiency',
    label: 'Verimlilik',
    align: 'center'
  },
  {
    id: 'status',
    label: 'Durum',
    align: 'center'
  }
];

// ============================================================================
// THRESHOLD CONFIGURATIONS
// ============================================================================

export const thresholds = {
  efficiency: {
    excellent: 90,
    good: 85,
    warning: 70
  },
  waste: {
    excellent: 200,
    good: 500,
    warning: 1000
  },
  performance: {
    excellent: 95,
    good: 85,
    warning: 70
  }
};

// ============================================================================
// COLOR CONFIGURATIONS
// ============================================================================

export const colors = {
  primary: '#1e40af',    // Deep Industrial Blue
  secondary: '#059669',  // Precision Green
  success: '#059669',    // Precision Green
  warning: '#f59e0b',    // Efficiency Orange
  error: '#ef4444',      // Error Red
  info: '#1e40af',       // Deep Industrial Blue
  gradients: {
    primary: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)',     // Premium Blue-Purple
    secondary: 'linear-gradient(135deg, #059669 0%, #22c55e 100%)',   // Precision Green
    success: 'linear-gradient(135deg, #059669 0%, #22c55e 100%)',     // Precision Green
    warning: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',     // Efficiency Orange
    error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'        // Error Red
  }
};

// ============================================================================
// STYLING CONSTANTS
// ============================================================================

export const stylingConstants: StylingConstants = {
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12
  },
  spacing: {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4
  },
  colors: colors,
  gradients: colors.gradients,
  shadows: {
    light: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    medium: '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)',
    heavy: '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)'
  },
  transitions: {
    fast: 'all 0.2s ease-in-out',
    normal: 'all 0.3s ease-in-out',
    slow: 'all 0.5s ease-in-out'
  }
};

// ============================================================================
// ANIMATION CONFIGURATIONS
// ============================================================================

export const animationConfig: AnimationConfig = {
  lemnixRotate: {
    duration: '3s',
    timing: 'linear',
    iteration: 'infinite'
  },
  hoverEffects: {
    scale: '1.1',
    duration: '0.3s',
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  }
};

// ============================================================================
// MESSAGES AND LABELS
// ============================================================================

export const messages = {
  header: {
    title: 'Profil Optimizasyonu Tamamlandı',
    efficiency: 'Verimlilik',
    totalCost: 'Toplam Maliyet',
    profileGroups: 'Profil Grubu',
    confidence: 'Güven'
  },
  kpi: {
    efficiencyRate: 'Verimlilik Oranı',
    totalWaste: 'Toplam Atık',
    totalCost: 'Toplam Maliyet',
    performanceScore: 'Performans Skoru',
    savings: 'tasarruf',
    quality: 'Kalite',
    profileGroups: 'profil grubu'
  },
  tabs: {
    profileGroups: 'Profil Grupları',
    cuttingPlan: 'Kesim Planı',
    costAnalysis: 'Maliyet Analizi',
    wasteAnalysis: 'Atık Analizi',
    performance: 'Performans',
    recommendations: 'Öneriler'
  },
  profileGroups: {
    cuts: 'kesim',
    orders: 'emir',
    show: 'Göster',
    hide: 'Gizle',
    detailedPlan: 'Detaylı Kesim Planı',
    cuttingPlanDescription: 'Kesim Planı Açıklaması',
    stockLength: 'Stok Uzunluğu',
    used: 'Kullanılan',
    remaining: 'Kalan',
    pieceCount: 'Parça Sayısı',
    cutting: 'Kesim'
  },
  costAnalysis: {
    costDistribution: 'Maliyet Dağılımı',
    unitCosts: 'Birim Maliyetler',
    materialCost: 'Malzeme Maliyeti',
    cuttingCost: 'Kesim Maliyeti',
    setupCost: 'Kurulum Maliyeti',
    costPerCut: 'Kesim Başına Maliyet',
    costPerProfileGroup: 'Profil Grubu Başına Maliyet'
  },
  wasteAnalysis: {
    wasteRate: 'Atık Oranı',
    excellentMessage: 'Mükemmel! Profil bazlı optimizasyon atık oranını minimize etti.',
    improvementMessage: 'Profil gruplarında atık oranını azaltmak için farklı kombinasyonlar deneyin.',
    status: {
      excellent: 'Mükemmel',
      good: 'İyi',
      improvable: 'İyileştirilebilir'
    }
  },
  performance: {
    algorithmPerformance: 'Algoritma Performansı',
    systemUsage: 'Sistem Kullanımı',
    executionTime: 'İşlem Süresi',
    algorithmComplexity: 'Algoritma Karmaşıklığı',
    convergenceRate: 'Yakınsama Oranı',
    cpuUsage: 'CPU Kullanımı',
    memoryUsage: 'Bellek Kullanımı',
    scalability: 'Ölçeklenebilirlik'
  },
  recommendations: {
    improvementPotential: 'iyileştirme potansiyeli'
  },
  actions: {
    downloadReport: 'Rapor İndir',
    print: 'Yazdır',
    newOptimization: 'Yeni Optimizasyon',
    share: 'Paylaş'
  },
  cuttingPlan: {
    title: 'Kesim Planı',
    description: 'Detaylı kesim planı Profil Grupları sekmesinde görüntülenmektedir.'
  }
};

// ============================================================================
// ICON MAPPINGS
// ============================================================================

export const iconMappings = {
  recommendation: {
    critical: React.createElement(ErrorIcon),
    error: React.createElement(ErrorIcon),
    warning: React.createElement(WarningIcon),
    info: React.createElement(InfoIcon),
    success: React.createElement(InfoIcon)
  },
  performance: {
    speed: React.createElement(SpeedIcon),
    science: React.createElement(ScienceIcon),
    assessment: React.createElement(AssessmentIcon)
  },
  actions: {
    download: React.createElement(DownloadIcon),
    print: React.createElement(PrintIcon),
    share: React.createElement(ShareIcon),
    refresh: React.createElement(RefreshIcon),
    trendingUp: React.createElement(TrendingUpIcon),
    money: React.createElement(MoneyIcon),
    recycling: React.createElement(RecyclingIcon),
    engineering: React.createElement(EngineeringIcon)
  }
};

// ============================================================================
// ACCESSIBILITY CONFIGURATIONS
// ============================================================================

export const accessibilityConfig: AccessibilityConfig = {
  ariaLabels: {
    expandProfile: 'Profil detaylarını genişlet',
    showDetails: 'Detayları göster',
    downloadReport: 'Raporu indir',
    printReport: 'Raporu yazdır',
    shareReport: 'Raporu paylaş',
    newOptimization: 'Yeni optimizasyon başlat'
  },
  keyboardShortcuts: {
    expandAll: 'Ctrl+E',
    collapseAll: 'Ctrl+Shift+E',
    nextTab: 'Ctrl+Right',
    previousTab: 'Ctrl+Left',
    export: 'Ctrl+Shift+E'
  }
};

// ============================================================================
// PERFORMANCE BENCHMARKS
// ============================================================================

export const performanceBenchmarks = {
  executionTime: {
    excellent: 100,
    good: 500,
    warning: 1000
  },
  cpuUsage: {
    excellent: 20,
    good: 50,
    warning: 80
  },
  memoryUsage: {
    excellent: 30,
    good: 60,
    warning: 85
  },
  scalability: {
    excellent: 9,
    good: 7,
    warning: 5
  }
};

// ============================================================================
// RECOMMENDATION SEVERITY MAPPINGS
// ============================================================================

export const recommendationSeverity = {
  critical: {
    color: 'error' as const,
    icon: React.createElement(ErrorIcon),
    priority: 1
  },
  error: {
    color: 'error' as const,
    icon: React.createElement(ErrorIcon),
    priority: 2
  },
  warning: {
    color: 'warning' as const,
    icon: React.createElement(WarningIcon),
    priority: 3
  },
  info: {
    color: 'info' as const,
    icon: React.createElement(InfoIcon),
    priority: 4
  },
  success: {
    color: 'success' as const,
    icon: React.createElement(InfoIcon),
    priority: 5
  }
};

// ============================================================================
// CHART CONFIGURATIONS
// ============================================================================

export const chartConfig = {
  colors: [
    '#1976d2',
    '#dc004e',
    '#2e7d32',
    '#ed6c02',
    '#9c27b0',
    '#00bcd4',
    '#ff9800',
    '#795548'
  ],
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const
      }
    }
  }
};

// ============================================================================
// EXPORT CONFIGURATIONS
// ============================================================================

export const exportConfig = {
  formats: ['pdf', 'excel', 'csv', 'json'] as const,
  defaultFormat: 'pdf' as const,
  includeOptions: {
    charts: true,
    details: true,
    recommendations: true
  }
};

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const validationRules = {
  profileType: {
    required: true,
    minLength: 1,
    maxLength: 100
  },
  efficiency: {
    min: 0,
    max: 100
  },
  waste: {
    min: 0,
    max: 10000
  },
  cuts: {
    min: 0,
    max: 1000
  }
};

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const defaultValues = {
  efficiency: 0,
  waste: 0,
  cuts: 0,
  totalCost: 0,
  confidence: 95,
  executionTime: 0,
  cpuUsage: 0,
  memoryUsage: 0,
  scalability: 0
};

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const featureFlags = {
  enableAnimations: true,
  enableHoverEffects: true,
  enableKeyboardShortcuts: true,
  enableAccessibilityFeatures: true,
  enableAdvancedCharts: false,
  enableExportOptions: true,
  enableRecommendations: true,
  enablePerformanceMetrics: true
};
