# FSD (Feature-Sliced Design) Architecture

This project follows the Feature-Sliced Design (FSD) methodology for a clean, scalable frontend architecture.

## Directory Structure

```
frontend/src/
├── app/                    # Application initialization layer
│   ├── index.tsx          # Root component
│   ├── providers/         # Global providers (React Query, Theme, etc.)
│   ├── theme/             # Global theme configuration
│   └── components/        # App-level components (Router, etc.)
│
├── pages/                 # Page components (route handlers)
│   └── [page-name]/       # Individual page
│
├── widgets/               # Complex UI blocks (dashboard, navigation, etc.)
│   └── [widget-name]/     # Individual widget
│
├── features/              # User interaction scenarios
│   └── [feature-name]/    # Individual feature
│
├── entities/              # Business entities
│   └── [entity-name]/     # Individual entity
│
└── shared/                # Reusable code
    ├── ui/               # UI kit components
    ├── hooks/            # Custom hooks
    ├── config/           # Configuration
    ├── lib/              # Utilities and helpers
    └── types/            # TypeScript types
```

## FSD Layers (Bottom to Top)

1. **shared** - Reusable code with no business logic
2. **entities** - Business entities (user, product, order, etc.)
3. **features** - User interactions (auth, cart, search, etc.)
4. **widgets** - Composite UI blocks (header, sidebar, etc.)
5. **pages** - Application pages
6. **app** - Application initialization

## Responsive Design System

### Breakpoints

Mobile-first breakpoints defined in `src/shared/config/breakpoints.ts`:

```typescript
{
  mobile: 320px,   // Mobile devices
  sm: 640px,       // Small tablets
  tablet: 768px,   // Tablets
  md: 768px,       // Medium screens
  desktop: 1024px, // Laptops
  lg: 1024px,      // Large screens
  wide: 1280px,    // Desktop
  xl: 1280px,      // Extra large
  '2xl': 1536px    // Ultra wide
}
```

### Responsive Hooks

#### useMediaQueryFSD

Track media query matches:

```tsx
import { useMediaQueryFSD } from '@/shared/hooks';

const isMobile = useMediaQueryFSD('(max-width: 767px)');
const isDesktop = useMediaQueryFSD('(min-width: 1024px)');
```

#### useBreakpointFSD

Detect current breakpoint:

```tsx
import { useBreakpointFSD } from '@/shared/hooks';

const { current, isAbove, isBelow, isMobile, isDesktop } = useBreakpointFSD();

if (isMobile) {
  // Mobile layout
}

if (isAbove('lg')) {
  // Desktop layout
}
```

### Layout Components

#### Container

Responsive container with max-width:

```tsx
import { Container } from '@/shared/ui';

<Container maxWidth="xl" padding="md">
  {/* Content */}
</Container>
```

Props:
- `maxWidth`: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
- `padding`: 'none' | 'sm' | 'md' | 'lg'
- `center`: boolean (default: true)

#### Grid

CSS Grid system with responsive columns:

```tsx
import { Grid } from '@/shared/ui';

<Grid cols={1} colsMd={2} colsLg={3} colsXl={4} gap="md">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Grid>
```

Props:
- `cols`: Number of columns (mobile)
- `colsMd`: Columns on tablet
- `colsLg`: Columns on desktop
- `colsXl`: Columns on wide screens
- `gap`: 'none' | 'sm' | 'md' | 'lg' | 'xl'

#### Stack

Flexible stack layout:

```tsx
import { Stack } from '@/shared/ui';

<Stack direction="row" spacing="md" align="center" justify="between">
  <button>Button 1</button>
  <button>Button 2</button>
  <button>Button 3</button>
</Stack>
```

Props:
- `direction`: 'row' | 'column'
- `spacing`: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
- `align`: 'start' | 'center' | 'end' | 'stretch'
- `justify`: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
- `wrap`: boolean

## Example Usage

See `src/shared/ui/ResponsiveExample.tsx` for a complete example demonstrating all responsive components.

## Migration Notes

### Naming Conventions

- **app** directory is lowercase (FSD standard)
- Hooks are suffixed with `FSD` (e.g., `useBreakpointFSD`) to avoid conflicts with existing MUI hooks
- Both the new FSD system and existing MUI responsive utilities are available

### Existing Responsive System

The project also has an MUI-based responsive system:
- `useResponsive` - MUI breakpoints (xs, sm, md, lg, xl)
- `useBreakpoint` - MUI breakpoint detection
- `useMediaQuery` from `@mui/material`

Choose the appropriate system based on your needs:
- **FSD system**: Simple, lightweight, CSS-based
- **MUI system**: Integrated with Material-UI theme

## Best Practices

1. **Mobile-First**: Start with mobile layout, add larger breakpoints as needed
2. **Semantic Components**: Use Container, Grid, Stack for consistent layouts
3. **Type Safety**: All components and hooks are fully typed with TypeScript
4. **Performance**: Hooks use efficient event listeners with proper cleanup
5. **SSR Safe**: All hooks handle server-side rendering gracefully
