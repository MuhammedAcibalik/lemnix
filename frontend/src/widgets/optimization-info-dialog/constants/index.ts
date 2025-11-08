/**
 * @fileoverview Constants for Optimization Info Dialog
 * @module OptimizationInfoDialogConstants
 * @version 1.0.0
 */

import React from 'react';
import {
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon,
  Timeline as TimelineIcon,
  CompareArrows as CompareIcon,
  Psychology as PsychologyIcon,
  Science as ScienceIcon,
  Architecture as ArchitectureIcon,
  Security as SecurityIcon,
  GpsFixed as PrecisionIcon,
  Engineering as EngineeringIcon
} from '@mui/icons-material';
import {
  Algorithm,
  Feature,
  OptimizationStep,
  Metric,
  TrainingModule,
  TrainingLevelInfoMap,
  DialogConfig
} from '../types';

// ============================================================================
// ALGORITHMS DATA
// ============================================================================

// ALIGNED WITH BACKEND: Only 4 algorithms available
export const algorithms: Algorithm[] = [
  {
    id: 'ffd',
    name: 'FFD (First Fit Decreasing)',
    turkishName: 'İlk Uygun Azalan',
    description: 'Parçaları büyükten küçüğe sıralar ve ilk uygun stoğa yerleştirir.',
    complexity: 'O(n²)',
    efficiency: '85-90%',
    speed: 'Çok Hızlı',
    pros: ['Hızlı', 'Basit', 'Güvenilir', 'Deterministik'],
    cons: ['Optimal garanti yok', 'Sıralamaya bağımlı'],
    bestFor: 'Hızlı sonuç gereken durumlar',
    icon: React.createElement(SpeedIcon)
  },
  {
    id: 'bfd',
    name: 'BFD (Best Fit Decreasing)',
    turkishName: 'En İyi Uygun Azalan',
    description: 'Her parça için minimum atık bırakan stoğu seçer.',
    complexity: 'O(n²)',
    efficiency: '87-92%',
    speed: 'Hızlı',
    pros: ['Daha az atık', 'Daha iyi paketleme', 'Tutarlı sonuçlar'],
    cons: ['FFD\'den biraz yavaş', 'Daha fazla bellek'],
    bestFor: 'Atık minimizasyonu kritik durumlar',
    icon: React.createElement(TrendingUpIcon)
  },
  {
    id: 'genetic',
    name: 'Genetic Algorithm v1.7.1 (GPU)',
    turkishName: 'Genetik Algoritma',
    description: 'GPU destekli evrimsel optimizasyon. Popülasyon tabanlı, çaprazlama ve mutasyon kullanır.',
    complexity: 'O(P×n²×g)',
    efficiency: '90-95%',
    speed: 'Orta',
    pros: ['En yüksek kalite', 'Global optimum', 'Çoklu hedef', 'GPU desteği', 'Adaptif parametreler'],
    cons: ['GPU gerektirmeyen', 'Stokastik', 'Yavaş (GPU yoksa)'],
    bestFor: 'Kalite kritik, GPU mevcut, çoklu hedef optimizasyon',
    icon: React.createElement(PsychologyIcon)
  },
  {
    id: 'pooling',
    name: 'Profile Pooling',
    turkishName: 'Profil Havuzlama',
    description: 'Aynı profil tiplerini gruplayarak optimize eder. Çoklu iş emri senaryoları için ideal.',
    complexity: 'O(n²×p)',
    efficiency: '85-90%',
    speed: 'Hızlı',
    pros: ['Profil gruplaması', 'Çoklu iş emri', 'Karışık bar azaltma', 'Ölçeklenebilir'],
    cons: ['Tek profil için gereksiz', 'Grup sayısına bağımlı'],
    bestFor: 'Çoklu iş emri, farklı profil tipleri, batch işlem',
    icon: React.createElement(EngineeringIcon)
  }
];

// ============================================================================
// FEATURES DATA
// ============================================================================

export const features: Feature[] = [
  {
    title: 'Kerf (Kesim) Genişliği',
    description: 'Her kesimde kaybedilen malzeme miktarı (mm)',
    default: '3.5 mm',
    impact: 'Toplam kullanılabilir uzunluğu azaltır'
  },
  {
    title: 'Başlangıç Güvenlik Payı',
    description: 'Stok başında bırakılan güvenlik mesafesi',
    default: '2.0 mm',
    impact: 'Kesim kalitesini artırır, ilk parça hasarını önler'
  },
  {
    title: 'Bitiş Güvenlik Payı',
    description: 'Stok sonunda bırakılan güvenlik mesafesi',
    default: '2.0 mm',
    impact: 'Son kesim kalitesini korur'
  },
  {
    title: 'Minimum Hurda Uzunluğu',
    description: 'Geri kazanılabilir kabul edilen minimum parça',
    default: '75 mm',
    impact: 'Bu değerin altındaki parçalar atık sayılır'
  },
  {
    title: 'Stok Başına Enerji',
    description: 'Her stok kesimi için harcanan enerji (kWh)',
    default: '0.5 kWh',
    impact: 'Toplam enerji maliyetini etkiler'
  }
];

