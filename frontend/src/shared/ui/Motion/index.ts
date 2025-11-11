/**
 * Motion Components Public API
 *
 * @module shared/ui/Motion
 * @version 3.0.0
 *
 * Framer Motion-based animation system for smooth, performant animations
 */

// Core animations
export { FadeIn } from "./FadeIn";
export type { FadeInProps } from "./FadeIn";

export { ScaleIn } from "./ScaleIn";
export type { ScaleInProps } from "./ScaleIn";

export { SlideIn } from "./SlideIn";
export type { SlideInProps } from "./SlideIn";

export { Stagger } from "./Stagger";
export type { StaggerProps } from "./Stagger";

// Specialized animations
export { AnimatedCounter } from "./AnimatedCounter";
export type { AnimatedCounterProps } from "./AnimatedCounter";

export { Shimmer } from "./Shimmer";
export type { ShimmerProps } from "./Shimmer";

export { Pulse } from "./Pulse";
export type { PulseProps } from "./Pulse";

export { PageTransition } from "./PageTransition";
export type { PageTransitionProps } from "./PageTransition";

// Hover & interaction
export { HoverScale } from "./HoverScale";
export type { HoverScaleProps } from "./HoverScale";

export { HoverLift } from "./HoverLift";
export type { HoverLiftProps } from "./HoverLift";

export { TapShrink } from "./TapShrink";
export type { TapShrinkProps } from "./TapShrink";

// Utilities
export * from "./variants";
export type * from "./types";
