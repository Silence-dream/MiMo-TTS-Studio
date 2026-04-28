'use client';

import { TTSModel } from '@/types/tts';

interface ModelSelectorProps {
  currentModel: TTSModel;
  onModelChange: (model: TTSModel) => void;
}

const models = [
  {
    id: 'mimo-v2.5-tts' as TTSModel,
    name: '内置音色',
    description: '高质量内置声音',
  },
  {
    id: 'mimo-v2.5-tts-voicedesign' as TTSModel,
    name: '声音设计',
    description: '文本描述生成声音',
  },
  {
    id: 'mimo-v2.5-tts-voiceclone' as TTSModel,
    name: '声音克隆',
    description: '音频样本复刻声音',
  },
];

export default function ModelSelector({ currentModel, onModelChange }: ModelSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-5">
      {models.map((model) => {
        const isActive = currentModel === model.id;
        return (
          <button
            key={model.id}
            className="p-4 rounded-xl text-center cursor-pointer transition-all duration-200"
            style={{
              background: isActive ? 'var(--accent-glow)' : 'var(--surface)',
              border: isActive ? '2px solid var(--accent)' : '1px solid var(--border)',
              boxShadow: isActive ? 'var(--glow-purple-sm)' : 'none',
              backdropFilter: 'blur(8px)',
            }}
            onClick={() => onModelChange(model.id)}
          >
            <div
              className="font-semibold text-sm mb-1"
              style={{ color: isActive ? 'var(--accent)' : 'var(--foreground)' }}
            >
              {model.name}
            </div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>
              {model.description}
            </div>
          </button>
        );
      })}
    </div>
  );
}
