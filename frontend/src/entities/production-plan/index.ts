/**
 * @fileoverview Production Plan Entity - Public API
 * @module entities/production-plan
 * @version 1.0.0
 */

// Types
export type {
  ProductionPlan,
  ProductionPlanItem,
  ProductionPlanFilters,
  ProductionPlanMetrics,
  UploadProductionPlanRequest,
  UploadProductionPlanResponse,
  ProductionPlanListResponse,
  ProductionPlanMetricsResponse,
  ProductionPlanError,
  BackorderItem,
  ProductionPlanStatistics
} from './model/types';

export {
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  DEPARTMENT_OPTIONS,
  DEPARTMENT_MAPPING,
  WEEK_OPTIONS,
  getYearOptions,
  isProductionPlan,
  isProductionPlanItem
} from './model/types';

// API
export { productionPlanApi } from './api/productionPlanApi';

// React Query Hooks
export {
  useProductionPlans,
  useProductionPlan,
  useProductionPlanByWeek,
  useProductionPlanMetrics,
  useProductionPlanItemsByWorkOrder,
  useUploadProductionPlan,
  useDeleteProductionPlan,
  usePrefetchProductionPlan,
  useCreateCuttingListFromPlan,
  useGetLinkedPlanItems,
  useUnlinkPlanItemFromCuttingList,
  useBackorderItems,
  useProductionPlanStatistics,
  productionPlanKeys
} from './api/productionPlanQueries';
