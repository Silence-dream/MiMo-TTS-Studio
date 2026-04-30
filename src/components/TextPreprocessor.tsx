'use client';

import { useMemo } from 'react';
import { Button, Collapse, Space } from 'antd';

interface TextPreprocessorProps {
  text: string;
  onTextChange: (text: string) => void;
}

export default function TextPreprocessor({ text, onTextChange }: TextPreprocessorProps) {
  // 去除多余空格
  const removeExtraSpaces = () => {
    const processed = text
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
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
    const lines = text.split('\n');
    const processed = lines
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return '';
        if (!/[，,。.！!？?；;：:]$/.test(trimmed)) {
          return trimmed + '，';
        }
        return trimmed;
      })
      .join('\n');
    onTextChange(processed);
  };

  // 长文本下避免每次渲染都重新跑正则与 split
  const stats = useMemo(() => {
    const chars = text.length;
    const chineseChars = (text.match(/[一-龥]/g) || []).length;
    const words = text.split(/\s+/).filter((w) => w.length > 0).length;
    const lines = text.split('\n').filter((l) => l.trim().length > 0).length;
    return { chars, chineseChars, words, lines };
  }, [text]);

  const collapseContent = (
    <div>
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
        <Button size="small" block onClick={removeExtraSpaces}>
          去除多余空格
        </Button>
        <Button size="small" block onClick={removeLineBreaks}>
          去除换行
        </Button>
        <Button size="small" block onClick={smartSegment}>
          智能分段
        </Button>
        <Button size="small" block className="col-span-2" onClick={addPunctuation}>
          添加标点
        </Button>
      </div>

      <div className="mt-3 text-xs" style={{ color: 'var(--muted)' }}>
        提示：文本预处理可以帮助优化合成效果，建议在合成前使用
      </div>
    </div>
  );

  return (
    <div className="card">
      <Collapse
        ghost
        items={[
          {
            key: 'preprocessor',
            label: (
              <div className="flex items-center gap-3">
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                  style={{ background: 'var(--accent-glow)', boxShadow: 'var(--glow-purple-sm)' }}
                >
                  ✨
                </span>
                <span className="font-semibold">文本预处理</span>
              </div>
            ),
            children: collapseContent,
          },
        ]}
      />
    </div>
  );
}
