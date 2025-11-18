/**
 * @fileoverview Ultra-Compact Adaptive UI System
 * @module shared/hooks/useAdaptiveUI
 * @version 2.2.0
 *
 * @description
 * Aggressively optimized design token system for modern displays.
 * Prioritizes content over chrome, eliminates excessive whitespace.
 *
 * Philosophy:
 * - Content first, decoration second
 * - Aggressive viewport scaling for large displays
 * - Minimal padding by default
 * - Users want to see MORE, not LESS
 *
 * @author UI/UX Design System Team
 */

import { useMemo } from "react";
import { useDeviceInfo, type DeviceInfo, type UIMode } from "./useDeviceInfo";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type DensityLevel = "comfortable" | "standard" | "compact";

export interface TypographyScale {
  readonly xs: number;
  readonly sm: number;
  readonly base: number;
  readonly lg: number;
  readonly xl: number;
  readonly xxl: number;
}

export interface SpacingScale {
  readonly xxs: number;
  readonly xs: number;
  readonly sm: number;
  readonly md: number;
  readonly lg: number;
  readonly xl: number;
  readonly xxl: number;
}

export interface ComponentSizes {
  readonly button: {
    readonly sm: number;
    readonly md: number;
    readonly lg: number;
  };
  readonly input: {
    readonly sm: number;
    readonly md: number;
    readonly lg: number;
  };
  readonly icon: {
    readonly xs: number;
    readonly sm: number;
    readonly md: number;
    readonly lg: number;
    readonly xl: number;
  };
  readonly avatar: {
    readonly xs: number;
    readonly sm: number;
    readonly md: number;
    readonly lg: number;
    readonly xl: number;
  };
  readonly card: {
    readonly padding: number;
    readonly gap: number;
  };
  readonly minTouchTarget: number;
}

export interface BorderRadiusScale {
  readonly none: number;
  readonly sm: number;
  readonly md: number;
  readonly lg: number;
  readonly xl: number;
  readonly full: number;
}

export interface MotionTokens {
  readonly duration: {
    readonly fast: number;
    readonly base: number;
    readonly slow: number;
  };
  readonly easing: {
    readonly standard: string;
    readonly decelerate: string;
    readonly accelerate: string;
  };
}

export interface AdaptiveTokens {
  readonly scale: number;
  readonly density: DensityLevel;
  readonly maxContentWidth: number;
  readonly containerWidth: "full" | "constrained";
  readonly typography: TypographyScale;
  readonly spacing: SpacingScale & {
    readonly unit: number;
    readonly fn: (multiplier: number) => number;
  };
  readonly components: ComponentSizes;
  readonly borderRadius: BorderRadiusScale;
  readonly motion: MotionTokens;
  readonly layout: {
    readonly containerPadding: number;
    readonly sectionSpacing: number;
    readonly gridGap: number;
    readonly maxWidth: number | "none";
  };
  readonly _debug?: {
    readonly viewportWidth: number;
    readonly viewportScale: number;
    readonly spacingScale: number;
    readonly finalScale: number;
    readonly uiMode: UIMode;
    readonly containerStrategy: string;
  };
}

// ============================================================================
// AGGRESSIVE VIEWPORT SCALING
// ============================================================================

/**
 * VERY AGGRESSIVE viewport scaling for large displays
 * 
 * Problem: Büyük ekranlarda her şey çok büyük, boşluklar içeriği yiyor
 * Solution: Çok daha agresif scale down
 * 
 * Scale factors:
 * - Up to 1366px: 1.0x (normal)
 * - 1366-1920px: 1.0 → 0.85x (hafif azalt)
 * - 1920-2560px: 0.85 → 0.65x (ciddi azalt)
 * - 2560-3840px: 0.65 → 0.5x (çok ciddi azalt)
 * - 3840px+: 0.5x (minimum, %50 küçültme)
 */
