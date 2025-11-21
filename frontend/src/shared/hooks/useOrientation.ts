/**
 * @fileoverview useOrientation Hook
 * @module shared/hooks/useOrientation
 * @description React hook for detecting device orientation
 * @version 3.0.0
 */

<<<<<<< HEAD
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
=======
import { useState, useEffect } from 'react';

export type Orientation = 'portrait' | 'landscape';

export type OrientationLockType = 
  | 'any'
  | 'natural'
  | 'landscape'
  | 'portrait'
  | 'portrait-primary'
  | 'portrait-secondary'
  | 'landscape-primary'
  | 'landscape-secondary';
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce

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
<<<<<<< HEAD
 *
 * @returns Current orientation state
 *
=======
 * 
 * @returns Current orientation state
 * 
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
 * @example
 * ```tsx
 * function ResponsiveImage() {
 *   const { isPortrait, isLandscape } = useOrientation();
<<<<<<< HEAD
 *
 *   return (
 *     <img
=======
 *   
 *   return (
 *     <img 
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
 *       src={isPortrait ? '/portrait.jpg' : '/landscape.jpg'}
 *       alt="Responsive"
 *     />
 *   );
 * }
 * ```
 */
export function useOrientation(): OrientationState {
  const getOrientation = (): OrientationState => {
<<<<<<< HEAD
    if (typeof window === "undefined") {
      return {
        orientation: "portrait",
=======
    if (typeof window === 'undefined') {
      return {
        orientation: 'portrait',
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
        isPortrait: true,
        isLandscape: false,
        angle: 0,
      };
    }

    // Use screen.orientation API if available
    if (window.screen?.orientation) {
      const type = window.screen.orientation.type;
      const angle = window.screen.orientation.angle;
<<<<<<< HEAD
      const isPortrait = type.includes("portrait");

      return {
        orientation: isPortrait ? "portrait" : "landscape",
=======
      const isPortrait = type.includes('portrait');
      
      return {
        orientation: isPortrait ? 'portrait' : 'landscape',
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
        isPortrait,
        isLandscape: !isPortrait,
        angle,
      };
    }

    // Fallback to window dimensions
    const isPortrait = window.innerHeight >= window.innerWidth;
<<<<<<< HEAD

    return {
      orientation: isPortrait ? "portrait" : "landscape",
=======
    
    return {
      orientation: isPortrait ? 'portrait' : 'landscape',
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
      isPortrait,
      isLandscape: !isPortrait,
      angle: 0,
    };
  };

  const [state, setState] = useState<OrientationState>(getOrientation);

  useEffect(() => {
<<<<<<< HEAD
    if (typeof window === "undefined") return;
=======
    if (typeof window === 'undefined') return;
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce

    const handleOrientationChange = () => {
      setState(getOrientation());
    };

    // Listen for orientation change
    if (window.screen?.orientation) {
<<<<<<< HEAD
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
=======
      window.screen.orientation.addEventListener('change', handleOrientationChange);
    }

    // Fallback to resize event
    window.addEventListener('resize', handleOrientationChange);

    // Also listen to orientationchange event (deprecated but widely supported)
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      if (window.screen?.orientation) {
        window.screen.orientation.removeEventListener('change', handleOrientationChange);
      }
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
    };
  }, []);

  return state;
}

/**
 * Hook to lock screen orientation (if supported)
 * Note: Only works in fullscreen mode or on mobile devices
<<<<<<< HEAD
 *
 * @param lockType - Orientation to lock to
 * @returns Function to lock and unlock orientation
 *
=======
 * 
 * @param lockType - Orientation to lock to
 * @returns Function to lock and unlock orientation
 * 
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
 * @example
 * ```tsx
 * function VideoPlayer() {
 *   const { lock, unlock } = useOrientationLock();
<<<<<<< HEAD
 *
=======
 *   
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
 *   const enterFullscreen = async () => {
 *     await document.body.requestFullscreen();
 *     await lock('landscape-primary');
 *   };
<<<<<<< HEAD
 *
=======
 *   
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
 *   return <button onClick={enterFullscreen}>Play Fullscreen</button>;
 * }
 * ```
 */
export function useOrientationLock() {
  const lock = async (lockType: OrientationLockType) => {
<<<<<<< HEAD
    if (typeof window === "undefined" || !window.screen?.orientation) {
      console.warn("Screen orientation lock is not supported");
=======
    if (typeof window === 'undefined' || !window.screen?.orientation) {
      console.warn('Screen orientation lock is not supported');
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
      return false;
    }

    try {
      // @ts-expect-error - lock() is not in all TypeScript definitions
      await window.screen.orientation.lock(lockType);
      return true;
    } catch (error) {
<<<<<<< HEAD
      console.error("Failed to lock orientation:", error);
=======
      console.error('Failed to lock orientation:', error);
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
      return false;
    }
  };

  const unlock = () => {
<<<<<<< HEAD
    if (typeof window === "undefined" || !window.screen?.orientation) {
      console.warn("Screen orientation unlock is not supported");
=======
    if (typeof window === 'undefined' || !window.screen?.orientation) {
      console.warn('Screen orientation unlock is not supported');
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
      return;
    }

    try {
      window.screen.orientation.unlock();
    } catch (error) {
<<<<<<< HEAD
      console.error("Failed to unlock orientation:", error);
=======
      console.error('Failed to unlock orientation:', error);
>>>>>>> a544613c6dd123e2bcee66e2b17a4986c17015ce
    }
  };

  return { lock, unlock };
}
