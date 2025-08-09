import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { designTokens } from "../../lib/designSystem";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-default/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 hover:shadow-lg transform-gpu backdrop-blur-sm",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary-default to-primary-tint text-primary-on-primary shadow-lg hover:from-primary-tint hover:to-primary-shade hover:shadow-xl border border-primary-default/20",
        destructive:
          "bg-gradient-to-r from-states-error to-states-error/90 text-text-on-dark shadow-lg hover:from-states-error/90 hover:to-states-error/80 hover:shadow-xl border border-states-error/20",
        outline:
          "border-2 border-primary-default/30 bg-surface-primary/50 text-primary-default shadow-sm hover:bg-primary-default hover:text-primary-on-primary hover:border-primary-default backdrop-blur-sm",
        secondary:
          "bg-gradient-to-r from-surface-secondary to-surface-secondary/90 text-text-secondary shadow-sm hover:from-surface-secondary/90 hover:to-surface-secondary/80 hover:text-text-heading border border-surface-secondary/50",
        ghost: 
          "bg-transparent text-text-secondary hover:bg-surface-secondary/30 hover:text-text-heading backdrop-blur-sm",
        link: 
          "bg-transparent text-primary-default underline-offset-4 hover:underline hover:text-primary-tint",
        success:
          "bg-gradient-to-r from-states-success to-states-success/90 text-text-on-dark shadow-lg hover:from-states-success/90 hover:to-states-success/80 hover:shadow-xl border border-states-success/20",
        warning:
          "bg-gradient-to-r from-states-warning to-states-warning/90 text-text-heading shadow-lg hover:from-states-warning/90 hover:to-states-warning/80 hover:shadow-xl border border-states-warning/20",
        info:
          "bg-gradient-to-r from-decorative-default to-decorative-tint text-text-on-dark shadow-lg hover:from-decorative-tint hover:to-decorative-shade hover:shadow-xl border border-decorative-default/20",
      },
      size: {
        xs: "h-7 px-3 text-xs rounded-lg font-medium",
        sm: "h-9 px-4 text-sm rounded-xl",
        default: "h-11 px-6 py-2.5 text-sm rounded-xl",
        lg: "h-13 px-8 text-base rounded-2xl",
        xl: "h-16 px-10 text-lg rounded-2xl",
        icon: "h-11 w-11 rounded-xl",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants }; 