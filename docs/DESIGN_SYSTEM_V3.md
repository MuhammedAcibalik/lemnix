# Design System v3.0 Documentation

## Overview

Design System v3.0 provides a comprehensive, type-safe foundation for building modern UI components. It includes design tokens, Material-UI theme configuration, and React hooks for seamless integration.

## File Structure

```
frontend/src/shared/
├── design-system/
│   ├── index.ts         # Barrel exports
│   ├── tokens.ts        # Design tokens (colors, spacing, typography, etc.)
│   └── theme.ts         # Material-UI theme configuration
└── hooks/
    ├── index.ts         # Hook exports
    └── useDesignSystem.ts  # Design system React hook
```

## Quick Start

### Importing Tokens

```tsx
import { colors, spacing, typography } from '@/shared/design-system';

// Use directly in styles
const MyComponent = () => (
  <Box sx={{
    color: colors.primary.main,
    padding: spacing['4'] + 'px',
    fontSize: typography.fontSize.lg,
  }} />
);
```

### Using the Hook

```tsx
import { useDesignSystem } from '@/shared/hooks';

const MyComponent = () => {
  const ds = useDesignSystem();
  
  return (
    <Box sx={{
      backgroundColor: ds.getColor('primary.600'),
      padding: ds.getSpacing('4'),
      borderRadius: ds.getBorderRadius('lg'),
      boxShadow: ds.getShadow('soft.md'),
      ...ds.getGlassStyle('light'),
    }}>
      Content
    </Box>
  );
};
```

### Using the Theme

```tsx
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '@/shared/design-system';

function App() {
  return (
    <ThemeProvider theme={theme}>
      {/* Your app */}
    </ThemeProvider>
  );
}
```

## Design Tokens

### Colors

- **Brand Colors**: `primary`, `secondary`, `accent`
- **Semantic Colors**: `success`, `warning`, `error`, `info`
- **Neutrals**: `neutral`, `slate`, `grey`
- **Functional**: Domain-specific colors for optimization, production, materials

```tsx
colors.primary.main     // #1d4ed8
colors.success[600]     // #059669
colors.text.primary     // #0f172a
```

### Spacing

Based on 4px (0.25rem) base unit:

```tsx
spacing['0']   // 0
spacing['1']   // 4px
spacing['4']   // 16px
spacing['8']   // 32px
spacing['96']  // 384px

// Semantic aliases
spacingScale.xs   // 8px
spacingScale.sm   // 16px
spacingScale.md   // 24px
spacingScale.lg   // 32px
```

### Typography

```tsx
typography.fontSize.base     // 1rem (16px)
typography.fontWeight.bold   // 700
typography.lineHeight.normal // 1.5

// Preset styles
typography.heading.h1        // Complete heading style
typography.body.base         // Body text style
typography.label.lg          // Label style
```

### Shadows

```tsx
shadows.soft.md              // Subtle elevation
shadows.crisp.lg             // Defined elevation
shadows.glow.primary         // Brand glow effect
shadows.button.hover         // Button hover shadow
```

### Gradients

```tsx
gradients.primary.default    // Primary brand gradient
gradients.mesh.hero          // Mesh gradient for hero sections
gradients.surface.white      // Surface gradient
```

### Other Tokens

- **Border Radius**: `borderRadius.xs` to `borderRadius['4xl']`, `borderRadius.full`
- **Transitions**: `transitions.fast`, `transitions.base`, `transitions.all`
- **Z-Index**: `zIndex.modal`, `zIndex.tooltip`, `zIndex.overlay`
- **Breakpoints**: `breakpoints.xs` to `breakpoints['3xl']`
- **Component Sizes**: `componentSizes.button.md`, `componentSizes.input.lg`

## Hook API

The `useDesignSystem` hook provides helper functions for common operations:

### Color Functions

```tsx
const ds = useDesignSystem();

ds.getColor('primary.600')           // Get nested color
ds.withOpacity('#3b82f6', 0.5)       // Add opacity to color
ds.createGradient(color1, color2)    // Create custom gradient
ds.createGlow('#3b82f6', 0.6)        // Create glow effect
```

### Spacing Functions

```tsx
ds.getSpacing('4')                   // Get spacing value (returns 16)
ds.getComponentSize('button', 'md')  // Get component size config
```

### Style Functions

```tsx
ds.getShadow('soft.md')              // Get shadow value
ds.getBorderRadius('lg')             // Get border radius value
ds.getGradient('primary.default')    // Get gradient value
ds.getTypography('heading.h1')       // Get typography style
```

### Glass Morphism

```tsx
ds.getGlassStyle('light')            // Returns glass morphism styles
// Returns: { background, border, backdropFilter, boxShadow }
```

### Focus Rings

```tsx
ds.getFocusRing('primary')           // Returns focus ring styles
// Returns: { outline: 'none', boxShadow: '...' }
```

## Material-UI Integration

The theme automatically configures Material-UI components with Design System v3.0 tokens:

- Button: Enhanced with gradients and transitions
- Card: Modern elevation and hover effects
- TextField: Consistent styling and focus states
- Chip: Proper sizing and typography
- Dialog: Modern shadows and border radius
- Tooltip: Enhanced appearance
- Tabs: Clean styling with smooth transitions
- Alert: Semantic color backgrounds

## Backward Compatibility

The old versioned files remain available for backward compatibility:

- `@/App/theme/designSystem.v2` (deprecated)
- `@/App/theme/designSystem.v3` (deprecated)
- `@/shared/hooks/useDesignSystem.v2` (deprecated)
- `@/shared/hooks/useDesignSystem.v3` (deprecated)

**Recommendation**: Migrate to the new canonical location:

```tsx
// Old (deprecated)
import { useDesignSystem } from '@/shared/hooks/useDesignSystem.v3';

// New (recommended)
import { useDesignSystem } from '@/shared/hooks';
```

## Best Practices

1. **Use tokens instead of hardcoded values**
   ```tsx
   // ❌ Bad
   <Box sx={{ padding: '16px' }} />
   
   // ✅ Good
   <Box sx={{ padding: spacing['4'] + 'px' }} />
   ```

2. **Leverage helper functions**
   ```tsx
   // ❌ Verbose
   <Box sx={{ color: colors.primary[600] }} />
   
   // ✅ Concise
   <Box sx={{ color: ds.getColor('primary.600') }} />
   ```

3. **Use semantic names**
   ```tsx
   // ❌ Implementation details
   <Button sx={{ color: '#1d4ed8' }} />
   
   // ✅ Semantic
   <Button sx={{ color: colors.primary.main }} />
   ```

4. **Leverage the theme**
   ```tsx
   // ❌ Bypassing theme
   <Button variant="contained" sx={{ background: '#1d4ed8' }} />
   
   // ✅ Using theme
   <Button variant="contained" color="primary" />
   ```

## TypeScript Support

All tokens and functions are fully typed with TypeScript:

```tsx
// Autocomplete and type checking work out of the box
const color: string = colors.primary.main;
const space: number = spacing['4'];
const shadow: string = shadows.soft.md;

// Hook return type
const ds: DesignSystem = useDesignSystem();
```

## Version

Current version: **3.0.0**

All JSDoc comments include version information. File names are clean without version suffixes.

## Support

For questions or issues, please refer to:
- Main repository documentation
- Issue tracker: [GitHub Issues](https://github.com/MuhammedAcibalik/lemnix/issues)
- PR for this implementation: #17
