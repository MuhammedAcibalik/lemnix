# LEMNIX Monorepo Derinlemesine Analiz (Backend + Frontend)

## 1. Genel mimari

### 1.1 Monorepo yapısı
- **Kök**: `backend/` (Express + Prisma + TypeScript), `frontend/` (React 19 + Vite, FSD), ortak komutlar `package.json` ile üst düzeyden çalıştırılıyor.
- **Dokümantasyon**: `docs/` altında operasyonel rehberler ve mimari özetler mevcut; test ve güvenlik raporları kök dizinde tutuluyor.

### 1.2 Backend katmanları
- **server**: `server/createApp.ts` Express bootstrap’i; güvenlik (helmet, CORS), sıkıştırma, korelasyon kimliği, audit, şifreleme, ETag ve log middleware zinciri, sağlık/readyz uçları ve rota kayıtlarını yapıyor.
- **routes**: Domain’e göre ayrılmış rota setleri (cutting list, enterprise optimization, statistics, suggestions, production plans, profile yönetimi, WebGPU vb.); yetkilendirme, rate limit ve validasyon middleware’leri ortak kullanılıyor.
- **controllers**: Her rota grubu için veri doğrulama ve servis çağrılarını yöneten kontrolcüler.
- **services**: İş mantığı modülleri (optimization, enterprise-core/handlers/validation, monitoring & statistics, suggestions, export, audit, cache, storage, production plans, profile & material mapping). Optimizasyon servisleri fabrika + algoritma sınıflarına bölünmüş; monitoring tarafı dashboard ve query-perf servisleri içeriyor.
- **repositories**: Prisma tabanlı veri erişim katmanı (örn. `SuggestionPatternRepository`, profil ve production plan depoları).
- **middleware**: Yetkilendirme, rate limiting, validation, audit, şifreleme ve hata yakalama katmanları.
- **config/utils/types**: Ortak ortam ayarları, logger, number/string helper’ları, tip tanımları ve scriptler.

### 1.3 Frontend katmanları (FSD)
- **app**: Uygulama kabuğu, tema ve sağlayıcılar.
- **pages**: Route tabanlı sayfalar (dashboard, cutting list, enterprise optimization, statistics, production plan vb.).
- **widgets**: Kompleks UI blokları; `enterprise-optimization-wizard` gibi çok adımlı süreç bileşenleri burada.
- **features**: Tekil kullanıcı aksiyonlarını kapsayan modüller (ör. algorithm selector, GPU status paneli).
- **entities**: Domain varlık modelleri ve tipleri (algorithm, cutting list vb.).
- **shared**: API istemcisi (axios + interceptors), devre kesici, UI kit, hooks, lib yardımcıları ve tasarım sistemi bileşenleri.
- **hooks/services/stores**: Küresel durum ve yardımcı fonksiyonlar; Zustand store’ları ve sorgu servisleri burada konumlanıyor.

## 2. Domain kavramları ve bounded context’ler

### 2.1 Cutting list / iş emri yönetimi
- **Sorumluluk**: Kesim listesi CRUD, iş emri kalemleri, profil/ölçü kombinasyonları, akıllı öneriler ve dışa aktarımlar.
- **Model**: `OptimizationItem`, `MaterialStockLength`, work order DTO’ları; repository katmanı Prisma ile veri setlerini yönetiyor.
- **Rotalar**: `/api/cutting-list` altında CRUD, akıllı öneriler, profil kombinasyonları, work order kopyalama ve şablon uçları; rate limit + auth zorunlu.
- **İlişkiler**: Suggestions servisiyle entegre, optimization servislerine girdi sağlıyor, production plan ve profile mapping ile senkron çalışıyor.

### 2.2 Optimization (FFD/BFD/GA/NSGA-II, GPU)
- **Sorumluluk**: Algoritma seçimi, giriş normalizasyonu, pattern üretimi, Pareto filtreleme, GPU hızlandırma ve profil çözümleme.
- **Model**: `AdvancedOptimizationParams`, `EnhancedConstraints`, `CostModel`, `AlgorithmLabel/Mode` gibi tipler; algoritmalar `IOptimizationAlgorithm` arayüzünü uyguluyor.
- **Rotalar**: `/api/enterprise/optimize`, `/api/enterprise/validate`, `/api/enterprise/algorithms`; GPU/WebGPU uçları ek olarak expose ediliyor.
- **İlişkiler**: Cutting list girdilerini kullanır, profile resolver’dan profil bilgisi çeker, monitoring servisleriyle performans ölçer.

