/**
 * LEMNİX Design System
 * Merkezi tasarım sistemi - tüm bileşenler bu değerleri kullanmalı
 */

// ============================================================================
// SPACING SYSTEM - 8px grid sistemi
// ============================================================================
export const spacing = {
  xs: 1,    // 8px
  sm: 2,    // 16px  
  md: 3,    // 24px
  lg: 4,    // 32px
  xl: 6,    // 48px
  xxl: 8,   // 64px
} as const;

// Responsive spacing - tutarlı kullanım için
export const responsiveSpacing = {
  page: { xs: spacing.sm, md: spacing.md, lg: spacing.lg },
  section: { xs: spacing.md, md: spacing.lg, lg: spacing.xl },
  card: { xs: spacing.sm, md: spacing.md },
  component: spacing.sm,
} as const;

// ============================================================================
// COLOR PALETTE - Merkezi renk sistemi
// ============================================================================
export const colors = {
  // Ana renkler
  primary: {
    50: '#e8eaf6',
    100: '#c5cae9', 
    200: '#9fa8da',
    300: '#7986cb',
    400: '#5c6bc0',
    500: '#3f51b5', // Ana primary
    600: '#3949ab',
    700: '#303f9f',
    800: '#283593',
    900: '#1a237e', // Koyu primary
  },
  secondary: {
    50: '#fff3e0',
    100: '#ffe0b2',
    200: '#ffcc80',
    300: '#ffb74d',
    400: '#ffa726',
    500: '#ff9800', // Ana secondary
    600: '#fb8c00',
    700: '#f57c00',
    800: '#ef6c00',
    900: '#e65100',
  },
  // Nötr renkler
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  // Durum renkleri
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    700: '#15803d',
  },
  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    700: '#d97706',
  },
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    700: '#dc2626',
  },
  info: {
    50: '#eff6ff',
    500: '#3b82f6',
    700: '#1d4ed8',
  },
} as const;

// ============================================================================
// TYPOGRAPHY SYSTEM - Tutarlı tipografi
// ============================================================================
export const typography = {
  fontFamily: {
    primary: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    mono: '"Fira Code", "Consolas", monospace',
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  lineHeight: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
} as const;

// ============================================================================
// COMPONENT SIZES - Standart boyutlar
// ============================================================================
export const componentSizes = {
  button: {
    small: {
      height: 32,
      padding: '6px 12px',
      fontSize: typography.fontSize.sm,
    },
    medium: {
      height: 40,
      padding: '8px 16px', 
      fontSize: typography.fontSize.sm,
    },
    large: {
      height: 48,
      padding: '12px 24px',
      fontSize: typography.fontSize.base,
    },
  },
  input: {
    small: {
      height: 32,
      fontSize: typography.fontSize.sm,
    },
    medium: {
      height: 40,
      fontSize: typography.fontSize.sm,
    },
    large: {
      height: 48,
      fontSize: typography.fontSize.base,
    },
  },
  avatar: {
    small: { width: 32, height: 32 },
    medium: { width: 40, height: 40 },
    large: { width: 56, height: 56 },
    xlarge: { width: 72, height: 72 },
  },
  icon: {
    small: 16,
    medium: 20,
    large: 24,
    xlarge: 32,
  },
} as const;

// ============================================================================
// SHADOWS - Tutarlı gölge sistemi
// ============================================================================
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
} as const;

// ============================================================================
// BORDER RADIUS - Tutarlı köşe yuvarlaklığı
// ============================================================================
export const borderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

// ============================================================================
// BREAKPOINTS - Responsive tasarım
// ============================================================================
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
} as const;

// ============================================================================
// GRADIENTS - Marka gradientleri
// ============================================================================
export const gradients = {
  primary: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
  primaryReverse: 'linear-gradient(135deg, #3949ab 0%, #1a237e 100%)',
  secondary: 'linear-gradient(135deg, #ff6f00 0%, #ffa040 100%)',
  neutral: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
  card: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
} as const;

// ============================================================================
// Z-INDEX SCALE - Katman yönetimi
// ============================================================================
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// ============================================================================
// HELPER FUNCTIONS - Yardımcı fonksiyonlar
// ============================================================================

/**
 * Responsive değer oluşturucu
 */
export const responsive = {
  spacing: (xs: keyof typeof spacing, md?: keyof typeof spacing, lg?: keyof typeof spacing) => ({
    xs: spacing[xs],
    ...(md && { md: spacing[md] }),
    ...(lg && { lg: spacing[lg] }),
  }),
  fontSize: (xs: keyof typeof typography.fontSize, md?: keyof typeof typography.fontSize, lg?: keyof typeof typography.fontSize) => ({
    xs: typography.fontSize[xs],
    ...(md && { md: typography.fontSize[md] }),
    ...(lg && { lg: typography.fontSize[lg] }),
  }),
};

/**
 * Renk opacity ekleme
 */
export const withOpacity = (color: string, opacity: number) => {
  return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
};
