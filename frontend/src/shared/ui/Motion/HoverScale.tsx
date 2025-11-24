/**
 * HoverScale Component
 * Scale on hover with optional glow effect
 *
 * @module shared/ui/Motion
 * @version 3.0.0
 */

import React from "react";
import { motion } from "framer-motion";

export interface HoverScaleProps {
  readonly children: React.ReactNode;
  readonly scale?: number;
  readonly glow?: boolean;
  readonly duration?: number;
}

export const HoverScale: React.FC<HoverScaleProps> = ({
  children,
  scale = 1.05,
  glow = false,
  duration = 0.2,
}) => {
  return (
    <motion.div
      whileHover={{
        scale,
        ...(glow
          ? {
              boxShadow:
                "0 10px 40px rgba(59, 130, 246, 0.3), 0 0 20px rgba(59, 130, 246, 0.2)",
            }
          : {}),
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 20,
        duration,
      }}
    >
      {children}
    </motion.div>
  );
};
