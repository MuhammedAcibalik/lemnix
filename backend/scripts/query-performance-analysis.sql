-- ============================================================================
-- Query Performance Analysis Script
-- ============================================================================
-- This script provides comprehensive query performance analysis using
-- pg_stat_statements extension. Run this regularly to identify slow queries
-- and optimization opportunities.
--
-- Prerequisites:
-- - pg_stat_statements extension must be enabled
-- - Sufficient statistics collected (run for at least 1 hour after enabling)
--
-- Usage:
--   psql -h localhost -U lemnix_user -d lemnix_db -f scripts/query-performance-analysis.sql
-- ============================================================================

-- ============================================================================
-- STEP 1: Verify pg_stat_statements is enabled
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'pg_stat_statements'
    ) THEN
        RAISE EXCEPTION 'pg_stat_statements extension is not enabled. Run: CREATE EXTENSION IF NOT EXISTS pg_stat_statements;';
    END IF;
END $$;

-- ============================================================================
-- STEP 2: Top 20 Slowest Queries by Average Execution Time
-- ============================================================================
\echo '=== Top 20 Slowest Queries by Average Execution Time ==='
SELECT
    LEFT(query, 100) AS query_preview,
    calls,
    ROUND(total_exec_time::numeric, 2) AS total_time_ms,
    ROUND(mean_exec_time::numeric, 2) AS avg_time_ms,
    ROUND(max_exec_time::numeric, 2) AS max_time_ms,
    ROUND((100 * total_exec_time / SUM(total_exec_time) OVER())::numeric, 2) AS pct_total_time,
    ROUND(stddev_exec_time::numeric, 2) AS stddev_time_ms
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
  AND query NOT LIKE '%pg_catalog%'
ORDER BY mean_exec_time DESC
LIMIT 20;

-- ============================================================================
-- STEP 3: Top 20 Most Frequently Executed Queries
-- ============================================================================
\echo ''
\echo '=== Top 20 Most Frequently Executed Queries ==='
SELECT
    LEFT(query, 100) AS query_preview,
    calls,
    ROUND(total_exec_time::numeric, 2) AS total_time_ms,
    ROUND(mean_exec_time::numeric, 2) AS avg_time_ms,
    ROUND((100 * calls / SUM(calls) OVER())::numeric, 2) AS pct_total_calls
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
  AND query NOT LIKE '%pg_catalog%'
ORDER BY calls DESC
LIMIT 20;

-- ============================================================================
-- STEP 4: Top 20 Queries by Total Execution Time
-- ============================================================================
\echo ''
\echo '=== Top 20 Queries by Total Execution Time ==='
SELECT
    LEFT(query, 100) AS query_preview,
    calls,
    ROUND(total_exec_time::numeric, 2) AS total_time_ms,
    ROUND(mean_exec_time::numeric, 2) AS avg_time_ms,
    ROUND((100 * total_exec_time / SUM(total_exec_time) OVER())::numeric, 2) AS pct_total_time
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
  AND query NOT LIKE '%pg_catalog%'
ORDER BY total_exec_time DESC
LIMIT 20;

-- ============================================================================
-- STEP 5: Queries with High Variance (Inconsistent Performance)
-- ============================================================================
\echo ''
\echo '=== Queries with High Variance (Inconsistent Performance) ==='
SELECT
    LEFT(query, 100) AS query_preview,
    calls,
    ROUND(mean_exec_time::numeric, 2) AS avg_time_ms,
    ROUND(stddev_exec_time::numeric, 2) AS stddev_time_ms,
    ROUND((stddev_exec_time / NULLIF(mean_exec_time, 0))::numeric, 2) AS coefficient_of_variation,
    ROUND(max_exec_time::numeric, 2) AS max_time_ms,
    ROUND(min_exec_time::numeric, 2) AS min_time_ms
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
  AND query NOT LIKE '%pg_catalog%'
  AND calls > 10
  AND stddev_exec_time > 0
ORDER BY (stddev_exec_time / NULLIF(mean_exec_time, 0)) DESC
LIMIT 20;

-- ============================================================================
-- STEP 6: Queries with High I/O (Shared Blocks)
-- ============================================================================
\echo ''
\echo '=== Top 20 Queries with High I/O (Shared Blocks) ==='
SELECT
    LEFT(query, 100) AS query_preview,
    calls,
    ROUND(mean_exec_time::numeric, 2) AS avg_time_ms,
    shared_blks_hit,
    shared_blks_read,
    shared_blks_dirtied,
    shared_blks_written,
    ROUND((shared_blks_hit::numeric / NULLIF(shared_blks_hit + shared_blks_read, 0) * 100)::numeric, 2) AS cache_hit_pct
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
  AND query NOT LIKE '%pg_catalog%'
  AND (shared_blks_hit + shared_blks_read) > 0
