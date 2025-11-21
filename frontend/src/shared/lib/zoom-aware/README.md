# Zoom-Aware Utilities

Zoom/scale-aware utilities for creating UI elements that adapt to any resolution or zoom level without breaking.

## Problem

When users change browser zoom or use different screen resolutions/scales, UI elements can:
- Cards shrink too much and become unusable
- Buttons grow too large or shrink too small
- Text overflows containers
- Elements overlap or break layout

## Solution

This utility library provides:
1. **Fluid sizing** - Elements scale smoothly between min and max values
2. **Safe constraints** - Elements never become too small or too large
3. **Overflow control** - Text and content never overflow containers
4. **Responsive units** - Uses rem, vw, and clamp() for better scaling

## Usage

### Basic Fluid Sizing

```tsx
import { fluid, fluidFontSize, fluidSpacing } from "@/shared/lib/zoom-aware";

// Fluid font size
<Typography sx={{ fontSize: fluidFontSize("0.875rem", "1.125rem") }} />

// Fluid spacing
<Box sx={{ padding: fluidSpacing("0.5rem", "2rem") }} />

// Custom fluid value
<Box sx={{ width: fluid("90%", "100%", "1200px") }} />
```

### Zoom-Aware Styles

```tsx
import { zoomAwareCard, zoomAwareButton, zoomAwareText } from "@/shared/lib/zoom-aware/styles";

// Card with zoom-aware styles
<Card sx={zoomAwareCard} />

// Button with zoom-aware styles
<Button sx={zoomAwareButton} />

// Text with truncation
<Typography sx={zoomAwareText}>Long text that truncates...</Typography>
```

### Safe Constraints

```tsx
import { safeMinWidth, safeMaxWidth } from "@/shared/lib/zoom-aware";

// Container that never gets too small
<Box sx={{ minWidth: safeMinWidth("12rem") }} />

// Container that never exceeds viewport
<Box sx={{ maxWidth: safeMaxWidth("1200px") }} />
```

## Best Practices

1. **Always use min/max constraints** - Prevent elements from becoming unusable
2. **Use fluid sizing for typography** - Text scales smoothly with zoom
3. **Add overflow control** - Prevent content from breaking layout
4. **Use rem instead of px** - Better zoom scaling
5. **Test at different zoom levels** - 50%, 75%, 100%, 125%, 150%, 200%

## Examples

### Card Component

```tsx
import { zoomAwareCard, fluidSpacing } from "@/shared/lib/zoom-aware";

<Card
  sx={{
    ...zoomAwareCard,
    padding: fluidSpacing("1rem", "2rem"),
  }}
>
  <CardContent>
    <Typography sx={{ fontSize: fluidFontSize("0.875rem", "1.125rem") }}>
      Content
    </Typography>
  </CardContent>
</Card>
```

### Button Component

```tsx
import { zoomAwareButton, fluidFontSize } from "@/shared/lib/zoom-aware";

<Button
  sx={{
    ...zoomAwareButton,
    fontSize: fluidFontSize("0.875rem", "1rem"),
    padding: fluidSpacing("0.5rem", "1rem"),
  }}
>
  Click Me
</Button>
```

### Responsive Grid

```tsx
import { zoomAwareGrid, responsiveGap } from "@/shared/lib/zoom-aware";

<Box
  sx={{
    ...zoomAwareGrid,
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: responsiveGap("1rem", "2rem"),
  }}
>
  {items.map(item => <Card key={item.id} {...item} />)}
</Box>
```

