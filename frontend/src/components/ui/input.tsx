import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { designTokens } from "../../lib/designSystem";

const inputVariants = cva(
  "flex w-full border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition-all duration-normal file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-gray-300 focus:border-blue-500 dark:border-gray-600 dark:focus:border-blue-400",
        error: "border-red-500 focus:border-red-500 dark:border-red-400",
        success: "border-green-500 focus:border-green-500 dark:border-green-400",
        warning: "border-yellow-500 focus:border-yellow-500 dark:border-yellow-400",
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
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
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