import type { NextConfig } from 'next';

const { codeInspectorPlugin } = require('code-inspector-plugin');

const nextConfig: NextConfig = {
  turbopack: {
    rules: codeInspectorPlugin({ bundler: 'turbopack' }),
  },
};

export default nextConfig;
