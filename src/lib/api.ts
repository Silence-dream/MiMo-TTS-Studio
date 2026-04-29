import { TTSModel, TTSMessage, AudioFormat, TTSResponse, TTSStreamChunk } from '@/types/tts';
import { base64ToUint8Array, pcm16ToWav } from './audio';

const PROXY_ENDPOINT = '/api/tts';

/**
 * TTS 合成请求参数
 */
export interface SynthesizeParams {
  apiKey: string;
  apiEndpoint?: string;
  model: TTSModel;
  messages: TTSMessage[];
  format: AudioFormat;
  voice?: string;
  signal?: AbortSignal;
}

/**
 * 非流式合成
 */
export async function synthesizeNonStreaming(params: SynthesizeParams): Promise<Uint8Array> {
  const { apiKey, apiEndpoint, model, messages, format, voice, signal } = params;

  const body: Record<string, unknown> = {
    apiEndpoint,
    model,
    messages,
    audio: {
      format,
      ...(voice && { voice }),
    },
  };

  const response = await fetch(PROXY_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error?.message || errorJson.message || errorMessage;
    } catch {
      // 忽略解析错误
    }
    throw new Error(errorMessage);
  }

  const data: TTSResponse = await response.json();
  const audioData = data.choices?.[0]?.message?.audio?.data;

  if (!audioData) {
    throw new Error('返回数据中未找到音频内容');
  }

  return base64ToUint8Array(audioData);
}

/**
 * 流式合成
 */
export async function synthesizeStreaming(params: SynthesizeParams): Promise<Uint8Array> {
  const { apiKey, apiEndpoint, model, messages, format, voice, signal } = params;

  const body: Record<string, unknown> = {
    apiEndpoint,
    model,
    messages,
    audio: {
      format,
      ...(voice && { voice }),
    },
    stream: true,
  };

  const response = await fetch(PROXY_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error?.message || errorJson.message || errorMessage;
    } catch {
      // 忽略解析错误
    }
    throw new Error(errorMessage);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('无法读取流式响应');
  }

  const decoder = new TextDecoder();
  let buffer = '';
  const pcmChunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data:')) continue;
      const jsonStr = trimmed.slice(5).trim();
      if (jsonStr === '[DONE]') continue;

      try {
        const chunk: TTSStreamChunk = JSON.parse(jsonStr);
        const audio = chunk.choices?.[0]?.delta?.audio;
        if (audio?.data) {
          const pcmBytes = base64ToUint8Array(audio.data);
          pcmChunks.push(pcmBytes);
        }
      } catch {
        // 忽略解析错误
      }
    }
  }

  if (pcmChunks.length === 0) {
    throw new Error('未接收到音频数据');
  }

  // 合并 PCM16 chunks
  const totalLength = pcmChunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of pcmChunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }

  // 转换为 WAV 格式
  return pcm16ToWav(merged, 24000);
}

/**
 * 读取文件为 base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * 获取文件 MIME 类型
 */
export function getFileMimeType(file: File): string {
  if (file.name.endsWith('.wav')) return 'audio/wav';
  return 'audio/mpeg';
}
