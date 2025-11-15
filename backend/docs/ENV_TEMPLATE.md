# Environment Variables Template

Copy this to `.env` file and update values:

```env
# PostgreSQL Connection String (required)
# Supports postgres:// or postgresql:// DSNs
DATABASE_URL="postgresql://lemnix_user:password@localhost:6432/lemnix_db?schema=public&connection_limit=20&pool_timeout=30"

# Direct PostgreSQL (for migrations and admin tasks)
POSTGRES_URL="postgresql://lemnix_user:password@localhost:5432/lemnix_db?schema=public"

# PostgreSQL Password (CHANGE IN PRODUCTION!)
POSTGRES_PASSWORD=change_me_in_production

# PgBouncer Settings
PGBOUNCER_POOL_MODE=transaction
PGBOUNCER_MAX_CLIENT_CONN=1000
PGBOUNCER_DEFAULT_POOL_SIZE=25

# Server Configuration
NODE_ENV=development
PORT=3001

# Frontend Application URL (used for CORS)
FRONTEND_URL=http://localhost:5173

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info

# Query monitoring (requires pg_stat_statements)
ENABLE_QUERY_MONITORING=false
```

## PostgreSQL Setup Instructions

1. Create `.env` file from this template
2. Update `POSTGRES_PASSWORD` with a secure password
3. Start PostgreSQL + PgBouncer: `npm run db:up`
4. Run migrations: `npm run db:migrate:postgres`
5. Verify connection: `npm run db:studio:postgres`

## Query Monitoring

- Set `ENABLE_QUERY_MONITORING=true` only when running against PostgreSQL instances where the `pg_stat_statements` extension is installed.
- Leave the flag at `false` (default) for unsupported databases to bypass the monitoring queries.

