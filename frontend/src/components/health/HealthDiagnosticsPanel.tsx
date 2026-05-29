import Panel from '../common/Panel';

const chain = [
  { label: 'React Frontend',  detail: 'localhost:5173' },
  { label: 'Axios Client',    detail: 'HTTP GET /api/health' },
  { label: 'Laravel API',     detail: '127.0.0.1:8000' },
  { label: 'MySQL Database',  detail: 'via Laravel Eloquent' },
];

const HealthDiagnosticsPanel = () => {
  return (
    <Panel className="w-full max-w-md mt-6 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5">
        <p className="text-[10px] font-bold tracking-widest text-white/25 uppercase">
          Diagnostics Chain
        </p>
      </div>
      <div className="px-6 py-4 flex flex-col gap-0">
        {chain.map(({ label, detail }, idx) => (
          <div key={label} className="flex flex-col">
            <div className="flex items-center gap-3 py-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/60 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-white/70">{label}</p>
                <p className="text-[10px] text-white/25 font-mono mt-0.5">{detail}</p>
              </div>
            </div>
            {idx < chain.length - 1 && (
              <div className="ml-[0.6875rem] w-px h-3 bg-white/10" />
            )}
          </div>
        ))}
      </div>
    </Panel>
  );
};

export default HealthDiagnosticsPanel;
