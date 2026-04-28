'use client';

interface AudioControlsProps {
  speed: number;
  pitch: number;
  onSpeedChange: (speed: number) => void;
  onPitchChange: (pitch: number) => void;
}

export default function AudioControls({
  speed,
  pitch,
  onSpeedChange,
  onPitchChange,
}: AudioControlsProps) {
  return (
    <div className="flex flex-col gap-4 mt-4">
      {/* 语速控制 */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm" style={{ color: 'var(--muted)' }}>
            语速
          </label>
          <span
            className="text-xs px-2 py-1 rounded"
            style={{
              background: 'var(--accent-glow)',
              color: 'var(--accent)',
            }}
          >
            {speed.toFixed(1)}x
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: 'var(--muted)' }}>
            慢
          </span>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={speed}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            className="flex-1 audio-slider"
          />
          <span className="text-xs" style={{ color: 'var(--muted)' }}>
            快
          </span>
        </div>
      </div>

      {/* 音调控制 */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm" style={{ color: 'var(--muted)' }}>
            音调
          </label>
          <span
            className="text-xs px-2 py-1 rounded"
            style={{
              background: 'var(--accent-glow)',
              color: 'var(--accent)',
            }}
          >
            {pitch > 0 ? '+' : ''}
            {pitch}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: 'var(--muted)' }}>
            低
          </span>
          <input
            type="range"
            min="-12"
            max="12"
            step="1"
            value={pitch}
            onChange={(e) => onPitchChange(parseInt(e.target.value))}
            className="flex-1 audio-slider"
          />
          <span className="text-xs" style={{ color: 'var(--muted)' }}>
            高
          </span>
        </div>
      </div>

      {/* 重置按钮 */}
      <button
        className="btn btn-secondary text-xs py-2"
        onClick={() => {
          onSpeedChange(1.0);
          onPitchChange(0);
        }}
      >
        重置为默认值
      </button>
    </div>
  );
}
