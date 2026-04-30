import { SynthesisHistory } from '@/types/tts';
import { saveAudio, deleteAudios, clearAllAudio } from './audioDb';

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
 * 添加合成历史（音频数据存入 IndexedDB，localStorage 只存 db:// 引用）
 */
export async function addHistory(
  item: Omit<SynthesisHistory, 'id' | 'createdAt'>,
  audioBytes?: Uint8Array
): Promise<SynthesisHistory[]> {
  const history = getHistory();
  const id = generateId();
  const dbUrl = `db://${id}`;

  // 将音频数据存入 IndexedDB
  if (audioBytes) {
    await saveAudio(id, audioBytes);
  }

  const newItem: SynthesisHistory = {
    ...item,
    id,
    audioUrl: dbUrl,
    createdAt: Date.now(),
  };

  history.unshift(newItem);

  // 限制历史记录数量，删除被移除项的音频数据
  if (history.length > MAX_HISTORY_ITEMS) {
    const removed = history.splice(MAX_HISTORY_ITEMS);
    for (const item of removed) {
      if (item.audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(item.audioUrl);
      }
    }
    await deleteAudios(removed.map((item) => item.id));
  }

  saveHistory(history);
  return history;
}

/**
 * 清空合成历史
 */
export async function clearHistory(): Promise<SynthesisHistory[]> {
  if (typeof window === 'undefined') return [];
  const history = getHistory();
  // 释放所有 Blob URL
  history.forEach((item) => {
    if (item.audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(item.audioUrl);
    }
  });
  // 清空 IndexedDB 中的音频数据
  await clearAllAudio();
  localStorage.removeItem(HISTORY_STORAGE_KEY);
  return [];
}

/**
 * 删除单条历史记录
 */
export async function deleteHistory(id: string): Promise<SynthesisHistory[]> {
  return deleteHistories([id]);
}

/**
 * 批量删除历史记录（一次 IndexedDB 事务 + 一次 localStorage 写入）
 */
export async function deleteHistories(ids: string[]): Promise<SynthesisHistory[]> {
  const history = getHistory();
  const idSet = new Set(ids);

  // 释放 Blob URL
  for (const item of history) {
    if (idSet.has(item.id) && item.audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(item.audioUrl);
    }
  }

  // 从 IndexedDB 批量删除音频数据（单个事务）
  await deleteAudios(ids);

  const filtered = history.filter((item) => !idSet.has(item.id));
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
