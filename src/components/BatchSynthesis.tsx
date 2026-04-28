'use client';

import { useState, useRef, useCallback } from 'react';
import { TTSModel, BuiltInVoice, AudioFormat } from '@/types/tts';

interface BatchSynthesisProps {
  model: TTSModel;
  voice: BuiltInVoice;
  format: AudioFormat;
  speed: number;
  pitch: number;
  isGenerating: boolean;
  onSynthesize: (texts: string[]) => void;
}

export default function BatchSynthesis({
  model,
  voice,
  format,
  speed,
  pitch,
  isGenerating,
  onSynthesize,
}: BatchSynthesisProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [texts, setTexts] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    setError(null);

    // 验证文件类型
    if (!file.name.endsWith('.txt')) {
      setError('请上传 TXT 格式的文件');
      return;
    }

    // 验证文件大小（最大 1MB）
    if (file.size > 1024 * 1024) {
      setError('文件大小不能超过 1MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const lines = content
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      if (lines.length === 0) {
        setError('文件中没有有效的文本内容');
        return;
      }

      if (lines.length > 100) {
        setError('文件内容不能超过 100 行');
        return;
      }

      setTexts(lines);
      setFileName(file.name);
    };

    reader.onerror = () => {
      setError('读取文件失败');
    };

    reader.readAsText(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        processFile(files[0]);
      }
    },
    [processFile]
  );

  const handleSynthesize = () => {
    if (texts.length === 0) return;
    onSynthesize(texts);
  };

  const handleClear = () => {
    setTexts([]);
    setFileName(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
            📦
          </span>
          <h2 className="text-base font-semibold">批量合成</h2>
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
          {/* 文件上传区域 */}
          <div
            className={`file-upload-zone ${isDragging ? 'dragging' : ''} ${texts.length > 0 ? 'has-file' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt"
              onChange={handleFileChange}
              className="hidden"
            />

            {texts.length > 0 ? (
              <div className="flex items-center gap-3">
                <span className="text-2xl">📄</span>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-sm font-medium truncate"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {fileName}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>
                    {texts.length} 条文本
                  </div>
                </div>
                <button
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm cursor-pointer transition-all"
                  style={{
                    background: 'rgba(248, 113, 113, 0.1)',
                    color: 'var(--error)',
                    border: 'none',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  title="移除文件"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="text-center">
                <span className="text-3xl mb-2 block">📁</span>
                <div className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                  {isDragging ? '释放文件以上传' : '点击或拖拽 TXT 文件到此处'}
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                  每行一条文本，最多 100 行
                </div>
              </div>
            )}
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mt-2 text-xs" style={{ color: 'var(--error)' }}>
              {error}
            </div>
          )}

          {/* 文件格式说明 */}
          <div
            className="mt-3 p-3 rounded-lg text-xs"
            style={{ background: 'var(--surface)', color: 'var(--muted)' }}
          >
            <div className="font-medium mb-1" style={{ color: 'var(--foreground-secondary)' }}>
              TXT 文件格式说明：
            </div>
            <div>• 每行一条要合成的文本</div>
            <div>• 空行会自动跳过</div>
            <div>• 最多支持 100 行文本</div>
            <div>• 文件大小不超过 1MB</div>
          </div>

          {/* 预览文本 */}
          {texts.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm" style={{ color: 'var(--muted)' }}>
                  文本预览
                </label>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>
                  共 {texts.length} 条
                </span>
              </div>
              <div
                className="max-h-[200px] overflow-y-auto p-3 rounded-lg text-xs"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'var(--border) transparent',
                }}
              >
                {texts.map((text, index) => (
                  <div
                    key={index}
                    className="py-1.5"
                    style={{
                      borderBottom: index < texts.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <span className="mr-2" style={{ color: 'var(--muted)' }}>
                      {index + 1}.
                    </span>
                    <span style={{ color: 'var(--foreground)' }}>
                      {text.length > 100 ? text.substring(0, 100) + '...' : text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 配置信息 */}
          <div
            className="flex flex-wrap gap-2 mt-4 mb-4 p-3 rounded-lg text-xs"
            style={{ background: 'var(--surface)', color: 'var(--muted)' }}
          >
            <span>模型: {model}</span>
            <span>·</span>
            <span>音色: {voice}</span>
            <span>·</span>
            <span>格式: {format}</span>
            <span>·</span>
            <span>语速: {speed}x</span>
            <span>·</span>
            <span>
              音调: {pitch > 0 ? '+' : ''}
              {pitch}
            </span>
          </div>

          {/* 合成按钮 */}
          <button
            className="btn btn-primary"
            onClick={handleSynthesize}
            disabled={isGenerating || texts.length === 0}
          >
            {isGenerating ? (
              <>
                <span className="spinner" />
                批量合成中...
              </>
            ) : (
              `批量合成 ${texts.length} 条文本`
            )}
          </button>
        </div>
      )}
    </div>
  );
}
