'use client';

import { useState, useCallback } from 'react';
import { Upload, Button, Alert } from 'antd';
import { InboxOutlined, DeleteOutlined } from '@ant-design/icons';
import { formatFileSize } from '@/lib/audio';

interface FileUploadProps {
  accept: string;
  maxSize: number; // 字节
  onFileChange: (file: File | null) => void;
  currentFile: File | null;
}

export default function FileUpload({
  accept,
  maxSize,
  onFileChange,
  currentFile,
}: FileUploadProps) {
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback(
    (file: File): boolean => {
      setError(null);

      const acceptTypes = accept.split(',').map((t) => t.trim());
      const isValidType = acceptTypes.some((type) => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        return file.type.match(type.replace('*', '.*'));
      });

      if (!isValidType) {
        setError('不支持的文件格式');
        return false;
      }

      if (file.size > maxSize) {
        const maxSizeMB = Math.round(maxSize / (1024 * 1024));
        setError(`文件大小超过 ${maxSizeMB}MB 限制`);
        return false;
      }

      return true;
    },
    [accept, maxSize]
  );

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileChange(null);
    setError(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm" style={{ color: 'var(--muted)' }}>
        上传音频样本
      </label>

      <Upload.Dragger
        accept={accept}
        showUploadList={false}
        beforeUpload={(file) => {
          if (validateFile(file as File)) {
            onFileChange(file as File);
          }
          return false;
        }}
      >
        {currentFile ? (
          <div className="flex items-center justify-center gap-3 py-4">
            <span className="text-2xl">🎵</span>
            <div className="text-left">
              <div className="text-sm font-medium">{currentFile.name}</div>
              <div className="text-xs opacity-60">{formatFileSize(currentFile.size)}</div>
            </div>
            <Button
              type="text"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={handleRemove}
            />
          </div>
        ) : (
          <div className="py-6">
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此处</p>
            <p className="ant-upload-hint">
              支持 MP3/WAV 格式，最大 {Math.round(maxSize / (1024 * 1024))}MB
            </p>
          </div>
        )}
      </Upload.Dragger>

      {error && <Alert message={error} type="error" showIcon />}
    </div>
  );
}
