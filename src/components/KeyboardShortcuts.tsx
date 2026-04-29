'use client';

import { useState, useEffect } from 'react';
import { Modal, Tag } from 'antd';

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
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setIsOpen((prev) => !prev);
        }
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Modal
      title="键盘快捷键"
      open={isOpen}
      onCancel={() => setIsOpen(false)}
      footer={null}
      width={400}
    >
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
            <span className="text-sm">{shortcut.description}</span>
            <div className="flex items-center gap-1">
              {shortcut.keys.map((key, i) => (
                <span key={i}>
                  <Tag>{key}</Tag>
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
          按 <Tag>?</Tag> 切换此面板
        </p>
      </div>
    </Modal>
  );
}