function calculateViewportScale(width: number): number {
  // Mobil ve küçük laptop: normal
  if (width <= 1366) return 1.0;
  
  // Laptop to Full HD (1366 - 1920): Hafif azaltma
  if (width <= 1920) {
    return interpolate(width, 1366, 1920, 1.0, 0.85);
  }
  
  // Full HD to 2K (1920 - 2560): Ciddi azaltma
  if (width <= 2560) {
    return interpolate(width, 1920, 2560, 0.85, 0.65);
  }
  
  // 2K to 4K (2560 - 3840): Çok ciddi azaltma
  if (width <= 3840) {
    return interpolate(width, 2560, 3840, 0.65, 0.5);
  }
  
  // 4K+: Minimum scale (%50 küçültme)
  return 0.5;
}

/**
 * SEPARATE spacing scale - even more aggressive than general scale
 * 
 * Spacing grows TOO FAST on large screens, needs extra reduction
 */
function calculateSpacingScale(width: number): number {
  // Mobil: normal
  if (width <= 1366) return 1.0;
  
  // Laptop to Full HD: spacing'i daha agresif azalt
  if (width <= 1920) {
    return interpolate(width, 1366, 1920, 1.0, 0.75);
  }
  
  // Full HD to 2K: spacing'i çok daha agresif azalt
  if (width <= 2560) {
    return interpolate(width, 1920, 2560, 0.75, 0.5);
  }
  
  // 2K+: Minimum spacing (yarı boyut)
  return 0.5;
}

