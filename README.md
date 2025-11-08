# LEMNIX - Alüminyum Kesim Optimizasyonu Sistemi

Modern, hızlı ve verimli alüminyum profil kesim optimizasyonu platformu.

## Proje Hakkında

LEMNIX, alüminyum profil kesim işlemlerini optimize eden web tabanlı bir uygulamadır. Gelişmiş matematiksel algoritmalar kullanarak malzeme israfını minimize eder ve kesim verimliliğini maksimize eder.

### Temel Özellikler

- Akıllı kesim optimizasyonu (FFD, BFD, Genetic Algorithm)
- Gerçek zamanlı fire analizi
- İş emri yönetimi
- Excel import/export desteği
- PDF rapor oluşturma
- Görsel kesim planları
- Geçmiş verilere dayalı akıllı öneriler

## Teknik Altyapı

### Backend
- **Dil:** TypeScript 5.9.2
- **Runtime:** Node.js 20.19.0
- **Framework:** Express 4.18.2
- **Veritabanı:** Prisma ORM + SQLite
- **Validation:** Zod
- **Export:** ExcelJS, PDFKit

### Frontend
- **Dil:** TypeScript 5.9.2
- **Framework:** React 19.0
- **UI Library:** Material-UI 6.2.0
- **State Management:** Zustand, TanStack Query
- **Build Tool:** Vite 7.1.3
- **Mimari:** Feature-Sliced Design (FSD)

### Kod Kalitesi
- **Linting:** ESLint 9.34.0
- **Type Safety:** TypeScript Strict Mode
- **Code Style:** Prettier
- **Architecture:** Clean Architecture, SOLID Principles

## Kurulum

### Gereksinimler
- Node.js >= 20.19.0
- npm >= 10.0.0

### Hızlı Başlangıç

```bash
# Tüm bağımlılıkları kur
npm run install:all

# Geliştirme ortamını başlat (backend + frontend birlikte)
npm run dev
```

### Ayrı Ayrı Başlatma

```bash
# Sadece backend
npm run dev:backend

# Sadece frontend
npm run dev:frontend
```

## Uygulama Erişimi

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001

## Proje Yapısı

```
lemnix/
├── backend/                 # Backend uygulama
│   ├── src/
│   │   ├── controllers/     # API kontrolcüleri
│   │   ├── services/        # İş mantığı servisleri
│   │   │   ├── analysis/    # Analiz servisleri
│   │   │   ├── export/      # Export servisleri
│   │   │   ├── optimization/# Optimizasyon algoritmaları
│   │   │   ├── suggestions/ # Akıllı öneri servisleri
│   │   │   ├── monitoring/  # İzleme servisleri
│   │   │   └── policies/    # Doğrulama politikaları
│   │   ├── routes/          # API rotaları
│   │   ├── middleware/      # Express middleware'ler
│   │   ├── types/           # TypeScript tipleri
│   │   └── utils/           # Yardımcı fonksiyonlar
│   ├── prisma/              # Veritabanı şeması
│   └── package.json
│
├── frontend/                # Frontend uygulama
│   ├── src/
│   │   ├── app/             # Uygulama yapılandırması
│   │   ├── pages/           # Sayfa bileşenleri
│   │   ├── components/      # UI bileşenleri
│   │   ├── shared/          # Paylaşılan kod
│   │   │   ├── ui/          # Paylaşılan UI bileşenleri
│   │   │   ├── api/         # API istemcisi
│   │   │   ├── hooks/       # Paylaşılan hook'lar
│   │   │   └── lib/         # Yardımcı kütüphaneler
│   │   ├── entities/        # Domain varlıkları
│   │   ├── stores/          # Durum yönetimi
│   │   ├── services/        # Frontend servisleri
│   │   ├── hooks/           # Custom hook'lar
│   │   ├── theme/           # Tasarım sistemi
│   │   └── types/           # TypeScript tipleri
│   └── package.json
│
├── docs/                    # Dokümantasyon
│   ├── archive/             # Arşiv dokümanlar
│   ├── ENTERPRISE_OPTIMIZATION_GUIDE.md
│   ├── PRODUCTION_READY_GUIDE.md
│   └── PROJE_YAPISI.md
│
└── README.md                # Bu dosya
```

## Geliştirme Komutları

