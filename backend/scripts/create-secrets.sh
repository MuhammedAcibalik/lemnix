#!/bin/sh
# ============================================================================
# Docker Secrets Creation Script
# ============================================================================
# Creates Docker secrets for production deployment
# Usage: ./scripts/create-secrets.sh

set -e

echo "🔐 Creating Docker secrets..."

# Check if running in Docker Swarm mode
if ! docker info | grep -q "Swarm: active"; then
    echo "⚠️  Docker Swarm is not active. Initializing swarm..."
    docker swarm init 2>/dev/null || echo "Swarm already initialized or error occurred"
fi

# Generate secrets if they don't exist
create_secret() {
    local secret_name=$1
    local secret_file=$2
    
    if docker secret ls | grep -q "$secret_name"; then
        echo "✅ Secret '$secret_name' already exists, skipping..."
    else
        if [ -f "$secret_file" ]; then
            echo "📝 Creating secret '$secret_name' from file '$secret_file'..."
            docker secret create "$secret_name" "$secret_file"
        else
            echo "⚠️  File '$secret_file' not found. Creating from stdin..."
            echo "Please enter the value for $secret_name (will be hidden):"
            stty -echo
            read -r secret_value
            stty echo
            echo "$secret_value" | docker secret create "$secret_name" -
            echo ""
        fi
    fi
}

# Create secrets directory if it doesn't exist
mkdir -p secrets

# Generate POSTGRES_PASSWORD if not exists
if [ ! -f "secrets/postgres_password.txt" ]; then
    echo "🔑 Generating POSTGRES_PASSWORD..."
    openssl rand -base64 32 > secrets/postgres_password.txt
    chmod 600 secrets/postgres_password.txt
fi

# Generate JWT_SECRET if not exists
if [ ! -f "secrets/jwt_secret.txt" ]; then
    echo "🔑 Generating JWT_SECRET..."
    openssl rand -base64 64 > secrets/jwt_secret.txt
    chmod 600 secrets/jwt_secret.txt
fi

# Generate ENCRYPTION_MASTER_KEY if not exists
if [ ! -f "secrets/encryption_master_key.txt" ]; then
    echo "🔑 Generating ENCRYPTION_MASTER_KEY..."
    openssl rand -base64 32 > secrets/encryption_master_key.txt
    chmod 600 secrets/encryption_master_key.txt
fi

# Generate REDIS_PASSWORD if not exists
if [ ! -f "secrets/redis_password.txt" ]; then
    echo "🔑 Generating REDIS_PASSWORD..."
    openssl rand -base64 32 > secrets/redis_password.txt
    chmod 600 secrets/redis_password.txt
fi

# Generate GRAFANA_ADMIN_PASSWORD if not exists
if [ ! -f "secrets/grafana_admin_password.txt" ]; then
    echo "🔑 Generating GRAFANA_ADMIN_PASSWORD..."
    openssl rand -base64 32 > secrets/grafana_admin_password.txt
    chmod 600 secrets/grafana_admin_password.txt
fi

# Create Docker secrets
create_secret "postgres_password" "secrets/postgres_password.txt"
create_secret "jwt_secret" "secrets/jwt_secret.txt"
create_secret "encryption_master_key" "secrets/encryption_master_key.txt"
create_secret "redis_password" "secrets/redis_password.txt"
create_secret "grafana_admin_password" "secrets/grafana_admin_password.txt"

echo ""
echo "✅ All secrets created successfully!"
echo ""
echo "📋 List of secrets:"
docker secret ls | grep -E "postgres_password|jwt_secret|encryption_master_key|redis_password|grafana_admin_password" || echo "No secrets found"

echo ""
echo "⚠️  IMPORTANT: Keep the secrets/ directory secure and never commit it to git!"
echo "   Add 'secrets/' to .gitignore if not already present."

