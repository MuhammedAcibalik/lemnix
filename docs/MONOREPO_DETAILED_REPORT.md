# Lemnix Monorepo Derin Analiz Raporu

## 1. Genel mimari (katmanlar, modüller, paketler)
### Monorepo yapısı
- **Kapsam:** Tek repoda `backend/` (Express + Prisma + TypeScript) ve `frontend/` (React + Vite + FSD) alt uygulamaları bulunuyor. `docs/` klasörü mimari, optimizasyon ve kalite raporlarını barındırıyor; kök düzeyde çok sayıda özet ve rapor dosyası mevcut. README hem monorepo kök yapısını hem de çift uygulama kurulum komutlarını sunuyor.【F:README.md†L75-L134】
- **Teknoloji yığını:** Backend için Node.js 20, TypeScript 5.9, Express 4.18, Prisma + SQLite; frontend için React 18/19 hedefi, MUI 5/6, Vite 7, Zustand ve TanStack Query. Kod kalitesi araçları olarak ESLint/Prettier, TS strict mod yer alıyor.【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L17-L62】

### Backend katmanları
- **controllers/** HTTP isteklerini karşılayan handler katmanı; Clean Architecture çizgisinde servisleri çağırıyor.【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L79-L98】
- **routes/** REST endpoint tanımları ve middleware bağlama noktası.【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L88-L98】
- **middleware/** Güvenlik (Helmet, CORS, rate limiting), korelasyon kimliği, hata maskeleme ve zamanlayıcı middleware zinciri.【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L260-L312】
- **services/** İş mantığı katmanı; alt modüller: `analysis/` (istatistikler), `optimization/` (FFD, BFD, GA, Pooling), `export/` (PDF/Excel), `monitoring/` (telemetri), `enterprise-*` (kurumsal işlemler), `policies/` (doğrulama).【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L80-L88】【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L155-L199】
- **repositories/utils/config/server** Katmanları Readme’de proje yapısı ve Prisma şemasıyla belgelenmiş; veritabanı erişimi çoğunlukla servislerde Prisma ile yapılırken config ve utils çapraz kullanılabilir yardımcıları sağlıyor.【F:README.md†L75-L134】【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L335-L360】

### Frontend katmanları (FSD)
- **app/** Uygulama bootstrapping, provider ve router kurulumları.【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L110-L138】
- **pages/** Route düzeyi sayfalar (Home, Statistics, vb.).【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L117-L134】
- **widgets/** Kompleks UI blokları: enterprise optimization wizard, cutting-list builder, statistics dashboard, navigation.【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L120-L125】
- **features/** Kullanıcı eylemleri ve akışları: algoritma karşılaştırma, export, webgpu ayarları.【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L125-L129】
- **entities/** Domain odaklı modüller: optimization, statistics, cutting-list API ve modelleri.【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L129-L133】
- **shared/** UI kütüphanesi, API istemcisi, yardımcı lib ve config; public API pattern ve tasarım sistemi ile servisler arasında tekrar kullanılabilir yapı.【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L133-L138】【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L140-L152】

## 2. Domain kavramları ve bounded context’ler
### Cutting list / iş emri yönetimi
- **Sorumluluk:** Kesim listesi CRUD’u, iş emri kalemleri, profil/ölçü kombinasyonları, fire/efficiency hesaplamaları; görsel kesim planı ve export entegrasyonu.
- **Modeller:** `CuttingList`, `CuttingListItem`, kesim planı ve segmentleri; Prisma şemasında JSON alanları (sections/parameters) içeriyor.【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L337-L360】
- **Kritik rotalar:** `/api/cutting-list` CRUD uçları, `/api/statistics/work-order-analysis` ile ilişkilendirilmiş analizler.【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L368-L385】

### Optimization (FFD/BFD/GA/NSGA-II, GPU)
- **Sorumluluk:** Çoklu algoritma seçimi (FFD, BFD, GA, pooling), Pareto/elitist filtreleme, pattern üretimi; bazı GPU/WebGPU yolları dokümante edilmiş olsa da GPU modu kapalı raporlanmış.
- **Algoritma özellikleri:** FFD/BFD O(n log n); Genetic Algorithm O(P×n²×g) karmaşıklık, adaptif mutasyon ve elitizm; WebGPU path’in devre dışı olduğu biliniyor.【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L155-L199】
- **Kritik rotalar:** `/api/enterprise/optimize`, `/api/enterprise/compare`, WebGPU için `/api/webgpu/status` ve `/api/webgpu/optimize`.【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L375-L389】

### Suggestions, Statistics/Dashboard/Monitoring
- **Sorumluluk:** Akıllı öneriler (profil/ölçü/ürün), kesim listesi ve iş emri bazlı istatistikler, performans izleme ve metrik toplama.
- **Modeller:** Prisma tarafında `CuttingListStatistics`, `WorkOrderStatistics`, `ProfileUsageStatistics`, `OptimizationStatistics`, `SystemMetrics`, `UserActivity` tabloları ile veri saklanıyor.【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L337-L349】
- **Kritik rotalar:** `/api/statistics/batch`, `color-size-analysis`, `profile-analysis`, `work-order-analysis` uçları ve monitoring sağlık kontrolleri.【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L380-L389】

### Stok & profil yönetimi, Access/Auth
- **Sorumluluk:** Stok uzunlukları, profil tipleri ve kullanıcı erişim modeli; README’de JWT tabanlı auth ve RBAC vurgulanmış olsa da güvenlik raporunda auth/authorization’ın eksik ya da opsiyonel olduğu belirtiliyor.【F:README.md†L114-L166】【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L260-L292】
- **İlişkiler:** İş emirleri ve kesim planları profil tipleriyle bağlanıyor; kullanıcı aksiyonu izleme `UserActivity` tablosu üzerinden izlenebilir durumda.【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L337-L349】

## 3. Veri akışı (UI → API → Service → DB)
- **1) UI (Enterprise optimization wizard):** Wizard, kesim listesi ve ayarları toplayıp Axios tabanlı `api` istemcisi üzerinden `/enterprise/optimize` ve `cutting-list` uçlarına istek gönderir; FSD katmanında widget→feature→entity→shared/api yönünde bağımlılık akışı vardır.【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L110-L138】【F:README.md†L75-L134】
- **2) Axios client interceptors:** İstek öncesi auth/correlation-id ekler, timeout/circuit-breaker ve global hata tostlarını yönetir (shared/api katmanının sorumluluğu).【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L140-L152】
- **3) Backend middleware zinciri:** Helmet, CORS, rate-limit, korelasyon ID, timing ve hata maskeleme middleware’leri her isteğe uygulanır; JSON/form payload doğrulaması ve Zod şemaları sınırda çalışır.【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L260-L312】
- **4) Controller → Service:** İstekler ilgili controller’da parse edilip servis katmanına aktarılır; optimizasyon istekleri algoritma seçimi yapan servislerle, kesim listesi istekleri CRUD/analiz servisleriyle yürütülür.【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L79-L99】【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L155-L199】
- **5) Repository/DB:** Servisler Prisma ORM ile `CuttingList`, istatistik ve optimizasyon tablolarına erişir; JSON alanlar nedeniyle bazı sorgular sınırlı, SQLite kullanımı eşzamanlı yazımlar için potansiyel dar boğazdır.【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L335-L360】
- **6) Yanıt:** Servis çıktısı controller tarafından HTTP yanıtına dönüştürülür; React Query cache’i başarılı yanıtla güncellenir, wizard UI state’i güncellenerek kullanıcıya plan/istatistik görselleri sunulur.【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L140-L152】

## 4. En karmaşık dosyalar ve nedenleri
Aşağıdaki liste, dokümantasyonda belirtilen yüksek sorumluluk yoğunluğu, satır/fonksiyon sayısı ve algoritmik zorluklar dikkate alınarak seçilmiştir.
1. **backend/src/services/optimization/AdvancedOptimizationService.ts** – Çoklu algoritma kaydı, profil çözümleme, maliyet/constraint varsayılanları ve NSGA-II/GA orkestrasyonu yüksek karmaşıklık oluşturuyor.【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L155-L199】
2. **backend/src/services/optimization/CuttingOptimizer.ts** – Normalizasyon, stok eşleme, Pareto filtreleme ve logging zinciri veri dönüşümlerini yoğunlaştırıyor.【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L155-L199】
3. **backend/src/controllers/cuttingListController.ts** – Rapor, 2857 satırla “god class” niteliğinde; CRUD, analiz ve export sorumluluklarının tek dosyada toplanması parçalamayı zorunlu kılıyor.【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L236-L239】
4. **backend/src/routes/cuttingListRoutes.ts** – Dinamik rota kaydı, rate limit/yetkilendirme bağlama ve async hata sarmalayıcıları okunabilirliği düşürüyor.【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L88-L99】
5. **backend/src/server/createApp.ts** – Bootstrap’te güvenlik, performans ve sağlık rotalarını aynı anda yapılandırıyor; geniş konfigürasyon yüzeyi karmaşıklaşma yaratıyor.【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L260-L312】
6. **backend/src/services/monitoring/dashboardServiceV2.ts** – Çoklu Prisma sorgusu, tarih aralığı yönetimi ve KPI hesapları nedeniyle yüksek sorgu ve koşul yoğunluğu var.【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L296-L333】
7. **backend/src/services/suggestions/UnifiedSuggestionService.ts** – Cache + skorlayıcı + repo kombinasyonu ve istatistik üretimi SRP’yi zorluyor.【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L337-L349】
8. **backend/src/services/monitoring/QueryPerformanceMonitor.ts** – Sürekli izleme döngüsü, P95/P99 hesapları ve bellek yönetimi concurrency karmaşığı ekliyor.【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L296-L333】
9. **frontend/src/shared/api/client.ts** – İstek/yanıt interceptors, auth token ve circuit breaker entegrasyonu ile hata akışlarının çok dallı olması karmaşıklığı artırıyor.【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L140-L152】
10. **frontend/src/widgets/enterprise-optimization-wizard/index.v2.tsx** – Çok adımlı wizard state’i, algoritma modu ve API çağrıları UI kontrol karmaşığı yaratıyor.【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L120-L125】【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L140-L152】

**Parçalama önerileri:** God-class controller’ı CRUD/analiz/export alt controller’lara bölmek; optimizasyon servislerini algoritma başına modüllere ayırıp strateji/fabrika deseniyle bağlamak; monitoring/suggestion servislerinde cache ve hesaplama katmanlarını ayrı dosyalara taşımak; wizard ve API client’ı daha küçük hook ve utility’lere bölmek.

## 5. Performans ve ölçeklenebilirlik riskleri
- **Algoritmalar:** GA’nin O(P×n²×g) karmaşıklığı büyük kesim listelerinde CPU süresini artırır; WebGPU yolu kapalı olduğundan yüksek iş yüklerinde kuyruğa alınmış batch işlem veya asenkron işleyici gerekir. FFD/BFD hızlı olsa da çok büyük n için sıralama maliyeti O(n log n) kalır.【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L155-L199】
- **DB/I/O:** SQLite tek dosya ve eşzamanlı yazım sınırlamaları nedeniyle yüksek TPS altında dar boğaz oluşturur; JSON alanlar sorgu optimizasyonunu zorlaştırır, indeks eksikliği riskini artırır.【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L335-L360】
- **Monitoring:** QueryPerformanceMonitor bellek içinde çok sayıda sorgu metriklerini tutar; cleanup tek thread’de olduğundan hafıza büyümesi risklidir.【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L296-L333】
- **Frontend:** Wizard ve büyük kesim listeleri render sırasında re-render patlamaları yaratabilir; bazı legacy widget’lar lazy-load edilmediği için bundle büyüklüğü ve ilk yükleme süresi artabilir.【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L140-L152】【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L314-L327】
- **Ağ:** Axios timeout ve global middleware zinciri (Helmet, compression, ETag) yüksek TPS’de CPU yükü oluşturabilir; rate limit olmadan uzun süren optimize istekleri API thread havuzunu tüketebilir.【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L260-L312】

## 6. Test coverage ve kalite borcu
- **Backend:** Vitest + Supertest tanımlı olsa da coverage bilgisi eksik; raporlar test klasörünün zayıf olduğunu, birçok endpoint testinin başarısız olduğunu vurguluyor. TypeScript strict modda bazı kurallar (`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`) devre dışı bırakılmış.【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L204-L228】【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L236-L240】
- **Frontend:** Test dosyaları bulunmuyor; React 19 geçişi tamamlanmamış, legacy bileşenler devam ediyor ve performans optimizasyonu/bundle analizi raporu eksik.【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L39-L62】【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L140-L152】【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L314-L327】
- **E2E/Load Test ihtiyacı:** Optimizasyon algoritmaları ve wizard akışları için uçtan uca testler yok; yüksek hacimli kesim listelerinde GA/Prisma performansını ölçen load test senaryoları eklenmeli.【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L296-L333】
- **CI/Lint/Security:** ESLint/Prettier mevcut ancak CI’de coverage hedefi, dependency güncelliği ve JWT/RBAC zorunluluğu tanımlanmamış; auth eksikliği güvenlik riskini artırıyor.【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L260-L292】【F:docs/COMPREHENSIVE_PROJECT_ANALYSIS.md†L260-L312】

---

Bu rapor, mevcut dokümantasyon ve mimari özetlere dayanarak monorepo genelinde katmanlar, domain bounded context’ler, veri akışı, karmaşıklık alanları, performans riskleri ve kalite durumunu bütünleşik bir görünümde sunar.
