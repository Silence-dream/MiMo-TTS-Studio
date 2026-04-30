'use client';

import { useState, useMemo, useCallback } from 'react';
import { Button, Checkbox, Input, Tag, Space, Empty, Spin } from 'antd';
import {
  DownloadOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import JSZip from 'jszip';
import { SynthesisHistory } from '@/types/tts';
import { getAudio } from '@/lib/audioDb';

interface HistoryListProps {
  history: SynthesisHistory[];
  onPlay: (item: SynthesisHistory) => void;
  onDelete: (id: string) => void;
  onDeleteBatch: (ids: string[]) => void;
}

export default function HistoryList({
  history,
  onPlay,
  onDelete,
  onDeleteBatch,
}: HistoryListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);

  // 按日期分组
  const groupedHistory = useMemo(() => {
    const groups: Record<string, SynthesisHistory[]> = {};

    history.forEach((item) => {
      const date = new Date(item.createdAt).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });

      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item);
    });

    return groups;
  }, [history]);

  // 获取所有日期（按倒序排序，缓存以避免每次渲染重排）
  const dates = useMemo(
    () => Object.keys(groupedHistory).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()),
    [groupedHistory]
  );

  // 过滤历史记录（复用 groupedHistory 做日期过滤）
  const filteredHistory = useMemo(() => {
    // 先按日期筛选
    let filtered = selectedDate ? groupedHistory[selectedDate] || [] : history;

    // 再按搜索关键词筛选
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.text.toLowerCase().includes(query) || item.model.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [history, groupedHistory, searchQuery, selectedDate]);

  // 切换选择状态
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  // 全选/取消全选
  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === filteredHistory.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredHistory.map((item) => item.id)));
    }
  }, [filteredHistory, selectedIds]);

  // 获取选中的历史记录
  const selectedItems = useMemo(() => {
    return history.filter((item) => selectedIds.has(item.id));
  }, [history, selectedIds]);

  // 解析音频 URL（db:// 从 IndexedDB 加载，否则直接 fetch）
  const resolveAudioBlob = async (item: SynthesisHistory): Promise<Blob | null> => {
    if (item.audioUrl.startsWith('db://')) {
      const id = item.audioUrl.slice(5);
      const data = await getAudio(id);
      if (!data) return null;
      return new Blob([data as unknown as BlobPart], { type: 'audio/wav' });
    }
    const response = await fetch(item.audioUrl);
    return response.blob();
  };

  // 下载单个音频
  const downloadAudio = async (item: SynthesisHistory) => {
    try {
      const blob = await resolveAudioBlob(item);
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tts_${item.id}.wav`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下载失败:', error);
    }
  };

  // 批量下载为 ZIP
  const handleBatchDownload = async () => {
    if (selectedItems.length === 0) return;

    setIsDownloading(true);

    try {
      const zip = new JSZip();
      const folder = zip.folder('tts_audio');

      // 下载所有选中的音频
      const downloadPromises = selectedItems.map(async (item, index) => {
        try {
          const blob = await resolveAudioBlob(item);
          if (!blob) return;
          const fileName = `${index + 1}_${item.text.substring(0, 20).replace(/[<>:"/\\|?*]/g, '_')}.wav`;
          folder?.file(fileName, blob);
        } catch (error) {
          console.error(`下载音频失败: ${item.id}`, error);
        }
      });

      await Promise.all(downloadPromises);

      // 生成 ZIP 文件
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      // 下载 ZIP
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tts_audio_${new Date().toISOString().split('T')[0]}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('批量下载失败:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  // 导出为 JSON
  const handleExportJSON = () => {
    const data = JSON.stringify(history, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tts_history_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 导出为 CSV
  const handleExportCSV = () => {
    const headers = ['ID', '文本', '模型', '音色', '大小', '时间'];
    const rows = history.map((item) => [
      item.id,
      `"${item.text.replace(/"/g, '""')}"`,
      item.model,
      item.voice || '',
      item.audioSize,
      new Date(item.createdAt).toISOString(),
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tts_history_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 删除选中项
  const handleDeleteSelected = () => {
    onDeleteBatch(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  if (history.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center gap-3 mb-5">
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
            style={{ background: 'var(--accent-glow)', boxShadow: 'var(--glow-purple-sm)' }}
          >
            📋
          </span>
          <h2 className="text-base font-semibold">合成历史</h2>
        </div>
        <Empty description="暂无合成记录" />
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
            style={{ background: 'var(--accent-glow)' }}
          >
            📋
          </span>
          <h2 className="text-base font-semibold">合成历史</h2>
          <span className="text-xs" style={{ color: 'var(--muted)' }}>
            ({history.length} 条)
          </span>
        </div>

        {/* 操作按钮 */}
        <Space size="small">
          <Button size="small" onClick={handleExportJSON}>
            导出 JSON
          </Button>
          <Button size="small" onClick={handleExportCSV}>
            导出 CSV
          </Button>
        </Space>
      </div>

      {/* 搜索框 */}
      <div className="mb-4">
        <Input
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索历史记录..."
          allowClear
        />
      </div>

      {/* 日期筛选 */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Tag
          className="cursor-pointer"
          color={!selectedDate ? 'processing' : undefined}
          onClick={() => setSelectedDate(null)}
        >
          全部
        </Tag>
        {dates.map((date) => (
          <Tag
            key={date}
            className="cursor-pointer"
            color={selectedDate === date ? 'processing' : undefined}
            onClick={() => setSelectedDate(selectedDate === date ? null : date)}
          >
            {date}
          </Tag>
        ))}
      </div>

      {/* 批量操作栏 */}
      <div
        className="flex items-center justify-between p-3 mb-4 rounded-lg"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <Checkbox
            checked={selectedIds.size === filteredHistory.length && filteredHistory.length > 0}
            indeterminate={selectedIds.size > 0 && selectedIds.size < filteredHistory.length}
            onChange={toggleSelectAll}
          >
            <span className="text-sm" style={{ color: 'var(--muted)' }}>
              全选
            </span>
          </Checkbox>
          {selectedIds.size > 0 && (
            <span className="text-xs" style={{ color: 'var(--accent)' }}>
              已选 {selectedIds.size} 项
            </span>
          )}
        </div>

        <Space size="small">
          {selectedIds.size > 0 && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<DownloadOutlined />}
                onClick={handleBatchDownload}
                loading={isDownloading}
              >
                批量下载 ZIP
              </Button>
              <Button danger size="small" icon={<DeleteOutlined />} onClick={handleDeleteSelected}>
                删除选中
              </Button>
            </>
          )}
        </Space>
      </div>

      {/* 历史记录列表 */}
      <div
        className="max-h-[400px] overflow-y-auto"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--border) transparent' }}
      >
        {filteredHistory.length === 0 ? (
          <Empty description="没有找到匹配的记录" />
        ) : (
          filteredHistory.map((item) => (
            <div
              key={item.id}
              className="history-item flex items-center gap-3 p-3 cursor-pointer transition-colors"
              style={{
                borderBottom: '1px solid var(--border)',
                background: selectedIds.has(item.id) ? 'var(--accent-glow)' : 'transparent',
              }}
              onClick={() => onPlay(item)}
            >
              {/* 选择框 */}
              <Checkbox
                checked={selectedIds.has(item.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleSelect(item.id);
                }}
                onClick={(e) => e.stopPropagation()}
              />

              {/* 播放按钮 */}
              <Button
                type="text"
                shape="circle"
                icon={<PlayCircleOutlined />}
                style={{ color: 'var(--accent)' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onPlay(item);
                }}
              />

              {/* 内容 */}
              <div className="flex-1 min-w-0">
                <div className="text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                  {item.text}
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
                  <span>{item.model}</span>
                  {item.voice && (
                    <>
                      <span>·</span>
                      <span>{item.voice}</span>
                    </>
                  )}
                </div>
              </div>

              {/* 时间 */}
              <span className="text-xs flex-shrink-0" style={{ color: 'var(--muted)' }}>
                {new Date(item.createdAt).toLocaleTimeString()}
              </span>

              {/* 操作按钮 */}
              <div className="flex gap-1 flex-shrink-0">
                <Button
                  className="history-action-btn"
                  type="text"
                  size="small"
                  icon={<DownloadOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadAudio(item);
                  }}
                  title="下载"
                />
                <Button
                  className="history-action-btn"
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                  title="删除"
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
