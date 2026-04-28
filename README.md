# MiMo TTS Studio

基于小米 [MiMo-V2.5-TTS](https://platform.xiaomimimo.com) 系列模型的在线语音合成工具，提供直观友好的 Web 界面，支持三种合成模式、流式传输、批量合成等功能。

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## 功能特性

### 三种合成模式

| 模型                                       | 说明                             | 用法                                            |
| ------------------------------------------ | -------------------------------- | ----------------------------------------------- |
| **内置音色** (`mimo-v2.5-tts`)             | 9 种精选音色，覆盖中英文、男女声 | 选择音色 → 输入文本 → 合成                      |
| **声音设计** (`mimo-v2.5-tts-voicedesign`) | 通过自然语言描述生成定制声音     | 描述声音特征（如"温柔的女声"）→ 输入文本 → 合成 |
| **声音克隆** (`mimo-v2.5-tts-voiceclone`)  | 上传音频样本复刻音色             | 上传音频 → 输入文本 → 合成                      |

### 内置音色列表

| 音色      | 语言 | 性别 |
| --------- | ---- | ---- |
| MiMo-默认 | 默认 | 默认 |
| 冰糖      | 中文 | 女声 |
| 茉莉      | 中文 | 女声 |
| 苏打      | 中文 | 男声 |
| 白桦      | 中文 | 男声 |
| Mia       | 英文 | 女声 |
| Chloe     | 英文 | 女声 |
| Milo      | 英文 | 男声 |
| Dean      | 英文 | 男声 |

### 风格标签系统

**情绪标签**（插入到文本开头）— 12 种情感风格：

```
(开心) (悲伤) (愤怒) (温柔) (慵懒) (磁性) (甜美) (严肃) (活泼) (低沉) (冷淡) (激动)
```

**方言/角色标签** — 8 种方言和角色风格：

```
(东北话) (四川话) (河南话) (粤语) (唱歌) (夹子音) (大叔音) (御姐音)
```

**音频效果标签**（可插入文本任意位置）— 8 种效果：

```
[深吸一口气] [叹气] [轻声笑] [大笑] [啜泣] [颤抖] [咳嗽] [停顿]
```

### 其他功能

- **流式 / 非流式合成** — PCM16 流式实时传输，WAV 非流式完整返回
- **批量合成** — 上传 TXT 文件（每行一条，最多 100 行），逐行合成为音频并打包下载 ZIP
- **文本预处理** — 去除多余空格、去除换行、智能分段（按句号/问号/感叹号）、自动添加标点
- **文本字数统计** — 实时显示中文字符数、英文单词数、总字符数，预估合成时长
- **示例文本** — 内置 6 条风格示例文本，一键填入
- **TXT 文件上传** — 支持上传 TXT 文件导入合成文本
- **音频波形可视化** — 播放时通过 Web Audio API 实时显示频谱波形
- **合成历史** — 自动保存最近 20 条记录，支持搜索、按日期筛选、批量选择、单条/批量下载
- **历史导出** — 支持导出为 JSON / CSV 格式
- **音色收藏与使用统计** — 收藏常用音色，记录使用次数
- **设置导入/导出** — 一键备份和恢复配置（JSON 格式）
- **键盘快捷键** — `Ctrl+Enter` 合成、`Esc` 关闭面板、`?` 查看快捷键
- **暗色 / 亮色主题** — 跟随系统或手动切换
- **新手引导** — 首次使用时的 5 步交互式引导教程
- **Toast 通知** — 操作反馈通过 Toast 弹窗提示

## 快速开始

### 前置条件

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) (推荐) 或 npm / yarn
- 小米 MiMo API Key（在 [platform.xiaomimimo.com](https://platform.xiaomimimo.com) 注册获取）

### 安装与运行

```bash
# 克隆仓库
git clone https://github.com/Silence-dream/MiMo-TTS-Studio.git
cd MiMo-TTS-Studio

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000)，在页面顶部填入 API Key 即可开始使用。

### 生产构建

```bash
pnpm build
pnpm start
```

## 使用指南

### 1. 配置 API Key

在页面顶部的「API 配置」区域填入从小米开放平台获取的 API Key。如使用自定义端点，也可在此修改 API Endpoint。API Key 会自动保存到 localStorage，下次访问无需重新输入。

### 2. 选择合成模式

- **内置音色**：从 9 种预设音色中选择
- **声音设计**：在「声音描述」中用自然语言描述想要的声音特征
- **声音克隆**：上传一段音频样本（支持 WAV / MP3）

### 3. 输入文本并合成

在文本框中输入要合成的文字，可点击「风格标签」面板插入情感/效果标签，然后点击「合成语音」按钮（或按 `Ctrl+Enter`）。

### 风格标签示例

**情感标签**（插入到文本开头）：

```
(开心) 今天天气真好啊！
(悲伤) 我好想你...
(温柔) 晚安，做个好梦。
(东北话) 哎呀妈呀，这天儿也忒冷了吧！
```

**音频效果标签**（插入到文本任意位置）：

```
[深吸一口气] 让我想想...
他[叹气]叹了口气。
哈哈[大笑]太好笑了！
```

### 5. 批量合成

展开「批量合成」面板，上传 TXT 文件（每行一条文本），即可批量合成并打包下载 ZIP。

## 项目结构

```
src/
├── app/
│   ├── api/tts/route.ts        # 服务端 API 代理（转发请求到小米 MiMo API）
│   ├── about/page.tsx           # 介绍页
│   ├── page.tsx                 # 主页面（持有全部应用状态）
│   ├── layout.tsx               # 根布局
│   └── globals.css              # 全局样式 + 主题变量
├── components/
│   ├── ApiKeyCard.tsx           # API Key 配置卡片
│   ├── ModelSelector.tsx        # 模型选择器（三种模式）
│   ├── VoiceSelector.tsx        # 音色选择器 + 声音设计/克隆配置
│   ├── StylePresets.tsx         # 风格标签面板（情绪/方言/音频效果）
│   ├── TextInput.tsx            # 文本输入区域（含字数统计、示例文本、TXT 上传）
│   ├── AudioPlayer.tsx          # 音频播放器 + 波形可视化
│   ├── BatchSynthesis.tsx       # 批量合成面板（支持拖拽上传）
│   ├── TextPreprocessor.tsx     # 文本预处理工具
│   ├── HistoryList.tsx          # 合成历史列表（搜索、筛选、批量下载）
│   ├── SettingsManager.tsx      # 设置导入/导出/重置
│   ├── KeyboardShortcuts.tsx    # 键盘快捷键面板
│   ├── OnboardingGuide.tsx      # 新手引导（5 步交互式教程）
│   ├── StatusBar.tsx            # 状态栏
│   ├── ThemeToggle.tsx          # 主题切换
│   ├── FileUpload.tsx           # 文件上传组件
│   └── Toast.tsx                # Toast 提示组件
├── lib/
│   ├── api.ts                   # 客户端 API 请求封装（非流式 + SSE 流式）
│   ├── audio.ts                 # PCM16→WAV 转换、base64 编解码、Blob URL 管理
│   └── storage.ts               # localStorage 封装（API Key、Endpoint、历史、音色收藏）
└── types/
    └── tts.ts                   # TypeScript 类型定义
```

## 技术栈

| 技术                        | 用途                             |
| --------------------------- | -------------------------------- |
| **Next.js 16** (App Router) | React 全栈框架                   |
| **React 19**                | UI 库                            |
| **TypeScript 6**            | 类型安全                         |
| **Tailwind CSS 4**          | 原子化 CSS                       |
| **JSZip**                   | 批量合成 ZIP 打包 / 历史批量下载 |
| **Web Audio API**           | 音频波形可视化                   |
| **SSE**                     | 流式音频传输                     |
| **localStorage**            | 客户端持久化存储                 |

## 常用命令

```bash
pnpm dev          # 启动开发服务器 (Turbopack)
pnpm build        # 生产构建
pnpm start        # 启动生产服务器
pnpm lint         # 代码检查
pnpm format       # 代码格式化
```

## 许可证

[MIT](./LICENSE)
