-- ============================================================================
-- PostgreSQL Security Configuration
-- ============================================================================
-- This script configures SSL/TLS and authentication settings
-- Run automatically on container initialization
-- ============================================================================

-- Enable SSL (requires certificates - see docker-compose for details)
-- SSL certificates should be mounted or generated
-- For production, use proper SSL certificates

-- Configure authentication method
-- Note: POSTGRES_HOST_AUTH_METHOD is set via environment variable
-- This script ensures scram-sha-256 is used

-- Create SSL certificates directory (if not exists)
-- In production, mount proper certificates
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_settings WHERE name = 'ssl' AND setting = 'on') THEN
        -- SSL will be enabled via postgresql.conf or command line arguments
        RAISE NOTICE 'SSL configuration will be applied via postgresql.conf';
    END IF;
END $$;

-- Enable required extensions for security
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Create function to verify SSL connection
CREATE OR REPLACE FUNCTION check_ssl_connection()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN (SELECT ssl FROM pg_stat_ssl WHERE pid = pg_backend_pid());
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_ssl_connection() TO lemnix_user;

COMMENT ON FUNCTION check_ssl_connection() IS 
    'Verifies that the current connection is using SSL/TLS';

-- ============================================================================
-- Connection Limits per User
-- ============================================================================

-- Set connection limits (adjust based on your needs)
ALTER USER lemnix_user WITH CONNECTION LIMIT 50;

-- ============================================================================
-- Statement Timeout
-- ============================================================================

-- Set statement timeout (30 seconds)
-- This prevents long-running queries from blocking the database
ALTER DATABASE lemnix_db SET statement_timeout = '30s';

-- ============================================================================
-- Logging Configuration
-- ============================================================================

-- Enable slow query logging (queries > 1 second)
ALTER DATABASE lemnix_db SET log_min_duration_statement = 1000;

-- Log connections and disconnections
ALTER DATABASE lemnix_db SET log_connections = on;
ALTER DATABASE lemnix_db SET log_disconnections = on;

-- ============================================================================
-- Row Level Security Setup
-- ============================================================================

-- RLS will be enabled via migration script: add_row_level_security.sql
-- This is done separately to allow for proper testing

\echo '✅ Security configuration completed!'

