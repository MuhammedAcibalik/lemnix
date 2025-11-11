/**
 * @fileoverview Design System v3.0 - Enhanced Modern Industrial
 * @description Comprehensive design tokens with semantic meaning and architectural consistency
 * @version 3.0.0 - Complete UI/UX Modernization
 */

// ============================================================================
// SPACING SYSTEM - T-shirt sizes + Numeric scale
// ============================================================================
export const spacing = {
  "0": 0,
  "0.5": 2,
  "1": 4,
  "1.5": 6,
  "2": 8,
  "2.5": 10,
  "3": 12,
  "3.5": 14,
  "4": 16,
  "5": 20,
  "6": 24,
  "7": 28,
  "8": 32,
  "9": 36,
  "10": 40,
  "11": 44,
  "12": 48,
  "14": 56,
  "16": 64,
  "20": 80,
  "24": 96,
  "28": 112,
  "32": 128,
  "36": 144,
  "40": 160,
  "44": 176,
  "48": 192,
  "52": 208,
  "56": 224,
  "60": 240,
  "64": 256,
  "72": 288,
  "80": 320,
  "96": 384,
} as const;

export const spacingScale = {
  xs: spacing["2"],
  sm: spacing["4"],
  md: spacing["6"],
  lg: spacing["8"],
  xl: spacing["12"],
  "2xl": spacing["16"],
  "3xl": spacing["24"],
  "4xl": spacing["32"],
} as const;

// ============================================================================
// COLOR SYSTEM - Enhanced with semantic meaning
// ============================================================================

// Brand Colors - Primary palette for brand identity
export const brandColors = {
  primary: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
    950: "#172554",
  },
  secondary: {
    50: "#ecfdf5",
    100: "#d1fae5",
    200: "#a7f3d0",
    300: "#6ee7b7",
    400: "#34d399",
    500: "#10b981",
    600: "#059669",
    700: "#047857",
    800: "#065f46",
    900: "#064e3b",
    950: "#022c22",
  },
  accent: {
    50: "#faf5ff",
    100: "#f3e8ff",
    200: "#e9d5ff",
    300: "#d8b4fe",
    400: "#c084fc",
    500: "#a855f7",
    600: "#9333ea",
    700: "#7c3aed",
    800: "#6b21a8",
    900: "#581c87",
    950: "#3b0764",
  },
} as const;

// Semantic Colors - Status and feedback
export const semanticColors = {
  success: {
    50: "#ecfdf5",
    100: "#d1fae5",
    200: "#a7f3d0",
    300: "#6ee7b7",
    400: "#34d399",
    500: "#10b981",
    600: "#059669",
    700: "#047857",
    800: "#065f46",
    900: "#064e3b",
  },
  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },
  error: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
  },
  info: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
  },
} as const;

// Neutral Colors - Backgrounds, borders, text
export const neutralColors = {
  50: "#fafafa",
  100: "#f5f5f5",
  150: "#f0f0f0",
  200: "#e5e5e5",
  300: "#d4d4d4",
  400: "#a3a3a3",
  500: "#737373",
  600: "#525252",
  700: "#404040",
  800: "#262626",
  900: "#171717",
  950: "#0a0a0a",
} as const;

// Slate Colors - Alternative neutrals with blue undertone
export const slateColors = {
  50: "#f8fafc",
  100: "#f1f5f9",
  200: "#e2e8f0",
  300: "#cbd5e1",
  400: "#94a3b8",
  500: "#64748b",
  600: "#475569",
  700: "#334155",
  800: "#1e293b",
  900: "#0f172a",
  950: "#020617",
} as const;

// Functional Colors - Domain-specific
export const functionalColors = {
  optimization: {
    optimal: semanticColors.success[600],
    efficient: brandColors.primary[600],
    average: semanticColors.warning[500],
    poor: semanticColors.error[500],
  },
  production: {
    completed: semanticColors.success[600],
    inProgress: brandColors.primary[600],
    pending: neutralColors[400],
    cancelled: semanticColors.error[600],
  },
  material: {
    aluminum: neutralColors[400],
    steel: neutralColors[700],
    wood: semanticColors.warning[600],
    plastic: brandColors.accent[500],
  },
} as const;

