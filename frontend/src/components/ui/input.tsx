import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { designTokens } from "../../lib/designSystem";

const inputVariants = cva(
  "flex w-full border bg-background text-foreground shadow-sm transition-all duration-normal file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-border-light focus:border-primary dark:border-border-light dark:focus:border-secondary",
        error: "border-danger focus:border-danger dark:border-danger",
        success: "border-success focus:border-success dark:border-success",
        warning: "border-warning focus:border-warning dark:border-warning",
      },
      size: {
        sm: "h-8 px-3 text-sm rounded-md",
        default: "h-10 px-3 py-2 text-sm rounded-md",
        lg: "h-12 px-4 text-base rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  error?: boolean;
  success?: boolean;
  warning?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, size, error, success, warning, ...props }, ref) => {
    // Determine variant based on props
    let inputVariant = variant;
    if (error) inputVariant = "error";
    else if (success) inputVariant = "success";
    else if (warning) inputVariant = "warning";

    return (
      <input
        type={type}
        className={cn(inputVariants({ variant: inputVariant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }; 