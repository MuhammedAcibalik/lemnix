/**
 * FadeIn Animation Component
 *
 * @module shared/ui/Motion
 * @version 3.0.0
 */

import React from "react";
import { motion, type Variants } from "framer-motion";

export interface FadeInProps {
  readonly children: React.ReactNode;
  readonly delay?: number;
  readonly duration?: number;
  readonly direction?: "up" | "down" | "left" | "right" | "none";
  readonly distance?: number;
  readonly once?: boolean;
  readonly viewport?: boolean;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  duration = 0.5,
  direction = "up",
  distance = 20,
  once = true,
  viewport = true,
}) => {
  const variants: Variants = {
    hidden: {
      opacity: 0,
      y: direction === "up" ? distance : direction === "down" ? -distance : 0,
      x:
        direction === "left" ? distance : direction === "right" ? -distance : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView={viewport ? "visible" : undefined}
      animate={viewport ? undefined : "visible"}
      viewport={viewport ? { once, margin: "-100px" } : undefined}
      transition={{ duration, delay, ease: "easeOut" }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
};
