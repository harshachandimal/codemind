import React from 'react';

type Props = {
  isPlaying: boolean;
  canGoNext: boolean;
  canGoPrevious: boolean;
  speedMs: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onReset: () => void;
  onSpeedChange: (speedMs: number) => void;
};

const speeds = [
  { label: '300ms', value: 300 },
  { label: '600ms', value: 600 },
  { label: '1s', value: 1000 },
  { label: '1.5s', value: 1500 },
];

export const TracePlaybackControls: React.FC<Props> = ({
  isPlaying,
  canGoNext,
  canGoPrevious,
  speedMs,
  onPlayPause,
  onNext,
  onPrevious,
  onReset,
  onSpeedChange,
}) => {
  return (
    <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
      <button
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className="px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-slate-800 rounded transition-colors"
      >
        Previous
      </button>

      <button
        onClick={onPlayPause}
        className={`px-4 py-1.5 text-sm font-medium rounded transition-colors ${
          isPlaying 
            ? 'bg-amber-600 hover:bg-amber-500 text-white' 
            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
        }`}
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>

      <button
        onClick={onNext}
        disabled={!canGoNext}
        className="px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-slate-800 rounded transition-colors"
      >
        Next
      </button>

      <button
        onClick={onReset}
        className="px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 rounded transition-colors ml-2"
      >
        Reset
      </button>

      <div className="ml-auto flex items-center gap-2">
        <label className="text-xs text-slate-400">Speed</label>
        <select
          value={speedMs}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="bg-slate-800 text-sm text-slate-200 border border-slate-700 rounded px-2 py-1 outline-none focus:border-indigo-500"
        >
          {speeds.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
