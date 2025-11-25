# Lemnix Monorepo Derinlemesine Analiz Raporu

## 1. Genel mimari (katmanlar, modüller, paketler)
### Monorepo yapısı
- Kök README, iki ana uygulamayı (`backend/`, `frontend/`) ve kapsamlı dokümantasyonu listeliyor; backend için controllers/services/routes/middleware ayrımı, frontend için FSD (app/pages/shared/entities/features/widgets) vurgusu yapılmış durumda.【F:README.md†L74-L118】

### Backend katmanları
- **Sunucu & middleware zinciri:** `createApp` helmet, CORS, sıkıştırma, correlation-id, audit, şifreleme ve ETag middleware’lerini uygulayıp rotaları kaydediyor; kök `/`, sağlık (`/health`, `/readyz`) ve 404/error handler’ları burada tanımlı.【F:backend/src/server/createApp.ts†L1-L270】
- **Routes → Controllers:** Enterprise optimizasyonu, cutting-list, dashboard, statistics, suggestions, production-plan vb. rotalar `registerRoutes` içinde mount ediliyor ve her biri ilgili controller’lara delege ediliyor.【F:backend/src/server/createApp.ts†L216-L231】
- **Controllers:** Örn. `EnterpriseOptimizationController` servisleri DI ile kurup optimizasyon, analytics, health ve export handler’larını expose eden ince bir yönlendirme katmanı sunuyor.【F:backend/src/controllers/enterpriseOptimizationController.ts†L1-L149】
- **Services:** Optimizasyon (FFD/BFD/GA/NSGA-II, GPU), monitoring, suggestions, export, profile yönetimi, production plan vb. alt dizinlerde toplanmış. Örn. UnifiedSuggestionService ML tabanlı skorlayıcı + Redis cache + Prisma’yı tekilleştiriyor.【F:backend/src/services/suggestions/UnifiedSuggestionService.ts†L1-L120】
- **Repositories/DB:** Prisma şeması cutting list, optimization, profile ve istatistik tablolarını; indeksleri ve ilişkileri tanımlıyor.【F:backend/prisma/schema.prisma†L10-L200】

### Frontend katmanları (FSD)
- `src/app` bootstrapping, `pages` sayfa girişleri, `widgets` (örn. enterprise-optimization-wizard), `features` ve `entities` domain odaklı bloklar, `shared` ise axios istemcisi, tasarım sistemi ve util’leri içeriyor.【F:README.md†L95-L111】
- Ortak API istemcisi axios tabanlı olup auth/correlation-id ekleyen, circuit breaker ve toast entegre interceptors ile geliyor.【F:frontend/src/shared/api/client.ts†L1-L200】

## 2. Domain kavramları ve bounded context’ler
### Cutting list / iş emri yönetimi
- Controller, PDF/Excel export, profil önerileri ve Prisma repository ile zengin CRUD yüzeyi sağlıyor (4k+ satır).【F:backend/src/controllers/cuttingListController.ts†L1-L70】
- DB şeması `CuttingList`, `CuttingListItem`, `CuttingListStatistics` modelleri ve `CuttingListStatus`/`ItemPriority` enumlarıyla statü, öncelik ve metrikleri ilişkilendiriyor.【F:backend/prisma/schema.prisma†L10-L166】

### Optimization (FFD/BFD/GA/NSGA-II, GPU)
- Enterprise controller, AdvancedOptimizationService + Profile/Performance servislerini handler’lara enjekte ederek klasik, pareto, profile-based ve compare modlarını sunuyor.【F:backend/src/controllers/enterpriseOptimizationController.ts†L38-L149】
- Algoritma karmaşıklıkları ve kullanım senaryoları dokümante: FFD/BFD/WFD O(n log n), NFD O(n), Genetic O(g×p×n), SA O(i×n²), Branch&Bound O(2^n).【F:docs/ENTERPRISE_OPTIMIZATION_GUIDE_DETAILED.md†L34-L75】【F:docs/ENTERPRISE_OPTIMIZATION_GUIDE_DETAILED.md†L345-L351】
- GPU / WebGPU akışı için ayrı `webgpuRoutes` ve `GPUEvolutionService` (1.2k+ satır) bulunuyor.【F:backend/src/server/createApp.ts†L216-L231】【194eaf†L8-L13】

### Suggestions, Statistics/Dashboard/Monitoring
- UnifiedSuggestionService tekil instance ile ürün/ölçü/profil/kombo önerileri üretip scoring + cache katmanlarını kullanıyor.【F:backend/src/services/suggestions/UnifiedSuggestionService.ts†L6-L120】
- Monitoring konteksi `enterpriseMonitoringService` içinde sistem sağlığı, metrik ve alert modellemeleriyle ayrışmış (health/metrics rotaları controller’dan erişiliyor).【F:backend/src/services/monitoring/enterpriseMonitoringService.ts†L1-L120】【F:backend/src/controllers/enterpriseOptimizationController.ts†L121-L149】
- Statistics/Dashboard rotaları `registerRoutes` üzerinden mount edilerek cutting list/optimization verilerini raporluyor.【F:backend/src/server/createApp.ts†L216-L231】