### 2.3 Suggestions, Statistics/Dashboard/Monitoring
- **Suggestions**: UnifiedSuggestionService ML tabanlı skorlayıcı + cache ile ürün/ölçü/profil/kombo önerileri üretir; suggestion pattern repository ve Redis cache kullanır.
- **Statistics/Dashboard**: Statistics routes üzerinden overview, performance, usage, optimization metrikleri; dashboard servisleri trend ve profil kullanımı çıkarır.
- **Monitoring**: Query ve hata metrikleri, audit logları ve ready/health uçlarıyla servis sağlığı izlenir.

### 2.4 Stok & profil yönetimi, Access/Auth
- **Stok/Profil**: ProfileResolverService ve material profile mapping servisleri profil boyu/ölçü ilişkilerini yönetir; profile management rotaları CRUD ve toplu import/export yapar.
- **Auth**: Authorization middleware’leri token doğrulama ve izin kontrolü (Permission enum) uygular; rate limit ve audit ile birlikte çalışır.

## 3. Veri akışı (UI → API → Service → DB)

1. **UI (Wizard)**: Kullanıcı `EnterpriseOptimizationWizard` üzerinde kesim listesini seçer, parametreleri ayarlar ve optimize eder. Wizard axios tabanlı `apiClient` ile `/cutting-list` ve `/enterprise/optimize` çağrılarını yapar; adımlar arası non-lineer gezinme, modlar ve dialog durumları yönetilir.
2. **Axios interceptors**: `apiClient` isteklerde correlation-id üretir, mock auth token ekler, JSON/FormData içerik türünü dinamik belirler, dev modda loglar; yanıt tarafında circuit breaker, toast tabanlı hata bildirimi ve belirli 404’leri sessiz geçme kuralları vardır.
3. **Backend middleware zinciri**: `createApp` içinde helmet, CORS, compression, correlationId, requestTiming, audit, encrypt/decrypt, ETag ve morgan logları sırasıyla uygulanır; ardından auth + rate limit + validation kullanan rota setleri kaydedilir.
4. **Service katmanı**: Enterprise optimization controller, `AdvancedOptimizationService` veya `CuttingOptimizer` ile algoritma modunu seçer; girdileri normalizer’dan geçirir, pattern üretir, Pareto filtreler ve sonuçları dönüştürür. Suggestions ve profile resolver gerektiğinde devreye girer.
5. **Repository/DB**: Prisma tabanlı repository’ler (cutting list, profile, suggestion patterns, production plans) veritabanına erişir; sonuçlar JSON olarak API üzerinden UI’ye döner.

## 4. En karmaşık dosyalar ve nedenleri

