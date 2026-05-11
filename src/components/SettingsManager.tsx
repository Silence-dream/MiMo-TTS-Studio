'use client';

import { useCallback } from 'react';
import { Button, Collapse, Space } from 'antd';
import { ExportOutlined, ImportOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  getApiKey,
  getApiEndpoint,
  setApiKey,
  setApiEndpoint,
  getStoredVoice,
  setStoredVoice,
  getStoredFormat,
  setStoredFormat,
} from '@/lib/storage';
import { BuiltInVoice, AudioFormat } from '@/types/tts';
import { useToast } from '@/components/Toast';

interface Settings {
  apiKey: string;
  apiEndpoint: string;
  theme: string;
  format: string;
  voice: string;
  exportedAt: string;
}

export default function SettingsManager() {
  const toast = useToast();

  // 导出设置
  const handleExport = useCallback(() => {
    const settings: Settings = {
      apiKey: getApiKey(),
      apiEndpoint: getApiEndpoint(),
      theme: localStorage.getItem('theme') || 'system',
      format: getStoredFormat() || 'wav',
      voice: getStoredVoice() || 'mimo_default',
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

    toast.success('设置已导出');
  }, [toast]);

  // 导入设置
  const handleImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const settings: Settings = JSON.parse(event.target?.result as string);

          if (!settings.exportedAt) {
            throw new Error('无效的设置文件');
          }

          if (settings.apiKey) setApiKey(settings.apiKey);
          if (settings.apiEndpoint) setApiEndpoint(settings.apiEndpoint);
          if (settings.theme) localStorage.setItem('theme', settings.theme);
          if (settings.format) setStoredFormat(settings.format as AudioFormat);
          if (settings.voice) setStoredVoice(settings.voice as BuiltInVoice);

          toast.success('设置已导入，刷新页面生效');
        } catch {
          toast.error('导入失败：无效的设置文件');
        }
      };
      reader.readAsText(file);
    },
    [toast]
  );

  // 重置所有设置
  const handleReset = useCallback(() => {
    if (confirm('确定要重置所有设置吗？这将清除所有保存的配置。')) {
      localStorage.removeItem('theme');
      localStorage.removeItem('mimo_format');
      localStorage.removeItem('mimo_voice');
      toast.success('设置已重置，刷新页面生效');
    }
  }, [toast]);

  const collapseContent = (
    <div>
      <Space orientation="vertical" className="w-full" size="middle">
        <Button block icon={<ExportOutlined />} onClick={handleExport}>
          导出设置
        </Button>

        <label className="block">
          <Button block icon={<ImportOutlined />} className="w-full">
            导入设置
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </Button>
        </label>

        <Button block danger icon={<ReloadOutlined />} onClick={handleReset}>
          重置设置
        </Button>
      </Space>

      <div className="mt-3 text-xs" style={{ color: 'var(--muted)' }}>
        提示：导出的设置文件包含 API Key，请妥善保管
      </div>
    </div>
  );

  return (
    <div className="card">
      <Collapse
        ghost
        items={[
          {
            key: 'settings',
            label: (
              <div className="flex items-center gap-3">
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                  style={{ background: 'var(--accent-glow)', boxShadow: 'var(--glow-purple-sm)' }}
                >
                  ⚙️
                </span>
                <span className="font-semibold">设置管理</span>
              </div>
            ),
            children: collapseContent,
          },
        ]}
      />
    </div>
  );
}
