'use client';

import { createContext, useContext, useMemo, ReactNode } from 'react';
import { App } from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';

interface ToastContextType {
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
}

function ToastProviderInner({ children }: { children: ReactNode }) {
  const { message } = App.useApp();

  const toast = useMemo(
    () => ({
      success: (msg: string) => message.success(msg),
      error: (msg: string) => message.error(msg),
      warning: (msg: string) => message.warning(msg),
      info: (msg: string) => message.info(msg),
    }),
    [message]
  );

  const contextValue = useMemo(() => ({ toast }), [toast]);

  return <ToastContext.Provider value={contextValue}>{children}</ToastContext.Provider>;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <App>
      <ToastProviderInner>{children}</ToastProviderInner>
    </App>
  );
}
