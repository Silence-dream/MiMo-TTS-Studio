'use client';

import { Segmented } from 'antd';
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
  const options = models.map((model) => ({
    value: model.id,
    label: (
      <div className="text-center py-1">
        <div className="font-semibold text-sm">{model.name}</div>
        <div className="text-xs opacity-60">{model.description}</div>
      </div>
    ),
  }));

  return (
    <div className="mb-5">
      <Segmented
        block
        options={options}
        value={currentModel}
        onChange={(value) => onModelChange(value as TTSModel)}
      />
    </div>
  );
}
