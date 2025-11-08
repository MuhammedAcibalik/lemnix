# Frontend - Hybrid Algorithm Quick Start Guide

## 🚀 Hemen Test Et!

### 1. Frontend'i Başlat

```bash
cd frontend
npm run dev
```

Tarayıcıda:
```
http://localhost:3000
```

---

### 2. Enterprise Optimization Wizard'a Git

**Yöntem A** - Ana menüden:
```
Ana Sayfa → [⚡ Enterprise Optimization] butonu → Tıkla
```

**Yöntem B** - Direct URL:
```
http://localhost:3000/enterprise-optimization
```

**Yöntem C** - Command Palette:
```
Ctrl + K → "Enterprise" yaz → Enter
```

---

### 3. Parameters Tab'a Git (Tab 2)

```
┌─────────────────────────────────────┐
│  Wizard Tabs (Üstte)                │
├─────────────────────────────────────┤
│  [Kesim Listesi]                    │
│  [PARAMETRELER] ← BURAYA TIKLA! 🎯  │
│  [Önizleme]                         │
│  [Sonuçlar]                         │
└─────────────────────────────────────┘
```

**NOT**: Önce Tab 1'de bir kesim listesi seçmen gerekiyor!

---

### 4. Algorithm Mode Selector'ı Gör

Scroll down yap, şunları göreceksin:

```
┌─────────────────────────────────────┐
│  🎯 Algoritma Seçimi                │
│  ⚡ First Fit Decreasing (FFD) [▼] │
└─────────────────────────────────────┘
          ↓ HEMEN ALTTA! ↓
┌─────────────────────────────────────┐
│  Algoritma Modu                     │  ← YENİ COMPONENT! 🎉
│  ┌──────┬──────┬──────┐             │
│  │Stand │Geliş │ Auto │             │
│  │[Öner]│      │      │             │
│  └──────┴──────┴──────┘             │
│                                     │
│  Özellikler:                        │
│  • Hızlı sonuç                      │
│  • Çoğu kullanıcı için yeterli      │
└─────────────────────────────────────┘
```

---

## 🔍 Console Debug Mesajları

Browser console'u aç (F12), şunları göreceksin:

### Component Render
```javascript
[AlgorithmModeSelector] Rendered: {
  value: 'standard',
  itemCount: 45,
  recommendedMode: 'standard',  // ≥30 items
  disabled: false
}
```

### Mode Değişikliği
```javascript
[AlgorithmModeSelector] Mode changed: advanced
[EnterpriseWizard] Algorithm mode updated: advanced
```

### Optimization Başladığında
```javascript
[EnterpriseWizard] Optimizing with mode: advanced
API endpoint: /api/enterprise/optimize/pareto
```

---

## 🎨 Görsel Özellikler

### Seçili Mode (Mavi Vurgu)

```css
Background: rgba(25, 118, 210, 0.16)  /* Açık mavi */
Border: 2px solid #1976d2             /* Koyu mavi */
Text Color: #1976d2                    /* Primary blue */
Icon Color: #1976d2                    /* Mavi */
```

### Seçili Değil (Neutral)

```css
Background: white
Border: 1px solid rgba(0, 0, 0, 0.12)
Text Color: #1e293b                    /* Siyah */
Icon Color: rgba(0, 0, 0, 0.54)       /* Gri */
```

### Hover Effect

```css
Background: rgba(25, 118, 210, 0.08)  /* Çok açık mavi */
Transition: 200ms smooth
```

### Önerilen Badge

```css
Chip: "Önerilen"
Background: transparent
Border: 1px solid #1976d2
Color: #1976d2
Font Size: 0.7rem (11px)
Height: 20px
```

---

## 📸 Screenshot Pozisyonları

### Full View (Tüm Wizard)
```
┌─────────────────────────────────────────────┐
│  Enterprise Optimization Wizard             │  ← Header (60px)
├─────────────────────────────────────────────┤
│  [Kesim]  [PARAMETRELER]  [Öniz]  [Sonuç]  │  ← Tabs (50px)
├─────────────────────────────────────────────┤
│                                             │
│  🎯 Algoritma Seçimi                        │  ← 80px
│  ⚡ FFD [dropdown]                          │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Algoritma Modu                     │   │  ← 180px (YENİ!)
│  │  [⚡Stand] [📊Gelişmiş] [✨Auto]     │   │
│  │  Özellikler: ...                    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  📊 Optimizasyon Hedefleri                  │  ← 200px
│  [x] Atık Min  [x] Verimlilik Max          │
│                                             │
│  🔧 Gelişmiş Ayarlar (Accordion)            │  ← Collapsible
│                                             │
└─────────────────────────────────────────────┘
Total Height: ~600px
```

---

## ⚡ Hızlı Test Senaryosu

### Senaryo 1: Küçük Liste (<30 item)

1. Kesim listesi seç: **"Test Listesi 1"** (20 item)
2. Parameters tab'a git
3. **Göreceksin**:
   - "Gelişmiş" modunda **"Önerilen"** badge ✅
   - Item count: 20 items < 30 → NSGA-II öneriliyor

```
[📊 Gelişmiş] ← "Önerilen" badge var!
```

### Senaryo 2: Büyük Liste (≥30 item)

