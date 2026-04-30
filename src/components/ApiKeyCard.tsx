'use client';

import { useState, useEffect } from 'react';
import { Input } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { getApiKey, setApiKey, getApiEndpoint, setApiEndpoint } from '@/lib/storage';

const DEFAULT_ENDPOINT = 'https://api.xiaomimimo.com/v1/chat/completions';

interface ApiKeyCardProps {
  onApiKeyChange: (apiKey: string) => void;
  onApiEndpointChange: (endpoint: string) => void;
}

export default function ApiKeyCard({ onApiKeyChange, onApiEndpointChange }: ApiKeyCardProps) {
  const [apiKey, setApiKeyState] = useState('');
  const [apiEndpoint, setApiEndpointState] = useState('');

  useEffect(() => {
    const savedKey = getApiKey();
    if (savedKey) {
      setApiKeyState(savedKey);
      onApiKeyChange(savedKey);
    }
    const savedEndpoint = getApiEndpoint();
    if (savedEndpoint) {
      setApiEndpointState(savedEndpoint);
      onApiEndpointChange(savedEndpoint);
    }
  }, [onApiKeyChange, onApiEndpointChange]);

  const handleKeyChange = (value: string) => {
    setApiKeyState(value);
    setApiKey(value);
    onApiKeyChange(value);
  };

  const handleEndpointChange = (value: string) => {
    setApiEndpointState(value);
    setApiEndpoint(value);
    onApiEndpointChange(value);
  };

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-5">
        <span
          className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
          style={{ background: 'var(--accent-glow)', boxShadow: 'var(--glow-purple-sm)' }}
        >
          🔑
        </span>
        <h2 className="text-base font-semibold">API 配置</h2>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm" style={{ color: 'var(--muted)' }}>
            API Endpoint
          </label>
          <Input
            value={apiEndpoint}
            onChange={(e) => handleEndpointChange(e.target.value)}
            placeholder={DEFAULT_ENDPOINT}
          />
          <div className="text-xs" style={{ color: 'var(--muted)' }}>
            默认: {DEFAULT_ENDPOINT}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm" style={{ color: 'var(--muted)' }}>
            API Key
          </label>
          <Input.Password
            value={apiKey}
            onChange={(e) => handleKeyChange(e.target.value)}
            placeholder="请输入你的 MiMo API Key"
            // visible=true 表示密码已显示，按钮该显示"闭眼"以提示点击隐藏
            iconRender={(visible) => (visible ? <EyeInvisibleOutlined /> : <EyeOutlined />)}
          />
          <div className="text-xs" style={{ color: 'var(--muted)' }}>
            前往{' '}
            <a
              href="https://platform.xiaomimimo.com/console/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent)' }}
            >
              platform.xiaomimimo.com
            </a>{' '}
            获取 API Key
          </div>
        </div>
      </div>
    </div>
  );
}
