'use client';

import { useState, useRef, useCallback } from 'react';

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
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): boolean => {
      setError(null);

      // 检查文件类型
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

      // 检查文件大小
      if (file.size > maxSize) {
        const maxSizeMB = Math.round(maxSize / (1024 * 1024));
        setError(`文件大小超过 ${maxSizeMB}MB 限制`);
        return false;
      }

      return true;
    },
    [accept, maxSize]
  );

  const handleFile = useCallback(
    (file: File) => {
      if (validateFile(file)) {
        // 模拟上传进度
        setUploadProgress(0);
        const interval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 100) {
              clearInterval(interval);
              return 100;
            }
            return prev + 10;
          });
        }, 50);

        setTimeout(() => {
          onFileChange(file);
          clearInterval(interval);
          setUploadProgress(100);
        }, 500);
      }
    },
    [validateFile, onFileChange]
  );

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
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileChange(null);
    setUploadProgress(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm" style={{ color: 'var(--muted)' }}>
        上传音频样本
      </label>

      <div
        className={`file-upload-zone ${isDragging ? 'dragging' : ''} ${currentFile ? 'has-file' : ''}`}
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />

        {currentFile ? (
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎵</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
                {currentFile.name}
              </div>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>
                {formatFileSize(currentFile.size)}
              </div>
            </div>
            <button
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm cursor-pointer transition-all"
              style={{
                background: 'rgba(248, 113, 113, 0.1)',
                color: 'var(--error)',
                border: 'none',
              }}
              onClick={handleRemove}
              title="移除文件"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="text-center">
            <span className="text-3xl mb-2 block">📁</span>
            <div className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
              {isDragging ? '释放文件以上传' : '点击或拖拽文件到此处'}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
              支持 MP3/WAV 格式，最大 {Math.round(maxSize / (1024 * 1024))}MB
            </div>
          </div>
        )}

        {/* 上传进度条 */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="upload-progress">
            <div className="upload-progress-bar" style={{ width: `${uploadProgress}%` }} />
          </div>
        )}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="text-xs" style={{ color: 'var(--error)' }}>
          {error}
        </div>
      )}
    </div>
  );
}
