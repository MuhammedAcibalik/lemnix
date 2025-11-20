# 📐 Responsive Design System Documentation

## Overview

This document provides comprehensive guidance on using the responsive design system implemented in the LEMNİX application. The system ensures pixel-perfect rendering across all screen resolutions from mobile devices (320px) to ultra-wide displays (2560px+).

## 🎯 Target Resolutions

- **Mobile Small**: 320px - 479px (iPhone SE, small smartphones)
- **Mobile Large**: 480px - 767px (larger smartphones)
- **Tablet**: 768px - 1023px (iPad, tablets)
- **Laptop Small**: 1024px - 1365px (small laptops)
- **Desktop Standard**: 1366px - 1919px (HD displays, standard desktops)
- **Desktop Large**: 1920px - 2559px (Full HD displays)
- **Desktop Ultra-Wide**: 2560px+ (2K/QHD ultra-wide displays)

## 📊 Breakpoint System

### Breakpoint Values

```typescript
{
  xs: 320,   // Mobile small
  sm: 480,   // Mobile large
  md: 768,   // Tablet
  lg: 1024,  // Laptop small
  xl: 1366,  // Desktop standard (HD)
  xxl: 1920, // Desktop large (Full HD)
  xxxl: 2560 // Desktop ultra-wide (2K)
}
```

### Container Max-Widths

Content is constrained to these max-widths to prevent over-stretching:

```typescript
{
  xs: "100%",
  sm: "100%",
  md: 720,
  lg: 960,
  xl: 1200,
  xxl: 1440,
  xxxl: 1920,
}
```

## 🎨 Fluid Typography

The system uses CSS `clamp()` for smooth font size scaling between breakpoints.

### Usage Example

```tsx
import { fluidTypography } from '@/app/theme/designSystem.v3';

// In styled component
const Title = styled.h1`
  font-size: ${fluidTypography.heading.h1};
  /* Result: clamp(1.875rem, 1.5rem + 1.5vw, 2.25rem) */
  /* Scales from 30px to 36px */
`;

// In MUI sx prop
<Typography sx={{ fontSize: fluidTypography.body.base }}>
  Content
</Typography>
```

### Typography Scale

#### Display (Hero Sections)
- **2xl**: 48px → 128px
- **xl**: 40px → 96px
- **lg**: 32px → 72px
- **md**: 28px → 60px
- **sm**: 24px → 48px

#### Headings
- **h1**: 30px → 36px
- **h2**: 24px → 30px
- **h3**: 20px → 24px
- **h4**: 18px → 20px
- **h5**: 16px → 18px
- **h6**: 14px → 16px

#### Body Text
- **xl**: 18px → 20px
- **lg**: 16px → 18px
- **base**: 14px → 16px (recommended minimum)
- **sm**: 13px → 14px
- **xs**: 12px → 13px

## 🪝 Responsive Hooks

### useResponsive

Main hook for responsive design detection.

```tsx
import { useResponsive } from '@/shared/hooks';

function MyComponent() {
  const {
    breakpoint,    // Current breakpoint name
    isMobile,      // xs or sm
    isTablet,      // md
    isDesktop,     // lg or xl
    width,         // Current viewport width
    height,        // Current viewport height
    isTouchDevice, // Touch capability detection
    isPortrait,    // Orientation
  } = useResponsive();

  return (
    <div>
      {isMobile ? <MobileView /> : <DesktopView />}
    </div>
  );
}
```

### useResponsiveValue

Get different values based on current breakpoint.

```tsx
import { useResponsiveValue } from '@/shared/hooks';

function ResponsiveCard() {
  const columns = useResponsiveValue({
    mobile: 1,
    sm: 2,
    tablet: 2,
    desktop: 3,
    wide: 4,
  }, 1);

  const padding = useResponsiveValue({
    mobile: 16,
    tablet: 24,
    desktop: 32,
  });

  return (
    <Grid container columns={columns} spacing={padding / 8}>
      {/* content */}
    </Grid>
  );
}
```

### useContainerQuery

Container-based responsive queries using ResizeObserver.

