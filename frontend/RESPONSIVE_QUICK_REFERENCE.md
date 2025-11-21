# 📱 Responsive Design Quick Reference v3.0

> Quick reference guide for the LEMNİX responsive design system v3.0

## 🎯 Breakpoints

```typescript
xs:   320px  // Mobile small
sm:   480px  // Mobile large
md:   768px  // Tablet
lg:   1024px // Laptop
xl:   1366px // Desktop HD
xxl:  1920px // Desktop FHD
xxxl: 2560px // Ultra-wide
```

## 🪝 Common Hooks

```tsx
// Responsive state
const { isMobile, isTablet, isDesktop, width } = useResponsive();

// Responsive values
const cols = useResponsiveValue({ mobile: 1, tablet: 2, desktop: 3 });

// Container queries
const { ref, isSmall } = useContainerQuery();

// Touch detection
const { isTouch } = useTouchDevice();
const size = useTouchTargetSize(32); // Returns 44 on touch

// Orientation
const { isPortrait, isLandscape } = useOrientation();
```

## 🎨 Fluid Typography

```tsx
import { fluidTypography } from '@/app/theme/designSystem.v3';

// Display (hero)
fontSize: fluidTypography.display.lg  // 32px → 72px

// Headings
fontSize: fluidTypography.heading.h1  // 30px → 36px

// Body
fontSize: fluidTypography.body.base   // 14px → 16px
```

## 📐 Responsive Spacing

```tsx
import { responsive } from '@/app/theme';

// Padding (xs, sm, md, lg, xl, xxl, xxxl)
sx={responsive.padding(2, 3, 4, 5, 6, 7, 8)}
// Result: 8px → 12px → 16px → 20px → 24px → 28px → 32px

// Margin
sx={responsive.margin(1, 2, 3)}
// Result: 4px → 8px → 12px
```

## 📦 Grid Layouts

```tsx
import { gridSizes } from '@/app/theme';

<Grid container spacing={3}>
  <Grid {...gridSizes.featureCard}>
    {/* 12 → 6 → 4 → 3 cols */}
  </Grid>
  
  <Grid {...gridSizes.statCard}>
    {/* 12 → 6 → 3 cols */}
  </Grid>
</Grid>
```

## 🎯 MUI Responsive Props

```tsx
// Spacing
<Box sx={{ p: { xs: 2, md: 4, lg: 6 } }}>

// Display
<Box sx={{ display: { xs: 'none', md: 'block' } }}>

// Flex direction
<Box sx={{ flexDirection: { xs: 'column', md: 'row' } }}>

// Width
<Box sx={{ width: { xs: '100%', md: 600 } }}>

// Font size
<Typography sx={{ fontSize: { xs: '14px', md: '16px' } }}>
```

## 📱 Touch Targets

```tsx
// Minimum (WCAG AA)
minWidth: 44, minHeight: 44

// Using constant
import { touchTargets } from '@/app/theme';
minWidth: touchTargets.minimum  // 44px
```

## 🎪 Media Queries

```tsx
import { mediaQuery } from '@/app/theme';

// Styled component
const MyComponent = styled.div`
  padding: 16px;
  
  ${mediaQuery.up('md')} {
    padding: 24px;
  }
  
  ${mediaQuery.between('md', 'lg')} {
    padding: 20px;
  }
`;
```

## 📦 Container

```tsx
import { container } from '@/app/theme';

<Box sx={container('xl')}>
  {/* Max-width 1200px with responsive padding */}
</Box>
```

## 🎨 Layout Presets

```tsx
import { layouts } from '@/app/theme';

// Hero section
<Box sx={layouts.hero}>

// Standard section
<Box sx={layouts.section}>

// Dashboard
<Box sx={layouts.dashboard.container}>
  <Grid {...layouts.dashboard.grid}>
```

## 🚀 Quick Start

```tsx
// 1. Import what you need
import { useResponsive, useResponsiveValue } from '@/shared/hooks';
import { responsive, gridSizes, layouts } from '@/app/theme';
import { fluidTypography } from '@/app/theme/designSystem.v3';

// 2. Use in component
function MyPage() {
  const { isMobile, isDesktop } = useResponsive();
  const columns = useResponsiveValue({ mobile: 1, desktop: 3 });
  
  return (
    <Box sx={layouts.section}>
      <Typography sx={{ fontSize: fluidTypography.heading.h1 }}>
        Page Title
      </Typography>
      
      <Grid container spacing={3}>
        {items.map(item => (
          <Grid key={item.id} {...gridSizes.featureCard}>
            <Card sx={responsive.padding(2, 3, 4)}>
              {item.content}
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
```

## 📚 Full Documentation

For complete documentation, see:
- **User Guide**: `frontend/RESPONSIVE_DESIGN_SYSTEM.md`
- **Implementation**: `RESPONSIVE_DESIGN_SYSTEM_IMPLEMENTATION_SUMMARY.md`

---

## Legacy FSD System (Below)



### Import Layout Components
```typescript
import { Container, Grid, Stack } from '@/shared/ui';
```

### Import Responsive Hooks
```typescript
import { useBreakpointFSD, useMediaQueryFSD } from '@/shared/hooks';
```

