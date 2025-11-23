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

# Session Store (Redis is required in production)
SESSION_STORE_DRIVER=memory
# REDIS_URL is required when SESSION_STORE_DRIVER=redis
REDIS_URL=redis://localhost:6379/0
```

## PostgreSQL Setup Instructions

1. Create `.env` file from this template
2. Update `POSTGRES_PASSWORD` with a secure password
3. Start PostgreSQL + PgBouncer: `npm run db:up`
4. Run migrations: `npm run db:migrate:postgres`
5. Verify connection: `npm run db:studio:postgres`