```bash
# Tüm projeyi kur
npm run install:all

# Geliştirme modunda çalıştır
npm run dev              # Backend + frontend birlikte
npm run dev:backend      # Sadece backend
npm run dev:frontend     # Sadece frontend

# Build
npm run build            # Backend + frontend build
npm run build:backend    # Sadece backend build
npm run build:frontend   # Sadece frontend build

# Kod kalitesi
npm run lint             # Tüm projeyi lint et
npm run format           # Tüm projeyi formatla
```

## API Kullanımı

### Kesim Listesi İşlemleri

```typescript
// Yeni kesim listesi oluştur
POST /api/cutting-list
Body: {
  title: string;
  weekNumber: number;
  sections: ProductSection[];
}

// Tüm kesim listelerini getir
GET /api/cutting-list

// Belirli bir listeyi getir
GET /api/cutting-list/:id

// Listeyi güncelle
PUT /api/cutting-list/:id

// Listeyi sil
DELETE /api/cutting-list/:id
```

### Optimizasyon İşlemleri

```typescript
// Kesim optimizasyonu çalıştır
POST /api/enterprise/optimize
Body: {
  items: CuttingItem[];
  stockLengths: number[];
  kerfWidth: number;
  settings: OptimizationSettings;
}
```

### İstatistik Servisleri

```typescript
// Renk/ebat analizi
GET /api/statistics/color-size-analysis?cuttingListId=:id

// Profil analizi
GET /api/statistics/profile-analysis?cuttingListId=:id

// İş emri analizi
GET /api/statistics/work-order-analysis?cuttingListId=:id
```

## Optimizasyon Algoritmaları

### FFD (First Fit Decreasing)
- **Hız:** Çok hızlı
- **Verimlilik:** %85-90
- **Kullanım:** Hızlı sonuç gereken durumlar

### BFD (Best Fit Decreasing)
- **Hız:** Hızlı
- **Verimlilik:** %87-92
- **Kullanım:** Atık minimizasyonu önemli

### Genetic Algorithm
- **Hız:** Orta
- **Verimlilik:** %92-97
- **Kullanım:** En iyi sonuç gereken durumlar

### Pooling Optimization
- **Hız:** Hızlı
- **Verimlilik:** %90-95
- **Kullanım:** Grup optimizasyonu

## Performans

- **Backend Response Time:** < 100ms (ortalama)
- **Frontend Load Time:** < 2s (ilk yükleme)
- **Optimizasyon Süresi:** < 5s (1000 kesim için)
- **Memory Usage:** < 500MB (normal işlemler)

## Güvenlik

- **Authentication:** JWT token tabanlı
- **Authorization:** Role-based access control (RBAC)
- **Rate Limiting:** API endpoint koruması
- **Input Validation:** Zod şema doğrulama
- **CORS:** Yapılandırılmış cross-origin kontrolü
- **Error Handling:** Güvenli hata mesajları

## Dokümantasyon

Detaylı dokümantasyon için `docs/` klasörüne bakınız:

- **COMPREHENSIVE_PROJECT_ANALYSIS.md** - Kapsamlı proje analizi (mimari, teknoloji, kod kalitesi, güvenlik)
- **ENTERPRISE_OPTIMIZATION_GUIDE.md** - Optimizasyon rehberi
- **PRODUCTION_READY_GUIDE.md** - Üretim hazırlık rehberi
- **PROJE_YAPISI.md** - Proje yapısı detayları

## Teknoloji Stack

**Backend**
- TypeScript, Node.js, Express
- Prisma ORM, SQLite
- Zod (validation)
- ExcelJS, PDFKit (export)
- Winston (logging)

**Frontend**
- TypeScript, React 19
- Material-UI 6
- TanStack Query (server state)
- Zustand (UI state)
- Vite (build tool)
- React Hook Form + Zod

**DevOps**
- ESLint, Prettier
- Concurrently (dev server)
- Git, GitHub

## Kod Kalitesi Standartları

- **Type Safety:** TypeScript strict mode
- **Architecture:** Clean Architecture + SOLID
- **Design:** Feature-Sliced Design (FSD)
- **Code Style:** ESLint + Prettier
- **Error Handling:** Comprehensive error boundaries
- **Performance:** Memoization, lazy loading, code splitting

## Lisans

MIT License - Detaylar için LICENSE dosyasına bakınız.

## Destek

Sorularınız için GitHub Issues kullanabilirsiniz.

## Versiyon

**v2.0.0** - Modern mimari, performans iyileştirmeleri ve UI/UX refactor

---

**LEMNIX** - Alüminyum kesim optimizasyonunda yeni nesil çözüm.
