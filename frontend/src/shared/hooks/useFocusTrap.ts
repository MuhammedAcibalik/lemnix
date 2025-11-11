/**
 * @fileoverview Focus Trap Hook - Trap focus within a container (for modals/dialogs)
 * @module shared/hooks/useFocusTrap
 * @version 3.0.0
 */

import { useEffect, useRef, useCallback } from "react";

export interface FocusTrapOptions {
  /**
   * Enable focus trap
   * @default true
   */
  enabled?: boolean;

  /**
   * Restore focus to previously focused element on unmount
   * @default true
   */
  restoreFocus?: boolean;

  /**
   * Auto-focus first focusable element on mount
   * @default true
   */
  autoFocus?: boolean;

  /**
   * Callback when focus trap is activated
   */
  onActivate?: () => void;

  /**
   * Callback when focus trap is deactivated
   */
  onDeactivate?: () => void;
}

/**
 * CSS selector for focusable elements
 */
const FOCUSABLE_ELEMENTS = [
  "a[href]",
  "area[href]",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  "button:not([disabled])",
  "iframe",
  "object",
  "embed",
  "[contenteditable]",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * Get all focusable elements within a container
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const elements = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS),
  );

  return elements.filter((el) => {
    // Filter out hidden elements
    return (
      el.offsetWidth > 0 ||
      el.offsetHeight > 0 ||
      el.getClientRects().length > 0
    );
  });
}

/**
 * useFocusTrap Hook
 *
 * Traps focus within a container element, ensuring keyboard navigation
 * stays within the trapped area. Useful for modals, dialogs, and popups.
 *
 * Features:
 * - Traps Tab and Shift+Tab navigation
 * - Preserves previously focused element
 * - Restores focus on unmount
 * - Auto-focuses first element on mount
 *
 * @example
 * ```tsx
 * function Modal({ isOpen, onClose }) {
 *   const modalRef = useFocusTrap({
 *     enabled: isOpen,
 *     onDeactivate: onClose,
 *   });
 *
 *   if (!isOpen) return null;
 *
 *   return (
 *     <div ref={modalRef}>
 *       <h2>Modal Title</h2>
 *       <button onClick={onClose}>Close</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useFocusTrap(
  options: FocusTrapOptions = {},
): React.RefObject<HTMLElement> {
  const {
    enabled = true,
    restoreFocus = true,
    autoFocus = true,
    onActivate,
    onDeactivate,
  } = options;

  const containerRef = useRef<HTMLElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  // Store previously focused element
  useEffect(() => {
    if (enabled && restoreFocus) {
      previouslyFocusedElementRef.current =
        document.activeElement as HTMLElement;
    }
  }, [enabled, restoreFocus]);

  // Handle focus trap
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;

    // Auto-focus first element
    if (autoFocus) {
      const focusableElements = getFocusableElements(container);
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }

    // Call onActivate callback
    onActivate?.();

    // Handle Tab and Shift+Tab
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements(container);

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift+Tab on first element -> focus last element
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
      // Tab on last element -> focus first element
      else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    // Handle focus leaving container
    const handleFocusOut = (event: FocusEvent) => {
      const relatedTarget = event.relatedTarget as Node;

      // Check if focus is moving outside the container
      if (relatedTarget && !container.contains(relatedTarget)) {
        event.preventDefault();

        // Return focus to first focusable element
        const focusableElements = getFocusableElements(container);
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    container.addEventListener("focusout", handleFocusOut);

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
      container.removeEventListener("focusout", handleFocusOut);

      // Restore focus to previously focused element
      if (restoreFocus && previouslyFocusedElementRef.current) {
        previouslyFocusedElementRef.current.focus();
      }

      // Call onDeactivate callback
      onDeactivate?.();
    };
  }, [enabled, autoFocus, restoreFocus, onActivate, onDeactivate]);

  return containerRef;
}

/**
 * Hook to focus an element on mount
 *
 * @example
 * ```tsx
 * const inputRef = useFocusOnMount<HTMLInputElement>();
 * return <input ref={inputRef} />;
 * ```
 */
export function useFocusOnMount<T extends HTMLElement>(): React.RefObject<T> {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    if (elementRef.current) {
      elementRef.current.focus();
    }
  }, []);

  return elementRef;
}

/**
 * Hook to focus an element when a condition becomes true
 *
 * @example
 * ```tsx
 * const inputRef = useFocusWhen<HTMLInputElement>(isEditing);
 * ```
 */
export function useFocusWhen<T extends HTMLElement>(
  condition: boolean,
): React.RefObject<T> {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    if (condition && elementRef.current) {
      elementRef.current.focus();
    }
  }, [condition]);

  return elementRef;
}

/**
 * Hook to manage focus within a component
 * Returns utilities for common focus operations
 */
export function useFocusManagement() {
  /**
   * Focus first focusable element in container
   */
  const focusFirst = useCallback((container: HTMLElement) => {
    const focusableElements = getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }, []);

  /**
   * Focus last focusable element in container
   */
  const focusLast = useCallback((container: HTMLElement) => {
    const focusableElements = getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
    }
  }, []);

  /**
   * Check if element is focusable
   */
  const isFocusable = useCallback((element: HTMLElement): boolean => {
    return element.matches(FOCUSABLE_ELEMENTS);
  }, []);

  /**
   * Get all focusable elements in container
   */
  const getFocusable = useCallback((container: HTMLElement) => {
    return getFocusableElements(container);
  }, []);

  return {
    focusFirst,
    focusLast,
    isFocusable,
    getFocusable,
  };
}
