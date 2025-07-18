import { useState } from 'react';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message: string;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

interface ValidationErrors {
  [key: string]: string;
}

export const useFormValidation = (rules: ValidationRules) => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validate = (values: { [key: string]: any }) => {
    const newErrors: ValidationErrors = {};

    Object.keys(rules).forEach(field => {
      const value = values[field];
      const rule = rules[field];

      if (rule.required && !value) {
        newErrors[field] = rule.message;
        return;
      }

      if (value) {
        if (rule.minLength && value.length < rule.minLength) {
          newErrors[field] = rule.message;
        }

        if (rule.maxLength && value.length > rule.maxLength) {
          newErrors[field] = rule.message;
        }

        if (rule.pattern && !rule.pattern.test(value)) {
          newErrors[field] = rule.message;
        }

        if (rule.custom && !rule.custom(value)) {
          newErrors[field] = rule.message;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearErrors = () => {
    setErrors({});
  };

  return {
    errors,
    validate,
    clearErrors,
  };
}; 