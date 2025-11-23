# Backend Documentation

This directory contains backend-specific documentation and setup guides.

## Contents

### Configuration Guides
- **[ENV_TEMPLATE.md](./ENV_TEMPLATE.md)** - Environment variables template and configuration guide
- **[SECURITY_CONFIG.md](./SECURITY_CONFIG.md)** - Security configuration and best practices

### Feature Documentation
- **[SMART_SUGGESTIONS_MIGRATION.md](./SMART_SUGGESTIONS_MIGRATION.md)** - Smart suggestions feature migration guide
- **[SMART_SUGGESTIONS_RATIO_FEATURE.md](./SMART_SUGGESTIONS_RATIO_FEATURE.md)** - Smart suggestions ratio feature documentation

### Database Setup
- **[POSTGRESQL_MIGRATION_GUIDE.md](./POSTGRESQL_MIGRATION_GUIDE.md)** - Complete guide for migrating from SQLite to PostgreSQL
- **[postgres-setup/](./postgres-setup/)** - PostgreSQL initialization scripts and Docker setup

## Quick Start

For general backend setup and running the application, see the [main README](../../README.md).

### Using SQLite (Default)
The backend uses SQLite by default. No additional setup required.

### Using PostgreSQL (Optional)
For PostgreSQL setup, refer to [POSTGRESQL_MIGRATION_GUIDE.md](./POSTGRESQL_MIGRATION_GUIDE.md).

### Session Store Requirements
- **Production**: Provision a Redis instance and configure `SESSION_STORE_DRIVER=redis` with the corresponding `REDIS_URL`. Redis must be reachable by all API instances to ensure session sharing across nodes and restarts.
- **Local development & tests**: The backend defaults to the in-memory session store. To exercise Redis locally, start the bundled service via `docker compose up redis` and set `SESSION_STORE_DRIVER=redis` in your `.env` file.

## Related Documentation

For general project documentation, see [docs/README.md](../../docs/README.md) in the repository root.
