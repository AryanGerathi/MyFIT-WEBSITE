import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({ rating, size = 14, className }: { rating: number; size?: number; className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={cn(
            "transition-colors",
            i <= Math.round(rating) ? "fill-warning text-warning" : "fill-muted text-muted",
          )}
        />
      ))}
    </div>
  );
}
