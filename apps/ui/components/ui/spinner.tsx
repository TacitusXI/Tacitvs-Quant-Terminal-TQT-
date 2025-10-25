"use client";

import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "purple" | "cyan" | "white" | "ion" | "magenta";
  className?: string;
}

export function Spinner({ 
  size = "md", 
  color = "cyan",
  className 
}: SpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
    xl: "w-16 h-16 border-4",
  };

  const colorClasses = {
    purple: "border-[var(--color-primary)] border-t-transparent",
    cyan: "border-[var(--color-secondary)] border-t-transparent",
    white: "border-white border-t-transparent",
    ion: "border-[var(--color-ion)] border-t-transparent",
    magenta: "border-[var(--color-shock)] border-t-transparent",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

export function SpinnerOverlay({ 
  message,
  className 
}: { 
  message?: string;
  className?: string;
}) {
  return (
    <div className={cn(
      "absolute inset-0 bg-[#0a0a14]/80 backdrop-blur-sm flex flex-col items-center justify-center z-50",
      className
    )}>
      <Spinner size="lg" color="cyan" />
      {message && (
        <div className="mt-4 text-[var(--color-secondary)] font-mono text-sm animate-pulse">
          {message}
        </div>
      )}
    </div>
  );
}

export function SpinnerDots({ 
  size = "md",
  color = "cyan",
  className 
}: SpinnerProps) {
  const dotSizes = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-3 h-3",
    xl: "w-4 h-4",
  };

  const dotColors = {
    purple: "bg-[var(--color-primary)]",
    cyan: "bg-[var(--color-secondary)]",
    white: "bg-white",
    ion: "bg-[var(--color-ion)]",
    magenta: "bg-[var(--color-shock)]",
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div
        className={cn(
          "rounded-full animate-bounce",
          dotSizes[size],
          dotColors[color]
        )}
        style={{ animationDelay: "0ms" }}
      />
      <div
        className={cn(
          "rounded-full animate-bounce",
          dotSizes[size],
          dotColors[color]
        )}
        style={{ animationDelay: "150ms" }}
      />
      <div
        className={cn(
          "rounded-full animate-bounce",
          dotSizes[size],
          dotColors[color]
        )}
        style={{ animationDelay: "300ms" }}
      />
    </div>
  );
}

export function SpinnerPulse({ 
  size = "md",
  color = "cyan",
  className 
}: SpinnerProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  const colorClasses = {
    purple: "bg-[var(--color-primary)]",
    cyan: "bg-[var(--color-secondary)]",
    white: "bg-white",
    ion: "bg-[var(--color-ion)]",
    magenta: "bg-[var(--color-shock)]",
  };

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <div
        className={cn(
          "absolute inset-0 rounded-full opacity-75 animate-ping",
          colorClasses[color]
        )}
      />
      <div
        className={cn(
          "absolute inset-0 rounded-full",
          colorClasses[color]
        )}
      />
    </div>
  );
}

