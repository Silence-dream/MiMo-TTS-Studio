'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { getApiKey, setApiKey, getApiEndpoint, setApiEndpoint } from '@/lib/storage';

const DEFAULT_ENDPOINT = 'https://api.xiaomimimo.com/v1/chat/completions';
const PERSIST_DEBOUNCE_MS = 300;

interface ApiKeyCardProps {
  onApiKeyChange: (apiKey: string) => void;
  onApiEndpointChange: (endpoint: string) => void;
}

export default function ApiKeyCard({ onApiKeyChange, onApiEndpointChange }: ApiKeyCardProps) {
  const [apiKey, setApiKeyState] = useState('');
  const [apiEndpoint, setApiEndpointState] = useState('');
  // 持久化定时器（按字段独立），避免每次按键都同步写 localStorage
  const keyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endpointTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 持有最新回调以避免初始化 effect 依赖父级回调引用稳定性
  const onApiKeyChangeRef = useRef(onApiKeyChange);
  const onApiEndpointChangeRef = useRef(onApiEndpointChange);
  onApiKeyChangeRef.current = onApiKeyChange;
  onApiEndpointChangeRef.current = onApiEndpointChange;

  useEffect(() => {
    const savedKey = getApiKey();
    if (savedKey) {
      setApiKeyState(savedKey);
      onApiKeyChangeRef.current(savedKey);
    }
    const savedEndpoint = getApiEndpoint();
    if (savedEndpoint) {
      setApiEndpointState(savedEndpoint);
      onApiEndpointChangeRef.current(savedEndpoint);
    }
  }, []);

  // 卸载时把待写入立即落盘，防止丢失
  useEffect(() => {
    return () => {
      if (keyTimerRef.current) clearTimeout(keyTimerRef.current);
      if (endpointTimerRef.current) clearTimeout(endpointTimerRef.current);
    };
  }, []);

  const handleKeyChange = useCallback(
    (value: string) => {
      setApiKeyState(value);
      onApiKeyChange(value);
      if (keyTimerRef.current) clearTimeout(keyTimerRef.current);
      keyTimerRef.current = setTimeout(() => setApiKey(value), PERSIST_DEBOUNCE_MS);
    },
    [onApiKeyChange]
  );

  const handleEndpointChange = useCallback(
    (value: string) => {
      setApiEndpointState(value);
      onApiEndpointChange(value);
      if (endpointTimerRef.current) clearTimeout(endpointTimerRef.current);
      endpointTimerRef.current = setTimeout(() => setApiEndpoint(value), PERSIST_DEBOUNCE_MS);
    },
    [onApiEndpointChange]
  );

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
