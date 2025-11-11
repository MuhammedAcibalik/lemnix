/**
 * @fileoverview Accessibility Utilities - WCAG compliance helpers
 * @module shared/utils/accessibility
 * @version 3.0.0
 */

/**
 * Priority levels for screen reader announcements
 */
export type AriaLivePriority = "polite" | "assertive" | "off";

/**
 * Announce a message to screen readers
 * Creates a visually hidden live region for accessibility announcements
 *
 * @param message - Message to announce
 * @param priority - Priority level (polite, assertive, off)
 *
 * @example
 * ```tsx
 * announceToScreenReader("Item added to cart", "polite");
 * announceToScreenReader("Error: Form submission failed", "assertive");
 * ```
 */
export function announceToScreenReader(
  message: string,
  priority: AriaLivePriority = "polite",
): void {
  if (typeof document === "undefined") return;

  // Find or create live region
  let liveRegion = document.getElementById("a11y-announcer");

  if (!liveRegion) {
    liveRegion = document.createElement("div");
    liveRegion.id = "a11y-announcer";
    liveRegion.setAttribute("role", "status");
    liveRegion.setAttribute("aria-live", priority);
    liveRegion.setAttribute("aria-atomic", "true");

    // Visually hidden but accessible to screen readers
    Object.assign(liveRegion.style, {
      position: "absolute",
      left: "-10000px",
      width: "1px",
      height: "1px",
      overflow: "hidden",
    });

    document.body.appendChild(liveRegion);
  } else {
    // Update priority if needed
    liveRegion.setAttribute("aria-live", priority);
  }

  // Clear and set new message
  // Timeout ensures screen readers detect the change
  liveRegion.textContent = "";
  setTimeout(() => {
    if (liveRegion) {
      liveRegion.textContent = message;
    }
  }, 100);
}

