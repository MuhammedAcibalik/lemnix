# Kök Neden Analizi: Parça Adetlerini Eklerken Profil Tipi Problemi

## 🎯 Problem Tanımı

**Kullanıcı Bildirimi**: "Parça adetlerini eklerken profil tipi için geçmiş sipariş yapısına ya bakmıyor ya da yanlış hesaplıyor"

## 📊 Veri Akışı Analizi

### 1. Frontend → Backend Akışı

```
User Action (Frontend)
  │
  ├─→ CuttingListBuilder.tsx
  │   └─→ handleApplySmartSuggestion()
  │       ├─→ productName: string
  │       ├─→ size: string
  │       └─→ orderQuantity: number
  │
  ├─→ suggestionApi.applySmartSuggestion()
  │   └─→ POST /api/suggestions/apply
  │       Body: { product, size, orderQuantity }
  │
  ├─→ suggestionRoutes.ts
  │   └─→ router.post("/apply")
  │       └─→ suggestionService.applySmartSuggestion()
  │
  ├─→ UnifiedSuggestionService.applySmartSuggestion()
  │   ├─→ patternRepo.findByProductAndSize(productName, size)
  │   ├─→ Normalize: createContextKey(productName, size)
  │   ├─→ Group patterns by profile+measurement
  │   ├─→ Calculate: quantity = orderQuantity * averageRatio
  │   └─→ Return: profiles with quantities
  │
  └─→ Frontend receives profiles with calculated quantities
```

### 2. Veri Kaydetme Akışı (Learning)

```
User saves item (Frontend)
  │
  ├─→ POST /api/cutting-list/:id/sections/:sectionId/items
  │   Body: { workOrderId, orderQuantity, size, profiles: [...] }
  │
  ├─→ cuttingListController.addItemToSection()
  │   ├─→ Repository.addItemToSection()
  │   └─→ learnFromNewItem()
  │       ├─→ Get productName from section
  │       └─→ For each profile:
  │           └─→ learnFromProfile()
  │               └─→ UnifiedSuggestionService.learnFromPattern()
  │                   ├─→ createContextKey(productName, size)
  │                   ├─→ createPatternKey(productName, size, profile, measurement)
  │                   ├─→ Find or create pattern
  │                   ├─→ Calculate ratio = quantity / orderQuantity
  │                   └─→ Save to database
  │
  └─→ Pattern saved to SuggestionPattern table
```

## 🔍 Kritik Analiz Noktaları

### 1. String Normalizasyon Tutarlılığı

**Dosya**: `backend/src/utils/stringNormalizer.ts`

**Mevcut Normalizasyon**:
```typescript
export function normalizeString(input: string): string {
  return (
    input
      .toUpperCase()
      .trim()
      .replace(/["""'''`´]/g, "")  // Quote'ları kaldır
      .replace(/\s+/g, " ")        // Multiple space → single space
  );
}
```

**Problemler**:
1. ❌ **Measurement Normalizasyonu**: `measurement` alanı için özel bir işlem yok
   - Örnek: `"992mm"` vs `"992 mm"` vs `"992"`
   - Bunlar farklı pattern key'ler oluşturur!
   
2. ❌ **Profil Tipi Tutarsızlığı**: 
   - Örnek: `"KAPALI ALT"` vs `"KAPALIALT"` vs `"Kapalı Alt"`
   - Normalize sonrası: `"KAPALI ALT"` vs `"KAPALIALT"` (farklı!)
   
3. ✅ **Quote Handling**: Doğru çalışıyor (`"` ve `"` → kaldırılıyor)

### 2. Pattern Key Oluşturma

**Dosya**: `backend/src/utils/stringNormalizer.ts`

**Mevcut Mantık**:
```typescript
export function createPatternKey(
  productName: string,
  size: string,
  profile: string,
  measurement: string,
): string {
  return `${createContextKey(productName, size)}|${normalizeString(profile)}|${normalizeString(measurement)}`;
}
```

**Problemler**:
1. ❌ **Measurement Format**: 
   - `"992mm"` → `"992MM"` (normalize sonrası)
   - `"992 mm"` → `"992 MM"` (normalize sonrası)
   - `"992"` → `"992"` (normalize sonrası)
   - **Sonuç**: Farklı pattern key'ler oluşur!
   
2. ❌ **Profil Tipi Boşluk**: 
   - `"KAPALI ALT"` → `"KAPALI ALT"` (normalize sonrası)
   - `"KAPALIALT"` → `"KAPALIALT"` (normalize sonrası)
   - **Sonuç**: Farklı pattern key'ler oluşur!

### 3. Pattern Eşleştirme Mantığı

**Dosya**: `backend/src/services/suggestions/UnifiedSuggestionService.ts`

**Mevcut Mantık** (applySmartSuggestion):
```typescript
// 1. Find patterns by product+size
const patterns = await this.patternRepo.findByProductAndSize(productName, size);

