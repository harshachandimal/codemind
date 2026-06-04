import type { RecursionStackFrame, RecursionStackFrameState } from '../../types/visualizer';

// Per-state visual tokens: border, background tint, label text, state badge.
const stateStyles: Record<
  RecursionStackFrameState,
  { border: string; bg: string; dot: string; badge: string; badgeText: string }
> = {
  active: {
    border: 'border-cyan-500/40',
    bg:     'bg-cyan-500/[0.06]',
    dot:    'bg-cyan-400',
    badge:  'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
    badgeText: 'Active',
  },
  waiting: {
    border: 'border-white/10',
    bg:     'bg-white/[0.02]',
    dot:    'bg-white/20',
    badge:  'bg-white/[0.04] border-white/10 text-white/40',
    badgeText: 'Waiting',
  },
  'base-case': {
    border: 'border-emerald-500/40',
    bg:     'bg-emerald-500/[0.05]',
    dot:    'bg-emerald-400',
    badge:  'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    badgeText: 'Base Case',
  },
  unwinding: {
    border: 'border-amber-500/40',
    bg:     'bg-amber-500/[0.05]',
    dot:    'bg-amber-400',
    badge:  'bg-amber-500/10 border-amber-500/30 text-amber-300',
    badgeText: 'Unwinding',
  },
};

type Props = { frame: RecursionStackFrame };

const RecursionStackFrameCard = ({ frame }: Props) => {
  const s = stateStyles[frame.state];

  return (
    <div
      className={[
        'rounded-lg border px-4 py-3 flex items-start gap-3',
        'shadow-sm shadow-black/20 transition-colors',
        s.border, s.bg,
      ].join(' ')}
    >
      {/* Depth indicator stripe */}
      <div className="flex flex-col items-center gap-1 pt-0.5 flex-shrink-0">
        <span className={`w-2 h-2 rounded-full ${s.dot}`} />
        <span className="text-[9px] font-mono text-white/20">D{frame.depth}</span>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-mono font-semibold text-white/80 truncate">
            {frame.label}
          </span>
          {/* State badge */}
          <span
            className={[
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border',
              'text-[9px] font-bold tracking-widest uppercase flex-shrink-0',
              s.badge,
            ].join(' ')}
          >
            <span className={`w-1 h-1 rounded-full ${s.dot} opacity-80`} />
            {s.badgeText}
          </span>
        </div>
        <p className="text-xs text-white/40 leading-relaxed">{frame.description}</p>
      </div>
    </div>
  );
};

export default RecursionStackFrameCard;
