"use client";

import { motion } from "framer-motion";
import { cn, getLampColor, getLampGlow } from "@/lib/utils";

interface LampProps {
  ev: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Lamp({ ev, className, size = "md" }: LampProps) {
  const color = getLampColor(ev);
  const glowClass = getLampGlow(ev);
  
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  const getPulseColor = (color: string) => {
    switch (color) {
      case "emerald": return "shadow-emerald-500/50";
      case "amber": return "shadow-amber-500/50";
      case "rose": return "shadow-rose-500/50";
      default: return "shadow-neutral-500/50";
    }
  };

  return (
    <motion.div
      className={cn(
        "rounded-full pulse-lamp",
        sizeClasses[size],
        {
          "bg-emerald-400": color === "emerald",
          "bg-amber-400": color === "amber",
          "bg-rose-400": color === "rose",
        },
        glowClass,
        className
      )}
      animate={{
        boxShadow: [
          `0 0 8px ${getPulseColor(color).split('/')[0]}`,
          `0 0 16px ${getPulseColor(color).split('/')[0]}`,
          `0 0 8px ${getPulseColor(color).split('/')[0]}`,
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

// Lamp with label for easier use
interface LampWithLabelProps extends LampProps {
  label?: string;
}

export function LampWithLabel({ ev, label, className, size = "md" }: LampWithLabelProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Lamp ev={ev} size={size} />
      {label && (
        <span className="text-xs text-neutral-400 font-mono">
          {label}
        </span>
      )}
    </div>
  );
}