```tsx
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

### useOrientation

Detect device orientation changes.

```tsx
import { useOrientation } from '@/shared/hooks';

function OrientationAwareImage() {
  const { isPortrait, isLandscape, orientation, angle } = useOrientation();
  
  return (
    <img 
      src={isPortrait ? '/portrait.jpg' : '/landscape.jpg'}
      alt="Responsive"
      style={{ transform: `rotate(${angle}deg)` }}
    />
  );
}
```

### useTouchDevice

Optimize for touch vs mouse input.

```tsx
import { useTouchDevice, useTouchTargetSize } from '@/shared/hooks';

function InteractiveButton() {
  const { isTouch, hasMouse, isHybrid } = useTouchDevice();
  const targetSize = useTouchTargetSize(32);
  
  return (
    <button 
      style={{ 
        minWidth: targetSize,
        minHeight: targetSize,
      }}
      onMouseEnter={hasMouse ? handleHover : undefined}
    >
      Action
    </button>
  );
}
```

## 🛠️ Responsive Utilities

### Responsive Spacing

```tsx
import { responsive } from '@/app/theme';

// Apply different spacing at different breakpoints
<Box sx={responsive.padding(2, 3, 4, 5, 6, 7, 8)}>
  {/* xs: 8px, sm: 12px, md: 16px, lg: 20px, xl: 24px, xxl: 28px, xxxl: 32px */}
</Box>

<Box sx={responsive.margin(1, 2, 3)}>
  {/* xs: 4px, sm: 8px, md: 12px */}
</Box>
```

### Grid Configurations

Pre-configured responsive grid layouts:

```tsx
import { gridSizes } from '@/app/theme';

<Grid container spacing={3}>
  <Grid {...gridSizes.featureCard}>
    {/* 12 cols mobile → 3 cols desktop */}
  </Grid>
  
  <Grid {...gridSizes.statCard}>
    {/* 12 cols mobile → 3 cols desktop */}
  </Grid>
  
  <Grid {...gridSizes.formSection}>
    {/* 12 cols mobile → 6 cols desktop */}
  </Grid>
</Grid>
```

### Container Helper

```tsx
import { container } from '@/app/theme';

<Box sx={container('xl')}>
  {/* Max-width 1200px with responsive padding */}
</Box>

<Box sx={container('xxl')}>
  {/* Max-width 1440px with responsive padding */}
</Box>
```

### Media Queries

```tsx
import { mediaQuery } from '@/app/theme';

const StyledComponent = styled.div`
  padding: 16px;
  
  ${mediaQuery.up('md')} {
    padding: 24px;
  }
  
  ${mediaQuery.up('xl')} {
    padding: 32px;
  }
  
  ${mediaQuery.between('md', 'lg')} {
    /* Styles for tablets only */
  }
`;
```

### Layout Presets

```tsx
import { layouts } from '@/app/theme';

// Hero section
<Box sx={layouts.hero}>
  <Typography variant="h1">Hero Title</Typography>
</Box>

// Standard section
<Box sx={layouts.section}>
  {/* Content with responsive padding */}
</Box>

// Dashboard
<Box sx={layouts.dashboard.container}>
  <Grid {...layouts.dashboard.grid}>
    {/* Dashboard content */}
  </Grid>
</Box>
```

## 📱 Mobile-First Approach

All styles should be written mobile-first, then enhanced for larger screens:

```tsx
// ✅ Good - Mobile first
<Box sx={{
  padding: 2,           // Mobile: 8px
  md: { padding: 3 },   // Tablet: 12px
  lg: { padding: 4 },   // Desktop: 16px
}}>

// ❌ Bad - Desktop first
<Box sx={{
  padding: 4,
  md: { padding: 3 },
  xs: { padding: 2 },
}}>
```

## 🎯 Touch Target Guidelines

### Minimum Sizes (WCAG 2.1 Level AA)

- **Minimum touch target**: 44x44px
- **Comfortable touch target**: 48x48px
- **Large touch target**: 56x56px

### Implementation

```tsx
import { touchTargets } from '@/app/theme';

