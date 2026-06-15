import React from 'react';
import type { Analysis } from '../../types/analysis';
import { buildRecursionUnwindSteps } from '../../utils/visualizer/trace/recursionTrace';
import Panel from '../common/Panel';

type RecursionUnwindPanelProps = {
  analysis: Analysis;
};

const DISPLAY_LIMIT = 40;

// Depth 0 = shallowest (outermost call), higher = deeper
// For unwinding, deeper frames appear more indented going in, then unwind up
function depthColor(depth: number): string {
  const colors = ['text-emerald-300', 'text-sky-300', 'text-violet-300', 'text-amber-300', 'text-rose-300'];
  return colors[depth % colors.length];
}

const RecursionUnwindPanel: React.FC<RecursionUnwindPanelProps> = ({ analysis }) => {
  if (analysis.trace_mode !== 'executed') return null;

  const steps = Array.isArray(analysis.trace_steps) ? analysis.trace_steps : [];
  const hasRecursion = steps.some((s) => s.callStack && s.callStack.length > 1);
  if (!hasRecursion) return null;

  const unwindSteps = buildRecursionUnwindSteps(steps);
  if (unwindSteps.length === 0) return null;

  const visible = unwindSteps.slice(0, DISPLAY_LIMIT);
  const overflow = unwindSteps.length - visible.length;
  const maxDepth = Math.max(...unwindSteps.map((u) => u.depth));

  return (
    <Panel className="p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold text-white/80">Recursion Unwinding</h3>
          <p className="text-xs text-white/40 mt-1">
            Watch recursive calls return values back up the stack.
          </p>
        </div>
        <span className="text-xs font-semibold text-violet-300 bg-violet-500/10 border border-violet-500/20 px-2.5 py-0.5 rounded-full">
          {unwindSteps.length} return{unwindSteps.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Educational note */}
      <p className="text-[11px] text-white/30 leading-relaxed bg-white/[0.02] border border-white/[0.04] rounded-lg px-3 py-2">
        Unwinding starts when the deepest recursive call returns, then each previous call resumes and returns.
      </p>

      {/* Unwind steps */}
      <div className="bg-black/30 border border-white/[0.04] rounded-lg p-4 flex flex-col gap-2 overflow-x-auto">
        {visible.map((u) => {
          // Invert indentation: deeper calls are more indented
          const indentDepth = maxDepth - u.depth;
          return (
            <div
              key={u.id}
              className="flex items-start gap-2 whitespace-nowrap min-w-max"
              style={{ paddingLeft: `${indentDepth * 1.25}rem` }}
            >
              {/* Up arrow hint */}
              <span className="text-white/20 text-[10px] mt-0.5 shrink-0">↑</span>
              <div className="bg-white/[0.03] border border-white/10 rounded px-2 py-1 flex items-center gap-2">
                <span className={`text-[11px] font-mono font-bold ${depthColor(u.depth)}`}>
                  {u.functionName}
                </span>
                <span className="text-[10px] text-white/30">· step {u.step}</span>
                {u.returnedValueLabel && (
                  <span className="text-[10px] text-emerald-400/80 ml-1">
                    → {u.returnedValueLabel}
                  </span>
                )}
                <span className="text-[10px] text-white/20 ml-1">depth {u.depth}</span>
              </div>
            </div>
          );
        })}
      </div>

      {overflow > 0 && (
        <p className="text-[10px] text-white/30 text-center">
          Showing first {DISPLAY_LIMIT} of {unwindSteps.length} return steps.
        </p>
      )}
    </Panel>
  );
};

export default RecursionUnwindPanel;
