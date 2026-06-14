import type { DashboardBreakdownItem } from '../../types/dashboard';

type DashboardVisualBarListProps = {
  title: string;
  items: DashboardBreakdownItem[];
  emptyMessage?: string;
  maxItems?: number;
};

const DashboardVisualBarList = ({
  title,
  items,
  emptyMessage = 'No data yet.',
  maxItems = 5,
}: DashboardVisualBarListProps) => {
  const sortedItems = [...items].sort((a, b) => b.count - a.count).slice(0, maxItems);
  const total = sortedItems.reduce((acc, item) => acc + item.count, 0);

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] shadow-xl shadow-black/30 backdrop-blur-sm p-6 flex flex-col min-w-0">
      <h3 className="text-xs font-semibold tracking-widest text-white/40 uppercase mb-5">
        {title}
      </h3>

      {sortedItems.length === 0 || total === 0 ? (
        <p className="text-sm text-white/25 py-2">{emptyMessage}</p>
      ) : (
        <ul className="space-y-4">
          {sortedItems.map((item) => {
            const pct = Math.round((item.count / total) * 100);
            return (
              <li key={item.label} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/80 font-medium truncate pr-2" title={item.label}>
                    {item.label}
                  </span>
                  <span className="text-white/40 tabular-nums shrink-0">
                    {item.count} <span className="text-white/20 ml-1">({pct}%)</span>
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/[0.04] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500/80 to-purple-500/80 transition-all duration-700 ease-out"
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

export default DashboardVisualBarList;
