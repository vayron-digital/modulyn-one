import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { designTokens } from "../../lib/designSystem";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-secondary shadow-md hover:bg-primary/90 hover:shadow-lg active:shadow-sm dark:bg-secondary dark:text-primary dark:shadow-md dark:hover:bg-secondary/90",
        destructive:
          "bg-danger text-secondary shadow-md hover:bg-danger/90 hover:shadow-lg active:shadow-sm",
        outline:
          "border-2 border-primary bg-transparent text-primary shadow-sm hover:bg-primary hover:text-secondary dark:border-secondary dark:text-secondary dark:hover:bg-secondary dark:hover:text-primary",
        secondary:
          "bg-accent text-text-primary shadow-sm hover:bg-accent/80 hover:shadow-md active:shadow-sm dark:bg-accent dark:text-text-inverse dark:hover:bg-accent/80",
        ghost: 
          "bg-transparent text-text-primary hover:bg-accent hover:text-text-primary dark:text-text-inverse dark:hover:bg-accent dark:hover:text-text-inverse",
        link: 
          "bg-transparent text-primary underline-offset-4 hover:underline dark:text-secondary",
        success:
          "bg-success text-secondary shadow-md hover:bg-success/90 hover:shadow-lg active:shadow-sm",
        warning:
          "bg-warning text-text-primary shadow-md hover:bg-warning/90 hover:shadow-lg active:shadow-sm",
        info:
          "bg-info text-secondary shadow-md hover:bg-info/90 hover:shadow-lg active:shadow-sm",
      },
      size: {
        xs: "h-6 px-2 text-xs rounded-sm",
        sm: "h-8 px-3 text-sm rounded-md",
        default: "h-10 px-4 py-2 text-sm rounded-md",
        lg: "h-12 px-6 text-base rounded-lg",
        xl: "h-14 px-8 text-lg rounded-xl",
        icon: "h-10 w-10 rounded-md",
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