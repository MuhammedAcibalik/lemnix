# Prisma Migrations Guide

## Initial Setup

### 1. Generate Prisma Client

```bash
npm run db:generate
```

### 2. Create Initial Migration (Development)

```bash
npx prisma migrate dev --name init
```

This will:
- Create `migrations/` folder
- Generate SQL migration files
- Apply migration to dev database
- Regenerate Prisma Client

### 3. Apply Migrations (Production)

```bash
npx prisma migrate deploy
```

**Never use `migrate dev` in production!**

---

## Migration Workflow

### Creating a New Migration

1. Edit `prisma/schema.prisma`
2. Run:
```bash
npx prisma migrate dev --name your_migration_name
```

### Checking Migration Status

```bash
npx prisma migrate status
```

### Resetting Database (Development Only)

```bash
npx prisma migrate reset
```

⚠️ **WARNING:** This will delete all data!

---

## Production Deployment Checklist

- [ ] All migrations tested in staging
- [ ] Backup database before deployment
- [ ] Run `npx prisma migrate deploy`
- [ ] Verify data integrity
- [ ] Monitor for errors

---

## Troubleshooting

### Migration Failed

```bash
# Check status
npx prisma migrate status

# Resolve conflicts
npx prisma migrate resolve --rolled-back MIGRATION_NAME

# Or mark as applied
npx prisma migrate resolve --applied MIGRATION_NAME
```

### Database Out of Sync

```bash
# Check schema drift
npx prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datasource prisma/schema.prisma
```

---

## CI/CD Integration

GitHub Actions already checks migrations:

```yaml
- name: Check migrations
  run: npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma
```

---

## Database Seeding

Create `prisma/seed.ts` for initial data:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed data here
  await prisma.stockLength.createMany({
    data: [
      { length: 6000, isActive: true },
      { length: 6200, isActive: true },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Add to `package.json`:

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

Run seed:

```bash
npx prisma db seed
```

