'use client';

import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import { ThemeProvider, useTheme } from './ThemeProvider';
import { useGlassTheme } from '@/hooks/useGlassTheme';

function AntdConfigProvider({ children }: { children: React.ReactNode }) {
  const { actualTheme } = useTheme();
  const configProps = useGlassTheme(actualTheme);

  return <ConfigProvider {...configProps}>{children}</ConfigProvider>;
}

export function AntdStandaloneProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AntdConfigProvider>{children}</AntdConfigProvider>
    </ThemeProvider>
  );
}

export function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <AntdStandaloneProvider>
      <AntdRegistry>{children}</AntdRegistry>
    </AntdStandaloneProvider>
  );
}
