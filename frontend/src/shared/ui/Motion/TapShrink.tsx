/**
 * TapShrink Component
 * Shrink on tap/click with quick spring back
 *
 * @module shared/ui/Motion
 * @version 3.0.0
 */

import React from "react";
import { motion } from "framer-motion";

export interface TapShrinkProps {
  readonly children: React.ReactNode;
  readonly scale?: number;
}

export const TapShrink: React.FC<TapShrinkProps> = ({
  children,
  scale = 0.95,
}) => {
  return (
    <motion.div
      whileTap={{ scale }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 15,
      }}
    >
      {children}
    </motion.div>
  );
};
