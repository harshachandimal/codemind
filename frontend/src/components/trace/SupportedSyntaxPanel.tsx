import React from 'react';
import Panel from '../common/Panel';
import {
  SUPPORTED_TRACE_SYNTAX,
  UNSUPPORTED_TRACE_SYNTAX,
  SUPPORTED_TRACE_EXAMPLE,
} from '../../constants/supportedTraceSyntax';

type SupportedSyntaxPanelProps = {
  compact?: boolean;
};

const SupportedSyntaxPanel: React.FC<SupportedSyntaxPanelProps> = ({ compact }) => {
  const supportedList = compact ? SUPPORTED_TRACE_SYNTAX.slice(0, 8) : SUPPORTED_TRACE_SYNTAX;
  const unsupportedList = compact ? UNSUPPORTED_TRACE_SYNTAX.slice(0, 8) : UNSUPPORTED_TRACE_SYNTAX;

  return (
    <Panel className="p-5 flex flex-col gap-4 bg-[#0d1117] border-white/5">
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-white/80">Supported Runtime Trace Syntax</h3>
        <p className="text-xs text-white/40 leading-relaxed">
          The runtime tracer supports a safe JavaScript subset so CodeMind can trace code step by step without running arbitrary JavaScript.
          While loops are supported with a safe iteration limit to prevent infinite tracing. Recursive tracing is protected by a maximum call-depth limit, so missing base cases stop safely instead of running forever.
        </p>
      </div>

      <div className={`grid gap-6 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
        {/* Supported Section */}
        <div className="flex flex-col gap-2">
          <h4 className="text-[10px] font-semibold tracking-widest uppercase text-emerald-400/80 mb-1">
            Supported
          </h4>
          <ul className="flex flex-wrap gap-1.5">
            {supportedList.map((item) => (
              <li key={item} className="text-[10px] bg-emerald-500/10 text-emerald-200/70 border border-emerald-500/20 rounded px-2 py-1">
                {item}
              </li>
            ))}
            {compact && <li className="text-[10px] text-white/30 px-1 py-1">...and more</li>}
          </ul>
        </div>

        {/* Not Supported Section */}
        <div className="flex flex-col gap-2">
          <h4 className="text-[10px] font-semibold tracking-widest uppercase text-red-400/80 mb-1">
            Not Supported Yet
          </h4>
          <ul className="flex flex-wrap gap-1.5">
            {unsupportedList.map((item) => (
              <li key={item} className="text-[10px] bg-red-500/10 text-red-200/70 border border-red-500/20 rounded px-2 py-1">
                {item}
              </li>
            ))}
            {compact && <li className="text-[10px] text-white/30 px-1 py-1">...and more</li>}
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
