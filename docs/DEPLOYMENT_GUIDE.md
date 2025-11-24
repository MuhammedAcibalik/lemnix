# 🚀 Deployment Guide

Bu dokümantasyon, LEMNIX uygulamasının production ortamına deployment sürecini detaylı olarak açıklar.

## 📋 İçindekiler

1. [Ön Gereksinimler](#ön-gereksinimler)
2. [Docker Secrets Yapılandırması](#docker-secrets-yapılandırması)
3. [Environment Variables](#environment-variables)
4. [Docker Compose ile Deployment](#docker-compose-ile-deployment)
5. [Health Checks](#health-checks)
6. [Monitoring ve Logging](#monitoring-ve-logging)
7. [Backup Stratejisi](#backup-stratejisi)
8. [Troubleshooting](#troubleshooting)

---

## Ön Gereksinimler

### Sistem Gereksinimleri

- **Docker**: 24.0+ ve Docker Compose 2.0+
- **Docker Swarm**: Production deployment için (opsiyonel)
- **Disk Space**: Minimum 20GB (database ve logs için)
- **Memory**: Minimum 4GB RAM
- **CPU**: Minimum 2 cores

### Network Gereksinimleri

- Port 80 (HTTP) - Frontend
- Port 443 (HTTPS) - Frontend (opsiyonel)
- Port 3001 (Backend API) - Internal only
- Port 5432 (PostgreSQL) - Internal only
- Port 6432 (PgBouncer) - Internal only
- Port 6379 (Redis) - Internal only
- Port 9090 (Prometheus) - Internal only
- Port 3000 (Grafana) - Internal only

---

## Docker Secrets Yapılandırması

### 1. Docker Swarm'ı Başlatma

```bash
docker swarm init
```

### 2. Secrets Oluşturma

**Linux/macOS:**

```bash
cd backend
chmod +x scripts/create-secrets.sh
./scripts/create-secrets.sh
```

**Windows (PowerShell):**

```powershell
cd backend
.\scripts\create-secrets.ps1
```

Bu script şu secrets'ları oluşturur:
- `postgres_password`
- `jwt_secret`
- `encryption_master_key`
- `redis_password`
- `grafana_admin_password`

### 3. Secrets Doğrulama

```bash
docker secret ls
```

---

## Environment Variables

### Backend Environment Variables

`.env` dosyası oluşturun (`backend/.env`):

```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://yourdomain.com
LOG_LEVEL=info
ENABLE_HELMET=true
ENABLE_CORS=true
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Database (will be set from secrets in production)
DATABASE_URL=postgresql://lemnix_user@pgbouncer:6432/lemnix_db?schema=public&connection_limit=20&pool_timeout=30&sslmode=require

# Redis (will be set from secrets in production)
REDIS_URL=redis://redis:6379

# Sentry (optional)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### Frontend Environment Variables

`.env.production` dosyası oluşturun (`frontend/.env.production`):

```env
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VITE_ENABLE_ANALYTICS=true
```

---

## Docker Compose ile Deployment

### 1. Production Docker Compose Dosyasını Kullanma

```bash
cd backend
docker stack deploy -c docker-compose.prod.yml lemnix
```

veya Docker Compose ile:

```bash
cd backend
docker-compose -f docker-compose.prod.yml up -d
```

### 2. Servislerin Durumunu Kontrol Etme

```bash
docker stack services lemnix
# veya
docker-compose -f docker-compose.prod.yml ps
```

### 3. Logları İzleme

```bash
docker stack services lemnix --follow
# veya
docker-compose -f docker-compose.prod.yml logs -f
```

### 4. Servisleri Durdurma

```bash
docker stack rm lemnix
# veya
docker-compose -f docker-compose.prod.yml down
```

---

## Health Checks

### Backend Health Endpoints

- **Liveness Probe**: `GET /health`
- **Readiness Probe**: `GET /readyz`
- **Deep Health Check**: `GET /api/health/deep`
- **Database Health**: `GET /api/health/database`
- **System Health**: `GET /api/health/system`

### Frontend Health Endpoint

- **Health Check**: `GET /health`

### Health Check Örnekleri

```bash
# Backend liveness
curl http://localhost:3001/health

# Backend readiness
curl http://localhost:3001/readyz

# Frontend health
curl http://localhost/health
```

---

## Monitoring ve Logging

### Prometheus Metrics

Prometheus metrics endpoint: `http://localhost:3001/metrics`

### Grafana Dashboard

Grafana erişimi: `http://localhost:3000`

Default credentials:
- Username: `admin`
- Password: Docker secret'tan alınır (`grafana_admin_password`)

### Log Yönetimi

Loglar Docker logging driver ile yönetilir:

```bash
# Backend logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Database logs
docker-compose -f docker-compose.prod.yml logs -f postgres

# Tüm servisler
docker-compose -f docker-compose.prod.yml logs -f
```

---

## Backup Stratejisi

### Database Backup

**Otomatik Backup:**

```bash
cd backend
npm run db:backup:schedule
```

**Manuel Backup:**

```bash
cd backend
npm run db:backup:full
```

**Backup Dosyaları:**

Backup dosyaları `backend/data/backups/` dizininde saklanır.

### Volume Backup

```bash
# PostgreSQL data volume
docker run --rm -v lemnix_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz /data

# Restore
docker run --rm -v lemnix_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres-backup.tar.gz -C /
```

---

## Troubleshooting

### Servis Başlamıyor

1. **Logları kontrol edin:**
   ```bash
   docker-compose -f docker-compose.prod.yml logs
   ```

2. **Health check'leri kontrol edin:**
   ```bash
   curl http://localhost:3001/health
   curl http://localhost:3001/readyz
   ```

3. **Secrets'ları kontrol edin:**
   ```bash
   docker secret ls
   ```

### Database Bağlantı Sorunu

1. **PgBouncer durumunu kontrol edin:**
   ```bash
   docker-compose -f docker-compose.prod.yml exec pgbouncer psql -h localhost -p 6432 -U lemnix_user -d pgbouncer -c "SHOW POOLS"
   ```

2. **PostgreSQL bağlantısını test edin:**
   ```bash
   docker-compose -f docker-compose.prod.yml exec postgres psql -U lemnix_user -d lemnix_db -c "SELECT 1"
   ```

### Memory/CPU Sorunları

1. **Resource kullanımını kontrol edin:**
   ```bash
   docker stats
   ```

2. **Resource limitlerini artırın:**
   `docker-compose.prod.yml` dosyasındaki `deploy.resources` bölümünü güncelleyin.

### Network Sorunları

1. **Network'i kontrol edin:**
   ```bash
   docker network ls
   docker network inspect lemnix-internal
   ```

2. **Servislerin network'e bağlı olduğunu doğrulayın:**
   ```bash
   docker-compose -f docker-compose.prod.yml ps
   ```

---

## Güvenlik Kontrol Listesi

- [ ] Tüm secrets'lar Docker secrets olarak yönetiliyor
- [ ] SSL/TLS database bağlantıları aktif
- [ ] CORS origins production URL'lerine ayarlanmış
- [ ] Rate limiting aktif
- [ ] Helmet security headers aktif
- [ ] Health check endpoints çalışıyor
- [ ] Monitoring ve logging aktif
- [ ] Backup stratejisi uygulanmış
- [ ] Firewall kuralları yapılandırılmış
- [ ] Log rotation yapılandırılmış

---

## İletişim ve Destek

Sorunlar için:
- GitHub Issues: [Repository URL]
- Email: support@lemnix.com

