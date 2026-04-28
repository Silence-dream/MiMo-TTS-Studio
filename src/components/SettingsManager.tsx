'use client';

import { useState } from 'react';
import { getApiKey, getApiEndpoint, setApiKey, setApiEndpoint } from '@/lib/storage';

interface Settings {
  apiKey: string;
  apiEndpoint: string;
  theme: string;
  format: string;
  voice: string;
  exportedAt: string;
}

export default function SettingsManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // 导出设置
  const handleExport = () => {
    const settings: Settings = {
      apiKey: getApiKey(),
      apiEndpoint: getApiEndpoint(),
      theme: localStorage.getItem('theme') || 'system',
      format: localStorage.getItem('format') || 'wav',
      voice: localStorage.getItem('voice') || 'mimo_default',
      exportedAt: new Date().toISOString(),
    };

    const data = JSON.stringify(settings, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mimo_tts_settings_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setImportStatus('设置已导出');
    setTimeout(() => setImportStatus(null), 3000);
  };

  // 导入设置
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const settings: Settings = JSON.parse(event.target?.result as string);

        // 验证设置格式
        if (!settings.exportedAt) {
          throw new Error('无效的设置文件');
        }

        // 应用设置
        if (settings.apiKey) {
          setApiKey(settings.apiKey);
        }
        if (settings.apiEndpoint) {
          setApiEndpoint(settings.apiEndpoint);
        }
        if (settings.theme) {
          localStorage.setItem('theme', settings.theme);
        }
        if (settings.format) {
          localStorage.setItem('format', settings.format);
        }
        if (settings.voice) {
          localStorage.setItem('voice', settings.voice);
        }

        setImportStatus('设置已导入，刷新页面生效');
        setTimeout(() => setImportStatus(null), 5000);
      } catch (error) {
        setImportStatus('导入失败：无效的设置文件');
        setTimeout(() => setImportStatus(null), 3000);
      }
    };
    reader.readAsText(file);
  };

  // 重置所有设置
  const handleReset = () => {
    if (confirm('确定要重置所有设置吗？这将清除所有保存的配置。')) {
      localStorage.removeItem('theme');
      localStorage.removeItem('format');
      localStorage.removeItem('voice');
      // 保留 API Key 和 Endpoint

      setImportStatus('设置已重置，刷新页面生效');
      setTimeout(() => setImportStatus(null), 5000);
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
            ⚙️
          </span>
          <h2 className="text-base font-semibold">设置管理</h2>
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
          <div className="flex flex-col gap-3">
            {/* 导出按钮 */}
            <button className="btn btn-secondary" onClick={handleExport}>
              📤 导出设置
            </button>

            {/* 导入按钮 */}
            <label className="btn btn-secondary cursor-pointer">
              📥 导入设置
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>

            {/* 重置按钮 */}
            <button
              className="btn btn-secondary"
              onClick={handleReset}
              style={{ color: 'var(--error)' }}
            >
              🔄 重置设置
            </button>
          </div>

          {/* 状态提示 */}
          {importStatus && (
            <div
              className="mt-3 p-3 rounded-lg text-sm text-center"
              style={{
                background: importStatus.includes('失败')
                  ? 'rgba(248, 113, 113, 0.1)'
                  : 'rgba(52, 211, 153, 0.1)',
                color: importStatus.includes('失败') ? 'var(--error)' : 'var(--success)',
              }}
            >
              {importStatus}
            </div>
          )}

          <div className="mt-3 text-xs" style={{ color: 'var(--muted)' }}>
            提示：导出的设置文件包含 API Key，请妥善保管
          </div>
        </div>
      )}
    </div>
  );
}
