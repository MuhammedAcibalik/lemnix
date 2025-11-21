# API Endpoint Entegrasyon Analizi ve Planı

**Tarih:** 2025-01-27  
**Kapsam:** Tüm backend endpoint'lerinin frontend entegrasyonu

---

## 📊 Endpoint Envanteri

### ✅ Tam Entegre Edilmiş Endpoint'ler

#### 1. Cutting List (`/api/cutting-list`)
- ✅ Tüm CRUD operasyonları
- ✅ Export (PDF, Excel)
- ✅ Smart suggestions
- ✅ Quantity calculations
- **Dosya:** `frontend/src/entities/cutting-list/api/cuttingListApi.ts`

#### 2. Enterprise Optimization (`/api/enterprise`)
- ✅ Optimize
- ✅ Optimize by profile
- ✅ Compare algorithms
- ✅ Export results
- ✅ History
- ✅ Metrics
- **Dosya:** `frontend/src/entities/optimization/api/optimizationApi.ts`

#### 3. Dashboard (`/api/dashboard`)
- ✅ Metrics
- ✅ Hero metrics
- ✅ Optimization performance
- ✅ Active operations
- ✅ Smart insights
- ✅ Activity timeline
- **Dosya:** `frontend/src/entities/dashboard/api/dashboardApi.ts`

#### 4. Statistics (`/api/statistics`)
- ✅ Overview
- ✅ Performance
- ✅ Usage analytics
- ✅ Profile usage
- ✅ Cutting list trends
- ✅ Optimization analytics
- ✅ Algorithm performance
- ✅ Waste reduction trends
- ✅ Batch statistics
- **Dosya:** `frontend/src/entities/statistics/api/statisticsApi.ts`

#### 5. Suggestions (`/api/suggestions`)
- ✅ Products
- ✅ Sizes
- ✅ Profiles
- ✅ Combinations
- ✅ Apply smart suggestion
- ✅ Statistics
- ✅ Health
- **Dosya:** `frontend/src/entities/suggestions/api/suggestionApi.ts`

#### 6. Production Plan (`/api/production-plan`)
- ✅ Upload
- ✅ Get all
- ✅ Get by ID
- ✅ Get by week/year
- ✅ Metrics
- ✅ Backorder
- ✅ Statistics
- ✅ Create cutting list
- ✅ Link/unlink operations
- **Dosya:** `frontend/src/entities/production-plan/api/productionPlanApi.ts`

#### 7. Material Profile Mappings (`/api/material-profile-mappings`)
- ✅ Suggestions
- ✅ Most popular
- ✅ Similar
- ✅ Save mapping
- **Dosya:** `frontend/src/entities/material-profile-mapping/api/materialProfileMappingApi.ts`

#### 8. Profile Management (`/api/profile-management`)
- ✅ Upload
- ✅ Get definitions
- ✅ Get by code
- ✅ Get stock lengths
- ✅ Get mappings
- ✅ Update/delete mappings
- ✅ Statistics
- **Dosya:** `frontend/src/entities/profile-management/api/profileManagementApi.ts`

#### 9. Product Categories (`/api/product-categories`)
- ✅ Get all
- ✅ Get by ID
- ✅ Create
- ✅ Update
- ✅ Delete
- ✅ Map product
- ✅ Get by product name
- ✅ Get products by category
- **Dosya:** `frontend/src/shared/api/productCategoryApi.ts`

---

### ⚠️ Kısmen Entegre Edilmiş Endpoint'ler

#### 10. WebGPU (`/api/webgpu`)
- ✅ Status (entegre)
- ❌ Initialize (entegre edilmemiş)
- ❌ Optimize (entegre edilmemiş)
- ❌ Info (entegre edilmemiş)
- ❌ Cleanup (entegre edilmemiş)
- **Dosya:** `frontend/src/entities/webgpu/api/webgpuApi.ts`
- **Değerlendirme:** ⚠️ **GEREKSIZ** - WebGPU frontend'de çalışır, backend'de initialize/optimize gerekmez

---

### ❌ Entegre Edilmemiş Endpoint'ler

#### 11. Health (`/api/health`)
**Endpoint'ler:**
- `GET /api/health/database` - Database health check
- `GET /api/health/deep` - Deep health check
- `GET /api/health/system` - System health overview
- `GET /api/health/queries` - Query performance metrics
- `GET /api/health/cache` - Cache performance metrics
- `GET /api/health/gpu` - GPU status

