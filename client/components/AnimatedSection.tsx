import { useRef } from "react";
import { motion, useReducedMotion, useInView, type MotionProps, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const hasWindow = typeof window !== "undefined";
if (hasWindow && !("IntersectionObserver" in window)) {
  class StubIntersectionObserver {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [] as IntersectionObserverEntry[];
    }
  }
  // @ts-expect-error setup stub for non-browser environments
  window.IntersectionObserver = StubIntersectionObserver;
}

type AnimatedSectionProps = {
  className?: string;
  delay?: number;
  variants?: Variants;
  children: React.ReactNode;
} & Omit<MotionProps, "children" | "variants">;

const defaultVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function AnimatedSection({
  className,
  children,
  delay = 0.12,
  variants = defaultVariants,
  ...motionProps
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-12% 0px" });
  const prefersReducedMotion = useReducedMotion();

  const initial = prefersReducedMotion ? "visible" : "hidden";
  const animate = prefersReducedMotion ? "visible" : isInView ? "visible" : "hidden";

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      variants={variants}
      initial={initial}
      animate={animate}
      transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: "easeOut", delay }}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}
