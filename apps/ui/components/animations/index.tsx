"use client";

import { motion } from "framer-motion";

/**
 * Reusable animation variants for consistent motion language
 */

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

export const slideInRight = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 100 },
};

export const slideInLeft = {
  initial: { opacity: 0, x: -100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 },
};

/**
 * Stagger animations for lists
 */
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

/**
 * Hover animations
 */
export const hoverScale = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
};

export const hoverGlow = {
  whileHover: { 
    boxShadow: "0 0 20px rgba(98, 67, 221, 0.5)",
    transition: { duration: 0.2 },
  },
};

/**
 * Animated components
 */
export const FadeIn = ({ children, ...props }: any) => (
  <motion.div {...fadeIn} {...props}>
    {children}
  </motion.div>
);

export const FadeInUp = ({ children, ...props }: any) => (
  <motion.div {...fadeInUp} {...props}>
    {children}
  </motion.div>
);

export const ScaleIn = ({ children, ...props }: any) => (
  <motion.div {...scaleIn} {...props}>
    {children}
  </motion.div>
);