// Unified color export
export const colors = {
  // Brand
  primary: {
    ...brandColors.primary,
    main: brandColors.primary[700],
    light: brandColors.primary[500],
    dark: brandColors.primary[900],
    contrast: "#ffffff",
  },
  secondary: {
    ...brandColors.secondary,
    main: brandColors.secondary[600],
    light: brandColors.secondary[500],
    dark: brandColors.secondary[800],
    contrast: "#ffffff",
  },
  accent: {
    ...brandColors.accent,
    main: brandColors.accent[600],
    light: brandColors.accent[500],
    dark: brandColors.accent[800],
    contrast: "#ffffff",
  },

  // Semantic
  success: {
    ...semanticColors.success,
    main: semanticColors.success[600],
    light: semanticColors.success[400],
    dark: semanticColors.success[800],
  },
  warning: {
    ...semanticColors.warning,
    main: semanticColors.warning[500],
    light: semanticColors.warning[400],
    dark: semanticColors.warning[700],
  },
  error: {
    ...semanticColors.error,
    main: semanticColors.error[500],
    light: semanticColors.error[400],
    dark: semanticColors.error[700],
  },
  info: {
    ...semanticColors.info,
    main: semanticColors.info[600],
    light: semanticColors.info[400],
    dark: semanticColors.info[800],
  },
  support: {
    ...semanticColors.info,
    main: semanticColors.info[600],
    light: semanticColors.info[400],
    dark: semanticColors.info[800],
  },

  // Neutrals
  neutral: neutralColors,
  slate: slateColors,
  grey: slateColors, // Alias for Material-UI

  // Surfaces
  surface: {
    base: "#ffffff",
    elevated1: slateColors[50],
    elevated2: slateColors[100],
    elevated3: slateColors[200],
    overlay: "rgba(15, 23, 42, 0.5)",
    inverse: slateColors[900],
  },

  // Backgrounds
  background: {
    default: slateColors[50],
    paper: "#ffffff",
    subtle: slateColors[100],
    muted: slateColors[200],
  },

  // Text
  text: {
    primary: slateColors[900],
    secondary: slateColors[600],
    tertiary: slateColors[500],
    disabled: slateColors[400],
    inverse: "#ffffff",
    link: brandColors.primary[600],
    linkHover: brandColors.primary[800],
  },

  // Borders
  border: {
    default: slateColors[200],
    muted: slateColors[100],
    subtle: slateColors[50],
    strong: slateColors[300],
  },

  // Functional
  functional: functionalColors,
} as const;

// ============================================================================
// TYPOGRAPHY SYSTEM - Enhanced hierarchy
// ============================================================================

export const fontFamily = {
  sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  serif: '"Merriweather", Georgia, Cambria, "Times New Roman", Times, serif',
  mono: '"JetBrains Mono", "Fira Code", "Consolas", "Monaco", monospace',
  display: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
} as const;

export const fontSize = {
  "2xs": "0.625rem", // 10px
  xs: "0.75rem", // 12px
  sm: "0.875rem", // 14px
  base: "1rem", // 16px
  lg: "1.125rem", // 18px
  xl: "1.25rem", // 20px
  "2xl": "1.5rem", // 24px
  "3xl": "1.875rem", // 30px
  "4xl": "2.25rem", // 36px
  "5xl": "3rem", // 48px
  "6xl": "3.75rem", // 60px
  "7xl": "4.5rem", // 72px
  "8xl": "6rem", // 96px
  "9xl": "8rem", // 128px
} as const;

export const fontWeight = {
  thin: 100,
  extralight: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
} as const;

export const lineHeight = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
  "3": 0.75,
  "4": 1,
  "5": 1.25,
  "6": 1.5,
  "7": 1.75,
  "8": 2,
  "9": 2.25,
  "10": 2.5,
} as const;

