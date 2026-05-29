type Status = 'checking' | 'connected' | 'error' | 'idle';

type Props = {
  label: string;
  status: Status;
};

const config: Record<Status, { dot: string; pill: string }> = {
  checking: {
    dot: 'bg-amber-400 animate-pulse',
    pill: 'border-amber-500/25 bg-amber-500/10 text-amber-300',
  },
  connected: {
    dot: 'bg-emerald-400',
    pill: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300',
  },
  error: {
    dot: 'bg-red-400',
    pill: 'border-red-500/25 bg-red-500/10 text-red-300',
  },
  idle: {
    dot: 'bg-white/30',
    pill: 'border-white/10 bg-white/[0.04] text-white/40',
  },
};

const StatusPill = ({ label, status }: Props) => {
  const { dot, pill } = config[status];
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full border',
        'text-xs font-semibold',
        pill,
      ].join(' ')}
    >
      <span className={['w-1.5 h-1.5 rounded-full', dot].join(' ')} />
      {label}
    </span>
  );
};

export default StatusPill;
