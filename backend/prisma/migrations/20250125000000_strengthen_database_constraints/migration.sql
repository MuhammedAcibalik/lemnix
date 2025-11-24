-- Migration: Strengthen Database Constraints
-- This migration adds check constraints, partial unique indexes, and additional indexes
-- to improve data integrity and performance

-- ============================================================================
-- CHECK CONSTRAINTS
-- ============================================================================

-- CuttingListItem: Ensure quantity > 0
ALTER TABLE "cutting_list_items"
ADD CONSTRAINT "cutting_list_items_quantity_positive"
CHECK ("quantity" > 0);

-- CuttingListItem: Ensure length > 0
ALTER TABLE "cutting_list_items"
ADD CONSTRAINT "cutting_list_items_length_positive"
CHECK ("length" > 0);

-- StockLength: Ensure length > 0
ALTER TABLE "stock_lengths"
ADD CONSTRAINT "stock_lengths_length_positive"
CHECK ("length" > 0);

-- ProfileStockLength: Ensure stockLength > 0
ALTER TABLE "profile_stock_lengths"
ADD CONSTRAINT "profile_stock_lengths_stock_length_positive"
CHECK ("stockLength" > 0);

-- ProfileStockLength: Ensure priority >= 0
ALTER TABLE "profile_stock_lengths"
ADD CONSTRAINT "profile_stock_lengths_priority_non_negative"
CHECK ("priority" >= 0);

-- CuttingList: Ensure weekNumber is valid (1-53) when not null
ALTER TABLE "cutting_lists"
ADD CONSTRAINT "cutting_lists_week_number_valid"
CHECK ("weekNumber" IS NULL OR ("weekNumber" >= 1 AND "weekNumber" <= 53));

-- ProductionPlan: Ensure weekNumber is valid (1-53)
ALTER TABLE "production_plans"
ADD CONSTRAINT "production_plans_week_number_valid"
CHECK ("weekNumber" >= 1 AND "weekNumber" <= 53);

-- ProductionPlan: Ensure year is reasonable (2000-2100)
ALTER TABLE "production_plans"
ADD CONSTRAINT "production_plans_year_valid"
CHECK ("year" >= 2000 AND "year" <= 2100);

-- ProductionPlanItem: Ensure miktar > 0
ALTER TABLE "production_plan_items"
ADD CONSTRAINT "production_plan_items_miktar_positive"
CHECK ("miktar" > 0);

-- MaterialProfileMapping: Ensure length > 0
ALTER TABLE "material_profile_mappings"
ADD CONSTRAINT "material_profile_mappings_length_positive"
CHECK ("length" > 0);

-- MaterialProfileMapping: Ensure usageCount >= 0
ALTER TABLE "material_profile_mappings"
ADD CONSTRAINT "material_profile_mappings_usage_count_non_negative"
CHECK ("usageCount" >= 0);

-- ProfileUsageStatistics: Ensure measurement > 0
ALTER TABLE "profile_usage_statistics"
ADD CONSTRAINT "profile_usage_statistics_measurement_positive"
CHECK ("measurement" > 0);

-- ProfileUsageStatistics: Ensure totalUsageCount >= 0
ALTER TABLE "profile_usage_statistics"
ADD CONSTRAINT "profile_usage_statistics_total_usage_count_non_negative"
CHECK ("totalUsageCount" >= 0);

-- ProfileUsageStatistics: Ensure totalQuantity >= 0
ALTER TABLE "profile_usage_statistics"
ADD CONSTRAINT "profile_usage_statistics_total_quantity_non_negative"
CHECK ("totalQuantity" >= 0);

-- ProfileUsageStatistics: Ensure frequencyRank >= 0
ALTER TABLE "profile_usage_statistics"
ADD CONSTRAINT "profile_usage_statistics_frequency_rank_non_negative"
CHECK ("frequencyRank" >= 0);

-- SuggestionPattern: Ensure quantity > 0
ALTER TABLE "suggestion_patterns"
ADD CONSTRAINT "suggestion_patterns_quantity_positive"
CHECK ("quantity" > 0);

-- SuggestionPattern: Ensure frequency >= 0
ALTER TABLE "suggestion_patterns"
ADD CONSTRAINT "suggestion_patterns_frequency_non_negative"
CHECK ("frequency" >= 0);

-- SuggestionPattern: Ensure confidence between 0 and 100
ALTER TABLE "suggestion_patterns"
ADD CONSTRAINT "suggestion_patterns_confidence_valid"
CHECK ("confidence" >= 0 AND "confidence" <= 100);

-- SuggestionPattern: Ensure orderQuantity > 0
ALTER TABLE "suggestion_patterns"
ADD CONSTRAINT "suggestion_patterns_order_quantity_positive"
CHECK ("orderQuantity" > 0);

