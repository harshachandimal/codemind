import React from 'react';

type Props = {
  callStack?: string[];
};

export const TraceCallStackPanel: React.FC<Props> = ({ callStack }) => {
  const stackFrames = callStack || [];

  return (
    <div className="box-border h-full w-full min-w-0 rounded-xl border border-slate-700/60 bg-slate-900/40 p-3 flex flex-col">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
        Call Stack
        <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full">
          {stackFrames.length}
        </span>
      </h3>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        {stackFrames.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm italic">
            No active call stack for this step.
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 relative">
            {stackFrames.map((frame, index) => {
              // Highlight recursive calls by checking if the frame appears earlier in the stack
              const isRecursive = stackFrames.findIndex(f => f === frame) < index;
              const isTop = index === stackFrames.length - 1;
              
              return (
                <div 
                  key={`${index}-${frame}`} 
                  className={`relative flex items-center gap-2 px-3 py-2 rounded border font-mono text-sm ${
                    isTop 
                      ? 'bg-indigo-900/40 border-indigo-500/50 text-indigo-200' 
                      : isRecursive
                        ? 'bg-rose-900/20 border-rose-800/30 text-rose-300'
                        : 'bg-slate-800/50 border-slate-700/50 text-slate-300'
                  }`}
                >
                  <div className="text-xs opacity-50 w-4 text-right">{index}</div>
                  <div className="break-all min-w-0 flex-1 text-xs">{frame}</div>
                  {isTop && (
                    <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded">
                      TOP
                    </span>
                  )}
                  {isRecursive && !isTop && (
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded">
                      RECURSION
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
