import type { ReactNode } from 'react';

type Variant = 'default' | 'accent' | 'muted';

type Props = {
  children: ReactNode;
  variant?: Variant;
};

const variantClasses: Record<Variant, string> = {
  default:
    'border-indigo-500/30 bg-indigo-500/10 text-indigo-300',
  accent:
    'border-violet-500/30 bg-violet-500/10 text-violet-300',
  muted:
    'border-white/10 bg-white/[0.04] text-white/50',
};

const Badge = ({ children, variant = 'default' }: Props) => {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full border',
        'text-xs font-semibold tracking-wider uppercase',
        variantClasses[variant],
      ].join(' ')}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  );
};

export default Badge;
