"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Box, Text } from '@optiaxiom/react';
import { IconCheck, IconX, IconAlertCircle, IconInfoCircle } from '@tabler/icons-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

type Toast = {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
};

type ToastContextType = {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const toast: Toast = { id, message, type, duration };

    setToasts((prev) => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  }, [removeToast]);

  const success = useCallback((message: string, duration?: number) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const error = useCallback((message: string, duration?: number) => {
    showToast(message, 'error', duration);
  }, [showToast]);

  const warning = useCallback((message: string, duration?: number) => {
    showToast(message, 'warning', duration);
  }, [showToast]);

  const info = useCallback((message: string, duration?: number) => {
    showToast(message, 'info', duration);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        maxWidth: 400,
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const icons = {
    success: <IconCheck size={20} />,
    error: <IconX size={20} />,
    warning: <IconAlertCircle size={20} />,
    info: <IconInfoCircle size={20} />,
  };

  const colors = {
    success: {
      bg: 'var(--ax-bg-success-subtle)',
      border: 'var(--ax-border-success)',
      fg: 'var(--ax-fg-success)',
    },
    error: {
      bg: 'var(--ax-bg-error-subtle)',
      border: 'var(--ax-border-error)',
      fg: 'var(--ax-fg-error)',
    },
    warning: {
      bg: 'var(--ax-bg-warning-subtle)',
      border: 'var(--ax-border-warning)',
      fg: 'var(--ax-fg-warning)',
    },
    info: {
      bg: 'var(--ax-bg-information-subtle)',
      border: 'var(--ax-border-information)',
      fg: 'var(--ax-fg-information)',
    },
  };

  const style = colors[toast.type];

  return (
    <Box
      display="flex"
      alignItems="center"
      gap="12"
      px="16"
      py="12"
      rounded="md"
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        animation: 'slideIn 0.2s ease-out',
      }}
    >
      <Box style={{ color: style.fg, flexShrink: 0 }}>
        {icons[toast.type]}
      </Box>
      <Text fontSize="sm" fontWeight="500" style={{ flex: 1, color: style.fg }}>
        {toast.message}
      </Text>
      <button
        onClick={() => onRemove(toast.id)}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 4,
          display: 'flex',
          alignItems: 'center',
          color: style.fg,
          opacity: 0.7,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
      >
        <IconX size={16} />
      </button>
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </Box>
  );
}
