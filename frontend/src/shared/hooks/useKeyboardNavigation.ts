/**
 * @fileoverview Keyboard Navigation Hook - Manage keyboard navigation for lists and menus
 * @module shared/hooks/useKeyboardNavigation
 * @version 3.0.0
 */

import { useState, useEffect, useCallback, useRef } from "react";

export interface KeyboardNavigationOptions {
  /**
   * Total number of items in the list
   */
  itemCount: number;

  /**
   * Initial active index
   * @default -1 (no selection)
   */
  initialIndex?: number;

  /**
   * Enable looping (wrap around from last to first and vice versa)
   * @default true
   */
  loop?: boolean;

  /**
   * Callback when an item is selected (Enter or Space pressed)
   */
  onSelect?: (index: number) => void;

  /**
   * Callback when navigation is cancelled (Escape pressed)
   */
  onCancel?: () => void;

  /**
   * Callback when active index changes
   */
  onChange?: (index: number) => void;

  /**
   * Enable keyboard navigation
   * @default true
   */
  enabled?: boolean;
}

export interface KeyboardNavigationResult {
  /**
   * Current active index
   */
  activeIndex: number;

  /**
   * Set active index manually
   */
  setActiveIndex: (index: number) => void;

  /**
   * Move to next item
   */
  moveNext: () => void;

  /**
   * Move to previous item
   */
  movePrevious: () => void;

  /**
   * Move to first item
   */
  moveToFirst: () => void;

  /**
   * Move to last item
   */
  moveToLast: () => void;

  /**
   * Select current item
   */
  selectCurrent: () => void;

  /**
   * Reset to initial state
   */
  reset: () => void;

  /**
   * Key event handler to attach to container
   */
  handleKeyDown: (event: React.KeyboardEvent) => void;

  /**
   * Props to spread on list items
   */
  getItemProps: (index: number) => {
    tabIndex: number;
    "data-active": boolean;
    role: string;
  };
}

/**
 * useKeyboardNavigation Hook
 *
 * Manages keyboard navigation for lists, menus, and similar components.
 * Supports ArrowUp/Down, Home/End, Enter/Space, and Escape keys.
 *
 * @example
 * ```tsx
 * const { activeIndex, handleKeyDown, getItemProps } = useKeyboardNavigation({
 *   itemCount: items.length,
 *   onSelect: (index) => console.log('Selected:', items[index]),
 *   onCancel: () => closeMenu(),
 * });
 *
 * return (
 *   <ul onKeyDown={handleKeyDown}>
 *     {items.map((item, index) => (
 *       <li key={index} {...getItemProps(index)}>
 *         {item}
 *       </li>
 *     ))}
 *   </ul>
 * );
 * ```
 */
export function useKeyboardNavigation(
  options: KeyboardNavigationOptions,
): KeyboardNavigationResult {
  const {
    itemCount,
    initialIndex = -1,
    loop = true,
    onSelect,
    onCancel,
    onChange,
    enabled = true,
  } = options;

  const [activeIndex, setActiveIndexState] = useState(initialIndex);
  const onChangeRef = useRef(onChange);

  // Keep onChange ref updated
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Set active index with onChange callback
  const setActiveIndex = useCallback(
    (index: number) => {
      if (index < 0 || index >= itemCount) return;
      setActiveIndexState(index);
      onChangeRef.current?.(index);
    },
    [itemCount],
  );

  // Move to next item
  const moveNext = useCallback(() => {
    setActiveIndexState((prev) => {
      let next = prev + 1;

      if (next >= itemCount) {
        next = loop ? 0 : itemCount - 1;
      }

      onChangeRef.current?.(next);
      return next;
    });
  }, [itemCount, loop]);

  // Move to previous item
  const movePrevious = useCallback(() => {
    setActiveIndexState((prev) => {
      let next = prev - 1;

      if (next < 0) {
        next = loop ? itemCount - 1 : 0;
      }

      onChangeRef.current?.(next);
      return next;
    });
  }, [itemCount, loop]);

  // Move to first item
  const moveToFirst = useCallback(() => {
    setActiveIndex(0);
  }, [setActiveIndex]);

  // Move to last item
  const moveToLast = useCallback(() => {
    setActiveIndex(itemCount - 1);
  }, [itemCount, setActiveIndex]);

  // Select current item
  const selectCurrent = useCallback(() => {
    if (activeIndex >= 0 && activeIndex < itemCount) {
      onSelect?.(activeIndex);
    }
  }, [activeIndex, itemCount, onSelect]);

  // Reset to initial state
  const reset = useCallback(() => {
    setActiveIndexState(initialIndex);
  }, [initialIndex]);

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!enabled) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          moveNext();
          break;

        case "ArrowUp":
          event.preventDefault();
          movePrevious();
          break;

        case "Home":
          event.preventDefault();
          moveToFirst();
          break;

        case "End":
          event.preventDefault();
          moveToLast();
          break;

        case "Enter":
        case " ": // Space
          event.preventDefault();
          selectCurrent();
          break;

        case "Escape":
          event.preventDefault();
          onCancel?.();
          break;

        default:
          // Allow other keys to propagate
          break;
      }
    },
    [
      enabled,
      moveNext,
      movePrevious,
      moveToFirst,
      moveToLast,
      selectCurrent,
      onCancel,
    ],
  );

  // Get props for list items
  const getItemProps = useCallback(
    (index: number) => ({
      tabIndex: index === activeIndex ? 0 : -1,
      "data-active": index === activeIndex,
      role: "option",
    }),
    [activeIndex],
  );

  return {
    activeIndex,
    setActiveIndex,
    moveNext,
    movePrevious,
    moveToFirst,
    moveToLast,
    selectCurrent,
    reset,
    handleKeyDown,
    getItemProps,
  };
}

/**
 * Hook for simple arrow key navigation (up/down only)
 * Simpler version of useKeyboardNavigation
 */
export function useArrowNavigation(itemCount: number, initialIndex = 0) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, itemCount - 1));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      }
    },
    [itemCount],
  );

  return { activeIndex, setActiveIndex, handleKeyDown };
}
