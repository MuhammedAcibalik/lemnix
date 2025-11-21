/**
 * @fileoverview useOrientation Hook
 * @module shared/hooks/useOrientation
 * @description React hook for detecting device orientation
 * @version 3.0.0
 */

import { useState, useEffect } from "react";

export type Orientation = "portrait" | "landscape";

export type OrientationLockType =
  | "any"
  | "natural"
  | "landscape"
  | "portrait"
  | "portrait-primary"
  | "portrait-secondary"
  | "landscape-primary"
  | "landscape-secondary";

export interface OrientationState {
  /** Current orientation */
  orientation: Orientation;
  /** True if device is in portrait mode */
  isPortrait: boolean;
  /** True if device is in landscape mode */
  isLandscape: boolean;
  /** Orientation angle in degrees */
  angle: number;
}

/**
 * Hook to detect device orientation
 *
 * @returns Current orientation state
 *
 * @example
 * ```tsx
 * function ResponsiveImage() {
 *   const { isPortrait, isLandscape } = useOrientation();
 *
 *   return (
 *     <img
 *       src={isPortrait ? '/portrait.jpg' : '/landscape.jpg'}
 *       alt="Responsive"
 *     />
 *   );
 * }
 * ```
 */
export function useOrientation(): OrientationState {
  const getOrientation = (): OrientationState => {
    if (typeof window === "undefined") {
      return {
        orientation: "portrait",
        isPortrait: true,
        isLandscape: false,
        angle: 0,
      };
    }

    // Use screen.orientation API if available
    if (window.screen?.orientation) {
      const type = window.screen.orientation.type;
      const angle = window.screen.orientation.angle;
      const isPortrait = type.includes("portrait");

      return {
        orientation: isPortrait ? "portrait" : "landscape",
        isPortrait,
        isLandscape: !isPortrait,
        angle,
      };
    }

    // Fallback to window dimensions
    const isPortrait = window.innerHeight >= window.innerWidth;

    return {
      orientation: isPortrait ? "portrait" : "landscape",
      isPortrait,
      isLandscape: !isPortrait,
      angle: 0,
    };
  };

  const [state, setState] = useState<OrientationState>(getOrientation);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOrientationChange = () => {
      setState(getOrientation());
    };

    // Listen for orientation change
    if (window.screen?.orientation) {
      window.screen.orientation.addEventListener(
        "change",
        handleOrientationChange,
      );
    }

    // Fallback to resize event
    window.addEventListener("resize", handleOrientationChange);

    // Also listen to orientationchange event (deprecated but widely supported)
    window.addEventListener("orientationchange", handleOrientationChange);

    return () => {
      if (window.screen?.orientation) {
        window.screen.orientation.removeEventListener(
          "change",
          handleOrientationChange,
        );
      }
      window.removeEventListener("resize", handleOrientationChange);
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, []);

  return state;
}

/**
 * Hook to lock screen orientation (if supported)
 * Note: Only works in fullscreen mode or on mobile devices
 *
 * @param lockType - Orientation to lock to
 * @returns Function to lock and unlock orientation
 *
 * @example
 * ```tsx
 * function VideoPlayer() {
 *   const { lock, unlock } = useOrientationLock();
 *
 *   const enterFullscreen = async () => {
 *     await document.body.requestFullscreen();
 *     await lock('landscape-primary');
 *   };
 *
 *   return <button onClick={enterFullscreen}>Play Fullscreen</button>;
 * }
 * ```
 */
export function useOrientationLock() {
  const lock = async (lockType: OrientationLockType) => {
    if (typeof window === "undefined" || !window.screen?.orientation) {
      console.warn("Screen orientation lock is not supported");
      return false;
    }

    try {
      // @ts-expect-error - lock() is not in all TypeScript definitions
      await window.screen.orientation.lock(lockType);
      return true;
    } catch (error) {
      console.error("Failed to lock orientation:", error);
      return false;
    }
  };

  const unlock = () => {
    if (typeof window === "undefined" || !window.screen?.orientation) {
      console.warn("Screen orientation unlock is not supported");
      return;
    }

    try {
      window.screen.orientation.unlock();
    } catch (error) {
      console.error("Failed to unlock orientation:", error);
    }
  };

  return { lock, unlock };
}
