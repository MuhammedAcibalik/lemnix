/**
 * @fileoverview Constants for HomePage component
 * @module HomePageConstants
 * @version 1.0.0
 */

import React from "react";
import {
  PrecisionManufacturing as PrecisionManufacturingIcon,
  Insights as InsightsIcon,
  Security as SecurityIcon,
  CloudUpload as CloudUploadIcon,
  AutoAwesome as AutoAwesomeIcon,
  CheckCircle as CheckCircleIcon,
  Speed as SpeedIcon,
} from "@mui/icons-material";
import {
  PremiumFeature,
  PerformanceMetric,
  CustomerTestimonial,
  AlgorithmCard,
} from "../types";

// ============================================================================
// PREMIUM FEATURES DATA
// ============================================================================

export const premiumFeatures: PremiumFeature[] = [
  {
    icon: PrecisionManufacturingIcon,
    title: "Akıllı Optimizasyon",
    description: "4 farklı algoritma ile %97'ye kadar verimlilik sağlayın",
    badge: "4 Algoritma",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    icon: InsightsIcon,
    title: "Detaylı Analiz",
    description:
      "Kesim planları ve performans metrikleri ile kapsamlı raporlama",
    badge: "Analitik",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
  {
    icon: SecurityIcon,
    title: "Güvenli Sistem",
    description: "Profesyonel güvenlik standartları ve veri koruması",
    badge: "Güvenli",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  },
  {
    icon: CloudUploadIcon,
    title: "Excel Entegrasyonu",
    description: "Excel dosyalarınızı kolayca yükleyin ve analiz edin",
    badge: "Excel API",
    gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  },
];

// ============================================================================
// PERFORMANCE METRICS DATA
// ============================================================================

export const performanceMetrics: PerformanceMetric[] = [
  {
    value: "97%",
    label: "Maksimum Verimlilik",
    trend: "up",
    percentage: 15,
  },
  {
    value: "< 30s",
    label: "Ortalama Süre",
    trend: "up",
    percentage: 10,
  },
  {
    value: "7",
    label: "Optimizasyon Algoritması",
    trend: "stable",
    percentage: 0,
  },
  {
    value: "1000+",
    label: "Parça Kapasitesi",
    trend: "up",
    percentage: 20,
  },
];

// ============================================================================
// CUSTOMER TESTIMONIALS DATA
// ============================================================================

export const customerTestimonials: CustomerTestimonial[] = [
  {
    name: "Ahmet Yılmaz",
    company: "AluTech Manufacturing",
    role: "Üretim Müdürü",
    quote:
      "LEMNİX sayesinde fire oranımızı %15'ten %3'e düşürdük. Malzeme tasarrufu inanılmaz!",
    avatar: "AY",
    rating: 5,
    result: "%80 Fire Azalması",
  },
  {
    name: "Elif Demir",
    company: "Nova Alüminyum",
    role: "Kalite Kontrol Uzmanı",
    quote:
      "Kesim planları ve optimizasyon raporları ile iş süreçlerimiz çok daha verimli hale geldi.",
    avatar: "ED",
    rating: 5,
    result: "%40 Verimlilik Artışı",
  },
];

// ============================================================================
// ALGORITHM CARDS DATA
// ============================================================================

// ALIGNED WITH BACKEND: Only 4 algorithms available
export const algorithmCards: AlgorithmCard[] = [
  {
    name: "Genetic Algorithm v1.7.1",
    efficiency: 95,
    speed: "2-5s",
    description: "Evrimsel optimizasyon, en yüksek kalite",
    icon: AutoAwesomeIcon,
    color: "#667eea",
  },
  {
    name: "Best Fit Decreasing",
    efficiency: 90,
    speed: "< 1s",
    description: "Atık minimizasyonu odaklı, kalite öncelikli",
    icon: CheckCircleIcon,
    color: "#f093fb",
  },
  {
    name: "First Fit Decreasing",
    efficiency: 87,
    speed: "< 1s",
    description: "Hızlı ve dengeli, genel amaçlı optimizasyon",
    icon: SpeedIcon,
    color: "#4facfe",
  },
  {
    name: "Profile Pooling",
    efficiency: 88,
    speed: "1-2s",
    description: "Profil bazlı gruplama, çoklu iş emri optimizasyonu",
    icon: CheckCircleIcon,
    color: "#43e97b",
  },
];

// ============================================================================
// TEXT CONTENT
// ============================================================================

export const textContent = {
  hero: {
    title: "LEMNİX",
    subtitle: "Alüminyum Profil Kesim Optimizasyonu",
    tagline: "Akıllı Kesim Planlama Sistemi",
    description:
      "4 farklı optimizasyon algoritması ile alüminyum profil kesim verimliliğinizi maksimize edin. Fire oranını minimize eden, maliyet tasarrufu sağlayan profesyonel kesim planlama çözümü.",
    ctaPrimary: "Optimizasyona Başla",
    ctaSecondary: "Detayları İncele",
  },
  features: {
    title: "Premium Özellikler",
    subtitle: "Profesyonel Kesim Optimizasyonu",
  },
  metrics: {
    title: "Performans Metrikleri",
    subtitle: "Kanıtlanmış Sonuçlar",
  },
  testimonials: {
    title: "Müşteri Deneyimleri",
    subtitle: "Gerçek Sonuçlar, Gerçek İşletmeler",
  },
  algorithms: {
    title: "Optimizasyon Algoritmaları",
    subtitle: "7 Farklı Yaklaşım, Maksimum Verimlilik",
  },
  cta: {
    title: "Optimizasyon Sürecinizi Başlatın",
    subtitle: "Profesyonel kesim planlama ile verimliliğinizi artırın",
    button: "Hemen Başla",
  },
};

// ============================================================================
// STYLING CONSTANTS
// ============================================================================

export const stylingConstants = {
  spacing: {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 6,
  },
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
  },
  shadows: {
    light: "0 2px 8px rgba(0, 0, 0, 0.1)",
    medium: "0 4px 16px rgba(0, 0, 0, 0.15)",
    heavy: "0 8px 32px rgba(0, 0, 0, 0.2)",
  },
  transitions: {
    fast: "all 0.2s ease-in-out",
    normal: "all 0.3s ease-in-out",
    slow: "all 0.5s ease-in-out",
  },
  gradients: {
    primary: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    secondary: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    success: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    info: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  },
};

