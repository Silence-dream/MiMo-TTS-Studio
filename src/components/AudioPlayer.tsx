'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { formatFileSize } from '@/lib/audio';
import { glassCardStyle } from '@/lib/styles';

interface AudioPlayerProps {
  audioUrl: string | null;
  audioSize: number;
}

export default function AudioPlayer({ audioUrl, audioSize }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [audioUrl]);

  // 初始化音频分析器（复用已有 AudioContext）
  const initAudioAnalyser = useCallback(() => {
    if (!audioRef.current || analyserRef.current) return;

    const audioContext = audioContextRef.current ?? new AudioContext();
    audioContextRef.current = audioContext;

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
    const width = canvas.width;
    const height = canvas.height;

    // 预计算渐变，避免每帧每条柱都创建新渐变对象
    const barGradient = ctx.createLinearGradient(0, 0, 0, height);
    barGradient.addColorStop(0, '#8b5cf6');
    barGradient.addColorStop(1, 'rgba(139, 92, 246, 0.3)');

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, width, height);

      const barWidth = (width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height;

        ctx.fillStyle = barGradient;
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);

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

  // 清理动画和 AudioContext
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
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
        ...glassCardStyle,
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
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          href={audioUrl}
          download={`tts_${Date.now()}.wav`}
        >
          下载音频
        </Button>
      </div>
    </div>
  );
}
