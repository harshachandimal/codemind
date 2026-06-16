import React from 'react';
import type { PatternVisualItem, VisualizerTone } from '../../../types/visualizer';

const toneBadge: Record<VisualizerTone, string> = {
  neutral: 'border-white/10      bg-white/[0.04]      text-white/50',
  success: 'border-emerald-500/30 bg-emerald-500/10    text-emerald-300',
  accent:  'border-indigo-500/30  bg-indigo-500/10     text-indigo-300',
  warning: 'border-amber-500/30   bg-amber-500/10      text-amber-300',
  danger:  'border-rose-500/30    bg-rose-500/10       text-rose-300',
};

type Props = {
  patterns: PatternVisualItem[];
};

const PatternChip: React.FC<{ pattern: PatternVisualItem }> = ({ pattern }) => (
  <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 flex flex-col gap-2 shadow-md shadow-black/20 transition-all duration-150 hover:bg-white/[0.06]">
    <span
      className={[
        'inline-flex items-center gap-1.5 self-start px-2.5 py-0.5',
        'rounded-full border text-[10px] font-bold tracking-widest uppercase',
        toneBadge[pattern.tone],
      ].join(' ')}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {pattern.label}
    </span>
    <p className="text-xs leading-relaxed text-white/50">{pattern.description}</p>
  </div>
);

const PatternInsightsPanel: React.FC<Props> = ({ patterns }) => (
  <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-5 flex flex-col gap-4 shadow-xl shadow-black/30 backdrop-blur-sm">
    {/* Header */}
    <div className="flex flex-col gap-1">
      <p className="text-[10px] font-bold tracking-widest uppercase text-indigo-400">
        Pattern Insights
      </p>
      <p className="text-xs text-white/35 leading-relaxed">
        Algorithmic patterns detected by static analysis.
      </p>
    </div>

    {/* Chips / Empty state */}
    {patterns.length === 0 ? (
      <p className="text-sm text-white/35 italic">
        No specific algorithmic patterns were detected.
      </p>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {patterns.map((p) => (
          <PatternChip key={p.key} pattern={p} />
        ))}
      </div>
    )}
  </div>
);

export default PatternInsightsPanel;
