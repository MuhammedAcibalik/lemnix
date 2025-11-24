-- ============================================================================
-- Enable Row Level Security (RLS)
-- ============================================================================
-- Run this script to enable RLS on sensitive tables
-- Usage: psql -U lemnix_user -d lemnix_db -f scripts/enable-rls.sql
-- ============================================================================

-- Enable RLS on cutting_lists
ALTER TABLE cutting_lists ENABLE ROW LEVEL SECURITY;

-- Enable RLS on optimizations
ALTER TABLE optimizations ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_activities
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- Enable RLS on audit_logs (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
        ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

\echo '✅ Row Level Security enabled on sensitive tables!'
\echo '⚠️  Make sure to run add_row_level_security.sql migration for policies!'

