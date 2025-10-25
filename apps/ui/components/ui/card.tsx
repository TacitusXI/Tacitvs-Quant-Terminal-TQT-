"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  glass?: boolean;
  specular?: boolean; // Metal specular highlights
  variant?: "standard" | "elevated" | "critical";
}

export function Card({ 
  children, 
  className, 
  glow = false, 
  glass = false, 
  specular = false,
  variant = "standard"
}: CardProps) {
  return (
    <motion.div
      className={cn(
        "cyber-card p-6 scanlines",
        glass && "backdrop-blur-xl",
        specular && "metal-specular",
        {
          "neon-glow-cyan": glow && variant === "standard",
          "neon-glow-purple": variant === "elevated",
          "border-[#8AFF00]/40": variant === "critical", // Ion green for critical cards
        },
        className
      )}
      whileHover={{ 
        scale: 1.01,
        y: -4
      }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <motion.div 
      className={cn("mb-4", className)}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      {children}
    </motion.div>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <motion.h3 
      className={cn("text-lg font-bold cyber-text uppercase tracking-wider", className)}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      {children}
    </motion.h3>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <motion.div 
      className={cn("", className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