ORDER BY (shared_blks_hit + shared_blks_read) DESC
LIMIT 20;

-- ============================================================================
-- STEP 7: Queries with High Temporary File Usage
-- ============================================================================
\echo ''
\echo '=== Queries with High Temporary File Usage (Possible Memory Issues) ==='
SELECT
    LEFT(query, 100) AS query_preview,
    calls,
    ROUND(mean_exec_time::numeric, 2) AS avg_time_ms,
    temp_blks_read,
    temp_blks_written,
    local_blks_read,
    local_blks_written,
    ROUND((temp_blks_read + temp_blks_written)::numeric / NULLIF(calls, 0), 2) AS avg_temp_blocks_per_call
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
  AND query NOT LIKE '%pg_catalog%'
  AND (temp_blks_read + temp_blks_written) > 0
ORDER BY (temp_blks_read + temp_blks_written) DESC
LIMIT 20;

-- ============================================================================
-- STEP 8: Query Performance Summary Statistics
-- ============================================================================
\echo ''
\echo '=== Query Performance Summary Statistics ==='
SELECT
    COUNT(*) AS total_queries,
    SUM(calls) AS total_calls,
    ROUND(SUM(total_exec_time)::numeric, 2) AS total_time_ms,
    ROUND(AVG(mean_exec_time)::numeric, 2) AS avg_mean_time_ms,
    ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY mean_exec_time)::numeric, 2) AS median_time_ms,
    ROUND(MAX(mean_exec_time)::numeric, 2) AS max_avg_time_ms,
    ROUND(MIN(mean_exec_time)::numeric, 2) AS min_avg_time_ms
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
  AND query NOT LIKE '%pg_catalog%';

-- ============================================================================
-- STEP 9: Index Usage Analysis (Requires pg_stat_statements with queryid)
-- ============================================================================
\echo ''
\echo '=== Index Usage Analysis ==='
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch,
    CASE
        WHEN idx_scan = 0 THEN 'UNUSED'
        WHEN idx_scan < 100 THEN 'LOW_USAGE'
        ELSE 'ACTIVE'
    END AS usage_status
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC, tablename, indexname;

-- ============================================================================
-- STEP 10: Table Access Patterns
-- ============================================================================
\echo ''
\echo '=== Table Access Patterns ==='
SELECT
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch,
    n_tup_ins,
    n_tup_upd,
    n_tup_del,
    n_live_tup,
    n_dead_tup,
    ROUND((n_dead_tup::numeric / NULLIF(n_live_tup + n_dead_tup, 0) * 100)::numeric, 2) AS dead_tuple_pct,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY (seq_scan + idx_scan) DESC;

-- ============================================================================
-- STEP 11: Recommendations
-- ============================================================================
\echo ''
\echo '=== Performance Recommendations ==='
\echo ''
\echo '1. Review slow queries (avg_time_ms > 100ms) and optimize:'
\echo '   - Add missing indexes'
\echo '   - Rewrite inefficient queries'
\echo '   - Consider query caching'
\echo ''
\echo '2. Investigate high variance queries:'
\echo '   - Check for parameter sniffing issues'
\echo '   - Review query plans with EXPLAIN ANALYZE'
\echo ''
\echo '3. Address high I/O queries:'
\echo '   - Increase shared_buffers if cache_hit_pct < 99%'
\echo '   - Consider materialized views for expensive aggregations'
\echo ''
\echo '4. Fix temporary file usage:'
\echo '   - Increase work_mem for queries using temp files'
\echo '   - Optimize queries to use indexes instead of sorts'
\echo ''
\echo '5. Clean up unused indexes:'
\echo '   - Drop indexes with idx_scan = 0 (after verification)'
\echo ''
\echo '6. Vacuum tables with high dead tuple percentage:'
\echo '   - Run VACUUM ANALYZE on tables with dead_tuple_pct > 10%'
\echo ''

-- ============================================================================
-- STEP 12: Reset Statistics (Optional - Uncomment to reset)
-- ============================================================================
-- WARNING: This will reset all query statistics. Only use for testing.
-- SELECT pg_stat_statements_reset();

