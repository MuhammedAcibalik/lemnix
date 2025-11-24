#!/bin/sh
# ============================================================================
# Docker Entrypoint Script
# ============================================================================
# Reads Docker secrets and sets environment variables
# ============================================================================

set -e

echo "🚀 Starting LEMNIX Backend..."

# Read Docker secrets and set environment variables
if [ -f /run/secrets/postgres_password ]; then
  export POSTGRES_PASSWORD=$(cat /run/secrets/postgres_password)
  # Update DATABASE_URL with password from secret
  export DATABASE_URL=$(echo "$DATABASE_URL" | sed "s/:${POSTGRES_PASSWORD}@/:$(cat /run/secrets/postgres_password)@/")
fi

if [ -f /run/secrets/jwt_secret ]; then
  export JWT_SECRET=$(cat /run/secrets/jwt_secret)
fi

if [ -f /run/secrets/encryption_master_key ]; then
  export ENCRYPTION_MASTER_KEY=$(cat /run/secrets/encryption_master_key)
fi

if [ -f /run/secrets/redis_password ]; then
  export REDIS_PASSWORD=$(cat /run/secrets/redis_password)
  # Update REDIS_URL with password from secret
  export REDIS_URL="redis://:$(cat /run/secrets/redis_password)@redis:6379"
fi

# Execute the main command
exec "$@"

