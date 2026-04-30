// 共享样式常量，避免组件内每次渲染创建新对象

/** 卡片头部图标徽章样式 */
export const iconBadgeStyle: React.CSSProperties = {
  background: 'var(--accent-glow)',
  boxShadow: 'var(--glow-purple-sm)',
};

/** 毛玻璃卡片容器样式（用于不使用 .card class 的场景） */
export const glassCardStyle: React.CSSProperties = {
  background: 'var(--card)',
  backdropFilter: 'blur(16px) saturate(170%)',
  WebkitBackdropFilter: 'blur(16px) saturate(170%)',
  border: '1px solid var(--card-border)',
  boxShadow: 'var(--shadow-card)',
};
