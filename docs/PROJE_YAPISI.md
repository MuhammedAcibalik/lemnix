# LEMNİX - Alüminyum Kesim Optimizasyonu Projesi

## Proje Genel Bakış

LEMNİX, alüminyum profil kesim işlemlerini optimize eden, fire oranını minimize eden ve verimli kesim planları oluşturan bir web uygulamasıdır.

## Teknik Mimari

### Frontend (React + TypeScript)
- **Framework:** React 18 + TypeScript
- **UI Kütüphanesi:** Material-UI (MUI) veya Ant Design
- **State Management:** Zustand veya Redux Toolkit
- **Form Yönetimi:** React Hook Form + Zod validation
- **Grafik/Visualization:** Chart.js veya D3.js (kesim planı görselleştirme)

### Backend (Node.js + TypeScript)
- **Runtime:** Node.js 18+
- **Framework:** Express.js veya Fastify
- **Veritabanı:** PostgreSQL (iş emirleri, kesim geçmişi)
- **Optimizasyon Algoritması:** Custom implementation + matematiksel kütüphaneler
- **API:** RESTful API + OpenAPI/Swagger

### Optimizasyon Algoritması
- **Ana Algoritma:** First Fit Decreasing (FFD) + Branch and Bound
- **Alternatif:** Genetic Algorithm veya Simulated Annealing
- **Matematiksel Kütüphaneler:** mathjs, numeric.js

## Veri Yapıları