### Import Breakpoints
```typescript
import { breakpoints, mediaQuery } from '@/shared/config';
```

## Common Patterns

### 1. Basic Responsive Container
```tsx
<Container maxWidth="xl" padding="md">
  <h1>My Content</h1>
</Container>
```

### 2. Responsive Grid Layout
```tsx
// 1 column on mobile, 2 on tablet, 3 on desktop
<Grid cols={1} colsMd={2} colsLg={3} gap="md">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</Grid>
```

### 3. Flex Stack Layout
```tsx
// Horizontal row with spacing
<Stack direction="row" spacing="md" align="center">
  <Button>Action 1</Button>
  <Button>Action 2</Button>
</Stack>

// Vertical column
<Stack direction="column" spacing="lg">
  <Section>Part 1</Section>
  <Section>Part 2</Section>
</Stack>
```

### 4. Conditional Rendering by Breakpoint
```tsx
const { isMobile, isDesktop } = useBreakpointFSD();

return (
  <>
    {isMobile && <MobileLayout />}
    {isDesktop && <DesktopLayout />}
  </>
);
```

### 5. Media Query Hook
```tsx
const isLargeScreen = useMediaQueryFSD('(min-width: 1024px)');
const isPortrait = useMediaQueryFSD('(orientation: portrait)');

if (isLargeScreen) {
  // Show expanded view
}
```

### 6. Advanced Breakpoint Detection
```tsx
const { current, isAbove, isBelow } = useBreakpointFSD();

// Check current breakpoint
if (current === 'mobile') { /* ... */ }

// Check relative to breakpoint
if (isAbove('md')) { /* Show desktop features */ }
if (isBelow('lg')) { /* Compact layout */ }
```

## Component Props Reference

### Container
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `maxWidth` | `'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| 'full'` | `'xl'` | Maximum width |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Padding size |
| `center` | `boolean` | `true` | Center horizontally |
| `className` | `string` | `''` | Additional CSS classes |
| `as` | `keyof JSX.IntrinsicElements` | `'div'` | HTML element |

### Grid
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `cols` | `number` | `1` | Columns on mobile |
| `colsMd` | `number` | `cols` | Columns on tablet |
| `colsLg` | `number` | `colsMd` | Columns on desktop |
| `colsXl` | `number` | `colsLg` | Columns on wide |
| `gap` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Gap size |
| `className` | `string` | `''` | Additional CSS classes |
| `as` | `keyof JSX.IntrinsicElements` | `'div'` | HTML element |

### Stack
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `direction` | `'row' \| 'column'` | `'column'` | Stack direction |
| `spacing` | `'none' \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Spacing size |
| `align` | `'start' \| 'center' \| 'end' \| 'stretch'` | `'stretch'` | Cross-axis alignment |
| `justify` | `'start' \| 'center' \| 'end' \| 'between' \| 'around' \| 'evenly'` | `'start'` | Main-axis alignment |
| `wrap` | `boolean` | `false` | Allow wrapping |
| `className` | `string` | `''` | Additional CSS classes |
| `as` | `keyof JSX.IntrinsicElements` | `'div'` | HTML element |

## Breakpoints

| Name | Size | Use Case |
|------|------|----------|
| `mobile` | 320px | Mobile phones |
| `sm` | 640px | Small tablets |
| `tablet` / `md` | 768px | Tablets |
| `desktop` / `lg` | 1024px | Laptops |
| `wide` / `xl` | 1280px | Desktop |
| `2xl` | 1536px | Large desktop |

## Best Practices

1. **Mobile First**: Design for mobile, then add larger breakpoints
   ```tsx
   <Grid cols={1} colsLg={3}> {/* Not colsLg={1} cols={3} */}
   ```

2. **Use Semantic Components**: Prefer Container/Grid/Stack over custom div
   ```tsx
   <Container> {/* Better than <div style={{maxWidth: '1280px'}}> */}
   ```

3. **Consistent Spacing**: Use spacing props instead of inline styles
   ```tsx
   <Stack spacing="md"> {/* Better than gap: '1rem' */}
   ```

4. **Type Safety**: TypeScript will catch invalid prop values
   ```tsx
   <Container maxWidth="invalid"> {/* TypeScript error ✓ */}
   ```

## Migration from MUI

If you're using MUI responsive utilities, both systems work side-by-side:

```tsx
// Old MUI way (still works)
import { useMediaQuery } from '@mui/material';
const isMobile = useMediaQuery('(max-width: 600px)');

// New FSD way
import { useMediaQueryFSD } from '@/shared/hooks';
const isMobile = useMediaQueryFSD('(max-width: 600px)');
```

Choose based on your needs:
- **FSD**: Lightweight, independent, mobile-first
- **MUI**: Integrated with Material-UI theme

## See Also

- [FSD_ARCHITECTURE.md](./FSD_ARCHITECTURE.md) - Complete architecture guide
- [FSD_IMPLEMENTATION_SUMMARY.md](../FSD_IMPLEMENTATION_SUMMARY.md) - Implementation details
- [ResponsiveExample.tsx](../frontend/src/shared/ui/ResponsiveExample.tsx) - Working example
