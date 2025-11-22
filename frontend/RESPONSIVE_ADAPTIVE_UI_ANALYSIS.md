# Frontend Responsive & Adaptive UI Analizi
**Tarih:** 2024-12-XX  
**Durum:** ✅ Kapsamlı Analiz Tamamlandı | ✅ Breakpoint Standardizasyonu Tamamlandı

---

## 📊 Durum Özeti

### ✅ Tamamlanan İşler

1. **Breakpoint Standardizasyonu:**
   - ✅ Design System v3 breakpoints ana sistem olarak kullanılıyor
   - ✅ MUI theme Design System v3 breakpoints'e göre güncellendi
   - ✅ `xxl` ve `xxxl` breakpoints MUI theme'e eklendi
   - ✅ `useResponsive` hook Design System v3 breakpoints kullanıyor

2. **Hook Güncellemeleri:**
   - ✅ `useResponsive` hook MUI theme entegrasyonu tamamlandı
   - ✅ Hook dokümantasyonu güncellendi

3. **Dokümantasyon:**
   - ✅ Hook kullanım rehberi eklendi
   - ✅ Analiz dosyası güncellendi

### ⚠️ Devam Eden İşler

1. **Hook Konsolidasyonu:**
   - `useBreakpoint` backward compatibility için korunuyor
   - Yeni kod için `useResponsive` öneriliyor

2. **Documentation:**
   - Responsive pattern guide (gelecekte eklenecek)
   - Best practices dokümantasyonu (gelecekte eklenecek)

### 📋 Gelecek İşler

1. Zoom-Aware Audit (Fixed pixel değerleri)
2. Performance Optimization (Hook memoization)

---

## 📋 İçindekiler

