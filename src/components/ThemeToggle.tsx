'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

type Theme = 'light' | 'dark' | 'system';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>(() => {
    // 服务端渲染时使用 'dark'，客户端会立即更新
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // 使用 ref 追踪当前 theme，避免闭包捕获过期值
  const themeRef = useRef<Theme>(theme);
  themeRef.current = theme;

  // 获取系统主题偏好
  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  // 应用主题到 DOM
  const applyTheme = useCallback((themeToApply: 'light' | 'dark') => {
    document.documentElement.setAttribute('data-theme', themeToApply);
    setActualTheme(themeToApply);
  }, []);

  // 初始化主题
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;

    if (
      savedTheme &&
      (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')
    ) {
      setTheme(savedTheme);
      if (savedTheme === 'system') {
        applyTheme(getSystemTheme());
      } else {
        applyTheme(savedTheme);
      }
    } else {
      setTheme('system');
      applyTheme(getSystemTheme());
    }
  }, [applyTheme, getSystemTheme]);

  // 监听系统主题变化（使用 ref 避免闭包问题）
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (themeRef.current === 'system') {
        applyTheme(getSystemTheme());
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [applyTheme, getSystemTheme]);

  // 当 theme 状态变化时，应用相应的主题
  useEffect(() => {
    if (theme === 'system') {
      applyTheme(getSystemTheme());
    } else {
      applyTheme(theme);
    }
  }, [theme, applyTheme, getSystemTheme]);

  const cycleTheme = () => {
    const themeOrder: Theme[] = ['dark', 'light', 'system'];
    const currentIndex = themeOrder.indexOf(theme);
    const nextTheme = themeOrder[(currentIndex + 1) % themeOrder.length];
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  // 获取显示的图标和提示文字
  const getThemeInfo = () => {
    switch (theme) {
      case 'dark':
        return { icon: '🌙', label: '暗色模式' };
      case 'light':
        return { icon: '☀️', label: '亮色模式' };
      case 'system':
        return { icon: '💻', label: '跟随系统' };
    }
  };

  const { icon, label } = getThemeInfo();

  return (
    <div className="theme-toggle-wrapper">
      <button className="theme-toggle" onClick={cycleTheme} aria-label={`切换主题，当前：${label}`}>
        <span className="text-xl">{icon}</span>
        {theme === 'system' && (
          <span className="absolute -bottom-1 -right-1 text-xs" style={{ fontSize: '10px' }}>
            {actualTheme === 'dark' ? '🌙' : '☀️'}
          </span>
        )}
      </button>
      <span className="theme-toggle-tooltip">{label}</span>
    </div>
  );
}