### Stok & profil yönetimi, Access/Auth
- Prisma’da `StockLength`, `ProfileType` ve `ProfileUsageStatistics` modelleri stok boyları, profil tipleri ve kullanım istatistiklerini tutuyor.【F:backend/prisma/schema.prisma†L130-L185】
- Route seviyesinde rate limit + permission middleware (enterpriseOptimizationRoutes) ve token doğrulama kancaları kullanılıyor; axios istemcisi auth header’ı otomatik ekliyor.【F:backend/src/routes/enterpriseOptimizationRoutes.ts†L1-L80】【F:frontend/src/shared/api/client.ts†L116-L143】

## 3. Veri akışı (UI → API → Service → DB)
- **UI (Wizard):** Enterprise wizard seçili cutting list öğelerini isteğe dönüştürüp `/api/enterprise/optimize` veya `/optimize/pareto` uçlarına POST ediyor, request body’e algoritma parametreleri, maliyet modeli ve profil parametrelerini ekliyor.【F:frontend/src/widgets/enterprise-optimization-wizard/index.v2.tsx†L260-L380】【F:frontend/src/widgets/enterprise-optimization-wizard/index.v2.tsx†L333-L419】
- **Axios Client:** Tüm istekler correlation-id ve Bearer token ile gönderiliyor, FormData/JSON’a göre Content-Type ayarlanıyor; circuit breaker ve global toast entegrasyonu response error interceptor’da yönetiliyor.【F:frontend/src/shared/api/client.ts†L96-L200】
- **Backend middleware zinciri:** Helmet/CORS/compression → correlationId + requestTiming → audit/encryption/etag → logger → route kayıtları; sağlık ve root endpoint’ler burada yanıtlanıyor.【F:backend/src/server/createApp.ts†L66-L231】
- **Service/Handler katmanı:** Enterprise routes, controller içindeki OptimizationHandler/MetricsHandler/HealthHandler/ExportHandler’a delege edilerek AdvancedOptimizationService (algoritma seçimi), monitoring ve profile optimizasyon servislerine yönleniyor.【F:backend/src/controllers/enterpriseOptimizationController.ts†L38-L149】
- **DB erişimi:** Prisma modelleri cutting list, optimization, profile/stok ve istatistik tablolarına indeksli erişim sağlıyor; kayıtlar ilişkisel olarak kullanıcıya bağlanıyor.【F:backend/prisma/schema.prisma†L26-L200】

## 4. En karmaşık dosyalar ve nedenleri
- **cuttingListController.ts (4340 satır):** Multi-export (PDF/Excel), profil önerileri, istatistik, validation ve dosya işlemlerini aynı dosyada barındırdığı için God-class riski yüksek; servis + alt controller’lara bölünebilir.【F:backend/src/controllers/cuttingListController.ts†L1-L70】【194eaf†L3-L9】
- **BFDAlgorithm.ts (3139 satır) & FFDAlgorithm.ts (1644 satır):** Geniş helper seti, yerleştirme stratejileri ve logging içeren monolitik algoritma implementasyonları; heuristic/utility modüllerine ayrıştırılabilir.【194eaf†L3-L8】
- **GeneticAlgorithm.ts (2449 satır) & advanced/NSGAII.ts (1786 satır):** Popülasyon yönetimi, mutasyon/çaprazlama, pareto hesapları ve parametre ayarları tek dosyada; operator ve fitness hesaplarını ayrı modüllere taşımak okunabilirliği artırır.【194eaf†L3-L8】
- **excelAnalyzer.ts (2074 satır):** Dosya okuma/validasyon/istatistik çıkarımı tek yerde; parser, validator ve aggregator katmanlarına bölmek hataları izole eder.【194eaf†L3-L8】
- **CuttingListRepository.ts (1298 satır):** Çok kapsamlı sorgular, filtreleme ve toplu güncellemeler repository’de toplanmış; sorgu nesnelerini küçük DAO’lara bölmek karmaşıklığı düşürür.【194eaf†L7-L9】
- **UnifiedSuggestionService.ts (1267 satır):** Cache, skorlayıcı, repository etkileşimleri ve farklı öneri tipleri tek sınıfta; feature-specifik servisler ve strateji pattern’i ile parçalara ayrılabilir.【194eaf†L8-L10】【F:backend/src/services/suggestions/UnifiedSuggestionService.ts†L1-L120】
- **GPUEvolutionService.ts (1227 satır):** GPU shader hazırlığı, popülasyon evrimi ve CPU fallback’leri aynı dosyada; shader setup ile algoritma mantığı ayrılmalı.【194eaf†L10-L12】
- **enterpriseMonitoringService.ts (991 satır):** Health/alert/metric modelleri ve runtime izlemesi tek dosyada; sağlık kontrolü, metrik toplayıcı ve alerting modülleri ayrıştırılabilir.【194eaf†L11-L12】【F:backend/src/services/monitoring/enterpriseMonitoringService.ts†L1-L120】
- **statisticsController.ts (988 satır):** Çoklu istatistik uçları (color-size, profile, work-order, efficiency) tek controller’da; alt controller’lara bölmek bakım maliyetini azaltır.【194eaf†L11-L13】
- **selectionLogRoutes.ts (903 satır):** Route tanımı + handler mantığı birlikte; middleware ve handler’ları ayrı dosyalara taşımak okunabilirliği artırır.【194eaf†L13-L15】
- **frontend ResultsStep.tsx / DetailedSelectionDialog.tsx / ParametersStep.tsx / wizard index.v2.tsx (1755/1743/1234/1077 satır):** Adım bazlı wizard yönetimi, form state ve API çağrıları tek bileşende toplanmış; alt bileşen ve hook’lara bölme karmaşıklığı azaltır.【44955a†L3-L11】

