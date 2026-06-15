import React from 'react';
import type { Analysis } from '../../types/analysis';
import { buildRecursionTreeFromSteps } from '../../utils/visualizer/trace/recursionTrace';
import Panel from '../common/Panel';

type RecursionTreePanelProps = {
  analysis: Analysis;
};

const DISPLAY_LIMIT = 40;

const RecursionTreePanel: React.FC<RecursionTreePanelProps> = ({ analysis }) => {
  if (analysis.trace_mode !== 'executed') {
    return null;
  }

  const steps = Array.isArray(analysis.trace_steps) ? analysis.trace_steps : [];
  const hasRecursion = steps.some((s) => s.callStack && s.callStack.length > 1);
  
  if (!hasRecursion) {
    return null;
  }

  const nodes = buildRecursionTreeFromSteps(steps);
  if (nodes.length === 0) {
    return null;
  }

  const maxDepth = Math.max(...nodes.map((n) => n.depth));
  const visibleNodes = nodes.slice(0, DISPLAY_LIMIT);
  const overflow = nodes.length - visibleNodes.length;

  return (
    <Panel className="p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold text-white/80">Recursion Tree</h3>
          <p className="text-xs text-white/40 mt-1">
            See how recursive calls grow the call stack.
          </p>
        </div>
        <span className="text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
          Max depth: {maxDepth}
        </span>
      </div>

      {/* Tree visualization */}
      <div className="bg-black/30 border border-white/[0.04] rounded-lg p-4 flex flex-col gap-1.5 overflow-x-auto">
        {visibleNodes.map((node) => (
          <div 
            key={node.id} 
            className="flex items-center gap-2 whitespace-nowrap min-w-max"
            style={{ paddingLeft: `${node.depth * 1.5}rem` }}
          >
            {/* Tree branch line visual if depth > 0 */}
            {node.depth > 0 && (
              <div className="w-4 border-b border-l border-white/10 h-6 -mt-3 rounded-bl shrink-0" />
            )}
            
            <div className="bg-white/[0.03] border border-white/10 rounded px-2 py-1 flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-indigo-300">{node.functionName}</span>
              <span className="text-[10px] text-white/30">· step {node.firstStep}</span>
              {node.returnedDescription && (
                <span className="text-[10px] text-emerald-400/70 ml-2">✓ returned</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {overflow > 0 && (
        <p className="text-[10px] text-white/30 text-center">
          Showing first {DISPLAY_LIMIT} of {nodes.length} recursive calls.
        </p>
      )}
    </Panel>
  );
};

export default RecursionTreePanel;