/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Remove # if present
  hex = hex.replace(/^#/, "");

  // Handle 3-digit hex
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.1 specification
 *
 * @see https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function getLuminance(r: number, g: number, b: number): number {
  // Convert to 0-1 range
  const [rs, gs, bs] = [r, g, b].map((val) => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * Based on WCAG 2.1 specification
 *
 * @param foreground - Foreground color (hex or rgb)
 * @param background - Background color (hex or rgb)
 * @returns Contrast ratio (1-21)
 *
 * @example
 * ```tsx
 * const ratio = getContrastRatio("#000000", "#ffffff");
 * console.log(ratio); // 21 (maximum contrast)
 * ```
 *
 * @see https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */
export function getContrastRatio(
  foreground: string,
  background: string,
): number {
  // Parse colors
  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);

  if (!fgRgb || !bgRgb) {
    console.warn("Invalid color format. Please use hex colors (e.g., #000000)");
    return 1;
  }

  // Calculate luminances
  const fgLuminance = getLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
  const bgLuminance = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);

  // Calculate contrast ratio
  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standard
 *
 * WCAG AA Requirements:
 * - Normal text: 4.5:1
 * - Large text (18pt+ or 14pt+ bold): 3:1
 *
 * @param contrastRatio - Contrast ratio to check
 * @param isLargeText - Whether text is large (18pt+ or 14pt+ bold)
 * @returns true if meets AA standard
 *
 * @example
 * ```tsx
 * const ratio = getContrastRatio("#333333", "#ffffff");
 * const meetsAA = meetsWCAG_AA(ratio); // true (12.63:1)
 * ```
 */
export function meetsWCAG_AA(
  contrastRatio: number,
  isLargeText = false,
): boolean {
  return isLargeText ? contrastRatio >= 3 : contrastRatio >= 4.5;
}

/**
 * Check if contrast ratio meets WCAG AAA standard
 *
 * WCAG AAA Requirements:
 * - Normal text: 7:1
 * - Large text (18pt+ or 14pt+ bold): 4.5:1
 *
 * @param contrastRatio - Contrast ratio to check
 * @param isLargeText - Whether text is large (18pt+ or 14pt+ bold)
 * @returns true if meets AAA standard
 *
 * @example
 * ```tsx
 * const ratio = getContrastRatio("#000000", "#ffffff");
 * const meetsAAA = meetsWCAG_AAA(ratio); // true (21:1)
 * ```
 */
export function meetsWCAG_AAA(
  contrastRatio: number,
  isLargeText = false,
): boolean {
  return isLargeText ? contrastRatio >= 4.5 : contrastRatio >= 7;
}

/**
 * Get accessible text color (black or white) for a given background
 * Chooses the color with better contrast
 *
 * @param backgroundColor - Background color (hex)
 * @returns "#000000" or "#ffffff"
 *
 * @example
 * ```tsx
 * const textColor = getAccessibleTextColor("#1d4ed8");
 * // Returns "#ffffff" (white on blue)
 * ```
 */
export function getAccessibleTextColor(backgroundColor: string): string {
  const whiteContrast = getContrastRatio("#ffffff", backgroundColor);
  const blackContrast = getContrastRatio("#000000", backgroundColor);

  return whiteContrast > blackContrast ? "#ffffff" : "#000000";
}

/**
 * Check if a color combination meets WCAG standards
 *
 * @param foreground - Foreground color (hex)
 * @param background - Background color (hex)
 * @param level - WCAG level ("AA" or "AAA")
 * @param isLargeText - Whether text is large
 * @returns Object with compliance status and contrast ratio
 *
 * @example
 * ```tsx
 * const result = checkColorContrast("#333333", "#ffffff", "AA");
 * if (result.passes) {
 *   console.log(`Contrast ratio: ${result.ratio.toFixed(2)}:1`);
 * }
 * ```
 */
export function checkColorContrast(
  foreground: string,
  background: string,
  level: "AA" | "AAA" = "AA",
  isLargeText = false,
): {
  passes: boolean;
  ratio: number;
  requiredRatio: number;
} {
  const ratio = getContrastRatio(foreground, background);
  const requiredRatio =
    level === "AAA" ? (isLargeText ? 4.5 : 7) : isLargeText ? 3 : 4.5;

  return {
    passes: ratio >= requiredRatio,
    ratio,
    requiredRatio,
  };
}

/**
 * Generate ARIA label for a date
 *
 * @param date - Date object or ISO string
 * @param locale - Locale for formatting (default: "tr-TR")
 * @returns Formatted date string for screen readers
 *
 * @example
 * ```tsx
 * const label = getAriaDateLabel(new Date());
 * // "11 Kasım 2025 Salı"
 * ```
 */
export function getAriaDateLabel(
  date: Date | string,
  locale = "tr-TR",
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dateObj);
}

/**
 * Generate ARIA label for a time
 *
 * @param time - Time string (HH:mm)
 * @returns Formatted time string for screen readers
 *
 * @example
 * ```tsx
 * const label = getAriaTimeLabel("14:30");
 * // "14 saat 30 dakika"
 * ```
 */
export function getAriaTimeLabel(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  return `${hours} saat ${minutes} dakika`;
}

/**
 * Check if user prefers reduced motion
 * Based on prefers-reduced-motion media query
 *
 * @returns true if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Check if user prefers high contrast
 *
 * @returns true if user prefers high contrast
 */
export function prefersHighContrast(): boolean {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(prefers-contrast: high)").matches ||
    window.matchMedia("(-ms-high-contrast: active)").matches
  );
}

/**
 * Get keyboard shortcut label for display
 * Formats keyboard shortcuts in a user-friendly way
 *
 * @param shortcut - Keyboard shortcut (e.g., "Ctrl+S", "Cmd+K")
 * @returns Formatted shortcut string
 *
 * @example
 * ```tsx
 * const label = getKeyboardShortcutLabel("Ctrl+S");
 * // On Mac: "⌘S"
 * // On Windows: "Ctrl+S"
 * ```
 */
export function getKeyboardShortcutLabel(shortcut: string): string {
  if (typeof window === "undefined") return shortcut;

  const isMac = /Mac|iPhone|iPod|iPad/i.test(navigator.platform);

  if (isMac) {
    return shortcut
      .replace("Ctrl+", "⌘")
      .replace("Alt+", "⌥")
      .replace("Shift+", "⇧")
      .replace("Enter", "↵");
  }

  return shortcut;
}

/**
 * Create accessible ID for form elements
 * Ensures consistent ID generation for accessibility
 *
 * @param prefix - Prefix for ID
 * @param suffix - Optional suffix
 * @returns Unique ID string
 */
let idCounter = 0;

export function generateAccessibleId(prefix = "a11y", suffix?: string): string {
  idCounter += 1;
  return suffix ? `${prefix}-${suffix}-${idCounter}` : `${prefix}-${idCounter}`;
}
