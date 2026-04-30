'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // 初始值固定为 'dark'，与 SSR 保持一致，避免水合错误
  const [theme, setThemeState] = useState<Theme>('dark');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('dark');

  const themeRef = useRef<Theme>(theme);
  themeRef.current = theme;

  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  const applyTheme = useCallback((t: 'light' | 'dark') => {
    document.documentElement.setAttribute('data-theme', t);
    setActualTheme(t);
  }, []);

  // 初始化：从 localStorage 同步用户偏好；DOM 的 data-theme 已被 layout 内联脚本处理
  // 应用主题统一交给下方 [theme] 副作用，避免重复 setAttribute
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
      setThemeState(savedTheme);
    } else {
      setThemeState('system');
    }
    // 同步 actualTheme 到 inline script 已写入 DOM 的值，
    // 避免 ThemeToggle 等消费者短暂看到 'dark' 默认状态
    const current = document.documentElement.getAttribute('data-theme');
    if (current === 'light' || current === 'dark') {
      setActualTheme(current);
    }
  }, []);

  // 监听系统主题变化（仅在 theme === 'system' 时联动）
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

  // theme 变化时应用到 DOM。首次挂载跳过，避免用初始 'dark' 覆盖内联脚本设置的正确值
  const isFirstApplyRef = useRef(true);
  useEffect(() => {
    if (isFirstApplyRef.current) {
      isFirstApplyRef.current = false;
      return;
    }
    applyTheme(theme === 'system' ? getSystemTheme() : theme);
  }, [theme, applyTheme, getSystemTheme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem('theme', t);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, actualTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
