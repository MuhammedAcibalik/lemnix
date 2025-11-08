/**
 * @fileoverview Modern Navigation Wrapper Component
 * @module App/Components
 * @version 2.0.0 - Enterprise Grade Modular Design
 */

import React from 'react';
import { ModernNavigation } from '@/widgets/modern-navigation';
import { PageChangeHandler } from '../types';

interface ModernNavigationWrapperProps {
  activePage: string;
  onPageChange: PageChangeHandler;
}

/**
 * Modern Navigation Wrapper Component
 */
export const ModernNavigationWrapper: React.FC<ModernNavigationWrapperProps> = ({
  activePage,
  onPageChange
}) => {
  return (
    <ModernNavigation
      activePage={activePage}
      onPageChange={onPageChange}
      onMenuToggle={() => {}}
      onCommandPaletteToggle={() => {}}
      onUserMenuToggle={() => {}}
      onNotificationsToggle={() => {}}
      isDrawerOpen={false}
      isCommandPaletteOpen={false}
      isUserMenuOpen={false}
      isNotificationsOpen={false}
      userMenuAnchor={null}
      notificationsAnchor={null}
    />
  );
};
