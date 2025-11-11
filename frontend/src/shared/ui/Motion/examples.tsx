/**
 * Motion & Animations v3.0 - Usage Examples
 *
 * @fileoverview Comprehensive examples of all animation components
 * @module shared/ui/Motion
 * @version 3.0.0
 *
 * This file demonstrates how to use all the animation components
 * in the Motion system. Copy and adapt these examples for your use cases.
 */

import React from "react";
import {
  FadeIn,
  ScaleIn,
  SlideIn,
  Stagger,
  AnimatedCounter,
  Shimmer,
  Pulse,
  PageTransition,
  HoverScale,
  HoverLift,
  TapShrink,
  useReducedMotion,
} from "./index";

// ============================================================================
// Example 1: Basic FadeIn Animation
// ============================================================================

export const FadeInExample = () => (
  <div>
    {/* Fade in from bottom (default) */}
    <FadeIn direction="up" duration={0.6}>
      <div>This content fades in from the bottom</div>
    </FadeIn>

    {/* Fade in from left */}
    <FadeIn direction="left" distance={50} delay={0.2}>
      <div>This content fades in from the left</div>
    </FadeIn>

    {/* Fade in without movement */}
    <FadeIn direction="none" duration={1}>
      <div>This content just fades in</div>
    </FadeIn>

    {/* Disable viewport detection - animate immediately */}
    <FadeIn viewport={false}>
      <div>This animates on mount, not on scroll</div>
    </FadeIn>

    {/* Animate every time it enters viewport */}
    <FadeIn once={false}>
      <div>This animates every time it scrolls into view</div>
    </FadeIn>
  </div>
);

// ============================================================================
// Example 2: ScaleIn Animation
// ============================================================================

export const ScaleInExample = () => (
  <div>
    {/* Basic scale animation */}
    <ScaleIn scale={0.8} duration={0.5}>
      <div>Scales up from 0.8 to 1.0</div>
    </ScaleIn>

    {/* Spring animation for bouncy effect */}
    <ScaleIn spring delay={0.2}>
      <div>Bouncy spring animation</div>
    </ScaleIn>

    {/* Custom transform origin */}
    <ScaleIn origin="top left" scale={0.9}>
      <div>Scales from top-left corner</div>
    </ScaleIn>
  </div>
);

// ============================================================================
// Example 3: SlideIn Animation
// ============================================================================

export const SlideInExample = () => (
  <div>
    {/* Slide in from left */}
    <SlideIn direction="left" distance={100}>
      <div>Slides in from the left</div>
    </SlideIn>

    {/* Slide in from right */}
    <SlideIn direction="right" distance={150} duration={0.8}>
      <div>Slides in from the right</div>
    </SlideIn>

    {/* Slide in from top */}
    <SlideIn direction="up" distance={80}>
      <div>Slides in from the top</div>
    </SlideIn>
  </div>
);

// ============================================================================
// Example 4: Stagger Animation for Lists
// ============================================================================

export const StaggerExample = () => {
  const items = [
    "First item",
    "Second item",
    "Third item",
    "Fourth item",
    "Fifth item",
  ];

  return (
    <div>
      {/* Basic stagger */}
      <Stagger staggerDelay={0.1}>
        {items.map((item, index) => (
          <div key={index} style={{ padding: "10px", background: "#f0f0f0" }}>
            {item}
          </div>
        ))}
      </Stagger>

      {/* Reverse stagger animation */}
      <Stagger direction="reverse" staggerDelay={0.15} duration={0.6}>
        {items.map((item, index) => (
          <div key={index}>{item}</div>
        ))}
      </Stagger>
    </div>
  );
};

// ============================================================================
// Example 5: AnimatedCounter
// ============================================================================