export const letterSpacing = {
  tighter: "-0.05em",
  tight: "-0.025em",
  normal: "0em",
  wide: "0.025em",
  wider: "0.05em",
  widest: "0.1em",
} as const;

export const typography = {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,

  // Display styles - Hero text
  display: {
    "2xl": {
      fontSize: fontSize["8xl"],
      fontWeight: fontWeight.extrabold,
      lineHeight: lineHeight.none,
      letterSpacing: letterSpacing.tighter,
    },
    xl: {
      fontSize: fontSize["7xl"],
      fontWeight: fontWeight.extrabold,
      lineHeight: lineHeight.none,
      letterSpacing: letterSpacing.tighter,
    },
    lg: {
      fontSize: fontSize["6xl"],
      fontWeight: fontWeight.bold,
      lineHeight: lineHeight.tight,
      letterSpacing: letterSpacing.tight,
    },
    md: {
      fontSize: fontSize["5xl"],
      fontWeight: fontWeight.bold,
      lineHeight: lineHeight.tight,
      letterSpacing: letterSpacing.tight,
    },
    sm: {
      fontSize: fontSize["4xl"],
      fontWeight: fontWeight.bold,
      lineHeight: lineHeight.snug,
      letterSpacing: letterSpacing.tight,
    },
    xs: {
      fontSize: fontSize["3xl"],
      fontWeight: fontWeight.semibold,
      lineHeight: lineHeight.snug,
      letterSpacing: letterSpacing.normal,
    },
  },

  // Heading styles
  heading: {
    h1: {
      fontSize: fontSize["4xl"],
      fontWeight: fontWeight.bold,
      lineHeight: lineHeight.tight,
      letterSpacing: letterSpacing.tight,
    },
    h2: {
      fontSize: fontSize["3xl"],
      fontWeight: fontWeight.bold,
      lineHeight: lineHeight.snug,
      letterSpacing: letterSpacing.tight,
    },
    h3: {
      fontSize: fontSize["2xl"],
      fontWeight: fontWeight.semibold,
      lineHeight: lineHeight.snug,
      letterSpacing: letterSpacing.normal,
    },
    h4: {
      fontSize: fontSize.xl,
      fontWeight: fontWeight.semibold,
      lineHeight: lineHeight.normal,
      letterSpacing: letterSpacing.normal,
    },
    h5: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.medium,
      lineHeight: lineHeight.normal,
      letterSpacing: letterSpacing.normal,
    },
    h6: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.medium,
      lineHeight: lineHeight.normal,
      letterSpacing: letterSpacing.normal,
    },
  },

  // Body styles
  body: {
    xl: {
      fontSize: fontSize.xl,
      fontWeight: fontWeight.normal,
      lineHeight: lineHeight.relaxed,
    },
    lg: {
      fontSize: fontSize.lg,
      fontWeight: fontWeight.normal,
      lineHeight: lineHeight.relaxed,
    },
    base: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.normal,
      lineHeight: lineHeight.normal,
    },
    sm: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.normal,
      lineHeight: lineHeight.normal,
    },
    xs: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.normal,
      lineHeight: lineHeight.normal,
    },
    small: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.normal,
      lineHeight: lineHeight.normal,
    },
  },

  // Label styles
  label: {
    lg: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.semibold,
      letterSpacing: letterSpacing.wide,
      textTransform: "uppercase" as const,
    },
    base: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.medium,
      letterSpacing: letterSpacing.wide,
      textTransform: "uppercase" as const,
    },
    sm: {
      fontSize: fontSize["2xs"],
      fontWeight: fontWeight.medium,
      letterSpacing: letterSpacing.wider,
      textTransform: "uppercase" as const,
    },
  },

  // Legacy Material-UI compatibility
  h1: {
    fontSize: fontSize["4xl"],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
  h2: {
    fontSize: fontSize["3xl"],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.snug,
    letterSpacing: letterSpacing.tight,
  },
  h3: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.snug,
  },
  h4: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.normal,
  },
  h5: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.normal,
  },
  h6: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.normal,
  },
  body1: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
  },
  body2: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
  },
  button: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    textTransform: "none" as const,
    letterSpacing: letterSpacing.wide,
  },
  caption: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
  },
  overline: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textTransform: "uppercase" as const,
    letterSpacing: letterSpacing.widest,
  },
} as const;