## 5. Performans ve ölçeklenebilirlik riskleri
- **Algoritmik karmaşıklık:** FFD/BFD/WFD O(n log n), Genetic O(g×p×n), SA O(i×n²), Branch&Bound O(2^n) — büyük parça setlerinde CPU süresi hızla artar; pareto ve GA modlarında iterasyon/popülasyon parametreleri sınırlandırılmalı.【F:docs/ENTERPRISE_OPTIMIZATION_GUIDE_DETAILED.md†L345-L351】
- **I/O & middleware:** createApp’te her isteğe helmet + encryption + audit + ETag çalışıyor; yüksek TPS’de latency ekleyebilir, statik içerikler için bypass gerekebilir.【F:backend/src/server/createApp.ts†L146-L231】
- **Repository yoğunluğu:** CuttingListRepository’nin büyük API yüzeyi (1298 satır) karmaşık Prisma sorgularında N+1 veya indeks dışı taramalara neden olabilir; schema’daki GIN indeksleri kritik ama sorgu planı takibi yapılmalı.【194eaf†L7-L9】【F:backend/prisma/schema.prisma†L61-L125】
- **Monitoring footprint:** enterpriseMonitoringService çok sayıda metrik/alert saklıyor; bellekte tarihçeyi sınırlandırmak ve streaming/export mekanizması eklemek gerekebilir.【F:backend/src/services/monitoring/enterpriseMonitoringService.ts†L1-L120】
- **Frontend büyük listeler:** Wizard bileşenleri seçilen cutting list’i tümüyle memory’ye alıp nested `flatMap` ile işliyor; büyük listelerde render ve ağ yükü artar, sayfalama/chunking eklenmeli.【F:frontend/src/widgets/enterprise-optimization-wizard/index.v2.tsx†L260-L339】
- **Uzun süreli istekler:** Axios timeout 120s olarak ayarlı; GA/pareto çağrılarında tarayıcıda bekleyen fetch/axios çağrıları birikebilir, backend’de rate-limit ve queue katmanı önerilir.【F:frontend/src/shared/api/client.ts†L96-L111】【F:backend/src/routes/enterpriseOptimizationRoutes.ts†L1-L80】

## 6. Test coverage ve kalite borcu
- Otomasyon raporuna göre 40 API testinin yalnızca %30’u geçiyor (28 başarısız); enterprise optimization, production plan, statistics ve health/metrics uçları kırmızı durumda.【F:TESTING_REPORT.md†L11-L86】
- Frontend build’i kritik TypeScript hataları nedeniyle derlenemiyor; `cuttingListStore.ts`, `exportUtils.ts`, `modernPDFExport.ts` dosyalarında onlarca tip hatası bildiriliyor.【F:TESTING_REPORT.md†L91-L110】
- CI kalitesi: raporda dependency güncellemeleri (multer, supertest) ve tutarlı hata yanıtları için iyileştirme önerileri yer alıyor; lint/format komutları mevcut olsa da build blokajları nedeniyle uygulanabilirlik sınırlı.【F:TESTING_REPORT.md†L128-L183】
- E2E/load test ihtiyacı: sayfa testlerinin yapılmadığı ve entegrasyon kapsamının düşük olduğu belirtilmiş; özellikle wizard → optimize → sonuç akışı ve üretim planı süreçleri için uçtan uca senaryolar eklenmeli.【F:TESTING_REPORT.md†L111-L171】
