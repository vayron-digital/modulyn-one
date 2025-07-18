import * as React from 'react';
import { createContext, useContext, useState, useCallback } from 'react';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'info';
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  toast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => removeToast(id), toast.duration || 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, toast, removeToast }}>
      {children}
      <div className="fixed z-50 top-4 right-4 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded-md shadow-lg px-4 py-3 text-sm bg-white border flex items-start gap-2 animate-in fade-in-0 zoom-in-95 ${
              t.variant === 'destructive'
                ? 'border-red-500 bg-red-50 text-red-800'
                : t.variant === 'success'
                ? 'border-green-500 bg-green-50 text-green-800'
                : t.variant === 'info'
                ? 'border-blue-500 bg-blue-50 text-blue-800'
                : 'border-gray-200'
            }`}
          >
            <div className="flex-1">
              {t.title && <div className="font-semibold mb-0.5">{t.title}</div>}
              {t.description && <div>{t.description}</div>}
            </div>
            <button
              className="ml-2 text-lg text-gray-400 hover:text-gray-700"
              onClick={() => removeToast(t.id)}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
} 