// 2. Group by profile+measurement
const key = `${pattern.profile}|${pattern.measurement}`;

// 3. Select best pattern (highest confidence/frequency)
const bestPattern = profilePatterns.sort(...)[0];

// 4. Calculate quantity
const predictedQuantity = Math.round(orderQuantity * averageRatio);
```

**Problemler**:
1. ❌ **Profil Tipi Eşleştirmesi Yok**: 
   - Pattern bulunurken sadece `productName` ve `size` kullanılıyor
   - `profile` tipi eşleştirmesi yok!
   - **Sonuç**: Aynı `productName+size` için tüm profil tipleri döner, en iyi olan seçilir
   
2. ❌ **Measurement Eşleştirmesi**: 
   - Pattern key'de `measurement` var ama eşleştirme sırasında string karşılaştırması yapılıyor
   - Normalizasyon tutarsız ise eşleşmeyebilir
   
3. ✅ **Ratio Hesaplama**: Doğru (`orderQuantity * averageRatio`)

### 4. Veri Kaydetme (Learning) Mantığı

**Dosya**: `backend/src/services/suggestions/UnifiedSuggestionService.ts`

**Mevcut Mantık** (learnFromPattern):
```typescript
// 1. Normalize keys
const contextKey = createContextKey(productName, size);
const patternKey = createPatternKey(productName, size, profile, measurement);

// 2. Find existing pattern
const existing = await this.patternRepo.findByPatternKey(patternKey);

// 3. If exists, update ratio history
const newRatio = patternData.quantity / patternData.orderQuantity;
ratioHistory.push({ orderQty, profileQty, ratio: newRatio });
const averageRatio = totalRatio / ratioHistory.length;

// 4. If not exists, create new pattern
```

**Problemler**:
1. ✅ **Pattern Key Kullanımı**: Doğru (unique pattern key ile kaydediyor)
2. ❌ **Measurement Normalizasyonu**: Aynı ölçü farklı formatlarda kaydedilirse farklı pattern'ler oluşur
3. ✅ **Ratio Hesaplama**: Doğru (her kullanım için ayrı ratio hesaplanıyor)

### 5. Repository Pattern Bulma

**Dosya**: `backend/src/repositories/SuggestionPatternRepository.ts`

**Mevcut Mantık** (findByProductAndSize):
```typescript
async findByProductAndSize(
  productName: string,
  size: string,
): Promise<SuggestionPattern[]> {
  // ✅ USE NORMALIZER: Handles quotes, case, whitespace
  const contextKey = createContextKey(productName, size);
  return await this.findByContextKey(contextKey);
}
```

**Problemler**:
1. ❌ **Profil Tipi Filtresi Yok**: 
   - Sadece `productName` ve `size` ile arama yapıyor
   - Belirli bir profil tipi için arama yok!
   - **Sonuç**: Tüm profil tipleri döner, sonra en iyi olan seçilir
   
2. ✅ **Normalizasyon**: Doğru (`createContextKey` kullanıyor)

## 🎯 Kök Neden Tespiti

### Kök Neden #1: Profil Tipi Eşleştirmesi Yok ❌

**Problem**: 
- `applySmartSuggestion` methodunda pattern bulunurken **sadece `productName` ve `size` kullanılıyor**
- **`profile` tipi** kullanılmıyor!
- Aynı `productName+size` için tüm profil tipleri döner, sonra en iyi olan seçilir

**Sonuç**:
- Yanlış profil tipi seçilebilir
- Doğru profil tipi için veri varsa bile farklı bir profil seçilebilir

**Örnek Senaryo**:
```
Geçmiş Veriler:
- İNCE HELEZON | 24"X36" | KAPALI ALT (992mm) | ratio: 2.0
- İNCE HELEZON | 24"X36" | AÇIK ALT (687mm) | ratio: 1.0