// ============================================================================
// OPTIMIZATION STEPS
// ============================================================================

export const optimizationSteps: OptimizationStep[] = [
  {
    label: 'Veri Girişi',
    description: 'Kesilecek parçaların boyut ve adetlerini girin'
  },
  {
    label: 'Algoritma Seçimi',
    description: 'İhtiyacınıza uygun algoritmayı seçin'
  },
  {
    label: 'Parametre Ayarları',
    description: 'Kerf, güvenlik payı gibi parametreleri ayarlayın'
  },
  {
    label: 'Optimizasyon',
    description: 'Sistem en iyi kesim planını hesaplar'
  },
  {
    label: 'Sonuç Analizi',
    description: 'Verimlilik, maliyet ve atık raporlarını inceleyin'
  }
];

// ============================================================================
// METRICS DATA
// ============================================================================

export const metrics: Metric[] = [
  { name: 'Verimlilik', formula: '(Kullanılan / Toplam Stok) × 100', unit: '%' },
  { name: 'Atık', formula: 'Toplam Stok - Kullanılan', unit: 'mm' },
  { name: 'Maliyet', formula: 'Malzeme + Kesim + Kurulum + Atık + Zaman + Enerji', unit: '₺' },
  { name: 'Güven Skoru', formula: 'Verimlilik × Kalite × Tutarlılık', unit: '0-100' }
];

// ============================================================================
// TRAINING MODULES DATA
// ============================================================================

export const trainingModules: Record<string, TrainingModule[]> = {
  beginner: [
    {
      id: 'safety-fundamentals',
      title: 'Güvenlik Temelleri',
      description: 'Kişisel koruyucu donanım ve güvenlik protokolleri',
      duration: 45,
      points: 100,
      prerequisites: [],
      skills: ['safety', 'ppe', 'emergency'],
      difficulty: 'beginner',
      steps: [
        {
          id: 'ppe-selection',
          title: 'KKD Seçimi ve Kontrolü',
          description: 'Doğru kişisel koruyucu donanım seçimi',
          type: 'interactive',
          interactive: true,
          validation: 'safety-gear-check',
          points: 25
        },
        {
          id: 'workspace-safety',
          title: 'Çalışma Alanı Güvenliği',
          description: 'Atölye güvenlik kuralları ve düzeni',
          type: 'interactive',
          interactive: true,
          validation: 'workspace-inspection',
          points: 25
        },
        {
          id: 'emergency-procedures',
          title: 'Acil Durum Prosedürleri',
          description: 'Acil durdurma ve güvenlik protokolleri',
          type: 'interactive',
          interactive: true,
          validation: 'emergency-test',
          points: 25
        },
        {
          id: 'safety-assessment',
          title: 'Güvenlik Değerlendirmesi',
          description: 'Güvenlik bilgisi testi ve uygulama',
          type: 'assessment',
          interactive: false,
          validation: 'quiz',
          points: 25
        }
      ]
    },
    {
      id: 'machine-basics',
      title: 'Makine Temelleri',
      description: 'Kesim makinesi tanıtımı ve temel operasyon',
      duration: 60,
      points: 120,
      prerequisites: ['safety-fundamentals'],
      skills: ['machine-operation', 'controls', 'maintenance'],
      difficulty: 'beginner',
      steps: [
        {
          id: 'machine-overview',
          title: 'Makine Tanıtımı',
          description: 'Kesim makinesi parçaları ve fonksiyonları',
          type: 'interactive',
          interactive: true,
          validation: 'component-identification',
          points: 30
        },
        {
          id: 'control-panel',
          title: 'Kontrol Paneli',
          description: 'Makine kontrol paneli ve ayarları',
          type: 'interactive',
          interactive: true,
          validation: 'control-operation',
          points: 30
        },
        {
          id: 'basic-operation',
          title: 'Temel Operasyon',
          description: 'Makineyi güvenli şekilde çalıştırma',
          type: 'interactive',
          interactive: true,
          validation: 'startup-sequence',
          points: 30
        },
        {
          id: 'maintenance-basics',
          title: 'Temel Bakım',
          description: 'Günlük bakım ve kontrol prosedürleri',
          type: 'interactive',
          interactive: true,
          validation: 'maintenance-check',
          points: 30
        }
      ]
    }
  ],
  intermediate: [
    {
      id: 'precision-cutting',
      title: 'Hassas Kesim Teknikleri',
      description: 'Yüksek kaliteli kesim teknikleri ve ölçüm',
      duration: 75,
      points: 150,
      prerequisites: ['machine-basics'],
      skills: ['precision', 'measurement', 'quality-control'],
      difficulty: 'intermediate',
      steps: [
        {
          id: 'measurement-tools',
          title: 'Ölçüm Aletleri',
          description: 'Hassas ölçüm aletlerinin kullanımı',
          type: 'interactive',
          interactive: true,
          validation: 'measurement-accuracy',
          points: 40
        },
        {
          id: 'cutting-parameters',
          title: 'Kesim Parametreleri',
          description: 'Optimal kesim ayarları ve optimizasyon',
          type: 'interactive',
          interactive: true,
          validation: 'parameter-optimization',
          points: 40
        },
        {
          id: 'quality-control',
          title: 'Kalite Kontrolü',
          description: 'Kesim kalitesi değerlendirme ve iyileştirme',
          type: 'interactive',
          interactive: true,
          validation: 'quality-assessment',
          points: 40
        },
        {
          id: 'troubleshooting',
          title: 'Problem Çözme',
          description: 'Yaygın problemler ve çözüm yöntemleri',
          type: 'interactive',
          interactive: true,
          validation: 'problem-solving',
          points: 30
        }
      ]
    }
  ],
  advanced: [
    {
      id: 'advanced-operations',
      title: 'İleri Seviye Operasyonlar',
      description: 'Karmaşık kesimler ve optimizasyon teknikleri',
      duration: 90,
      points: 200,
      prerequisites: ['precision-cutting'],
      skills: ['optimization', 'complex-cutting', 'leadership'],
      difficulty: 'advanced',
      steps: [
        {
          id: 'complex-geometries',
          title: 'Karmaşık Geometriler',
          description: 'Açılı ve karmaşık kesimler',
          type: 'interactive',
          interactive: true,
          validation: 'geometry-mastery',
          points: 50
        },
        {
          id: 'material-optimization',
          title: 'Malzeme Optimizasyonu',
          description: 'Atık minimizasyonu ve verimlilik',
          type: 'interactive',
          interactive: true,
          validation: 'optimization-mastery',
          points: 50
        },
        {
          id: 'process-improvement',
          title: 'Süreç İyileştirme',
          description: 'Kesim süreçlerinin optimizasyonu',
          type: 'interactive',
          interactive: true,
          validation: 'process-mastery',
          points: 50
        },
        {
          id: 'mentoring-skills',
          title: 'Eğitmenlik Becerileri',
          description: 'Yeni operatörlere rehberlik etme',
          type: 'interactive',
          interactive: true,
          validation: 'mentoring-assessment',
          points: 50
        }
      ]
    }
  ]
};

