"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = "rectangular",
  width,
  height,
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-white/5 rounded";

  const variantClasses = {
    text: "h-4",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#1a1a24]/80 p-6 space-y-4">
      <Skeleton variant="text" width="60%" height={24} />
      <Skeleton variant="text" width="80%" height={16} />
      <Skeleton variant="text" width="40%" height={16} />
      <Skeleton variant="rectangular" height={200} />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton variant="rectangular" width="20%" height={40} />
          <Skeleton variant="rectangular" width="30%" height={40} />
          <Skeleton variant="rectangular" width="25%" height={40} />
          <Skeleton variant="rectangular" width="25%" height={40} />
        </div>
      ))}
    </div>
  );
}

