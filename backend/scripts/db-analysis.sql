-- Database Analysis Queries
-- Orphaned Records Check

-- 1. Check for orphaned foreign key records
SELECT 'cutting_list_items' as table_name, COUNT(*) as orphaned_count 
FROM cutting_list_items cli 
LEFT JOIN cutting_lists cl ON cli."cuttingListId" = cl.id 
WHERE cl.id IS NULL

UNION ALL

SELECT 'cutting_list_statistics', COUNT(*) 
FROM cutting_list_statistics cls 
LEFT JOIN cutting_lists cl ON cls."cuttingListId" = cl.id 
WHERE cl.id IS NULL

UNION ALL

SELECT 'production_plan_items', COUNT(*) 
FROM production_plan_items ppi 
LEFT JOIN production_plans pp ON ppi."planId" = pp.id 
WHERE pp.id IS NULL

UNION ALL

SELECT 'production_plan_items (linked)', COUNT(*) 
FROM production_plan_items ppi 
LEFT JOIN cutting_lists cl ON ppi."linkedCuttingListId" = cl.id 
WHERE ppi."linkedCuttingListId" IS NOT NULL AND cl.id IS NULL

UNION ALL

SELECT 'cutting_list_items (production)', COUNT(*) 
FROM cutting_list_items cli 
LEFT JOIN production_plan_items ppi ON cli."productionPlanItemId" = ppi.id 
WHERE cli."productionPlanItemId" IS NOT NULL AND ppi.id IS NULL

UNION ALL

SELECT 'profile_stock_lengths', COUNT(*) 
FROM profile_stock_lengths psl 
LEFT JOIN profile_definitions pd ON psl."profileId" = pd.id 
WHERE pd.id IS NULL

UNION ALL

SELECT 'work_order_profile_mappings', COUNT(*) 
FROM work_order_profile_mappings wopm 
LEFT JOIN profile_definitions pd ON wopm."profileId" = pd.id 
WHERE pd.id IS NULL

UNION ALL

SELECT 'product_mappings', COUNT(*) 
FROM product_mappings pm 
LEFT JOIN product_categories pc ON pm."categoryId" = pc.id 
WHERE pc.id IS NULL

UNION ALL

SELECT 'user_activities', COUNT(*) 
FROM user_activities ua 
LEFT JOIN users u ON ua."userId" = u.id 
WHERE u.id IS NULL

UNION ALL

SELECT 'optimizations', COUNT(*) 
FROM optimizations o 
LEFT JOIN users u ON o."userId" = u.id 
WHERE u.id IS NULL

UNION ALL

SELECT 'cutting_lists', COUNT(*) 
FROM cutting_lists cl 
LEFT JOIN users u ON cl."userId" = u.id 
WHERE u.id IS NULL;

-- 2. Check table statistics
SELECT 
    schemaname, 
    relname as tablename, 
    n_live_tup, 
    n_dead_tup, 
    last_vacuum, 
    last_autovacuum, 
    last_analyze, 
    last_autoanalyze 
FROM pg_stat_user_tables 
ORDER BY n_dead_tup DESC NULLS LAST 
LIMIT 10;

-- 3. Check unused indexes
SELECT 
    schemaname, 
    relname as tablename, 
    indexrelname as indexname, 
    idx_scan, 
    idx_tup_read, 
    idx_tup_fetch 
FROM pg_stat_user_indexes 
WHERE schemaname = 'public' AND idx_scan = 0 
ORDER BY relname, indexrelname 
LIMIT 20;

-- 4. Check for potential data integrity issues
-- Duplicate cutting lists per user/week
SELECT 
    "userId", 
    "weekNumber", 
    COUNT(*) as duplicate_count 
FROM cutting_lists 
WHERE "weekNumber" IS NOT NULL 
GROUP BY "userId", "weekNumber" 
HAVING COUNT(*) > 1;

-- 5. Check for invalid enum values in status fields
SELECT DISTINCT status 
FROM cutting_lists 
WHERE status NOT IN ('DRAFT', 'READY', 'PROCESSING', 'COMPLETED', 'ARCHIVED');

SELECT DISTINCT priority 
FROM cutting_list_items 
WHERE priority NOT IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- 6. Check for NULL values in required business fields
SELECT 
    'cutting_list_items' as table_name,
    COUNT(*) as null_workOrderId_count
FROM cutting_list_items 
WHERE "workOrderId" IS NULL OR "workOrderId" = ''

UNION ALL

SELECT 
    'cutting_list_items',
    COUNT(*)
FROM cutting_list_items 
WHERE "profileType" IS NULL OR "profileType" = ''

UNION ALL

SELECT 
    'production_plan_items',
    COUNT(*)
FROM production_plan_items 
WHERE "malzemeNo" IS NULL OR "malzemeNo" = '';

-- 7. Check constraint violations (should return 0 rows if all constraints are valid)
SELECT 
    'cutting_list_items' as table_name,
    COUNT(*) as invalid_quantity
FROM cutting_list_items 
WHERE quantity <= 0

UNION ALL

SELECT 
    'cutting_list_items',
    COUNT(*)
FROM cutting_list_items 
WHERE length <= 0

UNION ALL

SELECT 
    'cutting_lists',
    COUNT(*)
FROM cutting_lists 
WHERE "weekNumber" IS NOT NULL AND ("weekNumber" < 1 OR "weekNumber" > 53)

UNION ALL

SELECT 
    'production_plans',
    COUNT(*)
FROM production_plans 
WHERE "weekNumber" < 1 OR "weekNumber" > 53

UNION ALL

SELECT 
    'production_plans',
    COUNT(*)
FROM production_plans 
WHERE year < 2000 OR year > 2100;

-- 8. Check for circular dependencies or self-referencing issues
SELECT 
    COUNT(*) as self_referencing_cutting_lists
FROM cutting_lists cl1
INNER JOIN cutting_lists cl2 ON cl1.id = cl2.id AND cl1."userId" = cl2."userId"
WHERE cl1.id != cl2.id;

