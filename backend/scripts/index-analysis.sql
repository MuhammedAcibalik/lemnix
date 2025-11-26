-- ============================================================================
-- Index Analysis Script
-- ============================================================================
-- This script analyzes index usage and provides recommendations for
-- index optimization, including:
-- - Unused indexes (candidates for removal)
-- - Missing indexes (based on query patterns)
-- - Index bloat analysis
-- - Duplicate indexes
--
-- Usage:
--   psql -h localhost -U lemnix_user -d lemnix_db -f scripts/index-analysis.sql
-- ============================================================================

-- ============================================================================
-- STEP 1: Unused Indexes (Candidates for Removal)
-- ============================================================================
\echo '=== Unused Indexes (Candidates for Removal) ==='
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
    idx_scan AS index_scans,
    idx_tup_read AS tuples_read,
    idx_tup_fetch AS tuples_fetched,
    CASE
        WHEN idx_scan = 0 THEN 'UNUSED'
        WHEN idx_scan < 10 THEN 'RARELY_USED'
        ELSE 'ACTIVE'
    END AS usage_status
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;

-- ============================================================================
-- STEP 2: Rarely Used Indexes
-- ============================================================================
\echo ''
\echo '=== Rarely Used Indexes (< 10 scans) ==='
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
    idx_scan AS index_scans,
    idx_tup_read AS tuples_read,
    idx_tup_fetch AS tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan > 0
  AND idx_scan < 10
ORDER BY pg_relation_size(indexrelid) DESC;

-- ============================================================================
-- STEP 3: Index Bloat Analysis
-- ============================================================================
\echo ''
\echo '=== Index Bloat Analysis ==='
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
    pg_size_pretty(pg_relation_size(indexrelid) - COALESCE(pgstat.idx_blks_hit * 8192, 0)) AS estimated_bloat,
    idx_scan AS index_scans,
    CASE
        WHEN pg_relation_size(indexrelid) > 104857600 THEN 'LARGE'
        WHEN pg_relation_size(indexrelid) > 10485760 THEN 'MEDIUM'
        ELSE 'SMALL'
    END AS size_category
FROM pg_stat_user_indexes
LEFT JOIN pg_statio_user_indexes pgstat ON pg_stat_user_indexes.indexrelid = pgstat.indexrelid
WHERE schemaname = 'public'
  AND pg_relation_size(indexrelid) > 1048576  -- > 1MB
ORDER BY pg_relation_size(indexrelid) DESC
LIMIT 20;

-- ============================================================================
-- STEP 4: Duplicate Indexes
-- ============================================================================
\echo ''
\echo '=== Potential Duplicate Indexes ==='
SELECT
    t.schemaname,
    t.tablename,
    array_agg(t.indexname ORDER BY t.indexname) AS duplicate_indexes,
    COUNT(*) AS index_count,
    SUM(pg_relation_size(t.indexrelid)) AS total_size_bytes,
    pg_size_pretty(SUM(pg_relation_size(t.indexrelid))) AS total_size
FROM (
    SELECT
        schemaname,
        tablename,
        indexname,
        indexrelid,
        array_to_string(
            array(
                SELECT attname
                FROM pg_attribute
                WHERE attrelid = indrelid
                  AND attnum = ANY(indkey)
                ORDER BY array_position(indkey, attnum)
            ),
            ', '
        ) AS index_columns
    FROM pg_index
    JOIN pg_stat_user_indexes ON pg_index.indexrelid = pg_stat_user_indexes.indexrelid
    WHERE schemaname = 'public'
) t
GROUP BY t.schemaname, t.tablename, t.index_columns
HAVING COUNT(*) > 1
ORDER BY total_size_bytes DESC;

-- ============================================================================
-- STEP 5: Missing Indexes (Based on Sequential Scans)
-- ============================================================================
\echo ''
\echo '=== Tables with High Sequential Scans (Potential Missing Indexes) ==='
SELECT
    schemaname,
    tablename,
    seq_scan AS sequential_scans,
    seq_tup_read AS sequential_tuples_read,
    idx_scan AS index_scans,
    n_live_tup AS live_tuples,
    n_dead_tup AS dead_tuples,
    CASE
        WHEN seq_scan > idx_scan * 10 AND n_live_tup > 1000 THEN 'HIGH_PRIORITY'
        WHEN seq_scan > idx_scan AND n_live_tup > 10000 THEN 'MEDIUM_PRIORITY'
        ELSE 'LOW_PRIORITY'
    END AS priority,
    ROUND((seq_tup_read::numeric / NULLIF(n_live_tup, 0)), 2) AS avg_tuples_per_scan
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND seq_scan > 0
  AND seq_scan > idx_scan
