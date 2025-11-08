/**
 * @fileoverview Type definitions for HomePage component
 * @module HomePageTypes
 * @version 1.0.0
 */

import React from 'react';

// ============================================================================
// MAIN COMPONENT PROPS
// ============================================================================

export interface HomePageProps {
  className?: string;
}

// ============================================================================
// PREMIUM FEATURES
// ============================================================================

export interface PremiumFeature {
  icon: React.ElementType;
  title: string;
  description: string;
  badge: string;
  gradient: string;
}

// ============================================================================
// PERFORMANCE METRICS
// ============================================================================

export interface PerformanceMetric {
  value: string;
  label: string;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
}

// ============================================================================
// CUSTOMER TESTIMONIALS
// ============================================================================

export interface CustomerTestimonial {
  name: string;
  company: string;
  role: string;
  quote: string;
  avatar: string;
  rating: number;
  result: string;
}

// ============================================================================
// ALGORITHM CARDS
// ============================================================================

export interface AlgorithmCard {
  name: string;
  efficiency: number;
  speed: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

export interface HeroSectionProps {
  onGetStarted: () => void;
  onLearnMore: () => void;
}

export interface FeaturesSectionProps {
  features: PremiumFeature[];
  onFeatureClick?: (featureId: string) => void;
}

export interface MetricsSectionProps {
  metrics: PerformanceMetric[];
}

export interface TestimonialsSectionProps {
  testimonials: CustomerTestimonial[];
  onTestimonialClick?: (testimonialId: string) => void;
}

export interface AlgorithmsSectionProps {
  algorithms: AlgorithmCard[];
  onAlgorithmClick?: (algorithmId: string) => void;
}

export interface CTASectionProps {
  onGetStarted: () => void;
  onCTAClick?: () => void;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface TrendIconProps {
  trend: 'up' | 'down' | 'stable';
}

export interface GradientBadgeProps {
  gradient: string;
  children: React.ReactNode;
}

export interface StarRatingProps {
  rating: number;
  maxRating?: number;
}

// ============================================================================
// ANIMATION TYPES
// ============================================================================

export interface AnimationConfig {
  duration: number;
  delay: number;
  easing: string;
}

export interface FadeInProps {
  delay?: number;
  duration?: number;
  children: React.ReactNode;
}

// ============================================================================
// LAYOUT TYPES
// ============================================================================

export interface SectionProps {
  id?: string;
  className?: string;
  children: React.ReactNode;
  backgroundColor?: string;
  padding?: string;
}

export interface ContainerProps {
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  children: React.ReactNode;
  className?: string;
}

// ============================================================================
// NAVIGATION TYPES
// ============================================================================

export interface NavigationHandlers {
  onGetStarted: () => void;
  onLearnMore: () => void;
  onContactUs: () => void;
}

// ============================================================================
// RESPONSIVE TYPES
// ============================================================================

export interface ResponsiveConfig {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

export interface GridItemProps {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  children: React.ReactNode;
}

// ============================================================================
// THEME TYPES
// ============================================================================

export interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  surface: string;
  text: string;
}

export interface TypographyConfig {
  fontFamily: string;
  fontSize: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    bold: number;
  };
}

// ============================================================================
// STATE MANAGEMENT TYPES
// ============================================================================

export interface HomePageState {
  currentSection: string;
  isAnimating: boolean;
  loadedSections: string[];
}

export interface HomePageActions {
  setCurrentSection: (section: string) => void;
  setIsAnimating: (animating: boolean) => void;
  addLoadedSection: (section: string) => void;
}

// ============================================================================
// HOOK TYPES
// ============================================================================

export interface UseHomePageDataReturn {
  features: PremiumFeature[];
  metrics: PerformanceMetric[];
  testimonials: CustomerTestimonial[];
  algorithms: AlgorithmCard[];
  isLoading: boolean;
  error: string | null;
}

export interface UseHomePageNavigationReturn {
  onGetStarted: () => void;
  onLearnMore: () => void;
  onContactUs: () => void;
  onScrollToSection: (sectionId: string) => void;
}

// ============================================================================
// EVENT HANDLER TYPES
// ============================================================================

export type GetStartedHandler = () => void;
export type LearnMoreHandler = () => void;
export type ContactUsHandler = () => void;
export type ScrollToSectionHandler = (sectionId: string) => void;

// ============================================================================
// STYLING TYPES
// ============================================================================

export interface StylingConstants {
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    small: number;
    medium: number;
    large: number;
  };
  shadows: {
    light: string;
    medium: string;
    heavy: string;
  };
  transitions: {
    fast: string;
    normal: string;
    slow: string;
  };
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  includeCharts: boolean;
  includeTestimonials: boolean;
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// ACCESSIBILITY TYPES
// ============================================================================

export interface AccessibilityConfig {
  ariaLabels: {
    heroSection: string;
    featuresSection: string;
    metricsSection: string;
    testimonialsSection: string;
    algorithmsSection: string;
    ctaSection: string;
  };
  keyboardShortcuts: {
    skipToContent: string;
    navigateSections: string;
  };
}

// ============================================================================
// PERFORMANCE TYPES
// ============================================================================

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
}

export interface AnalyticsConfig {
  trackingId: string;
  enabled: boolean;
  debug: boolean;
}
