'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
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
import { createAudioUrl, revokeAudioUrl } from '@/lib/audio';
import { getHistory, addHistory, deleteHistory } from '@/lib/storage';
import ApiKeyCard from '@/components/ApiKeyCard';
import ModelSelector from '@/components/ModelSelector';
import VoiceSelector from '@/components/VoiceSelector';
import BatchSynthesis from '@/components/BatchSynthesis';
import TextPreprocessor from '@/components/TextPreprocessor';
import SettingsManager from '@/components/SettingsManager';
import StylePresets from '@/components/StylePresets';
import TextInput from '@/components/TextInput';
import StatusBar from '@/components/StatusBar';
import AudioPlayer from '@/components/AudioPlayer';
import HistoryList from '@/components/HistoryList';
import ThemeToggle from '@/components/ThemeToggle';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import OnboardingGuide from '@/components/OnboardingGuide';
import { useToast } from '@/components/Toast';

export default function Home() {
  const toast = useToast();

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
  const audioUrlRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 加载历史记录
  useEffect(() => {
    setHistory(getHistory());
  }, []);

  // 组件卸载时释放 Blob URL
  useEffect(() => {
    return () => {
      if (audioUrlRef.current) revokeAudioUrl(audioUrlRef.current);
    };
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
      toast.error('请先输入 API Key');
      return;
    }

    if (!assistantContent.trim()) {
      toast.warning('请输入要合成的文本');
      return;
    }

    if (model === 'mimo-v2.5-tts-voicedesign' && !voiceDesignPrompt.trim()) {
      toast.warning('声音设计模式需要填写声音描述');
      return;
    }

    if (model === 'mimo-v2.5-tts-voiceclone' && !cloneFile) {
      toast.warning('声音克隆模式需要上传音频样本');
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
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
        signal: controller.signal,
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

      // 创建音频 URL，释放旧的 Blob URL
      const url = createAudioUrl(audioBytes);
      if (audioUrlRef.current) revokeAudioUrl(audioUrlRef.current);
      audioUrlRef.current = url;
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
      toast.success(`合成完成，耗时 ${elapsed}s`);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setStatus('idle');
        setStatusMessage('合成已取消');
        toast.warning('合成已取消');
      } else {
        console.error('合成失败:', error);
        const errorMsg = error instanceof Error ? error.message : '未知错误';
        setStatus('error');
        setStatusMessage(`合成失败: ${errorMsg}`);
        toast.error(`合成失败: ${errorMsg}`);
      }
    } finally {
      abortControllerRef.current = null;
      setIsGenerating(false);
    }
  }, [
    apiKey,
    apiEndpoint,
    model,
    voice,
    toast,
    format,
    voiceDesignPrompt,
    cloneFile,
    cloneStylePrompt,
    userMessage,
    assistantContent,
  ]);

  // 处理取消合成
  const handleCancel = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  // 处理清空
  const handleClear = useCallback(() => {
    setUserMessage('');
    setAssistantContent('');
    if (audioUrlRef.current) {
      revokeAudioUrl(audioUrlRef.current);
      audioUrlRef.current = null;
    }
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

  // 处理删除历史记录
  const handleDeleteHistory = useCallback(
    (id: string) => {
      const newHistory = deleteHistory(id);
      setHistory(newHistory);
      toast.success('已删除历史记录');
    },
    [toast]
  );

  // 处理批量合成
  const handleBatchSynthesize = useCallback(
    async (texts: string[]) => {
      if (!apiKey) {
        toast.error('请先输入 API Key');
        return;
      }

      setIsGenerating(true);
      setStatus('loading');
      setStatusMessage(`批量合成中 (0/${texts.length})...`);
      const startTime = Date.now();

      try {
        const results: { text: string; audioUrl: string; audioSize: number }[] = [];

        for (let i = 0; i < texts.length; i++) {
          setStatusMessage(`批量合成中 (${i + 1}/${texts.length})...`);

          const messages = [{ role: 'assistant' as const, content: texts[i] }];
          const params = {
            apiKey,
            apiEndpoint: apiEndpoint || undefined,
            model,
            messages,
            format,
            voice: model === 'mimo-v2.5-tts' ? voice : undefined,
          };

          let audioBytes: Uint8Array;
          if (format === 'pcm16') {
            audioBytes = await synthesizeStreaming(params);
          } else {
            audioBytes = await synthesizeNonStreaming(params);
          }

          const url = createAudioUrl(audioBytes);
          results.push({ text: texts[i], audioUrl: url, audioSize: audioBytes.length });

          // 添加到历史记录
          const newHistory = addHistory({
            text: texts[i].substring(0, 100),
            model,
            voice: model === 'mimo-v2.5-tts' ? voice : undefined,
            audioUrl: url,
            audioSize: audioBytes.length,
          });
          setHistory(newHistory);
        }

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        setStatus('success');
        setStatusMessage(`批量合成完成，共 ${texts.length} 条，耗时 ${elapsed}s`);
        toast.success(`批量合成完成，共 ${texts.length} 条`);
      } catch (error) {
        console.error('批量合成失败:', error);
        const errorMsg = error instanceof Error ? error.message : '未知错误';
        setStatus('error');
        setStatusMessage(`批量合成失败: ${errorMsg}`);
        toast.error(`批量合成失败: ${errorMsg}`);
      } finally {
        setIsGenerating(false);
      }
    },
    [apiKey, apiEndpoint, model, voice, format, toast]
  );

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
      <KeyboardShortcuts />
      <OnboardingGuide />
      <div
        className="main-container"
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
          <p className="text-sm mb-4" style={{ color: 'var(--foreground-secondary)' }}>
            基于小米 MiMo-V2.5-TTS 系列模型的语音合成工具
          </p>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all no-underline"
            style={{
              background: 'var(--accent-glow)',
              color: 'var(--accent)',
              border: '1px solid var(--accent)',
            }}
          >
            了解更多 →
          </Link>
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

        {/* Batch Synthesis */}
        <BatchSynthesis
          model={model}
          voice={voice}
          format={format}
          isGenerating={isGenerating}
          onSynthesize={handleBatchSynthesize}
        />

        {/* Text Preprocessor */}
        <TextPreprocessor text={assistantContent} onTextChange={setAssistantContent} />

        {/* Settings Manager */}
        <SettingsManager />

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
        <StatusBar status={status} message={statusMessage} onCancel={handleCancel} />

        {/* Audio Player */}
        <AudioPlayer audioUrl={audioUrl} audioSize={audioSize} />

        {/* History */}
        <HistoryList history={history} onPlay={handlePlayHistory} onDelete={handleDeleteHistory} />
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-xs" style={{ color: 'var(--foreground-secondary)' }}>
        <a
          href="https://github.com/Silence-dream/MiMo-TTS-Studio"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline transition-colors"
          style={{ color: 'var(--accent)' }}
        >
          MiMo TTS Studio
        </a>{' '}
        © {new Date().getFullYear()} All Rights Reserved.
      </footer>
    </div>
  );
}
