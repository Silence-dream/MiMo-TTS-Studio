'use client';

import { useState, useEffect } from 'react';
import { getApiKey, setApiKey, getApiEndpoint, setApiEndpoint } from '@/lib/storage';

const DEFAULT_ENDPOINT = 'https://api.xiaomimimo.com/v1/chat/completions';

interface ApiKeyCardProps {
  onApiKeyChange: (apiKey: string) => void;
  onApiEndpointChange: (endpoint: string) => void;
}

export default function ApiKeyCard({ onApiKeyChange, onApiEndpointChange }: ApiKeyCardProps) {
  const [apiKey, setApiKeyState] = useState('');
  const [apiEndpoint, setApiEndpointState] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
          <input
            type="text"
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
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => handleKeyChange(e.target.value)}
              placeholder="请输入你的 MiMo API Key"
              style={{ paddingRight: '44px' }}
            />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer p-1"
              style={{ color: 'var(--muted)' }}
              onClick={() => setShowPassword(!showPassword)}
              title="显示/隐藏"
            >
              👁
            </button>
          </div>
          <div className="text-xs" style={{ color: 'var(--muted)' }}>
            前往{' '}
            <a
              href="https://platform.xiaomimimo.com"
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