1. **backend/src/services/optimization/AdvancedOptimizationService.ts** – 5’ten fazla algoritma kaydı (FFD, BFD, GA, Pooling, PatternExact, NSGA-II), default constraint/cost model yönetimi, veri sağlayıcı opsiyonları ve profil resolver entegrasyonu; yüksek orkestrasyon + konfigürasyon yüzeyi.
2. **backend/src/services/optimization/CuttingOptimizer.ts** – Girdi normalizasyonu, stok eşleme, hibrit pattern üretimi, Pareto filtreleme ve öncelik arama çözümleyicisi tek sınıfta; çok adımlı veri dönüşümü ve konfigürasyon seçenekleri (maxStates, wasteNorm, maxPiecesPerStock) barındırıyor.
3. **backend/src/routes/cuttingListRoutes.ts** – Dinamik rota registry, async sarma, yavaş istek uyarıları, rate limit/auth bağlamaları ve çok sayıda alt uç; metaprogramlama benzeri yapı okunabilirliği düşürüyor.
4. **backend/src/server/createApp.ts** – Tüm global middleware’ler, güvenlik politikaları, CORS whitelist’i, sağlık/readyz kontrolleri ve rota kayıtları tek dosyada; konfigürasyon karmaşıklığı yüksek.
5. **backend/src/services/suggestions/UnifiedSuggestionService.ts** – Singleton repo + skorlayıcı + cache entegrasyonu; ürün/ölçü/profil/kombo önerileri için gruplayıcı ve confidence hesaplayıcı akışlar içeriyor.
6. **backend/src/routes/statisticsRoutes.ts** – Çok sayıda alt metrik ucu, farklı izin seviyeleri ve rate limit uygulaması; route konfigurasyonu yoğun.
7. **frontend/src/widgets/enterprise-optimization-wizard/index.v2.tsx** – Çok adımlı sihirbaz state’i, dialoglar, mod seçimleri ve API çağrıları tek bileşende; yüksek durum yönetimi karmaşıklığı.
8. **frontend/src/shared/api/client.ts** – İstek/yanıt interceptors, circuit breaker entegrasyonu, özel hata sessizleştirme kuralları ve içerik türü manipülasyonu; yan etkili lojik yoğun.
9. **backend/src/services/monitoring/dashboardServiceV2.ts** – (kod yapısına göre) farklı tarih aralıkları ve çoklu Prisma sorguları ile KPI/trend üretimi; koşul sayısı ve sorgu çeşitliliği karmaşıklığı artırıyor.
10. **frontend/src/shared/lib/stores/cuttingListStore.ts** – (raporda belirtilen) büyük Zustand store yüzeyi, çoklu mutasyon fonksiyonları ve tipi karmaşık eylemler; TS hataları kompleksitenin göstergesi.

**Parçalama önerileri:** Algoritma kayıtlarını ayrı konfigürasyon dosyalarına taşımak, rota registry’lerini modül bazlı bölmek, wizard’ı adım bazlı alt bileşen/state makineleriyle ayrıştırmak, API client interceptors’u daha küçük helper’lara bölmek ve monitoring/dashboard sorgularını repository seviyesinde soyutlamak.

## 5. Performans ve ölçeklenebilirlik riskleri

- **Algoritmalar**: FFD/BFD/GA/Pooling O(n²), PatternExact O(2^n); büyük kesim listelerinde CPU/bellek tüketimi artar. Hybrid pattern üretimi ve Pareto filtreleme adımları kombinasyonel patlamaya açık.
- **I/O & DB**: Statistics/dashboard uçları çoklu sayım ve grup sorguları çalıştırıyor; indeks yoksa P95/P99 artabilir. Query monitoring bellekte örneklem tutuyorsa yüksek trafikte memory footprint büyür. Export servisleri (Excel/PDF) büyük dosyalarda FS I/O baskısı yaratabilir.
- **Middleware zinciri**: Tüm isteklerde audit + şifreleme + ETag + morgan çalışması yüksek TPS’de CPU maliyeti getirir; CORS whitelist kontrolü dinamik olduğu için log spam riski var.
- **Frontend**: Wizard ve cutting list store büyük listelerde render thrash yaratabilir; 2 dakikalık axios timeout bekleyen istekleri biriktirir. Chart/dash bileşenleri büyük veri setlerinde memoization olmadan yeniden hesaplama yapabilir.
- **GPU/NSGA-II**: GPU destekli genetik algoritma ve NSGA-II çok iterasyonlu; uygun kısıtlar (max generations/population) olmadan uzun sürebilir, kuyruklama gerekebilir.

## 6. Test coverage ve kalite borcu

- **Backend**: 40 API testinin yalnızca %30’u geçiyor; enterprise optimization, production plans, statistics ve health/metrics uçlarında başarısızlıklar mevcut. Bu alanlar için entegrasyon testleri ve contract testleri öncelikli.
- **Frontend**: TypeScript derlemesi kritik hatalarla duruyor (cuttingListStore, exportUtils, modernPDFExport); build kırık. UI akışları için E2E (Playwright/Cypress) eksik, özellikle wizard/dash sayfaları test edilmemiş.
- **E2E/Load**: Optimization ve dashboard uçları için yük testleri yok; uzun süreli algoritma çalışmaları ve büyük liste import senaryoları için kısıt testleri önerilir.
- **CI/Lint/Security**: Lint/format komutları tanımlı ancak bağımlılık güncelliği ve güvenlik uyarıları takip edilmeli; pipeline’a TypeScript strict build, lint, test ve dependency audit adımları eklenmeli.