ORDER BY (seq_scan * seq_tup_read) DESC
LIMIT 20;

-- ============================================================================
-- STEP 6: Index Usage Statistics
-- ============================================================================
\echo ''
\echo '=== Index Usage Statistics Summary ==='
SELECT
    COUNT(*) AS total_indexes,
    COUNT(*) FILTER (WHERE idx_scan = 0) AS unused_indexes,
    COUNT(*) FILTER (WHERE idx_scan > 0 AND idx_scan < 10) AS rarely_used_indexes,
    COUNT(*) FILTER (WHERE idx_scan >= 10) AS active_indexes,
    pg_size_pretty(SUM(pg_relation_size(indexrelid))) AS total_index_size,
    pg_size_pretty(SUM(pg_relation_size(indexrelid)) FILTER (WHERE idx_scan = 0)) AS unused_index_size,
    ROUND(AVG(idx_scan)::numeric, 2) AS avg_scans_per_index,
    MAX(idx_scan) AS max_scans
FROM pg_stat_user_indexes
WHERE schemaname = 'public';

-- ============================================================================
-- STEP 7: Index Efficiency (Hit Ratio)
-- ============================================================================
\echo ''
\echo '=== Index Efficiency (Cache Hit Ratio) ==='
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan AS index_scans,
    idx_tup_read AS tuples_read,
    idx_tup_fetch AS tuples_fetched,
    CASE
        WHEN idx_blks_hit + idx_blks_read > 0 THEN
            ROUND((idx_blks_hit::numeric / (idx_blks_hit + idx_blks_read) * 100)::numeric, 2)
        ELSE 100
    END AS cache_hit_ratio_pct,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
LEFT JOIN pg_statio_user_indexes ON pg_stat_user_indexes.indexrelid = pg_statio_user_indexes.indexrelid
WHERE schemaname = 'public'
  AND idx_scan > 0
ORDER BY cache_hit_ratio_pct ASC, idx_scan DESC
LIMIT 20;

-- ============================================================================
-- STEP 8: Index Maintenance Recommendations
-- ============================================================================
\echo ''
\echo '=== Index Maintenance Recommendations ==='
\echo ''
\echo '1. UNUSED INDEXES:'
\echo '   Review indexes with idx_scan = 0. Consider dropping if:'
\echo '   - Index size is significant (> 10MB)'
\echo '   - Table is not frequently updated'
\echo '   - Index is not required for constraints'
\echo ''
\echo '2. RARELY USED INDEXES:'
\echo '   Indexes with < 10 scans may be candidates for removal if:'
\echo '   - They are not critical for query performance'
\echo '   - They consume significant disk space'
\echo ''
\echo '3. INDEX BLOAT:'
\echo '   Large indexes (> 100MB) with low usage should be considered for REINDEX:'
\echo '   REINDEX INDEX CONCURRENTLY index_name;'
\echo ''
\echo '4. DUPLICATE INDEXES:'
\echo '   Review duplicate indexes and keep the most efficient one.'
\echo '   Drop duplicates to save space and improve write performance.'
\echo ''
\echo '5. MISSING INDEXES:'
\echo '   Tables with high sequential scans may benefit from indexes on:'
\echo '   - Foreign key columns'
\echo '   - Frequently filtered columns'
\echo '   - Join columns'
\echo ''
\echo '6. INDEX EFFICIENCY:'
\echo '   Indexes with low cache hit ratio (< 95%) may need:'
\echo '   - Increased shared_buffers'
\echo '   - More frequent VACUUM ANALYZE'
\echo ''

-- ============================================================================
-- STEP 9: Generate DROP Statements for Unused Indexes (Review Before Running)
-- ============================================================================
\echo ''
\echo '=== DROP Statements for Unused Indexes (REVIEW BEFORE RUNNING) ==='
SELECT
    'DROP INDEX IF EXISTS ' || schemaname || '.' || indexname || ';' AS drop_statement,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan = 0
  AND indexname NOT LIKE '%_pkey'
  AND indexname NOT LIKE '%_unique%'
ORDER BY pg_relation_size(indexrelid) DESC;

