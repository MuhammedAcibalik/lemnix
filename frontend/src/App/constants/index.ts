/**
 * @fileoverview App Constants
 * @module App/Constants
 * @version 2.0.0 - Enterprise Grade Modular Design
 */

/**
 * Route paths configuration
 */
export const routes = {
  home: '/',
  dashboard: '/dashboard',
  cuttingList: '/cutting-list',
  enterpriseOptimization: '/enterprise-optimization',
  statistics: '/statistics',
  productionPlan: '/production-plan',
  profileManagement: '/profile-management',
  settings: '/settings'
} as const;

/**
 * Page IDs configuration
 */
export const pageIds = {
  home: 'home',
  dashboard: 'dashboard',
  cuttingList: 'cutting-list',
  enterpriseOptimization: 'enterprise-optimization',
  statistics: 'statistics',
  productionPlan: 'production-plan',
  profileManagement: 'profile-management',
  settings: 'settings'
} as const;

/**
 * Navigation configuration
 */
export const navigationConfig = {
  useModernNavigation: true
} as const;

/**
 * Snackbar configuration
 */
export const snackbarConfig = {
  autoHideDuration: 6000,
  anchorOrigin: {
    vertical: 'bottom' as const,
    horizontal: 'right' as const
  }
} as const;

/**
 * Mobile breakpoints
 */
export const breakpoints = {
  mobile: 'md'
} as const;

/**
 * Z-index values
 */
export const zIndex = {
  mobileMenu: 1300
} as const;

/**
 * Default state values
 */
export const defaultState = {
  activePage: pageIds.home,
  isLoading: false,
  snackbar: {
    open: false,
    message: '',
    severity: 'info' as const
  },
  excelItems: [],
  optimizationResult: null
} as const;
