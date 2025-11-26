-- Migration: Enable Time-Based Partitioning
-- This migration converts existing tables to partitioned tables for better performance
-- Tables: user_activities, system_metrics, audit_logs, optimization_statistics, suggestion_metrics

-- ============================================================================
-- STEP 1: Create partition management functions
-- ============================================================================

-- Function to create monthly partitions for user_activities
CREATE OR REPLACE FUNCTION create_user_activities_monthly_partition(start_date date, end_date date)
RETURNS void AS $$
DECLARE
  partition_name text := 'user_activities_' || to_char(start_date, 'YYYY_MM');
BEGIN
  EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF user_activities FOR VALUES FROM (%L) TO (%L)', 
    partition_name, start_date, end_date);
  RAISE NOTICE 'Created partition: %', partition_name;
END;
$$ LANGUAGE plpgsql;

-- Function to create monthly partitions for audit_logs
CREATE OR REPLACE FUNCTION create_audit_logs_monthly_partition(start_date date, end_date date)
RETURNS void AS $$
DECLARE
  partition_name text := 'audit_logs_' || to_char(start_date, 'YYYY_MM');
BEGIN
  EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF audit_logs FOR VALUES FROM (%L) TO (%L)', 
    partition_name, start_date, end_date);
  RAISE NOTICE 'Created partition: %', partition_name;
END;
$$ LANGUAGE plpgsql;

-- Function to create monthly partitions for optimization_statistics
CREATE OR REPLACE FUNCTION create_optimization_statistics_monthly_partition(start_date date, end_date date)
RETURNS void AS $$
DECLARE
  partition_name text := 'optimization_statistics_' || to_char(start_date, 'YYYY_MM');
BEGIN
  EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF optimization_statistics FOR VALUES FROM (%L) TO (%L)', 
    partition_name, start_date, end_date);
  RAISE NOTICE 'Created partition: %', partition_name;
END;
$$ LANGUAGE plpgsql;

-- Function to create monthly partitions for suggestion_metrics
CREATE OR REPLACE FUNCTION create_suggestion_metrics_monthly_partition(start_date date, end_date date)
RETURNS void AS $$
DECLARE
  partition_name text := 'suggestion_metrics_' || to_char(start_date, 'YYYY_MM');
BEGIN
  EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF suggestion_metrics FOR VALUES FROM (%L) TO (%L)', 
    partition_name, start_date, end_date);
  RAISE NOTICE 'Created partition: %', partition_name;
END;
$$ LANGUAGE plpgsql;

-- Function to create weekly partitions for system_metrics
CREATE OR REPLACE FUNCTION create_system_metrics_weekly_partition(start_date date, end_date date)
RETURNS void AS $$
DECLARE
  week_num text := to_char(start_date, 'IYYY_IW');
  partition_name text := 'system_metrics_' || week_num;
BEGIN
  EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF system_metrics FOR VALUES FROM (%L) TO (%L)', 
    partition_name, start_date, end_date);
  RAISE NOTICE 'Created partition: %', partition_name;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 2: Convert user_activities to partitioned table
-- ============================================================================

DO $$
DECLARE
  row_count integer;
  min_date date;
  max_date date;
  i integer;
BEGIN
  SELECT COUNT(*) INTO row_count FROM user_activities;
  
  -- Create temporary table with same structure (without constraints)
  CREATE TABLE IF NOT EXISTS user_activities_temp (LIKE user_activities INCLUDING DEFAULTS INCLUDING STORAGE);
  
  IF row_count > 0 THEN
    -- Get date range
    SELECT MIN("createdAt"::date), MAX("createdAt"::date) INTO min_date, max_date FROM user_activities;
    
    -- Copy data
    INSERT INTO user_activities_temp SELECT * FROM user_activities;
  END IF;
  
  -- Drop original table
  DROP TABLE IF EXISTS user_activities CASCADE;
  
  -- Create partitioned table (without primary key first)
  CREATE TABLE user_activities (
    LIKE user_activities_temp INCLUDING DEFAULTS INCLUDING STORAGE
  ) PARTITION BY RANGE ("createdAt");
  
  -- Add primary key constraint (must include partition key)
  ALTER TABLE user_activities ADD PRIMARY KEY (id, "createdAt");
  
  -- Create partitions BEFORE inserting data
  IF row_count > 0 AND min_date IS NOT NULL THEN
    -- Create partition for existing data
    PERFORM create_user_activities_monthly_partition(
      (date_trunc('month', min_date))::date,
      (date_trunc('month', min_date) + interval '1 month')::date
    );
  END IF;
  
  -- Create partitions for next 12 months
  FOR i IN 0..12 LOOP
    PERFORM create_user_activities_monthly_partition(
      (date_trunc('month', CURRENT_DATE) + (i || ' months')::interval)::date,
      (date_trunc('month', CURRENT_DATE) + ((i + 1) || ' months')::interval)::date
    );
  END LOOP;
  
  -- Copy data back if exists
  IF row_count > 0 THEN
    INSERT INTO user_activities SELECT * FROM user_activities_temp;
  END IF;
  
  -- Drop temp table
  DROP TABLE IF EXISTS user_activities_temp;
  
  RAISE NOTICE 'Converted user_activities to partitioned table with % rows', COALESCE(row_count, 0);
