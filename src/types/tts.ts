// TTS 模型类型
export type TTSModel = 'mimo-v2.5-tts' | 'mimo-v2.5-tts-voicedesign' | 'mimo-v2.5-tts-voiceclone';

// 内置音色类型
export type BuiltInVoice =
  | 'mimo_default'
  | '冰糖'
  | '茉莉'
  | '苏打'
  | '白桦'
  | 'Mia'
  | 'Chloe'
  | 'Milo'
  | 'Dean';

// 音频输出格式
export type AudioFormat = 'wav' | 'pcm16';

// 内置音色配置
export interface VoiceOption {
  id: BuiltInVoice;
  name: string;
  language: '中文' | '英文';
  gender: '女声' | '男声' | '默认';
}

// TTS 请求参数
export interface TTSRequest {
  model: TTSModel;
  messages: TTSMessage[];
  audio: {
    format: AudioFormat;
    voice?: string;
  };
  stream?: boolean;
}

// TTS 消息
export interface TTSMessage {
  role: 'user' | 'assistant';
  content: string;
}

// TTS API 响应
export interface TTSResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      audio: {
        data: string;
      };
    };
    finish_reason: string;
  }>;
}

// 流式响应 chunk
export interface TTSStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      audio?: {
        data: string;
      };
    };
    finish_reason: string | null;
  }>;
}

// 合成状态
export type SynthesisStatus = 'idle' | 'loading' | 'success' | 'error';

// 合成历史记录
export interface SynthesisHistory {
  id: string;
  text: string;
  model: TTSModel;
  voice?: string;
  audioUrl: string;
  audioSize: number;
  createdAt: number;
}

// 风格预设标签
export interface StyleTag {
  label: string;
  tag: string;
  emoji: string;
}
