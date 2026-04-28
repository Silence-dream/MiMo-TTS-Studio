'use client';

import { useState, useEffect } from 'react';

interface Shortcut {
  keys: string[];
  description: string;
}

const shortcuts: Shortcut[] = [
  { keys: ['Ctrl', 'Enter'], description: '合成语音' },
  { keys: ['Esc'], description: '关闭面板' },
  { keys: ['?'], description: '显示/隐藏快捷键' },
];

export default function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 按 ? 键切换快捷键面板
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // 确保不在输入框中
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setIsOpen((prev) => !prev);
        }
      }
      // 按 Esc 键关闭面板
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="shortcuts-overlay" onClick={() => setIsOpen(false)}>
      <div className="shortcuts-panel" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
            键盘快捷键
          </h2>
          <button
            className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--muted)',
            }}
            onClick={() => setIsOpen(false)}
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
            >
              <span className="text-sm" style={{ color: 'var(--foreground)' }}>
                {shortcut.description}
              </span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, i) => (
                  <span key={i}>
                    <kbd className="shortcut-key">{key}</kbd>
                    {i < shortcut.keys.length - 1 && (
                      <span className="text-xs mx-1" style={{ color: 'var(--muted)' }}>
                        +
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            按 <kbd className="shortcut-key">?</kbd> 切换此面板
          </p>
        </div>
      </div>
    </div>
  );
}