export const AnimatedCounterExample = () => (
  <div>
    {/* Basic counter */}
    <AnimatedCounter value={1234} duration={2} />

    {/* Counter with decimals */}
    <AnimatedCounter value={99.99} decimals={2} duration={1.5} prefix="$" />

    {/* Counter with suffix */}
    <AnimatedCounter value={50} suffix="%" duration={1} />

    {/* Large number with formatting */}
    <AnimatedCounter
      value={1234567}
      duration={3}
      prefix="₺"
      suffix=" TL"
      decimals={0}
    />

    {/* Decimal counter with prefix and suffix */}
    <AnimatedCounter
      value={1234.56}
      duration={2}
      decimals={2}
      prefix="₺"
      suffix="K"
    />
  </div>
);

// ============================================================================
// Example 6: Shimmer Effect
// ============================================================================

export const ShimmerExample = () => (
  <div>
    {/* Shimmer on button */}
    <Shimmer duration={2}>
      <button style={{ padding: "10px 20px", background: "#3b82f6" }}>
        Click Me
      </button>
    </Shimmer>

    {/* Shimmer on card */}
    <Shimmer duration={3}>
      <div
        style={{
          padding: "20px",
          background: "white",
          border: "1px solid #ddd",
        }}
      >
        Card with shimmer effect
      </div>
    </Shimmer>

    {/* Vertical shimmer */}
    <Shimmer direction="vertical" duration={2.5}>
      <div>Vertical shimmer animation</div>
    </Shimmer>
  </div>
);

// ============================================================================
// Example 7: Pulse Animation
// ============================================================================

export const PulseExample = () => (
  <div>
    {/* Basic pulse */}
    <Pulse intensity="medium" speed="normal">
      <div
        style={{
          padding: "10px",
          background: "#10b981",
          borderRadius: "4px",
          color: "white",
        }}
      >
        Active Status
      </div>
    </Pulse>

    {/* Pulse with glow */}
    <Pulse intensity="high" speed="slow" glow>
      <div>Pulsing with glow effect</div>
    </Pulse>

    {/* Fast pulse */}
    <Pulse intensity="low" speed="fast">
      <span style={{ fontSize: "32px" }}>🔴</span>
    </Pulse>
  </div>
);

// ============================================================================
// Example 8: Page Transition
// ============================================================================

export const PageTransitionExample = () => (
  <PageTransition>
    <div>
      <h1>Page Content</h1>
      <p>This entire page animates when route changes</p>
    </div>
  </PageTransition>
);

// ============================================================================
// Example 9: Hover Interactions
// ============================================================================

export const HoverInteractionsExample = () => (
  <div>
    {/* HoverScale */}
    <HoverScale scale={1.05}>
      <button style={{ padding: "10px 20px" }}>Hover to scale</button>
    </HoverScale>

    {/* HoverScale with glow */}
    <HoverScale scale={1.08} glow>
      <div
        style={{
          padding: "20px",
          background: "#3b82f6",
          color: "white",
          borderRadius: "8px",
        }}
      >
        Card with hover scale and glow
      </div>
    </HoverScale>

    {/* HoverLift for cards */}
    <HoverLift liftAmount={-10}>
      <div
        style={{
          padding: "20px",
          background: "white",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        Card lifts on hover
      </div>
    </HoverLift>

    {/* TapShrink for buttons */}
    <TapShrink scale={0.95}>
      <button style={{ padding: "12px 24px", background: "#3b82f6" }}>
        Click me!
      </button>
    </TapShrink>
  </div>
);

// ============================================================================
// Example 10: Combined Effects
// ============================================================================

export const CombinedEffectsExample = () => (
  <FadeIn direction="up" duration={0.6}>
    <HoverScale scale={1.05} glow>
      <TapShrink>
        <div
          style={{
            padding: "20px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            borderRadius: "12px",
            cursor: "pointer",
          }}
        >
          <h3>Premium Card</h3>
          <p>Fades in, scales on hover, shrinks on tap</p>
        </div>
      </TapShrink>
    </HoverScale>
  </FadeIn>
);

// ============================================================================
// Example 11: Respecting Reduced Motion
// ============================================================================

export const ReducedMotionExample = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div>
      <p>Motion preference: {shouldReduceMotion ? "Reduced" : "Normal"}</p>

      {/* Conditionally apply animations */}
      {shouldReduceMotion ? (
        <div>Content without animation</div>
      ) : (
        <FadeIn direction="up">
          <div>Content with animation</div>
        </FadeIn>
      )}
    </div>
  );
};

