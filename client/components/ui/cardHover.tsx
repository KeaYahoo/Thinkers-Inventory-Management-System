import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const MotionDiv = motion.div;

type MotionDivProps = React.ComponentPropsWithoutRef<typeof MotionDiv>;

interface CardHoverProps extends Omit<MotionDivProps, "className"> {
  className?: string;
}

export const CardHover = React.forwardRef<HTMLDivElement, CardHoverProps>(
  ({ className, children, transition, whileHover, whileFocus, ...props }, ref) => {
    const prefersReducedMotion = useReducedMotion();
    const hoverAnimation = prefersReducedMotion ? undefined : { y: -6, boxShadow: "0 20px 45px -20px rgba(7, 96, 85, 0.4)" };
    const baseShadow = "0 12px 30px -24px rgba(7, 96, 85, 0.35)";

    return (
      <MotionDiv
        ref={ref}
        className={cn(
          "rounded-xl border border-primary-brown/10 bg-card text-card-foreground shadow-sm transition-shadow",
          className,
        )}
        style={{ boxShadow: baseShadow }}
        whileHover={hoverAnimation ?? whileHover}
        whileFocus={hoverAnimation ?? whileFocus}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : transition ?? { type: "spring", stiffness: 220, damping: 18 }
        }
        {...props}
      >
        {children}
      </MotionDiv>
    );
  },
);
CardHover.displayName = "CardHover";