// ============================================================================
// ANIMATION CONSTANTS
// ============================================================================

export const animationConstants = {
  durations: {
    fast: 200,
    normal: 300,
    slow: 500,
    hero: 1000,
  },
  delays: {
    stagger: 100,
    hero: 0,
    features: 200,
    metrics: 400,
    testimonials: 600,
  },
  easings: {
    easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    easeOut: "cubic-bezier(0, 0, 0.2, 1)",
    easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  },
};

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
};

// ============================================================================
// RESPONSIVE CONFIGURATIONS
// ============================================================================

export const responsiveConfig = {
  hero: {
    title: {
      xs: "2.5rem",
      md: "4rem",
      lg: "5rem",
    },
    subtitle: {
      xs: "1.5rem",
      md: "2rem",
    },
    description: {
      xs: "1rem",
      md: "1.25rem",
    },
  },
  grid: {
    features: {
      xs: 12,
      sm: 6,
      md: 3,
    },
    metrics: {
      xs: 12,
      sm: 6,
      md: 3,
    },
    testimonials: {
      xs: 12,
      md: 6,
    },
    algorithms: {
      xs: 12,
      md: 4,
    },
  },
};

// ============================================================================
// NAVIGATION ROUTES
// ============================================================================

export const navigationRoutes = {
  optimization: "/enterprise-optimization",
  about: "/about",
  contact: "/contact",
  documentation: "/docs",
};

// ============================================================================
// ACCESSIBILITY LABELS
// ============================================================================

export const accessibilityLabels = {
  hero: {
    title: "LEMNİX ana başlık",
    subtitle: "Alüminyum profil kesim optimizasyonu alt başlığı",
    description: "LEMNİX hakkında açıklama",
    ctaPrimary: "Optimizasyona başla butonu",
    ctaSecondary: "Detayları incele butonu",
  },
  features: {
    title: "Premium özellikler bölümü",
    grid: "Premium özellikler listesi",
  },
  metrics: {
    title: "Performans metrikleri bölümü",
    grid: "Performans metrikleri listesi",
  },
  testimonials: {
    title: "Müşteri deneyimleri bölümü",
    grid: "Müşteri yorumları listesi",
  },
  algorithms: {
    title: "Optimizasyon algoritmaları bölümü",
    grid: "Algoritma kartları listesi",
  },
  cta: {
    title: "Son çağrı bölümü",
    button: "Hemen başla butonu",
  },
};

// ============================================================================
// PERFORMANCE CONFIGURATIONS
// ============================================================================

export const performanceConfig = {
  lazyLoading: {
    enabled: true,
    threshold: 0.1,
    rootMargin: "50px",
  },
  animations: {
    enabled: true,
    reducedMotion: "prefers-reduced-motion: reduce",
  },
  images: {
    lazy: true,
    placeholder: "blur",
  },
};

// ============================================================================
// ANALYTICS EVENTS
// ============================================================================

export const analyticsEvents = {
  hero: {
    ctaClick: "hero_cta_click",
    learnMoreClick: "hero_learn_more_click",
  },
  features: {
    featureClick: "feature_click",
    badgeClick: "feature_badge_click",
  },
  metrics: {
    metricHover: "metric_hover",
    metricClick: "metric_click",
  },
  testimonials: {
    testimonialClick: "testimonial_click",
    ratingClick: "testimonial_rating_click",
  },
  algorithms: {
    algorithmClick: "algorithm_click",
    efficiencyClick: "algorithm_efficiency_click",
  },
  cta: {
    finalCtaClick: "final_cta_click",
  },
};
