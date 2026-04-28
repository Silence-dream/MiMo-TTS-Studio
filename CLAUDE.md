# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

MiMo TTS Studio — 基于小米 MiMo-V2.5-TTS 系列模型的在线语音合成工具。支持三种模式：内置音色选择、声音设计（文本描述生成声音）、声音克隆（音频样本复刻声音）。

## 技术栈

- **框架**：Next.js 16 (App Router) + React 19
- **语言**：TypeScript 6
- **样式**：Tailwind CSS 4（通过 `@tailwindcss/postcss`），使用 CSS 自定义属性实现暗色/亮色主题切换，定义在 `globals.css`
- **包管理器**：pnpm (v10.33.2)
- **无外部状态管理** — 所有状态集中在 `page.tsx` 中，通过 `useState`/`useCallback` 管理
- **持久化**：localStorage 存储 API Key、API Endpoint 和合成历史

## 常用命令

```bash
pnpm dev          # 启动开发服务器 (http://localhost:3000)
pnpm build        # 生产构建
pnpm start        # 启动生产服务器
pnpm lint         # 运行 Next.js lint
```

未配置测试框架。

## 架构

```
src/
├── app/
│   ├── api/tts/route.ts    # 服务端代理，转发请求到小米 MiMo API
│   ├── page.tsx             # 唯一页面 — 持有全部应用状态
│   ├── layout.tsx           # 根布局 (zh-CN, metadata)
│   └── globals.css          # Tailwind + CSS 自定义属性（主题变量）
├── components/              # 纯展示组件，通过 props 接收状态
├── lib/
│   ├── api.ts               # 客户端请求封装（非流式 + SSE 流式）
│   ├── audio.ts             # PCM16→WAV 转换、base64 编解码、Blob URL 管理
│   └── storage.ts           # localStorage 封装（API Key、Endpoint、历史记录）
└── types/tts.ts             # 所有 TypeScript 类型定义
```

**数据流**：`page.tsx`（状态持有者）→ props → 组件 → 回调 → `page.tsx` → `lib/api.ts` → `/api/tts`（代理）→ 小米 API。

**API 代理**（`api/tts/route.ts`）：接收客户端完整请求体，提取 `apiKey` 和 `apiEndpoint`，将其余字段转发到 `https://api.xiaomimimo.com/v1/chat/completions`（或自定义端点）。支持 JSON 和 SSE 流式两种响应。

**音频格式**：WAV（非流式，完整 base64 返回）和 PCM16（SSE 流式传输，客户端拼接后注入 WAV 头，采样率 24kHz）。

**主题系统**：通过 `<html>` 元素的 `data-theme` 属性切换暗色/亮色主题，由 `ThemeToggle` 组件控制，偏好存储在 localStorage 的 `theme` 键中。

## 路径别名

`@/*` 映射到 `./src/*`（在 `tsconfig.json` 中配置）。

## 关键约定

- 所有面向用户的文案和代码注释使用**中文 (zh-CN)**
- 组件均为 `'use client'`（纯客户端渲染）
- 风格标签如 `(开心)` 插入到文本开头；音频标签如 `[深吸一口气]` 可插入文本任意位置
- 小米 API 认证使用 `api-key` 请求头（而非 `Authorization`）
