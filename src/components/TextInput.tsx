'use client';

import { TTSModel } from '@/types/tts';

interface TextInputProps {
  model: TTSModel;
  userMessage: string;
  assistantContent: string;
  isGenerating: boolean;
  onUserMessageChange: (message: string) => void;
  onAssistantContentChange: (content: string) => void;
  onSynthesize: () => void;
  onClear: () => void;
}

export default function TextInput({
  model,
  userMessage,
  assistantContent,
  isGenerating,
  onUserMessageChange,
  onAssistantContentChange,
  onSynthesize,
  onClear,
}: TextInputProps) {
  const isVoiceDesign = model === 'mimo-v2.5-tts-voicedesign';

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-5">
        <span
          className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
          style={{ background: 'var(--accent-glow)', boxShadow: 'var(--glow-purple-sm)' }}
        >
          📝
        </span>
        <h2 className="text-base font-semibold">合成文本</h2>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        <label className="text-sm" style={{ color: 'var(--muted)' }}>
          {isVoiceDesign ? '声音描述 (必填)' : '风格指令 (可选 — 自然语言描述说话风格)'}
        </label>
        <input
          type="text"
          value={userMessage}
          onChange={(e) => onUserMessageChange(e.target.value)}
          placeholder="例如：用欢快的语气，语速稍快，句尾语调上扬"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm" style={{ color: 'var(--muted)' }}>
          要合成的文本
        </label>
        <textarea
          value={assistantContent}
          onChange={(e) => onAssistantContentChange(e.target.value)}
          placeholder="输入需要转换为语音的文本内容..."
          rows={5}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 mt-5">
        <button className="btn btn-primary" onClick={onSynthesize} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <span className="spinner" />
              合成中...
            </>
          ) : (
            '合成语音'
          )}
        </button>
        <button className="btn btn-secondary" onClick={onClear}>
          清空内容
        </button>
      </div>
    </div>
  );
}
