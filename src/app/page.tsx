'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  TTSModel,
  BuiltInVoice,
  AudioFormat,
  SynthesisStatus,
  SynthesisHistory,
} from '@/types/tts';
import {
  synthesizeNonStreaming,
  synthesizeStreaming,
  fileToBase64,
  getFileMimeType,
} from '@/lib/api';
import { createAudioUrl } from '@/lib/audio';
import { getHistory, addHistory } from '@/lib/storage';
import ApiKeyCard from '@/components/ApiKeyCard';
import ModelSelector from '@/components/ModelSelector';
import VoiceSelector from '@/components/VoiceSelector';
import StylePresets from '@/components/StylePresets';
import TextInput from '@/components/TextInput';
import StatusBar from '@/components/StatusBar';
import AudioPlayer from '@/components/AudioPlayer';
import HistoryList from '@/components/HistoryList';
import ThemeToggle from '@/components/ThemeToggle';

export default function Home() {
  // 状态
  const [apiKey, setApiKey] = useState('');
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [model, setModel] = useState<TTSModel>('mimo-v2.5-tts');
  const [voice, setVoice] = useState<BuiltInVoice>('mimo_default');
  const [format, setFormat] = useState<AudioFormat>('wav');
  const [voiceDesignPrompt, setVoiceDesignPrompt] = useState('');
  const [cloneFile, setCloneFile] = useState<File | null>(null);
  const [cloneStylePrompt, setCloneStylePrompt] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [assistantContent, setAssistantContent] = useState('');
  const [status, setStatus] = useState<SynthesisStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('就绪，等待合成');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioSize, setAudioSize] = useState(0);
  const [history, setHistory] = useState<SynthesisHistory[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // 加载历史记录
  useEffect(() => {
    setHistory(getHistory());
  }, []);

  // 处理模型切换
  const handleModelChange = useCallback((newModel: TTSModel) => {
    setModel(newModel);
    // 重置相关状态
    setVoiceDesignPrompt('');
    setCloneFile(null);
    setCloneStylePrompt('');
  }, []);

  // 处理标签插入
  const handleInsertTag = useCallback((tag: string, isStyleTag: boolean) => {
    if (isStyleTag) {
      // 样式标签插入到文本开头
      setAssistantContent((prev) => {
        // 检查是否已有样式标签
        const styleMatch = prev.match(/^\([^)]+\)/);
        if (styleMatch) {
          return tag + prev.substring(styleMatch[0].length);
        }
        return tag + prev;
      });
    } else {
      // 音频标签插入到光标位置（简化处理：插入到文本末尾）
      setAssistantContent((prev) => prev + tag);
    }
  }, []);

  // 处理合成
  const handleSynthesize = useCallback(async () => {
    if (!apiKey) {
      alert('请先输入 API Key');
      return;
    }

    if (!assistantContent.trim()) {
      alert('请输入要合成的文本');
      return;
    }

    if (model === 'mimo-v2.5-tts-voicedesign' && !voiceDesignPrompt.trim()) {
      alert('声音设计模式需要填写声音描述');
      return;
    }

    if (model === 'mimo-v2.5-tts-voiceclone' && !cloneFile) {
      alert('声音克隆模式需要上传音频样本');
      return;
    }

    setIsGenerating(true);
    setStatus('loading');
    setStatusMessage('正在请求 MiMo TTS API...');
    const startTime = Date.now();

    try {
      // 构建消息
      const messages = [];

      if (model === 'mimo-v2.5-tts') {
        if (userMessage.trim()) {
          messages.push({ role: 'user' as const, content: userMessage.trim() });
        }
        messages.push({ role: 'assistant' as const, content: assistantContent.trim() });
      } else if (model === 'mimo-v2.5-tts-voicedesign') {
        messages.push({ role: 'user' as const, content: voiceDesignPrompt.trim() });
        messages.push({ role: 'assistant' as const, content: assistantContent.trim() });
      } else if (model === 'mimo-v2.5-tts-voiceclone') {
        if (cloneStylePrompt.trim()) {
          messages.push({ role: 'user' as const, content: cloneStylePrompt.trim() });
        } else {
          messages.push({ role: 'user' as const, content: '' });
        }
        messages.push({ role: 'assistant' as const, content: assistantContent.trim() });
      }

      // 构建请求参数
      const params: Parameters<typeof synthesizeNonStreaming>[0] = {
        apiKey,
        apiEndpoint: apiEndpoint || undefined,
        model,
        messages,
        format,
      };

      // 设置音色
      if (model === 'mimo-v2.5-tts') {
        params.voice = voice;
      } else if (model === 'mimo-v2.5-tts-voiceclone' && cloneFile) {
        const base64 = await fileToBase64(cloneFile);
        const mimeType = getFileMimeType(cloneFile);
        params.voice = `data:${mimeType};base64,${base64}`;
      }

      // 执行合成
      let audioBytes: Uint8Array;
      if (format === 'pcm16') {
        setStatusMessage('正在合成语音 (流式)...');
        audioBytes = await synthesizeStreaming(params);
      } else {
        setStatusMessage('正在合成语音 (非流式)...');
        audioBytes = await synthesizeNonStreaming(params);
      }

      // 创建音频 URL
      const url = createAudioUrl(audioBytes);
      setAudioUrl(url);
      setAudioSize(audioBytes.length);

      // 添加到历史记录
      const newHistory = addHistory({
        text: assistantContent.substring(0, 100),
        model,
        voice: model === 'mimo-v2.5-tts' ? voice : undefined,
        audioUrl: url,
        audioSize: audioBytes.length,
      });
      setHistory(newHistory);

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      setStatus('success');
      setStatusMessage(`合成完成，耗时 ${elapsed}s`);
    } catch (error) {
      console.error('合成失败:', error);
      setStatus('error');
      setStatusMessage(`合成失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsGenerating(false);
    }
  }, [
    apiKey,
    apiEndpoint,
    model,
    voice,
    format,
    voiceDesignPrompt,
    cloneFile,
    cloneStylePrompt,
    userMessage,
    assistantContent,
  ]);

  // 处理清空
  const handleClear = useCallback(() => {
    setUserMessage('');
    setAssistantContent('');
    setAudioUrl(null);
    setAudioSize(0);
    setStatus('idle');
    setStatusMessage('就绪，等待合成');
  }, []);

  // 处理历史回放
  const handlePlayHistory = useCallback((item: SynthesisHistory) => {
    setAudioUrl(item.audioUrl);
    setAudioSize(item.audioSize);
  }, []);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isGenerating) {
          handleSynthesize();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGenerating, handleSynthesize]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <ThemeToggle />
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '40px 24px',
          background: 'var(--card)',
          backdropFilter: 'blur(16px) saturate(170%)',
          WebkitBackdropFilter: 'blur(16px) saturate(170%)',
          borderRadius: '24px',
          border: '1px solid var(--card-border)',
          boxShadow: 'var(--shadow-card)',
          marginTop: '20px',
          marginBottom: '20px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3 gradient-text">MiMo TTS Studio</h1>
          <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
            基于小米 MiMo-V2.5-TTS 系列模型的语音合成工具
          </p>
        </header>

        {/* API Key */}
        <ApiKeyCard onApiKeyChange={setApiKey} onApiEndpointChange={setApiEndpoint} />

        {/* Model & Voice Selection */}
        <div className="card">
          <div className="flex items-center gap-3 mb-5">
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
              style={{ background: 'var(--accent-glow)', boxShadow: 'var(--glow-purple-sm)' }}
            >
              🤖
            </span>
            <h2 className="text-base font-semibold">模型选择</h2>
          </div>

          <ModelSelector currentModel={model} onModelChange={handleModelChange} />

          <VoiceSelector
            model={model}
            voice={voice}
            format={format}
            voiceDesignPrompt={voiceDesignPrompt}
            cloneFile={cloneFile}
            cloneStylePrompt={cloneStylePrompt}
            onVoiceChange={setVoice}
            onFormatChange={setFormat}
            onVoiceDesignPromptChange={setVoiceDesignPrompt}
            onCloneFileChange={setCloneFile}
            onCloneStylePromptChange={setCloneStylePrompt}
          />
        </div>

        {/* Style Presets */}
        <StylePresets onInsertTag={handleInsertTag} />

        {/* Text Input */}
        <TextInput
          model={model}
          userMessage={userMessage}
          assistantContent={assistantContent}
          isGenerating={isGenerating}
          onUserMessageChange={setUserMessage}
          onAssistantContentChange={setAssistantContent}
          onSynthesize={handleSynthesize}
          onClear={handleClear}
        />

        {/* Status Bar */}
        <StatusBar status={status} message={statusMessage} />

        {/* Audio Player */}
        <AudioPlayer audioUrl={audioUrl} audioSize={audioSize} />

        {/* History */}
        <HistoryList history={history} onPlay={handlePlayHistory} />
      </div>
    </div>
  );
}