// ============================================================================
// TRAINING LEVEL INFO
// ============================================================================

export const trainingLevelInfo: TrainingLevelInfoMap = {
  beginner: {
    title: 'Başlangıç Seviyesi',
    description: 'Temel güvenlik ve makine kullanımı',
    color: '#4caf50',
    icon: '🟢'
  },
  intermediate: {
    title: 'Orta Seviye',
    description: 'Hassas ölçüm ve kesim teknikleri',
    color: '#ff9800',
    icon: '🟡'
  },
  advanced: {
    title: 'İleri Seviye',
    description: 'Karmaşık kesimler ve optimizasyon',
    color: '#f44336',
    icon: '🔴'
  }
};

// ============================================================================
// DIALOG CONFIGURATION
// ============================================================================

export const dialogConfig: DialogConfig = {
  maxWidth: 'lg',
  fullWidth: true,
  zIndex: 1600,
  minHeight: '80vh',
  borderRadius: 2
};

// ============================================================================
// TAB CONFIGURATION
// ============================================================================

export const tabConfig = {
  tabs: [
    { label: 'Genel Bakış', index: 0 },
    { label: 'Algoritmalar', index: 1 },
    { label: 'Parametreler', index: 2 },
    { label: 'Kullanım Adımları', index: 3 },
    { label: 'Metrikler', index: 4 },
    { label: 'Simülasyon', index: 5 }
  ],
  trainingTabs: [
    { label: '📊 Genel Bakış', value: 'overview' },
    { label: '🛡️ Güvenlik', value: 'safety' },
    { label: '⚙️ Makine', value: 'machine' },
    { label: '✂️ Kesim', value: 'cutting' },
    { label: '📋 Değerlendirme', value: 'assessment' }
  ]
};

// ============================================================================
// MESSAGES AND LABELS
// ============================================================================