1. [Breakpoint Sistemleri](#breakpoint-sistemleri)
2. [Responsive Hooks](#responsive-hooks)
3. [Adaptive UI (Zoom-Aware)](#adaptive-ui-zoom-aware)
4. [MUI Entegrasyonu](#mui-entegrasyonu)
5. [Component Yapıları](#component-yapıları)
6. [Sorunlar ve Öneriler](#sorunlar-ve-öneriler)
7. [Genel Değerlendirme](#genel-değerlendirme)

---

## 🔧 Breakpoint Sistemleri

### 1. FSD Breakpoint Sistemi (`shared/config/breakpoints.ts`)

**Tanım:**
```typescript
export const breakpoints = {
  mobile: 320,   // Mobile devices
  sm: 640,       // Small tablets
  tablet: 768,   // Tablets
  md: 768,       // Medium (alias for tablet)
  desktop: 1024, // Small laptops
  lg: 1024,      // Large (alias for desktop)
  wide: 1280,    // Desktop
  xl: 1280,      // Extra large (alias for wide)
  "2xl": 1536,   // Large desktop
}
```

**Kullanım:**
- ✅ FSD mimarisine uygun
- ✅ Mobile-first yaklaşım
- ✅ `useBreakpoint` hook ile entegre
- ✅ `getCurrentBreakpoint()` utility fonksiyonu

**Dosyalar:**
- `shared/config/breakpoints.ts`
- `shared/hooks/useBreakpoint.ts`
- `shared/utils/responsive.ts`

---

### 2. MUI Theme Breakpoints (`App/theme/designSystem.v3.ts`)

**Tanım:**
```typescript
export const breakpoints = {
  xs: 320,    // Mobile small (iPhone SE)
  sm: 480,    // Mobile large
  md: 768,    // Tablet
  lg: 1024,   // Laptop small
  xl: 1366,   // Desktop standard (HD)
  xxl: 1920,  // Desktop large (Full HD)
  xxxl: 2560, // Desktop ultra-wide (2K/QHD)
}
```

**MUI Theme Entegrasyonu:**
```typescript
breakpoints: {
  values: {
    xs: 320,
    sm: 480,
    md: 768,
    lg: 1024,
    xl: 1366,
  },
}
```

**Kullanım:**
- ✅ MUI component'leri ile entegre
- ✅ `useTheme().breakpoints` ile erişim
- ✅ `sx` prop'unda responsive değerler
- ✅ **ÇÖZÜLDÜ:** `xxl` ve `xxxl` MUI theme'e eklendi (theme.v3.ts)

**Dosyalar:**
- `App/theme/designSystem.v3.ts`
- `App/theme/theme.v3.ts`

---

### 3. MUI Standard Breakpoints (`useResponsive.ts`)

**Tanım:**
```typescript
// MUI Breakpoints (Material UI standard)
// xs: 0px
// sm: 600px
// md: 900px
// lg: 1200px
// xl: 1536px
```

**Kullanım:**
- ✅ `useResponsive` hook ile kullanılıyor
- ✅ Design System v3 breakpoint'leri kullanılıyor
- ✅ **ÇÖZÜLDÜ:** MUI theme Design System v3 breakpoint'lerine göre güncellendi

**Dosyalar:**
- `shared/hooks/useResponsive.ts`

---

## 🎣 Responsive Hooks

### 1. `useBreakpoint` (FSD)

**Lokasyon:** `shared/hooks/useBreakpoint.ts`

**Özellikler:**
- ✅ FSD breakpoint sistemini kullanır
- ✅ `current`, `isAbove()`, `isBelow()`, `is()` fonksiyonları
- ✅ Window resize event listener
- ✅ SSR-safe

**Kullanım:**
```typescript
const { current, isAbove, isBelow } = useBreakpoint();
if (isAbove('md')) { /* Desktop */ }
```

**Kullanım Sayısı:** 9 dosyada

---

### 2. `useMediaQuery` (Custom)

**Lokasyon:** `shared/hooks/useMediaQuery.ts`

**Özellikler:**
- ✅ Custom media query string desteği
- ✅ Modern `addEventListener` API
- ✅ SSR-safe

**Kullanım:**
```typescript
const isMobile = useMediaQuery('(max-width: 767px)');
```

**Kullanım Sayısı:** 6 dosyada

---

### 3. `useResponsive` (MUI-based)

**Lokasyon:** `shared/hooks/useResponsive.ts`

**Özellikler:**
- ✅ MUI theme breakpoints kullanır
- ✅ Device detection (mobile, tablet, desktop)
- ✅ Orientation detection
- ✅ Touch device detection
- ✅ Retina display detection
- ✅ Viewport dimensions

**Kullanım:**
```typescript
const { isMobile, isTablet, isDesktop, breakpoint } = useResponsive();
```

**Kullanım Sayısı:** 25+ dosyada

**✅ ÇÖZÜLDÜ:** Design System v3 breakpoint'leri kullanıyor (320, 480, 768, 1024, 1366, 1920, 2560)
- MUI theme'den breakpoint değerleri alınıyor
- xxl ve xxxl için theme değerleri kullanılıyor

---

### 4. `useResponsiveValue`

**Lokasyon:** `shared/hooks/useResponsiveValue.ts`

**Özellikler:**
- ✅ Breakpoint-based değer mapping
- ✅ FSD breakpoint sistemini kullanır
- ✅ `useResponsiveValues` ile multiple değer desteği

**Kullanım:**
```typescript
const fontSize = useResponsiveValue({
  mobile: '14px',
  md: '16px',
  lg: '18px',
});
```

**Kullanım Sayısı:** 12 dosyada

---

### 5. `useContainerQuery`

**Lokasyon:** `shared/hooks/useContainerQuery.ts`

**Özellikler:**
- ✅ Container-based responsive queries
- ✅ ResizeObserver API kullanımı
- ✅ Debounce desteği
- ✅ Height tracking opsiyonu

**Kullanım:**
```typescript
const { ref, size, isSmall, isMedium, isLarge } = useContainerQuery();
```

**Kullanım Sayısı:** 3 dosyada

---

### 6. `useDeviceInfo`

**Lokasyon:** `shared/hooks/useDeviceInfo.ts`

**Özellikler:**
- ✅ Comprehensive device detection
- ✅ Responsive mode detection (mobile, tablet, desktop, wide)
- ✅ UI mode detection (compact, comfortable, spacious)
- ✅ Device type detection (mobile, tablet, desktop)
- ✅ Orientation detection

**Kullanım:**
```typescript
const { responsiveMode, deviceType, orientation } = useDeviceInfo();
```

**Kullanım Sayısı:** 8 dosyada

---

## 🎨 Adaptive UI (Zoom-Aware)

### 1. Fluid Utilities (`shared/lib/zoom-aware/fluid.ts`)

**Fonksiyonlar:**
- ✅ `fluid()` - CSS clamp() wrapper
- ✅ `fluidSpacing()` - Fluid spacing değerleri
- ✅ `fluidFontSize()` - Fluid font size
- ✅ `fluidWidth()` - Fluid width
- ✅ `fluidHeight()` - Fluid height
- ✅ `responsiveGap()` - Container-aware gap
- ✅ `safeMinWidth()` - Safe min-width constraint
- ✅ `safeMaxWidth()` - Safe max-width constraint
- ✅ `pxToRem()` - Pixel to rem conversion
- ✅ `containerAware()` - Container query-aware değerler

**Kullanım:**
```typescript
fontSize: fluidFontSize("0.875rem", "1.125rem")
padding: fluidSpacing("0.5rem", "2rem", 0.5)
width: safeMaxWidth("1200px") // min(1200px, 100%)
```

**Kullanım Sayısı:** 45+ dosyada

---

### 2. Zoom-Aware Styles (`shared/lib/zoom-aware/styles.ts`)

**Stil Objeleri:**
- ✅ `zoomAwareContainer` - Container base styles
- ✅ `zoomAwareCard` - Card base styles
- ✅ `zoomAwareButton` - Button base styles
- ✅ `zoomAwareText` - Text base styles
- ✅ `zoomAwareFlex` - Flex container styles
- ✅ `zoomAwareGrid` - Grid container styles
- ✅ `zoomAwareImage` - Image styles
- ✅ `zoomAwareInput` - Input styles

**Kullanım:**
```typescript
import { zoomAwareContainer, zoomAwareGrid } from "@/shared/lib/zoom-aware";
```

**Kullanım Sayısı:** 30+ dosyada

---

### 3. Global CSS (`shared/lib/zoom-aware/global.css`)

**Özellikler:**
- ✅ Fluid typography classes
- ✅ Fluid spacing classes
- ✅ Zoom-aware flex/grid utilities
- ✅ Safe min/max width utilities

**Kullanım:**
```css
.fluid-text-sm { font-size: clamp(0.875rem, 0.5vw + 0.875rem, 1rem); }
.zoom-aware-grid { /* ... */ }
```

---

## 🎭 MUI Entegrasyonu

### 1. Theme Breakpoints

**Durum:**
- ✅ MUI theme'de breakpoint'ler tanımlı
- ⚠️ `xxl` ve `xxxl` theme'e eklenmemiş
- ⚠️ MUI standard breakpoints (600, 900, 1200) ile uyumsuz

**Öneri:**
```typescript
// theme.v3.ts'de eksik breakpoints eklenmeli
breakpoints: {
  values: {
    xs: 320,
    sm: 480,
    md: 768,
    lg: 1024,
    xl: 1366,
    xxl: 1920,  // EKLENMELİ
    xxxl: 2560, // EKLENMELİ
  },
}
```

---

### 2. MUI Component Kullanımı

**Box Component:**
- ✅ `sx` prop ile responsive değerler
- ✅ Breakpoint-based styling
- ✅ Zoom-aware utilities ile entegre

**Grid Component:**
- ✅ MUI Grid kullanımı yaygın
- ✅ Responsive columns
- ✅ Spacing props

**Stack Component:**
- ✅ MUI Stack kullanımı yaygın
- ✅ Responsive direction
- ✅ Spacing props

**Kullanım İstatistikleri:**
- `useMediaQuery`: 330+ kullanım (73 dosyada)
- `useTheme`: 150+ kullanım
- `sx` prop: 500+ kullanım

---

## 🧩 Component Yapıları

### 1. Container Component

**Lokasyon:** `shared/ui/Container/Container.tsx`

**Özellikler:**
- ✅ Zoom-aware max-width
- ✅ Fluid padding
- ✅ Responsive max-width sizes
- ✅ Safe constraints

**Kullanım:**
```typescript
<Container maxWidth="xl" padding="md">
  {children}
</Container>
```

---

### 2. Grid Component

**Lokasyon:** `shared/ui/Grid/Grid.tsx`

**Özellikler:**
- ✅ Zoom-aware grid
- ✅ Responsive columns
- ✅ Fluid gap
- ✅ Min column width constraint (280px)

**Kullanım:**
```typescript
<Grid cols={1} colsMd={2} colsLg={3} gap="md">
  {children}
</Grid>
```

---

### 3. Stack Component

**Lokasyon:** `shared/ui/Stack/Stack.tsx`

**Özellikler:**
- ✅ Zoom-aware flex
- ✅ Responsive direction
- ✅ Fluid spacing
- ✅ Alignment props

**Kullanım:**
```typescript
<Stack direction="row" spacing="md" align="center">
  {children}
</Stack>
```

---

### 4. PageContainer Component

**Lokasyon:** `shared/ui/layout/PageContainer.tsx`

**Özellikler:**
- ✅ Zoom-aware container
- ✅ Responsive max-width
- ✅ Fluid padding
- ✅ `useDeviceInfo` entegrasyonu

**Kullanım:**
```typescript
<PageContainer sx={{ minHeight: "100vh" }}>
  {children}
</PageContainer>
```

---

## ⚠️ Sorunlar ve Öneriler

### 1. Breakpoint Uyumsuzlukları

**Durum:**
- ✅ **ÇÖZÜLDÜ:** Design System v3 breakpoints ana sistem olarak kullanılıyor
  1. ✅ MUI theme Design System v3 breakpoints'e göre güncellendi
  2. ✅ `useResponsive` hook Design System v3 breakpoints kullanıyor
  3. ✅ FSD breakpoints Design System v3'e map edildi (backward compatibility için)

**Tamamlanan İşler:**
1. ✅ **MUI theme güncellendi:**
   ```typescript
   breakpoints: {
     values: {
       xs: 320,
       sm: 480,
       md: 768,
       lg: 1024,
       xl: 1366,
       xxl: 1920,
       xxxl: 2560,
     },
   }
   ```

2. ✅ **useResponsive hook güncellendi:**
   - Design System v3 breakpoint'leri kullanıyor
   - MUI theme'den breakpoint değerleri alınıyor
   - xxl ve xxxl için theme değerleri kullanılıyor

3. ✅ **FSD breakpoints backward compatibility için korundu:**
   - Design System v3'e map edildi
   - Deprecated olarak işaretlendi

---

### 2. Duplicate Hooks

**Durum:**
- ⚠️ `useBreakpoint` (FSD) ve `useResponsive` (MUI) benzer işlevler yapıyor
- ✅ `useMediaQuery` (custom) ve MUI'nin `useMediaQuery`'si farklı kullanım senaryoları için mevcut

**Mevcut Durum:**
- `useBreakpoint`: FSD breakpoint sistemini kullanıyor (Design System v3'e map edilmiş)
- `useResponsive`: Design System v3 breakpoint'lerini kullanıyor, daha kapsamlı (device detection, orientation, etc.)

**Öneri:**
1. **Hook kullanım rehberi:**
   - **Yeni kod için:** `useResponsive` kullan (Design System v3, daha kapsamlı)
   - **Mevcut kod için:** `useBreakpoint` backward compatibility için korunuyor
   - **Container queries için:** `useContainerQuery` kullan
   - **Responsive değerler için:** `useResponsiveValue` kullan

2. **Migration stratejisi:**
   - Yeni component'lerde `useResponsive` kullan
   - Mevcut component'lerde `useBreakpoint` kullanımı kabul edilebilir
   - Zamanla `useBreakpoint` → `useResponsive` migration yapılabilir

---

### 3. MUI Theme Eksiklikleri

**Durum:**
- ✅ **ÇÖZÜLDÜ:** `xxl` ve `xxxl` breakpoints MUI theme'e eklendi
- ✅ **ÇÖZÜLDÜ:** Design System v3 breakpoints MUI theme ile tam uyumlu

**Tamamlanan İşler:**
```typescript
// theme.v3.ts - TAMAMLANDI
breakpoints: {
  values: {
    xs: DS.breakpoints.xs,    // 320
    sm: DS.breakpoints.sm,    // 480
    md: DS.breakpoints.md,    // 768
    lg: DS.breakpoints.lg,    // 1024
    xl: DS.breakpoints.xl,    // 1366
    xxl: DS.breakpoints.xxl,  // 1920 ✅ EKLENDİ
    xxxl: DS.breakpoints.xxxl, // 2560 ✅ EKLENDİ
  },
}
```

**TypeScript Tip Genişletmesi:**
```typescript
// theme.v3.ts - TAMAMLANDI
declare module "@mui/material/styles" {
  interface BreakpointOverrides {
    xs: true;
    sm: true;
    md: true;
    lg: true;
    xl: true;
    xxl: true;  // ✅ EKLENDİ
    xxxl: true; // ✅ EKLENDİ
  }
}
```

---

### 4. Responsive Hook Kullanımı

**Durum:**
- ⚠️ Farklı hook'lar farklı yerlerde kullanılıyor (kabul edilebilir - farklı use case'ler)
- ✅ Hook'lar Design System v3 breakpoint'lerini kullanıyor (tutarlılık sağlandı)

**Hook Kullanım Rehberi:**

1. **`useResponsive` - Ana responsive hook (ÖNERİLEN):**
   ```typescript
   // ✅ Yeni kod için önerilen
   const { 
     breakpoint,      // Current breakpoint (xs, sm, md, lg, xl, xxl, xxxl)
     isMobile,        // xs or sm
     isTablet,        // md
     isDesktop,       // lg or xl
     isWide,          // xxl or xxxl
     width,           // Viewport width
     isTouchDevice,   // Touch capability
     isPortrait       // Orientation
   } = useResponsive();
   ```

2. **`useResponsiveValue` - Breakpoint-based değerler:**
   ```typescript
   // ✅ Responsive değerler için
   const fontSize = useResponsiveValue({ 
     mobile: '14px', 
     md: '16px',
     lg: '18px' 
   });
   ```

3. **`useContainerQuery` - Container-based queries:**
   ```typescript
   // ✅ Container boyutuna göre responsive
   const { ref, size, isSmall, isMedium, isLarge } = useContainerQuery();
   ```

4. **`useBreakpoint` - FSD breakpoint sistemi (Backward compatibility):**
   ```typescript
   // ⚠️ Mevcut kod için kabul edilebilir, yeni kod için useResponsive kullan
   const { current, isAbove, isBelow } = useBreakpoint();
   ```

5. **`useMediaQuery` - Custom media queries:**
   ```typescript
   // ✅ Özel media query'ler için
   const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
   ```

---

### 5. Zoom-Aware Entegrasyonu

**Durum:**
- ✅ Zoom-aware utilities yaygın kullanılıyor
- ✅ Component'ler zoom-aware
- ⚠️ Bazı component'ler hala fixed pixel değerleri kullanıyor

**Öneri:**
1. **Tüm component'leri zoom-aware yap:**
   - Fixed `px` değerleri → `rem` veya `fluid` utilities
   - Fixed `width/height` → `safeMaxWidth/safeMinWidth`
   - Fixed `padding/margin` → `fluidSpacing`

2. **Audit:**
   ```bash
   # Fixed pixel değerleri bul
   grep -r "px\"" frontend/src --include="*.tsx" --include="*.ts"
   ```

---

## ✅ Genel Değerlendirme

### Güçlü Yönler

1. ✅ **Kapsamlı Responsive Sistem:**
   - Multiple breakpoint sistemleri
   - Çok sayıda responsive hook
   - Container queries desteği

2. ✅ **Zoom-Aware UI:**
   - Fluid utilities
   - Safe constraints
   - Modern CSS (clamp, min, max)

3. ✅ **MUI Entegrasyonu:**
   - Theme-based breakpoints
   - `sx` prop kullanımı
   - Component overrides

4. ✅ **Component Yapıları:**
   - Reusable responsive components
   - Consistent patterns
   - Good abstraction

---

### İyileştirme Alanları

1. ✅ **Breakpoint Standardizasyonu: TAMAMLANDI**
   - ✅ Design System v3 breakpoints ana sistem olarak kullanılıyor
   - ✅ MUI theme Design System v3 breakpoints'e göre güncellendi
   - ✅ Hook'lar Design System v3 breakpoints kullanıyor

2. ⚠️ **Hook Konsolidasyonu: DEVAM EDİYOR**
   - ✅ `useResponsive` Design System v3 kullanıyor (önerilen)
   - ⚠️ `useBreakpoint` backward compatibility için korunuyor
   - ✅ Hook kullanım rehberi oluşturuldu

3. ⚠️ **Documentation: DEVAM EDİYOR**
   - ✅ Hook kullanım rehberi eklendi
   - ⚠️ Responsive pattern guide (gelecekte eklenecek)
   - ⚠️ Best practices dokümantasyonu (gelecekte eklenecek)

---

### Öncelikli Aksiyonlar

#### Yüksek Öncelik

1. ✅ **Breakpoint Standardizasyonu: TAMAMLANDI**
   - ✅ Design System v3 breakpoints'i ana sistem yapıldı
   - ✅ MUI theme güncellendi (xxl ve xxxl eklendi)
   - ✅ Hook'lar güncellendi (useResponsive Design System v3 kullanıyor)

2. ⚠️ **Hook Konsolidasyonu: DEVAM EDİYOR**
   - ✅ `useResponsive` → Design System v3 kullanıyor
   - ⚠️ `useBreakpoint` → Backward compatibility için korunuyor (yeni kod için `useResponsive` öneriliyor)

#### Orta Öncelik

3. **Documentation:**
   - Responsive pattern guide
   - Hook usage examples

4. **Zoom-Aware Audit:**
   - Fixed pixel değerleri bul ve düzelt

#### Düşük Öncelik

5. **Performance Optimization:**
   - Hook memoization
   - Event listener optimization

---

## 📊 İstatistikler

### Breakpoint Sistemleri
- **FSD Breakpoints:** 9 breakpoint (320-1536px)
- **Design System v3:** 7 breakpoint (320-2560px)
- **MUI Standard:** 5 breakpoint (0-1536px)

### Responsive Hooks
- **useBreakpoint:** 9 dosyada
- **useMediaQuery:** 6 dosyada
- **useResponsive:** 25+ dosyada
- **useResponsiveValue:** 12 dosyada
- **useContainerQuery:** 3 dosyada
- **useDeviceInfo:** 8 dosyada

### Zoom-Aware Kullanımı
- **Fluid Utilities:** 45+ dosyada
- **Zoom-Aware Styles:** 30+ dosyada
- **Component Integration:** 20+ component

### MUI Kullanımı
- **useMediaQuery:** 330+ kullanım (73 dosyada)
- **useTheme:** 150+ kullanım
- **sx prop:** 500+ kullanım

---

## 📝 Tamamlanan İşler Özeti

### ✅ Yüksek Öncelik - Tamamlandı

1. **Breakpoint Standardizasyonu:**
   - ✅ Design System v3 breakpoints ana sistem olarak kullanılıyor
   - ✅ MUI theme Design System v3 breakpoints'e göre güncellendi
   - ✅ `xxl` ve `xxxl` breakpoints MUI theme'e eklendi
   - ✅ TypeScript tip genişletmesi yapıldı (`BreakpointOverrides`)
   - ✅ `useResponsive` hook Design System v3 breakpoints kullanıyor
   - ✅ `useResponsive` hook MUI theme'den breakpoint değerlerini alıyor

2. **Hook Güncellemeleri:**
   - ✅ `useResponsive` hook güncellendi (Design System v3, MUI theme entegrasyonu)
   - ✅ `useResponsive` hook dokümantasyonu güncellendi
   - ✅ FSD breakpoints Design System v3'e map edildi (backward compatibility)

### ⚠️ Devam Eden İşler

1. **Hook Konsolidasyonu:**
   - ⚠️ `useBreakpoint` hook'u backward compatibility için korunuyor
   - ✅ Yeni kod için `useResponsive` kullanımı öneriliyor
   - ⚠️ Mevcut kodda `useBreakpoint` kullanımı kabul edilebilir

2. **Documentation:**
   - ✅ Hook kullanım rehberi eklendi
   - ⚠️ Responsive pattern guide (gelecekte eklenecek)
   - ⚠️ Best practices dokümantasyonu (gelecekte eklenecek)

### 📋 Gelecek İşler

1. **Zoom-Aware Audit:**
   - Fixed pixel değerleri bul ve düzelt
   - Tüm component'leri zoom-aware yap

2. **Performance Optimization:**
   - Hook memoization
   - Event listener optimization

---

## 🎯 Hook Kullanım Rehberi

### Hangi Hook'u Ne Zaman Kullanmalı?

#### 1. `useResponsive` - Ana Responsive Hook (ÖNERİLEN)

**Ne zaman kullan:**
- Yeni component'lerde responsive logic için
- Device type detection (mobile, tablet, desktop) gerektiğinde
- Orientation detection gerektiğinde
- Touch device detection gerektiğinde
- Viewport dimensions gerektiğinde

**Örnek:**
```typescript
import { useResponsive } from '@/shared/hooks';

function MyComponent() {
  const { 
    breakpoint,      // 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl'
    isMobile,        // xs or sm
    isTablet,        // md
    isDesktop,       // lg or xl
    isWide,          // xxl or xxxl
    width,           // Viewport width
    isTouchDevice,   // Touch capability
    isPortrait       // Orientation
  } = useResponsive();

  if (isMobile) {
    return <MobileView />;
  }
  
  return <DesktopView />;
}
```

#### 2. `useResponsiveValue` - Breakpoint-Based Değerler

**Ne zaman kullan:**
- Breakpoint'e göre farklı değerler gerektiğinde
- Responsive styling için değer mapping

**Örnek:**
```typescript
import { useResponsiveValue } from '@/shared/hooks';

function ResponsiveCard() {
  const fontSize = useResponsiveValue({
    mobile: '14px',
    md: '16px',
    lg: '18px',
  });

  const columns = useResponsiveValue({
    mobile: 1,
    tablet: 2,
    desktop: 3,
    wide: 4,
  }, 1); // Default: 1

  return (
    <div style={{ fontSize }}>
      <Grid columns={columns}>
        {/* content */}
      </Grid>
    </div>
  );
}
```

#### 3. `useContainerQuery` - Container-Based Queries

**Ne zaman kullan:**
- Container boyutuna göre responsive logic gerektiğinde
- Viewport yerine container boyutuna göre davranış gerektiğinde

**Örnek:**
```typescript
import { useContainerQuery } from '@/shared/hooks';

function ResponsiveCard() {
  const { ref, size, isSmall, isMedium, isLarge } = useContainerQuery();

  return (
    <div ref={ref}>
      {isSmall && <CompactView />}
      {isMedium && <StandardView />}
      {isLarge && <ExpandedView />}
    </div>
  );
}
```

#### 4. `useBreakpoint` - FSD Breakpoint Sistemi (Backward Compatibility)

**Ne zaman kullan:**
- Mevcut kodda zaten kullanılıyorsa (migration yapılana kadar)
- FSD breakpoint isimleri gerektiğinde (mobile, tablet, desktop, etc.)

**Örnek:**
```typescript
import { useBreakpoint } from '@/shared/hooks';

function MyComponent() {
  const { current, isAbove, isBelow } = useBreakpoint();

  if (isAbove('md')) {
    return <DesktopView />;
  }
  
  return <MobileView />;
}
```

**Not:** Yeni kod için `useResponsive` kullanılması önerilir.

#### 5. `useMediaQuery` - Custom Media Queries

**Ne zaman kullan:**
- Özel media query'ler gerektiğinde
- System preferences (dark mode, reduced motion, etc.) için

**Örnek:**
```typescript
import { useMediaQuery } from '@/shared/hooks';

function MyComponent() {
  const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  return (
    <div className={isDarkMode ? 'dark' : 'light'}>
      {/* content */}
    </div>
  );
}
```

### Hook Karşılaştırması

| Hook | Breakpoint Sistemi | Device Detection | Orientation | Viewport | Container | Önerilen |
|------|-------------------|------------------|-------------|----------|-----------|----------|
| `useResponsive` | Design System v3 | ✅ | ✅ | ✅ | ❌ | ✅ Yeni kod |
| `useResponsiveValue` | Design System v3 | ❌ | ❌ | ❌ | ❌ | ✅ Değer mapping |
| `useContainerQuery` | Custom | ❌ | ❌ | ❌ | ✅ | ✅ Container queries |
| `useBreakpoint` | FSD (DS v3 mapped) | ✅ | ❌ | ❌ | ❌ | ⚠️ Backward compatibility |
| `useMediaQuery` | Custom | ❌ | ❌ | ❌ | ❌ | ✅ Custom queries |

---

**Son Güncelleme:** 2024-12-XX  
**Sonraki İnceleme:** 2025-01-XX

