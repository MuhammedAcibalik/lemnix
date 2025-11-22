# TypeScript Strict Mode Migration Plan
**Tarih:** 2024-12-XX  
**Durum:** Planlama Aşaması

---

## 📋 Durum

TypeScript strict mode açıldığında (`exactOptionalPropertyTypes: true`, `noUncheckedIndexedAccess: true`) **200+ type error** ortaya çıktı.

Bu normal bir durum - strict mode açıldığında mevcut kodda type safety sorunları görünür hale geliyor.

---

## 🎯 Migration Stratejisi

### Faz 1: Hazırlık (Şu an)
- ✅ Route consistency düzeltildi
- ✅ Authentication production fix yapıldı
- ⚠️ TypeScript strict mode şimdilik `false` (migration planı hazırlandıktan sonra açılacak)

### Faz 2: Type Safety İyileştirmeleri (Adım adım)

#### 2.1. Optional Properties Düzeltmeleri

**Sorun:** `exactOptionalPropertyTypes: true` açıldığında, optional property'ler `T | undefined` olarak işaretlenmeli.

**Etkilenen Dosyalar:**
- `entities/production-plan/api/productionPlanApi.ts` - 8 hata
- `entities/statistics/api/statisticsApi.ts` - 1 hata
- `features/enterprise-optimization-form/` - 2 hata
- `shared/lib/stores/cuttingListStore.ts` - 2 hata
- `shared/lib/utils/utils/exportUtils.ts` - 5 hata
- `widgets/enterprise-optimization-wizard/` - 15+ hata

**Çözüm:**
```typescript
// ❌ Önce
interface MyType {
  description?: string;
}

// ✅ Sonra
interface MyType {
  description?: string | undefined; // Explicit undefined
}
```

#### 2.2. Indexed Access Düzeltmeleri

**Sorun:** `noUncheckedIndexedAccess: true` açıldığında, array/object access `T | undefined` döner.

**Etkilenen Dosyalar:**
- `shared/hooks/useFocusTrap.ts` - 5 hata
- `shared/lib/utils/utils/excelExport.ts` - 1 hata
- `shared/lib/utils/utils/pdfExport.ts` - 2 hata
- `widgets/optimization-info-dialog/components/OverviewTab.tsx` - 8 hata
- `widgets/statistics-page/components/` - 10+ hata

**Çözüm:**
```typescript
// ❌ Önce
const item = array[0];
item.property; // Error: Object is possibly 'undefined'

// ✅ Sonra
const item = array[0];
if (item) {
  item.property; // Safe
}

// veya
const item = array[0] ?? defaultValue;
```

#### 2.3. MUI Component Props Düzeltmeleri

**Sorun:** MUI component'lerinin optional props'ları `exactOptionalPropertyTypes` ile uyumsuz.

**Etkilenen Dosyalar:**
- `shared/ui/Loading/Loading.tsx` - 3 hata
- `shared/ui/Modal/Modal.tsx` - 1 hata
- `shared/ui/Select/Select.tsx` - 2 hata
- `widgets/enterprise-optimization-wizard/` - 10+ hata

**Çözüm:**
```typescript
// ❌ Önce
<Button disabled={someCondition ? true : undefined} />

// ✅ Sonra
<Button disabled={someCondition || undefined} />
// veya
{someCondition && <Button disabled />}
```

---

## 📊 Hata Kategorileri

### 1. Optional Properties (80+ hata)
- `description?: string` → `description?: string | undefined`
- `metadata?: object` → `metadata?: object | undefined`

### 2. Indexed Access (40+ hata)
- `array[0]` → `array[0] ?? defaultValue`
- `object[key]` → `object[key] ?? defaultValue`

### 3. MUI Component Props (30+ hata)
- Optional props undefined check
- Component prop types

### 4. Type Assertions (20+ hata)
- `as` kullanımları
- Type narrowing

### 5. API Response Types (30+ hata)
- Response wrapper types
- Nested optional properties

---

## 🚀 Migration Adımları

### Adım 1: En Kritik Dosyalar (Öncelik 1)
1. `shared/api/client.ts` - API client (✅ Tamamlandı)
2. `entities/*/api/*.ts` - API response types
3. `shared/lib/stores/*.ts` - Store types

### Adım 2: UI Components (Öncelik 2)
1. `shared/ui/*/` - Shared UI components
2. `widgets/*/components/` - Widget components

### Adım 3: Features & Pages (Öncelik 3)
1. `features/*/` - Feature components
2. `pages/*/` - Page components

### Adım 4: Utilities (Öncelik 4)
1. `shared/lib/utils/` - Utility functions
2. `shared/hooks/` - Custom hooks

---

## ⚠️ Dikkat Edilmesi Gerekenler

1. **Breaking Changes:** Bazı type değişiklikleri runtime behavior'u etkilemeyebilir ama type safety artar
2. **MUI Compatibility:** MUI component'lerinin optional props'ları ile uyumluluk
3. **API Response Types:** Backend'den gelen response'ların type'ları
4. **Gradual Migration:** Tüm dosyaları bir anda düzeltmek yerine, modül modül ilerlemek

---

## 📝 Örnek Düzeltmeler

### Örnek 1: Optional Property
```typescript
// ❌ Önce
interface CuttingList {
  description?: string;
}

const list: CuttingList = {
  description: undefined, // Error with exactOptionalPropertyTypes
};

// ✅ Sonra
interface CuttingList {
  description?: string | undefined; // Explicit
}

const list: CuttingList = {
  description: undefined, // OK
};
```

### Örnek 2: Indexed Access
```typescript
// ❌ Önce
const firstItem = items[0];
firstItem.property; // Error: Object is possibly 'undefined'

// ✅ Sonra
const firstItem = items[0];
if (firstItem) {
  firstItem.property; // Safe
}

// veya
const firstItem = items[0] ?? defaultValue;
```

### Örnek 3: MUI Props
```typescript
// ❌ Önce
<Button disabled={condition ? true : undefined} />

// ✅ Sonra
<Button disabled={condition || undefined} />
// veya
{condition && <Button disabled />}
```

---

## 🎯 Başarı Kriterleri

- ✅ Tüm type errors düzeltildi
- ✅ `exactOptionalPropertyTypes: true` aktif
- ✅ `noUncheckedIndexedAccess: true` aktif
- ✅ Type safety %100
- ✅ Runtime behavior değişmedi
- ✅ Test coverage korundu

---

## 📅 Tahmini Süre

- **Faz 1 (Kritik):** 2-3 gün
- **Faz 2 (UI Components):** 3-4 gün
- **Faz 3 (Features & Pages):** 2-3 gün
- **Faz 4 (Utilities):** 1-2 gün

**Toplam:** 8-12 gün (modül modül, test ede ede)

---

**Not:** Bu migration planı, mevcut kodun type safety'sini artırmak için hazırlandı. Adım adım, test ede ede ilerleyeceğiz.

