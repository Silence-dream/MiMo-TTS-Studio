import type { DesktopSynthesizeRequest, DesktopSynthesizeResult } from '../src/types/electron';

const DEFAULT_API_ENDPOINT = 'https://api.xiaomimimo.com/v1/chat/completions';

const activeControllers = new Map<string, AbortController>();

function base64ToUint8Array(base64: string): Uint8Array {
  return Uint8Array.from(Buffer.from(base64, 'base64'));
}

function pcm16ToWav(pcmData: Uint8Array, sampleRate: number = 24000): Uint8Array {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmData.length;
  const headerSize = 44;
  const buffer = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  new Uint8Array(buffer, headerSize).set(pcmData);
  return new Uint8Array(buffer);
}

function writeString(view: DataView, offset: number, value: string): void {
  for (let i = 0; i < value.length; i++) {
    view.setUint8(offset + i, value.charCodeAt(i));
  }
}

function parseApiError(errorText: string, status: number): string {
  let errorMessage = `HTTP ${status}`;
  try {
    const errorJson = JSON.parse(errorText);
    errorMessage = errorJson.error?.message || errorJson.message || errorMessage;
  } catch {
    // 忽略解析错误
  }
  return errorMessage;
}

async function readNonStreamingAudio(response: Response): Promise<Uint8Array> {
  const data = await response.json();
  const audioData = data.choices?.[0]?.message?.audio?.data;

  if (!audioData) {
    throw new Error('返回数据中未找到音频内容');
  }

  return base64ToUint8Array(audioData);
}

async function readStreamingAudio(response: Response): Promise<Uint8Array> {
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
        const chunk = JSON.parse(jsonStr);
        const audio = chunk.choices?.[0]?.delta?.audio;
        if (audio?.data) {
          pcmChunks.push(base64ToUint8Array(audio.data));
        }
      } catch {
        // 忽略解析错误
      }
    }
  }

  if (pcmChunks.length === 0) {
    throw new Error('未接收到音频数据');
  }

  const totalLength = pcmChunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of pcmChunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }

  return pcm16ToWav(merged, 24000);
}

export async function synthesizeViaProxy(
  request: DesktopSynthesizeRequest
): Promise<DesktopSynthesizeResult> {
  if (!request.apiKey) {
    throw new Error('缺少 API Key');
  }

  const controller = new AbortController();
  activeControllers.set(request.requestId, controller);

  try {
    const targetUrl = request.apiEndpoint || DEFAULT_API_ENDPOINT;
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': request.apiKey,
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        audio: {
          format: request.format,
          ...(request.voice && { voice: request.voice }),
        },
        ...(request.stream && { stream: true }),
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(parseApiError(await response.text(), response.status));
    }

    const audioBytes = request.stream
      ? await readStreamingAudio(response)
      : await readNonStreamingAudio(response);

    return { audioBytes };
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error('AbortError');
    }
    throw error;
  } finally {
    activeControllers.delete(request.requestId);
  }
}

export function cancelSynthesis(requestId: string): void {
  activeControllers.get(requestId)?.abort();
}
