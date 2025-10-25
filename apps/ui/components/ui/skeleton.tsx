"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  shimmer?: boolean;
}

export function Skeleton({ 
  className, 
  variant = "rectangular",
  width,
  height,
  shimmer = true 
}: SkeletonProps) {
  const variantClasses = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  const style = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };

  return (
    <div
      className={cn(
        "bg-[#1a1f2e] relative overflow-hidden",
        shimmer && "skeleton-shimmer",
        variantClasses[variant],
        className
      )}
      style={style}
    >
      {shimmer && (
        <div className="absolute inset-0 skeleton-shimmer-gradient" />
      )}
    </div>
  );
}

// Skeleton variants for common use cases

export function SkeletonText({ 
  lines = 1, 
  className 
}: { 
  lines?: number; 
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          variant="text" 
          className={i === lines - 1 ? "w-3/4" : "w-full"}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("cyber-card p-6 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Skeleton width={120} height={24} />
        <Skeleton variant="circular" width={40} height={40} />
      </div>
      <SkeletonText lines={3} />
      <Skeleton height={200} />
    </div>
  );
}

export function SkeletonChart({ 
  className,
  height = 300,
  shimmer = true
}: { 
  className?: string;
  height?: number;
  shimmer?: boolean;
}) {
  // Fixed heights for consistent SSR/CSR rendering (no Math.random)
  const barHeights = [0.6, 0.8, 0.5, 0.7, 0.9, 0.4, 0.65, 0.75, 0.55, 0.85, 0.45, 0.7];
  
  return (
    <div className={cn("cyber-card", className)}>
      <div className="p-4 border-b border-[#1a1f2e]">
        <Skeleton width={150} height={20} shimmer={shimmer} />
      </div>
      <div className="p-6">
        <div className="flex items-end justify-between gap-2 mb-4" style={{ height }}>
          {barHeights.map((ratio, i) => (
            <Skeleton
              key={i}
              className="flex-1"
              height={height * ratio}
              shimmer={shimmer}
            />
          ))}
        </div>
        <div className="flex justify-between">
          <Skeleton width={60} height={16} shimmer={shimmer} />
          <Skeleton width={60} height={16} shimmer={shimmer} />
          <Skeleton width={60} height={16} shimmer={shimmer} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable({ 
  rows = 5,
  columns = 4,
  className,
  shimmer = true
}: { 
  rows?: number;
  columns?: number;
  className?: string;
  shimmer?: boolean;
}) {
  return (
    <div className={cn("cyber-card p-4", className)}>
      {/* Header */}
      <div className="flex gap-4 mb-4 pb-4 border-b border-[#1a1f2e]">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="flex-1" height={16} shimmer={shimmer} />
        ))}
      </div>
      
      {/* Rows */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4 items-center">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton 
                key={colIndex} 
                className="flex-1" 
                height={colIndex === 0 ? 24 : 16}
                shimmer={shimmer}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonMatrix({ className, shimmer = true }: { className?: string; shimmer?: boolean }) {
  return (
    <div className={cn("cyber-card", className)}>
      <div className="p-4 border-b border-[#1a1f2e]">
        <Skeleton width={120} height={20} shimmer={shimmer} />
      </div>
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="p-3 bg-[#0a0a14] rounded-lg border border-[#1a1f2e]">
              <Skeleton width={40} height={16} className="mb-2" shimmer={shimmer} />
              <Skeleton width={60} height={20} className="mb-1" shimmer={shimmer} />
              <Skeleton width={50} height={14} shimmer={shimmer} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

