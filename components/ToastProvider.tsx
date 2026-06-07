'use client';

import { useEffect, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';
type Toast = { id: number; message: string; type: ToastType };

let listeners: Array<(toast: Toast) => void> = [];
let nextId = 1;

export function showToast(message: string, type: ToastType = 'info') {
  const toast: Toast = { id: nextId++, message, type };
  listeners.forEach((listener) => listener(toast));
}

const icons: Record<ToastType, string> = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
};

const borderColors: Record<ToastType, string> = {
  success: 'var(--success)',
  error: 'var(--danger)',
  info: 'var(--secondary)',
};

export default function ToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (toast: Toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 4000);
    };
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="toast-enter flex gap-3 items-start"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderLeft: `4px solid ${borderColors[toast.type]}`,
            borderRadius: 10,
            padding: '14px 18px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          }}
        >
          <span className="text-xl">{icons[toast.type]}</span>
          <div className="flex-1 text-sm">{toast.message}</div>
          <button
            onClick={() =>
              setToasts((prev) => prev.filter((t) => t.id !== toast.id))
            }
            className="bg-transparent border-0 cursor-pointer text-lg leading-none"
            style={{ color: 'var(--text-muted)' }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
