'use client';

import { SynthesisStatus } from '@/types/tts';

interface StatusBarProps {
  status: SynthesisStatus;
  message: string;
  onCancel?: () => void;
}

export default function StatusBar({ status, message, onCancel }: StatusBarProps) {
  return (
    <div
      className="rounded-xl mb-4 overflow-hidden"
      style={{
        background: 'var(--card-hover)',
      }}
    >
      <div className="flex items-center gap-3 p-4 text-sm" style={{ minHeight: '48px' }}>
        <span className={`status-dot ${status}`} />
        <span className="flex-1">{message}</span>
        {status === 'loading' && onCancel && (
          <button
            className="px-3 py-1 rounded-lg text-xs cursor-pointer transition-all"
            style={{
              background: 'rgba(248, 113, 113, 0.1)',
              border: '1px solid var(--error)',
              color: 'var(--error)',
            }}
            onClick={onCancel}
          >
            取消
          </button>
        )}
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
