import type { DashboardBreakdownItem } from '../../types/dashboard';

type DashboardBreakdownListProps = {
  title: string;
  items: DashboardBreakdownItem[];
  emptyMessage?: string;
};

const DashboardBreakdownList = ({
  title,
  items,
  emptyMessage = 'No data yet.',
}: DashboardBreakdownListProps) => {
  const max = items.length > 0 ? Math.max(...items.map((i) => i.count)) : 1;

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] shadow-xl shadow-black/30 backdrop-blur-sm p-6">
      <h3 className="text-xs font-semibold tracking-widest text-white/40 uppercase mb-4">
        {title}
      </h3>

      {items.length === 0 ? (
        <p className="text-sm text-white/25">{emptyMessage}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const pct = Math.round((item.count / max) * 100);
            return (
              <li key={item.label} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/70 font-medium truncate pr-2">{item.label}</span>
                  <span className="text-white/40 tabular-nums shrink-0">{item.count}</span>
                </div>
                <div className="h-1 w-full rounded-full bg-white/[0.05] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-500/60 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default DashboardBreakdownList;
