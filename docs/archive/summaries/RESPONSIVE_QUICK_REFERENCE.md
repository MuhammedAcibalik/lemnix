# Quick Reference - FSD Responsive System

## Quick Start

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