Yeni Sipariş:
- İNCE HELEZON | 24"X36" | orderQuantity: 200

Şu Anki Sistem:
1. findByProductAndSize("İNCE HELEZON", "24"X36"") → 2 pattern döner
2. Group by profile+measurement → 2 grup
3. En iyi pattern seç → KAPALI ALT (daha yüksek frequency)
4. quantity = 200 * 2.0 = 400

❌ PROBLEM: Kullanıcı AÇIK ALT istiyorsa yanlış profil seçilir!
```

### Kök Neden #2: Measurement Normalizasyonu Tutarsız ❌

**Problem**:
- `measurement` alanı için özel bir normalizasyon yok
- `"992mm"` vs `"992 mm"` vs `"992"` farklı pattern key'ler oluşturur

**Sonuç**:
- Aynı ölçü farklı formatlarda kaydedilirse farklı pattern'ler oluşur
- Pattern'ler birleştirilmez, ratio'lar yanlış hesaplanır

**Örnek Senaryo**:
```
Kayıt 1: measurement = "992mm" → patternKey = "...|KAPALI ALT|992MM"
Kayıt 2: measurement = "992 mm" → patternKey = "...|KAPALI ALT|992 MM"
Kayıt 3: measurement = "992" → patternKey = "...|KAPALI ALT|992"

❌ PROBLEM: 3 farklı pattern oluşur, ratio'lar ayrı hesaplanır!
```

### Kök Neden #3: Profil Tipi Boşluk Tutarsızlığı ❌

**Problem**:
- Profil tipinde boşluk tutarsızlığı
- `"KAPALI ALT"` vs `"KAPALIALT"` farklı pattern key'ler oluşturur

**Sonuç**:
- Aynı profil tipi farklı formatlarda kaydedilirse farklı pattern'ler oluşur

### Kök Neden #4: Pattern Seçimi Mantığı ❌

**Problem**:
- Pattern seçilirken sadece `confidence` ve `frequency` kullanılıyor
- **Profil tipi eşleştirmesi** yok!

**Mevcut Kod**:
```typescript
const bestPattern = profilePatterns.sort((a, b) => {
  const confDiff = bConfidence - aConfidence;
  if (confDiff !== 0) return confDiff;
  return bFrequency - aFrequency;
})[0];
```

**Sonuç**:
- Yanlış profil tipi seçilebilir

## 📝 Önerilen Çözümler

### Çözüm 1: Measurement Normalizasyonu (Öncelik: YÜKSEK)

```typescript
export function normalizeMeasurement(input: string): string {
  // Remove "mm" and variations, extract number
  const match = input.match(/(\d+(?:\.\d+)?)/);
  if (match) {
    const number = parseFloat(match[1]);
    return `${Math.round(number)}`; // Standardize to integer
  }
  return normalizeString(input); // Fallback
}

