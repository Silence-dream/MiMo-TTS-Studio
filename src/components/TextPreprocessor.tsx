'use client';

import { useState } from 'react';

interface TextPreprocessorProps {
  text: string;
  onTextChange: (text: string) => void;
}

export default function TextPreprocessor({ text, onTextChange }: TextPreprocessorProps) {
  const [isOpen, setIsOpen] = useState(false);

  // 去除多余空格
  const removeExtraSpaces = () => {
    const processed = text
      .replace(/[ \t]+/g, ' ') // 多个空格合并为一个
      .replace(/\n\s*\n/g, '\n\n') // 多个空行合并为两个
      .trim();
    onTextChange(processed);
  };

  // 去除所有换行
  const removeLineBreaks = () => {
    const processed = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    onTextChange(processed);
  };

  // 智能分段（按句号、问号、感叹号分段）
  const smartSegment = () => {
    const processed = text
      .replace(/([。！？.!?])\s*/g, '$1\n')
      .replace(/\n+/g, '\n')
      .trim();
    onTextChange(processed);
  };

  // 添加标点符号
  const addPunctuation = () => {
    // 在没有标点的行末添加逗号
    const lines = text.split('\n');
    const processed = lines
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return '';
        // 如果行末没有标点，添加逗号
        if (!/[，,。.！!？?；;：:]$/.test(trimmed)) {
          return trimmed + '，';
        }
        return trimmed;
      })
      .join('\n');
    onTextChange(processed);
  };

  // 统计信息
  const getStats = () => {
    const chars = text.length;
    const chineseChars = (text.match(/[一-龥]/g) || []).length;
    const words = text.split(/\s+/).filter((w) => w.length > 0).length;
    const lines = text.split('\n').filter((l) => l.trim().length > 0).length;

    return { chars, chineseChars, words, lines };
  };

  const stats = getStats();

  return (
    <div className="card">
      <button
        className="w-full flex items-center justify-between cursor-pointer bg-transparent border-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
            style={{ background: 'var(--accent-glow)', boxShadow: 'var(--glow-purple-sm)' }}
          >
            ✨
          </span>
          <h2 className="text-base font-semibold">文本预处理</h2>
        </div>
        <span
          className="text-sm transition-transform"
          style={{
            color: 'var(--muted)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="mt-4">
          {/* 统计信息 */}
          <div
            className="flex flex-wrap gap-4 mb-4 p-3 rounded-lg text-xs"
            style={{ background: 'var(--surface)', color: 'var(--muted)' }}
          >
            <span>总字符: {stats.chars}</span>
            <span>中文字符: {stats.chineseChars}</span>
            <span>单词数: {stats.words}</span>
            <span>行数: {stats.lines}</span>
          </div>

          {/* 操作按钮 */}
          <div className="grid grid-cols-2 gap-2">
            <button className="btn btn-secondary text-xs py-2" onClick={removeExtraSpaces}>
              去除多余空格
            </button>
            <button className="btn btn-secondary text-xs py-2" onClick={removeLineBreaks}>
              去除换行
            </button>
            <button className="btn btn-secondary text-xs py-2" onClick={smartSegment}>
              智能分段
            </button>
            <button className="btn btn-secondary text-xs py-2 col-span-2" onClick={addPunctuation}>
              添加标点
            </button>
          </div>

          <div className="mt-3 text-xs" style={{ color: 'var(--muted)' }}>
            提示：文本预处理可以帮助优化合成效果，建议在合成前使用
          </div>
        </div>
      )}
    </div>
  );
}
