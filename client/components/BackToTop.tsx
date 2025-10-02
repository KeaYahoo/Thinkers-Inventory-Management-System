import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      const threshold = window.innerHeight;
      setIsVisible(window.scrollY > threshold);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <motion.button
      type="button"
      aria-label="Back to top"
      onClick={handleClick}
      className={cn(
        "fixed bottom-6 right-6 z-50 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-brown text-white shadow-md transition-colors hover:bg-brown-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-brown",
        !isVisible && "pointer-events-none"
      )}
      initial={false}
      animate={isVisible ? "visible" : "hidden"}
      variants={{
        visible: {
          opacity: 1,
          scale: 1,
        },
        hidden: {
          opacity: 0,
          scale: prefersReducedMotion ? 1 : 0.8,
        },
      }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25, ease: "easeOut" }}
    >
      <ArrowUpIcon className="h-4 w-4" aria-hidden />
    </motion.button>
  );
}
