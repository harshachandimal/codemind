type DashboardEmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

const DashboardEmptyState = ({
  title,
  description,
  actionLabel,
  onAction,
}: DashboardEmptyStateProps) => {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-8 py-16 text-center shadow-sm">
      <div className="mx-auto w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-5">
        <svg
          className="w-6 h-6 text-indigo-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-white/40 max-w-sm mx-auto mb-8 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 text-white font-medium text-sm px-6 py-2.5 rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default DashboardEmptyState;
