import type { NextConfig } from 'next';

const nextConfig: NextConfig = {};

// code-inspector-plugin 仅在开发环境启用
if (process.env.NODE_ENV === 'development') {
  const { codeInspectorPlugin } = require('code-inspector-plugin');
  nextConfig.turbopack = {
    rules: codeInspectorPlugin({ bundler: 'turbopack' }),
  };
}

export default nextConfig;
