import React from 'react';
import Panel from '../common/Panel';
import {
  SUPPORTED_TRACE_SYNTAX,
  SUPPORTED_TRACE_EXAMPLE,
} from '../../constants/supportedTraceSyntax';

type SupportedSyntaxPanelProps = {
  compact?: boolean;
};

const SupportedSyntaxPanel: React.FC<SupportedSyntaxPanelProps> = ({ compact }) => {
  const supportedList = compact ? SUPPORTED_TRACE_SYNTAX.slice(0, 8) : SUPPORTED_TRACE_SYNTAX;

  return (
    <Panel className="p-5 flex flex-col gap-4 bg-[#0d1117] border-white/5">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-white/80">Language Support & Syntax</h3>
        <p className="text-xs text-white/40 leading-relaxed">
          Static complexity analysis is supported for JavaScript, Python, and Java. 
          Runtime trace step-by-step execution is fully supported for JavaScript and experimentally supported for Python. 
          While loops are supported with a safe iteration limit to prevent infinite tracing. 
          Recursive tracing is protected by a maximum call-depth limit.
        </p>
      </div>

      <div className={`grid gap-6 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
        {/* JavaScript Section */}
        <div className="flex flex-col gap-2">
          <h4 className="text-[10px] font-semibold tracking-widest uppercase text-emerald-400/80 mb-1">
            JavaScript
          </h4>
          <ul className="flex flex-col gap-1.5 text-[11px] text-white/60">
            <li><span className="text-emerald-400">✓</span> Static analysis: supported</li>
            <li><span className="text-emerald-400">✓</span> Runtime trace: supported</li>
            <li><span className="text-emerald-400">✓</span> Loops, nested loops, recursion supported</li>
          </ul>
          <ul className="flex flex-wrap gap-1.5 mt-1">
            {supportedList.map((item) => (
              <li key={item} className="text-[10px] bg-emerald-500/10 text-emerald-200/70 border border-emerald-500/20 rounded px-2 py-1">
                {item}
              </li>
            ))}
            {compact && <li className="text-[10px] text-white/30 px-1 py-1">...and more</li>}
          </ul>
        </div>

        {/* Python Section */}
        <div className="flex flex-col gap-2">
          <h4 className="text-[10px] font-semibold tracking-widest uppercase text-indigo-400/80 mb-1">
            Python
          </h4>
          <ul className="flex flex-col gap-1.5 text-[11px] text-white/60">
            <li><span className="text-indigo-400">✓</span> Static analysis: supported</li>
            <li><span className="text-indigo-400">✓</span> Runtime trace: experimental, requires runtime flags</li>
            <li><span className="text-indigo-400">✓</span> for/while loops, nested loops, recursion detection supported</li>
          </ul>
        </div>

        {/* Java Section */}
        <div className="flex flex-col gap-2">
          <h4 className="text-[10px] font-semibold tracking-widest uppercase text-indigo-400/80 mb-1">
            Java
          </h4>
          <ul className="flex flex-col gap-1.5 text-[11px] text-white/60">
            <li><span className="text-indigo-400">✓</span> Static analysis: supported</li>
            <li><span className="text-white/30">−</span> Runtime trace: coming later</li>
            <li><span className="text-indigo-400">✓</span> for/while loops, nested loops, recursion detection supported</li>
          </ul>
        </div>
      </div>

      {/* Example Snippet */}
      <div className="flex flex-col gap-2 mt-2">
        <h4 className="text-[10px] font-semibold tracking-widest uppercase text-white/30">
          Example Supported Code
        </h4>
        <div className="bg-black/30 border border-white/[0.04] rounded-lg p-3 overflow-x-auto">
          <pre className="text-[11px] font-mono text-indigo-200/80 leading-relaxed">
            {SUPPORTED_TRACE_EXAMPLE}
          </pre>
        </div>
      </div>
    </Panel>
  );
};

export default SupportedSyntaxPanel;
