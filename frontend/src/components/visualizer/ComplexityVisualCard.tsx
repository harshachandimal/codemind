import type { ComplexityVisualItem, VisualizerTone } from '../../types/visualizer';

// Maps VisualizerTone to Tailwind colour tokens for border, value text, and dot.
const toneStyles: Record<VisualizerTone, { border: string; value: string; dot: string }> = {
  neutral: { border: 'border-white/10',      value: 'text-white/70',    dot: 'bg-white/30'       },
  success: { border: 'border-emerald-500/30', value: 'text-emerald-300', dot: 'bg-emerald-400'    },
  accent:  { border: 'border-indigo-500/30',  value: 'text-indigo-300',  dot: 'bg-indigo-400'     },
  warning: { border: 'border-amber-500/30',   value: 'text-amber-300',   dot: 'bg-amber-400'      },
  danger:  { border: 'border-rose-500/30',    value: 'text-rose-300',    dot: 'bg-rose-400'       },
};

type Props = { item: ComplexityVisualItem };

const ComplexityVisualCard = ({ item }: Props) => {
  const styles = toneStyles[item.tone];

  return (
    <div
      className={[
        'rounded-xl border bg-white/[0.03] p-5 flex flex-col gap-3',
        'shadow-lg shadow-black/20 backdrop-blur-sm',
        styles.border,
      ].join(' ')}
    >
      {/* Header row: label + tone dot */}
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${styles.dot}`} />
        <span className="text-xs font-semibold tracking-widest uppercase text-white/40">
          {item.label}
        </span>
      </div>

      {/* Big O value */}
      <p className={`text-3xl font-bold font-mono tracking-tight ${styles.value}`}>
        {item.value}
      </p>

      {/* Plain-language description */}
      <p className="text-xs leading-relaxed text-white/50">
        {item.description}
      </p>
    </div>
  );
};

export default ComplexityVisualCard;
