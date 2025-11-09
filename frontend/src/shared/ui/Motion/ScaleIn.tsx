/**
 * ScaleIn Animation Component
 *
 * @module shared/ui/Motion
 * @version 2.0.0
 */

import React from "react";
import { motion } from "framer-motion";

export interface ScaleInProps {
  readonly children: React.ReactNode;
  readonly delay?: number;
  readonly duration?: number;
  readonly scale?: number;
}

export const ScaleIn: React.FC<ScaleInProps> = ({
  children,
  delay = 0,
  duration = 0.3,
  scale = 0.9,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration,
        delay,
        ease: [0.34, 1.56, 0.64, 1], // Spring
      }}
    >
      {children}
    </motion.div>
  );
};
