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
    purple: "border-[#6243DD] border-t-transparent",
    cyan: "border-[#2D8EDF] border-t-transparent",
    white: "border-white border-t-transparent",
    ion: "border-[#8AFF00] border-t-transparent",
    magenta: "border-[#FF2E88] border-t-transparent",
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
        <div className="mt-4 text-[#2D8EDF] font-mono text-sm animate-pulse">
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
    purple: "bg-[#6243DD]",
    cyan: "bg-[#2D8EDF]",
    white: "bg-white",
    ion: "bg-[#8AFF00]",
    magenta: "bg-[#FF2E88]",
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
    purple: "bg-[#6243DD]",
    cyan: "bg-[#2D8EDF]",
    white: "bg-white",
    ion: "bg-[#8AFF00]",
    magenta: "bg-[#FF2E88]",
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

