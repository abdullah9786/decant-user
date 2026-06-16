import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: number;
  className?: string;
}

export function StarRating({
  rating,
  max = 5,
  size = 14,
  className = "text-yellow-500",
}: StarRatingProps) {
  const rounded = Math.round(rating * 2) / 2;

  return (
    <div className={`flex ${className}`} aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }).map((_, index) => {
        const starValue = index + 1;
        const filled = rounded >= starValue;
        const half = !filled && rounded >= starValue - 0.5;

        return (
          <Star
            key={starValue}
            size={size}
            className={
              filled
                ? "fill-current"
                : half
                  ? "fill-current opacity-50"
                  : "fill-transparent opacity-30"
            }
          />
        );
      })}
    </div>
  );
}

interface InteractiveStarRatingProps {
  value: number;
  onChange: (value: number) => void;
  size?: number;
}

export function InteractiveStarRating({
  value,
  onChange,
  size = 22,
}: InteractiveStarRatingProps) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1;
        const active = starValue <= value;
        return (
          <button
            key={starValue}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
            onClick={() => onChange(starValue)}
            className={`text-yellow-500 transition-transform hover:scale-110 ${
              active ? "" : "opacity-30"
            }`}
          >
            <Star size={size} className={active ? "fill-current" : "fill-transparent"} />
          </button>
        );
      })}
    </div>
  );
}
