/**
 * SlideIn Animation Component
 *
 * @module shared/ui/Motion
 * @version 3.0.0
 */

import React from "react";
import { motion, type Variants } from "framer-motion";

export interface SlideInProps {
  readonly children: React.ReactNode;
  readonly direction?: "up" | "down" | "left" | "right";
  readonly duration?: number;
  readonly delay?: number;
  readonly distance?: number;
  readonly once?: boolean;
  readonly viewport?: boolean;
}

export const SlideIn: React.FC<SlideInProps> = ({
  children,
  direction = "left",
  duration = 0.5,
  delay = 0,
  distance = 100,
  once = true,
  viewport = true,
}) => {
  const variants: Variants = {
    hidden: {
      x:
        direction === "left" ? -distance : direction === "right" ? distance : 0,
      y: direction === "up" ? distance : direction === "down" ? -distance : 0,
    },
    visible: {
      x: 0,
      y: 0,
    },
  };

  return (
    <motion.div
      initial="hidden"
      {...(viewport
        ? {
            whileInView: "visible" as const,
            viewport: { once, margin: "-100px" },
          }
        : { animate: "visible" as const })}
      transition={{ duration, delay, ease: [0, 0, 0.2, 1] }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
};
