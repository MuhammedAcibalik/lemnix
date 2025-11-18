# Full Adaptive System

## Genel Bakış

Full Adaptive System, sadece genişliğe göre değil, **kullanım senaryosuna** göre UI'yi modlara bölen akıllı bir katman. 

### "Responsive" ile Farkı

| Özellik | Klasik Responsive | Full Adaptive System |
|---------|-------------------|---------------------|
| Tek kriter | `width` breakpoints | width + height + dpr + orientation + pointer |
| Çıktı | Sadece layout değişir | UI modu + density + scale + typography |
| TV / Kiosk modu | Genelde yok | Doğrudan `uiMode = kiosk` |
| Dashboard yoğunluğu | Sabit | Cihaza göre kart sayısı, veri yoğunluğu |
| Tasarım dili | Statik | Mod bazlı (mobile, desktop, tv, kiosk…) |

## Kullanım

### 1. Context Kullanımı (Önerilen)

```tsx
import React from "react";
import { useAdaptiveUIContext } from "@/shared";
import { Grid, Box } from "@mui/material";

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { device, tokens } = useAdaptiveUIContext();

  // Device type kontrolü
  if (device.deviceType === "tv") {
    // Kiosk mode UI
  }

  // UI mode kontrolü - MUI Grid için column span hesaplama
  const columnSpan =
    device.uiMode === "kiosk" ? 3 :   // 12/4 = 3 (4 kolon)
    device.uiMode === "dense" ? 3 :   // 12/4 = 3 (4 kolon)
    device.uiMode === "standard" ? 4 : // 12/3 = 4 (3 kolon)
    device.uiMode === "compact" ? 6 :  // 12/2 = 6 (2 kolon)
    12; // 12/1 = 12 (1 kolon - mobile)

  return (
    <Box
      sx={{
        maxWidth: tokens.maxContentWidth,
        padding: tokens.spacingUnit * 2,
        fontSize: tokens.baseFontSize,
      }}
    >
      <Grid container spacing={tokens.spacingUnit}>
        {React.Children.map(children, (child, idx) => (
          <Grid item xs={12} md={columnSpan} key={idx}>
            {child}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
```

### 2. Hook Kullanımı

```tsx
import { useAdaptiveUI } from "@/shared";
import { Card, Typography } from "@mui/material";

export const StatCard: React.FC<{ title: string; value: string }> = ({ title, value }) => {
  const { device, tokens } = useAdaptiveUI();

  const titleSize = tokens.baseFontSize * (device.uiMode === "kiosk" ? 1.2 : 1);
  const valueSize = tokens.baseFontSize * (device.uiMode === "kiosk" ? 2 : 1.6);

  return (
    <Card
      sx={{
        padding: tokens.spacingUnit * 2,
        borderRadius: tokens.borderRadius,
        fontSize: titleSize,
      }}
    >
      <Typography sx={{ fontSize: valueSize, fontWeight: 700 }}>
        {value}
      </Typography>
      <Typography>{title}</Typography>
    </Card>
  );
};
```

### 3. Device Info Kullanımı

```tsx
import { useDeviceInfo } from "@/shared";
import { Box, Button } from "@mui/material";

export const Component: React.FC = () => {
  const { deviceType, uiMode, isTouch, isHighDPI } = useDeviceInfo();

  return (
    <Box>
      {isTouch ? (
        // Touch-optimized UI
        <Button size="large" />
      ) : (
        // Mouse-optimized UI
        <Button size="medium" />
      )}
      
      {/* High DPI kontrolü */}
      {isHighDPI && (
        <Box sx={{ fontSize: "0.875rem" }}>
          High DPI ekranda daha net görünüm
        </Box>
      )}
    </Box>
  );
};
```

## Device Types

- `mobile`: < 768px (telefon)
- `tablet`: 768px - 1365px (tablet)
- `laptop`: 1366px - 1919px (masaüstü kullanıcıların önemli kısmı)
- `desktop`: 1920px+ (geniş monitör)
- `tv`: 2560px+ (duvar ekranları, üretim TV'leri)

## UI Modes

- `mobile`: Mobil cihazlar için optimize edilmiş UI
- `compact`: Küçük laptop / tablet için sıkıştırılmış UI
- `standard`: Laptop için standart UI
- `dense`: Geniş masaüstü için yoğun UI (daha çok widget)
- `kiosk`: TV ekranı için kiosk modu (büyük font, az kart, full-screen chart)

## Adaptive Tokens

```typescript
interface AdaptiveTokens {
  baseFontSize: number;        // Temel font boyutu
  scale: number;               // Genel ölçek faktörü
  spacingUnit: number;         // Spacing birimi (8px base)
  borderRadius: number;        // Border radius
  density: "low" | "medium" | "high";  // Yoğunluk seviyesi
  maxContentWidth: number;     // Maksimum içerik genişliği
  typographyScale: number;     // Typography ölçek faktörü
  interactionSize: number;     // Minimum dokunma hedefi boyutu
}
```

## Örnek Senaryolar

### TV / Kiosk Modu
```tsx
import { useAdaptiveUIContext } from "@/shared";
import { Box } from "@mui/material";

const { device, tokens } = useAdaptiveUIContext();

if (device.uiMode === "kiosk") {
  // Büyük font, az kart, full-screen chart
  return (
    <Box sx={{ fontSize: tokens.baseFontSize * 1.5 }}>
      {/* Kiosk UI */}
    </Box>
  );
}
```

### Dense Dashboard
```tsx
import { Grid } from "@mui/material";
import { useAdaptiveUIContext } from "@/shared";

const { device, tokens } = useAdaptiveUIContext();

if (device.uiMode === "dense") {
  // Aynı ekrana daha çok widget (mühendis masasında)
  // 4 kolon için: 12/4 = 3
  const columnSpan = 3;
  
  return (
    <Grid container spacing={tokens.spacingUnit}>
      {items.map((item, idx) => (
        <Grid item xs={12} md={columnSpan} key={idx}>
          {item}
        </Grid>
      ))}
    </Grid>
  );
}
```

### Touch vs Mouse
```tsx
import { useAdaptiveUIContext } from "@/shared";
import { Button } from "@mui/material";

const { device, tokens } = useAdaptiveUIContext();

// Touch için daha büyük butonlar
<Button
  size={device.isTouch ? "large" : "medium"}
  sx={{ minHeight: tokens.interactionSize }}
/>
```

## Mevcut Design System ile Entegrasyon

Full Adaptive System, mevcut `useDesignSystem` hook'u ile **birlikte** kullanılabilir:

```tsx
import { useDesignSystem, useAdaptiveUIContext } from "@/shared";
import { Box } from "@mui/material";

export const Component: React.FC = () => {
  const ds = useDesignSystem(); // Mevcut design system
  const { device, tokens } = useAdaptiveUIContext(); // Adaptive system

  return (
    <Box
      sx={{
        // Design system renkleri
        backgroundColor: ds.colors.primary.main,
        
        // Adaptive spacing
        padding: tokens.spacingUnit * 2,
        
        // Adaptive typography
        fontSize: tokens.baseFontSize,
        
        // Design system shadows
        boxShadow: ds.shadows.soft.md,
      }}
    >
      Content
    </Box>
  );
};
```

## Setup

Provider zaten `App/index.tsx` içinde eklendi:

```tsx
<ThemeProvider theme={theme}>
  <AdaptiveUIProvider>
    <CssBaseline />
    <AppRouter />
  </AdaptiveUIProvider>
</ThemeProvider>
```

Artık tüm component'lerde `useAdaptiveUIContext()` kullanılabilir.

