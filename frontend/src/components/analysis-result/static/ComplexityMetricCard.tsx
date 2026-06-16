import React from 'react';

type Variant = 'success' | 'accent' | 'warning' | 'danger' | 'neutral';

const variantStyles: Record<Variant, { border: string; value: string; dot: string; glow: string }> = {
  success: { border: 'border-emerald-500/30', value: 'text-emerald-300', dot: 'bg-emerald-400', glow: 'shadow-emerald-900/20' },
  accent:  { border: 'border-indigo-500/30',  value: 'text-indigo-300',  dot: 'bg-indigo-400',  glow: 'shadow-indigo-900/20'  },
  warning: { border: 'border-amber-500/30',   value: 'text-amber-300',   dot: 'bg-amber-400',   glow: 'shadow-amber-900/20'   },
  danger:  { border: 'border-rose-500/30',    value: 'text-rose-300',    dot: 'bg-rose-400',    glow: 'shadow-rose-900/20'    },
  neutral: { border: 'border-white/10',       value: 'text-white/70',    dot: 'bg-white/30',    glow: 'shadow-black/20'       },
};

type Props = {
  label: string;
  value: string | null;
  description?: string;
  variant?: Variant;
};

const ComplexityMetricCard: React.FC<Props> = ({
  label,
  value,
  description,
  variant = 'neutral',
}) => {
  const s = variantStyles[variant];
  const displayValue = value ?? 'Unknown';

  return (
    <div
      className={[
        'rounded-xl border bg-white/[0.03] p-5 flex flex-col gap-3',
        'shadow-lg backdrop-blur-sm transition-all duration-200',
        'hover:bg-white/[0.05] hover:scale-[1.01]',
        s.border, s.glow,
      ].join(' ')}
    >
      {/* Label row */}
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
        <span className="text-xs font-semibold tracking-widest uppercase text-white/40">
          {label}
        </span>
      </div>

      {/* Big complexity value */}
      <p className={`text-3xl font-bold font-mono tracking-tight ${s.value}`}>
        {displayValue}
      </p>

      {/* Description */}
      {description && (
        <p className="text-xs leading-relaxed text-white/50">{description}</p>
      )}
    </div>
  );
};

export default ComplexityMetricCard;
