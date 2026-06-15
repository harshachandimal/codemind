import React from 'react';
import { formatTraceValue } from '../../utils/formatTraceValue';

type Props = {
  variables?: Record<string, unknown>;
  previousVariables?: Record<string, unknown>;
  variableChanges?: string[];
};

export const TraceVariablesPanel: React.FC<Props> = ({ variables, previousVariables, variableChanges }) => {
  const currentEntries = variables ? Object.entries(variables) : [];

  // Combine to find removed variables too
  const allVarNames = Array.from(new Set([
    ...Object.keys(variables || {}),
    ...Object.keys(previousVariables || {})
  ])).sort();

  return (
    <div className="box-border h-full w-full min-w-0 rounded-xl border border-slate-700/60 bg-slate-900/40 p-3 flex flex-col">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
        Variables
        <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full">
          {currentEntries.length}
        </span>
      </h3>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        {allVarNames.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm italic">
            No variables captured for this step.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {allVarNames.map((name) => {
              const currentValue = variables ? variables[name] : undefined;
              const prevValue = previousVariables ? previousVariables[name] : undefined;
              
              const isNew = currentValue !== undefined && prevValue === undefined;
              const isRemoved = currentValue === undefined && prevValue !== undefined;
              const isChangedExplicitly = variableChanges?.includes(name);
              // Fallback diff if adapter didn't explicitly mark changes but values differ structurally
              const isChangedImplicitly = !isNew && !isRemoved && JSON.stringify(currentValue) !== JSON.stringify(prevValue);
              
              const isChanged = isChangedExplicitly || isChangedImplicitly;
              const isUnchanged = !isNew && !isRemoved && !isChanged;

              let statusBadge = null;
              let bgColor = "bg-slate-800/50 border-slate-700/30";

              if (isNew) {
                statusBadge = <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider">New</span>;
                bgColor = "bg-emerald-900/10 border-emerald-800/30";
              } else if (isRemoved) {
                statusBadge = <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold uppercase tracking-wider">Removed</span>;
                bgColor = "bg-red-900/10 border-red-800/30 opacity-60";
              } else if (isChanged) {
                statusBadge = <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold uppercase tracking-wider">Changed</span>;
                bgColor = "bg-amber-900/10 border-amber-800/30";
              } else if (isUnchanged) {
                statusBadge = <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 font-bold uppercase tracking-wider">Unchanged</span>;
              }

              return (
                <div 
                  key={name} 
                  className={`rounded px-3 py-2 flex flex-col gap-2 border ${bgColor}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-indigo-300 font-mono">
                      {name}
                    </div>
                    {statusBadge}
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    {!isRemoved && (
                      <div className="text-xs font-mono text-slate-200 break-all whitespace-normal overflow-hidden bg-slate-950 p-2 rounded border border-slate-800/50 shadow-inner">
                        {formatTraceValue(currentValue)}
                      </div>
                    )}
                    {(isChanged || isRemoved) && prevValue !== undefined && (
                      <div className="flex flex-col gap-0.5 mt-1">
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold ml-1">Previous</span>
                        <div className="text-xs font-mono text-slate-400 break-all bg-slate-900 p-1.5 rounded line-through opacity-70">
                          {formatTraceValue(prevValue)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