### İş Emri (Work Order)
```typescript
interface WorkOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  orderDate: Date;
  dueDate: Date;
  status: 'pending' | 'processing' | 'completed';
  items: WorkOrderItem[];
  totalWaste: number;
  efficiency: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### İş Emri Kalemi (Work Order Item)
```typescript
interface WorkOrderItem {
  id: string;
  workOrderId: string;
  profileType: string; // 'KAPALI_ALT', 'KAPALI_ALT_2', 'AÇIK_ALT'
  length: number; // mm cinsinden
  quantity: number;
  totalLength: number; // length * quantity
}
```

### Kesim Planı (Cutting Plan)
```typescript
interface CuttingPlan {
  id: string;
  workOrderId: string;
  stockLength: number; // 6100 mm
  cuts: Cut[];
  waste: number;
  efficiency: number;
  createdAt: Date;
}
```

### Kesim (Cut)
```typescript
interface Cut {
  id: string;
  cuttingPlanId: string;
  stockIndex: number; // hangi boy profil
  cuts: CutSegment[];
  remainingLength: number;
}
```

### Kesim Segmenti (Cut Segment)
```typescript
interface CutSegment {
  profileType: string;
  length: number;
  quantity: number;
  position: number; // boy profil içindeki pozisyon
}
```

## Ana Özellikler

### 1. İş Emri Yönetimi
- Yeni iş emri oluşturma
- İş emri düzenleme ve silme
- İş emri listesi görüntüleme
- İş emri durumu takibi

### 2. Kesim Optimizasyonu
- Otomatik kesim planı oluşturma
- Manuel kesim planı düzenleme
- Fire oranı hesaplama
- Verimlilik analizi

### 3. Görselleştirme
- Kesim planı görselleştirme
- Fire analizi grafikleri
- Verimlilik raporları
- 3D kesim simülasyonu (opsiyonel)

### 4. Raporlama
- Günlük/haftalık/aylık raporlar
- Fire oranı trendleri
- Müşteri bazlı analizler
- Maliyet hesaplamaları

## Optimizasyon Algoritması Detayları

### 1. First Fit Decreasing (FFD) Algoritması
```typescript
function firstFitDecreasing(items: WorkOrderItem[], stockLength: number): CuttingPlan {
  // 1. Parçaları uzunluklarına göre azalan sırada sırala
  // 2. Her parçayı ilk uygun boy profile yerleştir
  // 3. Yeni boy profil gerekirse ekle
}
```

### 2. Branch and Bound Optimizasyonu
```typescript
function branchAndBound(items: WorkOrderItem[], stockLength: number): CuttingPlan {
  // 1. Tüm olası kombinasyonları dene
  // 2. En iyi çözümü bul
  // 3. Fire oranını minimize et
}
```

### 3. Fire Hesaplama
```typescript
function calculateWaste(cuttingPlan: CuttingPlan): number {
  // Her boy profildeki kalan uzunluğu hesapla
  // Toplam fire oranını döndür
}
```

## Veritabanı Şeması

### Tables
1. **work_orders** - İş emirleri
2. **work_order_items** - İş emri kalemleri
3. **cutting_plans** - Kesim planları
4. **cuts** - Kesimler
5. **cut_segments** - Kesim segmentleri
6. **profiles** - Profil tipleri
7. **customers** - Müşteriler

## API Endpoints

### İş Emirleri
- `GET /api/work-orders` - İş emri listesi
- `POST /api/work-orders` - Yeni iş emri
- `GET /api/work-orders/:id` - İş emri detayı
- `PUT /api/work-orders/:id` - İş emri güncelleme
- `DELETE /api/work-orders/:id` - İş emri silme

### Kesim Optimizasyonu
- `POST /api/optimize` - Kesim optimizasyonu
- `GET /api/cutting-plans/:workOrderId` - Kesim planı
- `PUT /api/cutting-plans/:id` - Kesim planı güncelleme

### Raporlar
- `GET /api/reports/waste` - Fire raporu
- `GET /api/reports/efficiency` - Verimlilik raporu
- `GET /api/reports/customer/:id` - Müşteri raporu

## Güvenlik ve Performans

### Güvenlik
- JWT tabanlı kimlik doğrulama
- Role-based access control (RBAC)
- Input validation ve sanitization
- Rate limiting

### Performans
- Database indexing
- Caching (Redis)
- Pagination
- Lazy loading
- Optimizasyon algoritması için worker threads

## Deployment

### Development
- Docker Compose
- Hot reload
- Development database

### Production
- Docker containers
- Nginx reverse proxy
- PostgreSQL cluster
- Redis cache
- PM2 process manager

## Test Stratejisi

### Unit Tests
- Optimizasyon algoritması
- Utility fonksiyonları
- API endpoints

### Integration Tests
- Database operations
- API workflows
- End-to-end scenarios

### Performance Tests
- Büyük veri setleri
- Concurrent requests
- Memory usage

## Geliştirme Aşamaları

### Phase 1: Temel Yapı
- [ ] Proje kurulumu
- [ ] Veritabanı şeması
- [ ] Temel API endpoints
- [ ] Basit optimizasyon algoritması

### Phase 2: Frontend
- [ ] React uygulaması
- [ ] İş emri yönetimi UI
- [ ] Kesim planı görselleştirme
- [ ] Temel raporlama

### Phase 3: Gelişmiş Özellikler
- [ ] Gelişmiş optimizasyon algoritması
- [ ] 3D görselleştirme
- [ ] Detaylı raporlama
- [ ] Kullanıcı yönetimi

### Phase 4: Production
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Deployment automation
- [ ] Monitoring ve logging

## Teknoloji Stack

### Frontend
- React 18
- TypeScript 5
- Material-UI veya Ant Design
- React Hook Form
- Zod
- Zustand
- Chart.js
- React Router

### Backend
- Node.js 18
- TypeScript 5
- Express.js
- PostgreSQL
- Prisma ORM
- JWT
- bcrypt
- cors
- helmet

### Development Tools
- ESLint
- Prettier
- Husky
- Jest
- Supertest
- Docker
- Docker Compose

### Production
- Nginx
- PM2
- Redis
- PostgreSQL
- Docker
- GitHub Actions (CI/CD)

Bu yapı, LEMNİX uygulamasının tam ölçekli, ölçeklenebilir ve sürdürülebilir bir şekilde geliştirilmesini sağlayacaktır.
