'use client';

import { useState, useEffect } from 'react';
import { TTSModel, BuiltInVoice, AudioFormat } from '@/types/tts';
import {
  getFavoriteVoices,
  toggleFavoriteVoice,
  recordVoiceUsage,
  getMostUsedVoices,
} from '@/lib/storage';
import FileUpload from './FileUpload';

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

function FormatSelector({
  format,
  onFormatChange,
}: {
  format: AudioFormat;
  onFormatChange: (format: AudioFormat) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm" style={{ color: 'var(--muted)' }}>
        输出格式
      </label>
      <select value={format} onChange={(e) => onFormatChange(e.target.value as AudioFormat)}>
        <option value="wav">WAV (完整返回)</option>
        <option value="pcm16">PCM16 (流式)</option>
      </select>
    </div>
  );
}

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
  const [favorites, setFavorites] = useState<string[]>([]);
  const [mostUsed, setMostUsed] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(getFavoriteVoices());
    setMostUsed(getMostUsedVoices());
  }, []);

  const handleVoiceSelect = (voiceId: BuiltInVoice) => {
    onVoiceChange(voiceId);
    recordVoiceUsage(voiceId);
  };

  const handleToggleFavorite = (voiceId: string) => {
    const { favorites: newFavorites } = toggleFavoriteVoice(voiceId);
    setFavorites(newFavorites);
    setMostUsed(getMostUsedVoices());
  };

  // 内置音色模式
  if (model === 'mimo-v2.5-tts') {
    return (
      <div className="flex flex-col gap-4 mb-4">
        {/* 常用音色 */}
        {mostUsed.length > 0 && (
          <div className="flex flex-col gap-2">
            <label className="text-sm" style={{ color: 'var(--muted)' }}>
              常用音色
            </label>
            <div className="flex flex-wrap gap-2">
              {mostUsed.map((voiceId) => {
                const v = builtInVoices.find((v) => v.id === voiceId);
                if (!v) return null;
                return (
                  <span
                    key={voiceId}
                    className={`tag ${voice === voiceId ? 'active' : ''}`}
                    onClick={() => handleVoiceSelect(v.id)}
                  >
                    {v.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* 收藏的音色 */}
        {favorites.length > 0 && (
          <div className="flex flex-col gap-2">
            <label className="text-sm" style={{ color: 'var(--muted)' }}>
              收藏音色
            </label>
            <div className="flex flex-wrap gap-2">
              {favorites.map((voiceId) => {
                const v = builtInVoices.find((v) => v.id === voiceId);
                if (!v) return null;
                return (
                  <span
                    key={voiceId}
                    className={`tag ${voice === voiceId ? 'active' : ''}`}
                    onClick={() => handleVoiceSelect(v.id)}
                  >
                    ❤️ {v.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* 所有音色 */}
        <div className="flex flex-col gap-2">
          <label className="text-sm" style={{ color: 'var(--muted)' }}>
            音色选择
          </label>
          <div className="grid grid-cols-2 gap-2">
            {builtInVoices.map((v) => (
              <div
                key={v.id}
                className="flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all"
                style={{
                  background: voice === v.id ? 'var(--accent-glow)' : 'var(--surface)',
                  border: `1px solid ${voice === v.id ? 'var(--accent)' : 'var(--border)'}`,
                }}
                onClick={() => handleVoiceSelect(v.id)}
              >
                <div className="flex-1">
                  <div className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                    {v.name}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>
                    {v.language} · {v.gender}
                  </div>
                </div>
                <button
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs cursor-pointer transition-all"
                  style={{
                    background: favorites.includes(v.id)
                      ? 'rgba(248, 113, 113, 0.2)'
                      : 'transparent',
                    color: favorites.includes(v.id) ? 'var(--error)' : 'var(--muted)',
                    border: 'none',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite(v.id);
                  }}
                  title={favorites.includes(v.id) ? '取消收藏' : '收藏'}
                >
                  {favorites.includes(v.id) ? '❤️' : '🤍'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <FormatSelector format={format} onFormatChange={onFormatChange} />
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
        <FormatSelector format={format} onFormatChange={onFormatChange} />
      </div>
    );
  }

  // 声音克隆模式
  return (
    <div className="mb-4">
      <FileUpload
        accept=".mp3,.wav,audio/mpeg,audio/wav"
        maxSize={10 * 1024 * 1024} // 10MB
        onFileChange={onCloneFileChange}
        currentFile={cloneFile}
      />
      <div className="flex flex-col gap-2 mt-4">
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
      <div className="mt-4">
        <FormatSelector format={format} onFormatChange={onFormatChange} />
      </div>
    </div>
  );
}
