'use client';

import { SynthesisStatus } from '@/types/tts';

interface StatusBarProps {
  status: SynthesisStatus;
  message: string;
}

export default function StatusBar({ status, message }: StatusBarProps) {
  return (
    <div
      className="flex items-center gap-3 p-4 rounded-xl mb-4 text-sm"
      style={{
        background: 'var(--card-hover)',
        minHeight: '48px',
      }}
    >
      <span className={`status-dot ${status}`} />
      <span>{message}</span>
    </div>
  );
}
