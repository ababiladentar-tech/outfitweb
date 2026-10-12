'use client';

import React from 'react';
import { CheckCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-[#162D24] text-white border border-[#2F4F42] shadow-xl animate-fadeIn text-xs font-medium"
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-[#8EA89D] shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-[#E58B94] shrink-0" />
            )}
            <span>{toast.text}</span>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-neutral-400 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
