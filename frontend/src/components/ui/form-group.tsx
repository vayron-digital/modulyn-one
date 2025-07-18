import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { designTokens } from "../../lib/designSystem";

const formGroupVariants = cva(
  "flex flex-col space-y-2",
  {
    variants: {
      variant: {
        default: "",
        horizontal: "flex-row items-center space-y-0 space-x-4",
        inline: "flex-row items-center space-y-0 space-x-2",
      },
      size: {
        sm: "space-y-1",
        default: "space-y-2",
        lg: "space-y-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface FormGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof formGroupVariants> {
  label?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
}

const FormGroup = React.forwardRef<HTMLDivElement, FormGroupProps>(
  ({ className, variant, size, label, required, error, helpText, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(formGroupVariants({ variant, size, className }))}
        {...props}
      >
        {label && (
          <label className="text-sm font-medium text-text-primary dark:text-text-primary">
            {label}
            {required && <span className="text-danger ml-1">*</span>}
          </label>
        )}
        <div className="flex-1">
          {children}
        </div>
        {error && (
          <p className="text-sm text-danger dark:text-danger">
            {error}
          </p>
        )}
        {helpText && !error && (
          <p className="text-sm text-text-secondary dark:text-text-secondary">
            {helpText}
          </p>
        )}
      </div>
    );
  }
);
FormGroup.displayName = "FormGroup";

export { FormGroup, formGroupVariants }; 