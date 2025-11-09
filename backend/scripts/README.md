# Backend Scripts

This directory contains maintenance and utility scripts for the backend.

## Database Scripts

### PostgreSQL Migration

#### `migrate-to-postgres.ts`
Migrates data from SQLite to PostgreSQL.

**Usage:**
```bash
npm run migrate:sqlite-to-postgres
```

**Prerequisites:**
- PostgreSQL instance running (via docker-compose or external)
- `POSTGRES_URL` environment variable set
- Prisma migrations applied to PostgreSQL

---

#### `docker-migrate.sh`
Helper script for Docker-based migration.

**Usage:**
```bash
chmod +x scripts/docker-migrate.sh
./scripts/docker-migrate.sh
```

---

### PostgreSQL Maintenance

#### `maintenance-tasks.ts`
Performs routine database maintenance tasks.

**Available commands:**
```bash
# Weekly maintenance (VACUUM, ANALYZE)
npm run db:maintenance:weekly

# Monthly maintenance (full optimization)
npm run db:maintenance:monthly

# Manual VACUUM
npm run db:maintenance:vacuum

# Get database metrics
npm run db:maintenance:metrics
```

---

#### `optimize-postgres.sql`
SQL script for PostgreSQL performance optimization.

**Usage:**
```bash
npm run db:optimize
# or
psql -U lemnix_user -d lemnix_db -f scripts/optimize-postgres.sql
```

**What it does:**
- Creates performance indexes
- Enables query optimization extensions
- Configures autovacuum settings

---

#### `setup-postgres.sql`
Initial PostgreSQL database setup script.

**Usage:**
```bash
psql -U postgres -f scripts/setup-postgres.sql
```

---

### Backup Scripts

#### `backup-scheduler.ts`
Automated database backup system.

**Available commands:**
```bash
# Run a full backup
npm run db:backup:full

# Test backup configuration
npm run db:backup:test

# Schedule automated backups
npm run db:backup:schedule
```

**Features:**
- Automated daily backups
- Backup rotation (keeps last 30 days)
- Compressed backups (.tar.gz)
- Email notifications (if configured)

---

#### `backup-postgres.ps1`
PowerShell backup script for Windows environments.

**Usage (Windows):**
```powershell
npm run db:backup
```

---

## Related Documentation

- [PostgreSQL Migration Guide](../docs/POSTGRESQL_MIGRATION_GUIDE.md)
- [Backend Documentation](../docs/README.md)
- [Main README](../../README.md)

---

## Notes

- All scripts require proper environment variables configured in `.env`
- PostgreSQL scripts are optional - the application uses SQLite by default
- Backup scripts should be scheduled via cron/Task Scheduler for production use
