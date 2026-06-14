type DashboardStatCardProps = {
  label: string;
  value: number | string;
  description?: string;
  accent?: 'indigo' | 'emerald' | 'rose' | 'amber' | 'default';
};

const accentMap: Record<NonNullable<DashboardStatCardProps['accent']>, string> = {
  indigo:  'text-indigo-400',
  emerald: 'text-emerald-400',
  rose:    'text-rose-400',
  amber:   'text-amber-400',
  default: 'text-white',
};

const DashboardStatCard = ({
  label,
  value,
  description,
  accent = 'default',
}: DashboardStatCardProps) => {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] shadow-xl shadow-black/30 backdrop-blur-sm p-6 flex flex-col gap-1 min-w-0">
      <p className="text-xs font-semibold tracking-widest text-white/40 uppercase truncate">
        {label}
      </p>
      <p className={['text-4xl font-bold tabular-nums leading-none mt-1', accentMap[accent]].join(' ')}>
        {value}
      </p>
      {description && (
        <p className="text-xs text-white/30 mt-1 truncate">{description}</p>
      )}
    </div>
  );
};

export default DashboardStatCard;
