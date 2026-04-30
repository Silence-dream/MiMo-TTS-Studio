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
import { getHistory, addHistory, deleteHistory, deleteHistories } from '@/lib/storage';
import { getAudio } from '@/lib/audioDb';
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

        const newHistory = await addHistory(
          {
            text: assistantContent.substring(0, 100),
            model,
            voice: model === 'mimo-v2.5-tts' ? voice : undefined,
            audioUrl: url,
            audioSize: audioBytes.length,
          },
          audioBytes
        );
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

  const handlePlayHistory = useCallback(
    async (item: SynthesisHistory) => {
      let playUrl = item.audioUrl;

      // 从 IndexedDB 加载音频数据并创建 blob URL
      if (item.audioUrl.startsWith('db://')) {
        const id = item.audioUrl.slice(5);
        const audioBytes = await getAudio(id);
        if (!audioBytes) {
          toast.error('音频数据不存在，可能已被清除');
          return;
        }
        playUrl = createAudioUrl(audioBytes);
      }

      if (audioUrlRef.current) revokeAudioUrl(audioUrlRef.current);
      audioUrlRef.current = playUrl;
      setAudioUrl(playUrl);
      setAudioSize(item.audioSize);
    },
    [toast]
  );

  const handleDeleteHistory = useCallback(
    async (id: string) => {
      const newHistory = await deleteHistory(id);
      setHistory(newHistory);
      toast.success('已删除历史记录');
    },
    [toast]
  );

  const handleDeleteHistories = useCallback(
    async (ids: string[]) => {
      const newHistory = await deleteHistories(ids);
      setHistory(newHistory);
      toast.success(`已删除 ${ids.length} 条历史记录`);
    },
    [toast]
  );

  const handleBatchSynthesize = useCallback(
    async (texts: string[], apiKey: string, apiEndpoint: string) => {
      if (!apiKey) {
        toast.error('请先输入 API Key');
        return;
      }

      // 启动时快照当前配置，避免批量过程中用户切换导致不一致
      const snapshotModel = model;
      const snapshotVoice = voice;
      const snapshotFormat = format;

      // 复用全局 abortControllerRef，让 handleCancel 同时支持取消单次/批量
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsGenerating(true);
      setStatus('loading');
      setStatusMessage(`批量合成中 (0/${texts.length})...`);
      const startTime = Date.now();

      // 提到 try 外层以便 catch 块可读取已完成数
      let completedCount = 0;

      try {
        const CONCURRENCY = 3;

        const synthesizeOne = async (text: string) => {
          // 已取消则跳过尚未启动的任务
          if (controller.signal.aborted) {
            throw new DOMException('Aborted', 'AbortError');
          }

          const messages = [{ role: 'assistant' as const, content: text }];
          const params = {
            apiKey,
            apiEndpoint: apiEndpoint || undefined,
            model: snapshotModel,
            messages,
            format: snapshotFormat,
            voice: snapshotModel === 'mimo-v2.5-tts' ? snapshotVoice : undefined,
            signal: controller.signal,
          };

          let audioBytes: Uint8Array;
          // 走哪条 API 也必须读快照，避免与 params.format 不一致
          if (snapshotFormat === 'pcm16') {
            audioBytes = await synthesizeStreaming(params);
          } else {
            audioBytes = await synthesizeNonStreaming(params);
          }

          const url = createAudioUrl(audioBytes);

          completedCount++;
          setStatusMessage(`批量合成中 (${completedCount}/${texts.length})...`);

          // 仅写入存储，不在循环内 setHistory，避免逐条触发 React 重渲染
          await addHistory(
            {
              text: text.substring(0, 100),
              model: snapshotModel,
              voice: snapshotModel === 'mimo-v2.5-tts' ? snapshotVoice : undefined,
              audioUrl: url,
              audioSize: audioBytes.length,
            },
            audioBytes
          );
        };

        const queue = texts.map((text) => () => synthesizeOne(text));
        const executing = new Set<Promise<void>>();

        for (const task of queue) {
          if (controller.signal.aborted) break;
          const p = task().then(() => {
            executing.delete(p);
          });
          executing.add(p);
          if (executing.size >= CONCURRENCY) {
            await Promise.race(executing);
          }
        }
        await Promise.all(executing);

        // 全部任务完成后统一刷新一次 UI
        setHistory(getHistory());

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        setStatus('success');
        setStatusMessage(`批量合成完成，共 ${texts.length} 条，耗时 ${elapsed}s`);
        toast.success(`批量合成完成，共 ${texts.length} 条`);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          // 已完成的条目可能已落库，需要刷新一次 UI
          setHistory(getHistory());
          setStatus('idle');
          setStatusMessage(`批量合成已取消（已完成 ${completedCount}/${texts.length}）`);
          toast.warning('批量合成已取消');
        } else {
          console.error('批量合成失败:', error);
          const errorMsg = error instanceof Error ? error.message : '未知错误';
          setStatus('error');
          setStatusMessage(`批量合成失败: ${errorMsg}`);
          toast.error(`批量合成失败: ${errorMsg}`);
        }
      } finally {
        abortControllerRef.current = null;
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
    handleDeleteHistories,
    handleBatchSynthesize,
  };
}
