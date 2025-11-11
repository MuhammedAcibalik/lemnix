# UI/UX v3.0 - Performance & Accessibility Features

This document demonstrates the new performance and accessibility features added in v3.0.

## 🚀 Performance Hooks (`usePerformance`)

### Debounce & Throttle

```tsx
import { debounce, throttle, useDebounce, useDebouncedCallback, useThrottledCallback } from '@/shared/hooks';

// Pure function debounce
const debouncedSearch = debounce((query: string) => {
  console.log('Searching for:', query);
}, 300);

// Pure function throttle
const throttledScroll = throttle(() => {
  console.log('Scroll event');
}, 100);

// Hook for debounced values
function SearchComponent() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);
  
  // debouncedQuery updates 300ms after user stops typing
  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery);
    }
  }, [debouncedQuery]);
}

// Hook for debounced callbacks
function AutosaveComponent() {
  const save = useDebouncedCallback((data: any) => {
    api.save(data);
  }, 1000);
  
  return <input onChange={(e) => save(e.target.value)} />;
}

// Hook for throttled callbacks
function ScrollComponent() {
  const handleScroll = useThrottledCallback(() => {
    updateScrollPosition();
  }, 100);
  
  return <div onScroll={handleScroll}>Content</div>;
}
```

### Performance Monitoring

```tsx
import { measureRenderTime, useRenderPerformance, scheduleIdleTask } from '@/shared/hooks';

// Measure component render time (DEV only)
function ExpensiveComponent() {
  useRenderPerformance('ExpensiveComponent');
  
  // Component logic...
}

// Or manually measure
function Component() {
  useEffect(() => {
    const end = measureRenderTime('MyComponent');
    
    // Component render logic...
    
    return end; // Logs render time on unmount
  });
}

// Schedule non-critical tasks during idle time
function DataLoader() {
  useIdleTask(() => {
    // Load non-critical data
    prefetchData();
  }, []);
}
```

## 📱 Responsive Hook (`useResponsive`)

```tsx
import { useResponsive, useBreakpoint, useBreakpointDown } from '@/shared/hooks';

function ResponsiveComponent() {
  const {
    // Current breakpoint
    breakpoint, // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    
    // Breakpoint checks
    isXs, isSm, isMd, isLg, isXl,
    
    // Device groups
    isMobile,   // xs or sm (0-899px)
    isTablet,   // md (900-1199px)
    isDesktop,  // lg or xl (1200px+)
    
    // Orientation
    isPortrait,
    isLandscape,
    
    // Feature detection
    isTouchDevice,
    isRetina,
    
    // Viewport dimensions
    width,
    height,
  } = useResponsive();
  
  // Render different layouts based on device
  if (isMobile) {
    return <MobileLayout />;
  }
  
  if (isTablet) {
    return <TabletLayout />;
  }
  
  return <DesktopLayout />;
}

// Simpler breakpoint checks
function SimpleResponsive() {
  const isDesktop = useBreakpoint('lg'); // true if >= lg (1200px)
  const isMobile = useBreakpointDown('sm'); // true if <= sm (899px)
  
  return isDesktop ? <DesktopView /> : <MobileView />;
}
```

## ⌨️ Keyboard Navigation Hook (`useKeyboardNavigation`)

```tsx
import { useKeyboardNavigation } from '@/shared/hooks';

function MenuComponent({ items, onSelect }) {
  const {
    activeIndex,
    handleKeyDown,
    getItemProps,
  } = useKeyboardNavigation({
    itemCount: items.length,
    onSelect: (index) => onSelect(items[index]),
    onCancel: () => closeMenu(),
    loop: true, // Wrap around from last to first
  });
  
  return (
    <ul role="listbox" onKeyDown={handleKeyDown}>
      {items.map((item, index) => (
        <li
          key={index}
          {...getItemProps(index)}
          style={{
            backgroundColor: index === activeIndex ? '#e3f2fd' : 'transparent'
          }}
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
}

// Supported keys:
// - ArrowDown: Move to next item
// - ArrowUp: Move to previous item
// - Home: Move to first item
// - End: Move to last item
// - Enter/Space: Select current item
// - Escape: Cancel navigation
```

## 🔒 Focus Trap Hook (`useFocusTrap`)

```tsx
import { useFocusTrap, useFocusOnMount, useFocusWhen } from '@/shared/hooks';

function Modal({ isOpen, onClose }) {
  const modalRef = useFocusTrap({
    enabled: isOpen,
    restoreFocus: true, // Return focus when modal closes
    autoFocus: true,    // Focus first element on open
    onDeactivate: onClose,
  });
  
  if (!isOpen) return null;
  
  return (
    <div ref={modalRef} role="dialog" aria-modal="true">
      <h2>Modal Title</h2>
      <button onClick={onClose}>Close</button>
    </div>
  );
}

// Auto-focus an element on mount
function SearchInput() {
  const inputRef = useFocusOnMount<HTMLInputElement>();
  return <input ref={inputRef} />;
}

// Focus when condition becomes true
function ConditionalFocus({ isEditing }) {
  const inputRef = useFocusWhen<HTMLInputElement>(isEditing);
  return <input ref={inputRef} disabled={!isEditing} />;
}
```

## ♿ Accessibility Utilities

