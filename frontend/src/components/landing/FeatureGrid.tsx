type Feature = {
  icon: string;
  title: string;
  description: string;
  tag: string;
  tagColor: string;
};

const FEATURES: Feature[] = [
  {
    icon: '⚡',
    title: 'Static Complexity Analysis',
    description: 'Detect time and space complexity with readable explanations and detected algorithmic patterns.',
    tag: 'Analysis',
    tagColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  },
  {
    icon: '▶',
    title: 'Runtime Trace Player',
    description: 'Replay execution step-by-step and inspect how variable values evolve during the run.',
    tag: 'Tracing',
    tagColor: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  },
  {
    icon: '🔁',
    title: 'Recursion Stack Visualization',
    description: 'Understand recursive calls, base cases, and call stack growth and unwinding.',
    tag: 'Recursion',
    tagColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  },
  {
    icon: '🌐',
    title: 'Multi-language Support',
    description: 'Analyze JavaScript, Python, and Java using safe, supported language subsets.',
    tag: 'Languages',
    tagColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  },
  {
    icon: '📤',
    title: 'Export and Share',
    description: 'Export analysis reports as Markdown or JSON for documentation and sharing.',
    tag: 'Export',
    tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    icon: '📚',
    title: 'Trace Examples Library',
    description: 'Start from curated examples for loops, arrays, branches, and recursion across languages.',
    tag: 'Examples',
    tagColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
];

const FeatureGrid = () => (
  <section id="features" className="w-full max-w-6xl mx-auto px-6 pb-20">
    <div className="text-center mb-12">
      <p className="text-xs font-semibold tracking-widest text-indigo-400/70 uppercase mb-3">Features</p>
      <h2 className="text-3xl sm:text-4xl font-bold text-white/90 mb-4">
        Everything you need to understand code.
      </h2>
      <p className="text-white/40 max-w-xl mx-auto text-sm leading-relaxed">
        From static analysis to live execution tracing, CodeMind gives you a complete picture of how your code behaves.
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {FEATURES.map((f) => (
        <div
          key={f.title}
          className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 flex flex-col gap-4 hover:border-white/[0.14] hover:bg-white/[0.04] transition-all duration-300 group"
        >
          <div className="flex items-start justify-between">
            <span className="text-2xl leading-none">{f.icon}</span>
            <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded-full border ${f.tagColor}`}>
              {f.tag}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white/90 mb-2 leading-snug">{f.title}</h3>
            <p className="text-xs text-white/40 leading-relaxed">{f.description}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default FeatureGrid;
