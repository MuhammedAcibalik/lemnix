# Motion & Animations System v3.0

A comprehensive, performant animation system built with Framer Motion for smooth micro-interactions, page transitions, and delightful user experiences.

## 📦 Installation

Framer Motion is already installed as a dependency:

```json
"framer-motion": "^12.23.22"
```

## 🚀 Quick Start

```tsx
import { FadeIn, HoverScale, AnimatedCounter } from "@/shared";

function MyComponent() {
  return (
    <FadeIn direction="up" duration={0.6}>
      <HoverScale scale={1.05} glow>
        <div>
          <h1>Welcome!</h1>
          <AnimatedCounter value={1234} prefix="$" />
        </div>
      </HoverScale>
    </FadeIn>
  );
}
```

## 📚 Components

### Core Animation Components

#### FadeIn

Fade in animation with optional directional movement.

```tsx
<FadeIn
  direction="up" // 'up' | 'down' | 'left' | 'right' | 'none'
  duration={0.5} // seconds
  delay={0} // seconds
  distance={20} // pixels
  once={true} // animate only once
  viewport={true} // animate when in viewport
>
  <YourContent />
</FadeIn>
```

**Use cases:** Hero sections, cards, content reveals

#### ScaleIn

Scale animation from small to normal size.

```tsx
<ScaleIn
  scale={0.95} // initial scale
  duration={0.5} // seconds
  delay={0} // seconds
  spring={false} // use spring animation
  origin="center" // transform-origin
>
  <YourContent />
</ScaleIn>
```

**Use cases:** Modal entrances, popups, emphasis

#### SlideIn

Slide in from any direction.

```tsx
<SlideIn
  direction="left" // 'up' | 'down' | 'left' | 'right'
  distance={100} // pixels
  duration={0.5} // seconds
  delay={0} // seconds
  once={true} // animate only once
  viewport={true} // animate when in viewport
>
  <YourContent />
</SlideIn>
```

**Use cases:** Sidebars, panels, cards entering from side

#### Stagger

Stagger animation for child elements.

```tsx
<Stagger
  staggerDelay={0.1} // delay between children (seconds)
  duration={0.5} // duration per child
  direction="forward" // 'forward' | 'reverse'
>
  <Item1 />
  <Item2 />
  <Item3 />
</Stagger>
```

**Use cases:** Lists, grids, sequential reveals

### Specialized Components

#### AnimatedCounter

Count up animation with formatting support.

```tsx
<AnimatedCounter
  value={1234.56} // target value
  duration={2} // seconds
  decimals={2} // decimal places
  prefix="₺" // prefix text
  suffix="K" // suffix text
/>
```

**Use cases:** Statistics, KPIs, dashboards

#### Shimmer

Shimmer/shine effect overlay.

```tsx
<Shimmer
  duration={2} // seconds
  direction="horizontal" // 'horizontal' | 'vertical'
>
  <YourContent />
</Shimmer>
```

**Use cases:** Loading skeletons, premium effects, buttons

#### Pulse

Pulse/heartbeat animation.

```tsx
<Pulse
  intensity="medium" // 'low' | 'medium' | 'high'
  speed="normal" // 'slow' | 'normal' | 'fast'
  glow={false} // add glow effect
>
  <StatusBadge />
</Pulse>
```

**Use cases:** Status indicators, badges, live indicators

#### PageTransition

Smooth page transitions.

```tsx
<PageTransition mode="wait">
  <YourPageContent />
</PageTransition>
```

**Use cases:** Route transitions, page changes

### Hover & Interaction Components

#### HoverScale

Scale effect on hover.

```tsx
<HoverScale
  scale={1.05} // scale amount
  glow={false} // add glow on hover
  duration={0.2} // seconds
>
  <Button />
</HoverScale>
```

**Use cases:** Buttons, cards, clickable items

#### HoverLift

Lift effect with shadow on hover.

```tsx
<HoverLift
  liftAmount={-8} // pixels (negative = up)
  duration={0.2} // seconds
>
  <Card />
</HoverLift>
```

**Use cases:** Cards, tiles, product cards

#### TapShrink

Shrink effect on tap/click.

```tsx
<TapShrink scale={0.95}>
  <Button />
</TapShrink>
```

**Use cases:** Buttons, interactive elements

## 🎨 Animation Variants

Pre-defined animation variants for consistency:

```tsx
import {
  fadeInVariants,
  fadeInUpVariants,
  scaleVariants,
  slideUpVariants,
  staggerContainerVariants,
  easings,
} from "@/shared";

// Use with motion components
<motion.div variants={fadeInUpVariants} />;
```

