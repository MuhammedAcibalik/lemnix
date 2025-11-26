-- Partition Management Scripts
-- These scripts help manage time-based partitions for enterprise database

-- ============================================================================
-- CREATE FUTURE PARTITIONS
-- ============================================================================
-- Run this monthly to create partitions for next month
-- Usage: psql -U lemnix_user -d lemnix_db -f manage-partitions.sql

SELECT create_future_partitions();

-- ============================================================================
-- LIST ALL PARTITIONS
-- ============================================================================

-- List user_activities partitions
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE tablename LIKE 'user_activities_%'
ORDER BY tablename DESC;

-- List system_metrics partitions
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE tablename LIKE 'system_metrics_%'
ORDER BY tablename DESC;

-- List audit_logs partitions
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE tablename LIKE 'audit_logs_%'
ORDER BY tablename DESC;

-- List optimization_statistics partitions
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE tablename LIKE 'optimization_statistics_%'
ORDER BY tablename DESC;

-- List suggestion_metrics partitions
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE tablename LIKE 'suggestion_metrics_%'
ORDER BY tablename DESC;

-- ============================================================================
-- DROP OLD PARTITIONS (older than retention period)
-- ============================================================================
-- WARNING: This will permanently delete data!
-- Adjust retention_months as needed (default: 12 months)

DO $$
DECLARE
  retention_months integer := 12;
  cutoff_date date;
  partition_name text;
BEGIN
  cutoff_date := date_trunc('month', CURRENT_DATE) - (retention_months || ' months')::interval;
  
  -- Drop old user_activities partitions
  FOR partition_name IN 
    SELECT tablename FROM pg_tables 
    WHERE tablename LIKE 'user_activities_%' 
    AND tablename < 'user_activities_' || to_char(cutoff_date, 'YYYY_MM')
  LOOP
    EXECUTE format('DROP TABLE IF EXISTS %I', partition_name);
    RAISE NOTICE 'Dropped partition: %', partition_name;
  END LOOP;
  
  -- Drop old audit_logs partitions
  FOR partition_name IN 
    SELECT tablename FROM pg_tables 
    WHERE tablename LIKE 'audit_logs_%' 
    AND tablename < 'audit_logs_' || to_char(cutoff_date, 'YYYY_MM')
  LOOP
    EXECUTE format('DROP TABLE IF EXISTS %I', partition_name);
    RAISE NOTICE 'Dropped partition: %', partition_name;
  END LOOP;
  
  -- Drop old optimization_statistics partitions
  FOR partition_name IN 
    SELECT tablename FROM pg_tables 
    WHERE tablename LIKE 'optimization_statistics_%' 
    AND tablename < 'optimization_statistics_' || to_char(cutoff_date, 'YYYY_MM')
  LOOP
    EXECUTE format('DROP TABLE IF EXISTS %I', partition_name);
    RAISE NOTICE 'Dropped partition: %', partition_name;
  END LOOP;
  
  -- Drop old suggestion_metrics partitions
  FOR partition_name IN 
    SELECT tablename FROM pg_tables 
    WHERE tablename LIKE 'suggestion_metrics_%' 
    AND tablename < 'suggestion_metrics_' || to_char(cutoff_date, 'YYYY_MM')
  LOOP
    EXECUTE format('DROP TABLE IF EXISTS %I', partition_name);
    RAISE NOTICE 'Dropped partition: %', partition_name;
  END LOOP;
  
  -- Drop old system_metrics partitions (weekly, retention: 8 weeks)
  cutoff_date := date_trunc('week', CURRENT_DATE) - (8 || ' weeks')::interval;
  FOR partition_name IN 
    SELECT tablename FROM pg_tables 
    WHERE tablename LIKE 'system_metrics_%' 
    AND tablename < 'system_metrics_' || to_char(cutoff_date, 'IYYY_IW')
  LOOP
    EXECUTE format('DROP TABLE IF EXISTS %I', partition_name);
    RAISE NOTICE 'Dropped partition: %', partition_name;
  END LOOP;
END $$;

-- ============================================================================
-- PARTITION STATISTICS
-- ============================================================================

-- Get partition sizes and row counts
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    n_live_tup as row_count
FROM pg_stat_user_tables
WHERE tablename LIKE 'user_activities_%' 
   OR tablename LIKE 'system_metrics_%'
   OR tablename LIKE 'audit_logs_%'
   OR tablename LIKE 'optimization_statistics_%'
   OR tablename LIKE 'suggestion_metrics_%'
ORDER BY tablename;

-- ============================================================================
-- MANUAL PARTITION CREATION (if needed)
-- ============================================================================

-- Example: Create partition for specific month
-- SELECT create_user_activities_monthly_partition('2025-02-01'::date, '2025-03-01'::date);

-- Example: Create partition for specific week
-- SELECT create_system_metrics_weekly_partition('2025-01-27'::date, '2025-02-03'::date);

