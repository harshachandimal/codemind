import React from 'react';
import type { Analysis } from '../../../types/analysis';

type Issue = {
  kind: 'error' | 'warning' | 'info';
  message: string;
};

const kindStyles: Record<Issue['kind'], { wrapper: string; label: string }> = {
  error:   { wrapper: 'bg-rose-500/10   border-rose-500/30   text-rose-300',   label: 'Error'   },
  warning: { wrapper: 'bg-amber-500/10  border-amber-500/30  text-amber-300',  label: 'Warning' },
  info:    { wrapper: 'bg-slate-800/50  border-slate-700/50  text-slate-400',  label: 'Note'    },
};

function collectIssues(analysis: Analysis): Issue[] {
  const issues: Issue[] = [];

  // Unsupported language for tracing is a static note
  if (['unsupported_language', 'unsupported'].includes(analysis.trace_mode as string)) {
    issues.push({ kind: 'info', message: 'Runtime tracing is not available for this language. Static analysis was used instead.' });
  }

  // trace_plan limitations are parser-level static warnings
  if (analysis.trace_plan?.limitations?.length) {
    analysis.trace_plan.limitations.forEach((lim) =>
      issues.push({ kind: 'warning', message: lim })
    );
  }

  // Static analysis failed/incomplete
  if (analysis.status === 'failed') {
    issues.push({ kind: 'error', message: 'Analysis did not complete successfully. Results may be incomplete.' });
  }

  return issues;
}

type Props = { analysis: Analysis };

const StaticDiagnosticsPanel: React.FC<Props> = ({ analysis }) => {
  const issues = collectIssues(analysis);

  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-5 flex flex-col gap-4 shadow-xl shadow-black/30 backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-bold tracking-widest uppercase text-indigo-400">
          Static Diagnostics
        </p>
        <p className="text-xs text-white/35 leading-relaxed">
          Parser notes and analysis limitations.
        </p>
      </div>

      {/* Issues or clean state */}
      <div className="flex flex-col gap-2">
        {issues.length === 0 ? (
          <p className="text-sm text-white/35 italic">
            Static analysis completed without reported warnings.
          </p>
        ) : (
          issues.map((issue, i) => {
            const s = kindStyles[issue.kind];
            return (
              <div key={i} className={`rounded-lg border p-3 text-xs leading-relaxed ${s.wrapper}`}>
                <span className="font-bold mr-1">{s.label}:</span>
                {issue.message}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StaticDiagnosticsPanel;
