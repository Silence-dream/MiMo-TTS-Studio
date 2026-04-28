'use client';

import { useMemo, useRef } from 'react';
import { TTSModel } from '@/types/tts';

// 示例文本列表
const EXAMPLE_LINES = [
  { label: '怅然', text: '(怅然)这么多年过去了，再走过那条街，心里一下子空了一块。' },
  { label: '慵懒', text: '(慵懒)再让我睡五分钟……就五分钟，真的，最后一次。' },
  {
    label: '磁性',
    text: '(磁性)夜已经深了，城市还在呼吸。我是今晚陪你的人，欢迎收听《午夜电台》。',
  },
  {
    label: '东北话',
    text: '(东北话)哎呀妈呀，这天儿也忒冷了吧！你说这风，嗖嗖的，跟刀子似的，割脸啊！',
  },
  { label: '粤语', text: '(粤语)呢个真係好正啊！食过一次就唔会忘记！' },
  {
    label: '唱歌',
    text: '(唱歌)原谅我这一生不羁放纵爱自由，也会怕有一天会跌倒，Oh no。背弃了理想，谁人都可以，哪会怕有一天只你共我。',
  },
];

interface TextInputProps {
  model: TTSModel;
  userMessage: string;
  assistantContent: string;
  isGenerating: boolean;
  onUserMessageChange: (message: string) => void;
  onAssistantContentChange: (content: string) => void;
  onSynthesize: () => void;
  onClear: () => void;
}

// 预估每分钟阅读字数（中文约 200 字/分钟）
const CHARS_PER_MINUTE = 200;

export default function TextInput({
  model,
  userMessage,
  assistantContent,
  isGenerating,
  onUserMessageChange,
  onAssistantContentChange,
  onSynthesize,
  onClear,
}: TextInputProps) {
  const isVoiceDesign = model === 'mimo-v2.5-tts-voicedesign';
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理示例选择
  const handleExampleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = e.target.value;
    if (index === '') return;
    onAssistantContentChange(EXAMPLE_LINES[Number(index)].text);
    e.target.value = '';
  };

  // 处理 txt 文件上传
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      onAssistantContentChange(text);
    };
    reader.readAsText(file);
    // 重置 input 以支持重复上传同一文件
    e.target.value = '';
  };

  // 计算字数和预估时长
  const stats = useMemo(() => {
    // 计算中文字符数（忽略空格和标点）
    const chineseChars = assistantContent.match(/[一-龥]/g)?.length || 0;
    // 计算英文单词数
    const englishWords = assistantContent.match(/[a-zA-Z]+/g)?.length || 0;
    // 总字符数（包含所有字符）
    const totalChars = assistantContent.length;

    // 预估时长（秒）
    const estimatedSeconds = Math.ceil((chineseChars + englishWords) / (CHARS_PER_MINUTE / 60));

    return {
      chineseChars,
      englishWords,
      totalChars,
      estimatedSeconds,
      estimatedFormatted:
        estimatedSeconds < 60
          ? `${estimatedSeconds}秒`
          : `${Math.floor(estimatedSeconds / 60)}分${estimatedSeconds % 60}秒`,
    };
  }, [assistantContent]);

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-5">
        <span
          className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
          style={{ background: 'var(--accent-glow)', boxShadow: 'var(--glow-purple-sm)' }}
        >
          📝
        </span>
        <h2 className="text-base font-semibold">合成文本</h2>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        <label className="text-sm" style={{ color: 'var(--muted)' }}>
          {isVoiceDesign ? '声音描述 (必填)' : '风格指令 (可选 — 自然语言描述说话风格)'}
        </label>
        <input
          type="text"
          value={userMessage}
          onChange={(e) => onUserMessageChange(e.target.value)}
          placeholder="例如：用欢快的语气，语速稍快，句尾语调上扬"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm" style={{ color: 'var(--muted)' }}>
            要合成的文本
          </label>
          <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--muted)' }}>
            <span title="中文字符数">中文: {stats.chineseChars} 字</span>
            <span title="英文单词数">英文: {stats.englishWords} 词</span>
            <span title="总字符数">总计: {stats.totalChars} 字符</span>
            <span
              className="px-2 py-1 rounded"
              style={{
                background: 'var(--accent-glow)',
                color: 'var(--accent)',
              }}
              title="预估合成时长"
            >
              ≈ {stats.estimatedFormatted}
            </span>
          </div>
        </div>
        <textarea
          value={assistantContent}
          onChange={(e) => onAssistantContentChange(e.target.value)}
          placeholder="输入需要转换为语音的文本内容..."
          rows={5}
        />
        <div className="flex gap-2 mt-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            type="button"
            className="btn btn-secondary text-xs !py-1.5 !px-3"
            onClick={() => fileInputRef.current?.click()}
          >
            📄 上传 TXT
          </button>
          <select
            className="btn btn-secondary text-xs !py-1.5 !px-3 cursor-pointer"
            value=""
            onChange={handleExampleChange}
            style={{ appearance: 'auto' }}
          >
            <option value="" disabled>
              💡 填入示例
            </option>
            {EXAMPLE_LINES.map((item, i) => (
              <option key={item.label} value={i}>
                {item.label} — {item.text.replace(/^\([^)]+\)/, '')}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 mt-5">
        <button className="btn btn-primary" onClick={onSynthesize} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <span className="spinner" />
              合成中...
            </>
          ) : (
            '合成语音'
          )}
        </button>
        <button className="btn btn-secondary" onClick={onClear}>
          清空内容
        </button>
      </div>
    </div>
  );
}
