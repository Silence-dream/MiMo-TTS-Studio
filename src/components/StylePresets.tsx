'use client';

import { useState } from 'react';

interface StylePresetsProps {
  onInsertTag: (tag: string, isStyleTag: boolean) => void;
}

const emotionTags = [
  { label: '开心', tag: '(开心)', emoji: '😊' },
  { label: '悲伤', tag: '(悲伤)', emoji: '😢' },
  { label: '愤怒', tag: '(愤怒)', emoji: '😠' },
  { label: '温柔', tag: '(温柔)', emoji: '🌸' },
  { label: '慵懒', tag: '(慵懒)', emoji: '😴' },
  { label: '磁性', tag: '(磁性)', emoji: '🎵' },
  { label: '甜美', tag: '(甜美)', emoji: '🍬' },
  { label: '严肃', tag: '(严肃)', emoji: '📋' },
  { label: '活泼', tag: '(活泼)', emoji: '⚡' },
  { label: '低沉', tag: '(低沉)', emoji: '🎸' },
  { label: '冷淡', tag: '(冷淡)', emoji: '❄️' },
  { label: '激动', tag: '(激动)', emoji: '🔥' },
];

const dialectTags = [
  { label: '东北话', tag: '(东北话)', emoji: '🧊' },
  { label: '四川话', tag: '(四川话)', emoji: '🌶️' },
  { label: '河南话', tag: '(河南话)', emoji: '🏮' },
  { label: '粤语', tag: '(粤语)', emoji: '🥢' },
  { label: '唱歌', tag: '(唱歌)', emoji: '🎤' },
  { label: '夹子音', tag: '(夹子音)', emoji: '🎀' },
  { label: '大叔音', tag: '(大叔音)', emoji: '🧔' },
  { label: '御姐音', tag: '(御姐音)', emoji: '👑' },
];

const audioTags = [
  { label: '深吸气', tag: '[深吸一口气]', emoji: '😤' },
  { label: '叹气', tag: '[叹气]', emoji: '😮‍💨' },
  { label: '轻声笑', tag: '[轻声笑]', emoji: '😄' },
  { label: '大笑', tag: '[大笑]', emoji: '🤣' },
  { label: '啜泣', tag: '[啜泣]', emoji: '😭' },
  { label: '颤抖', tag: '[颤抖]', emoji: '🥶' },
  { label: '咳嗽', tag: '[咳嗽]', emoji: '🤧' },
  { label: '停顿', tag: '[停顿]', emoji: '⏸️' },
];

export default function StylePresets({ onInsertTag }: StylePresetsProps) {
  const [isOpen, setIsOpen] = useState(false);

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
            🎨
          </span>
          <h2 className="text-base font-semibold">风格预设 (可选)</h2>
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
          <div className="flex flex-col gap-2 mb-4">
            <label className="text-sm" style={{ color: 'var(--muted)' }}>
              情绪标签 — 点击插入到文本开头
            </label>
            <div className="flex flex-wrap gap-2">
              {emotionTags.map((tag) => (
                <span
                  key={tag.tag}
                  className="tag"
                  role="button"
                  tabIndex={0}
                  onClick={() => onInsertTag(tag.tag, true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') onInsertTag(tag.tag, true);
                  }}
                >
                  {tag.emoji} {tag.label}
                </span>
              ))}
            </div>
          </div>

          <div className="h-px my-5" style={{ background: 'var(--border)' }} />

          <div className="flex flex-col gap-2 mb-4">
            <label className="text-sm" style={{ color: 'var(--muted)' }}>
              方言/角色标签
            </label>
            <div className="flex flex-wrap gap-2">
              {dialectTags.map((tag) => (
                <span
                  key={tag.tag}
                  className="tag"
                  role="button"
                  tabIndex={0}
                  onClick={() => onInsertTag(tag.tag, true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') onInsertTag(tag.tag, true);
                  }}
                >
                  {tag.emoji} {tag.label}
                </span>
              ))}
            </div>
          </div>

          <div className="h-px my-5" style={{ background: 'var(--border)' }} />

          <div className="flex flex-col gap-2">
            <label className="text-sm" style={{ color: 'var(--muted)' }}>
              音频标签 — 可插入文本任意位置控制细节
            </label>
            <div className="flex flex-wrap gap-2">
              {audioTags.map((tag) => (
                <span
                  key={tag.tag}
                  className="tag"
                  role="button"
                  tabIndex={0}
                  onClick={() => onInsertTag(tag.tag, false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') onInsertTag(tag.tag, false);
                  }}
                >
                  {tag.emoji} {tag.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
