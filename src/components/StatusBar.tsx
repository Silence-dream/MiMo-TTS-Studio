'use client';

import { Alert, Progress, Button } from 'antd';
import { LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { SynthesisStatus } from '@/types/tts';

interface StatusBarProps {
  status: SynthesisStatus;
  message: string;
  onCancel?: () => void;
}

export default function StatusBar({ status, message, onCancel }: StatusBarProps) {
  if (status === 'idle') return null;

  const statusConfig = {
    loading: {
      type: 'info' as const,
      icon: <LoadingOutlined spin />,
      progressStatus: 'active' as const,
    },
    success: {
      type: 'success' as const,
      icon: <CheckCircleOutlined />,
      progressStatus: 'success' as const,
    },
    error: {
      type: 'error' as const,
      icon: <CloseCircleOutlined />,
      progressStatus: 'exception' as const,
    },
  };

  const config = statusConfig[status];

  return (
    <div className="mb-4">
      <Alert
        title={message}
        type={config.type}
        icon={config.icon}
        showIcon
        action={
          status === 'loading' && onCancel ? (
            <Button size="small" danger onClick={onCancel}>
              取消
            </Button>
          ) : undefined
        }
      />
      {status === 'loading' && (
        <Progress
          percent={100}
          status={config.progressStatus}
          showInfo={false}
          strokeColor="#8b5cf6"
        />
      )}
      {status === 'success' && (
        <Progress percent={100} status={config.progressStatus} showInfo={false} />
      )}
      {status === 'error' && (
        <Progress percent={100} status={config.progressStatus} showInfo={false} />
      )}
    </div>
  );
}
