import type { AudioFormat, TTSMessage, TTSModel } from './tts';

export interface DesktopSynthesizeRequest {
  requestId: string;
  apiKey: string;
  apiEndpoint?: string;
  model: TTSModel;
  messages: TTSMessage[];
  format: AudioFormat;
  voice?: string;
  stream?: boolean;
}

export interface DesktopSynthesizeResult {
  audioBytes: Uint8Array;
}

export interface MimoDesktopApi {
  platform: string;
  synthesize: (request: DesktopSynthesizeRequest) => Promise<DesktopSynthesizeResult>;
  cancel: (requestId: string) => Promise<void>;
}

declare global {
  interface Window {
    mimoDesktop?: MimoDesktopApi;
  }
}

export {};
