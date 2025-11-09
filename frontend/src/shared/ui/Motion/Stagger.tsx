/**
 * Stagger Animation Component
 * Animates children with stagger delay
 *
 * @module shared/ui/Motion
 * @version 2.0.0
 */

import React from "react";
import { motion } from "framer-motion";

export interface StaggerProps {
  readonly children: React.ReactNode;
  readonly staggerDelay?: number;
  readonly duration?: number;
}

export const Stagger: React.FC<StaggerProps> = ({
  children,
  staggerDelay = 0.1,
  duration = 0.3,
}) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration,
                ease: [0.4, 0, 0.2, 1],
              },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};
