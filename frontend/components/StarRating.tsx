"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number | null;        // puntuación actual (1-5) o null
  onChange?: (score: number) => void;  // si se pasa, es interactivo
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  count?: number;
}

const sizes = { sm: "h-3 w-3", md: "h-4 w-4", lg: "h-5 w-5" };

export default function StarRating({
  value,
  onChange,
  size = "md",
  showValue = false,
  count,
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const active = hovered ?? value ?? 0;
  const starSize = sizes[size];
  const interactive = !!onChange;

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => interactive && setHovered(star)}
            onMouseLeave={() => interactive && setHovered(null)}
            className={cn(
              "focus:outline-none",
              interactive ? "cursor-pointer" : "cursor-default"
            )}
          >
            <Star
              className={cn(
                starSize,
                "transition-colors",
                star <= active
                  ? "fill-amber-400 text-amber-400"
                  : "fill-none text-gray-300"
              )}
            />
          </button>
        ))}
      </div>

      {showValue && value !== null && (
        <span className="text-sm font-medium text-muted-foreground">
          {value?.toFixed(1)}
          {count !== undefined && (
            <span className="font-normal"> ({count})</span>
          )}
        </span>
      )}
    </div>
  );
}
