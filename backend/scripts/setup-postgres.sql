-- Setup script for native PostgreSQL
-- Run with: psql -U postgres -f setup-postgres.sql

-- Create database
CREATE DATABASE lemnix_db;

-- Create user
CREATE USER lemnix_user WITH PASSWORD 'LemnixSecure2024' SUPERUSER CREATEDB;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE lemnix_db TO lemnix_user;
ALTER DATABASE lemnix_db OWNER TO lemnix_user;

-- Connect to lemnix_db
\c lemnix_db

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO lemnix_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO lemnix_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO lemnix_user;

-- Install extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Verify
\du lemnix_user
\l lemnix_db
\dx

