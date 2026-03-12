'use client';

import { useSnackbar } from '@/contexts/snackbar-context';

export interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
}

function mapVariant(variant?: ToastOptions['variant']): 'default' | 'success' | 'error' | 'warning' {
  if (variant === 'destructive') return 'error';
  if (variant === 'success' || variant === 'warning') return variant;
  return 'default';
}

export function useToast() {
  const { toast: snackbarToast, dismiss } = useSnackbar();
  return {
    toasts: [],
    toast: (options: ToastOptions) => {
      snackbarToast({
        title: options.title,
        description: options.description,
        duration: options.duration ?? 5000,
        variant: mapVariant(options.variant),
      });
    },
    dismiss,
  };
}

