import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MiMo TTS Studio',
  description: '基于小米 MiMo-V2.5-TTS 系列模型的语音合成工具',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
