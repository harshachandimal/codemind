import React from 'react';
import { TracePlayerStep } from '../../types/tracePlayer';

type Props = {
  runtimeError?: unknown;
  warnings?: string[];
  steps?: TracePlayerStep[];
  returnedValue?: unknown;
};

export const RuntimeDiagnosticsPanel: React.FC<Props> = ({ runtimeError, warnings, steps }) => {
  const issues: React.ReactNode[] = [];

  if (runtimeError) {
    issues.push(
      <div key="runtime-error" className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded text-sm">
        <span className="font-bold">Runtime Error:</span> {String(runtimeError)}
      </div>
    );
  }

  if (warnings && warnings.length > 0) {
    warnings.forEach((warn, idx) => {
      issues.push(
        <div key={`warning-${idx}`} className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-3 rounded text-sm">
          <span className="font-bold">Warning:</span> {warn}
        </div>
      );
    });
  }

  if (steps && steps.length > 0) {
    const hasVariables = steps.some(s => s.variables && Object.keys(s.variables).length > 0);
    if (!hasVariables) {
      issues.push(
        <div key="no-vars" className="bg-slate-800/50 border border-slate-700/50 text-slate-400 p-3 rounded text-sm">
          No variable snapshots were captured during this trace.
        </div>
      );
    }

    const hasLines = steps.some(s => s.lineNumber !== null && s.lineNumber !== undefined);
    if (!hasLines) {
      issues.push(
        <div key="no-lines" className="bg-slate-800/50 border border-slate-700/50 text-slate-400 p-3 rounded text-sm">
          Runtime trace does not include line metadata, so source-line highlighting is unavailable.
        </div>
      );
    }
  } else if (steps && steps.length === 0) {
    issues.push(
      <div key="empty-trace" className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-3 rounded text-sm">
        <span className="font-bold">Warning:</span> Trace completed but no execution steps were captured.
      </div>
    );
  }

  return (
    <div className="box-border w-full min-w-0 rounded-xl border border-slate-700/60 bg-slate-900/40 p-3">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
        Execution Diagnostics
      </h3>
      <div className="flex flex-col gap-2 min-w-0 break-words whitespace-normal">
        {issues.length > 0 ? issues : (
          <div className="text-slate-500 text-sm italic">
            No runtime issues detected from the available trace.
          </div>
        )}
      </div>
    </div>
  );
};