```tsx
import {
  announceToScreenReader,
  getContrastRatio,
  meetsWCAG_AA,
  meetsWCAG_AAA,
  getAccessibleTextColor,
  checkColorContrast,
} from '@/shared/utils';

// Screen reader announcements
function NotificationComponent() {
  const notify = () => {
    announceToScreenReader('Item added to cart', 'polite');
    announceToScreenReader('Error occurred!', 'assertive'); // Higher priority
  };
}

// Color contrast checking (WCAG compliance)
function ColorPicker() {
  const bgColor = '#1d4ed8'; // Primary blue
  
  // Get contrast ratio
  const ratio = getContrastRatio('#ffffff', bgColor); // 12.63:1
  
  // Check WCAG compliance
  const passesAA = meetsWCAG_AA(ratio); // true (needs 4.5:1)
  const passesAAA = meetsWCAG_AAA(ratio); // true (needs 7:1)
  
  // Automatically choose readable text color
  const textColor = getAccessibleTextColor(bgColor); // '#ffffff'
  
  // Or check with detailed info
  const result = checkColorContrast('#ffffff', bgColor, 'AA');
  // {
  //   passes: true,
  //   ratio: 12.63,
  //   requiredRatio: 4.5
  // }
}
```

## 🦘 Skip Link Component

The SkipLink component is automatically included in the App and allows keyboard users to skip navigation:

```tsx
import { SkipLink } from '@/shared/ui';

// Already integrated in App/index.tsx
function App() {
  return (
    <>
      <SkipLink /> {/* Hidden until focused with Tab key */}
      <Navigation />
      <main id="main-content">
        <Content />
      </main>
    </>
  );
}

// Custom skip link
<SkipLink targetId="custom-content">
  İçeriğe geç
</SkipLink>
```

When a user presses Tab on page load:
1. The SkipLink appears at the top of the page
2. Pressing Enter jumps directly to main content
3. This improves accessibility by skipping repetitive navigation

## 🎯 Best Practices

### Performance
1. **Use debounce** for user input (search, autocomplete)
2. **Use throttle** for scroll/resize handlers
3. **Schedule non-critical tasks** during idle time
4. **Monitor render performance** in development

### Responsive Design
1. Use `isMobile`, `isTablet`, `isDesktop` for layout decisions
2. Consider touch devices with `isTouchDevice`
3. Optimize for retina displays with `isRetina`
4. Test between 320px and 3840px widths

### Accessibility
1. Always include **SkipLink** at the start of your app
2. Mark main content with `id="main-content"`
3. Use **focus traps** for modals and dialogs
4. Implement **keyboard navigation** for interactive lists
5. Ensure **color contrast** meets WCAG AA (4.5:1 minimum)
6. Use **screen reader announcements** for dynamic updates

## 📊 WCAG Compliance Checklist

- [x] Skip navigation link (SkipLink component)
- [x] Keyboard navigation support (useKeyboardNavigation)
- [x] Focus management (useFocusTrap)
- [x] Color contrast utilities (WCAG AA/AAA helpers)
- [x] Screen reader support (announceToScreenReader)
- [x] Responsive design (320px - 3840px)
- [x] Touch device support
- [x] Reduced motion preference

## 🎨 Example: Complete Accessible Component

```tsx
import {
  useResponsive,
  useKeyboardNavigation,
  useFocusTrap,
  useDebounce,
  announceToScreenReader,
  getAccessibleTextColor,
} from '@/shared/hooks';

function AccessibleSearchComponent() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  
  // Responsive design
  const { isMobile } = useResponsive();
  
  // Performance: debounce search
  const debouncedQuery = useDebounce(query, 300);
  
  // Accessibility: keyboard navigation
  const { activeIndex, handleKeyDown, getItemProps } = useKeyboardNavigation({
    itemCount: results.length,
    onSelect: (index) => handleSelect(results[index]),
    onCancel: () => setIsOpen(false),
  });
  
  // Accessibility: focus trap for dropdown
  const dropdownRef = useFocusTrap({
    enabled: isOpen,
    restoreFocus: true,
  });
  
  useEffect(() => {
    if (debouncedQuery) {
      // Search and announce results to screen readers
      search(debouncedQuery).then((data) => {
        setResults(data);
        announceToScreenReader(
          `${data.length} sonuç bulundu`,
          'polite'
        );
      });
    }
  }, [debouncedQuery]);
  
  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsOpen(true)}
        aria-label="Arama"
        aria-expanded={isOpen}
        aria-controls="search-results"
      />
      
      {isOpen && (
        <div
          ref={dropdownRef}
          id="search-results"
          role="listbox"
          onKeyDown={handleKeyDown}
          style={{
            maxWidth: isMobile ? '100%' : '400px',
          }}
        >
          {results.map((result, index) => (
            <div
              key={result.id}
              {...getItemProps(index)}
              role="option"
              aria-selected={index === activeIndex}
            >
              {result.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

This example demonstrates:
- ✅ Performance optimization (debouncing)
- ✅ Responsive design (mobile adaptation)
- ✅ Keyboard navigation (arrows, enter, escape)
- ✅ Focus management (focus trap)
- ✅ Screen reader support (announcements, ARIA attributes)
- ✅ WCAG compliance (semantic HTML, roles, labels)
