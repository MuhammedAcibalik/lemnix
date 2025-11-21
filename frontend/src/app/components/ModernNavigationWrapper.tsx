/**
 * @fileoverview Modern Navigation Wrapper Component
 * @module App/Components
 * @version 2.0.0 - Enterprise Grade Modular Design
 *
 * Responsive Navigation Wrapper following the pattern from:
 * @see c:/Users/macib/Downloads/Responsive Web App Design
 *
 * Pattern:
 * - Fixed position navigation with backdrop blur
 * - Mobile hamburger menu toggle
 * - Desktop horizontal menu
 * - Smooth navigation between pages
 */

import React, { useCallback } from "react";
import { ModernNavigation } from "@/widgets/modern-navigation";
import { PageChangeHandler } from "../types";

interface ModernNavigationWrapperProps {
  readonly activePage: string;
  readonly onPageChange: PageChangeHandler;
}

/**
 * Modern Navigation Wrapper Component
 *
 * Simple wrapper that passes props to ModernNavigation.
 * State management (command palette, user menu, etc.) is handled
 * internally by ModernNavigation component via useNavigationState hook.
 *
 * Follows responsive pattern from example:
 * - Fixed navigation with backdrop blur (bg-white/80 backdrop-blur-md)
 * - Container max-width pattern (max-w-7xl mx-auto)
 * - Responsive padding (px-4 sm:px-6 lg:px-8)
 * - Mobile menu toggle (hamburger icon)
 * - Desktop horizontal menu
 * - Height: h-16 (64px) for consistent navigation height
 */
export const ModernNavigationWrapper: React.FC<
  ModernNavigationWrapperProps
> = ({ activePage, onPageChange }) => {
  // Mobile menu toggle handler
  // Note: ModernNavigation handles menu state internally via useNavigationState
  const handleMenuToggle = useCallback(() => {
    // Mobile menu toggle logic handled internally by ModernNavigation
  }, []);

  // Command palette toggle handler
  const handleCommandPaletteToggle = useCallback(() => {
    // Command palette toggle handled internally by ModernNavigation
  }, []);

  // User menu toggle handler
  const handleUserMenuToggle = useCallback(() => {
    // User menu toggle handled internally by ModernNavigation
  }, []);

  // Notifications toggle handler
  const handleNotificationsToggle = useCallback(() => {
    // Notifications toggle handled internally by ModernNavigation
  }, []);

  return (
    <ModernNavigation
      activePage={activePage}
      onPageChange={onPageChange}
      onMenuToggle={handleMenuToggle}
      onCommandPaletteToggle={handleCommandPaletteToggle}
      onUserMenuToggle={handleUserMenuToggle}
      onNotificationsToggle={handleNotificationsToggle}
      isDrawerOpen={false}
      isCommandPaletteOpen={false}
      isUserMenuOpen={false}
      isNotificationsOpen={false}
      userMenuAnchor={null}
      notificationsAnchor={null}
    />
  );
};
