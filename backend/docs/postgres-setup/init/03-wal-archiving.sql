-- ============================================================================
-- WAL Archiving Configuration for PostgreSQL
-- ============================================================================
-- This script configures Write-Ahead Log (WAL) archiving for Point-in-Time
-- Recovery (PITR) capabilities. WAL archiving allows PostgreSQL to maintain
-- a continuous backup of all database changes.
--
-- Requirements:
-- - WAL archive directory must be mounted as volume
-- - Archive command must have write permissions
-- - Sufficient disk space for WAL segments
--
-- Recovery Objectives:
-- - RPO (Recovery Point Objective): < 1 hour
-- - RTO (Recovery Time Objective): < 4 hours
-- ============================================================================

-- ============================================================================
-- STEP 1: Create WAL Archive Directory Structure
-- ============================================================================
-- Note: Directory creation is handled by Docker volume mount
-- This is a placeholder for documentation purposes

-- ============================================================================
-- STEP 2: Configure WAL Archiving Parameters
-- ============================================================================
-- These parameters are set via PostgreSQL command-line arguments in
-- docker-compose.prod.yml. They are documented here for reference:
--
-- wal_level = replica (minimum for archiving)
-- archive_mode = on
-- archive_command = 'test ! -f /var/lib/postgresql/wal_archive/%f && cp %p /var/lib/postgresql/wal_archive/%f'
-- archive_timeout = 300 (5 minutes - force WAL switch if no activity)
-- max_wal_senders = 3 (for streaming replication if needed)
-- wal_keep_size = 1GB (keep WAL segments for replication)

-- ============================================================================
-- STEP 3: Verify WAL Archiving Status
-- ============================================================================
-- Run this query to check if WAL archiving is enabled:
-- SELECT name, setting, unit, context FROM pg_settings 
-- WHERE name IN ('wal_level', 'archive_mode', 'archive_command', 'archive_timeout');

-- ============================================================================
-- STEP 4: Monitor WAL Archiving
-- ============================================================================
-- Check archived WAL segments:
-- SELECT * FROM pg_stat_archiver;

-- Check current WAL position:
-- SELECT pg_current_wal_lsn();

-- List WAL files in archive:
-- SELECT * FROM pg_ls_waldir();

-- ============================================================================
-- STEP 5: Archive Cleanup Function
-- ============================================================================
-- This function is called by backup-wal.sh to clean old archives
-- Retention policy: Keep archives for 30 days (configurable)

CREATE OR REPLACE FUNCTION cleanup_old_wal_archives(retention_days INTEGER DEFAULT 30)
RETURNS TABLE(
    deleted_files INTEGER,
    freed_space BIGINT
) AS $$
DECLARE
    archive_path TEXT := '/var/lib/postgresql/wal_archive';
    cutoff_date TIMESTAMP;
    file_record RECORD;
    deleted_count INTEGER := 0;
    freed_bytes BIGINT := 0;
BEGIN
    -- Calculate cutoff date
    cutoff_date := NOW() - (retention_days || ' days')::INTERVAL;
    
    -- Note: This function provides the logic, but actual file deletion
    -- should be performed by the backup-wal.sh script due to PostgreSQL
    -- security restrictions on file system access.
    
    -- Return placeholder values
    -- Actual cleanup is done by external script
    RETURN QUERY SELECT 0::INTEGER, 0::BIGINT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to database user
GRANT EXECUTE ON FUNCTION cleanup_old_wal_archives(INTEGER) TO lemnix_user;

-- ============================================================================
-- STEP 6: Archive Verification Function
-- ============================================================================
-- Function to verify WAL archive integrity

CREATE OR REPLACE FUNCTION verify_wal_archive()
RETURNS TABLE(
    archive_mode TEXT,
    archive_command TEXT,
    last_archived_wal TEXT,
    last_archived_time TIMESTAMP,
    failed_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s1.setting::TEXT AS archive_mode,
        s2.setting::TEXT AS archive_command,
        sa.last_archived_wal::TEXT,
        sa.last_archived_time,
        sa.failed_count
    FROM pg_settings s1
    CROSS JOIN pg_settings s2
    CROSS JOIN pg_stat_archiver sa
    WHERE s1.name = 'archive_mode'
      AND s2.name = 'archive_command';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION verify_wal_archive() TO lemnix_user;

-- ============================================================================
-- STEP 7: WAL Archive Statistics View
-- ============================================================================
-- Create a view for easy monitoring of WAL archiving status

CREATE OR REPLACE VIEW v_wal_archive_status AS
SELECT 
    (SELECT setting FROM pg_settings WHERE name = 'archive_mode') AS archive_mode,
    (SELECT setting FROM pg_settings WHERE name = 'archive_command') AS archive_command,
    (SELECT setting FROM pg_settings WHERE name = 'archive_timeout') AS archive_timeout_seconds,
    (SELECT setting FROM pg_settings WHERE name = 'wal_level') AS wal_level,
    sa.archived_count,
    sa.last_archived_wal,
    sa.last_archived_time,
    sa.failed_count,
    sa.last_failed_wal,
    sa.last_failed_time,
    sa.stats_reset,
    CASE 
        WHEN sa.failed_count > 0 THEN 'WARNING'
        WHEN sa.last_archived_time IS NULL THEN 'UNKNOWN'
        WHEN NOW() - sa.last_archived_time > INTERVAL '1 hour' THEN 'STALE'
        ELSE 'OK'
    END AS status
FROM pg_stat_archiver sa;

GRANT SELECT ON v_wal_archive_status TO lemnix_user;

-- ============================================================================
-- STEP 8: Documentation Comments
-- ============================================================================
COMMENT ON FUNCTION cleanup_old_wal_archives(INTEGER) IS 
'Placeholder function for WAL archive cleanup. Actual cleanup is performed by backup-wal.sh script.';

COMMENT ON FUNCTION verify_wal_archive() IS 
'Verifies WAL archiving configuration and returns current status.';

COMMENT ON VIEW v_wal_archive_status IS 
'Provides a comprehensive view of WAL archiving status including mode, command, statistics, and health status.';

