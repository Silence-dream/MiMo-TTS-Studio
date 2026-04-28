'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { formatFileSize } from '@/lib/audio';

interface AudioPlayerProps {
  audioUrl: string | null;
  audioSize: number;
}

export default function AudioPlayer({ audioUrl, audioSize }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [audioUrl]);

  // 初始化音频分析器
  const initAudioAnalyser = useCallback(() => {
    if (!audioRef.current || analyserRef.current) return;

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;

    const source = audioContext.createMediaElementSource(audioRef.current);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    analyserRef.current = analyser;
  }, []);

  // 绘制波形
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;

    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // 背景渐变
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
      gradient.addColorStop(1, 'rgba(139, 92, 246, 0.05)');

      const barWidth = (width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height;

        // 使用渐变色
        const barGradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
        barGradient.addColorStop(0, '#8b5cf6');
        barGradient.addColorStop(1, 'rgba(139, 92, 246, 0.3)');

        ctx.fillStyle = barGradient;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);

        // 添加高光效果
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(x, height - barHeight, barWidth, 2);

        x += barWidth + 1;
      }
    };

    draw();
  }, []);

  // 处理播放/暂停
  const handlePlayPause = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    } else {
      initAudioAnalyser();
      audioRef.current.play();
      drawWaveform();
    }

    setIsPlaying(!isPlaying);
  }, [isPlaying, initAudioAnalyser, drawWaveform]);

  // 清理动画
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // 音频结束事件
  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

  if (!audioUrl) return null;

  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: 'var(--card)',
        backdropFilter: 'blur(16px) saturate(170%)',
        WebkitBackdropFilter: 'blur(16px) saturate(170%)',
        border: '1px solid var(--card-border)',
        boxShadow: 'var(--shadow-card)',
        marginTop: '10px',
        marginBottom: '10px',
      }}
    >
      {/* 波形显示 */}
      <div
        className="relative mb-4 rounded-lg overflow-hidden"
        style={{ background: 'rgba(0, 0, 0, 0.2)' }}
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={120}
          className="w-full"
          style={{ height: '120px' }}
        />
        {!isPlaying && (
          <div
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            onClick={handlePlayPause}
          >
            <span
              className="w-12 h-12 rounded-full flex items-center justify-center text-lg"
              style={{
                background: 'var(--accent-glow)',
                color: 'var(--accent)',
                border: '2px solid var(--accent)',
              }}
            >
              ▶
            </span>
          </div>
        )}
      </div>

      {/* 音频控制 */}
      <audio
        ref={audioRef}
        controls
        className="w-full h-12 rounded-lg outline-none"
        onPlay={() => {
          setIsPlaying(true);
          initAudioAnalyser();
          drawWaveform();
        }}
        onPause={() => {
          setIsPlaying(false);
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
          }
        }}
        onEnded={handleEnded}
      />

      {/* 信息栏 */}
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
