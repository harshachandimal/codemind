import React from 'react';

type Props = {
  currentIndex: number;
  totalSteps: number;
  isPlaying: boolean;
  atEnd: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onReset: () => void;
  onTogglePlay: () => void;
};

const btn = (disabled: boolean, active?: boolean) =>
  [
    'flex items-center justify-center w-8 h-8 rounded-lg border text-xs font-semibold transition-colors',
    disabled
      ? 'border-white/[0.06] text-white/20 cursor-not-allowed'
      : active
      ? 'border-indigo-500/40 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30'
      : 'border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white/80',
  ].join(' ');

const TracePlaybackControls: React.FC<Props> = ({
  currentIndex,
  totalSteps,
  isPlaying,
  atEnd,
  onPrevious,
  onNext,
  onReset,
  onTogglePlay,
}) => {
  const empty = totalSteps === 0;
  const atStart = currentIndex <= 0;

  // Button label / icon for play/pause/replay
  const playIcon  = atEnd && !isPlaying ? '↺' : isPlaying ? '⏸' : '▶';
  const playTitle = atEnd && !isPlaying ? 'Replay from start' : isPlaying ? 'Pause' : 'Play';

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Reset */}
      <button
        onClick={onReset}
        disabled={empty || atStart}
        title="Reset to first step"
        className={btn(empty || atStart)}
        aria-label="Reset"
      >
        ⟪
      </button>

      {/* Previous */}
      <button
        onClick={onPrevious}
        disabled={empty || atStart}
        title="Previous step"
        className={btn(empty || atStart)}
        aria-label="Previous step"
      >
        ‹
      </button>

      {/* Play / Pause / Replay */}
      <button
        onClick={onTogglePlay}
        disabled={empty}
        title={playTitle}
        className={btn(empty, isPlaying)}
        aria-label={playTitle}
      >
        {playIcon}
      </button>

      {/* Next */}
      <button
        onClick={onNext}
        disabled={empty || atEnd}
        title="Next step"
        className={btn(empty || atEnd)}
        aria-label="Next step"
      >
        ›
      </button>

      {/* Step indicator */}
      <span className="ml-1 text-[11px] font-mono text-white/40 tabular-nums">
        {empty ? '— / —' : `Step ${currentIndex + 1} of ${totalSteps}`}
      </span>
    </div>
  );
};

export default TracePlaybackControls;
