import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { designTokens } from "../../lib/designSystem";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-default/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary-default text-primary-on-primary hover:bg-primary-shade",
        destructive:
          "bg-states-error text-text-on-dark hover:bg-[hsl(var(--states-error-hsl)/.9)]",
        outline:
          "border border-fields-border text-text-heading hover:bg-surface-secondary",
        secondary:
          "bg-surface-secondary text-text-heading hover:bg-[hsl(var(--surface-secondary-hsl)/.9)]",
        ghost:
          "bg-transparent text-text-secondary hover:bg-surface-secondary/50",
        link:
          "bg-transparent text-primary-default underline-offset-4 hover:underline hover:text-primary-tint",
        success:
          "bg-states-success text-text-on-dark hover:bg-[hsl(var(--states-success-hsl)/.9)]",
        warning:
          "bg-states-warning text-text-heading hover:bg-[hsl(var(--states-warning-hsl)/.9)]",
        info:
          "bg-decorative-default text-text-on-dark hover:bg-decorative-tint",
      },
      size: {
        xs: "h-7 px-3 text-xs rounded-md font-medium",
        sm: "h-9 px-4 text-sm rounded-lg",
        default: "h-11 px-5 text-sm rounded-lg",
        lg: "h-12 px-6 text-base rounded-lg",
        xl: "h-14 px-8 text-lg rounded-xl",
        icon: "h-11 w-11 rounded-lg",
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