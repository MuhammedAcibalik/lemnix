# 📚 LEMNİX Dokümantasyon

**Versiyon:** 5.0.0  
**Son Güncelleme:** 2025-11-09

---

## 🎯 Hızlı Başlangıç

1. **[Proje Yapısı](./PROJE_YAPISI.md)** - Mimari ve klasör yapısı
2. **[Production Hazırlık](./PRODUCTION_READY_GUIDE.md)** - Canlıya alma rehberi
3. **[Optimizasyon Rehberi](./ENTERPRISE_OPTIMIZATION_GUIDE_DETAILED.md)** - Algoritma ve kullanım

---

## 📖 Ana Dokümantasyon

### **Mimari & Yapı**
- **[PROJE_YAPISI.md](./PROJE_YAPISI.md)** - Backend/Frontend yapısı, FSD, Clean Architecture
- **[COMPREHENSIVE_PROJECT_ANALYSIS.md](./COMPREHENSIVE_PROJECT_ANALYSIS.md)** - Kapsamlı proje analizi ve teknoloji stack detayları

### **Optimizasyon**
- **[ENTERPRISE_OPTIMIZATION_GUIDE_DETAILED.md](./ENTERPRISE_OPTIMIZATION_GUIDE_DETAILED.md)** - Detaylı algoritma açıklamaları, matematiksel formüller, kullanım senaryoları

### **Deployment & Production**
- **[PRODUCTION_READY_GUIDE.md](./PRODUCTION_READY_GUIDE.md)** - Production checklist, güvenlik, performans optimizasyonu

---

## 🗄️ Arşiv

Geçmiş analizler, değişiklik notları ve uygulama logları `archive/` klasöründe organize edilmiştir:

### Analiz Raporları (`archive/analysis/`)
- Kesim listesi analizleri ve teknik özellikler
- Backend-Frontend alignment analizleri
- Paket güvenlik ve bağımlılık analizleri
- Erişilebilirlik ve API validasyon auditleri

### Uygulama Logları (`archive/implementation-logs/`)
- Feature implementasyon notları (Genetic Algorithm, Dashboard v2, etc.)
- Öncelikli düzeltme logları
- Bug fix raporları

### Migrasyon Rehberleri (`archive/migration-guides/`)
- Veritabanı migrasyonu (SQLite → PostgreSQL)
- GPU hızlandırma session özeti
- Kesim listesi migrasyon rehberi

---

## 🚀 Geliştirme

### **Kurulum**
```bash
npm run install:all
```

### **Development**
```bash
npm run dev  # Backend + Frontend birlikte
```

### **Build**
```bash
npm run build  # Production build
```

### **Linting**
```bash
npm run lint    # Tüm proje
npm run format  # Code formatting
```

---

## 🏗️ Teknoloji Stack

### **Backend**
- TypeScript 5.9+
- Node.js 20+
- Express.js
- Prisma ORM
- WebGPU (Genetic Algorithm)

### **Frontend**
- React 19
- TypeScript 5.9+
- Vite 7+
- Material-UI
- TanStack Query
- Zustand
- Feature-Sliced Design (FSD)

---

## 📋 Prensip ve Kurallar

1. **SOLID Prensipleri** - Her modülde strict
2. **TypeScript Strict Mode** - `any` yasak
3. **Feature-Sliced Design** - Frontend mimarisi
4. **Clean Architecture** - Backend katmanları
5. **Test Yok** - Memory'de belirtilmiş

---

## 🔗 Bağlantılar

- [Ana README](../README.md)
- [Frontend Dokümantasyon](../frontend/)
- [Backend Dokümantasyon](../backend/)

---

**LEMNİX Team** | 2025

