import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { designTokens } from "../../lib/designSystem";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md hover:from-blue-600 hover:to-indigo-700 hover:shadow-lg active:shadow-sm dark:from-blue-400 dark:to-indigo-500 dark:hover:from-blue-500 dark:hover:to-indigo-600",
        destructive:
          "bg-red-500 text-white shadow-md hover:bg-red-600 hover:shadow-lg active:shadow-sm",
        outline:
          "border-2 border-blue-500 bg-transparent text-blue-500 shadow-sm hover:bg-blue-500 hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-gray-900",
        secondary:
          "bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200 hover:shadow-md active:shadow-sm dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
        ghost: 
          "bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100",
        link: 
          "bg-transparent text-blue-500 underline-offset-4 hover:underline dark:text-blue-400",
        success:
          "bg-green-500 text-white shadow-md hover:bg-green-600 hover:shadow-lg active:shadow-sm",
        warning:
          "bg-yellow-500 text-gray-900 shadow-md hover:bg-yellow-600 hover:shadow-lg active:shadow-sm",
        info:
          "bg-blue-500 text-white shadow-md hover:bg-blue-600 hover:shadow-lg active:shadow-sm",
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