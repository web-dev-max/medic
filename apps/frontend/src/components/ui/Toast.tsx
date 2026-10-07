'use client';

import { useEffect } from 'react';
import { CheckCircle, XCircle, X, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toast: Toast;
  onClose: () => void;
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

const toastColors = {
  success: 'text-success bg-success/10',
  error: 'text-error bg-error/10',
  info: 'text-primary bg-primary/10',
};

export function Toast({ toast, onClose }: ToastProps) {
  const Icon = toastIcons[toast.type];

  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-white p-4 shadow-lg animate-in fade-in slide-in-from-top-full">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${toastColors[toast.type]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="flex-1 text-sm font-medium text-text-primary">{toast.message}</p>
      <button
        onClick={onClose}
        className="shrink-0 text-text-muted hover:text-text-primary transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