// ============================================================================
// BORDER RADIUS SYSTEM
// ============================================================================

export const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  base: 6,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 20,
  "3xl": 24,
  "4xl": 28,
  full: 9999,
  // Semantic
  button: 8,
  input: 8,
  card: 12,
  modal: 16,
  chip: 16,
  pill: 9999,
} as const;

// ============================================================================
// SHADOW SYSTEM - Depth and elevation
// ============================================================================

export const shadows = {
  none: "none",

  // Soft shadows - Subtle elevation
  soft: {
    xs: "0 1px 2px rgba(15, 23, 42, 0.04)",
    sm: "0 2px 4px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)",
    base: "0 4px 6px rgba(15, 23, 42, 0.08), 0 2px 4px rgba(15, 23, 42, 0.04)",
    md: "0 6px 12px rgba(15, 23, 42, 0.10), 0 4px 6px rgba(15, 23, 42, 0.06)",
    lg: "0 10px 20px rgba(15, 23, 42, 0.12), 0 6px 12px rgba(15, 23, 42, 0.08)",
    xl: "0 20px 30px rgba(15, 23, 42, 0.15), 0 10px 20px rgba(15, 23, 42, 0.10)",
    "2xl":
      "0 30px 50px rgba(15, 23, 42, 0.18), 0 20px 30px rgba(15, 23, 42, 0.12)",
  },

  // Crisp shadows - Defined elevation
  crisp: {
    xs: "0 1px 3px rgba(15, 23, 42, 0.12)",
    sm: "0 2px 6px rgba(15, 23, 42, 0.16)",
    base: "0 4px 10px rgba(15, 23, 42, 0.20)",
    md: "0 6px 16px rgba(15, 23, 42, 0.24)",
    lg: "0 10px 24px rgba(15, 23, 42, 0.28)",
    xl: "0 16px 32px rgba(15, 23, 42, 0.32)",
    "2xl": "0 24px 48px rgba(15, 23, 42, 0.36)",
  },

  // Colored shadows - Brand glow
  glow: {
    primary:
      "0 0 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(59, 130, 246, 0.2)",
    secondary:
      "0 0 20px rgba(16, 185, 129, 0.4), 0 0 40px rgba(16, 185, 129, 0.2)",
    accent:
      "0 0 20px rgba(168, 85, 247, 0.4), 0 0 40px rgba(168, 85, 247, 0.2)",
    success:
      "0 0 20px rgba(16, 185, 129, 0.4), 0 0 40px rgba(16, 185, 129, 0.2)",
    warning:
      "0 0 20px rgba(245, 158, 11, 0.4), 0 0 40px rgba(245, 158, 11, 0.2)",
    error: "0 0 20px rgba(239, 68, 68, 0.4), 0 0 40px rgba(239, 68, 68, 0.2)",
  },

  // Inner shadows
  inner: {
    xs: "inset 0 1px 2px rgba(15, 23, 42, 0.08)",
    sm: "inset 0 2px 4px rgba(15, 23, 42, 0.12)",
    base: "inset 0 3px 6px rgba(15, 23, 42, 0.16)",
  },

  // Semantic shadows
  button: {
    default:
      "0 1px 3px rgba(15, 23, 42, 0.12), 0 1px 2px rgba(15, 23, 42, 0.08)",
    hover: "0 4px 8px rgba(15, 23, 42, 0.16), 0 2px 4px rgba(15, 23, 42, 0.12)",
    active: "0 1px 2px rgba(15, 23, 42, 0.12)",
  },
  card: {
    default:
      "0 2px 4px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)",
    hover:
      "0 8px 16px rgba(15, 23, 42, 0.12), 0 4px 8px rgba(15, 23, 42, 0.08)",
  },
  dropdown:
    "0 8px 20px rgba(15, 23, 42, 0.16), 0 4px 10px rgba(15, 23, 42, 0.12)",
  modal:
    "0 24px 48px rgba(15, 23, 42, 0.20), 0 12px 24px rgba(15, 23, 42, 0.16)",

  // Shorthand aliases for common usage
  xs: "0 1px 2px rgba(15, 23, 42, 0.04)",
  sm: "0 2px 4px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)",
  md: "0 6px 12px rgba(15, 23, 42, 0.10), 0 4px 6px rgba(15, 23, 42, 0.06)",
  lg: "0 10px 20px rgba(15, 23, 42, 0.12), 0 6px 12px rgba(15, 23, 42, 0.08)",
  xl: "0 20px 30px rgba(15, 23, 42, 0.15), 0 10px 20px rgba(15, 23, 42, 0.10)",
  "2xl":
    "0 30px 50px rgba(15, 23, 42, 0.18), 0 20px 30px rgba(15, 23, 42, 0.12)",
  "3xl":
    "0 40px 60px rgba(15, 23, 42, 0.20), 0 30px 50px rgba(15, 23, 42, 0.15)",
} as const;

