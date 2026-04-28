'use client';

import { SynthesisHistory } from '@/types/tts';

interface HistoryListProps {
  history: SynthesisHistory[];
  onPlay: (item: SynthesisHistory) => void;
}

export default function HistoryList({ history, onPlay }: HistoryListProps) {
  if (history.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center gap-3 mb-5">
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
            style={{ background: 'var(--accent-glow)', boxShadow: 'var(--glow-purple-sm)' }}
          >
            📋
          </span>
          <h2 className="text-base font-semibold">合成历史</h2>
        </div>
        <div className="text-center py-8" style={{ color: 'var(--muted)' }}>
          暂无合成记录
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-5">
        <span
          className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
          style={{ background: 'var(--accent-glow)' }}
        >
          📋
        </span>
        <h2 className="text-base font-semibold">合成历史</h2>
      </div>

      <div
        className="max-h-[300px] overflow-y-auto"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--border) transparent' }}
      >
        {history.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 cursor-pointer transition-colors"
            style={{ borderBottom: '1px solid var(--border)' }}
            onClick={() => onPlay(item)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--card-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm cursor-pointer flex-shrink-0 transition-all"
              style={{
                background: 'var(--accent-glow)',
                color: 'var(--accent)',
                border: 'none',
              }}
            >
              ▶
            </button>
            <span className="flex-1 text-sm overflow-hidden text-ellipsis whitespace-nowrap">
              {item.text}
            </span>
            <span className="text-xs flex-shrink-0" style={{ color: 'var(--muted)' }}>
              {new Date(item.createdAt).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
