'use client';

import { useState, useRef } from 'react';
import { TTSModel, BuiltInVoice, AudioFormat } from '@/types/tts';
import { fileToBase64, getFileMimeType } from '@/lib/api';

interface VoiceSelectorProps {
  model: TTSModel;
  voice: BuiltInVoice;
  format: AudioFormat;
  voiceDesignPrompt: string;
  cloneFile: File | null;
  cloneStylePrompt: string;
  onVoiceChange: (voice: BuiltInVoice) => void;
  onFormatChange: (format: AudioFormat) => void;
  onVoiceDesignPromptChange: (prompt: string) => void;
  onCloneFileChange: (file: File | null) => void;
  onCloneStylePromptChange: (prompt: string) => void;
}

const builtInVoices: Array<{ id: BuiltInVoice; name: string; language: string; gender: string }> = [
  { id: 'mimo_default', name: 'MiMo-默认', language: '默认', gender: '默认' },
  { id: '冰糖', name: '冰糖', language: '中文', gender: '女声' },
  { id: '茉莉', name: '茉莉', language: '中文', gender: '女声' },
  { id: '苏打', name: '苏打', language: '中文', gender: '男声' },
  { id: '白桦', name: '白桦', language: '中文', gender: '男声' },
  { id: 'Mia', name: 'Mia', language: '英文', gender: '女声' },
  { id: 'Chloe', name: 'Chloe', language: '英文', gender: '女声' },
  { id: 'Milo', name: 'Milo', language: '英文', gender: '男声' },
  { id: 'Dean', name: 'Dean', language: '英文', gender: '男声' },
];

export default function VoiceSelector({
  model,
  voice,
  format,
  voiceDesignPrompt,
  cloneFile,
  cloneStylePrompt,
  onVoiceChange,
  onFormatChange,
  onVoiceDesignPromptChange,
  onCloneFileChange,
  onCloneStylePromptChange,
}: VoiceSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 内置音色模式
  if (model === 'mimo-v2.5-tts') {
    return (
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm" style={{ color: 'var(--muted)' }}>
            音色选择
          </label>
          <select value={voice} onChange={(e) => onVoiceChange(e.target.value as BuiltInVoice)}>
            {builtInVoices.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.language} {v.gender})
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm" style={{ color: 'var(--muted)' }}>
            输出格式
          </label>
          <select value={format} onChange={(e) => onFormatChange(e.target.value as AudioFormat)}>
            <option value="wav">WAV (完整返回)</option>
            <option value="pcm16">PCM16 (流式)</option>
          </select>
        </div>
      </div>
    );
  }

  // 声音设计模式
  if (model === 'mimo-v2.5-tts-voicedesign') {
    return (
      <div className="mb-4">
        <div className="flex flex-col gap-2 mb-4">
          <label className="text-sm" style={{ color: 'var(--muted)' }}>
            声音描述
          </label>
          <textarea
            value={voiceDesignPrompt}
            onChange={(e) => onVoiceDesignPromptChange(e.target.value)}
            placeholder="描述你想要的声音，例如：年轻女性，温柔磁性的声音，说话速度适中，带有温暖自信的语气"
            rows={3}
          />
          <div className="text-xs" style={{ color: 'var(--muted)' }}>
            描述维度参考：性别与年龄、音色质感、情绪语调、语速节奏、角色身份、说话风格
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm" style={{ color: 'var(--muted)' }}>
            输出格式
          </label>
          <select value={format} onChange={(e) => onFormatChange(e.target.value as AudioFormat)}>
            <option value="wav">WAV (完整返回)</option>
            <option value="pcm16">PCM16 (流式)</option>
          </select>
        </div>
      </div>
    );
  }

  // 声音克隆模式
  return (
    <div className="mb-4">
      <div className="flex flex-col gap-2 mb-4">
        <label className="text-sm" style={{ color: 'var(--muted)' }}>
          上传音频样本 (MP3/WAV, {'<'}10MB)
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".mp3,.wav,audio/mpeg,audio/wav"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            onCloneFileChange(file);
          }}
          style={{ padding: '10px' }}
        />
      </div>
      <div className="flex flex-col gap-2 mb-4">
        <label className="text-sm" style={{ color: 'var(--muted)' }}>
          风格指令 (可选)
        </label>
        <input
          type="text"
          value={cloneStylePrompt}
          onChange={(e) => onCloneStylePromptChange(e.target.value)}
          placeholder="用自然语言描述说话风格，如：用欢快的语气"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm" style={{ color: 'var(--muted)' }}>
          输出格式
        </label>
        <select value={format} onChange={(e) => onFormatChange(e.target.value as AudioFormat)}>
          <option value="wav">WAV (完整返回)</option>
          <option value="pcm16">PCM16 (流式)</option>
        </select>
      </div>
    </div>
  );
}
