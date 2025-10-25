"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "success" | "warning" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  glow?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", glow = false, ...props }, ref) => {
    return (
      <motion.button
        className={cn(
          "cyber-btn relative inline-flex items-center justify-center rounded-lg font-bold uppercase tracking-wider disabled:pointer-events-none disabled:opacity-50",
          {
            // Variants - Silent Blade palette
            "border-[#6243DD] text-[#2D8EDF] hover:border-[#2D8EDF] hover:text-white": variant === "primary",
            "border-[#16A34A] text-[#16A34A] hover:border-[#22c55e] hover:text-white": variant === "success",
            "border-[#FFB020] text-[#FFB020] hover:border-[#fbbf24] hover:text-white": variant === "warning",
            "border-[#F43F5E] text-[#F43F5E] hover:border-[#f87171] hover:text-white": variant === "danger",
            "border-transparent text-[#2D8EDF] hover:border-[#6243DD]/30 hover:bg-[#0a0a14]/50": variant === "ghost",
            
            // Sizes
            "h-8 px-3 text-xs": size === "sm",
            "h-10 px-4 text-sm": size === "md",
            "h-12 px-6 text-base": size === "lg",
            
            // Glow effect
            "neon-glow-cyan": glow && variant === "primary",
          },
          className
        )}
        whileHover={{ 
          y: -2,
          transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
        }}
        whileTap={{ 
          y: 0,
          transition: { duration: 0.1 }
        }}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
