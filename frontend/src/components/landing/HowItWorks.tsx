const STEPS = [
  {
    num: '01',
    title: 'Paste Your Code',
    description: 'Choose a language, paste your source code, and optionally add input arguments for the entry function.',
    detail: 'Supports JavaScript, Python, and Java with safe supported subsets.',
  },
  {
    num: '02',
    title: 'Analyze Complexity',
    description: 'CodeMind estimates time and space complexity, detects algorithmic patterns, and shows explanations.',
    detail: 'Static analysis runs on every submission, even when runtime tracing is unavailable.',
  },
  {
    num: '03',
    title: 'Replay Runtime Trace',
    description: 'Use the step-by-step trace player to inspect variables, call stack, and execution flow at each moment.',
    detail: 'Navigate forward and backward. Recursion stacks visualize call depth naturally.',
  },
];

const HowItWorks = () => (
  <section id="how-it-works" className="w-full max-w-6xl mx-auto px-6 pb-20">
    <div className="text-center mb-12">
      <p className="text-xs font-semibold tracking-widest text-indigo-400/70 uppercase mb-3">Workflow</p>
      <h2 className="text-3xl sm:text-4xl font-bold text-white/90 mb-4">How it works</h2>
      <p className="text-white/40 max-w-xl mx-auto text-sm leading-relaxed">
        Three steps from code to complete runtime understanding.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
      {/* Connector line (desktop) */}
      <div className="hidden md:block absolute top-8 left-[calc(16.67%+20px)] right-[calc(16.67%+20px)] h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent pointer-events-none" />

      {STEPS.map((step, i) => (
        <div key={i} className="relative rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 flex flex-col gap-4 hover:border-indigo-500/20 hover:bg-white/[0.04] transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-lg shadow-indigo-900/50 shrink-0">
              <span className="text-white font-bold text-sm">{i + 1}</span>
            </div>
            <span className="text-[10px] font-bold text-white/20 font-mono">{step.num}</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white/90 mb-2">{step.title}</h3>
            <p className="text-xs text-white/45 leading-relaxed mb-3">{step.description}</p>
            <p className="text-[10px] text-indigo-400/60 leading-relaxed border-l-2 border-indigo-500/20 pl-2">{step.detail}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default HowItWorks;
