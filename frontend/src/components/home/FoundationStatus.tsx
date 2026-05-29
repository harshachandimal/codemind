import StatusPill from '../common/StatusPill';

const stack = [
  { label: 'React + TypeScript', status: 'connected' },
  { label: 'Vite',               status: 'connected' },
  { label: 'Tailwind CSS',       status: 'connected' },
  { label: 'React Router',       status: 'connected' },
  { label: 'Laravel API',        status: 'idle'      },
] as const;

const FoundationStatus = () => {
  return (
    <section className="w-full max-w-5xl px-6 pb-16">
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 py-5 flex flex-wrap items-center gap-4">
        <span className="text-xs font-semibold tracking-widest text-white/30 uppercase mr-2">
          Stack
        </span>
        {stack.map(({ label, status }) => (
          <StatusPill key={label} label={label} status={status} />
        ))}
      </div>
    </section>
  );
};

export default FoundationStatus;
