import { SynthesisHistory } from '@/types/tts';

const API_KEY_STORAGE_KEY = 'mimo_api_key';
const API_ENDPOINT_STORAGE_KEY = 'mimo_api_endpoint';
const HISTORY_STORAGE_KEY = 'mimo_tts_history';
const FAVORITE_VOICES_KEY = 'mimo_favorite_voices';
const VOICE_USAGE_KEY = 'mimo_voice_usage';
const MAX_HISTORY_ITEMS = 20;

/**
 * 获取存储的 API Key
 */
export function getApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(API_KEY_STORAGE_KEY) || '';
}

/**
 * 保存 API Key
 */
export function setApiKey(apiKey: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
}

/**
 * 获取存储的 API Endpoint
 */
export function getApiEndpoint(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(API_ENDPOINT_STORAGE_KEY) || '';
}

/**
 * 保存 API Endpoint
 */
export function setApiEndpoint(endpoint: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(API_ENDPOINT_STORAGE_KEY, endpoint);
}

/**
 * 获取合成历史
 */
export function getHistory(): SynthesisHistory[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(HISTORY_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * 添加合成历史
 */
export function addHistory(item: Omit<SynthesisHistory, 'id' | 'createdAt'>): SynthesisHistory[] {
  const history = getHistory();
  const newItem: SynthesisHistory = {
    ...item,
    id: generateId(),
    createdAt: Date.now(),
  };

  history.unshift(newItem);

  // 限制历史记录数量
  if (history.length > MAX_HISTORY_ITEMS) {
    history.splice(MAX_HISTORY_ITEMS);
  }

  saveHistory(history);
  return history;
}

/**
 * 清空合成历史
 */
export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(HISTORY_STORAGE_KEY);
}

/**
 * 删除单条历史记录
 */
export function deleteHistory(id: string): SynthesisHistory[] {
  const history = getHistory();
  const filtered = history.filter((item) => item.id !== id);
  saveHistory(filtered);
  return filtered;
}

/**
 * 保存历史到 localStorage
 */
function saveHistory(history: SynthesisHistory[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
}

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ===== 音色收藏功能 =====

interface VoiceUsage {
  voiceId: string;
  count: number;
  lastUsed: number;
}

/**
 * 获取收藏的音色列表
 */
export function getFavoriteVoices(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(FAVORITE_VOICES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * 添加音色到收藏
 */
export function addFavoriteVoice(voiceId: string): string[] {
  const favorites = getFavoriteVoices();
  if (!favorites.includes(voiceId)) {
    favorites.push(voiceId);
    localStorage.setItem(FAVORITE_VOICES_KEY, JSON.stringify(favorites));
  }
  return favorites;
}

/**
 * 从收藏中移除音色
 */
export function removeFavoriteVoice(voiceId: string): string[] {
  const favorites = getFavoriteVoices().filter((id) => id !== voiceId);
  localStorage.setItem(FAVORITE_VOICES_KEY, JSON.stringify(favorites));
  return favorites;
}

/**
 * 切换音色收藏状态
 */
export function toggleFavoriteVoice(voiceId: string): { favorites: string[]; isFavorite: boolean } {
  const favorites = getFavoriteVoices();
  const isFavorite = favorites.includes(voiceId);

  if (isFavorite) {
    return { favorites: removeFavoriteVoice(voiceId), isFavorite: false };
  } else {
    return { favorites: addFavoriteVoice(voiceId), isFavorite: true };
  }
}

/**
 * 记录音色使用
 */
export function recordVoiceUsage(voiceId: string): void {
  if (typeof window === 'undefined') return;

  const usage = getVoiceUsage();
  const existing = usage.find((u) => u.voiceId === voiceId);

  if (existing) {
    existing.count++;
    existing.lastUsed = Date.now();
  } else {
    usage.push({ voiceId, count: 1, lastUsed: Date.now() });
  }

  localStorage.setItem(VOICE_USAGE_KEY, JSON.stringify(usage));
}

/**
 * 获取音色使用统计
 */
export function getVoiceUsage(): VoiceUsage[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(VOICE_USAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * 获取最常用的音色
 */
export function getMostUsedVoices(limit: number = 5): string[] {
  const usage = getVoiceUsage();
  return usage
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map((u) => u.voiceId);
}
