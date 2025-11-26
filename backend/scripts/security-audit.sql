-- ============================================================================
-- Security Audit Script
-- ============================================================================
-- This script performs a comprehensive security audit of the PostgreSQL database.
-- Run this regularly to identify potential security issues.
--
-- Usage:
--   psql -h localhost -U lemnix_user -d lemnix_db -f scripts/security-audit.sql
-- ============================================================================

-- ============================================================================
-- STEP 1: Connection Security Audit
-- ============================================================================
\echo '=== Connection Security Audit ==='

-- Check SSL configuration
SELECT
    name,
    setting,
    CASE
        WHEN name = 'ssl' AND setting = 'on' THEN 'OK'
        WHEN name = 'ssl' AND setting = 'off' THEN 'WARNING: SSL disabled'
        ELSE 'INFO'
    END AS status
FROM pg_settings
WHERE name LIKE 'ssl%'
ORDER BY name;

-- Check current connections (SSL status)
SELECT
    pid,
    usename,
    application_name,
    client_addr,
    CASE
        WHEN ssl IS TRUE THEN 'SSL'
        ELSE 'NO SSL'
    END AS ssl_status
FROM pg_stat_ssl
JOIN pg_stat_activity ON pg_stat_ssl.pid = pg_stat_activity.pid
WHERE pg_stat_activity.datname = 'lemnix_db';

-- ============================================================================
-- STEP 2: User and Role Audit
-- ============================================================================
\echo ''
\echo '=== User and Role Audit ==='

-- List all users and roles
SELECT
    rolname AS role_name,
    rolsuper AS is_superuser,
    rolcreaterole AS can_create_roles,
    rolcreatedb AS can_create_databases,
    rolcanlogin AS can_login,
    CASE
        WHEN rolsuper THEN 'WARNING: Superuser'
        WHEN rolcreaterole THEN 'WARNING: Can create roles'
        WHEN rolcreatedb THEN 'WARNING: Can create databases'
        ELSE 'OK'
    END AS security_status
FROM pg_roles
WHERE rolname NOT LIKE 'pg_%'
ORDER BY rolsuper DESC, rolname;

-- Check for default passwords
SELECT
    usename,
    CASE
        WHEN passwd = 'md5' || md5('' || usename) THEN 'WARNING: Default password'
        ELSE 'OK'
    END AS password_status
FROM pg_shadow
WHERE usename NOT LIKE 'pg_%';

-- ============================================================================
-- STEP 3: Connection Limits Audit
-- ============================================================================
\echo ''
\echo '=== Connection Limits Audit ==='

-- Check connection limits per role
SELECT
    rolname,
    rolconnlimit AS connection_limit,
    CASE
        WHEN rolconnlimit = -1 THEN 'WARNING: No limit'
        WHEN rolconnlimit > 100 THEN 'WARNING: High limit'
        ELSE 'OK'
    END AS status
FROM pg_roles
WHERE rolcanlogin = TRUE
ORDER BY rolconnlimit DESC;

-- Current connection count
SELECT
    usename,
    count(*) AS current_connections,
    CASE
        WHEN count(*) > 50 THEN 'WARNING: High connection count'
        ELSE 'OK'
    END AS status
FROM pg_stat_activity
WHERE datname = 'lemnix_db'
GROUP BY usename
ORDER BY count(*) DESC;

-- ============================================================================
-- STEP 4: Privilege Audit
-- ============================================================================
\echo ''
\echo '=== Privilege Audit ==='

-- Check table privileges
SELECT
    grantee,
    table_schema,
    table_name,
    string_agg(privilege_type, ', ' ORDER BY privilege_type) AS privileges,
    CASE
        WHEN string_agg(privilege_type, ', ') LIKE '%ALL%' THEN 'WARNING: Full privileges'
        ELSE 'OK'
    END AS status
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND grantee NOT LIKE 'pg_%'
GROUP BY grantee, table_schema, table_name
ORDER BY grantee, table_name;

