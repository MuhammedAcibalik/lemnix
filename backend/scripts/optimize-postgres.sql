-- PostgreSQL 18.0 Performance Optimization Settings
-- Run with: psql -U lemnix_user -d lemnix_db -f optimize-postgres.sql

-- ============================================================================
-- CONNECTION SETTINGS
-- ============================================================================

-- Maximum number of concurrent connections
ALTER SYSTEM SET max_connections = 200;

-- Shared memory for caching (25% of RAM for dedicated server)
ALTER SYSTEM SET shared_buffers = '256MB';

-- Estimated cache size (50-75% of RAM)
ALTER SYSTEM SET effective_cache_size = '1GB';

-- Memory per operation (sort, hash)
ALTER SYSTEM SET work_mem = '4MB';

-- Memory for maintenance operations (VACUUM, CREATE INDEX)
ALTER SYSTEM SET maintenance_work_mem = '128MB';

-- ============================================================================
-- WAL (Write-Ahead Logging) SETTINGS
-- ============================================================================

-- WAL buffer size
ALTER SYSTEM SET wal_buffers = '16MB';

-- Minimum WAL size
ALTER SYSTEM SET min_wal_size = '1GB';

-- Maximum WAL size
ALTER SYSTEM SET max_wal_size = '4GB';

-- Checkpoint completion target (spread checkpoints)
ALTER SYSTEM SET checkpoint_completion_target = 0.9;

-- ============================================================================
-- QUERY PLANNER SETTINGS
-- ============================================================================

-- Cost of random page access (lower for SSD)
ALTER SYSTEM SET random_page_cost = 1.1;

-- Number of concurrent I/O operations (SSD optimization)
ALTER SYSTEM SET effective_io_concurrency = 200;

-- Statistics target for query planner
ALTER SYSTEM SET default_statistics_target = 100;

-- ============================================================================
-- AUTOVACUUM SETTINGS
-- ============================================================================

-- Enable autovacuum
ALTER SYSTEM SET autovacuum = on;

-- Autovacuum max workers
ALTER SYSTEM SET autovacuum_max_workers = 3;

-- Autovacuum naptime
ALTER SYSTEM SET autovacuum_naptime = '1min';

-- ============================================================================
-- LOGGING SETTINGS
-- ============================================================================

-- Log slow queries (> 1000ms)
ALTER SYSTEM SET log_min_duration_statement = 1000;

-- Log connections
ALTER SYSTEM SET log_connections = on;

-- Log disconnections
ALTER SYSTEM SET log_disconnections = on;

-- Log lock waits
ALTER SYSTEM SET log_lock_waits = on;

-- ============================================================================
-- QUERY TIMEOUT SETTINGS
-- ============================================================================

-- Statement timeout (30 seconds)
ALTER SYSTEM SET statement_timeout = '30s';

-- Lock timeout (10 seconds)
ALTER SYSTEM SET lock_timeout = '10s';

-- Idle in transaction timeout (5 minutes)
ALTER SYSTEM SET idle_in_transaction_session_timeout = '5min';

-- ============================================================================
-- CONNECTION POOL SETTINGS
-- ============================================================================

-- Per-user connection limits (set via ALTER USER)
-- ALTER USER lemnix_user WITH CONNECTION LIMIT 50;

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable pg_stat_statements for query performance monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Enable pg_trgm for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enable btree_gin for JSONB indexing
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- ============================================================================
-- RELOAD CONFIGURATION
-- ============================================================================

SELECT pg_reload_conf();

-- ============================================================================
-- VERIFY SETTINGS
-- ============================================================================

SELECT name, setting, unit, context
FROM pg_settings
WHERE name IN (
  'max_connections',
  'shared_buffers',
  'effective_cache_size',
  'work_mem',
  'maintenance_work_mem',
  'wal_buffers',
  'random_page_cost',
  'effective_io_concurrency'
)
ORDER BY name;

-- ============================================================================
-- ANALYZE TABLES
-- ============================================================================

ANALYZE cutting_lists;
ANALYZE cutting_list_items;
ANALYZE optimizations;
ANALYZE users;
ANALYZE system_metrics;
ANALYZE user_activities;

\echo '\n✅ PostgreSQL optimization completed!\n'