<Button sx={{
  minWidth: touchTargets.minimum,
  minHeight: touchTargets.minimum,
}}>
  Action
</Button>

// Or use the hook
const size = useTouchTargetSize(32); // Returns 44 on touch devices
```

## 🎨 Component Sizing Patterns

### Buttons

```tsx
// Responsive button sizes
<Button 
  size={{ xs: 'sm', md: 'md', lg: 'lg' }}
  fullWidth={{ xs: true, md: false }}
>
  Action
</Button>
```

### Cards

```tsx
import { componentVariants } from '@/app/theme';

<Card sx={componentVariants.card.compact}>
  {/* Compact padding for mobile */}
</Card>

<Card sx={componentVariants.card.spacious}>
  {/* Spacious padding for desktop */}
</Card>
```

### Forms

```tsx
<TextField
  fullWidth
  size={{ xs: 'small', md: 'medium' }}
  sx={{
    '& .MuiInputBase-root': {
      fontSize: { xs: '14px', md: '16px' },
    }
  }}
/>
```

## 📏 Spacing Scale

The system uses an 8px base unit with a comprehensive scale:

```typescript
spacing: {
  "0": 0,      "1": 4,      "2": 8,      "3": 12,
  "4": 16,     "5": 20,     "6": 24,     "7": 28,
  "8": 32,     "9": 36,     "10": 40,    "12": 48,
  "16": 64,    "20": 80,    "24": 96,    // ... up to "96": 384
}
```

### Usage

```tsx
// Direct spacing values
<Box sx={{ p: { xs: 2, md: 4, lg: 6 } }}>
  {/* 8px → 16px → 24px */}
</Box>

// T-shirt sizes
import { spacingScale } from '@/app/theme';

<Box sx={{ padding: spacingScale.md }}>
  {/* 24px padding */}
</Box>
```

## 🖼️ Responsive Images

### Using srcset

```tsx
<img
  src="/image-medium.jpg"
  srcSet="
    /image-small.jpg 320w,
    /image-medium.jpg 768w,
    /image-large.jpg 1920w
  "
  sizes="
    (max-width: 480px) 100vw,
    (max-width: 1024px) 50vw,
    33vw
  "
  alt="Responsive"
/>
```

### Aspect Ratio

```tsx
<Box sx={{
  position: 'relative',
  paddingTop: '56.25%', // 16:9 aspect ratio
  overflow: 'hidden',
}}>
  <img 
    src="/image.jpg"
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    }}
  />
</Box>
```

## 🎭 Responsive Visibility

Hide/show elements at specific breakpoints:

```tsx
// Hide on mobile, show on desktop
<Box sx={{ display: { xs: 'none', md: 'block' } }}>
  Desktop only
</Box>

// Show on mobile, hide on desktop
<Box sx={{ display: { xs: 'block', md: 'none' } }}>
  Mobile only
</Box>

// Different components
{isMobile ? <MobileMenu /> : <DesktopMenu />}
```

## 📐 Grid System

### Responsive Columns

```tsx
<Grid container spacing={{ xs: 2, md: 3, lg: 4 }}>
  <Grid item xs={12} sm={6} md={4} lg={3}>
    {/* 1 col → 2 col → 3 col → 4 col */}
  </Grid>
</Grid>
```

### Auto-fit Grid

```tsx
<Box sx={{
  display: 'grid',
  gridTemplateColumns: {
    xs: '1fr',
    sm: 'repeat(2, 1fr)',
    md: 'repeat(3, 1fr)',
    lg: 'repeat(4, 1fr)',
  },
  gap: { xs: 2, md: 3, lg: 4 },
}}>
  {items.map(item => <Card key={item.id}>{item.content}</Card>)}
