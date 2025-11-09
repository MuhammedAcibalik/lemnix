-- Initial setup for lemnix_user
-- This runs during PostgreSQL initialization

-- Set password for lemnix_user (created by POSTGRES_USER env var)
-- Using SCRAM-SHA-256 for PostgreSQL 18.0 security
ALTER USER lemnix_user WITH PASSWORD 'LemnixSecure2024';

-- Ensure lemnix_user has proper permissions
GRANT ALL PRIVILEGES ON DATABASE lemnix_db TO lemnix_user;
GRANT ALL ON SCHEMA public TO lemnix_user;
ALTER DATABASE lemnix_db OWNER TO lemnix_user;

-- Grant schema privileges
GRANT ALL ON ALL TABLES IN SCHEMA public TO lemnix_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO lemnix_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO lemnix_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO lemnix_user;

