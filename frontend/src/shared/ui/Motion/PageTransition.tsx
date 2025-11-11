/**
 * PageTransition Component
 * Smooth transitions between pages/routes
 *
 * @module shared/ui/Motion
 * @version 3.0.0
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface PageTransitionProps {
  readonly children: React.ReactNode;
  readonly mode?: "wait" | "sync" | "popLayout";
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  mode = "wait",
}) => (
  <AnimatePresence mode={mode}>
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  </AnimatePresence>
);