export const messages = {
  dialog: {
    title: 'Optimizasyon Sistemi Kullanım Kılavuzu',
    closeButton: 'Anladım'
  },
  overview: {
    title: 'Kurumsal Optimizasyon Sistemi',
    description: 'Bu sistem, alüminyum profil kesim işlemlerinizi optimize ederek malzeme israfını minimize eder, verimliliği maksimize eder ve maliyetleri düşürür.',
    features: {
      title: 'Temel Özellikler',
      items: [
        { primary: '4 Farklı Optimizasyon Algoritması', secondary: 'Her senaryo için uygun algoritma' },
        { primary: 'Gerçek Zamanlı Hesaplama', secondary: 'Anında sonuç ve görselleştirme' },
        { primary: 'Çok Amaçlı Optimizasyon', secondary: 'Verimlilik, maliyet ve zaman dengesi' },
        { primary: 'Detaylı Raporlama', secondary: 'Kapsamlı analiz ve öneriler' }
      ]
    },
    advantages: {
      title: 'Sistem Avantajları',
      items: [
        { primary: '%15-30 Maliyet Tasarrufu', secondary: 'Optimize edilmiş kesim planları' },
        { primary: '%10-20 Atık Azaltımı', secondary: 'Çevre dostu üretim' },
        { primary: '%25 Zaman Tasarrufu', secondary: 'Otomatik plan oluşturma' },
        { primary: '%85-95 Verimlilik', secondary: 'Endüstri lideri performans' }
      ]
    }
  },
  algorithms: {
    title: 'Optimizasyon Algoritmaları',
    description: 'Her algoritmanın kendine özgü avantajları vardır. İhtiyacınıza göre seçim yapın.'
  },
  parameters: {
    title: 'Sistem Parametreleri',
    description: 'Bu parametreler kesim planının doğruluğunu ve verimliliğini doğrudan etkiler.',
    warning: {
      title: 'Önemli',
      message: 'Parametreleri makinenizin özelliklerine ve malzeme tipine göre ayarlayın. Yanlış parametreler hatalı kesim planlarına neden olabilir.'
    }
  },
  steps: {
    title: 'Kullanım Adımları',
    tips: {
      title: 'İpuçları',
      items: [
        '• Büyük veri setleri için önce FFD ile hızlı sonuç alın',
        '• Kritik projeler için Genetik Algoritma kullanın',
        '• Kerf değerini makinenize göre doğru ayarlayın',
        '• Algoritma karşılaştırma özelliğini kullanarak en iyi sonucu bulun'
      ]
    }
  },
  metrics: {
    title: 'Performans Metrikleri',
    goodResults: {
      title: 'İyi Sonuç Kriterleri',
      criteria: ['Verimlilik > %85', 'Atık < %15', 'Güven Skoru > 80']
    },
    badResults: {
      title: 'Kötü Sonuç Belirtileri',
      criteria: ['Verimlilik < %70', 'Çok fazla stok kullanımı', 'Yüksek maliyet']
    }
  },
  simulation: {
    title: 'Enterprise Operatör Eğitim Simülasyonu',
    description: 'Profesyonel profil kesim operatörleri için kapsamlı eğitim platformu. Güvenlik, makine operasyonu ve ileri seviye teknikler.'
  }
};

// ============================================================================
// STYLING CONSTANTS
// ============================================================================

export const stylingConstants = {
  borderRadius: {
    small: 1,
    medium: 2,
    large: 3
  },
  spacing: {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4
  },
  colors: {
    primary: '#1e40af',    // Deep Industrial Blue
    secondary: '#059669',  // Precision Green
    success: '#059669',    // Precision Green
    warning: '#f59e0b',    // Efficiency Orange
    error: '#ef4444',      // Error Red
    info: '#1e40af'        // Deep Industrial Blue
  },
  gradients: {
    primary: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)',     // Premium Blue-Purple
    secondary: 'linear-gradient(135deg, #059669 0%, #22c55e 100%)',   // Precision Green
    success: 'linear-gradient(135deg, #059669 0%, #22c55e 100%)'      // Precision Green
  },
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
// VALIDATION CONSTANTS
// ============================================================================

export const validationConstants = {
  minScore: 0,
  maxScore: 100,
  minProgress: 0,
  maxProgress: 100,
  minSafetyViolations: 0,
  maxSafetyViolations: 10,
  passThreshold: 80,
  excellentThreshold: 95
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
  easings: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)'
  },
  keyframes: {
    sawBlade3D: {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' }
    },
    materialCut: {
      '0%, 100%': { transform: 'translateX(0px)' },
      '50%': { transform: 'translateX(20px)' }
    },
    spark1: {
      '0%': { transform: 'translate(-50%, -50%) scale(0)', opacity: 1 },
      '100%': { transform: 'translate(-50%, -50%) scale(3)', opacity: 0 }
    }
  }
};
