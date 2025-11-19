/**
 * @fileoverview Type Definitions for CuttingListBuilder
 * @module CuttingListBuilderTypes
 * @version 1.0.0
 */

// ============================================================================
// CORE DATA TYPES
// ============================================================================

export interface ProfileItem {
  id: string;
  profile: string;
  measurement: string;
  quantity: number;
}

export interface WorkOrderItem {
  id: string;
  workOrderId: string;
  date: string;
  version: string;
  color: string;
  note?: string; // ✅ ALIGNED: Optional to match backend
  orderQuantity: number;
  size: string;
  profiles: ProfileItem[];
  createdAt: string;
  updatedAt: string;
  status?: "draft" | "ready" | "processing" | "completed";
  priority?: "1" | "2";
}

export interface ProductSection {
  id: string;
  productName: string;
  productCategory?: string;
  items: WorkOrderItem[];
  createdAt: string;
  updatedAt: string;
  isExpanded?: boolean;
}

export interface CuttingList {
  id: string;
  title: string;
  weekNumber: number;
  sections: ProductSection[];
  createdAt: string;
  updatedAt: string;
  status?: "active" | "archived" | "template";
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface ProfileFormItem {
  id: string;
  profile: string;
  measurement: string;
  quantity: string;
}

export interface WorkOrderForm {
  productName: string; // ✅ Section context for smart suggestions
  workOrderId: string;
  date: string;
  version: string;
  color: string;
  note?: string; // ✅ ALIGNED: Optional to match backend
  orderQuantity: string;
  size: string;
  profiles: ProfileFormItem[];
  priority: "1" | "2";
}

// ============================================================================
// API TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ============================================================================
// STATISTICS TYPES
// ============================================================================

export interface CuttingListStats {
  totalSections: number;
  totalItems: number;
  totalProfiles: number;
  completedItems: number;
  efficiency: number;
  totalQuantity: number;
}

export interface StatsItem {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}

export interface CuttingListStatsProps {
  stats: StatsItem[];
  sx?: Record<string, unknown>;
}

// ============================================================================
// STATE TYPES
// ============================================================================

export enum LoadingState {
  IDLE = "idle",
  LOADING = "loading",
  SUCCESS = "success",
  ERROR = "error",
}

// ============================================================================
// SMART SUGGESTIONS TYPES
// ============================================================================

export interface ProfileCombination {
  id: string;
  profiles: Array<{
    profile: string;
    measurement: string;
    ratio: number;
  }>;
  usageCount: number;
  lastUsed: string;
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

export interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  stats?: CuttingListStats;
  actions?: React.ReactNode;
  showStats?: boolean;
  onToggleStats?: () => void;
  sx?: Record<string, unknown>;
}

export interface ActionToolbarProps {
  children: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryActions?: Array<{
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    color?: string;
  }>;
  loading?: boolean;
  sx?: Record<string, unknown>;
}

export interface StyledCardProps {
  children: React.ReactNode;
  sx?: Record<string, unknown>;
  variant?: "elevation" | "outlined";
  elevation?: number;
  [key: string]: unknown;
}

export interface StyledButtonProps {
  children: React.ReactNode;
  variant?: "contained" | "outlined" | "text";
  color?: "primary" | "secondary" | "error" | "warning" | "info" | "success";
  size?: "small" | "medium" | "large";
  sx?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface StyledTextFieldProps {
  sx?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface StyledChipProps {
  label: string;
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning";
  size?: "small" | "medium";
  sx?: Record<string, unknown>;
  [key: string]: unknown;
}

// ============================================================================
// PRODUCT CATEGORY TYPES
// ============================================================================

export interface ProductCategory {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