-- ============================================================================
-- STEP 5: Audit Logging Status
-- ============================================================================
\echo ''
\echo '=== Audit Logging Status ==='

-- Check audit log table
SELECT
    COUNT(*) AS total_audit_entries,
    COUNT(DISTINCT user_id) AS unique_users,
    COUNT(DISTINCT table_name) AS tables_audited,
    MIN(timestamp) AS oldest_entry,
    MAX(timestamp) AS newest_entry
FROM audit_logs;

-- Recent audit log entries by operation
SELECT
    operation,
    COUNT(*) AS count,
    MAX(timestamp) AS last_occurrence
FROM audit_logs
WHERE timestamp > now() - interval '7 days'
GROUP BY operation
ORDER BY count DESC;

-- ============================================================================
-- STEP 6: Security Configuration Audit
-- ============================================================================
\echo ''
\echo '=== Security Configuration Audit ==='

-- Check important security settings
SELECT
    name,
    setting,
    CASE
        WHEN name = 'password_encryption' AND setting != 'scram-sha-256' THEN 'WARNING: Not using SCRAM-SHA-256'
        WHEN name = 'log_connections' AND setting != 'on' THEN 'WARNING: Connection logging disabled'
        WHEN name = 'log_disconnections' AND setting != 'on' THEN 'WARNING: Disconnection logging disabled'
        WHEN name = 'log_statement' AND setting = 'none' THEN 'WARNING: Statement logging disabled'
        ELSE 'OK'
    END AS status
FROM pg_settings
WHERE name IN (
    'password_encryption',
    'log_connections',
    'log_disconnections',
    'log_statement',
    'log_min_duration_statement'
)
ORDER BY name;

-- ============================================================================
-- STEP 7: Long-Running Connections
-- ============================================================================
\echo ''
\echo '=== Long-Running Connections Audit ==='

-- Identify long-running connections
SELECT
    pid,
    usename,
    application_name,
    client_addr,
    state,
    now() - query_start AS query_duration,
    now() - backend_start AS connection_duration,
    CASE
        WHEN now() - query_start > interval '1 hour' THEN 'WARNING: Long-running query'
        WHEN now() - backend_start > interval '24 hours' THEN 'WARNING: Long-lived connection'
        ELSE 'OK'
    END AS status
FROM pg_stat_activity
WHERE datname = 'lemnix_db'
  AND pid != pg_backend_pid()
ORDER BY query_duration DESC NULLS LAST;

-- ============================================================================
-- STEP 8: Idle Transactions
-- ============================================================================
\echo ''
\echo '=== Idle Transactions Audit ==='

-- Identify idle transactions
SELECT
    pid,
    usename,
    application_name,
    state,
    now() - state_change AS idle_duration,
    CASE
        WHEN now() - state_change > interval '5 minutes' THEN 'WARNING: Long idle transaction'
        ELSE 'OK'
    END AS status
FROM pg_stat_activity
WHERE datname = 'lemnix_db'
  AND state = 'idle in transaction'
  AND pid != pg_backend_pid()
ORDER BY state_change ASC;

-- ============================================================================
-- STEP 9: Security Recommendations
-- ============================================================================
\echo ''
\echo '=== Security Recommendations ==='
\echo ''
\echo '1. SSL/TLS: Ensure all connections use SSL'
\echo '2. Password Policy: Implement strong password requirements'
\echo '3. Connection Limits: Set appropriate limits per role'
\echo '4. Privilege Review: Regularly review and audit privileges'
\echo '5. Audit Logging: Monitor audit logs for suspicious activity'
\echo '6. Long Connections: Review and terminate long-running connections'
\echo '7. Idle Transactions: Monitor and prevent long idle transactions'
\echo '8. Updates: Keep PostgreSQL updated with security patches'
\echo '9. Access Control: Limit database access to necessary IP addresses'
\echo '10. Encryption: Use application-level encryption for sensitive data'
\echo ''

