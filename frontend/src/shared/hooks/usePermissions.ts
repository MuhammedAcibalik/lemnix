/**
 * @fileoverview usePermissions Hook
 * @module shared/hooks
 * @version 1.0.0
 * 
 * Role-Based Access Control (RBAC) for frontend UI
 * 
 * ✅ SECURITY: Hide/disable UI elements based on user permissions
 * ✅ ALIGNMENT: Synced with backend Permission enum
 */

import { useState, useEffect, useMemo } from 'react';

/**
 * Permission enum (aligned with backend)
 */
export enum Permission {
  VIEW_CUTTING_PLANS = 'view:cutting-plans',
  VIEW_OPTIMIZATION_RESULTS = 'view:optimization-results',
  VIEW_METRICS = 'view:metrics',
  VIEW_LOGS = 'view:logs',
  EXPORT_REPORTS = 'export:reports',
  START_OPTIMIZATION = 'start:optimization',
  STOP_OPTIMIZATION = 'stop:optimization',
  MANAGE_QUARANTINE = 'manage:quarantine',
  MANAGE_CONFIG = 'manage:config',
  MANAGE_USERS = 'manage:users',
  MANAGE_ROLES = 'manage:roles',
  TRIGGER_BACKUP = 'trigger:backup',
  VIEW_SECURITY_LOGS = 'view:security-logs',
}

/**
 * User role enum (aligned with backend)
 */
export enum UserRole {
  VIEWER = 'viewer',
  PLANNER = 'planner',
  ADMIN = 'admin',
}

/**
 * Role permissions mapping (aligned with backend)
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.VIEWER]: [
    Permission.VIEW_CUTTING_PLANS,
    Permission.VIEW_OPTIMIZATION_RESULTS,
    Permission.VIEW_METRICS,
    Permission.VIEW_LOGS,
    Permission.EXPORT_REPORTS,
  ],
  [UserRole.PLANNER]: [
    Permission.VIEW_CUTTING_PLANS,
    Permission.VIEW_OPTIMIZATION_RESULTS,
    Permission.VIEW_METRICS,
    Permission.VIEW_LOGS,
    Permission.EXPORT_REPORTS,
    Permission.START_OPTIMIZATION,
    Permission.STOP_OPTIMIZATION,
    Permission.MANAGE_QUARANTINE,
  ],
  [UserRole.ADMIN]: Object.values(Permission), // All permissions
};

/**
 * User interface
 */
export interface User {
  readonly userId: string;
  readonly role: UserRole;
  readonly permissions: ReadonlyArray<Permission>;
  readonly sessionId?: string;
}

/**
 * Hook return type
 */
export interface UsePermissionsReturn {
  readonly user: User | null;
  readonly isLoading: boolean;
  readonly hasPermission: (permission: Permission) => boolean;
  readonly hasAnyPermission: (permissions: Permission[]) => boolean;
  readonly hasAllPermissions: (permissions: Permission[]) => boolean;
  readonly isRole: (role: UserRole) => boolean;
  readonly isAdmin: boolean;
  readonly isPlanner: boolean;
  readonly isViewer: boolean;
}

/**
 * Get mock user for development
 */
function getMockUser(): User {
  // In development, return admin user with all permissions
  return {
    userId: 'dev-user',
    role: UserRole.ADMIN,
    permissions: Object.values(Permission),
    sessionId: 'dev-session',
  };
}

/**
 * Fetch user permissions from backend
 * TODO: Implement actual API call when auth is ready
 */
async function fetchUserPermissions(): Promise<User | null> {
  try {
    // Development mode: Return mock user
    if (import.meta.env.MODE === 'development') {
      return getMockUser();
    }

    // Production: Fetch from backend
    // const response = await api.get<User>('/auth/me');
    // return response.data;

    // Fallback: Return viewer role
    return {
      userId: 'anonymous',
      role: UserRole.VIEWER,
      permissions: ROLE_PERMISSIONS[UserRole.VIEWER],
    };
  } catch (error) {
    console.error('[PERMISSIONS] Failed to fetch user permissions:', error);
    return null;
  }
}

/**
 * usePermissions Hook
 * 
 * Provides permission checking utilities for UI components
 * 
 * @example
 * ```tsx
 * const { hasPermission, isAdmin } = usePermissions();
 * 
 * return (
 *   <>
 *     {hasPermission(Permission.START_OPTIMIZATION) && (
 *       <Button onClick={startOptimization}>Optimize</Button>
 *     )}
 *     
 *     {isAdmin && (
 *       <AdminPanel />
 *     )}
 *   </>
 * );
 * ```
 */
export function usePermissions(): UsePermissionsReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    fetchUserPermissions()
      .then((userData) => {
        if (mounted) {
          setUser(userData);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error('[PERMISSIONS] Error loading user:', error);
        if (mounted) {
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Permission checking functions
  const hasPermission = useMemo(
    () => (permission: Permission): boolean => {
      if (!user) return false;
      return user.permissions.includes(permission);
    },
    [user]
  );

  const hasAnyPermission = useMemo(
    () => (permissions: Permission[]): boolean => {
      if (!user) return false;
      return permissions.some((p) => user.permissions.includes(p));
    },
    [user]
  );

  const hasAllPermissions = useMemo(
    () => (permissions: Permission[]): boolean => {
      if (!user) return false;
      return permissions.every((p) => user.permissions.includes(p));
    },
    [user]
  );

  const isRole = useMemo(
    () => (role: UserRole): boolean => {
      if (!user) return false;
      return user.role === role;
    },
    [user]
  );

  // Convenience role checkers
  const isAdmin = useMemo(() => user?.role === UserRole.ADMIN, [user]);
  const isPlanner = useMemo(() => user?.role === UserRole.PLANNER, [user]);
  const isViewer = useMemo(() => user?.role === UserRole.VIEWER, [user]);

  return {
    user,
    isLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isRole,
    isAdmin,
    isPlanner,
    isViewer,
  };
}

/**
 * Hook for simple permission check
 * 
 * @example
 * ```tsx
 * const canOptimize = useHasPermission(Permission.START_OPTIMIZATION);
 * 
 * return (
 *   <Button disabled={!canOptimize}>
 *     Optimize
 *   </Button>
 * );
 * ```
 */
export function useHasPermission(permission: Permission): boolean {
  const { hasPermission } = usePermissions();
  return hasPermission(permission);
}

/**
 * Hook for role check
 * 
 * @example
 * ```tsx
 * const isAdmin = useIsAdmin();
 * 
 * if (!isAdmin) {
 *   return <AccessDenied />;
 * }
 * ```
 */
export function useIsAdmin(): boolean {
  const { isAdmin } = usePermissions();
  return isAdmin;
}

export function useIsPlanner(): boolean {
  const { isPlanner } = usePermissions();
  return isPlanner;
}

export function useIsViewer(): boolean {
  const { isViewer } = usePermissions();
  return isViewer;
}

