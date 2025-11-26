-- ============================================================================
-- Security Hardening Configuration for PostgreSQL
-- ============================================================================
-- This script implements security hardening measures for the LEMNIX database.
--
-- Security Measures:
-- - Connection security (SSL enforcement)
-- - Password policies
-- - Role-based access control
-- - Audit logging
-- - Connection limits
--
-- WARNING: Review and adjust these settings based on your security requirements.
-- ============================================================================

-- ============================================================================
-- STEP 1: Connection Security
-- ============================================================================

-- Force SSL for all connections (already configured in postgresql.conf)
-- Verify SSL is enabled:
-- SELECT name, setting FROM pg_settings WHERE name LIKE 'ssl%';

-- ============================================================================
-- STEP 2: Password Policies
-- ============================================================================

-- Create password policy function
CREATE OR REPLACE FUNCTION check_password_policy(password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Minimum length: 12 characters
    IF length(password) < 12 THEN
        RAISE EXCEPTION 'Password must be at least 12 characters long';
    END IF;
    
    -- Must contain uppercase letter
    IF password !~ '[A-Z]' THEN
        RAISE EXCEPTION 'Password must contain at least one uppercase letter';
    END IF;
    
    -- Must contain lowercase letter
    IF password !~ '[a-z]' THEN
        RAISE EXCEPTION 'Password must contain at least one lowercase letter';
    END IF;
    
    -- Must contain digit
    IF password !~ '[0-9]' THEN
        RAISE EXCEPTION 'Password must contain at least one digit';
    END IF;
    
    -- Must contain special character
    IF password !~ '[!@#$%^&*(),.?":{}|<>]' THEN
        RAISE EXCEPTION 'Password must contain at least one special character';
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Note: PostgreSQL doesn't support password policies directly.
-- Password validation should be implemented at application level.
-- This function is provided for reference and can be used in triggers if needed.

-- ============================================================================
-- STEP 3: Role-Based Access Control
-- ============================================================================

-- Create read-only role
CREATE ROLE lemnix_readonly;
GRANT CONNECT ON DATABASE lemnix_db TO lemnix_readonly;
GRANT USAGE ON SCHEMA public TO lemnix_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO lemnix_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO lemnix_readonly;

-- Create read-write role
CREATE ROLE lemnix_readwrite;
GRANT CONNECT ON DATABASE lemnix_db TO lemnix_readwrite;
GRANT USAGE ON SCHEMA public TO lemnix_readwrite;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO lemnix_readwrite;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO lemnix_readwrite;

-- Grant sequence privileges for read-write role
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO lemnix_readwrite;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO lemnix_readwrite;

-- Create admin role (for maintenance)
CREATE ROLE lemnix_admin;
GRANT lemnix_readwrite TO lemnix_admin;
GRANT CREATE ON SCHEMA public TO lemnix_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO lemnix_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO lemnix_admin;

-- ============================================================================
-- STEP 4: Connection Limits
-- ============================================================================

-- Set connection limits per role (already configured in postgresql.conf)
-- These are set via ALTER ROLE commands or in postgresql.conf:
-- ALTER ROLE lemnix_user CONNECTION LIMIT 50;
-- ALTER ROLE lemnix_readonly CONNECTION LIMIT 20;
-- ALTER ROLE lemnix_readwrite CONNECTION LIMIT 30;
-- ALTER ROLE lemnix_admin CONNECTION LIMIT 10;

-- ============================================================================
-- STEP 5: Audit Logging Views
-- ============================================================================

-- Create view for connection audit
CREATE OR REPLACE VIEW v_connection_audit AS
SELECT
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    state_change,
    backend_start,
    CASE
        WHEN state = 'active' AND now() - query_start > interval '5 minutes' THEN 'LONG_RUNNING'
        WHEN state = 'idle in transaction' THEN 'IDLE_TRANSACTION'
        ELSE state
    END AS status_category
FROM pg_stat_activity
WHERE datname = 'lemnix_db'
  AND pid != pg_backend_pid();

GRANT SELECT ON v_connection_audit TO lemnix_admin;

-- ============================================================================
-- STEP 6: Security Audit Functions
-- ============================================================================

-- Function to check for weak passwords (requires pgcrypto)
CREATE OR REPLACE FUNCTION check_weak_passwords()
RETURNS TABLE(
    username TEXT,
    last_password_change TIMESTAMP,
    days_since_change INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        usename::TEXT,
        valuntil AS last_password_change,
        COALESCE(EXTRACT(DAY FROM now() - valuntil)::INTEGER, 999) AS days_since_change
    FROM pg_shadow
    WHERE valuntil IS NOT NULL
      AND valuntil < now() - interval '90 days'
    ORDER BY valuntil ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION check_weak_passwords() TO lemnix_admin;

-- ============================================================================
-- STEP 7: Row-Level Security (Optional)
-- ============================================================================

-- Enable RLS on sensitive tables (if needed)
-- Example for user_activities:
-- ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY user_activities_policy ON user_activities
--   FOR ALL
--   USING (userId = current_setting('app.current_user_id'));

-- ============================================================================
-- STEP 8: Data Encryption (Application-Level)
-- ============================================================================

-- Note: Column-level encryption is handled at application level.
-- PostgreSQL provides encryption at rest and in transit (SSL/TLS).
-- For sensitive data, use application-level encryption as implemented
-- in ProductionPlanItem encrypted fields.

-- ============================================================================
-- STEP 9: Security Monitoring Views
-- ============================================================================

-- View for security events
CREATE OR REPLACE VIEW v_security_events AS
SELECT
    'connection' AS event_type,
    client_addr::TEXT AS source,
    usename::TEXT AS user_name,
    application_name::TEXT AS application,
    state::TEXT AS state,
    query_start AS event_time
FROM pg_stat_activity
WHERE datname = 'lemnix_db'
  AND pid != pg_backend_pid()
UNION ALL
SELECT
    'audit_log' AS event_type,
    ip_address::TEXT AS source,
    user_id::TEXT AS user_name,
    operation::TEXT AS application,
    table_name::TEXT AS state,
    timestamp AS event_time
FROM audit_logs
WHERE timestamp > now() - interval '24 hours'
ORDER BY event_time DESC;

GRANT SELECT ON v_security_events TO lemnix_admin;

-- ============================================================================
-- STEP 10: Documentation Comments
-- ============================================================================

COMMENT ON FUNCTION check_password_policy(TEXT) IS 
'Validates password against security policy. Minimum 12 characters, must contain uppercase, lowercase, digit, and special character.';

COMMENT ON ROLE lemnix_readonly IS 
'Read-only role for reporting and analytics. Can only SELECT from tables.';

COMMENT ON ROLE lemnix_readwrite IS 
'Read-write role for application operations. Can SELECT, INSERT, UPDATE, DELETE.';

COMMENT ON ROLE lemnix_admin IS 
'Administrative role for database maintenance. Full privileges.';

COMMENT ON VIEW v_connection_audit IS 
'Provides audit information about current database connections.';

COMMENT ON FUNCTION check_weak_passwords() IS 
'Identifies user accounts with passwords older than 90 days.';

COMMENT ON VIEW v_security_events IS 
'Aggregates security-related events including connections and audit logs.';

-- ============================================================================
-- STEP 11: Security Recommendations
-- ============================================================================

-- 1. Regularly review connection audit: SELECT * FROM v_connection_audit;
-- 2. Check for weak passwords: SELECT * FROM check_weak_passwords();
-- 3. Monitor security events: SELECT * FROM v_security_events;
-- 4. Review audit logs regularly: SELECT * FROM audit_logs WHERE timestamp > now() - interval '7 days';
-- 5. Rotate database passwords every 90 days
-- 6. Use SSL/TLS for all connections
-- 7. Limit database access to necessary IP addresses
-- 8. Keep PostgreSQL updated with security patches
-- 9. Implement application-level encryption for sensitive data
-- 10. Regular security audits using security-audit.sql

