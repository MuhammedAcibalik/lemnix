-- Enable required extensions for PostgreSQL 18.0 optimization
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- Fuzzy text search
CREATE EXTENSION IF NOT EXISTS "btree_gin";      -- GIN index for JSONB
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"; -- Query performance monitoring

-- Full-text search configuration for Turkish language support
CREATE TEXT SEARCH CONFIGURATION turkish (COPY = simple);

