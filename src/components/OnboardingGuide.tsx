'use client';

import { useState, useEffect } from 'react';

interface Step {
  title: string;
  content: string;
  icon: string;
}

const steps: Step[] = [
  {
    title: '欢迎使用 MiMo TTS Studio',
    content: '这是一个基于小米 MiMo-V2.5-TTS 模型的在线语音合成工具，让我们一起开始吧！',
    icon: '👋',
  },
  {
    title: '配置 API',
    content: '首先，你需要在小米开放平台获取 API Key，并在上方的"API 配置"中填入。',
    icon: '🔑',
  },
  {
    title: '选择模型和音色',
    content: '选择适合你需求的模型（内置音色/声音设计/声音克隆），然后选择喜欢的音色。',
    icon: '🎤',
  },
  {
    title: '输入文本',
    content: '在文本框中输入想要合成的文字，可以使用风格标签来控制语音的情感和风格。',
    icon: '📝',
  },
  {
    title: '开始合成',
    content: '点击"合成语音"按钮或按 Ctrl+Enter 开始合成，合成完成后可以播放和下载。',
    icon: '🎵',
  },
];

export default function OnboardingGuide() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // 检查是否是首次访问
    const hasSeenGuide = localStorage.getItem('has_seen_guide');
    if (!hasSeenGuide) {
      // 延迟显示，让页面先加载完成
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('has_seen_guide', 'true');
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  if (!isVisible) return null;

  const step = steps[currentStep];

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-modal">
        {/* 进度指示器 */}
        <div className="flex justify-center gap-2 mb-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className="w-2 h-2 rounded-full transition-all"
              style={{
                background: index === currentStep ? 'var(--accent)' : 'var(--border)',
                transform: index === currentStep ? 'scale(1.2)' : 'scale(1)',
              }}
            />
          ))}
        </div>

        {/* 内容 */}
        <div className="text-center mb-8">
          <span className="text-5xl mb-4 block">{step.icon}</span>
          <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
            {step.title}
          </h2>
          <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
            {step.content}
          </p>
        </div>

        {/* 按钮 */}
        <div className="flex gap-3">
          {currentStep > 0 && (
            <button className="btn btn-secondary flex-1" onClick={handlePrev}>
              上一步
            </button>
          )}

          <button className="btn btn-primary flex-1" onClick={handleNext}>
            {currentStep === steps.length - 1 ? '开始使用' : '下一步'}
          </button>
        </div>

        {/* 跳过按钮 */}
        {currentStep < steps.length - 1 && (
          <button
            className="w-full mt-3 text-sm cursor-pointer bg-transparent border-none"
            style={{ color: 'var(--muted)' }}
            onClick={handleSkip}
          >
            跳过引导
          </button>
        )}
      </div>
    </div>
  );
}
