'use client';

import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, actualTheme, setTheme } = useTheme();

  const cycleTheme = () => {
    const themeOrder = ['dark', 'light', 'system'] as const;
    const currentIndex = themeOrder.indexOf(theme);
    const nextTheme = themeOrder[(currentIndex + 1) % themeOrder.length];
    setTheme(nextTheme);
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
