import { motion } from 'framer-motion';
import type { TimelapseSnapshot, PlaybackSpeed } from '@/types';

interface Props {
  snapshots: TimelapseSnapshot[];
  currentIndex: number;
  isPlaying: boolean;
  speed: PlaybackSpeed;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (index: number) => void;
  onSetSpeed: (s: PlaybackSpeed) => void;
}

const SPEEDS: PlaybackSpeed[] = [0.5, 1, 2, 5];

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function TimelineBar({
  snapshots,
  currentIndex,
  isPlaying,
  speed,
  onPlay,
  onPause,
  onSeek,
  onSetSpeed,
}: Props) {
  const current = snapshots[currentIndex];
  const progress = snapshots.length > 1 ? currentIndex / (snapshots.length - 1) : 0;

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      className="fixed bottom-0 left-0 right-0 z-20 px-6 pb-4 pt-3"
      style={{
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(0,212,255,0.15)',
      }}
    >
      {/* Slider */}
      <div className="mb-3 px-2">
        <input
          type="range"
          min={0}
          max={Math.max(0, snapshots.length - 1)}
          value={currentIndex}
          onChange={e => onSeek(Number(e.target.value))}
          className="w-full h-1 appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #00d4ff ${progress * 100}%, rgba(0,212,255,0.15) ${progress * 100}%)`,
            borderRadius: '4px',
          }}
        />
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between gap-4">
        {/* Left: date + message */}
        <div className="flex flex-col min-w-0 w-48 flex-shrink-0">
          <span className="text-cyber-blue font-mono text-sm font-medium leading-tight">
            {current ? formatDate(current.timestamp) : '—'}
          </span>
          <span className="text-white/40 text-xs font-mono truncate leading-tight mt-0.5">
            {current?.message ?? ''}
          </span>
        </div>

        {/* Center: play/pause */}
        <button
          onClick={isPlaying ? onPause : onPlay}
          disabled={snapshots.length === 0}
          className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-30"
          style={{
            background: 'rgba(0,212,255,0.1)',
            border: '1px solid rgba(0,212,255,0.4)',
            boxShadow: isPlaying ? '0 0 20px rgba(0,212,255,0.3)' : 'none',
          }}
        >
          {isPlaying ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="3" y="2" width="4" height="14" rx="1" fill="#00d4ff" />
              <rect x="11" y="2" width="4" height="14" rx="1" fill="#00d4ff" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 2L16 9L4 16V2Z" fill="#00d4ff" />
            </svg>
          )}
        </button>

        {/* Right: speed selector + commit counter */}
        <div className="flex items-center gap-3 w-48 justify-end flex-shrink-0">
          <span className="text-white/30 font-mono text-xs">
            {currentIndex + 1}/{snapshots.length}
          </span>
          <div className="flex gap-1">
            {SPEEDS.map(s => (
              <button
                key={s}
                onClick={() => onSetSpeed(s)}
                className="px-2 py-1 rounded font-mono text-xs transition-all duration-150"
                style={{
                  background: speed === s ? 'rgba(0,212,255,0.2)' : 'transparent',
                  border: `1px solid ${speed === s ? 'rgba(0,212,255,0.6)' : 'rgba(255,255,255,0.1)'}`,
                  color: speed === s ? '#00d4ff' : 'rgba(255,255,255,0.4)',
                }}
              >
                {s}×
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom slider thumb style */}
      <style>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #00d4ff;
          box-shadow: 0 0 8px #00d4ff;
          cursor: pointer;
        }
        input[type='range']::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #00d4ff;
          box-shadow: 0 0 8px #00d4ff;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </motion.div>
  );
}
