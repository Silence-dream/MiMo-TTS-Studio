# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

MiMo TTS Studio — 基于小米 MiMo-V2.5-TTS 系列模型的在线语音合成工具。支持三种模式：内置音色选择（9 种音色）、声音设计（文本描述生成声音）、声音克隆（音频样本复刻声音）。

## 技术栈

- **框架**：Next.js 16 (App Router) + React 19
- **语言**：TypeScript 6
- **UI 库**：Ant Design 6（`antd`、`@ant-design/icons`、`antd-style`），通过 `@ant-design/nextjs-registry` 集成
- **样式**：Tailwind CSS 4（通过 `@tailwindcss/postcss`）+ Ant Design 玻璃拟态主题（`useGlassTheme` hook）
- **主题系统**：通过 `<html>` 元素的 `data-theme` 属性切换暗色/亮色，支持 `light`/`dark`/`system` 三种模式（`ThemeProvider`）
- **包管理器**：pnpm (v10.33.2)
- **持久化**：localStorage 存储配置和历史元数据；IndexedDB (`mimo-tts-audio`) 存储音频二进制数据
- **无外部状态管理** — 合成相关状态通过 `useSynthesis` hook 管理，UI 状态通过 `useState`/`useCallback` 管理

## 常用命令

```bash
pnpm dev          # 启动开发服务器 (Turbopack, http://localhost:3000)
pnpm build        # 生产构建
pnpm start        # 启动生产服务器
pnpm lint         # 运行 Next.js lint
pnpm format       # 代码格式化 (Prettier)
pnpm format:check # 检查格式（不修改）
```

未配置测试框架。使用 Husky + lint-staged 在提交时自动格式化（prettier --write）。

## 架构

```
src/
├── app/
│   ├── api/tts/route.ts    # 服务端代理，转发请求到小米 MiMo API
│   ├── about/page.tsx       # 关于页面（项目介绍、功能说明、技术栈）
│   ├── page.tsx             # 主页面 — 持有全部应用状态，委托 useSynthesis 管理合成逻辑
│   ├── layout.tsx           # 根布局：AntdProvider > ToastProvider
│   └── globals.css          # Tailwind + CSS 自定义属性（主题变量）
├── components/
│   ├── AntdProvider.tsx     # Ant Design 集成：ThemeProvider > ConfigProvider > AntdRegistry
│   ├── ThemeProvider.tsx    # 主题上下文（light/dark/system），监听系统主题变化
│   ├── ApiKeyCard.tsx       # API Key + Endpoint 配置，自动保存到 localStorage
│   ├── ModelSelector.tsx    # 三种模型切换
│   ├── VoiceSelector.tsx    # 内置音色选择 / 声音设计描述 / 声音克隆上传
│   ├── StylePresets.tsx     # 风格标签：12 情绪 + 8 方言角色 + 8 音频效果
│   ├── TextInput.tsx        # 文本输入、字数统计、预估时长、示例文本、TXT 上传
│   ├── AudioPlayer.tsx      # 音频播放 + Web Audio API 频谱波形可视化
│   ├── BatchSynthesis.tsx   # 批量合成（TXT 上传/拖拽，最多 100 行，ZIP 下载）
│   ├── TextPreprocessor.tsx # 文本预处理（去空格、去换行、智能分段、添加标点）
│   ├── HistoryList.tsx      # 合成历史（搜索、日期筛选、批量选择、JSON/CSV/ZIP 导出）
│   ├── SettingsManager.tsx  # 设置导入/导出/重置
│   ├── KeyboardShortcuts.tsx # 快捷键面板 (? 键显示)
│   ├── OnboardingGuide.tsx  # 首次访问 5 步新手引导
│   ├── StatusBar.tsx        # 合成状态显示
│   ├── ThemeToggle.tsx      # 暗色/亮色主题切换
│   ├── FileUpload.tsx       # 通用文件上传
│   └── Toast.tsx            # Toast 通知（Context + Provider 模式）
├── hooks/
│   ├── useSynthesis.ts      # 合成核心逻辑 hook（模型/音色/格式状态、合成/取消/批量/历史管理）
│   └── useGlassTheme.ts     # Ant Design 玻璃拟态主题配置（glassmorphism 效果）
├── lib/
│   ├── api.ts               # 客户端请求封装（非流式 + SSE 流式）
│   ├── audio.ts             # PCM16→WAV 转换、base64 编解码、Blob URL 管理
│   ├── audioDb.ts           # IndexedDB 封装（saveAudio/getAudio/deleteAudio/clearAllAudio）
│   └── storage.ts           # localStorage 封装（API Key、Endpoint、历史、音色收藏/使用统计）
└── types/tts.ts             # 所有 TypeScript 类型定义
```

### 数据流

```
page.tsx (状态持有者)
  → useSynthesis hook (合成逻辑)
    → lib/api.ts (请求封装)
      → /api/tts (服务端代理)
        → 小米 MiMo API
  → props → 子组件 → 回调 → useSynthesis
```

### Provider 嵌套顺序（layout.tsx）

```
<AntdProvider>          ← 入口
  <ThemeProvider>       ← 主题上下文 (light/dark/system)
    <ConfigProvider>    ← Ant Design 主题 + 玻璃拟态样式
      <AntdRegistry>    ← SSR 样式注入
        <ToastProvider> ← Toast 通知上下文
          {children}
```

### 存储层

- **localStorage**：配置和历史元数据（`mimo_api_key`、`mimo_api_endpoint`、`mimo_tts_history`、`mimo_favorite_voices`、`mimo_voice_usage`、`theme`、`has_seen_guide`）
- **IndexedDB**：音频二进制数据（数据库名 `mimo-tts-audio`，store `audio-data`）。历史记录中 `audioUrl` 以 `db://` 前缀存储 ID，播放时从 IndexedDB 加载

### API 代理

`api/tts/route.ts` 接收客户端完整请求体，提取 `apiKey` 和 `apiEndpoint`，将其余字段转发到 `https://api.xiaomimimo.com/v1/chat/completions`（或自定义端点）。支持 JSON 和 SSE 流式两种响应。认证使用 `api-key` 请求头。

### 音频格式

WAV（非流式，完整 base64 返回）和 PCM16（SSE 流式传输，客户端拼接后注入 WAV 头，采样率 24kHz）。

### 批量合成

并发控制为 3（`CONCURRENCY = 3`），使用 Promise.race 实现有限并发队列。结果打包为 ZIP 下载（JSZip）。

## 路径别名

`@/*` 映射到 `./src/*`（在 `tsconfig.json` 中配置）。

## 关键约定

- 所有面向用户的文案和代码注释使用**中文 (zh-CN)**
- 组件均为 `'use client'`（纯客户端渲染）
- 风格标签如 `(开心)` 插入到文本开头；音频标签如 `[深吸一口气]` 可插入文本任意位置
- 代码格式化使用 Prettier（semi、singleQuote、printWidth: 100、trailingComma: es5、endOfLine: lf），通过 Husky + lint-staged 在 commit 时自动执行
- Ant Design 主题采用玻璃拟态（glassmorphism）风格，通过 `useGlassTheme` hook 统一配置
