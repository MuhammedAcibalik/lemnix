-- ============================================================================
-- Migration: Optimize Indexes
-- ============================================================================
-- This migration optimizes database indexes by:
-- - Analyzing index usage
-- - Identifying unused indexes (for manual review)
-- - Ensuring optimal index configuration
--
-- Note: This migration does not automatically drop indexes. Review the
-- index analysis output and manually drop unused indexes if appropriate.
-- ============================================================================

-- ============================================================================
-- STEP 1: Ensure pg_stat_statements is enabled for index analysis
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- ============================================================================
-- STEP 2: Create function to analyze index usage
-- ============================================================================
CREATE OR REPLACE FUNCTION analyze_index_usage()
RETURNS TABLE(
    schemaname TEXT,
    tablename TEXT,
    indexname TEXT,
    index_size BIGINT,
    index_scans BIGINT,
    usage_status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        pg_stat_user_indexes.schemaname::TEXT,
        pg_stat_user_indexes.tablename::TEXT,
        pg_stat_user_indexes.indexname::TEXT,
        pg_relation_size(pg_stat_user_indexes.indexrelid) AS index_size,
        pg_stat_user_indexes.idx_scan AS index_scans,
        CASE
            WHEN pg_stat_user_indexes.idx_scan = 0 THEN 'UNUSED'
            WHEN pg_stat_user_indexes.idx_scan < 10 THEN 'RARELY_USED'
            ELSE 'ACTIVE'
        END::TEXT AS usage_status
    FROM pg_stat_user_indexes
    WHERE pg_stat_user_indexes.schemaname = 'public'
    ORDER BY pg_relation_size(pg_stat_user_indexes.indexrelid) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 3: Create view for index statistics
-- ============================================================================
CREATE OR REPLACE VIEW v_index_statistics AS
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

GRANT SELECT ON v_index_statistics TO lemnix_user;

-- ============================================================================
-- STEP 4: Create function to get index recommendations
-- ============================================================================
CREATE OR REPLACE FUNCTION get_index_recommendations()
RETURNS TABLE(
    recommendation_type TEXT,
    table_name TEXT,
    column_name TEXT,
    reason TEXT,
    priority TEXT
) AS $$
BEGIN
    RETURN QUERY
    -- Tables with high sequential scans (potential missing indexes)
    SELECT
        'MISSING_INDEX'::TEXT AS recommendation_type,
        pg_stat_user_tables.schemaname || '.' || pg_stat_user_tables.tablename AS table_name,
        NULL::TEXT AS column_name,
        'High sequential scans (' || pg_stat_user_tables.seq_scan || ') vs index scans (' || pg_stat_user_tables.idx_scan || ')' AS reason,
        CASE
            WHEN pg_stat_user_tables.seq_scan > pg_stat_user_tables.idx_scan * 10 
                 AND pg_stat_user_tables.n_live_tup > 1000 THEN 'HIGH'::TEXT
            WHEN pg_stat_user_tables.seq_scan > pg_stat_user_tables.idx_scan 
                 AND pg_stat_user_tables.n_live_tup > 10000 THEN 'MEDIUM'::TEXT
            ELSE 'LOW'::TEXT
        END AS priority
    FROM pg_stat_user_tables
    WHERE pg_stat_user_tables.schemaname = 'public'
      AND pg_stat_user_tables.seq_scan > 0
      AND pg_stat_user_tables.seq_scan > pg_stat_user_tables.idx_scan
    ORDER BY (pg_stat_user_tables.seq_scan * pg_stat_user_tables.seq_tup_read) DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION analyze_index_usage() TO lemnix_user;
GRANT EXECUTE ON FUNCTION get_index_recommendations() TO lemnix_user;

-- ============================================================================
-- STEP 5: Add comments for documentation
-- ============================================================================
COMMENT ON FUNCTION analyze_index_usage() IS 
'Analyzes index usage and returns statistics for all indexes in the public schema.';

COMMENT ON VIEW v_index_statistics IS 
'Provides summary statistics about index usage in the database.';

COMMENT ON FUNCTION get_index_recommendations() IS 
'Returns recommendations for missing indexes based on sequential scan patterns.';

-- ============================================================================
-- STEP 6: Note for manual review
-- ============================================================================
-- After running this migration, review index usage with:
--   SELECT * FROM analyze_index_usage();
--   SELECT * FROM v_index_statistics;
--   SELECT * FROM get_index_recommendations();
--
-- For unused indexes, consider dropping them manually after verification:
--   DROP INDEX IF EXISTS schema.index_name;
-- ============================================================================

