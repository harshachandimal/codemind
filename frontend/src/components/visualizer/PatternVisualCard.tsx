import type { PatternVisualItem, VisualizerTone } from '../../types/visualizer';

// Maps VisualizerTone to badge colour classes.
const toneBadge: Record<VisualizerTone, string> = {
  neutral: 'border-white/10      bg-white/[0.04]      text-white/50',
  success: 'border-emerald-500/30 bg-emerald-500/10    text-emerald-300',
  accent:  'border-indigo-500/30  bg-indigo-500/10     text-indigo-300',
  warning: 'border-amber-500/30   bg-amber-500/10      text-amber-300',
  danger:  'border-rose-500/30    bg-rose-500/10       text-rose-300',
};

type Props = { pattern: PatternVisualItem };

const PatternVisualCard = ({ pattern }: Props) => {
  const badgeClass = toneBadge[pattern.tone];

  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 flex flex-col gap-3 shadow-md shadow-black/20">
      {/* Tone badge label */}
      <span
        className={[
          'inline-flex items-center gap-1.5 self-start px-2.5 py-0.5',
          'rounded-full border text-[10px] font-bold tracking-widest uppercase',
          badgeClass,
        ].join(' ')}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
        {pattern.label}
      </span>

      {/* Description */}
      <p className="text-xs leading-relaxed text-white/50">
        {pattern.description}
      </p>
    </div>
  );
};

export default PatternVisualCard;