-- SuggestionPattern: Ensure ratio > 0
ALTER TABLE "suggestion_patterns"
ADD CONSTRAINT "suggestion_patterns_ratio_positive"
CHECK ("ratio" > 0);

-- SuggestionCache: Ensure hitCount >= 0
ALTER TABLE "suggestion_caches"
ADD CONSTRAINT "suggestion_caches_hit_count_non_negative"
CHECK ("hitCount" >= 0);

-- SuggestionMetrics: Ensure suggestionCount >= 0
ALTER TABLE "suggestion_metrics"
ADD CONSTRAINT "suggestion_metrics_suggestion_count_non_negative"
CHECK ("suggestionCount" >= 0);

-- SuggestionMetrics: Ensure acceptanceRate between 0 and 100
ALTER TABLE "suggestion_metrics"
ADD CONSTRAINT "suggestion_metrics_acceptance_rate_valid"
CHECK ("acceptanceRate" >= 0 AND "acceptanceRate" <= 100);

-- SuggestionMetrics: Ensure averageConfidence between 0 and 100
ALTER TABLE "suggestion_metrics"
ADD CONSTRAINT "suggestion_metrics_average_confidence_valid"
CHECK ("averageConfidence" >= 0 AND "averageConfidence" <= 100);

-- OptimizationStatistics: Ensure inputItemCount >= 0
ALTER TABLE "optimization_statistics"
ADD CONSTRAINT "optimization_statistics_input_item_count_non_negative"
CHECK ("inputItemCount" >= 0);

-- OptimizationStatistics: Ensure outputItemCount >= 0
ALTER TABLE "optimization_statistics"
ADD CONSTRAINT "optimization_statistics_output_item_count_non_negative"
CHECK ("outputItemCount" >= 0);

-- OptimizationStatistics: Ensure executionTimeMs >= 0
ALTER TABLE "optimization_statistics"
ADD CONSTRAINT "optimization_statistics_execution_time_non_negative"
CHECK ("executionTimeMs" >= 0);

-- OptimizationStatistics: Ensure successRate between 0 and 100
ALTER TABLE "optimization_statistics"
ADD CONSTRAINT "optimization_statistics_success_rate_valid"
CHECK ("successRate" >= 0 AND "successRate" <= 100);

-- CuttingListStatistics: Ensure all counts >= 0
ALTER TABLE "cutting_list_statistics"
ADD CONSTRAINT "cutting_list_statistics_total_items_non_negative"
CHECK ("totalItems" >= 0);

ALTER TABLE "cutting_list_statistics"
ADD CONSTRAINT "cutting_list_statistics_total_profiles_non_negative"
CHECK ("totalProfiles" >= 0);

ALTER TABLE "cutting_list_statistics"
ADD CONSTRAINT "cutting_list_statistics_total_quantity_non_negative"
CHECK ("totalQuantity" >= 0);

ALTER TABLE "cutting_list_statistics"
ADD CONSTRAINT "cutting_list_statistics_optimization_count_non_negative"
CHECK ("optimizationCount" >= 0);

-- ============================================================================
-- PARTIAL UNIQUE INDEXES
-- ============================================================================

-- CuttingList: Partial unique index for userId + weekNumber (only when weekNumber is not null)
-- This allows multiple NULL weekNumber values per user
DROP INDEX IF EXISTS "cutting_lists_userId_weekNumber_key";
CREATE UNIQUE INDEX "cutting_lists_user_week_unique" 
ON "cutting_lists"("userId", "weekNumber") 
WHERE "weekNumber" IS NOT NULL;

-- ============================================================================
-- ADDITIONAL INDEXES
-- ============================================================================

-- CuttingListItem: Composite index for workOrderId + profileType + color (frequently queried together)
CREATE INDEX IF NOT EXISTS "cutting_list_items_work_order_profile_color_idx" 
ON "cutting_list_items"("workOrderId", "profileType", "color");

-- ProductionPlanItem: Index for planId + oncelik (for filtering by priority within a plan)
CREATE INDEX IF NOT EXISTS "production_plan_items_plan_priority_idx" 
ON "production_plan_items"("planId", "oncelik");

-- WorkOrderProfileMapping: Index already exists, but ensure it's optimized
-- The existing index on (workOrderId, weekNumber, year) is good

-- ============================================================================
-- FOREIGN KEY ACTIONS (Already handled in Prisma schema, but ensure consistency)
-- ============================================================================

-- Note: Foreign key actions (onDelete, onUpdate) are managed by Prisma schema
-- This migration focuses on check constraints and indexes

