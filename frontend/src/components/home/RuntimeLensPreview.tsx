import Panel from '../common/Panel';
import Badge from '../common/Badge';

const lensViews = [
  { label: 'Overview',        active: true  },
  { label: 'Complexity',      active: false },
  { label: 'Execution Flow',  active: false },
  { label: 'Recursion Stack', active: false },
  { label: 'Memory',          active: false },
  { label: 'Optimization',    active: false },
];

const RuntimeLensPreview = () => {
  return (
    <section className="w-full max-w-5xl px-6 pb-16">
      <Panel className="overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <Badge variant="accent">Runtime Lens</Badge>
            <span className="text-xs text-white/30">Product Preview</span>
          </div>
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
          </div>
        </div>

        {/* View tabs */}
        <div className="flex gap-1 px-6 py-3 border-b border-white/5 overflow-x-auto">
          {lensViews.map(({ label, active }) => (
            <span
              key={label}
              className={[
                'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-default select-none transition-colors',
                active
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                  : 'text-white/30 hover:text-white/60',
              ].join(' ')}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Body placeholder */}
        <div className="px-6 py-8 flex flex-col gap-3">
          {[70, 50, 85].map((w, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-indigo-500/40 shrink-0" />
              <div
                className="h-2 rounded-full bg-white/[0.06]"
                style={{ width: `${w}%` }}
              />
            </div>
          ))}
          <p className="text-[11px] text-white/20 mt-4 text-center">
            Full analysis views coming in Phase 3+
          </p>
        </div>
      </Panel>
    </section>
  );
};

export default RuntimeLensPreview;
