# MiMo TTS Studio 桌面版发布

MiMo TTS Studio 是一款基于小米 MiMo-V2.5-TTS 系列模型的语音合成工具，提供 Web 与桌面端体验。桌面版使用 Electron 打包，支持 Windows、macOS 和 Linux，让你可以在本地应用中完成 API 配置、文本合成、声音设计、声音克隆、批量合成和历史管理。

## 本版本亮点

- 新增跨平台桌面端，支持 Windows / macOS / Linux。
- 桌面端通过安全 IPC 调用主进程代理 MiMo TTS 请求，渲染进程不直接暴露 Node.js 能力。
- 保留原有 Web 版本能力，桌面端复用同一套合成界面和业务逻辑。
- 支持内置音色、声音设计、声音克隆三种合成模式。
- 支持 WAV 非流式输出与 PCM16 流式合成。
- 支持批量合成、历史记录、音频播放、波形可视化、配置导入导出。
- 桌面菜单已本地化为中文。

## 下载说明

请在本 Release 的 Assets 中选择对应系统安装包：

- Windows：下载 `MiMo TTS Studio Setup *.exe`
- macOS：下载 `*.dmg`
- Linux：下载 `*.AppImage` 或 `*.deb`

## 使用说明

1. 安装并启动 MiMo TTS Studio。
2. 在「API 配置」中填入小米 MiMo 平台 API Key。
3. 选择合成模式和音色 / 声音描述 / 克隆音频。
4. 输入文本，点击「合成语音」生成音频。
5. 在播放器或历史记录中播放、下载、导出音频。

## 注意事项

- 首版桌面包暂未配置代码签名、公证和自动更新，首次启动时系统可能出现安全提示。
- API Key 仅保存在本机本地存储中，请妥善保管。
- 语音合成需要联网访问小米 MiMo API。
- macOS 如提示无法打开，可在 Finder 中右键应用并选择「打开」。
- Linux AppImage 可能需要先赋予执行权限：`chmod +x *.AppImage`。