// ============================================================================
// Example 12: Real-World Card Grid
// ============================================================================

export const CardGridExample = () => {
  const cards = [
    { id: 1, title: "Card 1", value: 1234 },
    { id: 2, title: "Card 2", value: 5678 },
    { id: 3, title: "Card 3", value: 9012 },
    { id: 4, title: "Card 4", value: 3456 },
  ];

  return (
    <Stagger staggerDelay={0.1}>
      {cards.map((card) => (
        <FadeIn key={card.id} direction="up">
          <HoverLift liftAmount={-8}>
            <TapShrink>
              <div
                style={{
                  padding: "24px",
                  background: "white",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  cursor: "pointer",
                }}
              >
                <h3>{card.title}</h3>
                <AnimatedCounter
                  value={card.value}
                  duration={2}
                  prefix="$"
                  decimals={0}
                />
              </div>
            </TapShrink>
          </HoverLift>
        </FadeIn>
      ))}
    </Stagger>
  );
};

// ============================================================================
// Example 13: Loading Skeleton with Shimmer
// ============================================================================

export const LoadingSkeletonExample = () => (
  <div style={{ padding: "20px" }}>
    <Shimmer duration={1.5}>
      <div
        style={{
          height: "20px",
          background: "#e5e7eb",
          borderRadius: "4px",
          marginBottom: "10px",
        }}
      />
    </Shimmer>
    <Shimmer duration={1.5}>
      <div
        style={{
          height: "20px",
          background: "#e5e7eb",
          borderRadius: "4px",
          width: "80%",
          marginBottom: "10px",
        }}
      />
    </Shimmer>
    <Shimmer duration={1.5}>
      <div
        style={{
          height: "20px",
          background: "#e5e7eb",
          borderRadius: "4px",
          width: "60%",
        }}
      />
    </Shimmer>
  </div>
);

// ============================================================================
// Example 14: Status Badge with Pulse
// ============================================================================

export const StatusBadgeExample = () => (
  <div>
    <Pulse intensity="medium" speed="normal" glow>
      <span
        style={{
          padding: "4px 12px",
          background: "#10b981",
          color: "white",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: "600",
        }}
      >
        ACTIVE
      </span>
    </Pulse>

    <Pulse intensity="low" speed="slow">
      <span
        style={{
          padding: "4px 12px",
          background: "#f59e0b",
          color: "white",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: "600",
        }}
      >
        PENDING
      </span>
    </Pulse>
  </div>
);

// ============================================================================
// Performance Notes
// ============================================================================

/**
 * PERFORMANCE BEST PRACTICES:
 *
 * 1. Always use GPU-accelerated properties:
 *    ✅ transform (translateX, translateY, scale, rotate)
 *    ✅ opacity
 *    ❌ width, height, margin, padding
 *
 * 2. Respect prefers-reduced-motion:
 *    Use the useReducedMotion hook to disable animations
 *    for users who prefer reduced motion
 *
 * 3. Viewport detection:
 *    Enable viewport detection (viewport={true}) for animations
 *    that trigger on scroll to improve performance
 *
 * 4. Animation duration:
 *    Keep animations short (0.2s - 0.5s) for best UX
 *    Longer durations (> 1s) should only be used for
 *    special effects like counters
 *
 * 5. Stagger animations:
 *    Keep stagger delays short (0.05s - 0.15s)
 *    to avoid slow list rendering
 *
 * 6. Spring animations:
 *    Use sparingly as they can be more CPU intensive
 *    Great for micro-interactions like button presses
 */
