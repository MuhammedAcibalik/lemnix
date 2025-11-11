/**
 * ScaleIn Animation Component
 *
 * @module shared/ui/Motion
 * @version 3.0.0
 */

import React from "react";
import { motion } from "framer-motion";

export interface ScaleInProps {
  readonly children: React.ReactNode;
  readonly delay?: number;
  readonly duration?: number;
  readonly scale?: number;
  readonly spring?: boolean;
  readonly origin?: string;
}

export const ScaleIn: React.FC<ScaleInProps> = ({
  children,
  delay = 0,
  duration = 0.5,
  scale = 0.95,
  spring = false,
  origin = "center",
}) => {
  const transition = spring
    ? ({ type: "spring", stiffness: 300, damping: 20, delay } as const)
    : ({ duration, delay, ease: [0.4, 0, 0.2, 1] } as const);

  return (
    <motion.div
      initial={{ opacity: 0, scale }}
      animate={{ opacity: 1, scale: 1 }}
      transition={transition}
      style={{ transformOrigin: origin }}
    >
      {children}
    </motion.div>
  );
};
