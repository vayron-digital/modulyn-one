import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormErrorProps {
  message: string;
  className?: string;
}

const FormError: React.FC<FormErrorProps> = ({ message, className = '' }) => {
  if (!message) return null;
  
  return (
    <div className={`bg-red-50 border-l-4 border-red-400 p-4 dark:bg-red-900 dark:border-red-700 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-400 dark:text-red-200" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700 dark:text-red-200">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default FormError; 