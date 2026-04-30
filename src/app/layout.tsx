import type { Metadata } from 'next';
import './globals.css';
import { AntdProvider } from '@/components/AntdProvider';
import { ToastProvider } from '@/components/Toast';

export const metadata: Metadata = {
  title: 'MiMo TTS Studio',
  description: '基于小米 MiMo-V2.5-TTS 系列模型的语音合成工具',
};

// 在 React 接管前同步设置 data-theme，避免暗色/亮色主题闪烁 (FOUC)
const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'&&t!=='system')t='system';var actual=t==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;document.documentElement.setAttribute('data-theme',actual);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <AntdProvider>
          <ToastProvider>{children}</ToastProvider>
        </AntdProvider>
      </body>
    </html>
  );
}
