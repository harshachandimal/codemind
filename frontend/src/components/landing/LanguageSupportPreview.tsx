type Badge = { label: string; color: string };
type LangCard = {
  name: string;
  icon: string;
  staticAnalysis: string;
  runtimeTrace: string;
  bestFor: string[];
  badges: Badge[];
};

const LANGS: LangCard[] = [
  {
    name: 'JavaScript',
    icon: 'JS',
    staticAnalysis: 'Supported',
    runtimeTrace: 'Supported',
    bestFor: ['Loops & arrays', 'Branches', 'Recursion', 'Closures'],
    badges: [
      { label: 'Static Analysis', color: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20' },
      { label: 'Runtime Trace', color: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20' },
      { label: 'Safe Subset', color: 'text-amber-300 bg-amber-500/10 border-amber-500/20' },
    ],
  },
  {
    name: 'Python',
    icon: 'PY',
    staticAnalysis: 'Supported',
    runtimeTrace: 'Supported',
    bestFor: ['Loops & lists', 'Recursion', 'Conditionals', 'Functions'],
    badges: [
      { label: 'Static Analysis', color: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20' },
      { label: 'Runtime Trace', color: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20' },
      { label: 'Safe Subset', color: 'text-amber-300 bg-amber-500/10 border-amber-500/20' },
    ],
  },
  {
    name: 'Java',
    icon: '☕',
    staticAnalysis: 'Supported',
    runtimeTrace: 'Experimental',
    bestFor: ['Static methods', 'Arrays', 'Recursion', 'Control flow'],
    badges: [
      { label: 'Static Analysis', color: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20' },
      { label: 'Experimental Trace', color: 'text-violet-300 bg-violet-500/10 border-violet-500/20' },
      { label: 'Safe Subset', color: 'text-amber-300 bg-amber-500/10 border-amber-500/20' },
    ],
  },
];

const LanguageSupportPreview = () => (
  <section id="languages" className="w-full max-w-6xl mx-auto px-6 pb-20">
    <div className="text-center mb-12">
      <p className="text-xs font-semibold tracking-widest text-indigo-400/70 uppercase mb-3">Languages</p>
      <h2 className="text-3xl sm:text-4xl font-bold text-white/90 mb-4">Supported languages</h2>
      <p className="text-white/40 max-w-xl mx-auto text-sm leading-relaxed">
        CodeMind uses safe, controlled interpreters. Not all syntax is supported — complex library usage and dynamic features are intentionally excluded for safety.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {LANGS.map((lang) => (
        <div key={lang.name} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 flex flex-col gap-5 hover:border-white/[0.15] transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600/30 to-violet-600/20 border border-white/[0.08] flex items-center justify-center font-bold text-sm text-white/80">
              {lang.icon}
            </div>
            <h3 className="text-base font-bold text-white/90">{lang.name}</h3>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-white/40">Static Analysis</span>
              <span className="text-emerald-400 font-medium">{lang.staticAnalysis}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Runtime Trace</span>
              <span className={lang.runtimeTrace === 'Supported' ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>{lang.runtimeTrace}</span>
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest text-white/25 mb-2">Best for</p>
            <div className="flex flex-wrap gap-1.5">
              {lang.bestFor.map((item) => (
                <span key={item} className="text-[10px] px-2 py-0.5 rounded-full border border-white/[0.08] text-white/40">{item}</span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 border-t border-white/[0.05] pt-4">
            {lang.badges.map((b) => (
              <span key={b.label} className={`text-[9px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full border ${b.color}`}>{b.label}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default LanguageSupportPreview;