</Box>
```

## 🔍 Testing Checklist

### Breakpoint Testing

- [ ] Test at 320px (mobile small)
- [ ] Test at 375px (iPhone)
- [ ] Test at 480px (mobile large)
- [ ] Test at 768px (tablet)
- [ ] Test at 1024px (laptop)
- [ ] Test at 1366px (HD desktop)
- [ ] Test at 1920px (Full HD)
- [ ] Test at 2560px (2K ultra-wide)

### Visual Checks

- [ ] No horizontal scrollbar at any width
- [ ] All text readable without zooming
- [ ] Images not distorted
- [ ] Proper alignment and spacing
- [ ] No overlapping elements
- [ ] Touch targets ≥ 44x44px on mobile

### Functional Checks

- [ ] Forms usable on all devices
- [ ] Navigation accessible
- [ ] Buttons clickable/tappable
- [ ] Modals/dialogs display correctly
- [ ] Tables scroll horizontally on mobile
- [ ] Charts resize properly

### Performance

- [ ] No layout shift (CLS < 0.1)
- [ ] Fast resize handling (debounced)
- [ ] Smooth transitions
- [ ] Images lazy-loaded
- [ ] Code-split by route

## 🎯 Best Practices

### 1. Mobile-First

Always design for mobile first, then enhance for larger screens.

```tsx
// ✅ Good
sx={{
  fontSize: '14px',
  md: { fontSize: '16px' },
  lg: { fontSize: '18px' },
}}

// ❌ Bad
sx={{
  fontSize: '18px',
  md: { fontSize: '16px' },
  xs: { fontSize: '14px' },
}}
```

### 2. Use Relative Units

Prefer rem/em over px for better scaling.

```tsx
// ✅ Good
sx={{ fontSize: '1rem', padding: '1.5rem' }}

// ❌ Avoid when possible
sx={{ fontSize: '16px', padding: '24px' }}
```

### 3. Fluid Over Fixed

Use fluid typography and spacing when possible.

```tsx
// ✅ Good
sx={{ fontSize: fluidTypography.body.base }}

// ❌ Less flexible
sx={{ fontSize: { xs: '14px', md: '16px' } }}
```

### 4. Touch-Friendly

Ensure interactive elements are large enough on mobile.

```tsx
// ✅ Good
<IconButton sx={{ minWidth: 44, minHeight: 44 }}>

// ❌ Too small
<IconButton sx={{ width: 24, height: 24 }}>
```

### 5. Semantic Breakpoints

Use named breakpoints, not arbitrary values.

```tsx
// ✅ Good
sx={{ display: { xs: 'none', md: 'block' } }}

// ❌ Bad
sx={{ display: { 600: 'none', 900: 'block' } }}
```

## 🚀 Performance Tips

1. **Debounce resize handlers**: All hooks include debouncing (150ms)
2. **Use CSS over JS**: Prefer CSS media queries when possible
3. **Lazy load images**: Use native lazy loading or libraries
4. **Code split**: Split large components by route
5. **Memoize expensive calculations**: Use useMemo/useCallback
6. **Use ResizeObserver**: Better than window resize events
7. **Avoid layout thrashing**: Batch DOM reads and writes

## 📚 Additional Resources

- [MUI Responsive UI](https://mui.com/material-ui/guides/responsive-ui/)
- [WCAG 2.1 Touch Target Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [CSS Clamp() Calculator](https://clamp.font-size.app/)
- [Responsive Design Testing Tools](https://responsivedesignchecker.com/)

## 🐛 Common Issues

### Issue: Horizontal Scroll on Mobile

**Solution**: Ensure no fixed-width elements wider than viewport
```tsx
// ✅ Fix
<Box sx={{ maxWidth: '100%', overflow: 'hidden' }}>

// Add to root
html, body {
  overflow-x: hidden;
  max-width: 100vw;
}
```

### Issue: Touch Targets Too Small

**Solution**: Use touch target utilities
```tsx
const size = useTouchTargetSize(32); // Returns 44px on touch
```

### Issue: Font Too Small on Mobile

**Solution**: Use fluid typography or set minimum
```tsx
<Typography sx={{ 
  fontSize: fluidTypography.body.base,
  minFontSize: '14px',
}}>
```

---

**Version**: 3.0.0  
**Last Updated**: 2024  
**Maintained by**: LEMNİX Development Team
