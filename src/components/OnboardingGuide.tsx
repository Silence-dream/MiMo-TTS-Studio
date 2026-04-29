'use client';

import { useState, useEffect } from 'react';
import { Modal, Steps, Button, Space } from 'antd';

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
    const hasSeenGuide = localStorage.getItem('has_seen_guide');
    if (!hasSeenGuide) {
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

  const step = steps[currentStep];

  return (
    <Modal
      open={isVisible}
      footer={null}
      closable={false}
      centered
      width={420}
      styles={{ body: { padding: '24px 0' } }}
    >
      <Steps
        current={currentStep}
        size="small"
        className="mb-6 px-6"
        items={steps.map((s, i) => ({
          title: '',
        }))}
      />

      <div className="text-center mb-8 px-6">
        <span className="text-5xl mb-4 block">{step.icon}</span>
        <h2 className="text-xl font-semibold mb-3">{step.title}</h2>
        <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
          {step.content}
        </p>
      </div>

      <div className="px-6">
        <Space className="w-full" orientation="vertical" size="small">
          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button className="flex-1" onClick={handlePrev}>
                上一步
              </Button>
            )}
            <Button type="primary" className="flex-1" onClick={handleNext}>
              {currentStep === steps.length - 1 ? '开始使用' : '下一步'}
            </Button>
          </div>
          {currentStep < steps.length - 1 && (
            <Button type="text" block onClick={handleClose} style={{ color: 'var(--muted)' }}>
              跳过引导
            </Button>
          )}
        </Space>
      </div>
    </Modal>
  );
}
