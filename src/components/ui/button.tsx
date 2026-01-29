/* eslint-disable react-refresh/only-export-components */
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-2 border-border bg-transparent text-foreground hover:bg-muted hover:border-secondary",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-lg",
        ghost: "hover:bg-muted hover:text-foreground",
        link: "text-secondary underline-offset-4 hover:underline",
        // Alpha Appeal Custom Variants
        sage: "bg-secondary text-secondary-foreground hover:shadow-lg hover:shadow-secondary/20 hover:-translate-y-0.5 active:translate-y-0",
        gold: "bg-gold text-gold-foreground hover:shadow-lg hover:shadow-gold/20 hover:-translate-y-0.5 active:translate-y-0",
        glass: "bg-muted/50 border border-border/50 text-foreground backdrop-blur-xl hover:bg-muted hover:border-secondary/50",
        hero: "bg-secondary text-secondary-foreground text-base font-semibold px-8 py-4 hover:shadow-xl hover:shadow-secondary/30 hover:-translate-y-1 active:translate-y-0 transition-all duration-300",
        "hero-outline": "border-2 border-foreground/30 bg-transparent text-foreground text-base font-semibold px-8 py-4 hover:border-secondary hover:text-secondary transition-all duration-300",
        premium: "bg-gold text-gold-foreground font-semibold hover:shadow-lg hover:shadow-gold/30 hover:-translate-y-0.5",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-lg px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading...
          </span>
        ) : children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