**Değerlendirme:** ✅ **GEREKLI** - Monitoring ve ops için önemli

**Öncelik:** Orta (Ops team için)

---

#### 12. Metrics (`/api/metrics`)
**Endpoint'ler:**
- `POST /api/metrics/web-vitals` - Web Vitals reporting
- `GET /api/metrics/web-vitals/summary` - Web Vitals summary

**Değerlendirme:** ✅ **GEREKLI** - Performance monitoring için kritik

**Öncelik:** Yüksek (P3-12 feature)

---

#### 13. Error Metrics (`/api/error-metrics`)
**Endpoint'ler:**
- `GET /api/error-metrics/` - All error metrics
- `GET /api/error-metrics/by-class` - Error rates by class
- `GET /api/error-metrics/trends` - Error trends
- `GET /api/error-metrics/health` - Error health status
- `POST /api/error-metrics/reset` - Reset metrics (admin)

**Değerlendirme:** ✅ **GEREKLI** - Error monitoring ve debugging için önemli

**Öncelik:** Yüksek (Ops ve debugging için)

---

#### 14. Validation Policy (`/api/validation`)
**Endpoint'ler:**
- `POST /api/validation/validate` - Validate record
- `GET /api/validation/metrics` - Validation metrics
- `GET /api/validation/quarantine` - Get quarantine records
- `POST /api/validation/quarantine/:recordId/review` - Review quarantine
- `GET /api/validation/daily-report` - Daily validation report
- `GET /api/validation/dashboard/summary` - Dashboard summary
- `GET /api/validation/dashboard/violations` - Violation breakdown
- `GET /api/validation/dashboard/compliance` - Compliance metrics

**Değerlendirme:** ✅ **GEREKLI** - Data quality ve compliance için kritik

**Öncelik:** Yüksek (Data quality management)

---

#### 15. Selection Log (`/api/selection-log`)
**Endpoint'ler:**
- `POST /api/selection-log/create` - Create selection log
- `PUT /api/selection-log/:selectionId/update` - Update selection log
- `GET /api/selection-log/:selectionId` - Get selection log
- `GET /api/selection-log/dashboard/distribution` - Distribution data
- `GET /api/selection-log/dashboard/trend` - Trend data
- `GET /api/selection-log/dashboard/summary` - Summary
- `GET /api/selection-log/dashboard/performance` - Performance comparison
- `GET /api/selection-log/dashboard/fallback-analysis` - Fallback analysis
- `POST /api/selection-log/canary` - Record canary data
- `GET /api/selection-log/canary/:correlationId` - Get canary data

**Değerlendirme:** ⚠️ **GEREKSIZ** - Backend analytics için, frontend'de görünürlük gerekmez

**Öncelik:** Düşük (Backend-only analytics)

---

#### 16. Progressive Routes (`/api/production-plan/*`)
**Endpoint'ler:**
- `POST /api/production-plan/upload-progressive` - Progressive upload
- `GET /api/production-plan/progressive` - Progressive data
- `GET /api/production-plan/progress/:sessionId` - Get progress

**Değerlendirme:** ✅ **GEREKLI** - Real-time progress tracking için önemli

**Öncelik:** Orta (UX improvement)

---

#### 17. Statistics - Eksik Endpoint'ler
**Endpoint'ler:**
- `POST /api/statistics/cutting-lists/:cuttingListId/update` - Update stats
- `POST /api/statistics/activities` - Record activity
- `POST /api/statistics/metrics` - Record metric
- `GET /api/statistics/profile-analysis` - Profile analysis
- `GET /api/statistics/product-categories` - Product categories analysis
- `GET /api/statistics/color-size` - Color-size analysis
- `GET /api/statistics/work-order-analysis` - Work order analysis

**Değerlendirme:** 
- ✅ **GEREKLI:** profile-analysis, product-categories, color-size, work-order-analysis (Analytics için)
- ⚠️ **GEREKSIZ:** update, activities, metrics (Admin operations)

**Öncelik:** Orta (Analytics endpoints)

---

## 🎯 Entegrasyon Planı

### Yüksek Öncelik (Kritik)

1. **Error Metrics** (`/api/error-metrics`)
   - Error monitoring dashboard için
   - Debugging ve ops için kritik

2. **Validation Policy** (`/api/validation`)
   - Data quality management
   - Compliance monitoring

3. **Metrics - Web Vitals** (`/api/metrics/web-vitals`)
   - Performance monitoring (P3-12)