END $$;

-- ============================================================================
-- STEP 3: Convert system_metrics to partitioned table (weekly)
-- ============================================================================

DO $$
DECLARE
  row_count integer;
  min_date date;
  max_date date;
  i integer;
BEGIN
  SELECT COUNT(*) INTO row_count FROM system_metrics;
  
  CREATE TABLE IF NOT EXISTS system_metrics_temp (LIKE system_metrics INCLUDING DEFAULTS INCLUDING STORAGE);
  
  IF row_count > 0 THEN
    SELECT MIN(timestamp::date), MAX(timestamp::date) INTO min_date, max_date FROM system_metrics;
    INSERT INTO system_metrics_temp SELECT * FROM system_metrics;
  END IF;
  
  DROP TABLE IF EXISTS system_metrics CASCADE;
  
  CREATE TABLE system_metrics (
    LIKE system_metrics_temp INCLUDING DEFAULTS INCLUDING STORAGE
  ) PARTITION BY RANGE (timestamp);
  
  ALTER TABLE system_metrics ADD PRIMARY KEY (id, timestamp);
  
  -- Create partitions BEFORE inserting data
  IF row_count > 0 AND min_date IS NOT NULL THEN
    -- Create partition for existing data
    PERFORM create_system_metrics_weekly_partition(
      (date_trunc('week', min_date))::date,
      (date_trunc('week', min_date) + interval '1 week')::date
    );
  END IF;
  
  -- Create partitions for next 8 weeks
  FOR i IN 0..8 LOOP
    PERFORM create_system_metrics_weekly_partition(
      (date_trunc('week', CURRENT_DATE) + (i || ' weeks')::interval)::date,
      (date_trunc('week', CURRENT_DATE) + ((i + 1) || ' weeks')::interval)::date
    );
  END LOOP;
  
  IF row_count > 0 THEN
    INSERT INTO system_metrics SELECT * FROM system_metrics_temp;
  END IF;
  
  DROP TABLE IF EXISTS system_metrics_temp;
  
  RAISE NOTICE 'Converted system_metrics to partitioned table with % rows', COALESCE(row_count, 0);
END $$;

-- ============================================================================
-- STEP 4: Convert audit_logs to partitioned table
-- ============================================================================

DO $$
DECLARE
  row_count integer;
  min_date date;
  max_date date;
  i integer;
