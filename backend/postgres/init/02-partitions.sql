-- Time-based partitioning for UserActivity (monthly partitions)
-- Note: Partitions will be created after table migration

-- UserActivity monthly partitions (last 12 months from Oct 2024)
-- CREATE TABLE user_activities_2024_10 PARTITION OF user_activities
--   FOR VALUES FROM ('2024-10-01') TO ('2024-11-01');

-- CREATE TABLE user_activities_2024_11 PARTITION OF user_activities
--   FOR VALUES FROM ('2024-11-01') TO ('2024-12-01');

-- CREATE TABLE user_activities_2024_12 PARTITION OF user_activities
--   FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');

-- SystemMetrics weekly partitions (last 8 weeks from Oct 2024)
-- CREATE TABLE system_metrics_2024_w41 PARTITION OF system_metrics
--   FOR VALUES FROM ('2024-10-07') TO ('2024-10-14');

-- CREATE TABLE system_metrics_2024_w42 PARTITION OF system_metrics
--   FOR VALUES FROM ('2024-10-14') TO ('2024-10-21');

-- Auto-create monthly partitions function
CREATE OR REPLACE FUNCTION create_monthly_partition()
RETURNS void AS $$
DECLARE
  start_date date := date_trunc('month', CURRENT_DATE + interval '1 month');
  end_date date := start_date + interval '1 month';
  partition_name text := 'user_activities_' || to_char(start_date, 'YYYY_MM');
BEGIN
  EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF user_activities FOR VALUES FROM (%L) TO (%L)', 
    partition_name, start_date, end_date);
  
  RAISE NOTICE 'Created partition: %', partition_name;
END;
$$ LANGUAGE plpgsql;

-- Auto-create weekly partitions function
CREATE OR REPLACE FUNCTION create_weekly_partition()
RETURNS void AS $$
DECLARE
  start_date date := date_trunc('week', CURRENT_DATE + interval '1 week');
  end_date date := start_date + interval '1 week';
  week_num text := to_char(start_date, 'IYYY_IW');
  partition_name text := 'system_metrics_' || week_num;
BEGIN
  EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF system_metrics FOR VALUES FROM (%L) TO (%L)', 
    partition_name, start_date, end_date);
  
  RAISE NOTICE 'Created partition: %', partition_name;
END;
$$ LANGUAGE plpgsql;

-- Note: Partitioning will be enabled after Prisma migration creates base tables
-- Run these commands manually after migration:
-- 1. ALTER TABLE user_activities RENAME TO user_activities_old;
-- 2. CREATE TABLE user_activities (LIKE user_activities_old INCLUDING ALL) PARTITION BY RANGE (created_at);
-- 3. Create initial partitions
-- 4. Copy data: INSERT INTO user_activities SELECT * FROM user_activities_old;
-- 5. DROP TABLE user_activities_old;