function interpolate(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  const ratio = Math.max(0, Math.min(1, (value - inMin) / (inMax - inMin)));
  return outMin + (outMax - outMin) * ratio;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ============================================================================
// DYNAMIC CONTAINER WIDTH CALCULATION
// ============================================================================

/**
 * Calculate optimal container max-width based on viewport
 * 
 * Philosophy:
 * - Small screens (< 1366px): Constrained width for readability
 * - Medium screens (1366-1920px): Slightly wider
 * - Large screens (1920-2560px): Much wider, use available space
 * - Ultra screens (2560px+): FULL WIDTH, no constraints
 * 
 * Users with big screens PAID for that space, let them use it!
 */
function calculateContainerMaxWidth(width: number, uiMode: UIMode): {
  maxWidth: number | "none";
  strategy: "full" | "wide" | "standard" | "narrow";
} {
  // Mobile: Always full width
  if (uiMode === "mobile") {
    return { maxWidth: width, strategy: "full" };
  }
  
  // Ultra-wide screens (2560px+): FULL WIDTH
  if (width >= 2560) {
    return { maxWidth: "none", strategy: "full" };
  }
  
  // Large screens (1920-2560px): Very wide
  if (width >= 1920) {
    const maxWidth = Math.floor(width * 0.95); // 95% of viewport
    return { maxWidth, strategy: "wide" };
  }
  
  // Medium screens (1366-1920px): Wide
  if (width >= 1366) {
    const maxWidth = Math.floor(width * 0.92); // 92% of viewport
    return { maxWidth, strategy: "wide" };
  }
  
  // Small laptops (1024-1366px): Standard
  if (width >= 1024) {
    return { maxWidth: 1280, strategy: "standard" };
  }
  
  // Tablet: Narrow
  return { maxWidth: 960, strategy: "narrow" };
}

// ============================================================================
// MINIMAL UI MODE PRESETS
// ============================================================================

/**
 * Minimalist presets - content over chrome
 */
const UI_MODE_PRESETS = {
  kiosk: {
    baseSize: 15,           // Daha küçük
    scaleMultiplier: 1.05,  // Daha az büyütme
    spacingUnit: 6,         // 8 → 6 (daha kompakt)
    density: "comfortable" as DensityLevel,
    minTouchTarget: 48,     // 56 → 48 (hala büyük ama makul)
    maxContentWidth: 2400,
    applyViewportScaling: true,
    applySpacingScale: true,
  },
  
  dense: {
    baseSize: 13,
    scaleMultiplier: 0.92,  // 0.95 → 0.92
    spacingUnit: 3,         // 4 → 3 (minimum)
    density: "compact" as DensityLevel,
    minTouchTarget: 28,     // 32 → 28 (bilgi yoğunluğu öncelik)
    maxContentWidth: 1920,
    applyViewportScaling: true,
    applySpacingScale: true,
  },
  
  standard: {
    baseSize: 14,
    scaleMultiplier: 0.96,  // 1.0 → 0.96 (hafif küçült)
    spacingUnit: 6,         // 8 → 6
    density: "standard" as DensityLevel,
    minTouchTarget: 36,     // 40 → 36
    maxContentWidth: 1440,
    applyViewportScaling: true,
    applySpacingScale: true,
  },
  
  compact: {
    baseSize: 13,           // 14 → 13
    scaleMultiplier: 0.92,  // 0.97 → 0.92
    spacingUnit: 4,         // 6 → 4
    density: "compact" as DensityLevel,
    minTouchTarget: 32,     // 36 → 32
    maxContentWidth: 1280,
    applyViewportScaling: true,
    applySpacingScale: true,
  },
  
  mobile: {
    baseSize: 16,
    scaleMultiplier: 1.0,
    spacingUnit: 6,         // 8 → 6 (mobilde bile kompakt)
    density: "standard" as DensityLevel,
    minTouchTarget: 44,
    maxContentWidth: 768,
    applyViewportScaling: false,
    applySpacingScale: false,
  },
} as const;

// ============================================================================
// ULTRA-COMPACT TOKEN CALCULATION
// ============================================================================

function calculateAdaptiveTokens(
  uiMode: UIMode,
  device: DeviceInfo
): AdaptiveTokens {
  const preset = UI_MODE_PRESETS[uiMode];
  
  // 1. Calculate viewport scales
  const viewportScale = preset.applyViewportScaling
    ? calculateViewportScale(device.width)
    : 1.0;
  
  const spacingScale = preset.applySpacingScale
    ? calculateSpacingScale(device.width)
    : 1.0;
  
  // 2. Combine scales
  const finalScale = preset.scaleMultiplier * viewportScale;
  
  // 3. Base size with scale
  let baseSize = preset.baseSize;
  
  // High DPI: sadece çok hafif artış
  if (device.isHighDPI && (uiMode === "mobile" || uiMode === "standard")) {
    baseSize += 0.5;
  }
  
  const scaledBaseSize = Math.round(baseSize * finalScale);
  const clampedBaseSize = clamp(scaledBaseSize, 11, 18); // 12→11, 20→18
  
  // 4. AGGRESSIVE spacing reduction
  const baseSpacingUnit = preset.spacingUnit;
  const spacingUnit = Math.max(
    2, // Minimum 2px (daha önce 4px idi)
    Math.round(baseSpacingUnit * spacingScale)
  );
  
  // ============================================================================
  // TYPOGRAPHY
  // ============================================================================
  
  const typography: TypographyScale = {
    xs: Math.round(clampedBaseSize * 0.75),
    sm: Math.round(clampedBaseSize * 0.875),
    base: clampedBaseSize,
    lg: Math.round(clampedBaseSize * 1.125),
    xl: Math.round(clampedBaseSize * 1.25),
    xxl: Math.round(clampedBaseSize * 1.5),
  };
  
  // ============================================================================
  // MINIMAL SPACING SCALE
  // ============================================================================
  
  const spacing: AdaptiveTokens["spacing"] = {
    unit: spacingUnit,
    xxs: Math.max(1, Math.round(spacingUnit * 0.5)),  // 0.5x
    xs: spacingUnit,                                   // 1x
    sm: Math.round(spacingUnit * 1.5),                 // 1.5x (önce 1.5x idi)
    md: spacingUnit * 2,                               // 2x (önce 2x idi)
    lg: spacingUnit * 3,                               // 3x (önce 3x idi)
    xl: spacingUnit * 4,                               // 4x (önce 4x idi)
    xxl: spacingUnit * 5,                              // 5x (önce 6x idi)
    fn: (multiplier: number) => multiplier * spacingUnit,
  };
  
  // ============================================================================
  // COMPACT COMPONENT SIZES
  // ============================================================================
  
  const scaledTouchTarget = Math.round(preset.minTouchTarget * finalScale);
  const minTouchTarget = clamp(
    scaledTouchTarget,
    uiMode === "mobile" ? 44 : 28, // Dense: 28px OK
    56 // Maximum
  );
  
  const components: ComponentSizes = {
    button: {
      sm: Math.round(minTouchTarget * 0.7),  // 0.75 → 0.7
      md: Math.round(minTouchTarget * 0.85), // 0.9 → 0.85
      lg: minTouchTarget,
    },
    input: {
      sm: Math.round(minTouchTarget * 0.75), // 0.8 → 0.75
      md: Math.round(minTouchTarget * 0.85), // 0.9 → 0.85
      lg: minTouchTarget,
    },
    icon: {
      xs: Math.round(typography.xs * 1.1),   // 1.2 → 1.1
      sm: Math.round(typography.sm * 1.1),
      md: Math.round(typography.base * 1.15), // 1.2 → 1.15
      lg: Math.round(typography.lg * 1.2),    // 1.3 → 1.2
      xl: Math.round(typography.xl * 1.25),   // 1.4 → 1.25
    },
    avatar: {
      xs: spacing.sm,      // md → sm
      sm: spacing.md,      // lg → md
      md: spacing.lg,      // xl → lg
      lg: spacing.xl,      // xxl → xl
      xl: spacing.xxl,     // xxxl → xxl
    },
    card: {
      padding: spacing.sm,  // md → sm (ÇOK ÖNEMLİ: Card padding'i yarıya düştü)
      gap: spacing.xs,      // sm → xs (Card içi gap'i daha da küçülttük)
    },
    minTouchTarget,
  };
  
  // ============================================================================
  // MINIMAL BORDER RADIUS
  // ============================================================================
  
  const borderRadius: BorderRadiusScale = {
    none: 0,
    sm: Math.max(2, Math.round(spacingUnit * 0.5)),
    md: Math.max(3, spacingUnit),
    lg: Math.max(4, Math.round(spacingUnit * 1.5)),
    xl: Math.max(6, spacingUnit * 2),
    full: 9999,
  };
  
  // ============================================================================
  // MOTION TOKENS
  // ============================================================================
  
  const motion: MotionTokens = {
    duration: {
      fast: 150,
      base: 250,
      slow: 400,
    },
    easing: {
      standard: "cubic-bezier(0.4, 0.0, 0.2, 1)",
      decelerate: "cubic-bezier(0.0, 0.0, 0.2, 1)",
      accelerate: "cubic-bezier(0.4, 0.0, 1, 1)",
    },
  };
  
  // ============================================================================
  // MINIMAL LAYOUT WITH DYNAMIC WIDTH
  // ============================================================================
  
  const containerConfig = calculateContainerMaxWidth(device.width, uiMode);
  
  const layout = {
    containerPadding: spacing.sm,  // md → sm (Container padding azaltıldı)
    sectionSpacing: spacing.md,    // xl → md (Section spacing ciddi azaltıldı)
    gridGap: spacing.xs,           // md → xs (Grid gap azaltıldı)
    maxWidth: containerConfig.maxWidth, // Dynamic max-width
  };
  
  return {
    scale: finalScale,
    density: preset.density,
    maxContentWidth: typeof containerConfig.maxWidth === "number" 
      ? containerConfig.maxWidth 
      : device.width,
    containerWidth: containerConfig.maxWidth === "none" ? "full" : "constrained",
    typography,
    spacing,
    components,
    borderRadius,
    motion,
    layout,
    
    _debug: {
      viewportWidth: device.width,
      viewportScale,
      spacingScale,
      finalScale,
      uiMode,
      containerStrategy: containerConfig.strategy,
    },
  };
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Ultra-Compact Adaptive UI Hook
 *
 * @description
 * Aggressively optimized for content density. Minimizes whitespace,
 * maximizes visible content. Perfect for data-heavy applications.
 *
 * Container Width Strategy:
 * - 2560px+: Full width (no max-width constraint)
 * - 1920-2560px: 95% of viewport width
 * - 1366-1920px: 92% of viewport width
 * - 1024-1366px: 1280px max
 * - <1024px: 960px max
 *
 * @example
 * ```tsx
 * const { device, tokens } = useAdaptiveUI();
 *
 * // Container with dynamic max-width
 * <Container
 *   style={{
 *     maxWidth: tokens.layout.maxWidth === "none" ? "100%" : tokens.layout.maxWidth,
 *     padding: tokens.layout.containerPadding,
 *   }}
 * >
 *   <Card style={{ padding: tokens.components.card.padding }}>
 *     Content
 *   </Card>
 * </Container>
 *
 * // Check container strategy
 * console.log(tokens._debug?.containerStrategy);
 * // On 3840px: "full"
 * // On 1920px: "wide"
 * ```
 */
export function useAdaptiveUI() {
  const device = useDeviceInfo();
  
  const tokens = useMemo<AdaptiveTokens>(
    () => calculateAdaptiveTokens(device.uiMode, device),
    [device.uiMode, device.width, device.isHighDPI]
  );
  
  return { device, tokens };
}

export interface AdaptiveVariantOptions<T> {
  readonly mobile: T;
  readonly compact?: T;
  readonly standard: T;
  readonly dense?: T;
  readonly kiosk?: T;
}

export function useAdaptiveVariant<T>(
  options: AdaptiveVariantOptions<T>
): T {
  const { device } = useAdaptiveUI();
  const mode = device.uiMode;
  
  switch (mode) {
    case "mobile":
      return options.mobile;
    case "compact":
      return options.compact ?? options.standard;
    case "dense":
      return options.dense ?? options.standard;
    case "kiosk":
      return options.kiosk ?? options.standard;
    case "standard":
    default:
      return options.standard;
  }
}

export interface ResponsiveValueOptions<T> {
  readonly comfortable?: T;
  readonly standard: T;
  readonly compact?: T;
}

export function useResponsiveValue<T>(
  options: ResponsiveValueOptions<T>
): T {
  const { tokens } = useAdaptiveUI();
  const density = tokens.density;
  
  switch (density) {
    case "comfortable":
      return options.comfortable ?? options.standard;
    case "compact":
      return options.compact ?? options.standard;
    case "standard":
    default:
      return options.standard;
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

export function createSpacing(tokens: AdaptiveTokens) {
  return (...values: number[]): string => {
    return values.map(v => `${tokens.spacing.fn(v)}px`).join(" ");
  };
}

export function supportsHover(device: DeviceInfo): boolean {
  return device.uiMode !== "mobile" && device.uiMode !== "kiosk";
}

export function isTouchPrimary(device: DeviceInfo): boolean {
  return device.uiMode === "mobile" || device.uiMode === "kiosk";
}

export function getViewportCategory(width: number): string {
  if (width <= 768) return "mobile";
  if (width <= 1366) return "laptop";
  if (width <= 1920) return "desktop";
  if (width <= 2560) return "2k";
  if (width <= 3840) return "4k";
  return "ultra";
}

/**
 * Get container class helper
 * 
 * Returns CSS-in-JS styles for container based on tokens
 * 
 * @example
 * ```tsx
 * const { tokens } = useAdaptiveUI();
 * const containerStyle = getContainerStyle(tokens);
 * 
 * <div style={containerStyle}>
 *   Content uses full width on large screens!
 * </div>
 * ```
 */
export function getContainerStyle(tokens: AdaptiveTokens): React.CSSProperties {
  return {
    maxWidth: tokens.layout.maxWidth === "none" ? "100%" : `${tokens.layout.maxWidth}px`,
    width: "100%",
    marginLeft: "auto",
    marginRight: "auto",
    paddingLeft: `${tokens.layout.containerPadding}px`,
    paddingRight: `${tokens.layout.containerPadding}px`,
  };
}

/**
 * Check if container should be full width
 */
export function isFullWidthContainer(tokens: AdaptiveTokens): boolean {
  return tokens.layout.maxWidth === "none";
}