export function createPatternKey(
  productName: string,
  size: string,
  profile: string,
  measurement: string,
): string {
  return `${createContextKey(productName, size)}|${normalizeString(profile)}|${normalizeMeasurement(measurement)}`;
}
```

**Beklenen Sonuç**:
- `"992mm"` → `"992"`
- `"992 mm"` → `"992"`
- `"992"` → `"992"`
- Aynı ölçü farklı formatlarda kaydedilse bile aynı pattern key oluşur

### Çözüm 2: Profil Tipi Boşluk Normalizasyonu (Öncelik: ORTA)

```typescript
export function normalizeProfile(input: string): string {
  return normalizeString(input)
    .replace(/\s+/g, " ")  // Multiple spaces → single space
    .trim();
}
```

**Beklenen Sonuç**:
- `"KAPALI ALT"` → `"KAPALI ALT"`
- `"KAPALIALT"` → `"KAPALIALT"` (bu farklı kalır, ama en azından tutarlı)

**Not**: Bu tam çözüm değil, kullanıcıların tutarlı giriş yapması gerekir.

### Çözüm 3: Profil Tipi Eşleştirmesi (Öncelik: YÜKSEK) ⭐

**Seçenek A**: Pattern bulma sırasında profil tipi filtresi ekle

```typescript
// UnifiedSuggestionService.applySmartSuggestion
async applySmartSuggestion(
  productName: string,
  size: string,
  orderQuantity: number,
  requestedProfile?: string, // ✅ YENİ: İstenen profil tipi
): Promise<...> {
  const patterns = await this.patternRepo.findByProductAndSize(
    productName,
    size,
  );
  
  // ✅ FIXED: Filter by profile type if requested
  let filteredPatterns = patterns;
  if (requestedProfile) {
    const normalizedRequested = normalizeString(requestedProfile);
    filteredPatterns = patterns.filter(
      (p) => normalizeString(p.profile as string) === normalizedRequested
    );
    
    // If no exact match, try fuzzy matching
    if (filteredPatterns.length === 0) {
      filteredPatterns = patterns.filter((p) => {
        const normalized = normalizeString(p.profile as string);
        return normalized.includes(normalizedRequested) ||
               normalizedRequested.includes(normalized);
      });
    }
  }
  
  // Continue with filtered patterns...
}
```

**Seçenek B**: Tüm pattern'leri döndür, frontend'de filtrele

**Seçenek C**: En yakın profil tipini seç (fuzzy matching)

### Çözüm 4: Pattern Seçimi İyileştirmesi (Öncelik: ORTA)

```typescript
// Profile type matching score
function calculateProfileMatchScore(
  patternProfile: string,
  requestedProfile?: string,
): number {
  if (!requestedProfile) return 0;
  
  const normalizedPattern = normalizeString(patternProfile);
  const normalizedRequested = normalizeString(requestedProfile);
  
  if (normalizedPattern === normalizedRequested) return 100;
  if (normalizedPattern.includes(normalizedRequested) ||
      normalizedRequested.includes(normalizedPattern)) {
    return 50; // Partial match
  }
  return 0; // No match
}

// Sort patterns with profile match priority
const bestPattern = profilePatterns.sort((a, b) => {
  const aMatch = calculateProfileMatchScore(
    a.profile as string,
    requestedProfile,
  );
  const bMatch = calculateProfileMatchScore(
    b.profile as string,
    requestedProfile,
  );
  
  // Priority: Profile match > Confidence > Frequency
  if (aMatch !== bMatch) return bMatch - aMatch;
  
  const confDiff = bConfidence - aConfidence;
  if (confDiff !== 0) return confDiff;
  return bFrequency - aFrequency;
})[0];
```

## 🔬 Test Senaryoları

### Test 1: Measurement Normalizasyonu
```
Input: ["992mm", "992 mm", "992"]
Beklenen: Tümü → "992"
Sonuç: Aynı pattern key oluşmalı
```

### Test 2: Profil Tipi Eşleştirmesi
```
Geçmiş Veriler:
- İNCE HELEZON | 24"X36" | KAPALI ALT (992mm) | ratio: 2.0
- İNCE HELEZON | 24"X36" | AÇIK ALT (687mm) | ratio: 1.0

Yeni Sipariş:
- İNCE HELEZON | 24"X36" | orderQuantity: 200 | requestedProfile: "AÇIK ALT"

Beklenen: AÇIK ALT pattern'i seçilmeli
Sonuç: quantity = 200 * 1.0 = 200 ✅
```

### Test 3: Boşluk Tutarsızlığı
```
Input: ["KAPALI ALT", "KAPALIALT", "Kapalı Alt"]
Beklenen: Tutarlı normalize edilmeli
Sonuç: En azından tutarlı pattern key'ler oluşmalı
```

## 📊 Öncelik Sıralaması

1. **YÜKSEK**: Measurement normalizasyonu (Çözüm 1)
2. **YÜKSEK**: Profil tipi eşleştirmesi (Çözüm 3)
3. **ORTA**: Profil tipi boşluk normalizasyonu (Çözüm 2)
4. **ORTA**: Pattern seçimi iyileştirmesi (Çözüm 4)

## 🎯 Beklenen Sonuç

Çözümler uygulandıktan sonra:
1. ✅ Measurement normalizasyonu tutarlı olacak
2. ✅ Profil tipi eşleştirmesi doğru çalışacak
3. ✅ Ratio hesaplama doğru olacak
4. ✅ Geçmiş sipariş yapısına doğru bakılacak