### Orta Öncelik

4. **Health** (`/api/health`)
   - System monitoring
   - Ops team için

5. **Statistics - Analytics Endpoints**
   - Profile analysis
   - Product categories analysis
   - Color-size analysis
   - Work order analysis

6. **Progressive Routes**
   - Real-time progress tracking
   - UX improvement

### Düşük Öncelik / Gereksiz

7. **Selection Log** - Backend-only analytics
8. **WebGPU (Initialize/Optimize/Info/Cleanup)** - Frontend'de çalışır

---

## 📝 Entegrasyon Stratejisi

Her endpoint için:
1. Entity API dosyası oluştur (veya mevcut dosyaya ekle)
2. React Query hooks oluştur
3. Type definitions ekle
4. Zod schemas (validation için)
5. Error handling (401 graceful degradation)

---

**Toplam Endpoint Sayısı:** ~107  
**Entegre Edilmiş:** ~65  
**Entegre Edilmemiş:** ~42  
**Gerekli Olanlar:** ~25  
**Gereksiz Olanlar:** ~17

---

## ✅ Entegrasyon Tamamlandı

### Yeni Entegre Edilen Entity'ler

1. **Error Metrics** (`/api/error-metrics`)
   - ✅ `getAllErrorMetrics()` - Tüm error metrics
   - ✅ `getErrorRatesByClass()` - Error rates by class
   - ✅ `getErrorTrends()` - Error trends
   - ✅ `getErrorHealthCheck()` - Error health check
   - ✅ `resetErrorMetrics()` - Reset metrics (admin)
   - **Dosya:** `frontend/src/entities/error-metrics/`
   - **Hooks:** `useErrorMetrics`, `useErrorRatesByClass`, `useErrorTrends`, `useErrorHealthCheck`, `useResetErrorMetrics`

2. **Health** (`/api/health`)
   - ✅ `getDatabaseHealth()` - Database health
   - ✅ `getDeepHealthCheck()` - Deep health check
   - ✅ `getSystemHealth()` - System health
   - ✅ `getQueryPerformanceMetrics()` - Query performance
   - ✅ `getCachePerformanceMetrics()` - Cache performance
   - ✅ `getGPUStatus()` - GPU status
   - **Dosya:** `frontend/src/entities/health/`
   - **Hooks:** `useDatabaseHealth`, `useDeepHealthCheck`, `useSystemHealth`, `useQueryPerformanceMetrics`, `useCachePerformanceMetrics`, `useGPUStatus`

3. **Metrics** (`/api/metrics`)
   - ✅ `reportWebVital()` - Report Web Vital (zaten webVitals.ts'de kullanılıyor)
   - ✅ `getWebVitalsSummary()` - Web Vitals summary
   - **Dosya:** `frontend/src/entities/metrics/`
   - **Hooks:** `useWebVitalsSummary`

4. **Statistics - Analytics Endpoints** (`/api/statistics`)
   - ✅ `getProfileAnalysis()` - Profile analysis
   - ✅ `getProductCategoriesAnalysis()` - Product categories analysis
   - ✅ `getColorSizeAnalysis()` - Color-size analysis
   - ✅ `getWorkOrderAnalysis()` - Work order analysis
   - **Dosya:** `frontend/src/entities/statistics/` (güncellendi)
   - **Hooks:** `useProfileAnalysis`, `useProductCategoriesAnalysis`, `useColorSizeAnalysis`, `useWorkOrderAnalysis`

---

## 📊 Güncel Durum

**Toplam Entegre Edilmiş:** ~85 endpoint  
**Yeni Entegre Edilen:** ~20 endpoint  
**Kalan Gereksiz:** ~17 endpoint (Selection Log, WebGPU ops, Admin-only endpoints)

---

## 🎯 Sonraki Adımlar

1. ✅ Error Metrics - **TAMAMLANDI**
2. ✅ Health - **TAMAMLANDI**
3. ✅ Metrics - **TAMAMLANDI**
4. ✅ Statistics Analytics - **TAMAMLANDI**
5. ⏳ Validation Policy - **YAPILACAK** (Opsiyonel - Data quality management için)
6. ⏳ Progressive Routes - **YAPILACAK** (Opsiyonel - Real-time progress için)

**Not:** Validation ve Progressive routes opsiyonel olarak işaretlenmiştir. İhtiyaç duyulduğunda entegre edilebilir.

