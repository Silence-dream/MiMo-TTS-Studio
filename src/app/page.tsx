'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { TTSModel } from '@/types/tts';
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
import { useSynthesis } from '@/hooks/useSynthesis';

export default function Home() {
  const [apiKey, setApiKey] = useState('');
  const [apiEndpoint, setApiEndpoint] = useState('');

  const {
    model,
    voice,
    format,
    voiceDesignPrompt,
    cloneFile,
    cloneStylePrompt,
    userMessage,
    assistantContent,
    status,
    statusMessage,
    audioUrl,
    audioSize,
    history,
    isGenerating,
    setVoice,
    setFormat,
    setVoiceDesignPrompt,
    setCloneFile,
    setCloneStylePrompt,
    setUserMessage,
    setAssistantContent,
    handleModelChange,
    handleInsertTag,
    handleSynthesize,
    handleCancel,
    handleClear,
    handlePlayHistory,
    handleDeleteHistory,
    handleBatchSynthesize,
  } = useSynthesis();

  const onSynthesize = useCallback(() => {
    handleSynthesize(apiKey, apiEndpoint);
  }, [handleSynthesize, apiKey, apiEndpoint]);

  const onBatchSynthesize = useCallback(
    (texts: string[]) => {
      handleBatchSynthesize(texts, apiKey, apiEndpoint);
    },
    [handleBatchSynthesize, apiKey, apiEndpoint]
  );

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isGenerating) {
          onSynthesize();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGenerating, onSynthesize]);

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
          onSynthesize={onBatchSynthesize}
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
          onSynthesize={onSynthesize}
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
