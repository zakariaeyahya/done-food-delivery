"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
}

export function StarRating({ rating, maxRating = 5, size = "md" }: StarRatingProps) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }).map((_, i) => (
        <Star
          key={i}
          className={`${sizes[size]} ${
            i < Math.round(rating)
              ? "text-amber-400 fill-amber-400"
              : "text-slate-600"
          }`}
        />
      ))}
    </div>
  );
}