BEGIN
  SELECT COUNT(*) INTO row_count FROM audit_logs;
  
  CREATE TABLE IF NOT EXISTS audit_logs_temp (LIKE audit_logs INCLUDING DEFAULTS INCLUDING STORAGE);
  
  IF row_count > 0 THEN
    SELECT MIN(timestamp::date), MAX(timestamp::date) INTO min_date, max_date FROM audit_logs;
    INSERT INTO audit_logs_temp SELECT * FROM audit_logs;
  END IF;
  
  DROP TABLE IF EXISTS audit_logs CASCADE;
  
  CREATE TABLE audit_logs (
    LIKE audit_logs_temp INCLUDING DEFAULTS INCLUDING STORAGE
  ) PARTITION BY RANGE (timestamp);
  
  ALTER TABLE audit_logs ADD PRIMARY KEY (id, timestamp);
  
  -- Create partitions BEFORE inserting data
  IF row_count > 0 AND min_date IS NOT NULL THEN
    -- Create partition for existing data
    PERFORM create_audit_logs_monthly_partition(
      (date_trunc('month', min_date))::date,
      (date_trunc('month', min_date) + interval '1 month')::date
    );
  END IF;
  
  -- Create partitions for next 12 months
  FOR i IN 0..12 LOOP
    PERFORM create_audit_logs_monthly_partition(
      (date_trunc('month', CURRENT_DATE) + (i || ' months')::interval)::date,
      (date_trunc('month', CURRENT_DATE) + ((i + 1) || ' months')::interval)::date
    );
  END LOOP;
  
  IF row_count > 0 THEN
    INSERT INTO audit_logs SELECT * FROM audit_logs_temp;
  END IF;
  
  DROP TABLE IF EXISTS audit_logs_temp;
  
  RAISE NOTICE 'Converted audit_logs to partitioned table with % rows', COALESCE(row_count, 0);
END $$;

-- ============================================================================
-- STEP 5: Convert optimization_statistics to partitioned table
-- ============================================================================

DO $$
DECLARE
  row_count integer;
  min_date date;
  max_date date;
  i integer;
BEGIN
  SELECT COUNT(*) INTO row_count FROM optimization_statistics;
  
  CREATE TABLE IF NOT EXISTS optimization_statistics_temp (LIKE optimization_statistics INCLUDING DEFAULTS INCLUDING STORAGE);
  
  IF row_count > 0 THEN
    SELECT MIN("createdAt"::date), MAX("createdAt"::date) INTO min_date, max_date FROM optimization_statistics;
    INSERT INTO optimization_statistics_temp SELECT * FROM optimization_statistics;
  END IF;
  
  DROP TABLE IF EXISTS optimization_statistics CASCADE;
  
  CREATE TABLE optimization_statistics (
    LIKE optimization_statistics_temp INCLUDING DEFAULTS INCLUDING STORAGE
  ) PARTITION BY RANGE ("createdAt");
  
  ALTER TABLE optimization_statistics ADD PRIMARY KEY (id, "createdAt");
  
  -- Create partitions BEFORE inserting data
  IF row_count > 0 AND min_date IS NOT NULL THEN
    PERFORM create_optimization_statistics_monthly_partition(
      (date_trunc('month', min_date))::date,
      (date_trunc('month', min_date) + interval '1 month')::date
    );
  END IF;
  
  -- Create partitions for next 12 months
  FOR i IN 0..12 LOOP
    PERFORM create_optimization_statistics_monthly_partition(
      (date_trunc('month', CURRENT_DATE) + (i || ' months')::interval)::date,
      (date_trunc('month', CURRENT_DATE) + ((i + 1) || ' months')::interval)::date
    );
  END LOOP;
  
  IF row_count > 0 THEN
    INSERT INTO optimization_statistics SELECT * FROM optimization_statistics_temp;
  END IF;
  
  DROP TABLE IF EXISTS optimization_statistics_temp;
  
  RAISE NOTICE 'Converted optimization_statistics to partitioned table with % rows', COALESCE(row_count, 0);
END $$;

-- ============================================================================
-- STEP 6: Convert suggestion_metrics to partitioned table
-- ============================================================================

DO $$
DECLARE
  row_count integer;
  min_date date;
  max_date date;
  i integer;
