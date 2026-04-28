'use client';

import { useRef, useEffect } from 'react';
import { formatFileSize } from '@/lib/audio';

interface AudioPlayerProps {
  audioUrl: string | null;
  audioSize: number;
}

export default function AudioPlayer({ audioUrl, audioSize }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch(() => {});
    }
  }, [audioUrl]);

  if (!audioUrl) return null;

  return (
    <div className="rounded-xl p-5 mt-4" style={{ background: 'var(--card-hover)' }}>
      <audio ref={audioRef} controls className="w-full h-12 rounded-lg outline-none" />
      <div
        className="flex justify-between items-center mt-3 text-sm"
        style={{ color: 'var(--muted)' }}
      >
        <span>大小: {formatFileSize(audioSize)}</span>
        <a
          href={audioUrl}
          download={`tts_${Date.now()}.wav`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all no-underline"
          style={{
            background: 'var(--accent-glow)',
            color: 'var(--accent)',
            border: '1px solid var(--accent)',
          }}
        >
          ⬇ 下载音频
        </a>
      </div>
    </div>
  );
}