// ============================================================================
// GRADIENT SYSTEM - Modern gradients
// ============================================================================

export const gradients = {
  // Brand gradients
  primary: {
    default: `linear-gradient(135deg, ${brandColors.primary[700]} 0%, ${brandColors.accent[600]} 100%)`,
    reverse: `linear-gradient(135deg, ${brandColors.accent[600]} 0%, ${brandColors.primary[700]} 100%)`,
    soft: `linear-gradient(135deg, ${brandColors.primary[500]} 0%, ${brandColors.accent[500]} 100%)`,
    subtle: `linear-gradient(135deg, rgba(29, 78, 216, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)`,
  },
  secondary: {
    default: `linear-gradient(135deg, ${brandColors.secondary[600]} 0%, ${brandColors.secondary[500]} 100%)`,
    reverse: `linear-gradient(135deg, ${brandColors.secondary[500]} 0%, ${brandColors.secondary[600]} 100%)`,
    soft: `linear-gradient(135deg, ${brandColors.secondary[400]} 0%, ${brandColors.secondary[500]} 100%)`,
    subtle: `linear-gradient(135deg, rgba(5, 150, 105, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)`,
  },
  accent: {
    default: `linear-gradient(135deg, ${brandColors.accent[600]} 0%, ${brandColors.accent[500]} 100%)`,
    reverse: `linear-gradient(135deg, ${brandColors.accent[500]} 0%, ${brandColors.accent[600]} 100%)`,
    soft: `linear-gradient(135deg, ${brandColors.accent[400]} 0%, ${brandColors.accent[500]} 100%)`,
    subtle: `linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)`,
  },

  // Mesh gradients - Background overlays
  mesh: {
    primary: `
      radial-gradient(at 0% 0%, ${brandColors.primary[500]}15 0px, transparent 50%),
      radial-gradient(at 100% 0%, ${brandColors.secondary[500]}15 0px, transparent 50%),
      radial-gradient(at 100% 100%, ${brandColors.accent[500]}15 0px, transparent 50%),
      radial-gradient(at 0% 100%, ${semanticColors.warning[500]}10 0px, transparent 50%)
    `,
    subtle: `
      radial-gradient(at 0% 0%, ${brandColors.primary[700]}08 0px, transparent 60%),
      radial-gradient(at 100% 100%, ${brandColors.secondary[600]}08 0px, transparent 60%)
    `,
    hero: `
      radial-gradient(ellipse at 50% 0%, ${brandColors.primary[500]}20 0px, transparent 50%),
      radial-gradient(ellipse at 100% 100%, ${brandColors.accent[500]}15 0px, transparent 50%)
    `,
  },

  // Surface gradients
  surface: {
    white: `linear-gradient(180deg, #ffffff 0%, ${slateColors[50]} 100%)`,
    elevated: `linear-gradient(180deg, ${slateColors[50]} 0%, ${slateColors[100]} 100%)`,
    subtle: `linear-gradient(180deg, ${slateColors[100]} 0%, ${slateColors[200]} 100%)`,
  },

  // Semantic gradients
  success: `linear-gradient(135deg, ${semanticColors.success[600]} 0%, ${semanticColors.success[500]} 100%)`,
  warning: `linear-gradient(135deg, ${semanticColors.warning[500]} 0%, ${semanticColors.warning[400]} 100%)`,
  error: `linear-gradient(135deg, ${semanticColors.error[500]} 0%, ${semanticColors.error[600]} 100%)`,
  info: `linear-gradient(135deg, ${semanticColors.info[600]} 0%, ${semanticColors.info[500]} 100%)`,

  // Special gradients
  glass: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)`,
  shimmer: `linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 50%, transparent 100%)`,
  rainbow: `linear-gradient(90deg, 
    ${brandColors.primary[500]} 0%, 
    ${brandColors.accent[500]} 25%, 
    ${semanticColors.warning[500]} 50%, 
    ${brandColors.secondary[500]} 75%, 
    ${brandColors.primary[500]} 100%)`,

  // Additional hover and premium gradients
  primaryHover: `linear-gradient(135deg, ${brandColors.primary[600]} 0%, ${brandColors.accent[500]} 100%)`,
  secondaryReverse: `linear-gradient(135deg, ${brandColors.secondary[500]} 0%, ${brandColors.secondary[600]} 100%)`,
  premium: `linear-gradient(135deg, ${brandColors.accent[600]} 0%, ${brandColors.primary[600]} 50%, ${brandColors.secondary[600]} 100%)`,
} as const;

// ============================================================================
// TRANSITION SYSTEM - Smooth animations
// ============================================================================

export const duration = {
  instant: 100,
  fast: 150,
  base: 250,
  moderate: 350,
  slow: 500,
  slower: 750,
  slowest: 1000,
} as const;

export const easing = {
  linear: "linear",
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  easeOut: "cubic-bezier(0, 0, 0.2, 1)",
  easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  sharp: "cubic-bezier(0.4, 0, 0.6, 1)",
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  smooth: "cubic-bezier(0.65, 0, 0.35, 1)",
} as const;

export const transitions = {
  duration,
  easing,

  // Preset transitions
  fast: `${duration.fast}ms ${easing.easeOut}`,
  base: `${duration.base}ms ${easing.easeInOut}`,
  slow: `${duration.slow}ms ${easing.easeInOut}`,
  spring: `${duration.moderate}ms ${easing.spring}`,

  // Property-specific
  all: `all ${duration.base}ms ${easing.easeInOut}`,
  transform: `transform ${duration.base}ms ${easing.easeOut}`,
  opacity: `opacity ${duration.fast}ms ${easing.easeInOut}`,
  color: `color ${duration.base}ms ${easing.easeInOut}`,
  background: `background-color ${duration.base}ms ${easing.easeInOut}`,
  border: `border-color ${duration.base}ms ${easing.easeInOut}`,
  shadow: `box-shadow ${duration.base}ms ${easing.easeOut}`,
} as const;

// ============================================================================
// Z-INDEX SYSTEM - Layering
// ============================================================================

export const zIndex = {
  hide: -1,
  auto: "auto",
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
// BREAKPOINT SYSTEM - Responsive design
// ============================================================================

export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

// ============================================================================
// COMPONENT SIZES - Consistent sizing
// ============================================================================

export const componentSizes = {
  button: {
    xs: {
      height: 24,
      padding: `${spacing["1"]}px ${spacing["2"]}px`,
      fontSize: fontSize["2xs"],
      gap: spacing["1"],
    },
    sm: {
      height: 32,
      padding: `${spacing["1.5"]}px ${spacing["3"]}px`,
      fontSize: fontSize.xs,
      gap: spacing["1.5"],
    },
    md: {
      height: 40,
      padding: `${spacing["2"]}px ${spacing["4"]}px`,
      fontSize: fontSize.sm,
      gap: spacing["2"],
    },
    lg: {
      height: 48,
      padding: `${spacing["2.5"]}px ${spacing["6"]}px`,
      fontSize: fontSize.base,
      gap: spacing["2.5"],
    },
    xl: {
      height: 56,
      padding: `${spacing["3"]}px ${spacing["8"]}px`,
      fontSize: fontSize.lg,
      gap: spacing["3"],
    },
  },
  input: {
    sm: {
      height: 32,
      padding: `${spacing["1.5"]}px ${spacing["3"]}px`,
      fontSize: fontSize.xs,
    },
    md: {
      height: 40,
      padding: `${spacing["2"]}px ${spacing["3"]}px`,
      fontSize: fontSize.sm,
    },
    lg: {
      height: 48,
      padding: `${spacing["2.5"]}px ${spacing["4"]}px`,
      fontSize: fontSize.base,
    },
  },
  avatar: {
    xs: { width: 24, height: 24 },
    sm: { width: 32, height: 32 },
    md: { width: 40, height: 40 },
    lg: { width: 48, height: 48 },
    xl: { width: 64, height: 64 },
    "2xl": { width: 80, height: 80 },
  },
  icon: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    "2xl": 40,
    small: 16,
    medium: 20,
    large: 24,
    xlarge: 32,
  },
} as const;

// ============================================================================
// GLASSMORPHISM - Modern UI effect
// ============================================================================

export const glass = {
  light: {
    background: "rgba(255, 255, 255, 0.8)",
    border: `1px solid rgba(255, 255, 255, 0.3)`,
    backdropFilter: "blur(20px) saturate(180%)",
    boxShadow: shadows.soft.md,
  },
  medium: {
    background: "rgba(255, 255, 255, 0.7)",
    border: `1px solid rgba(255, 255, 255, 0.2)`,
    backdropFilter: "blur(16px) saturate(160%)",
    boxShadow: shadows.soft.lg,
  },
  strong: {
    background: "rgba(255, 255, 255, 0.6)",
    border: `1px solid rgba(255, 255, 255, 0.15)`,
    backdropFilter: "blur(12px) saturate(140%)",
    boxShadow: shadows.soft.xl,
  },
  dark: {
    background: "rgba(15, 23, 42, 0.8)",
    border: `1px solid rgba(255, 255, 255, 0.1)`,
    backdropFilter: "blur(20px) saturate(180%)",
    boxShadow: shadows.crisp.lg,
  },
} as const;

// ============================================================================
// FOCUS SYSTEM - Accessibility
// ============================================================================

export const focus = {
  ring: {
    default: `0 0 0 3px ${brandColors.primary[500]}40`,
    primary: `0 0 0 3px ${brandColors.primary[500]}40`,
    secondary: `0 0 0 3px ${brandColors.secondary[500]}40`,
    success: `0 0 0 3px ${semanticColors.success[500]}40`,
    warning: `0 0 0 3px ${semanticColors.warning[500]}40`,
    error: `0 0 0 3px ${semanticColors.error[500]}40`,
  },
  offset: "0 0 0 2px white",
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const withOpacity = (color: string, opacity: number): string => {
  const opacityHex = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, "0");
  return `${color}${opacityHex}`;
};

export const createGradient = (
  color1: string,
  color2: string,
  angle: number = 135,
): string => {
  return `linear-gradient(${angle}deg, ${color1} 0%, ${color2} 100%)`;
};

export const createGlow = (color: string, intensity: number = 0.4): string => {
  return `0 0 20px ${withOpacity(color, intensity)}, 0 0 40px ${withOpacity(color, intensity * 0.5)}`;
};

// ============================================================================
// DESIGN TOKEN EXPORTS
// ============================================================================

export const designTokens = {
  spacing,
  spacingScale,
  colors,
  typography,
  borderRadius,
  shadows,
  gradients,
  transitions,
  zIndex,
  breakpoints,
  componentSizes,
  glass,
  focus,
} as const;

export default designTokens;
