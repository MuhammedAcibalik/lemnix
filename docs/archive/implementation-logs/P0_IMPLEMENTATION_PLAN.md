# P0 Features Implementation Plan

**Başlangıç:** 7 Ekim 2025  
**Tahmini Süre:** 2-3 saat  
**Hedef:** Backend'deki kritik özellikleri frontend'e entegre et

---

## 🎯 **GENEL STRATEJİ**

### **Mimari Yaklaşım**
- **Feature-Sliced Design (FSD)** prensiplerine uygun
- **entities/optimization** altında API layer'ı genişlet
- **features/** altında yeni feature'lar oluştur
- **widgets/** altında karmaşık UI blokları
- **pages/** altında yeni sayfalar (gerekirse)

### **Teknoloji Stack**
- **API Client:** Mevcut `shared/api/client.ts`
- **State Management:** TanStack Query (server state)
- **Validation:** Zod schemas
- **UI Components:** Material-UI + shadcn/ui patterns
- **Type Safety:** Strict TypeScript, no `any`

---

## 📋 **P0-1: ALGORITHM COMPARISON**

### **Backend Endpoint**
```typescript
POST /api/enterprise/compare
```

### **Request/Response Types**
```typescript
// Request
interface CompareAlgorithmsRequest {
  readonly items: readonly OptimizationItem[];
  readonly algorithms: readonly AlgorithmType[]; // ['ffd', 'bfd', 'genetic', 'pooling']
  readonly stockLength: number;
  readonly materialStockLengths?: readonly MaterialStockLength[];
}

// Response
interface CompareAlgorithmsResponse {
  readonly comparisons: readonly {
    readonly algorithm: AlgorithmType;
    readonly result: OptimizationResult;
    readonly executionTimeMs: number;
    readonly performanceMetrics: PerformanceMetrics;
  }[];
  readonly recommendation: AlgorithmType;
  readonly summary: {
    readonly bestForWaste: AlgorithmType;
    readonly bestForTime: AlgorithmType;
    readonly bestForCost: AlgorithmType;
    readonly bestForEfficiency: AlgorithmType;
  };
}
```

### **Implementasyon Adımları**

#### **1. API Layer** (`entities/optimization/api/`)
- [ ] `compareAlgorithms()` fonksiyonu ekle
- [ ] Zod schema validation ekle
- [ ] TanStack Query hook: `useCompareAlgorithms()`

#### **2. Types** (`entities/optimization/model/types.ts`)
- [ ] `CompareAlgorithmsRequest` interface
- [ ] `CompareAlgorithmsResponse` interface
- [ ] `AlgorithmComparisonResult` interface

#### **3. Feature** (`features/algorithm-comparison/`)
```
features/algorithm-comparison/
├── ui/
│   ├── ComparisonTriggerButton.tsx    # "Algoritmaları Karşılaştır" butonu
│   ├── ComparisonDialog.tsx           # Karşılaştırma dialog'u
│   ├── ComparisonResultsTable.tsx     # Sonuç tablosu
│   ├── ComparisonChart.tsx            # Grafik gösterimi
│   └── RecommendationCard.tsx         # Öneri kartı
├── model/
│   └── useComparisonLogic.ts          # Business logic hook
└── index.ts                           # Public API
```

#### **4. Integration Points**
- `EnterpriseOptimizationForm`: "Karşılaştır" butonu ekle
- `EnterpriseOptimizationResults`: Sonuçta karşılaştırma önerisi göster

#### **5. UI/UX Flow**
1. Kullanıcı cutting list'i seçer
2. "Tüm Algoritmaları Karşılaştır" butonuna tıklar
3. Loading indicator ile 4 algoritma paralel çalışır
4. Sonuçlar yan yana tablo/grafik olarak gösterilir
5. En iyi algoritma önerisi vurgulanır
6. Kullanıcı istediği algoritmayı seçebilir

---

## 📋 **P0-2: OPTIMIZATION HISTORY**

### **Backend Endpoint**
```typescript
GET /api/enterprise/history?limit=20&offset=0&algorithm=genetic&dateFrom=2025-01-01
```

### **Response Type**
```typescript
interface OptimizationHistoryResponse {
  readonly history: readonly OptimizationHistoryEntry[];
  readonly total: number;
  readonly hasMore: boolean;
}

interface OptimizationHistoryEntry {
  readonly id: string;
  readonly timestamp: string;
  readonly algorithm: AlgorithmType;
  readonly itemCount: number;
  readonly efficiency: number;
  readonly wastePercentage: number;
  readonly executionTimeMs: number;
  readonly user?: string;
}
```

### **Implementasyon Adımları**

#### **1. API Layer**
- [ ] `getOptimizationHistory()` fonksiyonu
- [ ] `useOptimizationHistory()` hook (infinite query)
- [ ] Pagination support

#### **2. Page** (`pages/OptimizationHistoryPage/`)
```
pages/OptimizationHistoryPage/
├── ui/
│   ├── HistoryList.tsx
│   ├── HistoryFilters.tsx
│   ├── HistoryItemCard.tsx
│   └── HistoryDetailsModal.tsx
├── model/
│   └── useHistoryFilters.ts
└── index.tsx
```

#### **3. Widget** (`widgets/HistoryWidget/`)
- Mini history widget for dashboard
- Son 5 optimizasyonu göster

#### **4. UI/UX Flow**
1. Yeni sayfa: "Optimizasyon Geçmişi"
2. Filtreleme: Tarih, algoritma, kullanıcı
3. Pagination/Infinite scroll
4. Her kayıt detayına tıklanabilir
5. "Yeniden Çalıştır" butonu

---

## 📋 **P0-3: EXPORT RESULTS**

### **Backend Endpoint**
```typescript
POST /api/enterprise/export
Body: {
  format: 'excel' | 'pdf' | 'json',
  resultId: string,
  options?: ExportOptions
}
```

### **Response Type**
```typescript
interface ExportResponse {
  readonly downloadUrl: string;
  readonly filename: string;
  readonly expiresAt: string;
}
```

### **Implementasyon Adımları**

#### **1. API Layer**
- [ ] `exportOptimizationResult()` fonksiyonu
- [ ] `useExportResult()` mutation hook

#### **2. Feature** (`features/export-results/`)
```
features/export-results/
├── ui/
│   ├── ExportButton.tsx
│   ├── ExportDialog.tsx
│   └── ExportFormatSelector.tsx
├── model/
│   └── useExportLogic.ts
└── index.ts
```

#### **3. Integration**
- `EnterpriseOptimizationResults`: Export butonları ekle
- Download handling with proper error states

#### **4. UI/UX Flow**
1. "Export" butonu (Excel/PDF/JSON seçenekleri)
2. Loading state
3. Başarılı: Otomatik download
4. Hata: User-friendly mesaj

---

## 📋 **P0-4: STATISTICS DASHBOARD**

### **Backend Endpoints**
```typescript
GET /api/statistics/overview
GET /api/statistics/optimization/algorithms
GET /api/statistics/optimization/waste-reduction
GET /api/statistics/performance
```

### **Implementasyon Adımları**

#### **1. API Layer** (`entities/statistics/`)
```
entities/statistics/
├── api/
│   ├── statisticsApi.ts
│   └── statisticsQueries.ts
├── model/
│   ├── types.ts
│   └── schemas.ts
└── index.ts
```

#### **2. Page** (`pages/StatisticsDashboardPage/`)
```
pages/StatisticsDashboardPage/
├── ui/
│   ├── OverviewSection.tsx
│   ├── AlgorithmPerformanceChart.tsx
│   ├── WasteReductionTrend.tsx
│   └── SystemHealthWidget.tsx
└── index.tsx
```

#### **3. Widgets** (`widgets/statistics/`)
- `OverviewWidget`: Genel metrikler
- `AlgorithmComparisonWidget`: Algoritma performans karşılaştırması
- `TrendWidget`: Zaman bazlı trendler

#### **4. UI/UX Flow**
1. Ana dashboard sayfası
2. Kartlar: Total optimizations, avg efficiency, total waste saved
3. Grafikler: Time-series trends
4. Algoritma performans tablosu

---

## 📋 **P0-5: PROFILE-BASED OPTIMIZATION**

### **Backend Endpoint**
```typescript
POST /api/enterprise/optimize-by-profile
Body: {
  items: OptimizationItem[],
  profileGroups: string[],
  ...
}
```

### **Implementasyon Adımları**

#### **1. API Layer**
- [ ] `optimizeByProfile()` fonksiyonu
- [ ] `useOptimizeByProfile()` mutation hook

#### **2. Feature** (`features/profile-optimization/`)
```
features/profile-optimization/
├── ui/
│   ├── ProfileGroupSelector.tsx
│   ├── ProfileOptimizationForm.tsx
│   └── ProfileResultsView.tsx
└── index.ts
```

#### **3. Integration**
- `EnterpriseOptimizationForm`: "Profil Bazlı Optimizasyon" seçeneği
- Profile gruplarını otomatik tespit et ve öner

#### **4. UI/UX Flow**
1. Cutting list yüklendiğinde profilleri grupla
2. Kullanıcıya "Her profil için ayrı optimize et" seçeneği sun
3. Sonuçları profil bazında göster

---

## 📋 **P0-6: VALIDATION SYSTEM**

### **Backend Endpoints**
```typescript
POST /api/validation/validate
GET  /api/validation/metrics
GET  /api/validation/quarantine
POST /api/validation/quarantine/:id/review
```

### **Implementasyon Adımları**

#### **1. API Layer** (`entities/validation/`)
```
entities/validation/
├── api/
│   ├── validationApi.ts
│   └── validationQueries.ts
├── model/
│   ├── types.ts
│   └── schemas.ts
└── index.ts
```

#### **2. Feature** (`features/validation/`)
```
features/validation/
├── ui/
│   ├── ValidationIndicator.tsx      # Real-time validation feedback
│   ├── QuarantineDialog.tsx         # Hatalı kayıtları göster
│   ├── ValidationMetricsWidget.tsx  # Metrics
│   └── ReviewQuarantineForm.tsx     # Review interface
└── index.ts
```

#### **3. Integration**
- Form input'larında real-time validation
- Submit öncesi validation check
- Hatalı kayıtlar için quarantine management

#### **4. UI/UX Flow**
1. Kullanıcı cutting list item ekler/düzenler
2. Real-time validation feedback (✅/❌)
3. Hata varsa: Detaylı açıklama + düzeltme önerisi
4. Kritik hatalar: Quarantine'e gider
5. Admin/User karantinayı review edebilir

---

## 📋 **P0-7: WEBGPU INTEGRATION**

### **Backend Endpoints**
```typescript
GET  /api/webgpu/status
POST /api/webgpu/initialize
POST /api/webgpu/optimize
```

### **Implementasyon Adımları**

#### **1. API Layer** (`entities/webgpu/`)
```
entities/webgpu/
├── api/
│   ├── webgpuApi.ts
│   └── webgpuQueries.ts
├── model/
│   └── types.ts
└── index.ts
```

#### **2. Feature** (`features/gpu-acceleration/`)
```
features/gpu-acceleration/
├── ui/
│   ├── GPUStatusIndicator.tsx
│   ├── GPUEnableToggle.tsx
│   └── GPUPerformanceInfo.tsx
└── index.ts
```

#### **3. Integration**
- `EnterpriseOptimizationForm`: GPU enable checkbox
- GPU status app-wide check (on mount)
- Fallback to CPU if GPU unavailable

#### **4. UI/UX Flow**
1. App başlangıcında GPU status check
2. Eğer destekleniyorsa: "⚡ GPU Hızlandırma Aktif" badge
3. Kullanıcı enable/disable edebilir
4. GPU ile optimize edildiğinde performans metrikleri göster

---

## 🗂️ **DOSYA YAPISI (FSD)**

```
frontend/src/
├── entities/
│   ├── optimization/          # (Mevcut - genişletilecek)
│   │   ├── api/
│   │   ├── model/
│   │   └── index.ts
│   ├── statistics/            # YENİ
│   │   ├── api/
│   │   ├── model/
│   │   └── index.ts
│   ├── validation/            # YENİ
│   │   ├── api/
│   │   ├── model/
│   │   └── index.ts
│   └── webgpu/                # YENİ
│       ├── api/
│       ├── model/
│       └── index.ts
├── features/
│   ├── algorithm-comparison/  # YENİ
│   ├── export-results/        # YENİ
│   ├── profile-optimization/  # YENİ
│   ├── validation/            # YENİ
│   └── gpu-acceleration/      # YENİ
├── widgets/
│   ├── history-widget/        # YENİ
│   └── statistics/            # YENİ
└── pages/
    ├── OptimizationHistoryPage/  # YENİ
    └── StatisticsDashboardPage/  # YENİ
```

---

## 🎯 **UYGULAMA SIRASI**

### **Faz 1: Foundation (30 dk)**
1. Yeni entity'ler oluştur (statistics, validation, webgpu)
2. API client'ları hazırla
3. Type definitions ve Zod schemas

### **Faz 2: Core Features (60 dk)**
4. Algorithm Comparison (P0-1)
5. Export Results (P0-3)
6. WebGPU Integration (P0-7)

### **Faz 3: Data & Analytics (45 dk)**
7. Optimization History (P0-2)
8. Statistics Dashboard (P0-4)

### **Faz 4: Quality & Polish (45 dk)**
9. Validation System (P0-6)
10. Profile-based Optimization (P0-5)
11. Error handling & loading states
12. UI polish & accessibility

---

## ✅ **KABUL KRİTERLERİ**

Her feature için:
- [ ] Backend API entegrasyonu çalışıyor
- [ ] Type-safe (no `any`)
- [ ] Loading/error states
- [ ] Zod validation
- [ ] TanStack Query ile cache management
- [ ] Responsive design
- [ ] Accessibility (WCAG 2.2 AA)
- [ ] Error boundaries
- [ ] User-friendly error messages (Türkçe)

---

## 🚀 **BAŞLANGIC KOMUTLARİ**

```bash
# Backend zaten çalışıyor
cd frontend && npm run dev
```

---

## 📝 **NOTLAR**

1. **Authentication:** Şu an mock token kullanılıyor, bazı endpoint'ler 401 verebilir
2. **Performance:** Her feature için lazy loading kullan
3. **Bundle Size:** Code splitting ile optimize et
4. **Testing:** Component test'leri sonra eklenecek
5. **Documentation:** Inline TSDoc comments

---

**Plan Hazırlayan:** AI Assistant  
**Versiyon:** 1.0.0  
**Durum:** ✅ Onay Bekliyor

