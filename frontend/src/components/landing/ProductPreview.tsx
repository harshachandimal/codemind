const CODE_LINES = [
  { tokens: [{ t: 'kw', v: 'function ' }, { t: 'fn', v: 'sum' }, { t: 'pl', v: '(arr) {' }] },
  { tokens: [{ t: 'sp', v: '  ' }, { t: 'kw', v: 'let ' }, { t: 'id', v: 'total' }, { t: 'pl', v: ' = ' }, { t: 'nm', v: '0' }, { t: 'pl', v: ';' }] },
  { tokens: [{ t: 'sp', v: '  ' }, { t: 'kw', v: 'for ' }, { t: 'pl', v: '(let i = 0; i < arr.length; i++) {' }] },
  { tokens: [{ t: 'sp', v: '    ' }, { t: 'id', v: 'total' }, { t: 'pl', v: ' = total + arr[i];' }], active: true },
  { tokens: [{ t: 'sp', v: '  ' }, { t: 'pl', v: '}' }] },
  { tokens: [{ t: 'sp', v: '  ' }, { t: 'kw', v: 'return ' }, { t: 'id', v: 'total' }, { t: 'pl', v: ';' }] },
  { tokens: [{ t: 'pl', v: '}' }] },
];

const TOKEN_COLORS: Record<string, string> = {
  kw: 'text-violet-400',
  fn: 'text-blue-300',
  id: 'text-emerald-300',
  nm: 'text-amber-300',
  pl: 'text-white/50',
  sp: '',
};

const ProductPreview = () => (
  <section className="w-full max-w-6xl mx-auto px-6 pb-20">
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden shadow-2xl shadow-black/50">
      {/* Window chrome */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500/50" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/50" />
          <span className="w-3 h-3 rounded-full bg-green-500/50" />
        </div>
        <span className="text-xs text-white/30 font-mono">CodeMind · Analyzer</span>
        <div className="w-12" />
      </div>

      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/[0.06]">
        {/* Left: code editor */}
        <div className="p-5">
          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-3">Source Code · JavaScript</p>
          <div className="font-mono text-sm leading-6 space-y-0.5">
            {CODE_LINES.map((line, i) => (
              <div
                key={i}
                className={`flex px-2 py-0.5 rounded ${line.active ? 'bg-indigo-500/15 border-l-2 border-indigo-400' : ''}`}
              >
                <span className="w-6 text-white/20 select-none text-right mr-4 text-xs leading-6">{i + 1}</span>
                <span>
                  {line.tokens.map((tok, j) => (
                    <span key={j} className={TOKEN_COLORS[tok.t]}>{tok.v}</span>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: analysis result */}
        <div className="p-5 flex flex-col gap-4">
          <div>
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-3">Static Analysis</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[{ label: 'Time', value: 'O(n)', color: 'text-indigo-300' }, { label: 'Space', value: 'O(1)', color: 'text-emerald-300' }].map(m => (
                <div key={m.label} className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-3 text-center">
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">{m.label}</p>
                  <p className={`text-lg font-bold font-mono ${m.color}`}>{m.value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
              <span className="text-xs text-white/60">Pattern: <span className="text-violet-300 font-medium">Array Traversal</span></span>
            </div>
          </div>

          <div className="border-t border-white/[0.06] pt-4">
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-3">Runtime Trace · Step 4 of 8</p>
            <div className="space-y-2">
              <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 px-3 py-2">
                <p className="text-xs text-white/50 mb-1">Variables</p>
                <div className="flex gap-3 font-mono text-xs">
                  <span><span className="text-white/30">total</span> <span className="text-emerald-300 font-bold">→ 6</span></span>
                  <span><span className="text-white/30">i</span> <span className="text-amber-300">= 2</span></span>
                </div>
              </div>
              <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2">
                <p className="text-xs text-white/50 mb-1">Call Stack</p>
                <p className="font-mono text-xs text-blue-300">sum(arr)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default ProductPreview;
