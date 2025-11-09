/**
 * FadeIn Animation Component
 *
 * @module shared/ui/Motion
 * @version 2.0.0
 */

import React from "react";
import { motion, type Variants } from "framer-motion";

export interface FadeInProps {
  readonly children: React.ReactNode;
  readonly delay?: number;
  readonly duration?: number;
  readonly direction?: "up" | "down" | "left" | "right" | "none";
  readonly distance?: number;
}

const variants: Record<string, Variants> = {
  up: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
  down: {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  },
  left: {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
  },
  right: {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  },
  none: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
};

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  duration = 0.3,
  direction = "up",
  distance = 20,
}) => {
  const customVariants: Variants =
    direction === "up" || direction === "down"
      ? {
          hidden: { opacity: 0, y: direction === "up" ? distance : -distance },
          visible: { opacity: 1, y: 0 },
        }
      : direction === "left" || direction === "right"
        ? {
            hidden: {
              opacity: 0,
              x: direction === "left" ? distance : -distance,
            },
            visible: { opacity: 1, x: 0 },
          }
        : variants.none;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={customVariants}
      transition={{
        duration,
        delay,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      {children}
    </motion.div>
  );
};
