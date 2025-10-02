/**
 * Star Rating: renders filled/outline stars with optional interactive controls for keyboard and pointer users.
 */
import { useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { StarIcon as SolidStarIcon } from "@heroicons/react/24/solid";
import { StarIcon as OutlineStarIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
} as const;

type InteractiveProps = {
  value: number;
  onChange: (value: number) => void;
  readOnly?: false;
};

type ReadOnlyProps = {
  value?: never;
  onChange?: never;
  readOnly: true;
};

export type StarRatingProps = {
  rating: number;
  outOf?: number;
  size?: keyof typeof sizeMap;
  className?: string;
  ariaLabelledBy?: string;
} & (InteractiveProps | ReadOnlyProps);

const MotionSpan = motion.span;

export function StarRating({
  rating,
  outOf = 5,
  size = "md",
  className,
  ariaLabelledBy,
  ...rest
}: StarRatingProps) {
  const stars = Array.from({ length: outOf }, (_, index) => index + 1);
  const isInteractive = "onChange" in rest && typeof rest.onChange === "function" && !rest.readOnly;
  const prefersReducedMotion = useReducedMotion();

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!isInteractive) return;
      const { onChange, value } = rest;
      if (event.key === "ArrowRight" || event.key === "ArrowUp") {
        event.preventDefault();
        onChange(Math.min(outOf, value + 1));
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
        event.preventDefault();
        onChange(Math.max(1, value - 1));
      }
    },
    [isInteractive, rest, outOf],
  );

  const hoverAnimation = prefersReducedMotion ? undefined : { scale: 1.15 };
  const tapAnimation = prefersReducedMotion ? undefined : { scale: 1.3 };
  const activeAnimate = prefersReducedMotion ? { scale: 1 } : { scale: 1.05 };
  const inactiveAnimate = { scale: 1 };
  const transition = prefersReducedMotion ? undefined : { type: "spring" as const, stiffness: 320, damping: 20, mass: 0.5 };

  return (
    <div
      className={className}
      {...(isInteractive
        ? {
            role: "radiogroup" as const,
            "aria-label": ariaLabelledBy ? undefined : "Rating",
            "aria-labelledby": ariaLabelledBy,
            tabIndex: 0,
            onKeyDown: handleKeyDown,
          }
        : { "aria-hidden": true })}
    >
      <div className="flex items-center gap-1">
        {stars.map((value) => {
          const displayValue = isInteractive ? rest.value : rating;
          const filled = value <= displayValue;
          const Icon = filled ? SolidStarIcon : OutlineStarIcon;

          if (isInteractive) {
            return (
              <Button
                key={value}
                type="button"
                role="radio"
                aria-checked={rest.value === value}
                onClick={() => rest.onChange(value)}
                variant="ghost"
                size="icon"
                className="group h-8 w-8 p-0 focus-visible:ring-primary-brown"
              >
                <MotionSpan
                  initial={false}
                  animate={filled ? activeAnimate : inactiveAnimate}
                  transition={transition}
                  whileHover={hoverAnimation}
                  whileTap={tapAnimation}
                  className={cn(
                    sizeMap[size],
                    "transition-colors duration-150",
                    filled
                      ? "text-primary-brown"
                      : "text-gray-300 group-hover:text-primary-brown group-focus-visible:text-primary-brown",
                  )}
                >
                  <Icon aria-hidden />
                </MotionSpan>
                <span className="sr-only">{value} Star</span>
              </Button>
            );
          }

          return (
            <MotionSpan
              key={value}
              initial={false}
              animate={filled ? activeAnimate : inactiveAnimate}
              transition={transition}
              className={cn(sizeMap[size], filled ? "text-primary-brown" : "text-gray-300")}
            >
              <Icon aria-hidden />
            </MotionSpan>
          );
        })}
      </div>
    </div>
  );
}
