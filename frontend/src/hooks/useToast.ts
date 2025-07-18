import { useToast as useToastOriginal } from '../components/ui/use-toast';

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | null | undefined;
  duration?: number;
}

export function useToast() {
  const { toast: originalToast } = useToastOriginal();

  const toast = ({ title, description, variant = 'default', duration = 3000 }: ToastOptions) => {
    originalToast({
      title,
      description,
      variant,
      duration,
    });
  };

  return {
    toast,
    success: (options: Omit<ToastOptions, 'variant'>) => 
      toast({ ...options, variant: 'default' }),
    error: (options: Omit<ToastOptions, 'variant'>) => 
      toast({ ...options, variant: 'destructive' }),
  };
} 