'use client';

import { SynthesisStatus } from '@/types/tts';

interface StatusBarProps {
  status: SynthesisStatus;
  message: string;
}

export default function StatusBar({ status, message }: StatusBarProps) {
  return (
    <div
      className="rounded-xl mb-4 overflow-hidden"
      style={{
        background: 'var(--card-hover)',
      }}
    >
      <div className="flex items-center gap-3 p-4 text-sm" style={{ minHeight: '48px' }}>
        <span className={`status-dot ${status}`} />
        <span>{message}</span>
      </div>

      {/* 进度条 */}
      {status === 'loading' && (
        <div className="progress-bar-container">
          <div className="progress-bar" />
        </div>
      )}

      {/* 成功状态的进度条 */}
      {status === 'success' && (
        <div className="progress-bar-container">
          <div className="progress-bar progress-bar-success" />
        </div>
      )}

      {/* 错误状态的进度条 */}
      {status === 'error' && (
        <div className="progress-bar-container">
          <div className="progress-bar progress-bar-error" />
        </div>
      )}
    </div>
  );
}