1. Kesim listesi seç: **"Büyük Liste"** (50 item)
2. Parameters tab'a git
3. **Göreceksin**:
   - "Standart" modunda **"Önerilen"** badge ✅
   - Item count: 50 items ≥ 30 → GeneticAlgorithm öneriliyor

```
[⚡ Standart] ← "Önerilen" badge var!
```

### Senaryo 3: Mode Değiştir

1. "Advanced" moduna tıkla
2. Features list update olur:
   ```
   Özellikler:
   • Pareto front analizi        ← Yeni!
   • Maliyet vs fire karşılaştırması
   • Trade-off görselleştirme
   ```

3. "Optimize Et" butonuna bas
4. Backend'e gider: `/api/enterprise/optimize/pareto`
5. Sonuç: **Pareto front** (10-30 çözüm) 🎉

---

## 🐛 Görünmüyorsa Debug Adımları

### Adım 1: Console Log Kontrolü

Browser console'da (F12):

```javascript
// Bunu görmüyorsan component render olmuyor
[AlgorithmModeSelector] Rendered: { ... }
```

**Görmüyorsan**: `onAlgorithmModeChange` prop'u pass edilmemiş demektir.

### Adım 2: React DevTools ile Kontrol

React DevTools aç → Component tree:

```
EnterpriseOptimizationWizard
  └── TabPanel (index=1)
      └── ParametersStep
          ├── props.algorithmMode: "standard" ✅
          ├── props.onAlgorithmModeChange: fn() ✅
          └── props.itemCount: 45 ✅
              └── AlgorithmModeSelector
                  ├── value: "standard"
                  ├── onChange: fn()
                  └── itemCount: 45
```

**Göremiyorsan**: Props geçmemiş, wizard state'i kontrol et.

### Adım 3: Element Inspector

Sağ tık → Inspect element → Şunu ara:

```html
<div class="MuiBox-root">
  <p class="MuiTypography-subtitle1">Algoritma Modu</p>
  <div class="MuiToggleButtonGroup-root">
    <!-- 3 toggle button olmalı -->
  </div>
</div>
```

**Göremiyorsan**: CSS sorunuolabilir (height: 0 gibi).

---

## 📦 Dosya Konumları (Referans)

| Dosya | Lokasyon |
|-------|----------|
| **Selector Widget** | `frontend/src/widgets/algorithm-selector/ui/AlgorithmModeSelector.tsx` |
| **Entity Types** | `frontend/src/entities/algorithm/model/types.ts` |
| **Wizard Integration** | `frontend/src/widgets/enterprise-optimization-wizard/index.v2.tsx` |
| **Parameters Panel** | `frontend/src/widgets/enterprise-optimization-wizard/components/ParametersStep.tsx` |

---

## 🎬 Video Demo Senaryosu

### Sırala:

1. **0:00-0:05**: Ana sayfada → Enterprise Optimization butonu
2. **0:05-0:10**: Kesim listesi seç (Tab 1)
3. **0:10-0:15**: Parametreler tab'ına tıkla (Tab 2)
4. **0:15-0:20**: Scroll down → **Algorithm Mode Selector görünür** 🎯
5. **0:20-0:25**: "Gelişmiş" moduna tıkla
6. **0:25-0:30**: Features list güncellenir
7. **0:30-0:35**: "Optimize Et" butonu
8. **0:35-0:50**: Loading (10-15s)
9. **0:50-1:00**: **Pareto front sonuçları!** 🎉

---

## 💡 Önemli Notlar

1. **İlk render'da** "Standart" mode seçili olur (default)
2. **Item count < 30** ise "Gelişmiş" mode **"Önerilen"** badge alır
3. **Item count ≥ 30** ise "Standart" mode **"Önerilen"** badge alır
4. **Mode değişince** API endpoint de değişir:
   - Standard → `/api/enterprise/optimize`
   - Advanced → `/api/enterprise/optimize/pareto`
   - Auto → `/api/enterprise/optimize` (with `algorithmMode: 'auto'`)

5. **Advanced mode** seçersen:
   - ✅ NSGA-II çalışır
   - ✅ Pareto front (10-30 solution) alırsın
   - ✅ Knee point otomatik önerilir
   - ⏱️ 10-15 saniye sürer

---

## 🎉 Başarı Kriterleri

Component **doğru çalışıyorsa**:

- ✅ 3 toggle button görünüyor
- ✅ Seçili mode mavi vurgu alıyor
- ✅ Önerilen mode badge gösteriyor
- ✅ Features list dinamik değişiyor
- ✅ Estimated time her modda farklı
- ✅ Console'da debug log'lar var
- ✅ Mode değişince wizard state update oluyor

**Hepsini görüyorsan**: 🎊 Hybrid Algorithm sistemi **ÇALIŞIYOR**! 🎊

---

## 📞 Destek

Görünmüyorsa:

1. Console log'ları paylaş
2. React DevTools screenshot'u gönder
3. Hangi tab'dasın söyle (Tab 1/2/3/4?)
4. Kesim listesi seçtin mi?

---

**Implemented by**: AI Assistant  
**Date**: October 15, 2025  
**Next**: Phases 3-5 (Pareto visualization, help dialog, tests)

