'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
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
import { useToast } from '@/components/Toast';

export function useSynthesis() {
  const toast = useToast();

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

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  useEffect(() => {
    return () => {
      if (audioUrlRef.current) revokeAudioUrl(audioUrlRef.current);
    };
  }, []);

  const handleModelChange = useCallback((newModel: TTSModel) => {
    setModel(newModel);
    setVoiceDesignPrompt('');
    setCloneFile(null);
    setCloneStylePrompt('');
  }, []);

  const handleInsertTag = useCallback((tag: string, isStyleTag: boolean) => {
    if (isStyleTag) {
      setAssistantContent((prev) => {
        const styleMatch = prev.match(/^\([^)]+\)/);
        if (styleMatch) {
          return tag + prev.substring(styleMatch[0].length);
        }
        return tag + prev;
      });
    } else {
      setAssistantContent((prev) => prev + tag);
    }
  }, []);

  const handleSynthesize = useCallback(
    async (apiKey: string, apiEndpoint: string) => {
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

        const params: Parameters<typeof synthesizeNonStreaming>[0] = {
          apiKey,
          apiEndpoint: apiEndpoint || undefined,
          model,
          messages,
          format,
          signal: controller.signal,
        };

        if (model === 'mimo-v2.5-tts') {
          params.voice = voice;
        } else if (model === 'mimo-v2.5-tts-voiceclone' && cloneFile) {
          const base64 = await fileToBase64(cloneFile);
          const mimeType = getFileMimeType(cloneFile);
          params.voice = `data:${mimeType};base64,${base64}`;
        }

        let audioBytes: Uint8Array;
        if (format === 'pcm16') {
          setStatusMessage('正在合成语音 (流式)...');
          audioBytes = await synthesizeStreaming(params);
        } else {
          setStatusMessage('正在合成语音 (非流式)...');
          audioBytes = await synthesizeNonStreaming(params);
        }

        const url = createAudioUrl(audioBytes);
        if (audioUrlRef.current) revokeAudioUrl(audioUrlRef.current);
        audioUrlRef.current = url;
        setAudioUrl(url);
        setAudioSize(audioBytes.length);

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
    },
    [
      model,
      voice,
      toast,
      format,
      voiceDesignPrompt,
      cloneFile,
      cloneStylePrompt,
      userMessage,
      assistantContent,
    ]
  );

  const handleCancel = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

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

  const handlePlayHistory = useCallback((item: SynthesisHistory) => {
    setAudioUrl(item.audioUrl);
    setAudioSize(item.audioSize);
  }, []);

  const handleDeleteHistory = useCallback(
    (id: string) => {
      const newHistory = deleteHistory(id);
      setHistory(newHistory);
      toast.success('已删除历史记录');
    },
    [toast]
  );

  const handleBatchSynthesize = useCallback(
    async (texts: string[], apiKey: string, apiEndpoint: string) => {
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
        let completedCount = 0;
        const CONCURRENCY = 3;

        const synthesizeOne = async (text: string, index: number) => {
          const messages = [{ role: 'assistant' as const, content: text }];
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
          results[index] = { text, audioUrl: url, audioSize: audioBytes.length };

          completedCount++;
          setStatusMessage(`批量合成中 (${completedCount}/${texts.length})...`);

          const newHistory = addHistory({
            text: text.substring(0, 100),
            model,
            voice: model === 'mimo-v2.5-tts' ? voice : undefined,
            audioUrl: url,
            audioSize: audioBytes.length,
          });
          setHistory(newHistory);
        };

        const queue = texts.map((text, i) => () => synthesizeOne(text, i));
        const executing = new Set<Promise<void>>();

        for (const task of queue) {
          const p = task().then(() => {
            executing.delete(p);
          });
          executing.add(p);
          if (executing.size >= CONCURRENCY) {
            await Promise.race(executing);
          }
        }
        await Promise.all(executing);

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
    [model, voice, format, toast]
  );

  return {
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
  };
}
