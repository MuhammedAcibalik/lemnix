# 🔐 SECURITY CONFIGURATION GUIDE

## Environment Variables Required

Add these variables to your `.env` file:

```bash
# ============================================================================
# ENCRYPTION CONFIGURATION
# ============================================================================

# Master encryption key (REQUIRED - Generate with: openssl rand -base64 32)
# ⚠️ Development mode falls back to `.env.local` or hashes `ENCRYPTION_MASTER_KEY_SAMPLE`
# from `backend/.env.example`. Always set a reusable key in `.env.local` to avoid
# rotating the derived fallback unexpectedly.
ENCRYPTION_MASTER_KEY=your-32-character-encryption-key-here

# ============================================================================
# AUDIT LOGGING CONFIGURATION
# ============================================================================

# Enable/disable audit logging
AUDIT_ENABLED=true
AUDIT_LOG_READS=false
AUDIT_LOG_WRITES=true
AUDIT_LOG_AUTH=true
AUDIT_LOG_SYSTEM=true
AUDIT_RETENTION_DAYS=365
AUDIT_MAX_LOG_SIZE=10000

# ============================================================================
# JWT CONFIGURATION (ENHANCED)
# ============================================================================

# JWT secret key (REQUIRED - Generate with: openssl rand -base64 64)
JWT_SECRET=your-64-character-jwt-secret-key-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ============================================================================
# DATABASE SECURITY
# ============================================================================

# Database connection string with SSL
DATABASE_URL=postgresql://user:password@localhost:5432/lemnix?sslmode=require

# ============================================================================
# RATE LIMITING
# ============================================================================

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ============================================================================
# CORS CONFIGURATION
# ============================================================================

CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# ============================================================================
# SECURITY HEADERS
# ============================================================================

SECURITY_HEADERS_ENABLED=true
CSP_POLICY=default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'

# ============================================================================
# LOGGING CONFIGURATION
# ============================================================================

LOG_LEVEL=info
REQUEST_LOGGING_ENABLED=true
RESPONSE_LOGGING_ENABLED=false

# ============================================================================
# MONITORING AND ALERTING
# ============================================================================

SECURITY_MONITORING_ENABLED=true
ALERT_FAILED_LOGINS=true
ALERT_SUSPICIOUS_ACTIVITIES=true

# ============================================================================
# BACKUP CONFIGURATION
# ============================================================================

ENCRYPTED_BACKUPS=true
BACKUP_ENCRYPTION_KEY=your-backup-encryption-key-here

# ============================================================================
# DEVELOPMENT OVERRIDES
# ============================================================================

NODE_ENV=development
ALLOW_MOCK_AUTH=true
MOCK_TOKEN=mock-dev-token-lemnix-2025
```

## Key Generation Commands

```bash
# Generate encryption master key
openssl rand -base64 32

# Generate JWT secret
openssl rand -base64 64

# Generate backup encryption key
openssl rand -base64 32
```

## Development Encryption Key Fallback

- Create a `.env.local` file with a persistent `ENCRYPTION_MASTER_KEY` for all local
  developers.
- When the variable is missing, the backend hashes `ENCRYPTION_MASTER_KEY_SAMPLE`
  from `backend/.env.example` and persists the derived value to
  `backend/.dev-encryption-key` to avoid random key rotation between restarts.
- Update the sample value only when you intend to rotate the shared fallback key.

## Security Checklist

- [ ] Set strong encryption master key
- [ ] Set strong JWT secret
- [ ] Enable SSL for database connection
- [ ] Configure CORS properly
- [ ] Enable security headers
- [ ] Set up monitoring and alerting
- [ ] Configure encrypted backups
- [ ] Disable mock authentication in production
- [ ] Set appropriate log levels
- [ ] Configure rate limiting
