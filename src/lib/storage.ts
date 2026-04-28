import { SynthesisHistory } from '@/types/tts';

const API_KEY_STORAGE_KEY = 'mimo_api_key';
const API_ENDPOINT_STORAGE_KEY = 'mimo_api_endpoint';
const HISTORY_STORAGE_KEY = 'mimo_tts_history';
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
