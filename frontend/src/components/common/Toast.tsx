import React, { useEffect } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = type === 'success' 
    ? 'bg-green-50 dark:bg-green-900/50' 
    : 'bg-red-50 dark:bg-red-900/50';
  const textColor = type === 'success' 
    ? 'text-green-800 dark:text-green-200' 
    : 'text-red-800 dark:text-red-200';
  const borderColor = type === 'success' 
    ? 'border-green-400 dark:border-green-700' 
    : 'border-red-400 dark:border-red-700';
  const Icon = type === 'success' ? CheckCircleIcon : ExclamationCircleIcon;

  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} border-l-4 ${borderColor} rounded-lg shadow-lg dark:shadow-dark p-4 max-w-md backdrop-blur-sm`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={`h-6 w-6 ${textColor}`} aria-hidden="true" />
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className={`text-sm font-medium ${textColor}`}>{message}</p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            className={`inline-flex ${textColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${type === 'success' ? 'green' : 'red'}-50 dark:focus:ring-offset-${type === 'success' ? 'green' : 'red'}-900 focus:ring-${type === 'success' ? 'green' : 'red'}-500`}
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
} 