BEGIN
  SELECT COUNT(*) INTO row_count FROM suggestion_metrics;
  
  CREATE TABLE IF NOT EXISTS suggestion_metrics_temp (LIKE suggestion_metrics INCLUDING DEFAULTS INCLUDING STORAGE);
  
  IF row_count > 0 THEN
    SELECT MIN(timestamp::date), MAX(timestamp::date) INTO min_date, max_date FROM suggestion_metrics;
    INSERT INTO suggestion_metrics_temp SELECT * FROM suggestion_metrics;
  END IF;
  
  DROP TABLE IF EXISTS suggestion_metrics CASCADE;
  
  CREATE TABLE suggestion_metrics (
    LIKE suggestion_metrics_temp INCLUDING DEFAULTS INCLUDING STORAGE
  ) PARTITION BY RANGE (timestamp);
  
  ALTER TABLE suggestion_metrics ADD PRIMARY KEY (id, timestamp);
  
  -- Create partitions BEFORE inserting data
  IF row_count > 0 AND min_date IS NOT NULL THEN
    PERFORM create_suggestion_metrics_monthly_partition(
      (date_trunc('month', min_date))::date,
      (date_trunc('month', min_date) + interval '1 month')::date
    );
  END IF;
  
  -- Create partitions for next 12 months
  FOR i IN 0..12 LOOP
    PERFORM create_suggestion_metrics_monthly_partition(
      (date_trunc('month', CURRENT_DATE) + (i || ' months')::interval)::date,
      (date_trunc('month', CURRENT_DATE) + ((i + 1) || ' months')::interval)::date
    );
  END LOOP;
  
  IF row_count > 0 THEN
    INSERT INTO suggestion_metrics SELECT * FROM suggestion_metrics_temp;
  END IF;
  
  DROP TABLE IF EXISTS suggestion_metrics_temp;
  
  RAISE NOTICE 'Converted suggestion_metrics to partitioned table with % rows', COALESCE(row_count, 0);
END $$;

-- ============================================================================
-- STEP 7: Recreate indexes on partitioned tables
-- ============================================================================

-- user_activities indexes
CREATE INDEX IF NOT EXISTS user_activities_userId_createdAt_idx ON user_activities("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS user_activities_activityType_createdAt_idx ON user_activities("activityType", "createdAt");
CREATE INDEX IF NOT EXISTS user_activities_createdAt_idx ON user_activities("createdAt" DESC);

-- system_metrics indexes
CREATE INDEX IF NOT EXISTS system_metrics_metricType_timestamp_idx ON system_metrics("metricType", timestamp DESC);
CREATE INDEX IF NOT EXISTS system_metrics_timestamp_idx ON system_metrics(timestamp DESC);

-- audit_logs indexes
CREATE INDEX IF NOT EXISTS audit_logs_userId_timestamp_idx ON audit_logs("userId", timestamp DESC);
CREATE INDEX IF NOT EXISTS audit_logs_tableName_operation_idx ON audit_logs("tableName", operation);
CREATE INDEX IF NOT EXISTS audit_logs_recordId_idx ON audit_logs("recordId");
CREATE INDEX IF NOT EXISTS audit_logs_timestamp_idx ON audit_logs(timestamp DESC);

-- optimization_statistics indexes
CREATE INDEX IF NOT EXISTS optimization_statistics_algorithm_createdAt_idx ON optimization_statistics(algorithm, "createdAt");

-- suggestion_metrics indexes
CREATE INDEX IF NOT EXISTS suggestion_metrics_metricType_timestamp_idx ON suggestion_metrics("metricType", timestamp DESC);
CREATE INDEX IF NOT EXISTS suggestion_metrics_productName_size_idx ON suggestion_metrics("productName", size);

-- ============================================================================
-- STEP 8: Create automatic partition creation function (for cron jobs)
-- ============================================================================

CREATE OR REPLACE FUNCTION create_future_partitions()
RETURNS void AS $$
DECLARE
  next_month date;
  next_week date;
BEGIN
  -- Create next month's partitions for monthly tables
  next_month := (date_trunc('month', CURRENT_DATE + interval '2 months'))::date;
  
  PERFORM create_user_activities_monthly_partition(
    next_month,
    (next_month + interval '1 month')::date
  );
  
  PERFORM create_audit_logs_monthly_partition(
    next_month,
    (next_month + interval '1 month')::date
  );
  
  PERFORM create_optimization_statistics_monthly_partition(
    next_month,
    (next_month + interval '1 month')::date
  );
  
  PERFORM create_suggestion_metrics_monthly_partition(
    next_month,
    (next_month + interval '1 month')::date
  );
  
  -- Create next week's partition for system_metrics
  next_week := (date_trunc('week', CURRENT_DATE + interval '2 weeks'))::date;
  
  PERFORM create_system_metrics_weekly_partition(
    next_week,
    (next_week + interval '1 week')::date
  );
  
  RAISE NOTICE 'Created future partitions for all tables';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION create_future_partitions() IS 'Creates partitions for next month/week. Should be run monthly/weekly via cron job.';
