import React from 'react';
import { formatTraceValue } from '../../utils/formatTraceValue';

type Props = {
  variables?: Record<string, unknown>;
};

export const TraceVariablesPanel: React.FC<Props> = ({ variables }) => {
  const variableEntries = variables ? Object.entries(variables) : [];

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-4 flex flex-col h-full">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
        Variables
        <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full">
          {variableEntries.length}
        </span>
      </h3>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        {variableEntries.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm italic">
            No variables captured for this step.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {variableEntries.map(([name, value]) => (
              <div 
                key={name} 
                className="bg-slate-800/50 rounded px-3 py-2 flex flex-col gap-1 border border-slate-700/30"
              >
                <div className="text-xs font-medium text-indigo-300 font-mono">
                  {name}
                </div>
                <div className="text-sm font-mono text-slate-300 break-all bg-slate-900/50 p-1.5 rounded">
                  {formatTraceValue(value)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
