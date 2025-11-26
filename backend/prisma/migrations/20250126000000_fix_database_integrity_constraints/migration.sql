-- Migration: Fix Database Integrity Constraints
-- This migration addresses all identified risks from database analysis:
-- 1. Add foreign key for CuttingListItem.productionPlanItemId
-- 2. Add unique constraint for CuttingListStatistics.cuttingListId
-- 3. Add enum for ProductionPlanItem.oncelik
-- 4. Add default value for CuttingListItem.version
-- 5. Add foreign key for AuditLog.userId (nullable)

-- ============================================================================
-- STEP 1: Create ProductionPlanPriority enum
-- ============================================================================

-- Create enum only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProductionPlanPriority') THEN
    CREATE TYPE "ProductionPlanPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
  END IF;
END $$;

-- ============================================================================
-- STEP 2: Update CuttingListItem.version to have default value
-- ============================================================================

-- First, update existing NULL values (if any)
UPDATE "cutting_list_items" SET "version" = '1.0' WHERE "version" IS NULL OR "version" = '';

-- Add default value
ALTER TABLE "cutting_list_items" 
ALTER COLUMN "version" SET DEFAULT '1.0';

-- ============================================================================
-- STEP 3: Add foreign key for CuttingListItem.productionPlanItemId
-- ============================================================================

-- First, clean up any orphaned references (shouldn't exist, but safety first)
UPDATE "cutting_list_items" 
SET "productionPlanItemId" = NULL 
WHERE "productionPlanItemId" IS NOT NULL 
AND NOT EXISTS (
  SELECT 1 FROM "production_plan_items" 
  WHERE "production_plan_items"."id" = "cutting_list_items"."productionPlanItemId"
);

-- Add foreign key constraint (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'cutting_list_items_productionPlanItemId_fkey'
  ) THEN
    ALTER TABLE "cutting_list_items"
    ADD CONSTRAINT "cutting_list_items_productionPlanItemId_fkey"
    FOREIGN KEY ("productionPlanItemId")
    REFERENCES "production_plan_items"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE;
  END IF;
END $$;

-- ============================================================================
-- STEP 4: Add unique constraint for CuttingListStatistics.cuttingListId
-- ============================================================================

-- First, handle any duplicate statistics (keep the most recent one)
WITH ranked_stats AS (
  SELECT 
    id,
    "cuttingListId",
    ROW_NUMBER() OVER (PARTITION BY "cuttingListId" ORDER BY "updatedAt" DESC) as rn
  FROM "cutting_list_statistics"
)
DELETE FROM "cutting_list_statistics"
WHERE id IN (
  SELECT id FROM ranked_stats WHERE rn > 1
);

-- Add unique constraint (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'cutting_list_statistics_cuttingListId_key'
  ) THEN
    ALTER TABLE "cutting_list_statistics"
    ADD CONSTRAINT "cutting_list_statistics_cuttingListId_key"
    UNIQUE ("cuttingListId");
  END IF;
END $$;

-- ============================================================================
-- STEP 5: Update ProductionPlanItem.oncelik to use enum
-- ============================================================================

-- First, ensure all existing values are valid enum values
-- Map any invalid values to MEDIUM
UPDATE "production_plan_items"
SET "oncelik" = 'MEDIUM'
WHERE "oncelik" NOT IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')
OR "oncelik" IS NULL;

-- Change column type to enum
ALTER TABLE "production_plan_items"
ALTER COLUMN "oncelik" TYPE "ProductionPlanPriority" 
USING "oncelik"::"ProductionPlanPriority";

-- Add default value
ALTER TABLE "production_plan_items"
ALTER COLUMN "oncelik" SET DEFAULT 'MEDIUM';

-- ============================================================================
-- STEP 6: Add foreign key for AuditLog.userId (nullable)
-- ============================================================================

-- First, clean up any orphaned or invalid references
-- Set userId to NULL for records that don't have valid user references
-- This is intentional - audit logs should persist even if user is deleted
UPDATE "audit_logs"
SET "userId" = NULL
WHERE "userId" IS NOT NULL
AND (
  NOT EXISTS (
    SELECT 1 FROM "users"
    WHERE "users"."id" = "audit_logs"."userId"
  )
  OR "userId" = 'anonymous'
  OR LENGTH("userId") > 100
);

-- Drop NOT NULL constraint first (if exists)
-- Check if constraint exists before dropping
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'audit_logs' 
    AND column_name = 'userId' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE "audit_logs" ALTER COLUMN "userId" DROP NOT NULL;
  END IF;
END $$;

-- Add foreign key constraint (nullable)
-- Only add if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'audit_logs_userId_fkey'
  ) THEN
    ALTER TABLE "audit_logs"
    ADD CONSTRAINT "audit_logs_userId_fkey"
    FOREIGN KEY ("userId")
    REFERENCES "users"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE;
  END IF;
END $$;

