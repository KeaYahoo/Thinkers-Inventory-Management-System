/**
 * Button: brand-forward action button with size/variant theming via class-variance-authority.
 */
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg border border-transparent text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-brown focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        primary: "bg-primary-brown text-white hover:bg-brown-dark",
        secondary: "bg-velvet-green text-white hover:bg-green-dark",
        outline:
          "border border-primary-brown bg-transparent text-primary-brown hover:bg-primary-brown/10",
        ghost:
          "border-transparent bg-transparent text-velvet-green hover:bg-velvet-green/10 hover:text-velvet-green",
        subtle: "bg-brown-light text-brown-dark hover:bg-brown-light/80",
        link: "border-transparent bg-transparent text-primary-brown underline-offset-4 hover:underline",
        default: "bg-primary-brown text-white hover:bg-brown-dark",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button };
