'use client';

import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import { ThemeProvider, useTheme } from './ThemeProvider';
import { useGlassTheme } from '@/hooks/useGlassTheme';

function AntdConfigProvider({ children }: { children: React.ReactNode }) {
  const { actualTheme } = useTheme();
  const configProps = useGlassTheme(actualTheme);

  return (
    <ConfigProvider {...configProps}>
      <AntdRegistry>{children}</AntdRegistry>
    </ConfigProvider>
  );
}

export function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AntdConfigProvider>{children}</AntdConfigProvider>
    </ThemeProvider>
  );
}
