'use client';

import { createContext, useContext, ReactNode } from 'react';
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

  const toast = {
    success: (msg: string) => message.success(msg),
    error: (msg: string) => message.error(msg),
    warning: (msg: string) => message.warning(msg),
    info: (msg: string) => message.info(msg),
  };

  return <ToastContext.Provider value={{ toast }}>{children}</ToastContext.Provider>;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <App>
      <ToastProviderInner>{children}</ToastProviderInner>
    </App>
  );
}
