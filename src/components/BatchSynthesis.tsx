'use client';

import { useState, useRef, useCallback } from 'react';
import { Button, Collapse, Upload, Alert, Space, Spin } from 'antd';
import { InboxOutlined, DeleteOutlined, LoadingOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { TTSModel, BuiltInVoice, AudioFormat } from '@/types/tts';

interface BatchSynthesisProps {
  model: TTSModel;
  voice: BuiltInVoice;
  format: AudioFormat;
  isGenerating: boolean;
  onSynthesize: (texts: string[]) => void;
}

export default function BatchSynthesis({
  model,
  voice,
  format,
  isGenerating,
  onSynthesize,
}: BatchSynthesisProps) {
  const [texts, setTexts] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const handleClear = () => {
    setTexts([]);
    setFileName(null);
    setError(null);
  };

  const handleSynthesize = () => {
    if (texts.length === 0) return;
    onSynthesize(texts);
  };

  const collapseContent = (
    <div>
      {/* 文件上传区域 */}
      <Upload.Dragger
        accept=".txt"
        showUploadList={false}
        beforeUpload={(file) => {
          processFile(file as File);
          return false;
        }}
        style={{ marginBottom: 16 }}
      >
        {texts.length > 0 ? (
          <div className="flex items-center justify-center gap-3 py-4">
            <span className="text-2xl">📄</span>
            <div className="text-left">
              <div className="text-sm font-medium">{fileName}</div>
              <div className="text-xs opacity-60">{texts.length} 条文本</div>
            </div>
            <Button
              type="text"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
            />
          </div>
        ) : (
          <div className="py-6">
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽 TXT 文件到此处</p>
            <p className="ant-upload-hint">每行一条文本，最多 100 行</p>
          </div>
        )}
      </Upload.Dragger>

      {/* 错误提示 */}
      {error && <Alert message={error} type="error" showIcon className="mb-3" />}

      {/* 文件格式说明 */}
      <div
        className="p-3 rounded-lg text-xs mb-3"
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
        <div className="mb-4">
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
        className="p-3 rounded-lg text-xs mb-4"
        style={{ background: 'var(--surface)', color: 'var(--muted)' }}
      >
        <Space size="small">
          <span>模型: {model}</span>
          <span>·</span>
          <span>音色: {voice}</span>
          <span>·</span>
          <span>格式: {format}</span>
        </Space>
      </div>

      {/* 合成按钮 */}
      <Button
        type="primary"
        block
        size="large"
        icon={isGenerating ? <LoadingOutlined spin /> : undefined}
        onClick={handleSynthesize}
        disabled={isGenerating || texts.length === 0}
      >
        {isGenerating ? '批量合成中...' : `批量合成 ${texts.length} 条文本`}
      </Button>
    </div>
  );

  return (
    <div className="card">
      <Collapse
        ghost
        items={[
          {
            key: 'batch',
            label: (
              <div className="flex items-center gap-3">
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                  style={{ background: 'var(--accent-glow)', boxShadow: 'var(--glow-purple-sm)' }}
                >
                  📦
                </span>
                <span className="font-semibold">批量合成</span>
              </div>
            ),
            children: collapseContent,
          },
        ]}
      />
    </div>
  );
}
