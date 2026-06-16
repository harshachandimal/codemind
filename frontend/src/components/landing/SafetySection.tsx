const SAFETY_POINTS = [
  {
    icon: '🛡',
    title: 'Backend never executes your code',
    description: 'The Laravel backend receives code as text and forwards it to the tracing service. It never runs your code directly.',
  },
  {
    icon: '🔒',
    title: 'Controlled interpreter sandbox',
    description: 'Runtime tracing uses safe, purpose-built interpreters that support only a known-safe subset of each language.',
  },
  {
    icon: '🚫',
    title: 'Unsupported syntax is rejected',
    description: 'Code using unsupported features, dangerous calls, or restricted patterns is rejected with a clear error message.',
  },
  {
    icon: '🌐',
    title: 'Frontend calls Laravel only',
    description: 'The React frontend never directly calls the tracer service. All communication goes through the secure backend API.',
  },
];

const SafetySection = () => (
  <section className="w-full max-w-6xl mx-auto px-6 pb-20">
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
      <div className="px-8 py-10">
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-widest text-emerald-400/70 uppercase mb-3">Safety</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white/90 mb-3">Built for safe code understanding.</h2>
          <p className="text-white/40 text-sm max-w-xl leading-relaxed">
            CodeMind is designed so you can paste and analyze code without worry. Here is how the system protects you.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SAFETY_POINTS.map((point) => (
            <div key={point.title} className="flex gap-4 p-4 rounded-xl border border-white/[0.05] bg-white/[0.02]">
              <span className="text-xl shrink-0 mt-0.5">{point.icon}</span>
              <div>
                <h4 className="text-sm font-semibold text-white/80 mb-1">{point.title}</h4>
                <p className="text-xs text-white/40 leading-relaxed">{point.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default SafetySection;
