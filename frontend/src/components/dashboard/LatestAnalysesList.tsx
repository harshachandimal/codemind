import type { DashboardLatestAnalysis } from '../../types/dashboard';

type LatestAnalysesListProps = {
  analyses: DashboardLatestAnalysis[];
};

const statusStyle: Record<string, string> = {
  completed: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
  failed:    'text-rose-400    bg-rose-500/10    border-rose-500/25',
  pending:   'text-amber-400   bg-amber-500/10   border-amber-500/25',
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch {
    return iso;
  }
}

const LatestAnalysesList = ({ analyses }: LatestAnalysesListProps) => {
  if (analyses.length === 0) {
    return (
      <p className="text-sm text-white/40 py-4 italic">
        Your latest analyses will appear here after you run your first analysis.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {analyses.map((a) => {
        const pill = statusStyle[a.status] ?? 'text-white/40 bg-white/[0.04] border-white/10';
        return (
          <li
            key={a.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-white/[0.02] px-5 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">
                {a.title ?? `Analysis #${a.id}`}
              </p>
              <p className="text-xs text-white/35 mt-0.5">
                {a.language} · {a.time_complexity ?? '—'} · {formatDate(a.created_at)}
              </p>
            </div>
            <span className={['shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full border', pill].join(' ')}>
              {a.status}
            </span>
          </li>
        );
      })}
    </ul>
  );
};

export default LatestAnalysesList;