Available variants:

- `fadeInVariants`, `fadeInUpVariants`, `fadeInDownVariants`, `fadeInLeftVariants`, `fadeInRightVariants`
- `scaleVariants`, `scaleInVariants`, `scaleOutVariants`
- `slideUpVariants`, `slideDownVariants`, `slideLeftVariants`, `slideRightVariants`
- `staggerContainerVariants`, `staggerItemVariants`
- `fadeScaleVariants`, `slideScaleVariants`

## 🎯 Easing Functions

```tsx
import { easings } from "@/shared";

// Available easings
easings.easeInOut; // [0.4, 0, 0.2, 1]
easings.easeOut; // [0, 0, 0.2, 1]
easings.easeIn; // [0.4, 0, 1, 1]
easings.spring; // { type: 'spring', stiffness: 300, damping: 20 }
easings.springBouncy; // { type: 'spring', stiffness: 400, damping: 10 }
easings.springGentle; // { type: 'spring', stiffness: 200, damping: 25 }
```

## ♿ Accessibility

### useReducedMotion Hook

Respect user's motion preferences:

```tsx
import { useReducedMotion } from "@/shared";

function MyComponent() {
  const shouldReduceMotion = useReducedMotion();

  return shouldReduceMotion ? (
    <div>Static content</div>
  ) : (
    <FadeIn>
      <div>Animated content</div>
    </FadeIn>
  );
}
```

The hook automatically detects the `prefers-reduced-motion` media query.

## 🎯 Best Practices

### Performance

1. **Use GPU-accelerated properties** ✅

   ```tsx
   // Good - GPU accelerated
   <motion.div animate={{ x: 100, opacity: 0.5 }} />

   // Bad - Causes reflow
   <motion.div animate={{ width: '100%', marginLeft: 20 }} />
   ```

2. **Keep animations short** ⏱️
   - Micro-interactions: 0.2s - 0.3s
   - Content reveals: 0.4s - 0.6s
   - Special effects: 1s - 2s (counters, etc.)

3. **Enable viewport detection** 👁️

   ```tsx
   <FadeIn viewport={true}>  {/* Animates on scroll */}
   ```

4. **Avoid animating expensive properties** 🚫
   - ❌ width, height
   - ❌ margin, padding
   - ❌ border-width
   - ✅ transform, opacity

### User Experience

1. **Don't overdo it** - Subtle is better than flashy
2. **Be consistent** - Use similar animations for similar actions
3. **Provide feedback** - Use animations to confirm user actions
4. **Respect preferences** - Always use `useReducedMotion` for major animations

## 🔧 Configuration

Default animation configuration:

```tsx
import { defaultAnimationConfig } from "@/shared";

defaultAnimationConfig.duration; // 0.3s
defaultAnimationConfig.staggerDelay; // 0.1s
defaultAnimationConfig.distance; // 20px
defaultAnimationConfig.scale; // 0.95
```

## 📖 Examples

See `examples.tsx` for comprehensive usage examples including:

- Real-world card grids
- Loading skeletons
- Status badges
- Combined effects
- And more!

## 🎯 Common Patterns

### Card Grid with Stagger

```tsx
<Stagger staggerDelay={0.1}>
  {cards.map((card) => (
    <FadeIn key={card.id} direction="up">
      <HoverLift>
        <Card>{card.content}</Card>
      </HoverLift>
    </FadeIn>
  ))}
</Stagger>
```

### Interactive Button

```tsx
<HoverScale scale={1.05} glow>
  <TapShrink>
    <Button>Click Me</Button>
  </TapShrink>
</HoverScale>
```

### Loading Skeleton

```tsx
<Shimmer duration={1.5}>
  <div style={{ height: 20, background: "#e5e7eb" }} />
</Shimmer>
```

## 📊 Performance Targets

- ✅ First Animation: < 16ms (60 FPS)
- ✅ Smooth Scrolling: 60 FPS maintained
- ✅ No Layout Thrashing
- ✅ Memory Efficient

## 🔗 Resources

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Web Animations Best Practices](https://web.dev/animations/)
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)

## 📝 Version History

### v3.0.0 (Current)

- ✅ All core animation components
- ✅ Specialized animations (Counter, Shimmer, Pulse)
- ✅ Hover & interaction components
- ✅ Accessibility support (useReducedMotion)
- ✅ Comprehensive variants library
- ✅ Full TypeScript support

---

**Need help?** Check `examples.tsx` for comprehensive usage examples.
