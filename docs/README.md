# 📚 LEMNİX Dokümantasyon

**Versiyon:** 5.0.0  
**Son Güncelleme:** 2025-01-05

---

## 🎯 Hızlı Başlangıç

1. **[Proje Yapısı](./PROJE_YAPISI.md)** - Mimari ve klasör yapısı
2. **[Production Hazırlık](./PRODUCTION_READY_GUIDE.md)** - Canlıya alma rehberi
3. **[Optimizasyon Rehberi](./ENTERPRISE_OPTIMIZATION_GUIDE_DETAILED.md)** - Algoritma ve kullanım

---

## 📖 Ana Dokümantasyon

### **Mimari & Yapı**
- [PROJE_YAPISI.md](./PROJE_YAPISI.md) - Backend/Frontend yapısı, FSD, Clean Architecture

### **Optimizasyon**
- [ENTERPRISE_OPTIMIZATION_GUIDE_DETAILED.md](./ENTERPRISE_OPTIMIZATION_GUIDE_DETAILED.md) - Detaylı algoritma açıklamaları
- [ENTERPRISE_OPTIMIZATION_GUIDE.md](./ENTERPRISE_OPTIMIZATION_GUIDE.md) - Hızlı referans

### **Deployment**
- [PRODUCTION_READY_GUIDE.md](./PRODUCTION_READY_GUIDE.md) - Production checklist, güvenlik, performans

---

## 🗄️ Arşiv

Eski değişiklikler ve araştırmalar `archive/` klasöründe:

- [CHANGES.md](./archive/CHANGES.md) - Eski değişiklik notları
- [CRITICAL_FIXES_v4.2.md](./archive/CRITICAL_FIXES_v4.2.md) - v4.2 kritik düzeltmeler
- [REFACTOR_FIXES.md](./archive/REFACTOR_FIXES.md) - Refactoring notları
- [OPTIMIZATION_SERVICE_ANALYSIS.md](./archive/OPTIMIZATION_SERVICE_ANALYSIS.md) - Eski servis analizi
- [gpu-research-report.md](./archive/gpu-research-report.md) - GPU araştırması

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

